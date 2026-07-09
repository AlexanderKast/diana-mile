import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSupabaseClient,
  getAdminUser,
  requireAdminSession,
} from "@diana-mile/shared/supabase/server";
import type { RolUsuario } from "@diana-mile/shared/types";

const ROLES_VALIDOS: RolUsuario[] = [
  "superadmin",
  "admin",
  "confirmador",
  "logistica",
  "financiero",
  "readonly",
];

export async function GET() {
  try {
    if (!(await requireAdminSession())) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const supabase = createAdminSupabaseClient();

    const { data, error } = await supabase
      .from("usuario_roles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "No se pudo obtener la lista de usuarios.", detalle: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ usuarios: data ?? [] }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error inesperado al obtener los usuarios.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const usuarioActual = await getAdminUser();
    if (!usuarioActual) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const { email, nombre, rol } = body as { email?: string; nombre?: string; rol?: RolUsuario };

    if (!email || !nombre || !rol) {
      return NextResponse.json(
        { error: "Los campos 'email', 'nombre' y 'rol' son obligatorios." },
        { status: 400 }
      );
    }
    if (!ROLES_VALIDOS.includes(rol)) {
      return NextResponse.json(
        { error: `Rol invalido. Valores permitidos: ${ROLES_VALIDOS.join(", ")}.` },
        { status: 400 }
      );
    }

    const emailNormalizado = email.trim().toLowerCase();
    const supabase = createAdminSupabaseClient();

    const { data: existente } = await supabase
      .from("usuario_roles")
      .select("id")
      .eq("email", emailNormalizado)
      .maybeSingle();

    if (existente) {
      return NextResponse.json(
        { error: "Ya existe un usuario admin registrado con este correo." },
        { status: 400 }
      );
    }

    let userId: string | null = null;
    let invitacionEnviada = false;

    const { data: invitado, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
      emailNormalizado,
      { data: { nombre } }
    );

    if (inviteError || !invitado?.user) {
      const { data: listado, error: listError } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

      const usuarioExistente = listError
        ? undefined
        : listado.users.find((u) => u.email?.toLowerCase() === emailNormalizado);

      if (!usuarioExistente) {
        return NextResponse.json(
          {
            error:
              "No se pudo invitar al usuario y no existe una cuenta previa con ese correo. Verifica el correo e intenta de nuevo.",
            detalle: inviteError?.message,
          },
          { status: 400 }
        );
      }

      userId = usuarioExistente.id;
    } else {
      userId = invitado.user.id;
      invitacionEnviada = true;
    }

    const { data: nuevoRol, error: insertError } = await supabase
      .from("usuario_roles")
      .insert({
        user_id: userId,
        email: emailNormalizado,
        nombre,
        rol,
        activo: true,
        creado_por: usuarioActual.email ?? null,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: "No se pudo crear el usuario admin.", detalle: insertError.message },
        { status: 500 }
      );
    }

    await supabase.from("actividad_log").insert({
      usuario_id: usuarioActual.id,
      usuario_email: usuarioActual.email,
      accion: "usuario_creado",
      entidad: "usuario_roles",
      entidad_id: nuevoRol.id,
      datos_anteriores: null,
      datos_nuevos: nuevoRol,
    });

    return NextResponse.json(
      { usuario: nuevoRol, invitacionEnviada },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error inesperado al crear el usuario.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

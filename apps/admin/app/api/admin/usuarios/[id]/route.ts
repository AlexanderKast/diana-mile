import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient, getAdminUser } from "@diana-mile/shared/supabase/server";
import type { RolUsuario } from "@diana-mile/shared/types";

const ROLES_VALIDOS: RolUsuario[] = [
  "superadmin",
  "admin",
  "confirmador",
  "logistica",
  "financiero",
  "readonly",
];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const usuarioActual = await getAdminUser();
    if (!usuarioActual) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { rol, activo } = body as { rol?: RolUsuario; activo?: boolean };

    if (rol === undefined && activo === undefined) {
      return NextResponse.json(
        { error: "Debes enviar al menos 'rol' o 'activo' para actualizar." },
        { status: 400 }
      );
    }
    if (rol !== undefined && !ROLES_VALIDOS.includes(rol)) {
      return NextResponse.json(
        { error: `Rol invalido. Valores permitidos: ${ROLES_VALIDOS.join(", ")}.` },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();

    const { data: usuarioAnterior, error: fetchError } = await supabase
      .from("usuario_roles")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !usuarioAnterior) {
      return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
    }

    if (usuarioAnterior.user_id === usuarioActual.id) {
      return NextResponse.json(
        { error: "No podes cambiar tu propio rol ni desactivar tu propia cuenta." },
        { status: 400 }
      );
    }

    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (rol !== undefined) update.rol = rol;
    if (activo !== undefined) update.activo = activo;

    const { data: usuarioActualizado, error: updateError } = await supabase
      .from("usuario_roles")
      .update(update)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "No se pudo actualizar el usuario.", detalle: updateError.message },
        { status: 500 }
      );
    }

    await supabase.from("actividad_log").insert({
      usuario_id: usuarioActual.id,
      usuario_email: usuarioActual.email,
      accion: "usuario_actualizado",
      entidad: "usuario_roles",
      entidad_id: id,
      datos_anteriores: usuarioAnterior,
      datos_nuevos: usuarioActualizado,
    });

    return NextResponse.json({ usuario: usuarioActualizado }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error inesperado al actualizar el usuario.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

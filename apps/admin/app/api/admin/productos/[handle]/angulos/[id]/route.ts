import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSupabaseClient,
  getAdminUser,
} from "@diana-mile/shared/supabase/server";
import { normalizarAngulo } from "@diana-mile/shared/landing/angulo";

type RouteParams = { params: Promise<{ handle: string; id: string }> };

const CAMPOS = "id, nombre, datos, created_at, updated_at";

/**
 * Actualiza nombre y/o datos. Solo toca lo que venga en el body.
 *
 * El filtro lleva SIEMPRE el handle ademas del id: el id viene de la URL y
 * sin esa condicion un angulo de otro producto se podria editar desde la
 * pantalla equivocada. El handle no es decorativo, es parte de la llave.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    if (!(await getAdminUser())) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { handle, id } = await params;
    const body = await request.json().catch(() => ({}));
    const cambios: Record<string, unknown> = {};

    if (body?.nombre !== undefined) {
      if (
        !body.nombre ||
        typeof body.nombre !== "string" ||
        !body.nombre.trim()
      ) {
        return NextResponse.json(
          { error: "El nombre no puede quedar vacio." },
          { status: 400 },
        );
      }
      cambios.nombre = body.nombre.trim().slice(0, 120);
    }
    if (body?.datos !== undefined) {
      cambios.datos = normalizarAngulo(body.datos);
    }

    if (Object.keys(cambios).length === 0) {
      return NextResponse.json(
        { error: "No hay nada que actualizar." },
        { status: 400 },
      );
    }

    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("angulos_venta")
      .update(cambios)
      .eq("producto_handle", handle)
      .eq("id", id)
      .select(CAMPOS)
      .maybeSingle();

    if (error) {
      const duplicado = error.code === "23505";
      return NextResponse.json(
        {
          error: duplicado
            ? "Ya existe un angulo con ese nombre para este producto."
            : "No se pudo actualizar el angulo.",
          detalle: error.message,
        },
        { status: duplicado ? 409 : 500 },
      );
    }
    if (!data) {
      return NextResponse.json(
        { error: "Angulo no encontrado." },
        { status: 404 },
      );
    }

    return NextResponse.json({ angulo: data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "No se pudo actualizar el angulo.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    if (!(await getAdminUser())) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { handle, id } = await params;
    const supabase = createAdminSupabaseClient();

    // Se pide la fila de vuelta para poder distinguir "borrado" de "no
    // existia": un delete a secas responde ok aunque no haya tocado nada.
    const { data, error } = await supabase
      .from("angulos_venta")
      .delete()
      .eq("producto_handle", handle)
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) {
      return NextResponse.json(
        { error: "Angulo no encontrado." },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "No se pudo borrar el angulo.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

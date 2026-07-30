import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSupabaseClient,
  getAdminUser,
} from "@diana-mile/shared/supabase/server";
import {
  excedeTamanoLanding,
  validarLandingContent,
} from "@/lib/validar-landing";
import { archivarVersion } from "@/lib/landing-versiones";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * Actualiza una variante: contenido, nombre, estado (activa/pausada) o
 * posicion en la rotacion. Solo toca los campos que vengan en el body.
 * Cada cambio de contenido archiva la version anterior con su autor.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const usuario = await getAdminUser();
    if (!usuario) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const cambios: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (body?.contenido !== undefined) {
      if (!validarLandingContent(body.contenido)) {
        return NextResponse.json(
          { error: "El contenido de la landing tiene un formato invalido." },
          { status: 400 },
        );
      }
      if (excedeTamanoLanding(body.contenido)) {
        return NextResponse.json(
          {
            error:
              "La landing supera el tamano maximo (60KB). Reduce bloques o usa 'guardar sin contenido clasico'.",
          },
          { status: 413 },
        );
      }
      cambios.contenido = body.contenido;
    }
    if (body?.nombre !== undefined) {
      if (!body.nombre || typeof body.nombre !== "string") {
        return NextResponse.json(
          { error: "El nombre no puede quedar vacio." },
          { status: 400 },
        );
      }
      cambios.nombre = body.nombre.slice(0, 120);
    }
    if (body?.estado !== undefined) {
      if (body.estado !== "activa" && body.estado !== "pausada") {
        return NextResponse.json(
          { error: "El estado debe ser 'activa' o 'pausada'." },
          { status: 400 },
        );
      }
      cambios.estado = body.estado;
    }
    if (body?.posicion !== undefined) {
      const posicion = Number(body.posicion);
      if (!Number.isInteger(posicion) || posicion < 0) {
        return NextResponse.json(
          { error: "La posicion debe ser un entero no negativo." },
          { status: 400 },
        );
      }
      cambios.posicion = posicion;
    }

    const supabase = createAdminSupabaseClient();

    // Archivar la version vigente antes de pisarla (solo si cambia contenido).
    if (cambios.contenido !== undefined) {
      const { data: actual } = await supabase
        .from("landing_variantes")
        .select("contenido")
        .eq("id", id)
        .maybeSingle();
      if (actual) {
        await archivarVersion(
          supabase,
          `variante:${id}`,
          actual.contenido,
          usuario.email ?? null,
        );
      }
    }

    const { data, error } = await supabase
      .from("landing_variantes")
      .update(cambios)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) {
      return NextResponse.json(
        { error: "Variante no encontrada." },
        { status: 404 },
      );
    }

    return NextResponse.json({ variante: data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "No se pudo actualizar la variante.",
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

    const { id } = await params;
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase
      .from("landing_variantes")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "No se pudo borrar la variante.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

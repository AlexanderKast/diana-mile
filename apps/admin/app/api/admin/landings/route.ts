import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSupabaseClient,
  getAdminUser,
} from "@diana-mile/shared/supabase/server";
import { validarLandingContent } from "@/lib/validar-landing";

const SLUG_VALIDO = /^[a-z0-9-]{2,60}$/;

/** Lista las variantes de landing (todas, o las de un producto con ?handle=). */
export async function GET(request: NextRequest) {
  try {
    if (!(await getAdminUser())) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const handle = request.nextUrl.searchParams.get("handle");
    const supabase = createAdminSupabaseClient();

    let query = supabase
      .from("landing_variantes")
      .select("*")
      .order("producto_handle")
      .order("posicion")
      .order("created_at");
    if (handle) {
      query = query.eq("producto_handle", handle);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return NextResponse.json({ variantes: data ?? [] }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "No se pudieron listar las variantes.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

/**
 * Crea una variante. `contenido` es opcional: una variante vacia renderiza
 * identica a la landing publica del producto (el merge no sobrescribe nada)
 * y se edita despues.
 */
export async function POST(request: NextRequest) {
  try {
    if (!(await getAdminUser())) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const { producto_handle, slug, nombre, contenido } = body ?? {};

    if (!producto_handle || typeof producto_handle !== "string") {
      return NextResponse.json(
        { error: "Falta el handle del producto." },
        { status: 400 },
      );
    }
    if (typeof slug !== "string" || !SLUG_VALIDO.test(slug)) {
      return NextResponse.json(
        {
          error:
            "El slug debe tener entre 2 y 60 caracteres: minusculas, numeros y guiones.",
        },
        { status: 400 },
      );
    }
    if (!nombre || typeof nombre !== "string") {
      return NextResponse.json(
        { error: "Falta el nombre interno de la variante." },
        { status: 400 },
      );
    }
    if (contenido !== undefined && !validarLandingContent(contenido)) {
      return NextResponse.json(
        { error: "El contenido de la landing tiene un formato invalido." },
        { status: 400 },
      );
    }

    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("landing_variantes")
      .insert({
        producto_handle,
        slug,
        nombre: nombre.slice(0, 120),
        contenido: contenido ?? {},
      })
      .select("*")
      .single();

    if (error) {
      const duplicado = error.code === "23505";
      return NextResponse.json(
        {
          error: duplicado
            ? "Ya existe una variante con ese slug."
            : "No se pudo crear la variante.",
          detalle: error.message,
        },
        { status: duplicado ? 409 : 500 },
      );
    }

    return NextResponse.json({ variante: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "No se pudo crear la variante.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

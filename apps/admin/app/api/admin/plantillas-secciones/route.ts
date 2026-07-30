import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSupabaseClient,
  getAdminUser,
} from "@diana-mile/shared/supabase/server";

const TIPOS_VALIDOS = new Set([
  "hero",
  "oferta",
  "beneficios",
  "comparativa",
  "autoridad",
  "uso",
  "sensorial",
  "logistica",
  "faq",
]);

/** Plantillas de referencia de "Landing magica": una activa por tipo. */
export async function GET() {
  try {
    if (!(await getAdminUser())) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("plantillas_secciones")
      .select("id, tipo_seccion, nombre, url_imagen, activa")
      .order("tipo_seccion")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return NextResponse.json({ plantillas: data ?? [] }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "No se pudieron listar las plantillas.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

/** Sube/reemplaza la plantilla activa de un tipo de seccion. */
export async function POST(request: NextRequest) {
  try {
    if (!(await getAdminUser())) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { tipo_seccion, nombre, url_imagen } = (await request.json()) ?? {};
    if (!TIPOS_VALIDOS.has(tipo_seccion)) {
      return NextResponse.json({ error: "Tipo de seccion invalido." }, { status: 400 });
    }
    if (typeof url_imagen !== "string" || !url_imagen.startsWith("https://")) {
      return NextResponse.json({ error: "Falta la URL de la imagen." }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();

    // Una sola activa por tipo: desactivar la previa antes de insertar.
    await supabase
      .from("plantillas_secciones")
      .update({ activa: false })
      .eq("tipo_seccion", tipo_seccion)
      .eq("activa", true);

    const { data, error } = await supabase
      .from("plantillas_secciones")
      .insert({
        tipo_seccion,
        nombre: String(nombre ?? tipo_seccion).slice(0, 120),
        url_imagen,
        activa: true,
      })
      .select("id, tipo_seccion, nombre, url_imagen, activa")
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ plantilla: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "No se pudo guardar la plantilla.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

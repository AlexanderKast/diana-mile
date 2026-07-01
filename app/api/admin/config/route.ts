import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient, requireAdminSession } from "@/lib/supabase-server";

type ConfigInput = { clave: string; valor: string };

const CLAVES_PERMITIDAS = new Set([
  "linktree_links",
  "linktree_titulo",
  "linktree_subtitulo",
  "whatsapp_numero",
]);

export async function GET() {
  try {
    if (!(await requireAdminSession())) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const supabase = createAdminSupabaseClient();

    const { data, error } = await supabase
      .from("config")
      .select("*")
      .order("clave", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: "No se pudo obtener la configuracion.", detalle: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ config: data ?? [] }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error inesperado al obtener la configuracion.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await requireAdminSession())) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const items: ConfigInput[] = Array.isArray(body) ? body : [body];

    for (const item of items) {
      if (!item?.clave || typeof item.valor !== "string") {
        return NextResponse.json(
          { error: "Cada elemento debe incluir 'clave' y 'valor' (string)." },
          { status: 400 }
        );
      }
      if (!CLAVES_PERMITIDAS.has(item.clave)) {
        return NextResponse.json(
          { error: `Clave de configuracion no permitida: ${item.clave}` },
          { status: 400 }
        );
      }
    }

    const supabase = createAdminSupabaseClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("config")
      .upsert(
        items.map((item) => ({
          clave: item.clave,
          valor: item.valor,
          updated_at: now,
        })),
        { onConflict: "clave" }
      )
      .select();

    if (error) {
      return NextResponse.json(
        { error: "No se pudo guardar la configuracion.", detalle: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ config: data ?? [] }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error inesperado al guardar la configuracion.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

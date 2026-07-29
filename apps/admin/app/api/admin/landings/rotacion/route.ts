import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSupabaseClient,
  getAdminUser,
} from "@diana-mile/shared/supabase/server";

/**
 * Define como reparte trafico el rotador de un producto:
 *   modo 'rotacion' = parejo round-robin
 *   modo 'auto'     = bandit (Thompson): mas trafico a la que mas convierte
 * metrica: 'pedidos' | 'clics' (solo aplica en modo auto).
 */
export async function PUT(request: NextRequest) {
  try {
    if (!(await getAdminUser())) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const { producto_handle, modo, metrica } = body ?? {};

    if (!producto_handle || typeof producto_handle !== "string") {
      return NextResponse.json(
        { error: "Falta el handle del producto." },
        { status: 400 },
      );
    }
    if (modo !== "rotacion" && modo !== "auto") {
      return NextResponse.json(
        { error: "El modo debe ser 'rotacion' o 'auto'." },
        { status: 400 },
      );
    }
    if (metrica !== undefined && metrica !== "pedidos" && metrica !== "clics") {
      return NextResponse.json(
        { error: "La metrica debe ser 'pedidos' o 'clics'." },
        { status: 400 },
      );
    }

    const supabase = createAdminSupabaseClient();
    const { error } = await supabase.from("landing_rotacion").upsert(
      {
        producto_handle,
        modo,
        metrica: metrica ?? "pedidos",
      },
      { onConflict: "producto_handle" },
    );

    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "No se pudo guardar el modo de rotacion.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

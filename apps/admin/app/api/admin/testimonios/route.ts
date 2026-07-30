import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSupabaseClient,
  getAdminUser,
} from "@diana-mile/shared/supabase/server";

const ESTADOS = new Set(["pendiente", "aprobado", "rechazado"]);

/**
 * Lista los testimonios para moderar. `?estado=` filtra; sin filtro salen
 * todos con los pendientes primero, que es lo que hay que atender.
 */
export async function GET(request: NextRequest) {
  try {
    if (!(await getAdminUser())) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const estado = request.nextUrl.searchParams.get("estado");
    if (estado && !ESTADOS.has(estado)) {
      return NextResponse.json({ error: "Estado invalido." }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();
    let query = supabase
      .from("testimonios")
      .select(
        "id, pedido_id, telefono, producto_handle, texto, nombre, ciudad, estado, consentimiento, solicitado_at, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(200);

    if (estado) query = query.eq("estado", estado);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const testimonios = data ?? [];
    // Los pendientes arriba: es la unica cola que exige trabajo. Se ordena
    // aqui y no en la consulta porque dentro de cada grupo hay que
    // conservar el orden por fecha que ya trajo Postgres.
    const orden = { pendiente: 0, aprobado: 1, rechazado: 2 } as const;
    testimonios.sort(
      (a, b) =>
        (orden[a.estado as keyof typeof orden] ?? 3) -
        (orden[b.estado as keyof typeof orden] ?? 3),
    );

    return NextResponse.json({ testimonios }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "No se pudieron listar los testimonios.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

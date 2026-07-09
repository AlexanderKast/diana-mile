import { NextResponse } from "next/server";
import { createAdminSupabaseClient, requireAdminSession } from "@diana-mile/shared/supabase/server";
import { calcularRendimiento } from "@/lib/transportadoras";

export async function GET() {
  try {
    if (!(await requireAdminSession())) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const supabase = createAdminSupabaseClient();

    const { data, error } = await supabase
      .from("pedidos")
      .select("transportadora, estado, costo_envio, fecha_envio, fecha_entrega_real")
      .not("transportadora", "is", null);

    if (error) {
      return NextResponse.json(
        { error: "No se pudo obtener el rendimiento de transportadoras.", detalle: error.message },
        { status: 500 }
      );
    }

    const transportadoras = calcularRendimiento(data ?? []);

    return NextResponse.json({ transportadoras }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error inesperado al obtener el rendimiento de transportadoras.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@diana-mile/shared/supabase/server";
import { calcularMetricas } from "@/lib/financiero";

export async function GET(request: NextRequest) {
  try {
    if (!(await requireAdminSession())) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get("periodo") ?? undefined;

    if (periodo && !/^\d{4}-\d{2}$/.test(periodo)) {
      return NextResponse.json(
        { error: "El parametro 'periodo' debe tener el formato 'YYYY-MM'." },
        { status: 400 }
      );
    }

    const metricas = await calcularMetricas(periodo);

    return NextResponse.json({ metricas }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error inesperado al calcular las metricas financieras.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSupabaseClient,
  getAdminUser,
} from "@diana-mile/shared/supabase/server";
import { calcularAlertas } from "@/lib/alertas";

/** Las alertas vigentes. Lo usa la campana de la barra lateral. */
export async function GET() {
  try {
    const usuario = await getAdminUser();
    if (!usuario) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const alertas = await calcularAlertas();
    return NextResponse.json({
      alertas,
      total: alertas.length,
      criticas: alertas.filter((a) => a.severidad === "critica").length,
    });
  } catch (error) {
    console.error("Error al calcular las alertas:", error);
    return NextResponse.json(
      { error: "No se pudieron calcular las alertas." },
      { status: 500 },
    );
  }
}

/**
 * Silencia una alerta por un tiempo.
 *
 * El tope de 90 dias es deliberado: sin el, "silenciar para siempre"
 * convierte el centro de alertas en una lista de cosas que alguien apago
 * hace un año y nadie recuerda.
 */
const DIAS_MAXIMO = 90;

export async function POST(request: NextRequest) {
  try {
    const usuario = await getAdminUser();
    if (!usuario) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      tipo?: string;
      dias?: number;
    };

    if (!body.tipo) {
      return NextResponse.json({ error: "Falta 'tipo'." }, { status: 400 });
    }

    const dias = Number(body.dias);
    const diasValidos =
      Number.isFinite(dias) && dias > 0 ? Math.min(dias, DIAS_MAXIMO) : 7;

    const hasta = new Date(Date.now() + diasValidos * 24 * 60 * 60 * 1000);

    const supabase = createAdminSupabaseClient();
    const { error } = await supabase.from("alertas_descartadas").upsert(
      {
        tipo: body.tipo,
        referencia: "",
        silenciada_hasta: hasta.toISOString(),
        descartada_por: usuario.email ?? null,
      },
      { onConflict: "tipo,referencia" },
    );

    if (error) {
      return NextResponse.json(
        { error: "No se pudo silenciar: " + error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, hasta: hasta.toISOString() });
  } catch (error) {
    console.error("Error al silenciar la alerta:", error);
    return NextResponse.json({ error: "No se pudo silenciar." }, { status: 500 });
  }
}

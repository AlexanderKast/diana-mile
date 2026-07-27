import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import { procesarPendientes } from "@diana-mile/shared/botcake/outbox";
import { enviarRecordatoriosPendientes } from "@diana-mile/shared/botcake/recordatorios";
import {
  enviarSeguimientosPendientes,
  recuperarCarritosAbandonados,
} from "@diana-mile/shared/botcake/seguimiento";

/**
 * Cron de los agentes de WhatsApp:
 * 1. Recordatorios de pedidos sin confirmar.
 * 2. Seguimiento post-compra (consejos, comunidad, recompra).
 * 3. Recuperacion de carritos abandonados.
 * 4. Reintento de todo lo que quedo en la cola.
 *
 * El outbox se procesa al final para que lo encolado en esta misma corrida
 * salga de una y no espere al siguiente ciclo.
 *
 * Vercel Cron lo invoca con Authorization: Bearer CRON_SECRET.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ mensaje: "No autorizado" }, { status: 401 });
  }

  const supabase = createAdminSupabaseClient();

  const recordatorios = await enviarRecordatoriosPendientes(supabase);
  const seguimientos = await enviarSeguimientosPendientes(supabase);
  const carritos = await recuperarCarritosAbandonados(supabase);
  const outbox = await procesarPendientes(supabase);

  return NextResponse.json({
    recordatorios,
    seguimientos,
    carritos,
    outbox,
  });
}

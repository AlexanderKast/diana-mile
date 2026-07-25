import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import { procesarPendientes } from "@diana-mile/shared/botcake/outbox";
import { enviarRecordatoriosPendientes } from "@diana-mile/shared/botcake/recordatorios";

/**
 * Cron de los agentes de WhatsApp:
 * 1. Reintenta los mensajes que quedaron pendientes o fallidos (el API de
 *    Botcake falla con frecuencia).
 * 2. Encola recordatorios de los pedidos sin confirmar.
 *
 * Vercel Cron lo invoca con Authorization: Bearer CRON_SECRET.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ mensaje: "No autorizado" }, { status: 401 });
  }

  const supabase = createAdminSupabaseClient();

  // Primero se encolan los recordatorios nuevos y despues se procesa toda
  // la cola, para que salgan en la misma corrida.
  const recordatorios = await enviarRecordatoriosPendientes(supabase);
  const outbox = await procesarPendientes(supabase);

  return NextResponse.json({ recordatorios, outbox });
}

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import { procesarPendientes } from "@diana-mile/shared/botcake/outbox";
import { enviarRecordatoriosPendientes } from "@diana-mile/shared/botcake/recordatorios";
import {
  enviarSeguimientosPendientes,
  recuperarCarritosAbandonados,
  reactivarLeadsTibios,
} from "@diana-mile/shared/botcake/seguimiento";
import { solicitarTestimoniosPendientes } from "@diana-mile/shared/botcake/testimonios";
import { vigilarEscalamientos } from "@diana-mile/shared/botcake/vigilante";

/**
 * Cron de los agentes de WhatsApp:
 * 1. Recordatorios de pedidos sin confirmar.
 * 2. Seguimiento post-compra (consejos, comunidad, recompra).
 * 3. Recuperacion de carritos abandonados y de leads tibios del chat.
 * 4. Solicitud de testimonio a las entregas de hace unos dias.
 * 5. Reintento de todo lo que quedo en la cola.
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

  // Primero los escalamientos: alguien esperando respuesta importa mas que
  // cualquier envio programado.
  const escalamientos = await vigilarEscalamientos(supabase);
  const recordatorios = await enviarRecordatoriosPendientes(supabase);
  const seguimientos = await enviarSeguimientosPendientes(supabase);
  const carritos = await recuperarCarritosAbandonados(supabase);
  // Los que hablaron por WhatsApp, quedaron tibios o calientes y no
  // compraron. Antes no los recuperaba nadie.
  const reactivados = await reactivarLeadsTibios(supabase);
  // Va aqui y no en un cron propio: es otro toque post-venta de la misma
  // familia que los seguimientos, y montarlo aparte obligaria a un job de
  // pg_cron nuevo y a repetir la autenticacion por secreto para ganar nada.
  const testimonios = await solicitarTestimoniosPendientes(supabase);
  const outbox = await procesarPendientes(supabase);

  return NextResponse.json({
    escalamientos,
    recordatorios,
    seguimientos,
    carritos,
    reactivados,
    testimonios,
    outbox,
  });
}

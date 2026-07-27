import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import { enviarMensajeDiario } from "@diana-mile/shared/botcake/mensaje-diario";

/**
 * Mensaje diario de la comunidad. Corre a las 13:00 UTC = 8:00 en
 * Colombia, dentro de la franja de envio.
 *
 * Va aparte del cron general porque ese corre cada 15 minutos y esto
 * tiene que pasar una sola vez al dia.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ mensaje: "No autorizado" }, { status: 401 });
  }

  const supabase = createAdminSupabaseClient();
  const resultado = await enviarMensajeDiario(supabase);

  return NextResponse.json(resultado);
}

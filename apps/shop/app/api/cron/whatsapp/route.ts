import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import { procesarPendientes } from "@diana-mile/shared/botcake/outbox";

/**
 * Cron de reintentos del outbox de WhatsApp: procesa los mensajes que
 * quedaron pendientes o fallidos (el API de Botcake falla con frecuencia).
 * Vercel Cron lo invoca con Authorization: Bearer CRON_SECRET.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ mensaje: "No autorizado" }, { status: 401 });
  }

  const supabase = createAdminSupabaseClient();
  const resultado = await procesarPendientes(supabase);
  return NextResponse.json(resultado);
}

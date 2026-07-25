import type { SupabaseClient } from "@supabase/supabase-js";
import { encolarRecordatorioConfirmacion } from "./agentes";

/** Horas que se le dan al cliente para confirmar antes de insistir. */
const HORAS_ESPERA = 24;
/** Cuantos recordatorios como maximo por pedido. */
const MAX_RECORDATORIOS = 2;
/** Pedidos mas viejos que esto ya no se persiguen. */
const DIAS_LIMITE = 5;

/**
 * Agente Recordatorio: busca pedidos que llevan mas de 24h sin que el
 * cliente confirme y le manda la plantilla de recordatorio. Nunca insiste
 * mas de dos veces ni sobre pedidos viejos.
 */
export async function enviarRecordatoriosPendientes(
  supabase: SupabaseClient,
  limite = 20,
): Promise<{ evaluados: number; encolados: number }> {
  const ahora = Date.now();
  const corteEspera = new Date(ahora - HORAS_ESPERA * 3600_000).toISOString();
  const corteViejos = new Date(ahora - DIAS_LIMITE * 86_400_000).toISOString();

  const { data: pedidos, error } = await supabase
    .from("pedidos")
    .select("id, nombre, telefono, producto_nombre")
    .eq("estado", "pendiente")
    .lt("created_at", corteEspera)
    .gt("created_at", corteViejos)
    .limit(limite);

  if (error || !pedidos?.length) return { evaluados: 0, encolados: 0 };

  let encolados = 0;

  for (const pedido of pedidos) {
    if (!pedido.telefono) continue;

    // Cuantos recordatorios se le mandaron ya a este pedido.
    const { count } = await supabase
      .from("whatsapp_mensajes")
      .select("id", { count: "exact", head: true })
      .eq("pedido_id", pedido.id)
      .eq("tipo", "recordatorio")
      .in("estado", ["enviado", "pendiente"]);

    if ((count ?? 0) >= MAX_RECORDATORIOS) continue;

    // Si el cliente ya respondio algo por WhatsApp, no se le insiste:
    // esa conversacion la sigue una persona o el agente de IA.
    const { count: respuestas } = await supabase
      .from("whatsapp_eventos")
      .select("id", { count: "exact", head: true })
      .eq("pedido_id", pedido.id);

    if ((respuestas ?? 0) > 0) continue;

    await encolarRecordatorioConfirmacion(supabase, {
      pedidoId: pedido.id,
      nombre: pedido.nombre ?? "hola",
      telefonoE164: pedido.telefono,
      producto: pedido.producto_nombre ?? "tu pedido",
    });
    encolados++;
  }

  return { evaluados: pedidos.length, encolados };
}

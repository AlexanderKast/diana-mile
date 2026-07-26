import type { SupabaseClient } from "@supabase/supabase-js";
import { enviarPlantilla } from "./client";
import { PLANTILLAS, type PlantillaDef } from "./plantillas";

const MAX_INTENTOS = 3;

export type TipoMensaje =
  | "confirmacion"
  | "recordatorio"
  | "envio"
  | "remarketing"
  | "manual"
  /** Aviso interno a Diana de que alguien necesita respuesta humana. */
  | "escalamiento";

export type MensajeNuevo = {
  telefonoE164: string;
  tipo: TipoMensaje;
  plantilla: PlantillaDef;
  /** Params posicionales del BODY: {"1": "...", "2": "..."} */
  variables: Record<string, string>;
  pedidoId?: string | null;
  leadId?: string | null;
};

type FilaMensaje = {
  id: string;
  telefono: string;
  plantilla: string;
  variables: Record<string, string>;
  intentos: number;
};

function resolverPlantilla(nombre: string): PlantillaDef | null {
  return (
    Object.values(PLANTILLAS).find((p) => p.nombre === nombre) ?? null
  );
}

async function intentarEnvio(
  supabase: SupabaseClient,
  fila: FilaMensaje,
): Promise<boolean> {
  const plantilla = resolverPlantilla(fila.plantilla);
  if (!plantilla) {
    await supabase
      .from("whatsapp_mensajes")
      .update({ estado: "descartado", ultimo_error: "Plantilla desconocida" })
      .eq("id", fila.id);
    return false;
  }

  const resultado = await enviarPlantilla({
    telefonoE164: fila.telefono,
    templateId: plantilla.id,
    categoria: plantilla.categoria,
    variables: fila.variables,
  });

  if (resultado.success) {
    await supabase
      .from("whatsapp_mensajes")
      .update({
        estado: "enviado",
        intentos: fila.intentos + 1,
        enviado_at: new Date().toISOString(),
        ultimo_error: null,
      })
      .eq("id", fila.id);
    return true;
  }

  const agotado = fila.intentos + 1 >= MAX_INTENTOS;
  await supabase
    .from("whatsapp_mensajes")
    .update({
      estado: agotado ? "descartado" : "fallido",
      intentos: fila.intentos + 1,
      ultimo_error: resultado.error ?? "Error desconocido",
    })
    .eq("id", fila.id);
  return false;
}

/**
 * Registra el mensaje en la cola y hace el primer intento de envio de una
 * vez. Si Botcake falla, queda en estado "fallido" y el cron lo reintenta.
 * Nunca lanza: un fallo de WhatsApp jamas debe romper un checkout.
 */
export async function encolarMensaje(
  supabase: SupabaseClient,
  mensaje: MensajeNuevo,
): Promise<void> {
  try {
    const { data: fila, error } = await supabase
      .from("whatsapp_mensajes")
      .insert({
        pedido_id: mensaje.pedidoId ?? null,
        lead_id: mensaje.leadId ?? null,
        telefono: mensaje.telefonoE164,
        tipo: mensaje.tipo,
        plantilla: mensaje.plantilla.nombre,
        variables: mensaje.variables,
      })
      .select("id, telefono, plantilla, variables, intentos")
      .single();

    if (error || !fila) {
      console.error("[whatsapp-outbox] no se pudo encolar:", error?.message);
      return;
    }

    await intentarEnvio(supabase, fila as FilaMensaje);
  } catch (err) {
    console.error("[whatsapp-outbox] error al encolar:", err);
  }
}

/**
 * Reintenta los mensajes pendientes/fallidos con intentos disponibles.
 * Pensado para correr desde un cron. Devuelve el conteo procesado.
 */
export async function procesarPendientes(
  supabase: SupabaseClient,
  limite = 25,
): Promise<{ procesados: number; enviados: number }> {
  const { data: filas, error } = await supabase
    .from("whatsapp_mensajes")
    .select("id, telefono, plantilla, variables, intentos")
    .in("estado", ["pendiente", "fallido"])
    .lt("intentos", MAX_INTENTOS)
    .order("created_at", { ascending: true })
    .limit(limite);

  if (error || !filas?.length) return { procesados: 0, enviados: 0 };

  let enviados = 0;
  for (const fila of filas as FilaMensaje[]) {
    if (await intentarEnvio(supabase, fila)) enviados++;
  }
  return { procesados: filas.length, enviados };
}

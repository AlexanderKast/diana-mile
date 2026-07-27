import type { SupabaseClient } from "@supabase/supabase-js";
import type { ExpertoId } from "./expertos";
import type { MensajeChat } from "./mistral";

/**
 * Cuantos mensajes previos se le pasan al modelo como memoria.
 *
 * Con 12 se quedaba corto: en una conversacion de venta —saludo, producto,
 * precio, datos, confirmacion— se pasan facil de 12 turnos y el modelo
 * empezaba a responder cosas de mas atras o a repreguntar datos que ya le
 * habian dado. 30 cubre una conversacion completa sin encarecer mucho.
 */
const MEMORIA_MENSAJES = 30;

/** Ventana de WhatsApp: solo se puede escribir texto libre dentro de 24h. */
const VENTANA_MS = 24 * 60 * 60 * 1000;

/**
 * Cuanto espera un escalamiento antes de que la IA retome la conversacion.
 *
 * Si nadie del equipo entra a responder, dejar el bot apagado significa
 * abandonar a esa persona: escribe, no le contestan, y se va.
 *
 * Estaba en una hora y se vio lo que eso significa en un chat real: la
 * persona escribio tres veces en catorce minutos y no recibio nada. En
 * WhatsApp eso no se lee como "estan revisando", se lee como que la
 * tienda no existe. Veinte minutos alcanzan para que alguien tome el caso
 * y son pocos como para que el silencio se note.
 */
const HORAS_PARA_RETOMAR = 1 / 3;

export type Conversacion = {
  id: string;
  telefono: string;
  nombre: string | null;
  ultimoExperto: ExpertoId | null;
  iaActiva: boolean;
  ultimoEntranteAt: string | null;
  escaladoAt: string | null;
};

export async function obtenerOCrearConversacion(
  supabase: SupabaseClient,
  telefonoE164: string,
  nombre?: string | null,
): Promise<Conversacion | null> {
  const { data: existente } = await supabase
    .from("whatsapp_conversaciones")
    .select(
      "id, telefono, nombre, ultimo_experto, ia_activa, ultimo_entrante_at, escalado_at",
    )
    .eq("telefono", telefonoE164)
    .maybeSingle();

  if (existente) {
    let iaActiva = existente.ia_activa;

    // Escalada vieja que nadie atendio: la IA retoma. Es preferible que
    // responda ella a dejar a la persona escribiendo al vacio.
    if (!iaActiva && existente.escalado_at) {
      const horas =
        (Date.now() - new Date(existente.escalado_at).getTime()) / 3_600_000;

      if (horas >= HORAS_PARA_RETOMAR) {
        await supabase
          .from("whatsapp_conversaciones")
          .update({
            ia_activa: true,
            escalado_at: null,
            motivo_escalado: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existente.id);
        iaActiva = true;
        console.warn(
          `[wa-conversacion] la IA retoma ${telefonoE164}: escalada sin atender hace ${horas.toFixed(1)}h`,
        );
      }
    }

    return {
      id: existente.id,
      telefono: existente.telefono,
      nombre: existente.nombre ?? nombre ?? null,
      ultimoExperto: (existente.ultimo_experto as ExpertoId) ?? null,
      iaActiva,
      ultimoEntranteAt: existente.ultimo_entrante_at,
      escaladoAt: existente.escalado_at,
    };
  }

  const { data: creada, error } = await supabase
    .from("whatsapp_conversaciones")
    .insert({ telefono: telefonoE164, nombre: nombre ?? null })
    .select(
      "id, telefono, nombre, ultimo_experto, ia_activa, ultimo_entrante_at, escalado_at",
    )
    .single();

  if (error || !creada) {
    console.error("[wa-conversacion] no se pudo crear:", error?.message);
    return null;
  }

  return {
    id: creada.id,
    telefono: creada.telefono,
    nombre: creada.nombre,
    ultimoExperto: null,
    iaActiva: creada.ia_activa,
    ultimoEntranteAt: creada.ultimo_entrante_at,
    escaladoAt: null,
  };
}

/** Historial reciente en formato de mensajes de chat, del mas viejo al mas nuevo. */
export async function historial(
  supabase: SupabaseClient,
  conversacionId: string,
): Promise<MensajeChat[]> {
  const { data } = await supabase
    .from("whatsapp_conversacion_mensajes")
    .select("rol, contenido")
    .eq("conversacion_id", conversacionId)
    .order("created_at", { ascending: false })
    .limit(MEMORIA_MENSAJES);

  if (!data?.length) return [];

  return data
    .reverse()
    .map((m) => ({
      role: m.rol === "assistant" ? ("assistant" as const) : ("user" as const),
      content: m.contenido,
    }));
}

export async function guardarEntrante(
  supabase: SupabaseClient,
  conversacionId: string,
  contenido: string,
): Promise<void> {
  await supabase.from("whatsapp_conversacion_mensajes").insert({
    conversacion_id: conversacionId,
    rol: "user",
    contenido,
  });
  await supabase
    .from("whatsapp_conversaciones")
    .update({
      ultimo_entrante_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversacionId);
}

export async function guardarRespuesta(
  supabase: SupabaseClient,
  conversacionId: string,
  contenido: string,
  experto: ExpertoId,
  tokens: number,
): Promise<void> {
  await supabase.from("whatsapp_conversacion_mensajes").insert({
    conversacion_id: conversacionId,
    rol: "assistant",
    contenido,
    experto,
    tokens,
  });
  await supabase
    .from("whatsapp_conversaciones")
    .update({ ultimo_experto: experto, updated_at: new Date().toISOString() })
    .eq("id", conversacionId);
}

/** Un humano tomo la conversacion: la IA deja de responder a esta persona. */
export async function silenciarIA(
  supabase: SupabaseClient,
  telefonoE164: string,
  activa: boolean,
): Promise<void> {
  await supabase
    .from("whatsapp_conversaciones")
    .update({ ia_activa: activa, updated_at: new Date().toISOString() })
    .eq("telefono", telefonoE164);
}

/** Solo se puede responder con texto libre dentro de la ventana de 24h. */
export function dentroDeVentana(ultimoEntranteAt: string | null): boolean {
  if (!ultimoEntranteAt) return false;
  return Date.now() - new Date(ultimoEntranteAt).getTime() < VENTANA_MS;
}

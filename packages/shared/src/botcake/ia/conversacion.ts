import type { SupabaseClient } from "@supabase/supabase-js";
import type { ExpertoId } from "./expertos";
import type { MensajeChat } from "./mistral";

/** Cuantos mensajes previos se le pasan al modelo como memoria. */
const MEMORIA_MENSAJES = 12;

/** Ventana de WhatsApp: solo se puede escribir texto libre dentro de 24h. */
const VENTANA_MS = 24 * 60 * 60 * 1000;

export type Conversacion = {
  id: string;
  telefono: string;
  nombre: string | null;
  ultimoExperto: ExpertoId | null;
  iaActiva: boolean;
  ultimoEntranteAt: string | null;
};

export async function obtenerOCrearConversacion(
  supabase: SupabaseClient,
  telefonoE164: string,
  nombre?: string | null,
): Promise<Conversacion | null> {
  const { data: existente } = await supabase
    .from("whatsapp_conversaciones")
    .select("id, telefono, nombre, ultimo_experto, ia_activa, ultimo_entrante_at")
    .eq("telefono", telefonoE164)
    .maybeSingle();

  if (existente) {
    return {
      id: existente.id,
      telefono: existente.telefono,
      nombre: existente.nombre ?? nombre ?? null,
      ultimoExperto: (existente.ultimo_experto as ExpertoId) ?? null,
      iaActiva: existente.ia_activa,
      ultimoEntranteAt: existente.ultimo_entrante_at,
    };
  }

  const { data: creada, error } = await supabase
    .from("whatsapp_conversaciones")
    .insert({ telefono: telefonoE164, nombre: nombre ?? null })
    .select("id, telefono, nombre, ultimo_experto, ia_activa, ultimo_entrante_at")
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

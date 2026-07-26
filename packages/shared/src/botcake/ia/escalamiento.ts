import type { SupabaseClient } from "@supabase/supabase-js";
import { enviarFlow, enviarTexto } from "../client";
import { encolarMensaje } from "../outbox";
import { PLANTILLAS } from "../plantillas";

/**
 * Escalamiento a humano: la regla es que el agente prefiera callarse antes
 * que inventar. Cuando no tiene el dato, no improvisa una salida — avisa a
 * Diana y se apaga en esa conversacion.
 *
 * El aviso sale por dos canales a proposito (WhatsApp y push): si la
 * plantilla no esta aprobada todavia o Botcake falla, Diana igual se entera.
 */

/** Marca que el modelo emite cuando no puede responder con certeza. */
export const MARCA_ESCALAR = "[[ESCALAR]]";

export type MotivoEscalado =
  | "no_sabe"
  | "pidio_humano"
  | "reclamo"
  | "error_tecnico";

export type DatosEscalamiento = {
  telefonoE164: string;
  nombre: string | null;
  /** Lo ultimo que escribio la persona. */
  pregunta: string;
  motivo: MotivoEscalado;
};

/**
 * Si la respuesta del modelo trae la marca, devuelve la razon que dio.
 * Devuelve null si la respuesta es normal.
 */
export function detectarEscalada(respuesta: string): string | null {
  const i = respuesta.indexOf(MARCA_ESCALAR);
  if (i === -1) return null;
  const razon = respuesta.slice(i + MARCA_ESCALAR.length).trim();
  return razon || "no especificado";
}

const MENSAJES_ESPERA: Record<MotivoEscalado, string> = {
  no_sabe:
    "Esa te la confirmo bien para no darte un dato equivocado 💚 Ya le paso tu pregunta a Diana y te responde en un ratico.",
  pidio_humano:
    "Claro que si 💚 Ya le paso tu mensaje a Diana para que te escriba personalmente.",
  reclamo:
    "Lamento mucho lo que pasó. Ya le paso tu caso a Diana para que lo revise personalmente y te responda.",
  error_tecnico:
    "Dame un momentico, ya le paso tu mensaje a una persona del equipo para que te responda 💚",
};

/**
 * Apaga la IA en esa conversacion y deja registro para el panel.
 */
async function marcarConversacion(
  supabase: SupabaseClient,
  telefonoE164: string,
  motivo: MotivoEscalado,
  razon: string,
): Promise<void> {
  await supabase
    .from("whatsapp_conversaciones")
    .update({
      ia_activa: false,
      escalado_at: new Date().toISOString(),
      motivo_escalado: `${motivo}: ${razon}`.slice(0, 500),
      updated_at: new Date().toISOString(),
    })
    .eq("telefono", telefonoE164);
}

/** Avisa a Diana por WhatsApp usando la plantilla (via outbox). */
async function avisarPorWhatsApp(
  supabase: SupabaseClient,
  datos: DatosEscalamiento,
): Promise<void> {
  const numeroAdmin = process.env.WHATSAPP_ADMIN_NUMERO;
  const plantilla = PLANTILLAS.avisoAsesor;

  // Sin numero configurado o sin plantilla aprobada todavia, el push del
  // panel queda como unico aviso. No es motivo para romper nada.
  if (!numeroAdmin || !plantilla.id) return;

  await encolarMensaje(supabase, {
    telefonoE164: numeroAdmin,
    tipo: "escalamiento",
    plantilla,
    variables: {
      "1": datos.nombre ?? "Una clienta",
      "2": datos.telefonoE164,
      // WhatsApp rechaza variables con saltos de linea o muy largas.
      "3": datos.pregunta.replace(/\s+/g, " ").slice(0, 250),
    },
  });
}

/**
 * Dispara el flow de Botcake que aplica la etiqueta de "hablar con humano".
 * El API publico no permite asignar tags directamente, pero si ejecutar un
 * flow que los aplique — ese flow se crea una vez en la UI de Botcake.
 */
async function etiquetarEnBotcake(telefonoE164: string): Promise<void> {
  const flowId = Number(process.env.BOTCAKE_FLOW_HABLAR_HUMANO);
  if (!Number.isFinite(flowId) || flowId <= 0) return;
  await enviarFlow(telefonoE164, flowId);
}

export type ResultadoEscalamiento = {
  mensajeEnviado: boolean;
  motivo: MotivoEscalado;
  razon: string;
};

/**
 * Ejecuta el escalamiento completo. Nunca lanza: si algo falla, se registra
 * y se sigue — lo importante es que la persona reciba respuesta y que
 * quede rastro en el panel.
 */
export async function escalarAHumano(
  supabase: SupabaseClient,
  datos: DatosEscalamiento,
  razon = "",
): Promise<ResultadoEscalamiento> {
  const aviso = MENSAJES_ESPERA[datos.motivo];

  const [envio] = await Promise.all([
    enviarTexto(datos.telefonoE164, aviso).catch(() => ({
      success: false as const,
      error: "fallo el envio",
    })),
    marcarConversacion(supabase, datos.telefonoE164, datos.motivo, razon).catch(
      (err) => console.error("[wa-escalamiento] no se pudo marcar:", err),
    ),
    avisarPorWhatsApp(supabase, datos).catch((err) =>
      console.error("[wa-escalamiento] no se pudo avisar a Diana:", err),
    ),
    etiquetarEnBotcake(datos.telefonoE164).catch((err) =>
      console.warn("[wa-escalamiento] no se pudo etiquetar:", err),
    ),
  ]);

  return {
    mensajeEnviado: envio.success,
    motivo: datos.motivo,
    razon,
  };
}

export { MENSAJES_ESPERA };

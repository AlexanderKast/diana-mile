import type { SupabaseClient } from "@supabase/supabase-js";
import { enviarTexto } from "../client";
import { EXPERTOS, type ExpertoId } from "./expertos";
import { chat, tieneApiKey } from "./mistral";
import { elegirExperto } from "./router";
import {
  catalogoResumen,
  formatearContexto,
  linkComunidad,
  pedidoReciente,
} from "./contexto";
import {
  dentroDeVentana,
  guardarEntrante,
  guardarRespuesta,
  historial,
  obtenerOCrearConversacion,
} from "./conversacion";
import { FALLBACK_HUMANO, FORMATO_WHATSAPP, VOZ_MILITO } from "./voz";

export type ResultadoAgente = {
  respondido: boolean;
  experto?: ExpertoId;
  respuesta?: string;
  /** El equipo humano debe entrar a esta conversacion. */
  escalar?: boolean;
  motivo?: string;
};

/**
 * Frases con las que la persona pide explicitamente un humano. Cuando
 * aparecen, la IA no intenta resolver: escala y se calla.
 */
const PIDE_HUMANO =
  /\b(asesor|humano|persona real|hablar con alguien|operador|agente real|reclamo|demanda|abogado|estafa|estafaron|fraude)\b/i;

function construirSystemPrompt(
  experto: (typeof EXPERTOS)[ExpertoId],
  contexto: string,
): string {
  const instruccionesExtra = experto.escalaAHumano
    ? `\n\nATENCION — ESTA CONVERSACION ES DE SOPORTE: la persona esta preguntando por un pedido o tiene un problema. Aqui NO vendes ni invitas a la comunidad. Respondes solo con los datos reales del pedido que tienes arriba, con empatia. Si no tienes el dato o hay un reclamo, le dices con claridad que ya le pasas el caso a una persona del equipo. Nunca inventes fechas de entrega.`
    : "";

  return [
    VOZ_MILITO,
    `TU ESPECIALIDAD EN ESTE MOMENTO:\n${experto.conocimiento}`,
    contexto,
    instruccionesExtra,
    FORMATO_WHATSAPP,
  ]
    .filter(Boolean)
    .join("\n\n───\n\n");
}

/**
 * Procesa un mensaje entrante de WhatsApp: elige el experto, arma el
 * contexto real, responde con la voz de Milito y guarda todo.
 *
 * Nunca lanza: ante cualquier fallo devuelve escalar=true para que un
 * humano atienda. Es preferible que responda una persona a que el bot
 * invente.
 */
export async function responderMensaje(
  supabase: SupabaseClient,
  entrada: { telefonoE164: string; texto: string; nombre?: string | null },
): Promise<ResultadoAgente> {
  const { telefonoE164, texto, nombre } = entrada;

  try {
    const conversacion = await obtenerOCrearConversacion(
      supabase,
      telefonoE164,
      nombre,
    );
    if (!conversacion) {
      return { respondido: false, escalar: true, motivo: "sin_conversacion" };
    }

    await guardarEntrante(supabase, conversacion.id, texto);

    if (!conversacion.iaActiva) {
      return { respondido: false, escalar: true, motivo: "ia_silenciada" };
    }

    if (PIDE_HUMANO.test(texto)) {
      const aviso =
        "Claro que si 💚 Ya le paso tu mensaje a una persona del equipo para que te escriba.";
      await enviarTexto(telefonoE164, aviso);
      await guardarRespuesta(supabase, conversacion.id, aviso, "pedido", 0);
      return {
        respondido: true,
        respuesta: aviso,
        escalar: true,
        motivo: "pidio_humano",
      };
    }

    if (!tieneApiKey()) {
      await enviarTexto(telefonoE164, FALLBACK_HUMANO);
      return { respondido: true, escalar: true, motivo: "sin_api_key" };
    }

    const pedido = await pedidoReciente(supabase, telefonoE164);

    const expertoId = await elegirExperto(texto, {
      expertoPrevio: conversacion.ultimoExperto,
      tienePedidoActivo: Boolean(pedido),
    });
    const experto = EXPERTOS[expertoId];

    const [catalogo, comunidad, previos] = await Promise.all([
      experto.necesitaCatalogo ? catalogoResumen() : Promise.resolve(null),
      linkComunidad(supabase),
      historial(supabase, conversacion.id),
    ]);

    const contexto = formatearContexto({
      nombre: conversacion.nombre ?? nombre ?? null,
      pedido,
      catalogo,
      comunidad,
    });

    // El historial ya incluye el mensaje que acabamos de guardar.
    const { texto: respuesta, tokens } = await chat([
      { role: "system", content: construirSystemPrompt(experto, contexto) },
      ...previos,
    ]);

    const envio = await enviarTexto(telefonoE164, respuesta);
    if (!envio.success) {
      return {
        respondido: false,
        escalar: true,
        motivo: `fallo_envio: ${envio.error}`,
      };
    }

    await guardarRespuesta(
      supabase,
      conversacion.id,
      respuesta,
      expertoId,
      tokens,
    );

    return {
      respondido: true,
      experto: expertoId,
      respuesta,
      escalar: experto.escalaAHumano,
    };
  } catch (err) {
    console.error("[wa-agente] fallo al responder:", err);
    try {
      await enviarTexto(telefonoE164, FALLBACK_HUMANO);
    } catch {
      // Si ni el fallback sale, el equipo lo vera en el panel.
    }
    return {
      respondido: false,
      escalar: true,
      motivo: err instanceof Error ? err.message : "error_desconocido",
    };
  }
}

export { dentroDeVentana };

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
import { TECNICAS_CIERRE } from "./cierre";
import {
  detectarEscalada,
  escalarAHumano,
  MARCA_ESCALAR,
  type MotivoEscalado,
} from "./escalamiento";
import {
  limpiarFormato,
  pareceDespedida,
  problemasDeFormato,
  type OpcionesFormato,
} from "./formato";

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

/**
 * Instruccion para que el modelo prefiera callarse antes que inventar. Es
 * la regla mas importante del sistema: un dato inventado sobre un precio o
 * un pedido le cuesta la confianza a la marca.
 */
const REGLA_NO_INVENTAR = `SI NO SABES, NO RESPONDAS.

Cuando te pregunten algo que no puedas responder con lo que tienes arriba —un precio que no esta en el catalogo, el estado de un pedido que no aparece, una fecha de entrega, una condicion medica, una promocion, una politica que no conoces, cualquier dato duro que no tengas— NO improvises, NO estimes, NO respondas "creo que" ni "normalmente".

En ese caso tu respuesta completa debe ser exactamente:
${MARCA_ESCALAR} seguido de una frase corta diciendo que te falta.

Ejemplo: ${MARCA_ESCALAR} pregunta si el producto sirve durante el embarazo

Ese texto NUNCA lo ve la clienta: el sistema lo intercepta, le avisa a Diana y le responde a ella que le confirmas en un momento. Escalar no es fallar, es lo correcto. Inventar si es fallar.`;

function construirSystemPrompt(
  experto: (typeof EXPERTOS)[ExpertoId],
  contexto: string,
): string {
  const instruccionesExtra = experto.escalaAHumano
    ? `\n\nATENCION — ESTA CONVERSACION ES DE SOPORTE: la persona esta preguntando por un pedido o tiene un problema.
- CERO EMOJIS. Ninguno, ni siquiera uno de empatia. A alguien preocupado por su plata o su pedido un emoji le suena a que no lo estan tomando en serio.
- NO vendes, NO recomiendas otro producto, NO invitas a la comunidad.
- Respondes solo con los datos reales del pedido que tienes arriba.
- Nunca inventes una fecha de entrega. Si no la tienes, escalas.`
    : "";

  return [
    VOZ_MILITO,
    `TU ESPECIALIDAD EN ESTE MOMENTO:\n${experto.conocimiento}`,
    experto.vende ? TECNICAS_CIERRE : "",
    contexto,
    REGLA_NO_INVENTAR,
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

    const datosBase = {
      telefonoE164,
      nombre: conversacion.nombre ?? nombre ?? null,
      pregunta: texto,
    };

    if (PIDE_HUMANO.test(texto)) {
      const motivo: MotivoEscalado = /reclamo|estafa|fraude|demanda|abogado/i.test(
        texto,
      )
        ? "reclamo"
        : "pidio_humano";
      const res = await escalarAHumano(
        supabase,
        { ...datosBase, motivo },
        "la persona lo pidio explicitamente",
      );
      return {
        respondido: res.mensajeEnviado,
        escalar: true,
        motivo,
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

    const system = construirSystemPrompt(experto, contexto);
    const opcionesFormato: OpcionesFormato = {
      soporte: experto.escalaAHumano,
      despedida: pareceDespedida(texto),
    };

    // El historial ya incluye el mensaje que acabamos de guardar.
    let { texto: respuesta, tokens } = await chat([
      { role: "system", content: system },
      ...previos,
    ]);
    respuesta = limpiarFormato(respuesta, opcionesFormato);

    // Lo que no se puede arreglar sin cambiar el sentido (mensaje muy
    // largo, dos preguntas) se le devuelve al modelo una vez. Un reintento
    // sale mas barato que mandarle a la clienta un mensaje mal formado.
    const problemas = problemasDeFormato(respuesta, opcionesFormato);
    if (problemas.length) {
      try {
        const reintento = await chat([
          { role: "system", content: system },
          ...previos,
          { role: "assistant", content: respuesta },
          {
            role: "user",
            content: `[CORRECCION DE FORMATO — no es la clienta quien escribe esto] Tu mensaje anterior ${problemas.join(" y ")}. Reescribelo respetando eso. Responde solo con el mensaje corregido.`,
          },
        ]);
        const corregido = limpiarFormato(reintento.texto, opcionesFormato);
        // Solo se acepta si de verdad quedo mejor.
        if (!problemasDeFormato(corregido, opcionesFormato).length) {
          respuesta = corregido;
        }
        tokens += reintento.tokens;
      } catch (err) {
        console.warn("[wa-agente] fallo el reintento de formato:", err);
      }
    }

    // El modelo dijo que no sabe: esa marca jamas llega a la clienta.
    const razonEscalada = detectarEscalada(respuesta);
    if (razonEscalada) {
      const res = await escalarAHumano(
        supabase,
        { ...datosBase, motivo: "no_sabe" },
        razonEscalada,
      );
      await guardarRespuesta(
        supabase,
        conversacion.id,
        `(escalado a Diana: ${razonEscalada})`,
        expertoId,
        tokens,
      );
      return {
        respondido: res.mensajeEnviado,
        experto: expertoId,
        escalar: true,
        motivo: `no_sabe: ${razonEscalada}`,
      };
    }

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

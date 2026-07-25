/**
 * Cliente de chat de Mistral para el agente de WhatsApp.
 *
 * Distinto de packages/shared/src/landing-ai.js (que genera JSON para las
 * landings): aqui necesitamos conversacion con historial y texto plano.
 */

export const MODELO_CHAT = process.env.MISTRAL_CHAT_MODEL ?? "mistral-large-latest";
export const MODELO_ROUTER = process.env.MISTRAL_ROUTER_MODEL ?? "mistral-small-latest";

export type MensajeChat = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type RespuestaChat = {
  texto: string;
  tokens: number;
};

export function tieneApiKey(): boolean {
  return Boolean(process.env.MISTRAL_API_KEY);
}

/**
 * Llama a Mistral y devuelve texto plano. Lanza si falla — el llamador
 * decide el fallback (nunca se le deja a la persona sin respuesta).
 */
export async function chat(
  mensajes: MensajeChat[],
  opciones: { modelo?: string; maxTokens?: number; temperatura?: number } = {},
): Promise<RespuestaChat> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new Error("Falta MISTRAL_API_KEY");

  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: opciones.modelo ?? MODELO_CHAT,
      max_tokens: opciones.maxTokens ?? 500,
      temperature: opciones.temperatura ?? 0.7,
      messages: mensajes,
    }),
  });

  const json = (await res.json().catch(() => null)) as {
    choices?: { message?: { content?: string } }[];
    usage?: { total_tokens?: number };
    message?: string;
  } | null;

  if (!res.ok) {
    throw new Error(`Mistral HTTP ${res.status}: ${json?.message ?? "sin detalle"}`);
  }

  const texto = (json?.choices?.[0]?.message?.content ?? "").trim();
  if (!texto) throw new Error("Mistral devolvio una respuesta vacia");

  return { texto, tokens: json?.usage?.total_tokens ?? 0 };
}

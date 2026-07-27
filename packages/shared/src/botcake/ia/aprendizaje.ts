import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Memoria que crece: lo que el agente no supo hoy, lo sabe manana.
 *
 * Un modelo de lenguaje no aprende solo — sus pesos no cambian por
 * conversar. Lo que si se puede hacer, y es lo que de verdad sirve, es
 * acumular las respuestas que dio una persona cuando el agente escalo, y
 * devolverselas como contexto la proxima vez que aparezca la misma duda.
 *
 * La busqueda es por significado y no por palabras: "¿sirve en el
 * embarazo?" y "estoy embarazada, lo puedo usar?" son la misma pregunta
 * escrita distinto, y por palabras clave no se encontrarian.
 */

const MODELO_EMBED = "mistral-embed";

/** Convierte texto en vector. Devuelve null si no se puede. */
export async function embeber(texto: string): Promise<number[] | null> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey || !texto.trim()) return null;

  try {
    const res = await fetch("https://api.mistral.ai/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODELO_EMBED,
        input: [texto.slice(0, 2000)],
      }),
    });
    if (!res.ok) return null;

    const json = (await res.json()) as { data?: { embedding: number[] }[] };
    return json.data?.[0]?.embedding ?? null;
  } catch (err) {
    console.warn("[aprendizaje] no se pudo embeber:", err);
    return null;
  }
}

export type Aprendido = {
  id: string;
  pregunta: string;
  respuesta: string;
  similitud: number;
};

/**
 * Busca respuestas ya aprendidas que sirvan para este mensaje.
 *
 * El umbral es alto a proposito: es preferible no encontrar nada y que el
 * agente escale, a darle una respuesta parecida pero de otra cosa.
 */
export async function buscarAprendido(
  supabase: SupabaseClient,
  mensaje: string,
  umbral = 0.78,
): Promise<Aprendido[]> {
  const vector = await embeber(mensaje);
  if (!vector) return [];

  const { data, error } = await supabase.rpc("buscar_aprendizaje", {
    consulta: JSON.stringify(vector),
    umbral,
    tope: 3,
  });

  if (error) {
    console.warn("[aprendizaje] fallo la busqueda:", error.message);
    return [];
  }
  return (data ?? []) as Aprendido[];
}

/** Suma uso, para saber que es lo que mas preguntan. */
export async function marcarUsado(
  supabase: SupabaseClient,
  ids: string[],
): Promise<void> {
  if (!ids.length) return;
  await supabase.rpc("incrementar_uso_aprendizaje", { ids });
}

/**
 * Deja anotada una pregunta que el agente no supo responder, para que
 * alguien la conteste una vez y no se repita el escalamiento.
 */
export async function anotarPendiente(
  supabase: SupabaseClient,
  datos: { telefono: string; pregunta: string; contexto?: string },
): Promise<void> {
  try {
    // Si ya hay una practicamente igual sin resolver, no se duplica.
    const { data: similares } = await supabase
      .from("whatsapp_pendientes_aprender")
      .select("id, pregunta")
      .eq("estado", "pendiente")
      .limit(50);

    const normal = (t: string) =>
      t.toLowerCase().replace(/[^a-z0-9áéíóúñ ]/gi, "").trim();

    if ((similares ?? []).some((p) => normal(p.pregunta) === normal(datos.pregunta))) {
      return;
    }

    await supabase.from("whatsapp_pendientes_aprender").insert({
      telefono: datos.telefono,
      pregunta: datos.pregunta,
      contexto: datos.contexto ?? null,
    });
  } catch (err) {
    console.warn("[aprendizaje] no se pudo anotar la pendiente:", err);
  }
}

/**
 * Guarda una respuesta enseñada por una persona. A partir de aqui el
 * agente la usa solo.
 */
export async function ensenar(
  supabase: SupabaseClient,
  datos: {
    pregunta: string;
    respuesta: string;
    creadoPor?: string;
    pendienteId?: string;
  },
): Promise<{ ok: boolean; id?: string; motivo?: string }> {
  const vector = await embeber(datos.pregunta);
  if (!vector) {
    return { ok: false, motivo: "no se pudo generar el embedding" };
  }

  const { data, error } = await supabase
    .from("whatsapp_aprendizaje")
    .insert({
      pregunta: datos.pregunta.trim(),
      respuesta: datos.respuesta.trim(),
      embedding: JSON.stringify(vector),
      origen: "humano",
      creado_por: datos.creadoPor ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, motivo: error?.message ?? "no se pudo guardar" };
  }

  if (datos.pendienteId) {
    await supabase
      .from("whatsapp_pendientes_aprender")
      .update({ estado: "resuelta", aprendizaje_id: data.id })
      .eq("id", datos.pendienteId);
  }

  return { ok: true, id: data.id };
}

/** Bloque para el prompt con lo que ya se aprendio sobre esta duda. */
export function formatearAprendido(aprendidos: Aprendido[]): string {
  if (!aprendidos.length) return "";

  const lineas = aprendidos
    .map((a) => `P: ${a.pregunta}\nR: ${a.respuesta}`)
    .join("\n\n");

  return `RESPUESTAS QUE YA DISTE ANTES A ESTO MISMO

${lineas}

Estas respuestas son tuyas y estan verificadas: usalas. Si alguna cubre lo que te estan preguntando, respondes con eso (con tus palabras, no copiado tal cual) y NO escalas — ya sabes la respuesta.`;
}

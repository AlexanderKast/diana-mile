import type { SupabaseClient } from "@supabase/supabase-js";
import { encolarMensaje } from "./outbox";
import { PLANTILLAS } from "./plantillas";
import { chat } from "./ia/mistral";

/**
 * Mensaje diario de la marca: una idea corta de autocuidado, habito o
 * mentalidad, con la voz de Milito.
 *
 * Se genera con IA cada dia en vez de rotar una lista fija: una lista se
 * repite en pocas semanas y la gente lo nota. Se guarda lo enviado en los
 * ultimos dias y se le pasa al modelo para que no repita el mismo tema.
 *
 * Solo va a quien tiene promociones activas y respeta la franja horaria
 * (sale con el envio de las 7am si el cron corre antes).
 */

const TEMAS = [
  "cuidado de la piel",
  "constancia y habitos pequenos",
  "movimiento y energia",
  "descanso y sueno",
  "hablarse bonito a una misma",
  "tomar agua y alimentacion simple",
  "sostener la rutina cuando no hay ganas",
  "celebrar avances chiquitos",
];

const SYSTEM = `Eres Milito (Diana Mile), de Milito Life: una marca colombiana de skincare y bienestar. Escribes el mensaje que le llega hoy a tu comunidad por WhatsApp.

Es un mensaje de valor, NO una promocion: no vendes nada, no mencionas productos ni precios, no pides que compren. Es la razon por la que la gente no bloquea el numero.

Como escribes:
- Espanol colombiano natural, de tu a tu, calido y directo.
- MAXIMO 3 lineas. Es WhatsApp.
- Un solo emoji, o ninguno.
- Sin markdown. Para resaltar, un asterisco a cada lado.
- Nada de frases de taza motivacional ("el exito es una actitud"). Algo concreto y aplicable hoy, o una observacion honesta que se sienta de una persona real.
- Nada de promesas medicas ni de resultados.
- No saludes con "Hola" ni uses el nombre: eso lo pone la plantilla.

Respondes UNICAMENTE con el texto del mensaje, sin comillas ni explicaciones.`;

/** Los ultimos mensajes enviados, para no repetir tema. */
async function recientes(supabase: SupabaseClient): Promise<string[]> {
  const { data } = await supabase
    .from("whatsapp_mensajes")
    .select("variables")
    .eq("tipo", "diario")
    .order("created_at", { ascending: false })
    .limit(7);

  return (data ?? [])
    .map((m) => (m.variables as { "1"?: string })?.["1"])
    .filter((t): t is string => Boolean(t));
}

/** Genera el mensaje del dia. Devuelve null si la IA no esta disponible. */
export async function generarMensajeDiario(
  supabase: SupabaseClient,
): Promise<string | null> {
  if (!process.env.MISTRAL_API_KEY) return null;

  const previos = await recientes(supabase);
  const tema = TEMAS[new Date().getDay() % TEMAS.length];

  const evitar = previos.length
    ? `\n\nNO repitas la idea de estos mensajes recientes:\n${previos.map((p) => `- ${p}`).join("\n")}`
    : "";

  try {
    const { texto } = await chat(
      [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: `Escribe el mensaje de hoy. Tema sugerido: ${tema}.${evitar}`,
        },
      ],
      { maxTokens: 200, temperatura: 0.9 },
    );

    // El modelo a veces devuelve el texto entre comillas. [\s\S] en vez de
    // la bandera /s, que necesita un target mas nuevo del que compila shop.
    return texto.trim().replace(/^["']([\s\S]*)["']$/, "$1");
  } catch (err) {
    console.error("[mensaje-diario] fallo al generar:", err);
    return null;
  }
}

export type ResultadoDiario = {
  enviados: number;
  mensaje: string | null;
  motivo?: string;
};

/**
 * Encola el mensaje del dia para toda la comunidad activa.
 *
 * OJO con el costo: cada envio abre una conversacion de marketing en
 * WhatsApp y Meta la cobra. Con una base grande esto se vuelve caro
 * rapido, por eso existe el tope y la clave de configuracion para
 * apagarlo sin tocar codigo.
 */
export async function enviarMensajeDiario(
  supabase: SupabaseClient,
  opciones: { tope?: number; textoManual?: string } = {},
): Promise<ResultadoDiario> {
  const { data: cfg } = await supabase
    .from("config")
    .select("valor")
    .eq("clave", "mensaje_diario_activo")
    .maybeSingle();

  if (cfg?.valor !== "true") {
    return { enviados: 0, mensaje: null, motivo: "desactivado en config" };
  }

  // No se manda dos veces el mismo dia aunque el cron corra varias veces.
  const hoy = new Date().toISOString().slice(0, 10);
  const { count: yaHoy } = await supabase
    .from("whatsapp_mensajes")
    .select("id", { count: "exact", head: true })
    .eq("tipo", "diario")
    .gte("created_at", `${hoy}T00:00:00Z`);

  if ((yaHoy ?? 0) > 0) {
    return { enviados: 0, mensaje: null, motivo: "ya se envio hoy" };
  }

  const texto = opciones.textoManual ?? (await generarMensajeDiario(supabase));
  if (!texto) {
    return { enviados: 0, mensaje: null, motivo: "no se pudo generar" };
  }

  const { data: destinatarios } = await supabase
    .from("whatsapp_conversaciones")
    .select("telefono, nombre")
    .eq("promociones_activas", true)
    .limit(opciones.tope ?? 500);

  if (!destinatarios?.length) {
    return { enviados: 0, mensaje: texto, motivo: "sin destinatarios" };
  }

  for (const persona of destinatarios) {
    await encolarMensaje(supabase, {
      telefonoE164: persona.telefono,
      tipo: "diario",
      plantilla: PLANTILLAS.mensajeDiario,
      variables: {
        "1": texto,
        "2": (persona.nombre ?? "").split(/\s+/)[0] || "Hola",
      },
    });
  }

  return { enviados: destinatarios.length, mensaje: texto };
}

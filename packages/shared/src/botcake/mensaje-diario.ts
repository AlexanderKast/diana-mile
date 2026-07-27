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

/**
 * Temas de vida, no de producto. Lo que sostiene una comunidad es que le
 * hablen a la persona, no a la clienta: si el mensaje termina siendo un
 * tip de skincare disfrazado, deja de ser valor y pasa a ser publicidad.
 */
export const TEMAS_DIARIOS = [
  "amor propio y como te hablas cuando nadie te escucha",
  "descansar sin sentir culpa",
  "dejar de compararse con lo que se ve en redes",
  "poner limites sin sentirse mala persona",
  "celebrar avances chiquitos que nadie mas nota",
  "volver a empezar despues de soltar algo",
  "el perfeccionismo como forma de postergar",
  "pedir ayuda no es debilidad",
  "estar presente en lo que se esta haciendo",
  "hacer las paces con el propio cuerpo",
  "la calma como algo que se practica, no que llega",
  "soltar lo que ya no depende de una",
  "el valor de la constancia sobre la motivacion",
  "darse permiso de ir despacio",
];

export const SYSTEM_DIARIO = `Eres Milito (Diana Mile), de Milito Life, una marca colombiana de bienestar. Escribes el mensaje que le llega hoy a tu comunidad por WhatsApp.

ES UN MENSAJE DE VIDA, NO DE PRODUCTO. No vendes nada, no mencionas productos, ingredientes, rutinas de skincare, precios ni la tienda. Nada de "y para eso tenemos...". Si el mensaje se puede leer como publicidad disfrazada, esta mal.

De lo que si hablas: amor propio, autocuidado real, calma, la relacion con una misma, habitos, soltar la culpa, la comparacion, los limites. Reflexiones que le sirvan a alguien que esta viviendo su dia.

Como escribes:
- Espanol colombiano natural, de tu a tu, calido y directo.
- TRES FRASES. Ni una mas. Es un WhatsApp, no un post de Instagram: si se ve como un ladrillo de texto, no lo leen y se pierde lo bueno.
- Una sola idea, y una sola pregunta como maximo. Si se te ocurren dos ideas, elige la mas fuerte y suelta la otra: la que sobra le quita fuerza a la que importa.
- No cierres con instrucciones tipo "hoy prueba esto, y esto, y esto". Una invitacion o ninguna.
- Un solo emoji, o ninguno.
- Sin markdown. Para resaltar, un asterisco a cada lado.
- NADA de frase de taza motivacional ("tu puedes con todo", "el exito es una actitud", "brilla"). Eso no lo lee nadie.
- Escribe como quien de verdad ha pasado por eso: una observacion honesta, algo que se pueda hacer hoy, o una idea que le de vuelta a algo que damos por hecho.
- Puedes ser vulnerable. Un "a mi tambien me pasa" vale mas que un consejo perfecto.
- Nada de promesas medicas ni de terapia. No eres psicologa.
- No saludes con "Hola" ni uses el nombre: eso lo pone la plantilla.

Respondes UNICAMENTE con el texto del mensaje, sin comillas ni explicaciones.`;

/** Cada cuantos dias sale el mensaje. Configurable sin tocar codigo. */
const DIAS_ENTRE_ENVIOS_POR_DEFECTO = 3;

/** Mas largo que esto se ve como un ladrillo en el celular. */
export const LARGO_MAXIMO = 320;

/** Los ultimos mensajes enviados, para no repetir tema. */
async function recientes(supabase: SupabaseClient): Promise<string[]> {
  const { data } = await supabase
    .from("whatsapp_mensajes")
    .select("variables")
    .eq("tipo", "diario")
    .order("created_at", { ascending: false })
    .limit(10);

  return (data ?? [])
    .map((m) => (m.variables as { "1"?: string })?.["1"])
    .filter((t): t is string => Boolean(t));
}

/** Cuando salio el ultimo, para respetar el espaciado. */
async function ultimoEnvio(supabase: SupabaseClient): Promise<Date | null> {
  const { data } = await supabase
    .from("whatsapp_mensajes")
    .select("created_at")
    .eq("tipo", "diario")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data?.created_at ? new Date(data.created_at) : null;
}

/** Genera el mensaje del dia. Devuelve null si la IA no esta disponible. */
export async function generarMensajeDiario(
  supabase: SupabaseClient,
): Promise<string | null> {
  if (!process.env.MISTRAL_API_KEY) return null;

  const previos = await recientes(supabase);
  const tema = TEMAS_DIARIOS[new Date().getDay() % TEMAS_DIARIOS.length];

  const evitar = previos.length
    ? `\n\nNO repitas la idea de estos mensajes recientes:\n${previos.map((p) => `- ${p}`).join("\n")}`
    : "";

  try {
    const { texto } = await chat(
      [
        { role: "system", content: SYSTEM_DIARIO },
        {
          role: "user",
          content: `Escribe el mensaje de hoy. Tema sugerido: ${tema}.${evitar}`,
        },
      ],
      { maxTokens: 200, temperatura: 0.9 },
    );

    // El modelo a veces devuelve el texto entre comillas. [\s\S] en vez de
    // la bandera /s, que necesita un target mas nuevo del que compila shop.
    const limpio = texto.trim().replace(/^["']([\s\S]*)["']$/, "$1");
    if (limpio.length <= LARGO_MAXIMO) return limpio;

    // Se pasa de largo con frecuencia: pedirle contar caracteres no
    // funciona, pero mostrarle el suyo y pedirle que lo recorte si. Se
    // reescribe en vez de cortar, que dejaria la reflexion a medias.
    const { texto: corto } = await chat(
      [
        { role: "system", content: SYSTEM_DIARIO },
        { role: "assistant", content: limpio },
        {
          role: "user",
          content: `Ese mensaje tiene ${limpio.length} caracteres y el maximo son ${LARGO_MAXIMO}. Reescribelo mas corto quedandote con la idea mas fuerte. Responde solo con el mensaje.`,
        },
      ],
      { maxTokens: 200, temperatura: 0.7 },
    );

    const recortado = corto.trim().replace(/^["']([\s\S]*)["']$/, "$1");
    return recortado.length < limpio.length ? recortado : limpio;
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
  const { data: config } = await supabase
    .from("config")
    .select("clave, valor")
    .in("clave", ["mensaje_diario_activo", "mensaje_diario_cada_dias"]);

  const valores = new Map((config ?? []).map((c) => [c.clave, c.valor]));

  if (valores.get("mensaje_diario_activo") !== "true") {
    return { enviados: 0, mensaje: null, motivo: "desactivado en config" };
  }

  // El cron corre todos los dias; aqui se decide si hoy toca. Espaciarlo
  // baja el costo y sube el valor percibido: un mensaje que llega cada
  // tres dias se lee, uno que llega a diario se ignora o molesta.
  const cada = Number(valores.get("mensaje_diario_cada_dias")) ||
    DIAS_ENTRE_ENVIOS_POR_DEFECTO;
  const ultimo = await ultimoEnvio(supabase);

  if (ultimo) {
    const diasPasados = (Date.now() - ultimo.getTime()) / 86_400_000;
    if (diasPasados < cada) {
      return {
        enviados: 0,
        mensaje: null,
        motivo: `todavia no toca (cada ${cada} dias, van ${diasPasados.toFixed(1)})`,
      };
    }
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

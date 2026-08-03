import { chat, tieneApiKey, type MensajeChat } from "@diana-mile/shared/botcake/ia/mistral";

/**
 * Reescritura de copy del funnel con Mistral, personalizada por persona —
 * SIEMPRE dentro del limite de "Honestidad del contenido" de AGENTS.md.
 *
 * El patron es lista blanca, no lista negra: pedirle a un modelo "no
 * inventes" en el prompt no alcanza (ya lo aprendimos en el proyecto de
 * Landing Magica — "prohibir por categorias no frena la invencion"). Por
 * eso esta funcion exige un objeto `hechos` cerrado: el modelo solo puede
 * reordenar, retonar y reformular ESOS datos, nunca agregar uno que no
 * este ahi (un resultado prometido, una urgencia, un testimonio, un
 * porcentaje de eficacia).
 *
 * Best-effort SIEMPRE: si falta la API key, si Mistral falla, tarda de mas,
 * o el guard de seguridad detecta una frase prohibida en la salida, esta
 * funcion devuelve `null` y el llamador cae de vuelta al copy estatico ya
 * escrito a mano. El funnel nunca depende de que Mistral responda.
 */

const SISTEMA_LISTA_BLANCA = `Sos Milito, coach de bienestar de Milito Life. Reescribis textos de un funnel de diagnostico de piel para que suenen naturales, calidos y persuasivos — nunca geenericos, siempre como si los hubieras escrito para ESA persona.

REGLA ABSOLUTA, sin excepcion: solo podes usar los datos que aparecen en "HECHOS" (mas abajo, en JSON). Si un dato no esta ahi, no existe — no lo menciones, no lo insinues, no lo redondees hacia arriba, no lo completes con sentido comun.

PROHIBIDO SIEMPRE, aunque el HECHOS lo sugiera de lejos:
- Prometer o insinuar un resultado ("esto te va a quitar las arrugas", "vas a ver el cambio")
- Mencionar o inventar urgencia, escasez, stock limitado o plazos que no esten en HECHOS
- Mencionar testimonios, numeros de clientas, o prueba social que no este en HECHOS
- Afirmaciones de salud, eficacia clinica, o porcentajes de mejora

PERMITIDO — esto es lo que tenes que aprovechar:
- Elegir el orden de los datos, que va primero y que va al final
- Ajustar el tono, mas calido o mas directo segun el contexto
- Variar la redaccion, las palabras, el ritmo de las frases
- Enfatizar el dato de HECHOS que mas conecte con lo que la persona ya conto

Respondes SOLO con el texto final, en espanol, sin comillas, sin explicar lo que hiciste, sin markdown.`;

const PATRONES_PROHIBIDOS: RegExp[] = [
  /garantiz/i,
  /\bcura\b|\bcuran\b/i,
  /elimina(r|s)? (por completo|totalmente|100%)/i,
  /\bresultados? garantizados?\b/i,
  /\d{1,3}\s?% de (mejora|efectividad|eficacia)/i,
  /quedan? (solo|solamente)? \d+ (unidades|cupos)/i,
  /(miles|cientos) de (clientas|mujeres) (dicen|aseguran|confirman)/i,
];

/** Defensa en profundidad — el prompt ya lo prohibe, esto es la red de abajo. */
function pasaElGuard(texto: string): boolean {
  return !PATRONES_PROHIBIDOS.some((patron) => patron.test(texto));
}

const TIMEOUT_MS = 4000;

export async function reescribirConHechos({
  instruccion,
  hechos,
  maxTokens = 220,
}: {
  /** Que reescribir y en cuantas frases — ej. "Reescribi la descripcion del diagnostico en 2-3 frases." */
  instruccion: string;
  /** Objeto cerrado de datos reales — el UNICO material que el modelo puede usar. */
  hechos: Record<string, unknown>;
  maxTokens?: number;
}): Promise<string | null> {
  if (!tieneApiKey()) return null;

  const mensajes: MensajeChat[] = [
    { role: "system", content: SISTEMA_LISTA_BLANCA },
    {
      role: "user",
      content: `${instruccion}\n\nHECHOS:\n${JSON.stringify(hechos, null, 2)}`,
    },
  ];

  try {
    // chat() de packages/shared no acepta AbortSignal — Promise.race no
    // cancela el fetch de fondo, pero si evita que ESTA funcion (y la
    // pagina que la espera) se quede colgada mas de TIMEOUT_MS.
    const respuesta = await Promise.race([
      chat(mensajes, { maxTokens, temperatura: 0.8 }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Mistral timeout")), TIMEOUT_MS),
      ),
    ]);

    const texto = respuesta.texto.trim();
    if (!texto || !pasaElGuard(texto)) {
      if (texto) {
        console.warn("[ia/reescribir] salida bloqueada por el guard:", texto.slice(0, 120));
      }
      return null;
    }

    return texto;
  } catch (error) {
    console.error("[ia/reescribir] fallo Mistral, uso copy estatico:", error);
    return null;
  }
}

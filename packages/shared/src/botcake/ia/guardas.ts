/**
 * Dos comprobaciones sobre lo que el modelo esta a punto de hacer, sacadas
 * de fallos vistos en una conversacion real.
 *
 * Las dos van en codigo y no en el prompt por lo de siempre: la regla ya
 * estaba escrita y el modelo se la salto igual.
 */

function normalizar(texto: string): string {
  return (texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Si el mensaje es palabra por palabra el mismo que el anterior.
 *
 * Paso en produccion: la clienta escribio "no entiendo tu pregunta, solo
 * quiero una barra de epoc" y recibio otra vez, identica, la misma
 * pregunta que no habia entendido. Repetir lo que ya no funciono es la
 * forma mas rapida de que alguien cierre el chat.
 *
 * Se compara normalizado —sin tildes ni signos— porque el modelo cambia un
 * punto o una mayuscula y por dentro es la misma frase.
 */
export function esRepeticion(
  respuesta: string,
  ultimaDelAgente: string | null | undefined,
): boolean {
  if (!ultimaDelAgente) return false;
  const a = normalizar(respuesta);
  const b = normalizar(ultimaDelAgente);
  if (!a || !b) return false;
  return a === b;
}

/**
 * Frases que solo significan "si". Valen aparezcan donde aparezcan.
 */
const CONFIRMA_CLARO =
  /\b(confirmo|confirmado|esta bien|estan bien|todo bien|de acuerdo|asi es|correcto|exacto|hagale|hagamos|de una|dale|adelante|procede|envialo|mandalo|pidelo)\b/i;

/**
 * Palabras que confirman solo cuando van solas.
 *
 * "vale", "listo" y "sale" tambien son otra cosa en Colombia: "cuanto VALE
 * el envio", "ya esta LISTO mi pedido", "cuando SALE". Buscarlas dentro de
 * una frase larga convertia una pregunta de precio en un pedido creado.
 */
const CONFIRMA_SUELTO =
  /^(si|sii+|claro|listo|perfecto|ok|oka|okey|okay|vale|sale|bueno|correcto)$/i;

/** Cuantas palabras puede tener un mensaje para considerarlo un "si" a secas. */
const PALABRAS_DE_UN_SI = 3;

/** Saludo suelto: no confirma nada, solo abre conversacion. */
const SOLO_SALUDO =
  /^(hola+|buenas|buenos dias|buenas tardes|buenas noches|hey|ola|que mas|quiubo|alo)$/i;

/** Deja el mensaje en palabras, sin signos ni tildes. */
function palabras(texto: string): string[] {
  return normalizar(texto).split(" ").filter(Boolean);
}

function confirma(texto: string): boolean {
  const limpio = normalizar(texto);
  if (!limpio) return false;

  const trozos = palabras(limpio);
  if (SOLO_SALUDO.test(trozos.join(" "))) return false;
  if (CONFIRMA_CLARO.test(limpio)) return true;

  // Las ambiguas, solo si el mensaje es corto: un "si" de verdad son una o
  // dos palabras, no una pregunta de seis.
  if (trozos.length > PALABRAS_DE_UN_SI) return false;
  return trozos.some((p) => CONFIRMA_SUELTO.test(p));
}

/**
 * Si la persona acaba de confirmar de verdad.
 *
 * Paso en produccion: la clienta confirmo sus datos, el pedido no se pudo
 * cerrar por otra razon, y doce minutos despues escribio "Hola" — y con ese
 * "Hola" se le creo la orden. El modelo seguia viendo la confirmacion de
 * antes en el historial y la dio por buena.
 *
 * Un pedido se crea porque alguien acaba de decir que si, no porque lo
 * dijera en algun momento del dia. Se miran los dos ultimos mensajes suyos:
 * el de ahora y el anterior, por si el "si" y un dato llegaron separados.
 */
export function confirmoHacePoco(
  mensajeActual: string,
  mensajeAnterior?: string | null,
): boolean {
  if (confirma(mensajeActual)) return true;

  // El mensaje de ahora puede ser el dato que faltaba ("Calle 5 #10-20")
  // justo despues de haber dicho que si. Pero si lo de ahora es un saludo,
  // no cuenta: eso es alguien retomando el chat, no confirmando.
  const trozos = palabras(mensajeActual ?? "");
  if (!trozos.length || SOLO_SALUDO.test(trozos.join(" "))) return false;

  return confirma(mensajeAnterior ?? "");
}

/**
 * Las cuentas de la marca y el cierre de toda conversacion.
 *
 * Alguien pregunto por Instagram y el agente no supo decirle: el dato no
 * estaba en ninguna parte. Es de lo mas barato que se puede responder y de
 * lo que mas comunidad construye, asi que va en el prompt de todos los
 * expertos, no solo del que vende.
 */

export const INSTAGRAM_MARCA = "militolife";
export const INSTAGRAM_TIENDA = "militoshop";

const url = (cuenta: string) => `https://instagram.com/${cuenta}`;

/** Se inyecta en todos los expertos: cualquiera puede preguntar por esto. */
export const REDES_MILITO = `LAS CUENTAS DE LA MARCA (dato exacto, no lo cambies ni lo adivines)

- Cuenta oficial: @${INSTAGRAM_MARCA} — ${url(INSTAGRAM_MARCA)}
- Tienda: @${INSTAGRAM_TIENDA} — ${url(INSTAGRAM_TIENDA)}

Si te preguntan donde seguirlas, las dices con arroba. El link solo si lo piden o si se ve que les cuesta buscarlas: un link suelto en cada mensaje se siente a publicidad.

Esto NUNCA se escala: es un dato que ya tienes.`;

/**
 * El ultimo mensaje de toda conversacion, compre o no.
 *
 * Va aparte del resto del cierre porque no depende de si hubo venta: quien
 * hoy no compro puede comprar en un mes si mientras tanto te sigue viendo.
 * Es la unica forma barata de que una conversacion que no cerro deje algo.
 */
export function cierreConRedes(primerNombre?: string | null): string {
  const nombre = primerNombre?.trim() ? `${primerNombre.trim()}, ` : "";
  return `${nombre}síguenos en Instagram para no perderte nada: *@${INSTAGRAM_MARCA}* y la tienda en *@${INSTAGRAM_TIENDA}* 💚`;
}

/**
 * Si a esta persona ya se le dieron las cuentas.
 *
 * Se manda una sola vez por conversacion: repetir el mismo cierre cada vez
 * que alguien se despide deja de leerse como invitacion y pasa a leerse
 * como automatismo.
 */
export function yaSeDieronLasRedes(mensajes: { content: string }[]): boolean {
  return mensajes.some(
    (m) =>
      m.content.includes(`@${INSTAGRAM_MARCA}`) ||
      m.content.includes(`@${INSTAGRAM_TIENDA}`),
  );
}

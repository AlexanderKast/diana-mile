import type { CatalogoDatos } from "./contexto";

/**
 * Impide que el agente ofrezca lo que la tienda no vende.
 *
 * La regla ya esta escrita en el prompt, y aun asi se la salta: sabe de
 * Nu Skin mucho mas de lo que hay en el catalogo y le sale solo recomendar
 * el producto "correcto" aunque no lo tengamos. Prometer algo que no llega
 * cuesta la venta y la confianza, asi que se verifica en codigo antes de
 * enviar, igual que el limite de lineas o los datos del pedido.
 *
 * Dos comprobaciones, las dos contra el catalogo real:
 *  · ninguna cifra en pesos puede ser una que la tienda no cobra;
 *  · ningun producto conocido de la marca puede aparecer ofrecido si no
 *    esta a la venta.
 */

/**
 * Productos y lineas de Nu Skin que la gente pide por nombre.
 *
 * No pretende ser el catalogo entero de la marca —es imposible y cambia—,
 * sino los nombres que de verdad aparecen en una conversacion. Los que si
 * esten en la tienda se descuentan solos mas abajo.
 */
const PRODUCTOS_CONOCIDOS = [
  "lumispa",
  "ageloc me",
  "ageloc lumispa",
  "ageloc boost",
  "ageloc future serve",
  "ageloc transformation",
  "ageloc y-span",
  "ageloc tr90",
  "galvanic spa",
  "galvanic body",
  "tru face",
  "nu skin 180",
  "clear action",
  "moisture restore",
  "nutricentials",
  "celltrex",
  "lifepak",
  "tr90",
  "vitality",
  "g3",
  "jungamals",
  "eye formula",
  "optimum omega",
  "marine mud",
  "firming cream",
  "blemish treatment",
  "baby hibiscus",
  "sole solution",
  "icedancer",
  "glacial marine mud",
  "polishing bar",
  "hand sanitizer",
];

/**
 * Frases que convierten una explicacion en una oferta. Nombrar una linea
 * para explicar que hace esta permitido; decir que la tenemos, no.
 */
const SENALES_DE_OFERTA =
  /\b(tenemos|tengo|te (lo|la|los|las) (puedo|mando|envio|consigo)|te recomiendo|te recomendaria|puedes pedir|puedes llevar|lo llevas|te sirve|ideal para ti|vale|cuesta|precio|\$)/i;

function limpiar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[®™]/g, "")
    .replace(/\s+/g, " ");
}

export type ProblemaCatalogo =
  | { tipo: "precio"; detalle: string }
  | { tipo: "producto"; detalle: string };

/**
 * Cifras en pesos que aparecen en la respuesta y que la tienda no cobra.
 *
 * Solo mira numeros con pinta de precio (cuatro digitos para arriba, con
 * o sin separadores) para no confundirse con "3 dias" ni "2 unidades". Se
 * acepta cualquier precio que exista en el catalogo, aunque sea de otro
 * producto: descuadrar eso ya lo cubre el contexto, y aqui lo que se
 * persigue es la cifra sacada de la nada.
 */
function preciosInventados(
  respuesta: string,
  precios: Set<number>,
): string | null {
  if (!precios.size) return null;

  const encontrados = respuesta.match(/\$?\s?\d{1,3}(?:[.,]\d{3})+|\$\s?\d{4,}/g);
  if (!encontrados) return null;

  for (const bruto of encontrados) {
    const valor = Number(bruto.replace(/[^\d]/g, ""));
    if (!valor || valor < 1000) continue;

    // Se tolera el redondeo con que a veces se cita un precio.
    const coincide = [...precios].some((p) => Math.abs(p - valor) <= 100);
    if (!coincide) return bruto.trim();
  }
  return null;
}

/** Producto de la marca que se esta ofreciendo sin tenerlo a la venta. */
function productoAjeno(
  respuesta: string,
  titulos: string[],
): string | null {
  const enTienda = limpiar(titulos.join(" | "));
  const texto = limpiar(respuesta);

  for (const nombre of PRODUCTOS_CONOCIDOS) {
    if (!texto.includes(nombre)) continue;
    // Si la tienda lo vende, nombrarlo es justo lo que debe hacer.
    if (enTienda.includes(nombre)) continue;
    if (SENALES_DE_OFERTA.test(respuesta)) return nombre;
  }
  return null;
}

export function problemasDeCatalogo(
  respuesta: string,
  catalogo: CatalogoDatos | null,
): ProblemaCatalogo | null {
  // Sin catalogo leido no hay con que comparar. Bloquear a ciegas dejaria
  // al agente mudo justo cuando Shopify falla.
  if (!catalogo) return null;

  const precio = preciosInventados(respuesta, catalogo.precios);
  if (precio) return { tipo: "precio", detalle: precio };

  const producto = productoAjeno(respuesta, catalogo.titulos);
  if (producto) return { tipo: "producto", detalle: producto };

  return null;
}

/** Lo que se le dice al modelo para que lo corrija en el reintento. */
export function correccionDeCatalogo(problema: ProblemaCatalogo): string {
  return problema.tipo === "precio"
    ? `[CORRECCION — no es la clienta quien escribe esto] Citaste ${problema.detalle}, que no es un precio de la tienda. Usa unicamente los precios del catalogo que tienes arriba, y si no tienes el precio de algo, no lo inventes: dile que se lo confirmas. Reescribe el mensaje.`
    : `[CORRECCION — no es la clienta quien escribe esto] Ofreciste "${problema.detalle}" y eso NO esta a la venta en la tienda. Solo puedes ofrecer lo que aparece en el catalogo de arriba. Puedes explicar que hace la linea, pero sin dar a entender que lo tenemos. Si lo que ella necesita no esta, se lo dices con honestidad y le ofreces confirmarle si se puede conseguir. Reescribe el mensaje.`;
}

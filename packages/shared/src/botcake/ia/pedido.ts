/**
 * Cierre de venta desde el chat: convierte lo que la clienta dicta por
 * WhatsApp en una orden real, exactamente igual que si hubiera llenado el
 * formulario de la tienda.
 *
 * No duplica la logica del checkout: llama a los mismos endpoints
 * (/api/orders/draft y /api/orders/complete), que son los que calculan el
 * precio contra el catalogo, crean el cliente en Shopify, guardan en
 * `pedidos` y disparan el tracking. Reimplementarlo aqui garantizaria que
 * los dos caminos se desincronicen con el tiempo.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  datosConSustento,
  validarDatosPedido,
  type DatosPedido,
} from "./datos-pedido";

/** minusculas y sin tildes, para comparar lo que escribe la gente. */
function clave(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export type VarianteResuelta = {
  handle: string;
  variantId: string;
  productoTitulo: string;
  varianteTitulo: string;
  precio: number;
};

/**
 * Presentaciones reales de un producto, para poder decirle a la clienta
 * cuales SI hay cuando pide una que no existe. Un "confirmame cual quieres"
 * a secas no le sirve de nada: no sabe cuales son las opciones.
 */
export async function presentacionesDe(
  producto: string,
): Promise<{ titulo: string; opciones: string[] } | null> {
  const productos = await traerProductos();
  if (!productos.length || !producto?.trim()) return null;

  let mejor: { nodo: NodoProducto; p: number } | null = null;
  for (const nodo of productos) {
    const p = puntaje(producto, nodo.title);
    if (p > 0 && (!mejor || p > mejor.p)) mejor = { nodo, p };
  }
  if (!mejor) return null;

  const opciones = mejor.nodo.variants.edges
    .map((e) => e.node)
    .filter((v) => v.availableForSale)
    .map((v) => {
      const precio = Math.round(parseFloat(v.price.amount)).toLocaleString(
        "es-CO",
      );
      return v.title === "Default Title"
        ? `$${precio}`
        : `${v.title} por $${precio}`;
    });

  return { titulo: mejor.nodo.title, opciones };
}

const QUERY_VARIANTES = `{
  products(first: 40, sortKey: BEST_SELLING) {
    edges {
      node {
        title
        handle
        variants(first: 20) {
          edges {
            node { id title availableForSale price { amount } }
          }
        }
      }
    }
  }
}`;

type NodoProducto = {
  title: string;
  handle: string;
  variants: {
    edges: {
      node: {
        id: string;
        title: string;
        availableForSale: boolean;
        price: { amount: string };
      };
    }[];
  };
};

async function traerProductos(): Promise<NodoProducto[]> {
  const dominio = process.env.SHOPIFY_STORE_DOMAIN?.replace(
    /^https?:\/\//,
    "",
  ).replace(/\/+$/, "");
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  if (!dominio || !token) return [];

  const res = await fetch(`https://${dominio}/api/2026-04/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query: QUERY_VARIANTES }),
  });
  if (!res.ok) return [];

  const json = (await res.json()) as {
    data?: { products?: { edges: { node: NodoProducto }[] } };
  };
  return (json.data?.products?.edges ?? []).map((e) => e.node);
}

/** Cuantas palabras del texto aparecen en el titulo: mide que tan bien calza. */
function puntaje(texto: string, titulo: string): number {
  const t = clave(titulo);
  return clave(texto)
    .split(/\s+/)
    .filter((p) => p.length > 2 && t.includes(p)).length;
}

/**
 * Cantidad que pidio, venga en cifra o en letras.
 *
 * La gente escribe "una sola barra" mucho mas seguido que "1 unidad", y
 * sin esto esa frase pasaba de largo y se le mandaba el pack.
 */
const NUMEROS_EN_LETRAS: Record<string, string> = {
  un: "1",
  uno: "1",
  una: "1",
  dos: "2",
  tres: "3",
  cuatro: "4",
  cinco: "5",
  seis: "6",
};

function cantidadPedida(texto: string): string | null {
  const t = clave(texto);
  const cifra = t.match(/\d+/)?.[0];
  if (cifra) return cifra;

  for (const palabra of t.split(/\s+/)) {
    const n = NUMEROS_EN_LETRAS[palabra];
    if (n) return n;
  }
  // "sola", "solita", "sencilla" o "individual" tambien son una unidad.
  if (/\b(sola|solita|solo|sencill|individual|unidad)\b/.test(t)) return "1";
  return null;
}

/**
 * Resuelve el producto y la presentacion que menciono la clienta al id de
 * variante que necesita el checkout. Devuelve null si no hay una
 * coincidencia clara: es preferible preguntar a mandarle otro producto.
 */
export async function resolverVariante(
  producto: string,
  presentacion?: string | null,
): Promise<VarianteResuelta | null> {
  const productos = await traerProductos();
  if (!productos.length || !producto?.trim()) return null;

  let mejor: { nodo: NodoProducto; p: number } | null = null;
  for (const nodo of productos) {
    const p = puntaje(producto, nodo.title);
    if (p > 0 && (!mejor || p > mejor.p)) mejor = { nodo, p };
  }
  if (!mejor) return null;

  const disponibles = mejor.nodo.variants.edges
    .map((e) => e.node)
    .filter((v) => v.availableForSale);
  if (!disponibles.length) return null;

  // Con presentacion ("pack de 2", "x3"), se busca la que mejor calce;
  // sin ella, la mas barata, que es la que la tienda trae por defecto.
  let elegida = disponibles
    .slice()
    .sort((a, b) => parseFloat(a.price.amount) - parseFloat(b.price.amount))[0];

  if (presentacion?.trim()) {
    const numeroPedido = cantidadPedida(presentacion);

    let mejorVar: { v: (typeof disponibles)[0]; p: number } | null = null;
    for (const v of disponibles) {
      let p = puntaje(presentacion, v.title);
      // "pack de 2", "2 unidades" y "x2" deben caer en la misma variante.
      const numeroVariante = cantidadPedida(v.title);
      if (numeroPedido && numeroPedido === numeroVariante) p += 2;
      if (p > 0 && (!mejorVar || p > mejorVar.p)) mejorVar = { v, p };
    }

    // Si pidio una cantidad concreta y NINGUNA variante la tiene, no se
    // sustituye por otra: paso en produccion que alguien pidio una barra
    // suelta —que estaba agotada— y se le creo el pack de dos al doble de
    // precio. Es preferible decirle que no hay a mandarle lo que no pidio.
    if (numeroPedido) {
      const coincideCantidad = disponibles.some(
        (v) => cantidadPedida(v.title) === numeroPedido,
      );
      const pidioUnidad = numeroPedido === "1";
      const hayVarianteUnica =
        disponibles.length === 1 && disponibles[0].title === "Default Title";

      if (!coincideCantidad && !(pidioUnidad && hayVarianteUnica)) {
        return null;
      }
    }

    if (mejorVar) elegida = mejorVar.v;
  }

  return {
    handle: mejor.nodo.handle,
    variantId: elegida.id,
    productoTitulo: mejor.nodo.title,
    varianteTitulo: elegida.title,
    precio: Math.round(parseFloat(elegida.price.amount)),
  };
}

export type ResultadoPedido =
  | {
      ok: true;
      orderNumber: string;
      total: number;
      producto: string;
      /** Ya habia un pedido reciente: no se creo otro. */
      yaExistia?: boolean;
    }
  | { ok: false; motivo: string; faltantes?: string[]; problemas?: string[] };

export type PedidoDesdeChat = Partial<DatosPedido> & {
  producto?: string;
  presentacion?: string | null;
  notas?: string | null;
};

/**
 * Crea la orden. Usa los endpoints publicos de la tienda para no duplicar
 * las reglas de precio ni el alta del cliente en Shopify.
 */
/** Un pedido igual y tan reciente es casi seguro un doble envio. */
const MINUTOS_ANTIDUPLICADO = 20;

export async function crearPedidoDesdeChat(
  entrada: PedidoDesdeChat,
  /**
   * Todo lo que escribio la persona en la conversacion. Es obligatorio:
   * sin esto no se puede comprobar que los datos salieron de ella y no de
   * un ejemplo del prompt.
   */
  mensajesDeLaPersona: string[] = [],
  /**
   * Para comprobar si a esta persona ya se le acaba de crear un pedido.
   * Sin esto el modelo puede emitir la marca dos veces seguidas y crear
   * dos ordenes iguales — paso en produccion.
   */
  supabase?: SupabaseClient,
): Promise<ResultadoPedido> {
  const sitio = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  if (!sitio) {
    return { ok: false, motivo: "falta NEXT_PUBLIC_SITE_URL" };
  }

  const validacion = validarDatosPedido(entrada);
  if (!validacion.ok) {
    return {
      ok: false,
      motivo: "datos incompletos",
      faltantes: validacion.faltantes,
      problemas: validacion.problemas,
    };
  }
  const datos = validacion.datos;

  // Barrera contra datos inventados: si la direccion, el barrio o la
  // ciudad no aparecen en lo que escribio la persona, el modelo los
  // completo por su cuenta y el envio se perderia. Se corta aqui.
  const sustento = datosConSustento(datos, mensajesDeLaPersona);
  if (!sustento.ok) {
    return {
      ok: false,
      motivo: `datos sin sustento en la conversacion: ${sustento.sinSustento.join(", ")}`,
      faltantes: sustento.sinSustento,
    };
  }

  // Barrera antiduplicado: el modelo puede emitir la marca dos veces
  // seguidas —lo hizo en produccion, creando dos ordenes iguales con 43
  // segundos de diferencia—. Si ya hay un pedido reciente de esta persona,
  // se devuelve ese en vez de crear otro.
  if (supabase) {
    const desde = new Date(
      Date.now() - MINUTOS_ANTIDUPLICADO * 60_000,
    ).toISOString();

    const { data: reciente } = await supabase
      .from("pedidos")
      .select("shopify_order_id, producto_nombre, precio_total")
      .eq("telefono", datos.telefonoE164)
      .neq("estado", "cancelado")
      .gt("created_at", desde)
      .order("created_at", { ascending: false })
      .limit(1);

    const previo = reciente?.[0];
    if (previo) {
      return {
        ok: true,
        yaExistia: true,
        orderNumber: previo.shopify_order_id ?? "",
        total: Number(previo.precio_total ?? 0),
        producto: previo.producto_nombre ?? "tu pedido",
      };
    }
  }

  const variante = await resolverVariante(
    entrada.producto ?? "",
    entrada.presentacion,
  );
  if (!variante) {
    return { ok: false, motivo: "no se pudo identificar el producto" };
  }

  const comun = {
    nombre: datos.nombre,
    telefono: datos.telefonoE164,
    departamento: datos.departamento,
    ciudad: datos.ciudad,
    barrio: datos.barrio,
    direccion: datos.direccion,
    variantId: variante.variantId,
    slug: variante.handle,
    // El pedido por chat va a precio de lista: el descuento del popup es
    // de la web y aqui no aplica salvo que la asesora lo negocie aparte.
    descuentoAplicado: false,
    envioPrioritario: false,
  };

  try {
    const resDraft = await fetch(`${sitio}/api/orders/draft`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...comun, ubicacion: null, draftOrderId: null }),
    });
    const draft = (await resDraft.json().catch(() => null)) as {
      draftOrderId?: string;
      mensaje?: string;
    } | null;

    if (!resDraft.ok || !draft?.draftOrderId) {
      return {
        ok: false,
        motivo: draft?.mensaje ?? `draft HTTP ${resDraft.status}`,
      };
    }

    const resComplete = await fetch(`${sitio}/api/orders/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...comun,
        draftOrderId: draft.draftOrderId,
        // Sin esto no se puede medir cuanto cierra el chat frente a la web.
        canal: "whatsapp",
        notas: entrada.notas
          ? `Pedido tomado por WhatsApp. ${entrada.notas}`
          : "Pedido tomado por WhatsApp.",
        ubicacion: null,
      }),
    });
    const completo = (await resComplete.json().catch(() => null)) as {
      orderNumber?: string;
      total?: number;
      mensaje?: string;
    } | null;

    if (!resComplete.ok || !completo?.orderNumber) {
      return {
        ok: false,
        motivo: completo?.mensaje ?? `complete HTTP ${resComplete.status}`,
      };
    }

    return {
      ok: true,
      orderNumber: completo.orderNumber,
      total: completo.total ?? variante.precio,
      producto: `${variante.productoTitulo} — ${variante.varianteTitulo}`,
    };
  } catch (err) {
    return {
      ok: false,
      motivo: err instanceof Error ? err.message : "error desconocido",
    };
  }
}

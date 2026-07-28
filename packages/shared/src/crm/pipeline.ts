import type { EtapaLead } from "./scoring";

/**
 * El embudo COMPLETO, de la primera palabra hasta la comunidad.
 *
 * POR QUE UNA SOLA ESCALERA
 * Antes habia dos: `leads.etapa` (comercial) y `pedidos.estado` (operativo).
 * Mirandolas por separado nadie ve el recorrido: una persona escribe, la
 * califican, compra, y ahi desaparece del embudo para reaparecer en otra
 * pantalla. El negocio es uno solo y el tablero tambien deberia serlo.
 *
 * POR QUE NO SE CREA UNA TERCERA COLUMNA
 * `pedidos.estado` sigue siendo la verdad de la parte operativa y
 * `leads.etapa` de la comercial. Esta escalera es una LECTURA de las dos, no
 * un dato nuevo. Duplicar el estado en una tercera columna garantiza que
 * algun dia las tres digan cosas distintas.
 */

export type FasePipeline =
  // — Comercial: todavia no hay pedido
  | "nuevo"
  | "calificado"
  | "negociacion"
  // — Operativo: ya existe un pedido
  | "nuevo_pedido"
  | "confirmado"
  | "enviado"
  | "entregado"
  | "comunidad"
  // — Terminales
  | "perdido"
  | "devuelto"
  | "cancelado";

export const FASES_PIPELINE: FasePipeline[] = [
  "nuevo",
  "calificado",
  "negociacion",
  "nuevo_pedido",
  "confirmado",
  "enviado",
  "entregado",
  "comunidad",
  "perdido",
  "devuelto",
  "cancelado",
];

export const ETIQUETA_FASE: Record<FasePipeline, string> = {
  nuevo: "Nuevo lead",
  calificado: "Calificado",
  negociacion: "En negociación",
  nuevo_pedido: "Nuevo pedido",
  confirmado: "Confirmado",
  enviado: "Enviado",
  entregado: "Entregado",
  comunidad: "Comunidad",
  perdido: "Perdido",
  devuelto: "Devuelto",
  cancelado: "Cancelado",
};

/**
 * Que fases se mueven arrastrando y cuales no.
 *
 * Las comerciales si: cambiar un lead de "nuevo" a "calificado" es una
 * opinion y no dispara nada.
 *
 * Las operativas NO. Confirmar exige el resultado de la llamada; enviar exige
 * transportadora y numero de guia; entregar exige el valor recaudado. Ademas
 * cada una dispara efectos reales —fulfillment en Shopify, mensajes de
 * WhatsApp, el calendario de seguimiento—. Un arrastre no puede aportar esos
 * datos, asi que esas tarjetas llevan un enlace a la pantalla que si sabe
 * pedirlos, en vez de fingir que se puede mover con el raton.
 */
export const FASES_ARRASTRABLES: FasePipeline[] = [
  "nuevo",
  "calificado",
  "negociacion",
  "perdido",
];

/** A donde se manda a quien quiere avanzar una fase operativa. */
export const DESTINO_OPERATIVO: Partial<Record<FasePipeline, string>> = {
  nuevo_pedido: "/dashboard/confirmacion",
  confirmado: "/dashboard/logistica",
  enviado: "/dashboard/logistica",
};

/** `pedidos.estado` -> fase del tablero. */
export function faseDesdeEstadoPedido(
  estado: string | null,
  entregadoConSeguimiento = false,
): FasePipeline {
  switch (estado) {
    case "pendiente":
      return "nuevo_pedido";
    case "confirmado":
    case "en_preparacion":
      return "confirmado";
    case "enviado":
      return "enviado";
    case "entregado":
      // Tras la entrega arranca el calendario de seguimiento y la invitacion
      // a la comunidad: es una fase distinta, no el final.
      return entregadoConSeguimiento ? "comunidad" : "entregado";
    case "devuelto":
      return "devuelto";
    case "cancelado":
    case "fraude":
      return "cancelado";
    default:
      return "nuevo_pedido";
  }
}

/** `leads.etapa` -> fase del tablero, para quien todavia no compro. */
export function faseDesdeEtapaLead(etapa: EtapaLead): FasePipeline {
  if (etapa === "cerrado") return "nuevo_pedido";
  if (etapa === "perdido") return "perdido";
  return etapa as FasePipeline;
}

// ── Etiquetas ────────────────────────────────────────────────────────────

export type TipoEtiqueta = "canal" | "producto" | "ciudad" | "estado" | "manual";

export type Etiqueta = {
  valor: string;
  tipo: TipoEtiqueta;
};

const CANAL_LEGIBLE: Record<string, string> = {
  whatsapp: "WhatsApp",
  checkout_abandonado: "Checkout a medias",
  linktree: "Link de la bio",
  home: "Web",
  web: "Web",
  meta: "Meta Ads",
  tiktok: "TikTok",
  organico: "Orgánico",
  referido: "Referido",
};

/**
 * Etiquetas que se derivan solas de los datos que ya hay.
 *
 * Se calculan y no se guardan a proposito: una etiqueta guardada se
 * desactualiza en cuanto cambia el dato del que salio. Las que SI se guardan
 * son las manuales, que es lo unico que una maquina no puede deducir.
 */
export function etiquetasAutomaticas(datos: {
  fase: FasePipeline;
  fuente?: string | null;
  canalAdquisicion?: string | null;
  canalVenta?: string | null;
  producto?: string | null;
  ciudad?: string | null;
  ciudadConRecaudo?: boolean | null;
  escalado?: boolean;
}): Etiqueta[] {
  const salida: Etiqueta[] = [];

  const canal =
    datos.canalVenta ?? datos.canalAdquisicion ?? datos.fuente ?? null;
  if (canal) {
    salida.push({
      valor: CANAL_LEGIBLE[canal] ?? canal,
      tipo: "canal",
    });
  }

  if (datos.producto) {
    // El nombre completo no cabe en una etiqueta. Se recorta a lo que
    // identifica: las primeras palabras suelen ser la linea del producto.
    const corto = datos.producto.split("—")[0].trim().slice(0, 28);
    if (corto) salida.push({ valor: corto, tipo: "producto" });
  }

  if (datos.ciudad) {
    salida.push({ valor: datos.ciudad, tipo: "ciudad" });
  }

  if (datos.ciudadConRecaudo === false) {
    salida.push({ valor: "Sin contraentrega", tipo: "estado" });
  }

  if (datos.escalado) {
    salida.push({ valor: "Esperando respuesta", tipo: "estado" });
  }

  salida.push({ valor: ETIQUETA_FASE[datos.fase], tipo: "estado" });

  return salida;
}

export const CLASE_ETIQUETA: Record<TipoEtiqueta, string> = {
  canal: "bg-lila-suave text-morado",
  producto: "bg-crema text-dorado-oscuro",
  ciudad: "bg-arena/60 text-carbon-suave",
  estado: "bg-blanco border border-arena text-ceniza",
  manual: "bg-morado/10 text-morado-oscuro",
};

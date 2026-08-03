import type { RespuestasQuiz } from "../tipos";

/**
 * Contrato genérico que implementan las fichas de segmento de las 5
 * puertas (piel / energia / peso / sesion / negocio). `piel` ya vive en
 * `piel-prescripcion.ts` con este shape (ver `FichaSegmentoPiel` ahí, que
 * extiende `FichaSegmentoProducto`); las demás puertas lo implementan en
 * tareas futuras — la forma tiene que quedar estable para todas.
 */

/** Campos que comparten TODAS las fichas de segmento, sin importar el tipo de puerta. */
export type FichaSegmentoBase = {
  /** Nombre interno del segmento — mismo valor que la key del `Record` que lo contiene. */
  nombreInterno: string;
  /** Título corto para mostrar como encabezado del diagnóstico. */
  tituloDiagnostico: string;
  /** Texto en voz de Milito — calido, paisa, directo. Cero antes/después, cero promesa de resultado sin matiz. */
  descripcionDiagnostico: string;
  /** Nota al pie obligatoria en cualquier pantalla que muestre este diagnóstico — ver AGENTS.md ("diagnóstico defendible"). */
  notaEstimacion: string;
  /** Icono ilustrado del segmento (generado, estilo consistente) — vive en public/images/segmentos/. */
  iconoUrl: string;
  /** Video de Milito explicando el diagnóstico. `null` si todavía no existe. */
  videoId: string | null;
};

/**
 * Un paso del ritual/plan prescrito. Ya existía con este shape en
 * `piel-prescripcion.ts` como `ProductoPrescrito` — se reexporta desde acá
 * para que sea un solo lugar de verdad; `piel-prescripcion.ts` mantiene su
 * propio alias `ProductoPrescrito` para no romper el import existente.
 */
export type ProductoPrescrito = {
  /** Categoria generica del paso del ritual — NUNCA un nombre comercial. Eso se mapea recien en la ficha de producto, fuera del quiz. */
  categoria: string;
  /** Placeholder explicito: todavia no hay mapeo a un producto real de Shopify (SKU, precio) para esta categoria/segmento. */
  notaProducto: string;
};

/** Ficha de segmento que termina en un ritual de productos (piel, energia, peso...). */
export type FichaSegmentoProducto = FichaSegmentoBase & {
  tipo: "producto";
  ritual: ProductoPrescrito[];
  /** Mínimo de días, con uso constante, para esperar un cambio visible — ver `calcularFechaObjetivo` de cada puerta. */
  diasResultadoEstimado: number;
  /** Ruta de la categoría de catálogo a la que apunta el CTA de este segmento. */
  hrefCatalogo: string;
};

/** Ficha de segmento que termina en una calificación/derivación (ej. sesion, negocio), sin ritual de producto. */
export type FichaSegmentoCalificacion = FichaSegmentoBase & {
  tipo: "calificacion";
  nivel: "alto" | "medio" | "bajo";
  /** Mensaje base para el siguiente contacto por WhatsApp — nunca se envía tal cual sin revisión humana del flujo. */
  mensajeWhatsapp: string;
};

export type FichaSegmento = FichaSegmentoProducto | FichaSegmentoCalificacion;

/** Una barra/dimensión de hábito mostrada en la pantalla de resultado (ej. protector solar, sueño, agua, estrés). */
export type DimensionHabito = {
  etiqueta: string;
  valorMostrado: string;
  /** 0..1 — que tan llena se pinta la barra. */
  fraccion: number;
  tono: "bien" | "atencion" | "alerta";
};

/**
 * Todo lo que `resultado/[id]/page.tsx` necesita de una puerta para
 * renderizar el diagnóstico, sin conocer los detalles internos de cada
 * puerta. Un agente futuro implementa esto para energia/peso/sesion/negocio
 * — la forma de este tipo tiene que quedar estable, la implementan varios
 * agentes en tareas separadas.
 */
export type ContratoResultadoPuerta = {
  segmentos: Record<string, FichaSegmento>;
  determinarSegmento: (respuestas: RespuestasQuiz) => string;
  /** Ausente si la puerta no calcula una fecha objetivo (ej. tipo "calificacion"). */
  calcularFechaObjetivo?: (respuestas: RespuestasQuiz, segmento: string) => Date;
  /** Barras de hábito a mostrar. `[]` si el segmento es de tipo "calificacion" y no aplica. */
  dimensionesHabito: (respuestas: RespuestasQuiz) => DimensionHabito[];
  /** Id del paso que describe el estado actual de la persona, para la sección "de dónde partes" — `null` si no aplica. */
  idPasoEstadoActual: string | null;
  /** Id del paso que describe el objetivo elegido, para la sección "hacia dónde vas" — `null` si no aplica. */
  idPasoObjetivo: string | null;
  /** Ids de paso cuyas respuestas se muestran como chips debajo del diagnóstico. */
  idsChips: string[];
};

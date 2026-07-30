import {
  TIPOS_SECCION_VALIDOS,
  type TipoSeccion,
} from "@diana-mile/shared/landing/angulo";

/**
 * Etiquetas en espanol de los 11 tipos de seccion, en el orden en que se
 * arma la landing.
 *
 * Vive aqui y no en cada componente porque el editor de angulos y el wizard
 * pintan la MISMA lista: si cada uno tuviera la suya, agregar un tipo dejaria
 * uno de los dos mostrando nueve casillas y el otro once.
 */
export const SECCIONES_LANDING: { tipo: TipoSeccion; label: string }[] = [
  { tipo: "hero", label: "Hero / gancho" },
  { tipo: "oferta", label: "Oferta y precio real" },
  { tipo: "beneficios", label: "Beneficios" },
  { tipo: "comparativa", label: "Tabla comparativa" },
  { tipo: "autoridad", label: "Autoridad Nu Skin" },
  { tipo: "uso", label: "Cómo se usa" },
  { tipo: "sensorial", label: "Experiencia sensorial" },
  { tipo: "testimonios", label: "Testimonios reales" },
  { tipo: "antes_despues", label: "Antes y después" },
  { tipo: "logistica", label: "Logística + garantía" },
  { tipo: "faq", label: "Preguntas frecuentes" },
];

export const TIPOS_SECCION: readonly TipoSeccion[] = TIPOS_SECCION_VALIDOS;

export function etiquetaSeccion(tipo: string): string {
  return SECCIONES_LANDING.find((s) => s.tipo === tipo)?.label ?? tipo;
}

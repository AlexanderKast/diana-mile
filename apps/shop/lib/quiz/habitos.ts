/**
 * Helpers genéricos para convertir una respuesta de hábito en un tono
 * visual (bien/atencion/alerta) y una fracción 0..1 para pintar una barra.
 *
 * Movidos tal cual desde `app/(funnel)/resultado/[id]/page.tsx` (donde
 * vivían locales al archivo) para que las 5 puertas los reusen desde
 * `lib/quiz/puertas/contratos.ts` en vez de reimplementar el mismo criterio
 * de umbral cada una. La página todavía tiene su propia copia — se borra
 * ahí en la tarea que reescribe esa página completa.
 */

export type Tono = "bien" | "atencion" | "alerta";

/** Para hábitos donde mas es mejor (protector solar, sueno, agua). */
export function tonoPositivo(fraccion: number): Tono {
  if (fraccion >= 0.7) return "bien";
  if (fraccion >= 0.4) return "atencion";
  return "alerta";
}

/** Para hábitos donde mas es peor (estres). */
export function tonoNegativo(fraccion: number): Tono {
  if (fraccion <= 0.3) return "bien";
  if (fraccion <= 0.6) return "atencion";
  return "alerta";
}

/** Normaliza una respuesta de escala 1-10 a una fraccion 0..1. */
export function fraccionEscala10(valor?: number): number {
  if (typeof valor !== "number") return 0;
  return Math.min(Math.max(valor / 10, 0), 1);
}

/**
 * Helper compartido de `prefers-reduced-motion` para logica JS que
 * condiciona TIMING o AVANCE (delays, saltarse animaciones antes de
 * navegar). La guarda CSS de globals.css controla si algo SE ANIMA; esta
 * controla si algo SE RETRASA — ver el comentario en globals.css (~:219).
 * Antes vivia duplicado en PasoOpcionUnica/PasoPais/PasoPayoff.
 */
export function prefiereMenosMovimiento(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

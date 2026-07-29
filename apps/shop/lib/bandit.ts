/**
 * Multi-armed bandit por Thompson sampling para el rotador de landings.
 *
 * La idea: la tasa de conversion real de cada variante es incierta. Se
 * modela como una distribucion Beta(1 + conversiones, 1 + no-conversiones)
 * y en cada visita se sortea un valor de cada distribucion; gana la variante
 * con el sorteo mas alto. El efecto emergente es el deseado: con pocos datos
 * las distribuciones son anchas y el trafico se reparte casi parejo
 * (exploracion); a medida que una variante acumula conversiones su
 * distribucion se estrecha por encima de las demas y se lleva casi todo el
 * trafico (explotacion), sin dejar nunca en cero a las otras — si el angulo
 * ganador se desgasta, el sistema lo detecta y se reacomoda solo.
 *
 * Escrito a mano (Box-Muller + Marsaglia-Tsang): cero dependencias, regla
 * del repo.
 */

export type EstadisticaVariante = {
  slug: string;
  visitas: number;
  conversiones: number;
};

/** Normal estandar por Box-Muller. */
function normal(): number {
  let u = 0;
  while (u === 0) u = Math.random();
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** Gamma(shape, 1) por Marsaglia-Tsang. Valido para shape >= 1. */
function gamma(shape: number): number {
  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  for (;;) {
    let x: number;
    let v: number;
    do {
      x = normal();
      v = 1 + c * x;
    } while (v <= 0);
    v = v * v * v;
    const u = Math.random();
    if (u < 1 - 0.0331 * x * x * x * x) return d * v;
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
}

/** Muestra de Beta(a, b) via dos Gammas. Requiere a, b >= 1. */
function beta(a: number, b: number): number {
  const x = gamma(a);
  const y = gamma(b);
  return x / (x + y);
}

/**
 * Prior Beta(1, 1 + PRIOR_FRACASOS): "una variante nueva convierte ~3%
 * hasta que demuestre otra cosa". Con el prior uniforme Beta(1,1) una
 * variante recien creada acapara ~95% del trafico (el prior cree que puede
 * convertir 50%, irreal en e-commerce); con este entra explorando fuerte
 * (~25-30% contra una ganadora establecida) sin ahogarla, y en unas decenas
 * de visitas ya manda su dato real.
 */
const PRIOR_FRACASOS = 30;

/** Elige la variante a mostrar. Devuelve null solo con lista vacia. */
export function elegirThompson(
  stats: EstadisticaVariante[],
): string | null {
  let mejor: string | null = null;
  let mejorMuestra = -1;

  for (const s of stats) {
    const exitos = Math.max(0, s.conversiones);
    // Un pedido puede caer dias despues de la visita (cookie de 7 dias):
    // el clamp evita una Beta invalida si conversiones > visitas.
    const fracasos = Math.max(0, s.visitas - exitos);
    const muestra = beta(1 + exitos, 1 + PRIOR_FRACASOS + fracasos);
    if (muestra > mejorMuestra) {
      mejorMuestra = muestra;
      mejor = s.slug;
    }
  }

  return mejor;
}

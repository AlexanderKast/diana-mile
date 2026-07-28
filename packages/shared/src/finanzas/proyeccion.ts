/**
 * Proyeccion de ventas y rentabilidad para contraentrega.
 *
 * La idea que trae el modelo de BUHA y que al panel le faltaba entera:
 * en contraentrega FACTURAR NO ES RECAUDAR. Se factura 100, se despacha
 * una parte, y de lo despachado se entrega otra parte. Lo que entra a
 * caja es el producto de las tres cosas, y calcular utilidad sobre la
 * facturacion — que es lo que hace casi todo el mundo — infla el
 * resultado justo en la proporcion en que el negocio falla.
 *
 *     facturacion = inversion en ads / participacion de ads
 *     despachado  = facturacion x tasa de despacho
 *     recaudo     = despachado   x tasa de entrega
 *     ingreso     = recaudo      x margen bruto
 *     utilidad    = ingreso - inversion en ads - costos fijos
 *
 * Verificado contra las pestañas de Mayo y Junio de la hoja: las seis
 * lineas dan 0,00% de desviacion. Las de Enero a Abril no se usaron como
 * referencia porque mezclan dolares y pesos.
 *
 * La primera formula merece una nota: se despeja al reves de como suena.
 * No es "cuanto vendere si invierto X", es "para que X sea el N% de mis
 * ventas, tengo que vender X/N". La participacion de publicidad es la
 * palanca que se controla, y por eso la salida es un abanico de
 * escenarios sobre ella, no un numero unico.
 */

export type SupuestosProyeccion = {
  /** Presupuesto de publicidad del mes, en COP. */
  inversionPublicidad: number;
  /** Que fraccion de la facturacion se va en publicidad (0.14 = 14%). */
  partPublicidad: number;
  ticketPromedio: number;
  /** Margen bruto sobre lo recaudado. */
  margenBruto: number;
  /** De lo vendido, que fraccion alcanza a despacharse. */
  tasaDespacho: number;
  /** De lo despachado, que fraccion se entrega y se cobra. */
  tasaEntrega: number;
  /** Costos fijos del mes (nomina, plataformas, administrativos). */
  costosFijosMes: number;
  /**
   * Flete de ida de un despacho, en COP. Junto con `fleteDevolucion`
   * cuantifica lo que cuesta cada despacho FALLIDO: el pedido devuelto
   * pago ida y vuelta sin dejar un peso. La hoja original lo ignoraba, y
   * es la perdida mas grande de contraentrega.
   */
  fleteIda?: number;
  /** Flete de retorno de una devolucion, en COP. */
  fleteDevolucion?: number;
};

export type ResultadoProyeccion = {
  partPublicidad: number;
  facturacion: number;
  despachado: number;
  recaudo: number;
  ingresoBruto: number;
  inversionPublicidad: number;
  costosFijosMes: number;
  utilidadNeta: number;
  /** Utilidad sobre la facturacion. */
  margenNeto: number;
  facturacionDiaria: number;
  ventasMes: number;
  ventasDiarias: number;
  /** Costo por pedido objetivo: lo maximo que puede costar traer una venta. */
  cppObjetivo: number;
  /** Despachos que no se entregaron: volvieron pagando doble flete. */
  devolucionesMes: number;
  /** Lo que cuestan esas devoluciones (flete de ida + retorno). */
  costoDevoluciones: number;
  /**
   * Ventas que hay que ENTREGAR para no perder plata. Es el numero que
   * de verdad importa en contraentrega y el que la hoja no calculaba.
   * Incluye el lastre de las devoluciones: cada entrega exitosa arrastra
   * (1-e)/e despachos fallidos que hay que pagar.
   */
  puntoEquilibrio: number;
};

const DIAS_MES = 30;

function positivo(valor: number, porDefecto: number): number {
  return Number.isFinite(valor) && valor > 0 ? valor : porDefecto;
}

function fraccion(valor: number, porDefecto: number): number {
  if (!Number.isFinite(valor) || valor <= 0) return porDefecto;
  return Math.min(valor, 1);
}

function noNegativo(valor: number): number {
  return Number.isFinite(valor) && valor > 0 ? valor : 0;
}

/** Corre un escenario. */
export function proyectar(
  supuestos: SupuestosProyeccion,
  partPublicidad?: number,
): ResultadoProyeccion {
  const inversionPublicidad = noNegativo(supuestos.inversionPublicidad);
  const part = fraccion(partPublicidad ?? supuestos.partPublicidad, 0.15);
  const ticket = positivo(supuestos.ticketPromedio, 1);
  const margen = fraccion(supuestos.margenBruto, 0.4);
  const despacho = fraccion(supuestos.tasaDespacho, 0.8);
  const entrega = fraccion(supuestos.tasaEntrega, 0.8);
  const fijos = noNegativo(supuestos.costosFijosMes);

  const fleteIda = noNegativo(supuestos.fleteIda ?? 0);
  const fleteVuelta = noNegativo(supuestos.fleteDevolucion ?? 0);

  const facturacion = inversionPublicidad / part;
  const despachado = facturacion * despacho;
  const recaudo = despachado * entrega;
  const ingresoBruto = recaudo * margen;

  const ventasMes = facturacion / ticket;

  // Los despachos que NO se entregan vuelven pagando flete de ida y de
  // retorno, sin dejar ingreso. El margen no los ve — sale del recaudo,
  // donde estos pedidos no existen — asi que se restan aparte. Con los
  // fletes en cero el modelo queda identico a la hoja original, que es
  // la referencia contra la que estan verificadas las demas formulas.
  const devolucionesMes = ventasMes * despacho * (1 - entrega);
  const costoDevoluciones = devolucionesMes * (fleteIda + fleteVuelta);

  const utilidadNeta =
    ingresoBruto - inversionPublicidad - fijos - costoDevoluciones;

  // Cuanto deja cada pedido ENTREGADO, antes de publicidad, descontando
  // el lastre de sus despachos fallidos: por cada entrega exitosa hay
  // (1-e)/e devoluciones que pagar.
  const devolucionesPorEntrega = entrega > 0 ? (1 - entrega) / entrega : 0;
  const margenPorEntrega =
    ticket * margen - devolucionesPorEntrega * (fleteIda + fleteVuelta);
  const entregasNecesarias =
    margenPorEntrega > 0 ? (inversionPublicidad + fijos) / margenPorEntrega : 0;

  return {
    partPublicidad: part,
    facturacion,
    despachado,
    recaudo,
    ingresoBruto,
    inversionPublicidad,
    costosFijosMes: fijos,
    utilidadNeta,
    margenNeto: facturacion > 0 ? utilidadNeta / facturacion : 0,
    facturacionDiaria: facturacion / DIAS_MES,
    devolucionesMes,
    costoDevoluciones,
    ventasMes,
    ventasDiarias: ventasMes / DIAS_MES,
    cppObjetivo: ventasMes > 0 ? inversionPublicidad / ventasMes : 0,
    puntoEquilibrio: entregasNecesarias,
  };
}

/**
 * El abanico: el mismo presupuesto bajo distintas participaciones de
 * publicidad. Cuanto menor la participacion, mas eficiente la pauta y
 * mas facturacion sostiene el mismo presupuesto.
 */
export function abanico(
  supuestos: SupuestosProyeccion,
  desde = 0.1,
  hasta = 0.25,
  paso = 0.01,
): ResultadoProyeccion[] {
  const salida: ResultadoProyeccion[] = [];
  // Se recorre en enteros por mil para que el paso no acumule error de
  // punto flotante y termine generando 0.13000000000000003.
  const d = Math.round(desde * 1000);
  const h = Math.round(hasta * 1000);
  const p = Math.max(1, Math.round(paso * 1000));
  for (let i = d; i <= h; i += p) {
    salida.push(proyectar(supuestos, i / 1000));
  }
  return salida;
}

// ────────────────────────────────────────────────────────────────
// Reparto del presupuesto
// ────────────────────────────────────────────────────────────────

export type RepartoProducto = {
  nombre: string;
  /** Fraccion del presupuesto de ads que se lleva. */
  participacion: number;
};

export type LineaReparto = {
  nombre: string;
  participacion: number;
  presupuesto: number;
  metaFacturacion: number;
  recaudo: number;
  ingresoBruto: number;
  utilidadNeta: number;
  ventasMes: number;
};

/**
 * Reparte el presupuesto entre productos y proyecta cada uno.
 *
 * Los costos fijos se prorratean por participacion. Cargarlos completos
 * a cada linea — que es lo que hace la hoja en algunas pestañas — pinta
 * a todos los productos en perdida cuando el conjunto gana.
 */
export function repartirPorProducto(
  supuestos: SupuestosProyeccion,
  productos: RepartoProducto[],
): LineaReparto[] {
  const total = productos.reduce((acc, p) => acc + noNegativo(p.participacion), 0);
  if (total <= 0) return [];

  return productos.map((producto) => {
    // Se normaliza: si las participaciones suman 90% o 110%, el reparto
    // sigue sumando el presupuesto real y no inventa ni pierde plata.
    const peso = noNegativo(producto.participacion) / total;
    const linea = proyectar({
      ...supuestos,
      inversionPublicidad: supuestos.inversionPublicidad * peso,
      costosFijosMes: supuestos.costosFijosMes * peso,
    });

    return {
      nombre: producto.nombre,
      participacion: peso,
      presupuesto: linea.inversionPublicidad,
      metaFacturacion: linea.facturacion,
      recaudo: linea.recaudo,
      ingresoBruto: linea.ingresoBruto,
      utilidadNeta: linea.utilidadNeta,
      ventasMes: linea.ventasMes,
    };
  });
}

export type Estrategia = {
  nombre: string;
  participacion: number;
  diasInversion: number;
};

export type LineaEstrategia = {
  nombre: string;
  participacion: number;
  presupuesto: number;
  presupuestoDiario: number;
  diasInversion: number;
  ventasRequeridas: number;
};

/** El reparto por estrategia de pauta (conversiones, mensajes, remarketing, testeo). */
export function repartirPorEstrategia(
  inversionPublicidad: number,
  cppObjetivo: number,
  estrategias: Estrategia[],
): LineaEstrategia[] {
  const inversion = noNegativo(inversionPublicidad);
  const total = estrategias.reduce((acc, e) => acc + noNegativo(e.participacion), 0);
  if (total <= 0) return [];

  return estrategias.map((estrategia) => {
    const peso = noNegativo(estrategia.participacion) / total;
    const presupuesto = inversion * peso;
    const dias = positivo(estrategia.diasInversion, 30);
    return {
      nombre: estrategia.nombre,
      participacion: peso,
      presupuesto,
      presupuestoDiario: presupuesto / dias,
      diasInversion: dias,
      ventasRequeridas: cppObjetivo > 0 ? presupuesto / cppObjetivo : 0,
    };
  });
}

/** El reparto de pauta que traia la hoja, como punto de partida. */
export const ESTRATEGIAS_BASE: Estrategia[] = [
  { nombre: "Conversiones", participacion: 0.45, diasInversion: 30 },
  { nombre: "Mensajes", participacion: 0.25, diasInversion: 30 },
  { nombre: "Testeo nuevos productos", participacion: 0.2, diasInversion: 10 },
  { nombre: "Remarketing", participacion: 0.1, diasInversion: 10 },
];

// ────────────────────────────────────────────────────────────────
// Reinversion
// ────────────────────────────────────────────────────────────────

export type LineaReinversion = { nombre: string; fraccion: number; monto: number };

const REPARTO_REINVERSION: { nombre: string; fraccion: number }[] = [
  { nombre: "Producto", fraccion: 0.4 },
  { nombre: "Publicidad", fraccion: 0.3 },
  { nombre: "Conocimiento", fraccion: 0.15 },
  { nombre: "Equipo", fraccion: 0.1 },
  { nombre: "Tecnología", fraccion: 0.05 },
];

/**
 * Reparte lo que se decide reinvertir.
 *
 * Con utilidad negativa devuelve montos en cero, no negativos: "reinvertir
 * -$3M en producto" no significa nada, y la hoja original imprimia justo
 * eso en las pestañas de perdida.
 */
export function repartirReinversion(
  utilidadNeta: number,
  fraccionReinvertida = 1,
): LineaReinversion[] {
  const base = Math.max(0, utilidadNeta) * fraccion(fraccionReinvertida, 1);
  return REPARTO_REINVERSION.map((linea) => ({
    ...linea,
    monto: base * linea.fraccion,
  }));
}

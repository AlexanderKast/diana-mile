/**
 * Verifica el motor financiero contra la hoja original de BUHA.
 *
 * No es un test de "no explota": cada caso compara contra un numero que
 * ya existe en la hoja de calculo. Si una formula se toca y deja de
 * cuadrar, aqui se ve antes de que el panel muestre una utilidad que no
 * es.
 *
 *   npx tsx scripts/probar-finanzas.mts
 */

import {
  costear,
  saludCosteo,
  tieneCosto,
  costoAdminPorVenta,
  type ParametrosCosteo,
} from "../packages/shared/src/finanzas/costeo.ts";
import {
  proyectar,
  abanico,
  repartirPorProducto,
  repartirPorEstrategia,
  repartirReinversion,
  type SupuestosProyeccion,
} from "../packages/shared/src/finanzas/proyeccion.ts";
import {
  comisionPasarela,
  costoDeCobro,
  margenDesdeCostos,
  desglosarCostos,
  COSTOS_VENTA_POR_DEFECTO,
} from "../packages/shared/src/finanzas/costos-venta.ts";

let fallos = 0;
let corridos = 0;

function cerca(nombre: string, real: number, esperado: number, tolerancia = 1) {
  corridos++;
  const desvio = Math.abs(real - esperado);
  if (desvio > tolerancia) {
    fallos++;
    console.log(
      `  ✗ ${nombre}: dio ${real.toFixed(2)}, la hoja dice ${esperado.toFixed(2)} (desvío ${desvio.toFixed(2)})`,
    );
  } else {
    console.log(`  ✓ ${nombre}`);
  }
}

function afirmar(nombre: string, condicion: boolean) {
  corridos++;
  if (!condicion) {
    fallos++;
    console.log(`  ✗ ${nombre}`);
  } else {
    console.log(`  ✓ ${nombre}`);
  }
}

const PARAMS: ParametrosCosteo = {
  margenObjetivo: 0.5,
  pctPublicidad: 0.2,
  pctAdmin: 0.1,
};

// ══════════════════════════════════════════════════════════════
console.log("\n▸ Laboratorio de productos — filas reales de la hoja\n");

// [nombre, precio, costo, plataforma, logistico, utilBruta, margen, pub, admin, utilNeta, sugerido]
const FILAS: [string, number, number, number, number, number, number, number, number, number, number | null][] = [
  ["Colon Plus", 79900, 28000, 5000, 16000, 30900, 0.39, 15980, 7990, 6930, 98000],
  ["Filtro de agua", 59900, 5500, 5000, 16000, 33400, 0.56, 11980, 5990, 15430, null],
  ["Boxi Pillow", 199000, 52000, 5000, 16000, 126000, 0.63, 39800, 19900, 66300, null],
  ["Lámpara LED táctil", 99900, 36000, 5000, 16000, 42900, 0.43, 19980, 9990, 12930, 114000],
  ["Mini proyector", 250000, 149000, 5000, 16000, 80000, 0.32, 50000, 25000, 5000, 340000],
  ["Pistola hidrolavadora", 215000, 64000, 5000, 16000, 130000, 0.6, 43000, 21500, 65500, 170000],
  ["Corrector de canas", 69900, 7000, 5000, 16000, 41900, 0.6, 13980, 6990, 20930, 56000],
  ["Micrófono inalámbrico", 119900, 20000, 5000, 16000, 78900, 0.66, 23980, 11990, 42930, 82000],
  ["Cargador solar", 127000, 17000, 5000, 16000, 89000, 0.7, 25400, 12700, 50900, null],
  ["Dazzling White", 59900, 17000, 5000, 16000, 21900, 0.37, 11980, 5990, 3930, null],
];

for (const [nombre, precio, costo, plataforma, logistico, ub, mb, pub, adm, un, sug] of FILAS) {
  const c = costear(
    { precioVenta: precio, costoUnitario: costo, costoPlataforma: plataforma, costoLogistico: logistico },
    PARAMS,
  );
  console.log(` ${nombre}`);
  cerca("utilidad bruta", c.utilidadBruta, ub);
  cerca("margen bruto", c.margenBruto, mb, 0.006);
  cerca("publicidad", c.publicidad, pub);
  cerca("admin", c.admin, adm);
  cerca("utilidad neta", c.utilidadNeta, un);
  if (sug !== null) cerca("precio sugerido", c.precioSugerido, sug);
}

// ══════════════════════════════════════════════════════════════
console.log("\n▸ Producto sin costo — no puede pasar por sano\n");

const sinCosto = { precioVenta: 99900, costoUnitario: null, costoPlataforma: 5000, costoLogistico: 16000 };
const cSin = costear(sinCosto, PARAMS);
afirmar("tieneCosto() dice que no", !tieneCosto(sinCosto));
afirmar("la salud es sin_costo", saludCosteo(sinCosto, cSin) === "sin_costo");
afirmar(
  "el margen sale inflado (por eso no se puede mostrar como cierto)",
  cSin.margenBruto > 0.7,
);

console.log("\n▸ Producto que pierde plata\n");
const perdedor = { precioVenta: 60000, costoUnitario: 40000, costoPlataforma: 5000, costoLogistico: 16000 };
const cPerd = costear(perdedor, PARAMS);
afirmar("la salud es perdida", saludCosteo(perdedor, cPerd) === "perdida");
afirmar("la utilidad neta es negativa", cPerd.utilidadNeta < 0);

console.log("\n▸ Margen objetivo absurdo no genera precio infinito\n");
const cTope = costear({ ...perdedor, margenObjetivo: 1 }, PARAMS);
afirmar("el precio sugerido es finito", Number.isFinite(cTope.precioSugerido));

// ══════════════════════════════════════════════════════════════
console.log("\n▸ Proyección — pestaña de Mayo\n");

const MAYO: SupuestosProyeccion = {
  inversionPublicidad: 20_000_000,
  partPublicidad: 0.14,
  ticketPromedio: 136_300,
  margenBruto: 0.55,
  tasaDespacho: 0.8,
  tasaEntrega: 0.8,
  costosFijosMes: 3436,
};

const mayo = proyectar(MAYO);
cerca("facturación", mayo.facturacion, 142_857_143, 10);
cerca("despachados", mayo.despachado, 114_285_714, 10);
cerca("recaudo", mayo.recaudo, 91_428_571, 10);
cerca("ingreso bruto", mayo.ingresoBruto, 50_285_714, 10);
cerca("utilidad neta", mayo.utilidadNeta, 30_282_278, 10);
cerca("meta de ventas al mes", mayo.ventasMes, 1048, 1);
cerca("CPP objetivo", mayo.cppObjetivo, 19_082, 20);

console.log("\n▸ Proyección — pestaña de Junio\n");

const JUNIO: SupuestosProyeccion = {
  inversionPublicidad: 10_000_000,
  partPublicidad: 0.1,
  ticketPromedio: 101_000,
  margenBruto: 0.4,
  tasaDespacho: 0.8,
  tasaEntrega: 0.8,
  costosFijosMes: 3436,
};

const junio = proyectar(JUNIO);
cerca("facturación", junio.facturacion, 100_000_000, 10);
cerca("recaudo", junio.recaudo, 64_000_000, 10);
cerca("ingreso bruto", junio.ingresoBruto, 25_600_000, 10);
cerca("utilidad neta", junio.utilidadNeta, 15_596_564, 10);
cerca("meta de ventas al mes", junio.ventasMes, 990, 1);
cerca("CPP objetivo", junio.cppObjetivo, 10_100, 20);

// ══════════════════════════════════════════════════════════════
console.log("\n▸ Punto de equilibrio — lo que la hoja no calculaba\n");

// En el equilibrio la utilidad tiene que dar cero. Se comprueba
// proyectando exactamente las entregas que el modelo dice que hacen falta.
const eq = junio.puntoEquilibrio;
const utilidadEnEquilibrio = eq * JUNIO.ticketPromedio * JUNIO.margenBruto
  - JUNIO.inversionPublicidad - JUNIO.costosFijosMes;
cerca("en el punto de equilibrio la utilidad es cero", utilidadEnEquilibrio, 0, 1);
afirmar(
  "hacen falta menos entregas que ventas proyectadas (el mes da ganancia)",
  eq < junio.ventasMes * JUNIO.tasaDespacho * JUNIO.tasaEntrega,
);

// ══════════════════════════════════════════════════════════════
console.log("\n▸ Abanico de escenarios\n");

const esc = abanico(MAYO, 0.1, 0.2, 0.01);
afirmar("son 11 escenarios", esc.length === 11);
afirmar(
  "sin saltos de punto flotante (0.13, no 0.13000000000000003)",
  esc.every((e) => Math.abs(e.partPublicidad * 100 - Math.round(e.partPublicidad * 100)) < 1e-9),
);
afirmar(
  "menos participación de ads = más facturación",
  esc[0].facturacion > esc[esc.length - 1].facturacion,
);
afirmar(
  "menos participación de ads = más utilidad",
  esc[0].utilidadNeta > esc[esc.length - 1].utilidadNeta,
);

// ══════════════════════════════════════════════════════════════
console.log("\n▸ Reparto por producto\n");

const reparto = repartirPorProducto(MAYO, [
  { nombre: "Producto 1", participacion: 0.5 },
  { nombre: "Producto 2", participacion: 0.3 },
  { nombre: "Producto 3", participacion: 0.2 },
]);
cerca("presupuesto del producto 1", reparto[0].presupuesto, 10_000_000, 10);
cerca("meta de facturación del producto 1", reparto[0].metaFacturacion, 71_428_571, 10);
cerca("recaudo del producto 1", reparto[0].recaudo, 45_714_286, 10);
cerca(
  "los presupuestos suman el total",
  reparto.reduce((a, r) => a + r.presupuesto, 0),
  20_000_000,
  10,
);
cerca(
  "las utilidades suman la del mes",
  reparto.reduce((a, r) => a + r.utilidadNeta, 0),
  mayo.utilidadNeta,
  10,
);

console.log("\n  participaciones que no suman 100% se normalizan");
const torcido = repartirPorProducto(MAYO, [
  { nombre: "A", participacion: 0.5 },
  { nombre: "B", participacion: 0.3 },
]);
cerca(
  "sigue repartiendo el presupuesto real",
  torcido.reduce((a, r) => a + r.presupuesto, 0),
  20_000_000,
  10,
);

// ══════════════════════════════════════════════════════════════
console.log("\n▸ Reparto por estrategia\n");

const estrategias = repartirPorEstrategia(20_000_000, mayo.cppObjetivo, [
  { nombre: "Conversiones", participacion: 0.45, diasInversion: 30 },
  { nombre: "Mensajes", participacion: 0.25, diasInversion: 30 },
  { nombre: "Remarketing", participacion: 0.1, diasInversion: 10 },
  { nombre: "Testeo", participacion: 0.2, diasInversion: 10 },
]);
cerca("presupuesto de conversiones", estrategias[0].presupuesto, 9_000_000, 10);
cerca("presupuesto diario de conversiones", estrategias[0].presupuestoDiario, 300_000, 10);
cerca("presupuesto diario de remarketing", estrategias[2].presupuestoDiario, 200_000, 10);

// ══════════════════════════════════════════════════════════════
console.log("\n▸ Reinversión\n");

const rein = repartirReinversion(mayo.utilidadNeta);
cerca("producto se lleva el 40%", rein[0].monto, mayo.utilidadNeta * 0.4, 10);
cerca(
  "las líneas suman la utilidad",
  rein.reduce((a, r) => a + r.monto, 0),
  mayo.utilidadNeta,
  10,
);

console.log("\n  con pérdida no se reparten montos negativos");
const reinPerdida = repartirReinversion(-3_337_000);
afirmar("todas las líneas quedan en cero", reinPerdida.every((r) => r.monto === 0));

// ══════════════════════════════════════════════════════════════
console.log("\n▸ Costo administrativo por venta\n");

// De la tabla de la hoja: $3.436 de fijos repartidos entre las ventas
// entregadas del mes.
cerca("con 100 ventas", costoAdminPorVenta(3436, 100), 34, 1);
cerca("con 500 ventas", costoAdminPorVenta(3436, 500), 7, 1);
cerca("con 1.000 ventas", costoAdminPorVenta(3436, 1000), 3, 1);
afirmar("sin ventas no divide por cero", costoAdminPorVenta(3436, 0) === 0);

// ══════════════════════════════════════════════════════════════
console.log("\n▸ Comisión de pasarela (anticipado)\n");

// 100.000 al 2,99% + 900 fijo = 3.890; +19% de IVA sobre la comision = 4.629,1
const PAS = { pasarelaPct: 0.0299, pasarelaFijo: 900, ivaComision: 0.19 };
cerca("100.000 por pasarela", comisionPasarela(100_000, PAS), 4629.1, 0.5);
afirmar("monto cero no cobra el fijo", comisionPasarela(0, PAS) === 0);

console.log("\n▸ Costo de cobro segun la mezcla de pagos\n");

const PARAMS_VENTA = { ...COSTOS_VENTA_POR_DEFECTO };
const soloCod = costoDeCobro(100_000, PARAMS_VENTA, 0);
const soloAnticipado = costoDeCobro(100_000, PARAMS_VENTA, 1);
cerca("todo COD = comision de recaudo", soloCod, 3000, 1);
cerca("todo anticipado = comision de pasarela", soloAnticipado, 4629.1, 0.5);
cerca(
  "mitad y mitad promedia las dos",
  costoDeCobro(100_000, PARAMS_VENTA, 0.5),
  (soloCod + soloAnticipado) / 2,
  0.5,
);
afirmar(
  "mas anticipado cambia el margen derivado",
  margenDesdeCostos(150_000, 60_000, PARAMS_VENTA, 1) !==
    margenDesdeCostos(150_000, 60_000, PARAMS_VENTA, 0),
);

console.log("\n▸ Devoluciones en la proyeccion\n");

// Sin fletes de devolucion el modelo queda identico a la hoja (ya
// verificado arriba). Con fletes, la utilidad baja exactamente en
// devoluciones x (ida + vuelta).
const CON_DEV: SupuestosProyeccion = { ...JUNIO, fleteIda: 16_000, fleteDevolucion: 16_000 };
const sinDev = proyectar(JUNIO);
const conDev = proyectar(CON_DEV);
cerca(
  "devoluciones del mes = despachadas x (1 - entrega)",
  conDev.devolucionesMes,
  sinDev.ventasMes * 0.8 * 0.2,
  0.5,
);
cerca(
  "la utilidad baja exactamente el costo de las devoluciones",
  sinDev.utilidadNeta - conDev.utilidadNeta,
  conDev.devolucionesMes * 32_000,
  1,
);
afirmar(
  "el punto de equilibrio sube al cargar las devoluciones",
  conDev.puntoEquilibrio > sinDev.puntoEquilibrio,
);

// En el equilibrio con devoluciones la utilidad tambien da cero.
const eqDev = conDev.puntoEquilibrio;
const utilidadEqDev =
  eqDev * JUNIO.ticketPromedio * JUNIO.margenBruto -
  eqDev * (0.2 / 0.8) * 32_000 -
  JUNIO.inversionPublicidad -
  JUNIO.costosFijosMes;
cerca("en el nuevo equilibrio la utilidad es cero", utilidadEqDev, 0, 1);

console.log("\n▸ Desglose con devolucion\n");

const devuelto = desglosarCostos({
  costoProductoUnitario: 30_000,
  cantidad: 1,
  costoEnvio: 16_000,
  costoPlataforma: 5_000,
  costoFulfillment: 2_000,
  costoRecaudo: null,
  costoDevolucion: 16_000,
});
cerca("el total incluye el flete de vuelta", devuelto.total, 69_000, 1);
afirmar(
  "la devolucion no marca el pedido como incompleto",
  !devuelto.faltantes.includes("devolución"),
);

console.log(
  `\n${"─".repeat(60)}\n${corridos - fallos}/${corridos} comprobaciones pasaron` +
    (fallos > 0 ? `  ·  ${fallos} FALLARON\n` : "\n"),
);

process.exit(fallos > 0 ? 1 : 0);

import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import { calcularCosteoCatalogo } from "@/lib/costeo";
import type { SupuestosProyeccion } from "@diana-mile/shared/finanzas/proyeccion";
import { leerParametrosCostosVenta } from "@diana-mile/shared/finanzas/costo-pedido";
import {
  desglosarCostos,
  type ParametrosCostosVenta,
} from "@diana-mile/shared/finanzas/costos-venta";
import {
  montoEnCop,
  hoyISO,
  type CostoFijoConvertible,
} from "@diana-mile/shared/finanzas/trm";
import { periodoActual } from "@/lib/financiero";

/**
 * Supuestos de la proyeccion sacados de lo que YA paso.
 *
 * La hoja original traia las tasas escritas a mano (80%, 88%) y nunca se
 * actualizaban, asi que la proyeccion iba derivando de la realidad sin
 * que nadie se enterara. Aqui cada supuesto se mide contra los pedidos
 * reales y se dice de donde salio y con cuantos datos.
 *
 * Cuando no hay historia suficiente se cae a un valor conservador y se
 * marca como estimado. Un supuesto flojo presentado como medido es peor
 * que no tener proyeccion.
 */

/** Bajo esto, el promedio es ruido y no vale la pena presentarlo como medido. */
const MINIMO_PARA_MEDIR = 20;
const DIAS_HISTORIA = 90;

export type Origen = "medido" | "estimado";

export type Supuesto<T = number> = {
  valor: T;
  origen: Origen;
  /** Sobre cuantos pedidos se midio. */
  muestra: number;
  nota: string;
};

export type PedidoCosteado = {
  estado: string;
  precio_total: number | null;
  valor_recaudado: number | null;
  costo_producto: number | null;
  cantidad: number | null;
  costo_envio: number | null;
  costo_plataforma: number | null;
  costo_fulfillment: number | null;
  costo_recaudo: number | null;
};

export type SupuestosSugeridos = {
  ticketPromedio: Supuesto;
  tasaDespacho: Supuesto;
  tasaEntrega: Supuesto;
  margenBruto: Supuesto;
  /** Costo de mercancia por pedido. El margen se deriva de el y de los accesorios. */
  costoMercancia: Supuesto;
  /** Envio, plataforma, fulfillment y % de recaudo, como estan configurados. */
  parametrosCosto: ParametrosCostosVenta;
  costosFijosMes: Supuesto;
  inversionPublicidadSugerida: number;
};

const CONSERVADOR = {
  ticketPromedio: 150_000,
  tasaDespacho: 0.8,
  tasaEntrega: 0.8,
  margenBruto: 0.4,
};

export async function leerSupuestos(): Promise<SupuestosSugeridos> {
  const supabase = createAdminSupabaseClient();
  const desde = new Date(
    Date.now() - DIAS_HISTORIA * 24 * 60 * 60 * 1000,
  ).toISOString();

  const [pedidosRes, fijosRes, gastosRes] = await Promise.all([
    supabase
      .from("pedidos")
      .select(
        "estado, precio_total, valor_recaudado, costo_producto, cantidad, costo_envio, costo_plataforma, costo_fulfillment, costo_recaudo",
      )
      .gte("created_at", desde),
    supabase
      .from("costos_fijos")
      .select(
        "monto_cop, monto_cop_real, monto_origen, moneda, dia_cobro, vigente_desde, vigente_hasta",
      ),
    supabase
      .from("gastos")
      .select("tipo, monto_cop")
      .gte("fecha", desde.slice(0, 10)),
  ]);

  const pedidos = (pedidosRes.data ?? []) as PedidoCosteado[];
  const parametrosCosto = await leerParametrosCostosVenta();

  return {
    ticketPromedio: medirTicket(pedidos),
    tasaDespacho: medirDespacho(pedidos),
    tasaEntrega: medirEntrega(pedidos),
    margenBruto: await medirMargen(pedidos, parametrosCosto),
    costoMercancia: medirCostoMercancia(pedidos, parametrosCosto),
    parametrosCosto,
    costosFijosMes: await sumarFijos(fijosRes.data ?? []),
    inversionPublicidadSugerida: sugerirInversion(gastosRes.data ?? []),
  };
}

function medirTicket(
  pedidos: { precio_total: number | null }[],
): Supuesto {
  const validos = pedidos
    .map((p) => Number(p.precio_total))
    .filter((n) => Number.isFinite(n) && n > 0);

  if (validos.length < MINIMO_PARA_MEDIR) {
    return {
      valor: CONSERVADOR.ticketPromedio,
      origen: "estimado",
      muestra: validos.length,
      nota: `Solo hay ${validos.length} pedidos con valor en los últimos ${DIAS_HISTORIA} días. Se usa un ticket conservador.`,
    };
  }

  const promedio = validos.reduce((a, b) => a + b, 0) / validos.length;
  return {
    valor: promedio,
    origen: "medido",
    muestra: validos.length,
    nota: `Promedio real de ${validos.length} pedidos de los últimos ${DIAS_HISTORIA} días.`,
  };
}

/**
 * De lo que se pidio, cuanto llego a salir. Los pedidos que todavia
 * estan pendientes o confirmados no cuentan en ningun lado del cociente:
 * no se sabe aun si van a despacharse, y meterlos como fracaso hundiria
 * la tasa solo por ser recientes.
 */
function medirDespacho(pedidos: { estado: string }[]): Supuesto {
  const RESUELTOS = ["enviado", "entregado", "devuelto", "cancelado", "fraude"];
  const DESPACHADOS = ["enviado", "entregado", "devuelto"];

  const resueltos = pedidos.filter((p) => RESUELTOS.includes(p.estado));
  const despachados = resueltos.filter((p) => DESPACHADOS.includes(p.estado));

  if (resueltos.length < MINIMO_PARA_MEDIR) {
    return {
      valor: CONSERVADOR.tasaDespacho,
      origen: "estimado",
      muestra: resueltos.length,
      nota: `Solo ${resueltos.length} pedidos han llegado a un desenlace. Se usa 80%.`,
    };
  }

  return {
    valor: despachados.length / resueltos.length,
    origen: "medido",
    muestra: resueltos.length,
    nota: `${despachados.length} de ${resueltos.length} pedidos resueltos alcanzaron a despacharse.`,
  };
}

/** De lo que salio, cuanto se entrego y se cobro. */
function medirEntrega(pedidos: { estado: string }[]): Supuesto {
  const entregados = pedidos.filter((p) => p.estado === "entregado").length;
  const devueltos = pedidos.filter((p) => p.estado === "devuelto").length;
  const base = entregados + devueltos;

  if (base < MINIMO_PARA_MEDIR) {
    return {
      valor: CONSERVADOR.tasaEntrega,
      origen: "estimado",
      muestra: base,
      nota: `Solo ${base} pedidos despachados tienen desenlace. Se usa 80%.`,
    };
  }

  return {
    valor: entregados / base,
    origen: "medido",
    muestra: base,
    nota: `${entregados} entregados de ${base} despachados con desenlace.`,
  };
}

/**
 * Margen sobre lo recaudado.
 *
 * Se mide contra pedidos entregados QUE TENGAN COSTO. Si ninguno lo
 * tiene — que es la situacion de arranque — no se inventa un margen a
 * partir de ingresos sin costos, porque daria ~100%: se cae al margen
 * promedio del catalogo costeado, y si tampoco hay, a un valor
 * conservador.
 */
async function medirMargen(
  pedidos: PedidoCosteado[],
  parametros: ParametrosCostosVenta,
): Promise<Supuesto> {
  const conCosto = pedidos.filter(
    (p) =>
      p.estado === "entregado" &&
      p.costo_producto !== null &&
      Number(p.valor_recaudado) > 0,
  );

  if (conCosto.length >= MINIMO_PARA_MEDIR) {
    const recaudo = conCosto.reduce((a, p) => a + Number(p.valor_recaudado), 0);
    // Mismo desglose que usa el panel para lo real: mercancia, envio,
    // plataforma, fulfillment y comision de recaudo. Medir el margen solo
    // con mercancia y flete —como se hacia— lo deja alto por todo lo demas.
    const costos = conCosto.reduce((a, p) => a + desglose(p).total, 0);
    return {
      valor: recaudo > 0 ? (recaudo - costos) / recaudo : CONSERVADOR.margenBruto,
      origen: "medido",
      muestra: conCosto.length,
      nota: `Margen real de ${conCosto.length} pedidos entregados, con todos los costos de venta.`,
    };
  }

  // Sin historia de ventas costeadas, se usa el catalogo.
  try {
    const catalogo = await calcularCosteoCatalogo();
    if (catalogo.margenBrutoPromedio !== null) {
      const costeadas = catalogo.total - catalogo.sinCosto;
      return {
        valor: catalogo.margenBrutoPromedio,
        origen: "estimado",
        muestra: costeadas,
        nota:
          `Todavía no hay ${MINIMO_PARA_MEDIR} pedidos entregados con costo. ` +
          `Se usa el margen promedio de las ${costeadas} variantes ya costeadas.`,
      };
    }
  } catch {
    // El catalogo no es indispensable para proyectar.
  }

  return {
    valor: CONSERVADOR.margenBruto,
    origen: "estimado",
    muestra: 0,
    nota: "No hay productos costeados ni pedidos con costo. Se usa 40%, que es conservador.",
  };
}

function desglose(p: PedidoCosteado) {
  return desglosarCostos({
    costoProductoUnitario: p.costo_producto,
    cantidad: p.cantidad ?? 1,
    costoEnvio: p.costo_envio,
    costoPlataforma: p.costo_plataforma,
    costoFulfillment: p.costo_fulfillment,
    costoRecaudo: p.costo_recaudo,
  });
}

/**
 * Cuanto cuesta la mercancia de un pedido promedio.
 *
 * Se mide solo sobre pedidos que SI tienen costo. Meter los que no lo
 * tienen como si costaran cero bajaria el promedio y haria parecer el
 * negocio mas rentable justo por la falta de datos.
 */
function medirCostoMercancia(
  pedidos: PedidoCosteado[],
  parametros: ParametrosCostosVenta,
): Supuesto {
  const conCosto = pedidos.filter((p) => p.costo_producto !== null);

  if (conCosto.length >= MINIMO_PARA_MEDIR) {
    const total = conCosto.reduce((a, p) => a + desglose(p).mercancia, 0);
    return {
      valor: total / conCosto.length,
      origen: "medido",
      muestra: conCosto.length,
      nota: `Promedio de ${conCosto.length} pedidos con costo de mercancía cargado.`,
    };
  }

  // Sin historia, se estima como el complemento: lo que queda del ticket
  // conservador despues de los costos accesorios y un margen del 40%.
  const ticket = CONSERVADOR.ticketPromedio;
  const accesorios =
    parametros.costoLogistico +
    parametros.costoPlataforma +
    parametros.costoFulfillment +
    ticket * parametros.pctRecaudo;
  const estimado = Math.max(0, ticket * (1 - CONSERVADOR.margenBruto) - accesorios);

  return {
    valor: estimado,
    origen: "estimado",
    muestra: conCosto.length,
    nota:
      `Solo ${conCosto.length} pedidos tienen costo de mercancía cargado. ` +
      `Se estima a partir de un margen del ${CONSERVADOR.margenBruto * 100}%.`,
  };
}

type FilaFija = CostoFijoConvertible & {
  vigente_desde: string;
  vigente_hasta: string | null;
};

/**
 * Suma los costos fijos vigentes, convirtiendo los que estan en dolares.
 *
 * Se convierte con la TRM del dia de cobro de ESTE mes, no con el valor
 * en pesos guardado: ese quedo fijado el dia que se registro el costo, y
 * con el dolar moviendose la proyeccion arrancaria con un numero viejo.
 */
async function sumarFijos(filas: FilaFija[]): Promise<Supuesto> {
  const hoy = hoyISO();
  const periodo = periodoActual();
  const vigentes = filas.filter(
    (f) => f.vigente_desde <= hoy && (f.vigente_hasta === null || f.vigente_hasta >= hoy),
  );

  const montos = await Promise.all(
    vigentes.map((f) => montoEnCop(f, periodo)),
  );
  const total = montos.reduce((a, m) => a + m.cop, 0);
  const enDolares = vigentes.filter((f) => f.moneda === "USD").length;

  return {
    valor: total,
    origen: vigentes.length > 0 ? "medido" : "estimado",
    muestra: vigentes.length,
    nota:
      vigentes.length > 0
        ? `Suma de ${vigentes.length} costos fijos activos` +
          (enDolares > 0
            ? `, ${enDolares} convertidos de dólares con la TRM del mes.`
            : ".")
        : "No hay costos fijos registrados. La proyección asume que operar no cuesta nada.",
  };
}

/** Lo que se viene gastando en pauta al mes, como punto de partida. */
function sugerirInversion(gastos: { tipo: string; monto_cop: number | string }[]): number {
  const publicidad = gastos
    .filter((g) => g.tipo?.startsWith("publicidad_"))
    .reduce((a, g) => a + Number(g.monto_cop), 0);

  const meses = DIAS_HISTORIA / 30;
  const mensual = publicidad / meses;
  return mensual > 0 ? Math.round(mensual) : 1_000_000;
}

/** Los supuestos como los espera el motor. */
export function aSupuestos(
  sugeridos: SupuestosSugeridos,
  partPublicidad: number,
): SupuestosProyeccion {
  return {
    inversionPublicidad: sugeridos.inversionPublicidadSugerida,
    partPublicidad,
    ticketPromedio: sugeridos.ticketPromedio.valor,
    margenBruto: sugeridos.margenBruto.valor,
    tasaDespacho: sugeridos.tasaDespacho.valor,
    tasaEntrega: sugeridos.tasaEntrega.valor,
    costosFijosMes: sugeridos.costosFijosMes.valor,
  };
}

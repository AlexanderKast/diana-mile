import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import { calcularCosteoCatalogo } from "@/lib/costeo";
import type { SupuestosProyeccion } from "@diana-mile/shared/finanzas/proyeccion";

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

export type SupuestosSugeridos = {
  ticketPromedio: Supuesto;
  tasaDespacho: Supuesto;
  tasaEntrega: Supuesto;
  margenBruto: Supuesto;
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
      .select("estado, precio_total, valor_recaudado, costo_producto, cantidad, costo_envio")
      .gte("created_at", desde),
    supabase
      .from("costos_fijos")
      .select("monto_cop, vigente_desde, vigente_hasta"),
    supabase
      .from("gastos")
      .select("tipo, monto_cop")
      .gte("fecha", desde.slice(0, 10)),
  ]);

  const pedidos = (pedidosRes.data ?? []) as {
    estado: string;
    precio_total: number | null;
    valor_recaudado: number | null;
    costo_producto: number | null;
    cantidad: number | null;
    costo_envio: number | null;
  }[];

  return {
    ticketPromedio: medirTicket(pedidos),
    tasaDespacho: medirDespacho(pedidos),
    tasaEntrega: medirEntrega(pedidos),
    margenBruto: await medirMargen(pedidos),
    costosFijosMes: sumarFijos(fijosRes.data ?? []),
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
  pedidos: {
    estado: string;
    valor_recaudado: number | null;
    costo_producto: number | null;
    cantidad: number | null;
    costo_envio: number | null;
  }[],
): Promise<Supuesto> {
  const conCosto = pedidos.filter(
    (p) =>
      p.estado === "entregado" &&
      p.costo_producto !== null &&
      Number(p.valor_recaudado) > 0,
  );

  if (conCosto.length >= MINIMO_PARA_MEDIR) {
    const recaudo = conCosto.reduce((a, p) => a + Number(p.valor_recaudado), 0);
    const costos = conCosto.reduce(
      (a, p) =>
        a +
        Number(p.costo_producto) * (Number(p.cantidad) || 1) +
        (Number(p.costo_envio) || 0),
      0,
    );
    return {
      valor: recaudo > 0 ? (recaudo - costos) / recaudo : CONSERVADOR.margenBruto,
      origen: "medido",
      muestra: conCosto.length,
      nota: `Margen real de ${conCosto.length} pedidos entregados con costo cargado.`,
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

function sumarFijos(
  filas: { monto_cop: number | string; vigente_desde: string; vigente_hasta: string | null }[],
): Supuesto {
  const hoy = new Date().toISOString().slice(0, 10);
  const vigentes = filas.filter(
    (f) => f.vigente_desde <= hoy && (f.vigente_hasta === null || f.vigente_hasta >= hoy),
  );
  const total = vigentes.reduce((a, f) => a + Number(f.monto_cop), 0);

  return {
    valor: total,
    origen: vigentes.length > 0 ? "medido" : "estimado",
    muestra: vigentes.length,
    nota:
      vigentes.length > 0
        ? `Suma de ${vigentes.length} costos fijos activos.`
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

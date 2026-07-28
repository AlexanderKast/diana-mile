import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import type { MetricasFinancieras } from "@diana-mile/shared/types";
import { desglosarCostos } from "@diana-mile/shared/finanzas/costos-venta";

/**
 * Devuelve el periodo actual en formato 'YYYY-MM'.
 */
export function periodoActual(): string {
  const ahora = new Date();
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  return `${anio}-${mes}`;
}

function limitesDelMes(periodo: string): { desde: string; hasta: string } {
  const [anioStr, mesStr] = periodo.split("-");
  const anio = Number(anioStr);
  const mes = Number(mesStr);
  const desde = new Date(Date.UTC(anio, mes - 1, 1, 0, 0, 0));
  const hasta = new Date(Date.UTC(anio, mes, 1, 0, 0, 0));
  return { desde: desde.toISOString(), hasta: hasta.toISOString() };
}

function porcentaje(numerador: number, denominador: number): number {
  return denominador > 0 ? (numerador / denominador) * 100 : 0;
}

/**
 * Calcula las metricas financieras de un periodo calendario ('YYYY-MM').
 * Usada tanto por app/api/admin/financiero/route.ts como por
 * app/dashboard/financiero/page.tsx para no duplicar la logica de calculo.
 */
export async function calcularMetricas(periodo?: string): Promise<MetricasFinancieras> {
  const periodoFinal = periodo ?? periodoActual();
  const { desde, hasta } = limitesDelMes(periodoFinal);

  const supabase = createAdminSupabaseClient();

  const [pedidosRes, gastosRes, ivaRes] = await Promise.all([
    supabase
      .from("pedidos")
      .select(
        "estado, precio_total, valor_recaudado, costo_producto, cantidad, costo_envio, costo_plataforma, costo_fulfillment, costo_recaudo, costo_devolucion, metodo_pago, fecha_consignacion"
      )
      .gte("created_at", desde)
      .lt("created_at", hasta),
    supabase.from("gastos").select("tipo, monto_cop").eq("periodo", periodoFinal),
    supabase.from("config").select("valor").eq("clave", "fin_iva_tarifa").maybeSingle(),
  ]);

  const pedidos = pedidosRes.data ?? [];
  const gastos = gastosRes.data ?? [];

  const total_pedidos = pedidos.length;
  const pedidos_confirmados = pedidos.filter(
    (p) => p.estado !== "pendiente" && p.estado !== "cancelado" && p.estado !== "fraude"
  ).length;
  const pedidos_entregados = pedidos.filter((p) => p.estado === "entregado").length;
  const pedidos_devueltos = pedidos.filter((p) => p.estado === "devuelto").length;
  const pedidos_cancelados = pedidos.filter(
    (p) => p.estado === "cancelado" || p.estado === "fraude"
  ).length;

  const tasa_confirmacion = porcentaje(pedidos_confirmados, total_pedidos);
  const tasa_entrega = porcentaje(pedidos_entregados, pedidos_confirmados);
  const tasa_devolucion = porcentaje(
    pedidos_devueltos,
    pedidos_entregados + pedidos_devueltos
  );

  const ingresos_brutos = pedidos.reduce((acc, p) => acc + (p.precio_total ?? 0), 0);
  const ingresos_recaudados = pedidos
    .filter((p) => p.estado === "entregado")
    .reduce((acc, p) => acc + (p.valor_recaudado ?? 0), 0);
  // Los costos de venta se desglosan con la misma funcion que usa la
  // proyeccion. Sumarlos aparte en cada sitio termina en que el panel y
  // la proyeccion dicen cosas distintas del mismo mes y no hay forma de
  // saber cual esta mal.
  const desgloses = pedidos.map((p) =>
    desglosarCostos({
      costoProductoUnitario: p.costo_producto,
      cantidad: p.cantidad ?? 1,
      costoEnvio: p.costo_envio,
      costoPlataforma: p.costo_plataforma,
      costoFulfillment: p.costo_fulfillment,
      costoRecaudo: p.costo_recaudo,
      costoDevolucion: p.costo_devolucion,
    })
  );

  const sumar = (
    campo: "mercancia" | "envio" | "plataforma" | "fulfillment" | "recaudo" | "devolucion",
  ) => desgloses.reduce((acc, d) => acc + d[campo], 0);

  const costo_productos = sumar("mercancia");
  const costo_envios = sumar("envio");
  const costo_plataforma = sumar("plataforma");
  const costo_fulfillment = sumar("fulfillment");
  const costo_recaudo = sumar("recaudo");
  const costo_devoluciones = sumar("devolucion");

  const pedidos_anticipados = pedidos.filter(
    (p) => p.metodo_pago === "anticipado",
  ).length;

  // Recaudo que la transportadora ya cobro pero no ha consignado. Es
  // plata del negocio en manos de un tercero: mientras no se marque la
  // consignacion, aqui se ve cuanta es. Una guia recaudada que nunca se
  // consigna es la fuga clasica de contraentrega.
  const efectivo_sin_consignar = pedidos
    .filter((p) => p.estado === "entregado" && !p.fecha_consignacion)
    .reduce((acc, p) => acc + (p.valor_recaudado ?? 0), 0);

  // IVA implicito en lo recaudado. Los precios lo traen adentro: al
  // legalizarse, esta fraccion no es utilidad sino impuesto por
  // responder. Medirlo desde ya evita que ese dia el negocio "pierda"
  // 16 puntos de golpe.
  const tarifaIvaRaw = Number(ivaRes.data?.valor);
  const tarifaIva =
    Number.isFinite(tarifaIvaRaw) && tarifaIvaRaw >= 0 && tarifaIvaRaw < 1
      ? tarifaIvaRaw
      : 0.19;
  const iva_implicito = ingresos_recaudados * (tarifaIva / (1 + tarifaIva));

  // Cuantos pedidos tienen algun costo sin registrar. Mientras haya
  // aunque sea uno, la utilidad de abajo es un TECHO: el costo real es
  // ese o mas alto. El panel la mostraba sin esta advertencia, y por eso
  // ensenaba margenes que no existian.
  const pedidos_sin_costear = desgloses.filter((d) => d.incompleto).length;

  const gasto_publicidad = gastos
    .filter((g) => g.tipo?.startsWith("publicidad_"))
    .reduce((acc, g) => acc + (g.monto_cop ?? 0), 0);
  const otros_gastos = gastos
    .filter((g) => !g.tipo?.startsWith("publicidad_"))
    .reduce((acc, g) => acc + (g.monto_cop ?? 0), 0);

  const utilidad_bruta =
    ingresos_recaudados -
    costo_productos -
    costo_envios -
    costo_plataforma -
    costo_fulfillment -
    costo_recaudo -
    costo_devoluciones;
  const utilidad_neta = utilidad_bruta - gasto_publicidad - otros_gastos;
  const margen_neto = porcentaje(utilidad_neta, ingresos_recaudados);

  const ticket_promedio = total_pedidos > 0 ? ingresos_brutos / total_pedidos : 0;
  const costo_por_pedido =
    total_pedidos > 0 ? (gasto_publicidad + otros_gastos) / total_pedidos : 0;
  const roas = gasto_publicidad > 0 ? ingresos_recaudados / gasto_publicidad : null;

  return {
    periodo: periodoFinal,
    total_pedidos,
    pedidos_confirmados,
    pedidos_entregados,
    pedidos_devueltos,
    pedidos_cancelados,
    tasa_confirmacion,
    tasa_entrega,
    tasa_devolucion,
    ingresos_brutos,
    ingresos_recaudados,
    costo_productos,
    costo_envios,
    costo_plataforma,
    costo_fulfillment,
    costo_recaudo,
    costo_devoluciones,
    pedidos_sin_costear,
    pedidos_anticipados,
    efectivo_sin_consignar,
    iva_implicito,
    gasto_publicidad,
    otros_gastos,
    utilidad_bruta,
    utilidad_neta,
    margen_neto,
    ticket_promedio,
    costo_por_pedido,
    roas,
  };
}

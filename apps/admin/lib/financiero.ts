import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import type { MetricasFinancieras } from "@diana-mile/shared/types";

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

  const [pedidosRes, gastosRes] = await Promise.all([
    supabase
      .from("pedidos")
      .select(
        "estado, precio_total, valor_recaudado, costo_producto, cantidad, costo_envio"
      )
      .gte("created_at", desde)
      .lt("created_at", hasta),
    supabase.from("gastos").select("tipo, monto_cop").eq("periodo", periodoFinal),
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
  const costo_productos = pedidos.reduce(
    (acc, p) => acc + (p.costo_producto ?? 0) * (p.cantidad ?? 0),
    0
  );
  const costo_envios = pedidos.reduce((acc, p) => acc + (p.costo_envio ?? 0), 0);

  const gasto_publicidad = gastos
    .filter((g) => g.tipo?.startsWith("publicidad_"))
    .reduce((acc, g) => acc + (g.monto_cop ?? 0), 0);
  const otros_gastos = gastos
    .filter((g) => !g.tipo?.startsWith("publicidad_"))
    .reduce((acc, g) => acc + (g.monto_cop ?? 0), 0);

  const utilidad_bruta = ingresos_recaudados - costo_productos - costo_envios;
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

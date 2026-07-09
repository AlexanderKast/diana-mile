import type { RendimientoTransportadora } from "@diana-mile/shared/types";

export type PedidoParaRendimiento = {
  transportadora: string | null;
  estado: string | null;
  costo_envio: number | null;
  fecha_envio: string | null;
  fecha_entrega_real: string | null;
};

/**
 * Agrupa pedidos por transportadora y calcula sus metricas de rendimiento.
 * Ordena el resultado por tasa_entrega descendente.
 */
export function calcularRendimiento(
  pedidos: PedidoParaRendimiento[]
): RendimientoTransportadora[] {
  const grupos = new Map<string, PedidoParaRendimiento[]>();

  for (const pedido of pedidos) {
    if (!pedido.transportadora) continue;
    const lista = grupos.get(pedido.transportadora) ?? [];
    lista.push(pedido);
    grupos.set(pedido.transportadora, lista);
  }

  const resultado: RendimientoTransportadora[] = [];

  for (const [transportadora, lista] of grupos.entries()) {
    const total_envios = lista.length;
    const entregados = lista.filter((p) => p.estado === "entregado").length;
    const devueltos = lista.filter((p) => p.estado === "devuelto").length;
    const en_transito = lista.filter((p) => p.estado === "enviado").length;
    const tasa_entrega = total_envios > 0 ? (entregados / total_envios) * 100 : 0;

    const costos = lista
      .map((p) => p.costo_envio)
      .filter((c): c is number => c !== null && c !== undefined);
    const costo_promedio =
      costos.length > 0 ? costos.reduce((a, b) => a + b, 0) / costos.length : 0;

    const diasEntrega: number[] = [];
    for (const p of lista) {
      if (p.fecha_envio && p.fecha_entrega_real) {
        const envio = new Date(p.fecha_envio).getTime();
        const entrega = new Date(p.fecha_entrega_real).getTime();
        if (!Number.isNaN(envio) && !Number.isNaN(entrega) && entrega >= envio) {
          diasEntrega.push((entrega - envio) / (1000 * 60 * 60 * 24));
        }
      }
    }
    const dias_promedio_entrega =
      diasEntrega.length > 0
        ? diasEntrega.reduce((a, b) => a + b, 0) / diasEntrega.length
        : null;

    resultado.push({
      transportadora,
      total_envios,
      entregados,
      devueltos,
      en_transito,
      tasa_entrega,
      costo_promedio,
      dias_promedio_entrega,
    });
  }

  resultado.sort((a, b) => b.tasa_entrega - a.tasa_entrega);

  return resultado;
}

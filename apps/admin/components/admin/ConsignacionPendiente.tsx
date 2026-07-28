"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCOP } from "@diana-mile/shared/utils";
import type { Pedido } from "@diana-mile/shared/types";

/**
 * Recaudo que la transportadora ya cobró y todavía no consigna.
 *
 * Es plata del negocio en manos de un tercero. La lista existe para dos
 * cosas: saber CUÁNTA es, y detectar la guía que se quedó sin consignar
 * — que a los 30 días ya nadie reclama. Marcar es un clic porque un
 * proceso de conciliación de más pasos no se hace.
 */
export function ConsignacionPendiente({ pedidos }: { pedidos: Pedido[] }) {
  const router = useRouter();
  const [marcando, setMarcando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (pedidos.length === 0) return null;

  const total = pedidos.reduce((acc, p) => acc + (p.valor_recaudado ?? 0), 0);

  async function marcar(id: string) {
    setMarcando(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/pedidos/${id}/consignacion`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consignado: true }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "No se pudo marcar.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo marcar.");
    } finally {
      setMarcando(null);
    }
  }

  function diasDesde(fecha: string | null): number {
    if (!fecha) return 0;
    return Math.floor((Date.now() - new Date(fecha).getTime()) / 86_400_000);
  }

  return (
    <div className="mt-8">
      <div className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
        <h2 className="font-display text-xl text-carbon">Recaudo por consignar</h2>
        <span className="text-sm text-carbon-suave">
          {pedidos.length} {pedidos.length === 1 ? "pedido" : "pedidos"} ·{" "}
          <strong className="text-carbon">{formatCOP(total)}</strong> en manos de la
          transportadora
        </span>
      </div>

      {error && <p className="text-xs text-error mb-3">{error}</p>}

      <div className="overflow-x-auto bg-blanco border border-arena rounded-[4px]">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-arena text-left">
              <th className="p-3 text-xs uppercase tracking-wide text-ceniza font-normal">
                Pedido
              </th>
              <th className="p-3 text-xs uppercase tracking-wide text-ceniza font-normal">
                Transportadora
              </th>
              <th className="p-3 text-xs uppercase tracking-wide text-ceniza font-normal">
                Entregado
              </th>
              <th className="p-3 text-xs uppercase tracking-wide text-ceniza font-normal text-right">
                Recaudado
              </th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {pedidos.map((pedido) => {
              const dias = diasDesde(pedido.fecha_entrega_real);
              return (
                <tr key={pedido.id} className="border-b border-arena/60 last:border-0">
                  <td className="p-3">
                    <p className="text-carbon">
                      {pedido.shopify_order_number ?? pedido.nombre}
                    </p>
                    <p className="text-xs text-ceniza">{pedido.nombre}</p>
                  </td>
                  <td className="p-3 text-carbon-suave">
                    {pedido.transportadora ?? "—"}
                    {pedido.numero_guia && (
                      <span className="block text-xs text-ceniza">
                        guía {pedido.numero_guia}
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={dias > 15 ? "text-error" : "text-carbon-suave"}>
                      hace {dias} {dias === 1 ? "día" : "días"}
                    </span>
                  </td>
                  <td className="p-3 text-right text-carbon whitespace-nowrap">
                    {formatCOP(pedido.valor_recaudado ?? 0)}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => void marcar(pedido.id)}
                      disabled={marcando === pedido.id}
                      className="px-3 py-1.5 text-xs font-semibold bg-carbon text-blanco rounded-[4px] hover:bg-carbon/90 transition-colors disabled:opacity-50"
                    >
                      {marcando === pedido.id ? "…" : "Consignado"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

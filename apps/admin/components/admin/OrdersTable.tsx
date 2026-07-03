"use client";

import { Fragment, useMemo, useState } from "react";
import { cx, formatCOP } from "@diana-mile/shared/utils";
import { Button } from "@diana-mile/shared/ui/Button";
import type { EstadoPedido, Pedido } from "@diana-mile/shared/types";

type OrdersTableProps = {
  pedidos: Pedido[];
};

const ESTADOS: { value: EstadoPedido | "todos"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "pendiente", label: "Pendiente" },
  { value: "confirmado", label: "Confirmado" },
  { value: "enviado", label: "Enviado" },
  { value: "entregado", label: "Entregado" },
  { value: "devuelto", label: "Devuelto" },
];

const ESTADO_LABELS: Record<EstadoPedido, string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  enviado: "Enviado",
  entregado: "Entregado",
  devuelto: "Devuelto",
};

const PAGE_SIZE = 25;

function estadoBadgeClass(estado: EstadoPedido): string {
  switch (estado) {
    case "pendiente":
      return "bg-arena text-carbon";
    case "confirmado":
      return "bg-dorado/20 text-dorado-oscuro";
    case "enviado":
    case "entregado":
      return "bg-carbon/10 text-carbon";
    case "devuelto":
      return "bg-error/10 text-error";
    default:
      return "bg-arena text-carbon";
  }
}

function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO");
}

export default function OrdersTable({ pedidos }: OrdersTableProps) {
  const [filtroEstado, setFiltroEstado] = useState<EstadoPedido | "todos">("todos");
  const [filaAbierta, setFilaAbierta] = useState<string | null>(null);
  const [pagina, setPagina] = useState(1);
  const [pedidosLocal, setPedidosLocal] = useState<Pedido[]>(pedidos);
  const [actualizandoId, setActualizandoId] = useState<string | null>(null);
  const [errorEstadoId, setErrorEstadoId] = useState<string | null>(null);

  const pedidosFiltrados = useMemo(() => {
    if (filtroEstado === "todos") return pedidosLocal;
    return pedidosLocal.filter((pedido) => pedido.estado === filtroEstado);
  }, [pedidosLocal, filtroEstado]);

  const totalPaginas = Math.max(1, Math.ceil(pedidosFiltrados.length / PAGE_SIZE));
  const paginaActual = Math.min(pagina, totalPaginas);
  const pedidosPagina = pedidosFiltrados.slice(
    (paginaActual - 1) * PAGE_SIZE,
    paginaActual * PAGE_SIZE
  );

  const handleFiltroChange = (value: EstadoPedido | "todos") => {
    setFiltroEstado(value);
    setPagina(1);
  };

  const handleEstadoChange = async (id: string, nuevoEstado: EstadoPedido) => {
    setActualizandoId(id);
    setErrorEstadoId(null);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, estado: nuevoEstado }),
      });
      if (!res.ok) {
        throw new Error("No se pudo actualizar el estado.");
      }
      setPedidosLocal((prev) =>
        prev.map((pedido) => (pedido.id === id ? { ...pedido, estado: nuevoEstado } : pedido))
      );
    } catch {
      setErrorEstadoId(id);
    } finally {
      setActualizandoId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <label className="flex items-center gap-2 text-sm text-carbon-suave">
          Estado
          <select
            value={filtroEstado}
            onChange={(e) => handleFiltroChange(e.target.value as EstadoPedido | "todos")}
            className="min-h-[44px] rounded-[2px] border border-arena bg-blanco px-3 py-2 text-sm text-carbon focus:outline-none focus:border-dorado"
          >
            {ESTADOS.map((estado) => (
              <option key={estado.value} value={estado.value}>
                {estado.label}
              </option>
            ))}
          </select>
        </label>
        <span className="text-xs text-ceniza">
          {pedidosFiltrados.length} pedido{pedidosFiltrados.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="overflow-x-auto bg-blanco border border-arena rounded-[4px]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-arena text-ceniza text-xs uppercase">
              <th className="text-left py-3 px-4">Fecha</th>
              <th className="text-left py-3 px-4">Nombre</th>
              <th className="text-left py-3 px-4">Ciudad</th>
              <th className="text-left py-3 px-4">Producto</th>
              <th className="text-left py-3 px-4">Total</th>
              <th className="text-left py-3 px-4">Estado</th>
            </tr>
          </thead>
          <tbody>
            {pedidosPagina.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-ceniza">
                  Sin pedidos para este filtro.
                </td>
              </tr>
            ) : (
              pedidosPagina.map((pedido) => {
                const abierta = filaAbierta === pedido.id;
                return (
                  <Fragment key={pedido.id}>
                    <tr
                      onClick={() => setFilaAbierta(abierta ? null : pedido.id)}
                      className="border-b border-arena/50 cursor-pointer hover:bg-crema transition-colors"
                    >
                      <td className="py-3 px-4 text-carbon-suave whitespace-nowrap">
                        {formatFecha(pedido.created_at)}
                      </td>
                      <td className="py-3 px-4 text-carbon">{pedido.nombre}</td>
                      <td className="py-3 px-4 text-carbon-suave">{pedido.ciudad}</td>
                      <td className="py-3 px-4 text-carbon-suave">{pedido.producto_nombre}</td>
                      <td className="py-3 px-4 text-carbon whitespace-nowrap">
                        {pedido.precio_total !== null ? formatCOP(pedido.precio_total) : "-"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cx(
                            "inline-block px-2.5 py-1 rounded-[2px] text-xs font-medium",
                            estadoBadgeClass(pedido.estado)
                          )}
                        >
                          {ESTADO_LABELS[pedido.estado]}
                        </span>
                      </td>
                    </tr>
                    {abierta && (
                      <tr className="border-b border-arena/50 bg-crema">
                        <td colSpan={6} className="py-4 px-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-xs text-ceniza uppercase mb-1">Telefono</p>
                              <p className="text-carbon">{pedido.telefono}</p>
                            </div>
                            <div>
                              <p className="text-xs text-ceniza uppercase mb-1">Direccion</p>
                              <p className="text-carbon">
                                {pedido.direccion}
                                {pedido.barrio ? `, ${pedido.barrio}` : ""}
                                {pedido.departamento ? `, ${pedido.departamento}` : ""}
                              </p>
                              {pedido.latitud && pedido.longitud && (
                                <a
                                  href={`https://maps.google.com/?q=${pedido.latitud},${pedido.longitud}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-morado underline underline-offset-2"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Ver ubicación GPS ↗
                                </a>
                              )}
                            </div>
                            <div>
                              <p className="text-xs text-ceniza uppercase mb-1">Notas</p>
                              <p className="text-carbon">{pedido.notas ?? "-"}</p>
                            </div>
                            <div onClick={(e) => e.stopPropagation()}>
                              <p className="text-xs text-ceniza uppercase mb-1">Cambiar estado</p>
                              <select
                                value={pedido.estado}
                                disabled={actualizandoId === pedido.id}
                                onChange={(e) =>
                                  handleEstadoChange(pedido.id, e.target.value as EstadoPedido)
                                }
                                className="min-h-[44px] rounded-[2px] border border-arena bg-blanco px-3 py-2 text-sm text-carbon focus:outline-none focus:border-dorado disabled:opacity-50"
                              >
                                {ESTADOS.filter((estado) => estado.value !== "todos").map(
                                  (estado) => (
                                    <option key={estado.value} value={estado.value}>
                                      {estado.label}
                                    </option>
                                  )
                                )}
                              </select>
                              {errorEstadoId === pedido.id && (
                                <p className="text-xs text-error mt-1">
                                  No se pudo actualizar el estado. Intenta de nuevo.
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <Button
          variant="secondary"
          disabled={paginaActual <= 1}
          onClick={() => setPagina((p) => Math.max(1, p - 1))}
        >
          Anterior
        </Button>
        <span className="text-xs text-ceniza">
          Pagina {paginaActual} de {totalPaginas}
        </span>
        <Button
          variant="secondary"
          disabled={paginaActual >= totalPaginas}
          onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}

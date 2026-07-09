"use client";

import { Fragment, useMemo, useState } from "react";
import { cx, formatCOP } from "@diana-mile/shared/utils";
import { Button } from "@diana-mile/shared/ui/Button";
import type { EstadoPedido, Pedido, ResultadoConfirmacion } from "@diana-mile/shared/types";

type OrdersTableProps = {
  pedidos: Pedido[];
};

const ESTADOS: { value: EstadoPedido | "todos"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "pendiente", label: "Pendiente" },
  { value: "confirmado", label: "Confirmado" },
  { value: "en_preparacion", label: "En preparación" },
  { value: "enviado", label: "Enviado" },
  { value: "entregado", label: "Entregado" },
  { value: "devuelto", label: "Devuelto" },
  { value: "cancelado", label: "Cancelado" },
  { value: "fraude", label: "Fraude" },
];

const ESTADO_LABELS: Record<EstadoPedido, string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  en_preparacion: "En preparación",
  enviado: "Enviado",
  entregado: "Entregado",
  devuelto: "Devuelto",
  cancelado: "Cancelado",
  fraude: "Fraude",
};

const RESULTADOS: { value: ResultadoConfirmacion; label: string }[] = [
  { value: "confirmado", label: "Confirmado" },
  { value: "no_contesta", label: "No contesta" },
  { value: "rellamar", label: "Rellamar" },
  { value: "numero_invalido", label: "Número inválido" },
  { value: "rechazado", label: "Rechazado" },
  { value: "duplicado", label: "Duplicado" },
  { value: "fraude", label: "Fraude" },
];

const TRANSPORTADORAS = [
  { value: "interrapidisimo", label: "Interrapidísimo" },
  { value: "servientrega", label: "Servientrega" },
  { value: "tcc", label: "TCC" },
  { value: "coordinadora", label: "Coordinadora" },
  { value: "deprisa", label: "Deprisa" },
  { value: "envia", label: "Envía" },
  { value: "otro", label: "Otro" },
];

const PAGE_SIZE = 25;

function estadoBadgeClass(estado: EstadoPedido): string {
  switch (estado) {
    case "pendiente":
      return "bg-arena text-carbon";
    case "confirmado":
      return "bg-dorado/20 text-dorado-oscuro";
    case "en_preparacion":
      return "bg-lila-suave text-morado-oscuro";
    case "enviado":
      return "bg-morado/15 text-morado-oscuro";
    case "entregado":
      return "bg-carbon/10 text-carbon";
    case "devuelto":
      return "bg-error/10 text-error";
    case "cancelado":
      return "bg-ceniza/20 text-carbon-suave";
    case "fraude":
      return "bg-error/20 text-error";
    default:
      return "bg-arena text-carbon";
  }
}

function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO");
}

function tiempoDesde(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const horas = Math.floor(diffMs / 3_600_000);
  if (horas < 1) return "hace menos de 1h";
  if (horas < 24) return `hace ${horas}h`;
  const dias = Math.floor(horas / 24);
  return `hace ${dias}d`;
}

type PanelAccion = "confirmar" | "envio" | "entrega" | null;

export default function OrdersTable({ pedidos }: OrdersTableProps) {
  const [filtroEstado, setFiltroEstado] = useState<EstadoPedido | "todos">("todos");
  const [busqueda, setBusqueda] = useState("");
  const [filtroCiudad, setFiltroCiudad] = useState("");
  const [filaAbierta, setFilaAbierta] = useState<string | null>(null);
  const [panelAccion, setPanelAccion] = useState<PanelAccion>(null);
  const [pagina, setPagina] = useState(1);
  const [pedidosLocal, setPedidosLocal] = useState<Pedido[]>(pedidos);
  const [enviando, setEnviando] = useState(false);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  const [resultado, setResultado] = useState<ResultadoConfirmacion>("confirmado");
  const [notasConfirmacion, setNotasConfirmacion] = useState("");
  const [transportadora, setTransportadora] = useState("interrapidisimo");
  const [numeroGuia, setNumeroGuia] = useState("");
  const [costoEnvio, setCostoEnvio] = useState("");
  const [motivoDevolucion, setMotivoDevolucion] = useState("");

  const pedidosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const ciudadQ = filtroCiudad.trim().toLowerCase();
    return pedidosLocal.filter((pedido) => {
      if (filtroEstado !== "todos" && pedido.estado !== filtroEstado) return false;
      if (ciudadQ && !pedido.ciudad?.toLowerCase().includes(ciudadQ)) return false;
      if (q) {
        const haystack = [pedido.nombre, pedido.telefono, pedido.shopify_order_number]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [pedidosLocal, filtroEstado, busqueda, filtroCiudad]);

  const totalPaginas = Math.max(1, Math.ceil(pedidosFiltrados.length / PAGE_SIZE));
  const paginaActual = Math.min(pagina, totalPaginas);
  const pedidosPagina = pedidosFiltrados.slice(
    (paginaActual - 1) * PAGE_SIZE,
    paginaActual * PAGE_SIZE
  );

  const resetFiltros = (fn: () => void) => {
    fn();
    setPagina(1);
  };

  const abrirFila = (pedido: Pedido, panel: PanelAccion = null) => {
    const abierta = filaAbierta === pedido.id;
    if (abierta && panelAccion === panel) {
      setFilaAbierta(null);
      setPanelAccion(null);
      return;
    }
    setFilaAbierta(pedido.id);
    setPanelAccion(panel);
    setErrorAccion(null);
    setNotasConfirmacion("");
    setNumeroGuia("");
    setCostoEnvio("");
    setMotivoDevolucion("");
  };

  const actualizarPedidoLocal = (pedidoActualizado: Pedido) => {
    setPedidosLocal((prev) =>
      prev.map((p) => (p.id === pedidoActualizado.id ? { ...p, ...pedidoActualizado } : p))
    );
    setFilaAbierta(null);
    setPanelAccion(null);
  };

  const handleEstadoChange = async (id: string, nuevoEstado: EstadoPedido) => {
    setEnviando(true);
    setErrorAccion(null);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, estado: nuevoEstado }),
      });
      if (!res.ok) throw new Error();
      setPedidosLocal((prev) =>
        prev.map((pedido) => (pedido.id === id ? { ...pedido, estado: nuevoEstado } : pedido))
      );
    } catch {
      setErrorAccion("No se pudo actualizar el estado. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  const handleConfirmar = async (id: string) => {
    setEnviando(true);
    setErrorAccion(null);
    try {
      const res = await fetch(`/api/admin/pedidos/${id}/confirmar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resultado, notas: notasConfirmacion || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error");
      actualizarPedidoLocal(json.pedido);
    } catch (e) {
      setErrorAccion(e instanceof Error ? e.message : "No se pudo registrar la confirmación.");
    } finally {
      setEnviando(false);
    }
  };

  const handleEnvio = async (id: string) => {
    if (!numeroGuia.trim()) {
      setErrorAccion("El número de guía es obligatorio.");
      return;
    }
    setEnviando(true);
    setErrorAccion(null);
    try {
      const res = await fetch(`/api/admin/pedidos/${id}/envio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transportadora,
          numero_guia: numeroGuia.trim(),
          costo_envio: costoEnvio ? Number(costoEnvio) : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error");
      actualizarPedidoLocal(json.pedido);
    } catch (e) {
      setErrorAccion(e instanceof Error ? e.message : "No se pudo asignar el envío.");
    } finally {
      setEnviando(false);
    }
  };

  const handleEntrega = async (id: string, accion: "entregado" | "devolucion") => {
    if (accion === "devolucion" && !motivoDevolucion.trim()) {
      setErrorAccion("El motivo de la devolución es obligatorio.");
      return;
    }
    setEnviando(true);
    setErrorAccion(null);
    try {
      const res = await fetch(`/api/admin/pedidos/${id}/entrega`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion, motivo: motivoDevolucion.trim() || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error");
      actualizarPedidoLocal(json.pedido);
    } catch (e) {
      setErrorAccion(e instanceof Error ? e.message : "No se pudo actualizar la entrega.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 flex-wrap mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre, teléfono o # orden..."
          value={busqueda}
          onChange={(e) => resetFiltros(() => setBusqueda(e.target.value))}
          className="min-h-[44px] flex-1 min-w-[220px] rounded-[2px] border border-arena bg-blanco px-3 py-2 text-sm text-carbon focus:outline-none focus:border-dorado"
        />
        <input
          type="text"
          placeholder="Ciudad"
          value={filtroCiudad}
          onChange={(e) => resetFiltros(() => setFiltroCiudad(e.target.value))}
          className="min-h-[44px] w-40 rounded-[2px] border border-arena bg-blanco px-3 py-2 text-sm text-carbon focus:outline-none focus:border-dorado"
        />
        <select
          value={filtroEstado}
          onChange={(e) => resetFiltros(() => setFiltroEstado(e.target.value as EstadoPedido | "todos"))}
          className="min-h-[44px] rounded-[2px] border border-arena bg-blanco px-3 py-2 text-sm text-carbon focus:outline-none focus:border-dorado"
        >
          {ESTADOS.map((estado) => (
            <option key={estado.value} value={estado.value}>
              {estado.label}
            </option>
          ))}
        </select>
        <span className="text-xs text-ceniza whitespace-nowrap">
          {pedidosFiltrados.length} pedido{pedidosFiltrados.length === 1 ? "" : "s"}
        </span>
      </div>

      {errorAccion && (
        <div className="mb-4 rounded-[2px] border border-error/30 bg-error/5 px-4 py-2 text-sm text-error">
          {errorAccion}
        </div>
      )}

      <div className="overflow-x-auto bg-blanco border border-arena rounded-[4px]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-arena text-ceniza text-xs uppercase">
              <th className="text-left py-3 px-4"># Orden</th>
              <th className="text-left py-3 px-4">Cliente</th>
              <th className="text-left py-3 px-4">Ciudad</th>
              <th className="text-left py-3 px-4">Producto</th>
              <th className="text-left py-3 px-4">Precio</th>
              <th className="text-left py-3 px-4">Estado</th>
              <th className="text-left py-3 px-4">Intentos</th>
              <th className="text-left py-3 px-4">Fecha</th>
              <th className="text-left py-3 px-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pedidosPagina.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-6 text-center text-ceniza">
                  Sin pedidos para este filtro.
                </td>
              </tr>
            ) : (
              pedidosPagina.map((pedido) => {
                const abierta = filaAbierta === pedido.id;
                return (
                  <Fragment key={pedido.id}>
                    <tr className="border-b border-arena/50 hover:bg-crema transition-colors">
                      <td
                        className="py-3 px-4 text-carbon-suave whitespace-nowrap cursor-pointer"
                        onClick={() => abrirFila(pedido)}
                      >
                        {pedido.shopify_order_number ?? "-"}
                      </td>
                      <td className="py-3 px-4 cursor-pointer" onClick={() => abrirFila(pedido)}>
                        <p className="text-carbon">{pedido.nombre}</p>
                        <p className="text-xs text-ceniza">{pedido.telefono}</p>
                      </td>
                      <td className="py-3 px-4 text-carbon-suave cursor-pointer" onClick={() => abrirFila(pedido)}>
                        {pedido.ciudad}
                      </td>
                      <td className="py-3 px-4 text-carbon-suave cursor-pointer" onClick={() => abrirFila(pedido)}>
                        {pedido.producto_nombre}
                        {pedido.variante_nombre ? ` · ${pedido.variante_nombre}` : ""}
                      </td>
                      <td className="py-3 px-4 text-carbon whitespace-nowrap cursor-pointer" onClick={() => abrirFila(pedido)}>
                        {pedido.precio_total !== null ? formatCOP(pedido.precio_total) : "-"}
                      </td>
                      <td className="py-3 px-4 cursor-pointer" onClick={() => abrirFila(pedido)}>
                        <span
                          className={cx(
                            "inline-block px-2.5 py-1 rounded-[2px] text-xs font-medium",
                            estadoBadgeClass(pedido.estado)
                          )}
                        >
                          {ESTADO_LABELS[pedido.estado]}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-carbon-suave cursor-pointer" onClick={() => abrirFila(pedido)}>
                        {pedido.intentos_llamada}
                      </td>
                      <td className="py-3 px-4 text-carbon-suave whitespace-nowrap cursor-pointer" onClick={() => abrirFila(pedido)}>
                        {formatFecha(pedido.created_at)}
                        <span className="block text-xs text-ceniza">{tiempoDesde(pedido.created_at)}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {pedido.estado === "pendiente" && (
                          <Button
                            variant="secondary"
                            className="!min-h-0 !py-1.5 !px-3 text-xs"
                            onClick={() => abrirFila(pedido, "confirmar")}
                          >
                            Confirmar
                          </Button>
                        )}
                        {pedido.estado === "confirmado" && (
                          <Button
                            variant="secondary"
                            className="!min-h-0 !py-1.5 !px-3 text-xs"
                            onClick={() => abrirFila(pedido, "envio")}
                          >
                            Asignar envío
                          </Button>
                        )}
                        {pedido.estado === "enviado" && (
                          <Button
                            variant="secondary"
                            className="!min-h-0 !py-1.5 !px-3 text-xs"
                            onClick={() => abrirFila(pedido, "entrega")}
                          >
                            Actualizar entrega
                          </Button>
                        )}
                        {["entregado", "devuelto", "cancelado", "fraude"].includes(pedido.estado) && (
                          <button
                            type="button"
                            onClick={() => abrirFila(pedido)}
                            className="text-xs text-morado underline underline-offset-2"
                          >
                            Ver detalle
                          </button>
                        )}
                      </td>
                    </tr>
                    {abierta && (
                      <tr className="border-b border-arena/50 bg-crema">
                        <td colSpan={9} className="py-4 px-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                            <div>
                              <p className="text-xs text-ceniza uppercase mb-1">Dirección</p>
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
                                >
                                  Ver ubicación GPS ↗
                                </a>
                              )}
                            </div>
                            <div>
                              <p className="text-xs text-ceniza uppercase mb-1">Canal / notas</p>
                              <p className="text-carbon">{pedido.canal_adquisicion ?? "-"}</p>
                              <p className="text-carbon-suave">{pedido.notas ?? "-"}</p>
                            </div>
                            {(pedido.numero_guia || pedido.transportadora) && (
                              <div>
                                <p className="text-xs text-ceniza uppercase mb-1">Envío</p>
                                <p className="text-carbon">{pedido.transportadora}</p>
                                <p className="text-carbon-suave">Guía: {pedido.numero_guia}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-xs text-ceniza uppercase mb-1">Cambiar estado manualmente</p>
                              <select
                                value={pedido.estado}
                                disabled={enviando}
                                onChange={(e) => handleEstadoChange(pedido.id, e.target.value as EstadoPedido)}
                                className="min-h-[44px] rounded-[2px] border border-arena bg-blanco px-3 py-2 text-sm text-carbon focus:outline-none focus:border-dorado disabled:opacity-50"
                              >
                                {ESTADOS.filter((estado) => estado.value !== "todos").map((estado) => (
                                  <option key={estado.value} value={estado.value}>
                                    {estado.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {panelAccion === "confirmar" && (
                            <div className="border-t border-arena/60 pt-4 grid gap-3 md:grid-cols-[1fr_2fr_auto] items-end">
                              <label className="text-sm">
                                <span className="block text-xs text-ceniza uppercase mb-1">Resultado</span>
                                <select
                                  value={resultado}
                                  onChange={(e) => setResultado(e.target.value as ResultadoConfirmacion)}
                                  className="min-h-[44px] w-full rounded-[2px] border border-arena bg-blanco px-3 py-2 text-sm text-carbon focus:outline-none focus:border-dorado"
                                >
                                  {RESULTADOS.map((r) => (
                                    <option key={r.value} value={r.value}>
                                      {r.label}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label className="text-sm">
                                <span className="block text-xs text-ceniza uppercase mb-1">Notas</span>
                                <input
                                  type="text"
                                  value={notasConfirmacion}
                                  onChange={(e) => setNotasConfirmacion(e.target.value)}
                                  className="min-h-[44px] w-full rounded-[2px] border border-arena bg-blanco px-3 py-2 text-sm text-carbon focus:outline-none focus:border-dorado"
                                />
                              </label>
                              <Button disabled={enviando} onClick={() => handleConfirmar(pedido.id)}>
                                Guardar
                              </Button>
                            </div>
                          )}

                          {panelAccion === "envio" && (
                            <div className="border-t border-arena/60 pt-4 grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto] items-end">
                              <label className="text-sm">
                                <span className="block text-xs text-ceniza uppercase mb-1">Transportadora</span>
                                <select
                                  value={transportadora}
                                  onChange={(e) => setTransportadora(e.target.value)}
                                  className="min-h-[44px] w-full rounded-[2px] border border-arena bg-blanco px-3 py-2 text-sm text-carbon focus:outline-none focus:border-dorado"
                                >
                                  {TRANSPORTADORAS.map((t) => (
                                    <option key={t.value} value={t.value}>
                                      {t.label}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label className="text-sm">
                                <span className="block text-xs text-ceniza uppercase mb-1">Número de guía</span>
                                <input
                                  type="text"
                                  value={numeroGuia}
                                  onChange={(e) => setNumeroGuia(e.target.value)}
                                  className="min-h-[44px] w-full rounded-[2px] border border-arena bg-blanco px-3 py-2 text-sm text-carbon focus:outline-none focus:border-dorado"
                                />
                              </label>
                              <label className="text-sm">
                                <span className="block text-xs text-ceniza uppercase mb-1">Costo envío (COP)</span>
                                <input
                                  type="number"
                                  value={costoEnvio}
                                  onChange={(e) => setCostoEnvio(e.target.value)}
                                  className="min-h-[44px] w-full rounded-[2px] border border-arena bg-blanco px-3 py-2 text-sm text-carbon focus:outline-none focus:border-dorado"
                                />
                              </label>
                              <Button disabled={enviando} onClick={() => handleEnvio(pedido.id)}>
                                Crear envío
                              </Button>
                            </div>
                          )}

                          {panelAccion === "entrega" && (
                            <div className="border-t border-arena/60 pt-4 flex flex-wrap items-end gap-3">
                              <Button disabled={enviando} onClick={() => handleEntrega(pedido.id, "entregado")}>
                                Marcar como entregado
                              </Button>
                              <label className="text-sm flex-1 min-w-[200px]">
                                <span className="block text-xs text-ceniza uppercase mb-1">Motivo de devolución</span>
                                <input
                                  type="text"
                                  value={motivoDevolucion}
                                  onChange={(e) => setMotivoDevolucion(e.target.value)}
                                  className="min-h-[44px] w-full rounded-[2px] border border-arena bg-blanco px-3 py-2 text-sm text-carbon focus:outline-none focus:border-dorado"
                                />
                              </label>
                              <Button
                                variant="secondary"
                                disabled={enviando}
                                onClick={() => handleEntrega(pedido.id, "devolucion")}
                              >
                                Registrar devolución
                              </Button>
                            </div>
                          )}
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
          Página {paginaActual} de {totalPaginas}
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

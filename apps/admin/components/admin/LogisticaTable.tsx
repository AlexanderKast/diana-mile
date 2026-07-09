"use client";

import { Fragment, useState } from "react";
import { Button } from "@diana-mile/shared/ui/Button";
import type { Pedido } from "@diana-mile/shared/types";

type LogisticaTableProps = {
  pendientesEnvio: Pedido[];
  enTransito: Pedido[];
};

const TRANSPORTADORAS = [
  { value: "interrapidisimo", label: "Interrapidísimo" },
  { value: "servientrega", label: "Servientrega" },
  { value: "tcc", label: "TCC" },
  { value: "coordinadora", label: "Coordinadora" },
  { value: "deprisa", label: "Deprisa" },
  { value: "envia", label: "Envía" },
  { value: "otro", label: "Otro" },
];

const TRANSPORTADORA_LABELS: Record<string, string> = TRANSPORTADORAS.reduce(
  (acc, t) => ({ ...acc, [t.value]: t.label }),
  {} as Record<string, string>
);

// URLs de rastreo conocidas para las transportadoras seed. Si la transportadora
// no tiene un patron conocido, se muestra solo el numero de guia como texto.
const TRACKING_URL_BUILDERS: Record<string, (guia: string) => string> = {
  interrapidisimo: (guia) => `https://www.interrapidisimo.com/sigue-tu-envio/?guia=${guia}`,
  tcc: (guia) => `https://www.tcc.com.co/rastreo-de-guia?guia=${guia}`,
  coordinadora: (guia) =>
    `https://www.coordinadora.com/portafolio-de-servicios/rastreo-de-guias/?guia=${guia}`,
  deprisa: (guia) => `https://www.deprisa.com/Tracking/index?guias=${guia}`,
  envia: (guia) => `https://envia.com/rastreo?tracking=${guia}`,
};

function direccionCompleta(pedido: Pedido): string {
  return [pedido.direccion, pedido.barrio, pedido.departamento].filter(Boolean).join(", ");
}

function diasDesde(iso: string | null): string {
  if (!iso) return "-";
  const diffMs = Date.now() - new Date(iso).getTime();
  const dias = Math.floor(diffMs / 86_400_000);
  if (dias <= 0) return "hoy";
  return `${dias} dia${dias === 1 ? "" : "s"}`;
}

export default function LogisticaTable({ pendientesEnvio, enTransito }: LogisticaTableProps) {
  const [porEnviar, setPorEnviar] = useState<Pedido[]>(pendientesEnvio);
  const [transito, setTransito] = useState<Pedido[]>(enTransito);

  const [filaEnvioAbierta, setFilaEnvioAbierta] = useState<string | null>(null);
  const [transportadora, setTransportadora] = useState("interrapidisimo");
  const [numeroGuia, setNumeroGuia] = useState("");
  const [costoEnvio, setCostoEnvio] = useState("");

  const [filaEntregaAbierta, setFilaEntregaAbierta] = useState<string | null>(null);
  const [motivoDevolucion, setMotivoDevolucion] = useState("");

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abrirEnvio = (pedido: Pedido) => {
    if (filaEnvioAbierta === pedido.id) {
      setFilaEnvioAbierta(null);
      return;
    }
    setFilaEnvioAbierta(pedido.id);
    setError(null);
    setTransportadora("interrapidisimo");
    setNumeroGuia("");
    setCostoEnvio("");
  };

  const abrirEntrega = (pedido: Pedido) => {
    if (filaEntregaAbierta === pedido.id) {
      setFilaEntregaAbierta(null);
      return;
    }
    setFilaEntregaAbierta(pedido.id);
    setMotivoDevolucion("");
    setError(null);
  };

  const handleCrearEnvio = async (pedido: Pedido) => {
    if (!numeroGuia.trim()) {
      setError("El numero de guia es obligatorio.");
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/pedidos/${pedido.id}/envio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transportadora,
          numero_guia: numeroGuia.trim(),
          costo_envio: costoEnvio ? Number(costoEnvio) : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "No se pudo asignar el envio.");

      const pedidoActualizado = json.pedido as Pedido;
      setPorEnviar((prev) => prev.filter((p) => p.id !== pedido.id));
      setTransito((prev) => [pedidoActualizado, ...prev]);
      setFilaEnvioAbierta(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo asignar el envio.");
    } finally {
      setEnviando(false);
    }
  };

  const handleEntregado = async (pedido: Pedido) => {
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/pedidos/${pedido.id}/entrega`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "entregado" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "No se pudo marcar la entrega.");

      setTransito((prev) => prev.filter((p) => p.id !== pedido.id));
      setFilaEntregaAbierta(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo marcar la entrega.");
    } finally {
      setEnviando(false);
    }
  };

  const handleDevolucion = async (pedido: Pedido) => {
    if (!motivoDevolucion.trim()) {
      setError("El motivo de la devolucion es obligatorio.");
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/pedidos/${pedido.id}/entrega`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "devolucion", motivo: motivoDevolucion.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "No se pudo registrar la devolucion.");

      setTransito((prev) => prev.filter((p) => p.id !== pedido.id));
      setFilaEntregaAbierta(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo registrar la devolucion.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      {error && (
        <div className="rounded-[2px] border border-error/30 bg-error/5 px-4 py-2 text-sm text-error">
          {error}
        </div>
      )}

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-carbon">Por enviar</h2>
          <span className="text-xs text-ceniza">
            {porEnviar.length} pedido{porEnviar.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="overflow-x-auto bg-blanco border border-arena rounded-[4px]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-arena text-ceniza text-xs uppercase">
                <th className="text-left py-3 px-4"># Orden</th>
                <th className="text-left py-3 px-4">Nombre</th>
                <th className="text-left py-3 px-4">Ciudad</th>
                <th className="text-left py-3 px-4">Direccion</th>
                <th className="text-left py-3 px-4">Producto</th>
                <th className="text-left py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {porEnviar.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-ceniza">
                    No hay pedidos confirmados pendientes de envio.
                  </td>
                </tr>
              ) : (
                porEnviar.map((pedido) => {
                  const abierta = filaEnvioAbierta === pedido.id;
                  return (
                    <Fragment key={pedido.id}>
                      <tr className="border-b border-arena/50 hover:bg-crema transition-colors">
                        <td className="py-3 px-4 text-carbon-suave whitespace-nowrap">
                          {pedido.shopify_order_number ?? "-"}
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-carbon">{pedido.nombre}</p>
                          <p className="text-xs text-ceniza">{pedido.telefono}</p>
                        </td>
                        <td className="py-3 px-4 text-carbon-suave">{pedido.ciudad}</td>
                        <td className="py-3 px-4 text-carbon-suave">{direccionCompleta(pedido)}</td>
                        <td className="py-3 px-4 text-carbon-suave">
                          {pedido.producto_nombre}
                          {pedido.variante_nombre ? ` · ${pedido.variante_nombre}` : ""}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <Button
                            variant="secondary"
                            className="!min-h-0 !py-1.5 !px-3 text-xs"
                            onClick={() => abrirEnvio(pedido)}
                          >
                            Asignar envio
                          </Button>
                        </td>
                      </tr>
                      {abierta && (
                        <tr className="border-b border-arena/50 bg-crema">
                          <td colSpan={6} className="py-4 px-4">
                            <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto] items-end">
                              <label className="text-sm">
                                <span className="block text-xs text-ceniza uppercase mb-1">
                                  Transportadora
                                </span>
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
                                <span className="block text-xs text-ceniza uppercase mb-1">
                                  Numero de guia
                                </span>
                                <input
                                  type="text"
                                  value={numeroGuia}
                                  onChange={(e) => setNumeroGuia(e.target.value)}
                                  className="min-h-[44px] w-full rounded-[2px] border border-arena bg-blanco px-3 py-2 text-sm text-carbon focus:outline-none focus:border-dorado"
                                />
                              </label>
                              <label className="text-sm">
                                <span className="block text-xs text-ceniza uppercase mb-1">
                                  Costo envio (COP)
                                </span>
                                <input
                                  type="number"
                                  value={costoEnvio}
                                  onChange={(e) => setCostoEnvio(e.target.value)}
                                  className="min-h-[44px] w-full rounded-[2px] border border-arena bg-blanco px-3 py-2 text-sm text-carbon focus:outline-none focus:border-dorado"
                                />
                              </label>
                              <Button disabled={enviando} onClick={() => handleCrearEnvio(pedido)}>
                                Crear envio
                              </Button>
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
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-carbon">En transito</h2>
          <span className="text-xs text-ceniza">
            {transito.length} pedido{transito.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="overflow-x-auto bg-blanco border border-arena rounded-[4px]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-arena text-ceniza text-xs uppercase">
                <th className="text-left py-3 px-4"># Orden</th>
                <th className="text-left py-3 px-4">Nombre</th>
                <th className="text-left py-3 px-4">Ciudad</th>
                <th className="text-left py-3 px-4">Transportadora</th>
                <th className="text-left py-3 px-4">Guia</th>
                <th className="text-left py-3 px-4">Dias en transito</th>
                <th className="text-left py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {transito.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-ceniza">
                    No hay pedidos en transito.
                  </td>
                </tr>
              ) : (
                transito.map((pedido) => {
                  const abierta = filaEntregaAbierta === pedido.id;
                  const builder = pedido.transportadora
                    ? TRACKING_URL_BUILDERS[pedido.transportadora]
                    : undefined;
                  const urlTracking =
                    builder && pedido.numero_guia ? builder(pedido.numero_guia) : null;
                  return (
                    <Fragment key={pedido.id}>
                      <tr className="border-b border-arena/50 hover:bg-crema transition-colors">
                        <td className="py-3 px-4 text-carbon-suave whitespace-nowrap">
                          {pedido.shopify_order_number ?? "-"}
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-carbon">{pedido.nombre}</p>
                          <p className="text-xs text-ceniza">{pedido.telefono}</p>
                        </td>
                        <td className="py-3 px-4 text-carbon-suave">{pedido.ciudad}</td>
                        <td className="py-3 px-4 text-carbon-suave">
                          {pedido.transportadora
                            ? (TRANSPORTADORA_LABELS[pedido.transportadora] ?? pedido.transportadora)
                            : "-"}
                        </td>
                        <td className="py-3 px-4 text-carbon-suave">
                          {urlTracking ? (
                            <a
                              href={urlTracking}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-morado underline underline-offset-2"
                            >
                              {pedido.numero_guia} ↗
                            </a>
                          ) : (
                            (pedido.numero_guia ?? "-")
                          )}
                        </td>
                        <td className="py-3 px-4 text-carbon-suave whitespace-nowrap">
                          {diasDesde(pedido.fecha_envio)}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap flex flex-wrap gap-2">
                          <Button
                            variant="secondary"
                            className="!min-h-0 !py-1.5 !px-3 text-xs"
                            disabled={enviando}
                            onClick={() => handleEntregado(pedido)}
                          >
                            Marcar entregado
                          </Button>
                          <Button
                            variant="secondary"
                            className="!min-h-0 !py-1.5 !px-3 text-xs"
                            onClick={() => abrirEntrega(pedido)}
                          >
                            Registrar devolucion
                          </Button>
                        </td>
                      </tr>
                      {abierta && (
                        <tr className="border-b border-arena/50 bg-crema">
                          <td colSpan={7} className="py-4 px-4">
                            <div className="flex flex-wrap items-end gap-3">
                              <label className="text-sm flex-1 min-w-[240px]">
                                <span className="block text-xs text-ceniza uppercase mb-1">
                                  Motivo de la devolucion
                                </span>
                                <input
                                  type="text"
                                  value={motivoDevolucion}
                                  onChange={(e) => setMotivoDevolucion(e.target.value)}
                                  className="min-h-[44px] w-full rounded-[2px] border border-arena bg-blanco px-3 py-2 text-sm text-carbon focus:outline-none focus:border-dorado"
                                />
                              </label>
                              <Button disabled={enviando} onClick={() => handleDevolucion(pedido)}>
                                Confirmar devolucion
                              </Button>
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
      </section>
    </div>
  );
}

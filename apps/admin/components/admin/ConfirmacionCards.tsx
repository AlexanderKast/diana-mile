"use client";

import { useState } from "react";
import { cx, formatCOP } from "@diana-mile/shared/utils";
import { Button } from "@diana-mile/shared/ui/Button";
import { Textarea } from "@diana-mile/shared/ui/Input";
import type { Pedido, ResultadoConfirmacion } from "@diana-mile/shared/types";
import StatsCard from "@/components/admin/StatsCard";

type ConfirmacionCardsProps = {
  pedidos: Pedido[];
};

const RESULTADOS: { value: ResultadoConfirmacion; label: string }[] = [
  { value: "confirmado", label: "Confirmado" },
  { value: "no_contesta", label: "No contesta" },
  { value: "rellamar", label: "Rellamar" },
  { value: "numero_invalido", label: "Numero invalido" },
  { value: "rechazado", label: "Rechazado" },
  { value: "duplicado", label: "Duplicado" },
  { value: "fraude", label: "Fraude" },
];

function tiempoDesde(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const horas = Math.floor(diffMs / 3_600_000);
  if (horas < 1) return "hace menos de 1h";
  if (horas < 24) return `hace ${horas}h`;
  const dias = Math.floor(horas / 24);
  return `hace ${dias}d`;
}

function prioridadBadgeClass(prioridad: Pedido["prioridad"]): string {
  switch (prioridad) {
    case "urgente":
      return "bg-error/10 text-error";
    case "prioritario":
      return "bg-dorado/20 text-dorado-oscuro";
    default:
      return "bg-arena text-carbon";
  }
}

function prioridadLabel(prioridad: Pedido["prioridad"]): string {
  switch (prioridad) {
    case "urgente":
      return "Urgente";
    case "prioritario":
      return "Prioritario";
    default:
      return "Normal";
  }
}

export default function ConfirmacionCards({ pedidos }: ConfirmacionCardsProps) {
  const [pedidosLocal, setPedidosLocal] = useState<Pedido[]>(pedidos);
  const [resultado, setResultado] = useState<ResultadoConfirmacion>("confirmado");
  const [notas, setNotas] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pedidoActual = pedidosLocal[0] ?? null;

  const handleGuardar = async () => {
    if (!pedidoActual) return;
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/pedidos/${pedidoActual.id}/confirmar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resultado, notas: notas.trim() || undefined }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? "No se pudo registrar la confirmacion.");
      }
      setPedidosLocal((prev) => prev.filter((p) => p.id !== pedidoActual.id));
      setResultado("confirmado");
      setNotas("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo registrar la confirmacion.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto md:mx-0">
      <div className="mb-6">
        <StatsCard label="Pendientes por confirmar" value={pedidosLocal.length} />
      </div>

      {error && (
        <div className="mb-4 rounded-[2px] border border-error/30 bg-error/5 px-4 py-2 text-sm text-error">
          {error}
        </div>
      )}

      {!pedidoActual ? (
        <div className="bg-blanco border border-arena rounded-[4px] p-8 text-center text-ceniza">
          No hay pedidos pendientes de confirmar
        </div>
      ) : (
        <div className="bg-blanco border border-arena rounded-[4px] p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <p className="text-xs text-ceniza uppercase tracking-wide">
                # Orden {pedidoActual.shopify_order_number ?? "-"}
              </p>
              <p className="font-display text-xl text-carbon mt-0.5">{pedidoActual.nombre}</p>
            </div>
            {pedidoActual.prioridad !== "normal" && (
              <span
                className={cx(
                  "shrink-0 inline-block px-2.5 py-1 rounded-[2px] text-xs font-medium",
                  prioridadBadgeClass(pedidoActual.prioridad)
                )}
              >
                {prioridadLabel(pedidoActual.prioridad)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2 text-sm mb-4">
            <p className="text-carbon-suave">
              <span className="text-ceniza">Telefono: </span>
              {pedidoActual.telefono}
            </p>
            <p className="text-carbon-suave">
              <span className="text-ceniza">Producto: </span>
              {pedidoActual.producto_nombre}
              {pedidoActual.variante_nombre ? ` · ${pedidoActual.variante_nombre}` : ""}
              {` (cant. ${pedidoActual.cantidad})`}
              {" — "}
              {formatCOP(pedidoActual.precio_total ?? pedidoActual.precio_venta ?? 0)}
            </p>
            <p className="text-carbon-suave">
              <span className="text-ceniza">Ciudad: </span>
              {pedidoActual.ciudad}
            </p>
            <p className="text-carbon-suave">
              <span className="text-ceniza">Creado: </span>
              {tiempoDesde(pedidoActual.created_at)}
            </p>
            <p className="text-carbon-suave">
              <span className="text-ceniza">Intentos de llamada: </span>
              {pedidoActual.intentos_llamada}
            </p>
          </div>

          <a href={`tel:${pedidoActual.telefono.replace(/\s+/g, "")}`} className="block mb-5">
            <Button className="w-full">Llamar</Button>
          </a>

          <div className="border-t border-arena/60 pt-4 flex flex-col gap-3">
            <label className="text-sm">
              <span className="block text-xs text-ceniza uppercase mb-1">Resultado</span>
              <select
                value={resultado}
                disabled={enviando}
                onChange={(e) => setResultado(e.target.value as ResultadoConfirmacion)}
                className="min-h-[44px] w-full rounded-[2px] border border-arena bg-blanco px-3 py-2 text-sm text-carbon focus:outline-none focus:border-dorado disabled:opacity-50"
              >
                {RESULTADOS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>

            <Textarea
              label="Notas"
              value={notas}
              disabled={enviando}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
              className="!rounded-[2px]"
            />

            <Button disabled={enviando} onClick={handleGuardar}>
              {enviando ? "Guardando..." : "Guardar y siguiente"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

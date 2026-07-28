"use client";

import { useState } from "react";
import { cx } from "@diana-mile/shared/utils";
import {
  CLASE_ETIQUETA,
  etiquetasAutomaticas,
  type Etiqueta,
  type FasePipeline,
} from "@diana-mile/shared/crm/pipeline";

/**
 * Las etiquetas, iguales en todas las pantallas.
 *
 * POR QUE UN SOLO COMPONENTE
 * Se ven en leads, pedidos, conversaciones y el pipeline. Si cada tabla
 * pintara las suyas, el mismo pedido se veria distinto en cada sitio y nadie
 * sabria cual mirar.
 *
 * AUTOMATICAS VS MANUALES
 * Las automaticas (canal, producto, ciudad, estado) se derivan al leer y no
 * se guardan: una etiqueta guardada se desactualiza en cuanto cambia el dato
 * del que salio. Las manuales si se guardan, porque son lo unico que una
 * maquina no puede deducir — y son las que se sincronizan con Shopify.
 */

export function Etiquetas({
  fase,
  canal,
  producto,
  ciudad,
  escalado,
  manuales,
  max = 6,
  compacto = false,
}: {
  fase: FasePipeline;
  canal?: string | null;
  producto?: string | null;
  ciudad?: string | null;
  escalado?: boolean;
  manuales?: string[] | null;
  max?: number;
  compacto?: boolean;
}) {
  const autos = etiquetasAutomaticas({
    fase,
    fuente: canal,
    producto,
    ciudad,
    escalado,
  });
  const todas: Etiqueta[] = [
    ...autos,
    ...(manuales ?? []).map((v) => ({ valor: v, tipo: "manual" as const })),
  ];
  const visibles = todas.slice(0, max);
  const resto = todas.length - visibles.length;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {visibles.map((e) => (
        <span
          key={`${e.tipo}-${e.valor}`}
          className={cx(
            "rounded-[3px]",
            compacto ? "px-1 py-0 text-[9px]" : "px-1.5 py-0.5 text-[10px]",
            CLASE_ETIQUETA[e.tipo],
          )}
        >
          {e.valor}
        </span>
      ))}
      {resto > 0 && (
        <span className="text-[10px] text-ceniza">+{resto}</span>
      )}
    </div>
  );
}

/**
 * Editor de etiquetas manuales.
 *
 * En pedidos, guardar tambien las manda a Shopify: el equipo que despacha
 * mira las ordenes alli, no este panel, y una etiqueta que solo existe aca
 * no le sirve a quien empaca.
 */
export function EditorEtiquetas({
  entidad,
  id,
  iniciales,
  onGuardado,
}: {
  entidad: "lead" | "pedido";
  id: string;
  iniciales: string[];
  onGuardado?: (etiquetas: string[]) => void;
}) {
  const [etiquetas, setEtiquetas] = useState<string[]>(iniciales);
  const [nueva, setNueva] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardar(siguientes: string[]) {
    const antes = etiquetas;
    setEtiquetas(siguientes);
    setGuardando(true);
    setError(null);
    try {
      const r = await fetch("/api/admin/etiquetas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entidad, id, etiquetas: siguientes }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => null);
        throw new Error(j?.error ?? `Error ${r.status}`);
      }
      onGuardado?.(siguientes);
    } catch (e) {
      setEtiquetas(antes);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setGuardando(false);
    }
  }

  function agregar() {
    const v = nueva.trim();
    // Shopify separa etiquetas por coma: una coma dentro del texto partiria
    // la etiqueta en dos al sincronizar.
    const limpia = v.replace(/,/g, " ").trim();
    if (!limpia || etiquetas.includes(limpia)) return;
    setNueva("");
    void guardar([...etiquetas, limpia]);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1">
        {etiquetas.map((e) => (
          <span
            key={e}
            className="flex items-center gap-1 rounded-[3px] bg-morado/10 px-1.5 py-0.5 text-[10px] text-morado-oscuro"
          >
            {e}
            <button
              type="button"
              disabled={guardando}
              onClick={() => void guardar(etiquetas.filter((x) => x !== e))}
              aria-label={`Quitar ${e}`}
              className="text-morado-oscuro/60 hover:text-error"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-1">
        <input
          value={nueva}
          onChange={(ev) => setNueva(ev.target.value)}
          onKeyDown={(ev) => {
            if (ev.key === "Enter") {
              ev.preventDefault();
              agregar();
            }
          }}
          placeholder="Nueva etiqueta…"
          className="flex-1 rounded-[3px] border border-arena bg-crema px-2 py-1 text-xs text-carbon"
        />
        <button
          type="button"
          onClick={agregar}
          disabled={guardando || !nueva.trim()}
          className="rounded-[3px] bg-morado px-2 py-1 text-xs text-blanco disabled:opacity-50"
        >
          +
        </button>
      </div>
      {entidad === "pedido" && (
        <p className="text-[10px] text-ceniza">
          Se sincronizan con la orden en Shopify.
        </p>
      )}
      {error && <p className="text-[10px] text-error">{error}</p>}
    </div>
  );
}

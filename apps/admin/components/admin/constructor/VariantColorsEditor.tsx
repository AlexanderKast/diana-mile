"use client";

import { useEffect, useState } from "react";
import { Button } from "@diana-mile/shared/ui/Button";
import { Spinner } from "@diana-mile/shared/ui/Spinner";
import type { VarianteResumen } from "@/lib/shopify-catalogo";

type VariantColorsEditorProps = {
  handle: string;
  variantes: VarianteResumen[];
};

const HEX_REGEX = /^#([0-9a-fA-F]{3}){1,2}$/;
const COLOR_DEFAULT = "#c4a882";

/**
 * Color propio por variante (guardado en Supabase, no en Shopify) — el
 * usuario lo elige libremente aqui; si la variante tambien tiene swatch
 * nativo en Shopify, este color propio tiene prioridad en la tienda.
 */
export default function VariantColorsEditor({
  handle,
  variantes,
}: VariantColorsEditorProps) {
  const [colores, setColores] = useState<Record<string, string | null>>({});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const res = await fetch(`/api/admin/productos/${handle}/colores`);
        if (!res.ok) throw new Error("No se pudieron cargar los colores.");
        const data = await res.json();
        if (!activo) return;
        const mapa: Record<string, string | null> = {};
        for (const item of data.colores ?? []) {
          mapa[item.variantId] = item.colorHex;
        }
        setColores(mapa);
      } catch (err) {
        if (activo) {
          setError(err instanceof Error ? err.message : "Error al cargar.");
        }
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, [handle]);

  function setColor(variantId: string, colorHex: string | null) {
    setColores((prev) => ({ ...prev, [variantId]: colorHex }));
  }

  async function guardar() {
    setGuardando(true);
    setError(null);
    try {
      const payload = variantes.map((v) => ({
        variantId: v.id,
        colorHex: colores[v.id] ?? null,
      }));
      const res = await fetch(`/api/admin/productos/${handle}/colores`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ colores: payload }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No se pudieron guardar los colores.");
      }
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setGuardando(false);
    }
  }

  if (variantes.length === 0) {
    return (
      <p className="text-sm text-ceniza">
        Este producto no tiene variantes en Shopify.
      </p>
    );
  }

  if (cargando) {
    return (
      <div className="flex items-center gap-2 text-carbon-suave">
        <Spinner /> Cargando colores...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-ceniza">
        Color propio por variante, editable libremente aqui. Si la variante ya
        tiene un color nativo configurado en Shopify, este color tiene prioridad
        en la tienda mientras esté asignado.
      </p>

      <div className="flex flex-col gap-2">
        {variantes.map((variante) => {
          const colorActual = colores[variante.id] ?? null;
          return (
            <div
              key={variante.id}
              className="flex items-center gap-3 rounded-[4px] border border-arena p-3"
            >
              <input
                type="color"
                value={
                  HEX_REGEX.test(colorActual ?? "")
                    ? (colorActual as string)
                    : COLOR_DEFAULT
                }
                onChange={(e) => setColor(variante.id, e.target.value)}
                className="h-9 w-9 shrink-0 cursor-pointer rounded border border-arena bg-transparent p-0"
                aria-label={`Color de ${variante.title}`}
              />
              <span className="min-w-0 flex-1 text-sm text-carbon">
                {variante.title}
              </span>
              <input
                type="text"
                value={colorActual ?? ""}
                onChange={(e) => setColor(variante.id, e.target.value || null)}
                placeholder="Sin color"
                className="w-28 rounded-[4px] border border-arena bg-blanco px-2 py-1.5 text-xs text-carbon focus:outline-none focus:border-dorado"
              />
              {colorActual && (
                <button
                  type="button"
                  onClick={() => setColor(variante.id, null)}
                  className="shrink-0 text-xs text-error"
                >
                  Quitar
                </button>
              )}
            </div>
          );
        })}
      </div>

      {error && <p className="text-sm text-error">{error}</p>}
      {showToast && (
        <p className="text-sm text-dorado-oscuro">Colores guardados.</p>
      )}

      <Button onClick={guardar} disabled={guardando} className="self-start">
        {guardando ? "Guardando..." : "Guardar colores"}
      </Button>
    </div>
  );
}

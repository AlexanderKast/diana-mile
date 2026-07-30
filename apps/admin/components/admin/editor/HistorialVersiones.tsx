"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ProductLandingContent } from "@diana-mile/shared/types";

type Version = {
  id: string;
  autor: string | null;
  created_at: string;
  contenido: ProductLandingContent;
};

/**
 * Historial de versiones de una landing: quien guardo, cuando, y restaurar.
 * Restaurar hace un PUT normal (que archiva la version actual antes), asi
 * que restaurar tambien es reversible.
 */
export default function HistorialVersiones({
  referencia,
  saveEndpoint,
  envolverEnContenido = false,
}: {
  referencia: string;
  saveEndpoint: string;
  envolverEnContenido?: boolean;
}) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [versiones, setVersiones] = useState<Version[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function abrir() {
    setAbierto((v) => !v);
    if (abierto || versiones.length > 0) return;
    setCargando(true);
    try {
      const res = await fetch(
        `/api/admin/landings/versiones?referencia=${encodeURIComponent(referencia)}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo cargar.");
      setVersiones(data.versiones);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar.");
    } finally {
      setCargando(false);
    }
  }

  async function restaurar(version: Version) {
    const seguro = window.confirm(
      `¿Restaurar la versión del ${new Date(version.created_at).toLocaleString("es-CO")}? El diseño actual queda archivado en el historial (nada se pierde).`,
    );
    if (!seguro) return;
    try {
      const res = await fetch(saveEndpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          envolverEnContenido
            ? { contenido: version.contenido }
            : version.contenido,
        ),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No se pudo restaurar.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al restaurar.");
    }
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={abrir}
        className="text-xs text-ceniza hover:text-carbon underline"
      >
        {abierto ? "Ocultar historial" : "Historial de versiones"}
      </button>
      {abierto && (
        <div className="mt-2 border border-arena rounded-[4px] bg-blanco p-3 max-w-md">
          {cargando && <p className="text-xs text-ceniza">Cargando...</p>}
          {error && <p className="text-xs text-error">{error}</p>}
          {!cargando && versiones.length === 0 && !error && (
            <p className="text-xs text-ceniza">
              Sin versiones anteriores todavia — se archivan con cada guardado.
            </p>
          )}
          {versiones.map((v) => (
            <div
              key={v.id}
              className="flex items-center justify-between gap-3 border-b border-arena/60 last:border-0 py-1.5"
            >
              <span className="text-xs text-carbon-suave">
                {new Date(v.created_at).toLocaleString("es-CO", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {v.autor && <span className="text-ceniza"> · {v.autor}</span>}
              </span>
              <button
                type="button"
                onClick={() => restaurar(v)}
                className="text-xs text-dorado-oscuro hover:underline"
              >
                Restaurar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

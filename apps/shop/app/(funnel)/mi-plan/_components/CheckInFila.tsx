"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconoCheck } from "./icons";

/**
 * Fila de check-in para /mi-plan/progreso — version compacta del mismo
 * patron de CheckInSemana.tsx (mismo endpoint, misma logica optimista),
 * pero como una fila de lista en vez de un boton grande de detalle: la
 * pantalla de progreso muestra las 8 semanas de un vistazo.
 */
export function CheckInFila({
  semana,
  titulo,
  completadaInicial,
}: {
  semana: number;
  titulo: string;
  completadaInicial: boolean;
}) {
  const router = useRouter();
  const [completada, setCompletada] = useState(completadaInicial);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  async function alternar() {
    if (enviando) return;
    setError("");
    setEnviando(true);
    const nuevoValor = !completada;
    setCompletada(nuevoValor);

    try {
      const res = await fetch("/api/mi-plan/progreso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ semana, completada: nuevoValor }),
      });

      if (!res.ok) {
        setCompletada(!nuevoValor);
        const data = await res.json().catch(() => null);
        setError(data?.mensaje ?? "No se pudo guardar.");
        return;
      }

      router.refresh();
    } catch {
      setCompletada(!nuevoValor);
      setError("Sin conexion.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <li className="flex flex-col gap-1 rounded-xl border border-arena px-4 py-3">
      <div className="flex min-h-[44px] items-center gap-3">
        <button
          type="button"
          onClick={alternar}
          disabled={enviando}
          aria-pressed={completada}
          aria-label={`Marcar semana ${semana} como ${completada ? "no completada" : "completada"}`}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors disabled:opacity-60 ${
            completada
              ? "border-verde-ok bg-verde-ok/15 text-verde-ok"
              : "border-arena text-transparent hover:border-dorado"
          }`}
        >
          <IconoCheck className="shrink-0" />
        </button>
        <span className="flex-1 text-sm text-carbon">
          Semana {semana} — {titulo}
        </span>
      </div>
      {error && (
        <p className="pl-11 text-xs text-error" role="alert">
          {error}
        </p>
      )}
    </li>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@diana-mile/shared/ui/Spinner";
import { IconoCheck } from "./icons";

/**
 * Boton de check-in: marca/desmarca una semana como completada llamando a
 * /api/mi-plan/progreso (el cliente NO puede escribir plan_progreso
 * directo — esa tabla solo tiene politica de lectura propia, ver
 * lib/mi-plan.ts). `router.refresh()` vuelve a pedir los Server Components
 * de la pagina para que el resto de la UI (candados, "Completada") quede
 * en sync sin recargar toda la app.
 */
export function CheckInSemana({
  semana,
  completadaInicial,
}: {
  semana: number;
  completadaInicial: boolean;
}) {
  const router = useRouter();
  const [completada, setCompletada] = useState(completadaInicial);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  async function alternar() {
    setError("");
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
        setError(data?.mensaje ?? "No pudimos guardar tu check-in.");
        return;
      }

      startTransition(() => router.refresh());
    } catch {
      setCompletada(!nuevoValor);
      setError("No pudimos conectar. Revisa tu internet.");
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={alternar}
        disabled={pending}
        aria-pressed={completada}
        className={`flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-colors disabled:opacity-60 ${
          completada
            ? "border-verde-ok bg-verde-ok/10 text-verde-ok"
            : "border-carbon text-carbon hover:bg-crema"
        }`}
      >
        {pending ? <Spinner /> : completada && <IconoCheck className="shrink-0" />}
        {completada ? "Semana completada" : "Marcar como completada"}
      </button>
      {error && (
        <p className="text-center text-xs text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

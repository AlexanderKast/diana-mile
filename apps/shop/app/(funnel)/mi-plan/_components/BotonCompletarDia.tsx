"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@diana-mile/shared/ui/Spinner";
import { IconoCheck } from "./icons";

/**
 * Boton "completar el dia" DENTRO de una semana del plan (Fase 22) — mismo
 * patron que BotonCompletarReto (mi-plan/reto), pero contra
 * /api/mi-plan/progreso con `dia` en el body en vez de /api/reto/completar.
 * El cliente no puede escribir `plan_progreso` directo (solo lectura propia,
 * ver lib/mi-plan.ts); la ruta valida sesion y dia desbloqueado, y escribe
 * con service_role.
 */
export function BotonCompletarDia({
  semana,
  dia,
  completadoInicial,
}: {
  semana: number;
  dia: number;
  completadoInicial: boolean;
}) {
  const router = useRouter();
  const [completado, setCompletado] = useState(completadoInicial);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  async function alternar() {
    setError("");
    const nuevoValor = !completado;
    setCompletado(nuevoValor);

    try {
      const res = await fetch("/api/mi-plan/progreso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ semana, dia, completada: nuevoValor }),
      });

      if (!res.ok) {
        setCompletado(!nuevoValor);
        const data = await res.json().catch(() => null);
        setError(data?.mensaje ?? "No pudimos guardar tu progreso.");
        return;
      }

      startTransition(() => router.refresh());
    } catch {
      setCompletado(!nuevoValor);
      setError("No pudimos conectar. Revisa tu internet.");
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={alternar}
        disabled={pending}
        aria-pressed={completado}
        className={`flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-colors disabled:opacity-60 ${
          completado
            ? "border-verde-ok bg-verde-ok/10 text-verde-ok"
            : "border-carbon text-carbon hover:bg-crema"
        }`}
      >
        {pending ? (
          <Spinner />
        ) : (
          completado && <IconoCheck className="shrink-0 animate-check-pop" />
        )}
        {completado ? "Dia completado" : "Marcar dia hecho"}
      </button>
      {error && (
        <p className="text-center text-xs text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

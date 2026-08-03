"use client";

import { useState, useTransition, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@diana-mile/shared/ui/Spinner";
import { prefiereMenosMovimiento } from "@/lib/quiz/movimiento";
import { IconoCheck } from "../../_components/icons";

type EstiloConVariables = CSSProperties & { [variable: `--${string}`]: string };

/**
 * Mismas 8 particulas trigonometricas del payoff del quiz (PasoPayoff.tsx)
 * — la celebracion de "dia completado" reusa ese lenguaje visual en vez de
 * inventar uno nuevo.
 */
const PARTICULAS = [0, 45, 90, 135, 180, 225, 270, 315].map((angulo, i) => {
  const radianes = (angulo * Math.PI) / 180;
  const radio = 34 + (i % 3) * 4;
  return {
    tx: Math.cos(radianes) * radio,
    ty: Math.sin(radianes) * radio,
    color: ["var(--dorado-oscuro)", "var(--morado)", "var(--lila)"][i % 3],
    demoraMs: (i % 4) * 35,
  };
});

/**
 * Boton "completar el dia" del reto de 7 dias — mismo patron que
 * CheckInSemana.tsx (mi-plan/_components), pero contra
 * /api/reto/completar en vez de /api/mi-plan/progreso. El cliente no puede
 * escribir `reto_progreso` directo (esa tabla solo tiene politica de
 * lectura propia, ver lib/reto.ts); la ruta valida sesion y escribe con
 * service_role.
 *
 * Al MARCAR (no al desmarcar) dispara un estallido corto de particulas
 * centrado en el boton — celebracion de logro, mismo patron visual que los
 * payoffs del quiz. Con prefers-reduced-motion no se dispara.
 */
export function BotonCompletarReto({
  dia,
  completadoInicial,
}: {
  dia: number;
  completadoInicial: boolean;
}) {
  const router = useRouter();
  const [completado, setCompletado] = useState(completadoInicial);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  // Contador que remonta el estallido en cada marcado (key en el wrapper).
  const [celebracion, setCelebracion] = useState(0);

  async function alternar() {
    setError("");
    const nuevoValor = !completado;
    setCompletado(nuevoValor);
    if (nuevoValor && !prefiereMenosMovimiento()) {
      setCelebracion((c) => c + 1);
    }

    try {
      const res = await fetch("/api/reto/completar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dia, completado: nuevoValor }),
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
      <div className="relative">
        {celebracion > 0 && (
          <div
            key={celebracion}
            className="pointer-events-none absolute inset-0 overflow-visible"
            aria-hidden="true"
          >
            {PARTICULAS.map((particula, i) => (
              <span
                key={i}
                className="animate-payoff-particula absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full"
                style={
                  {
                    backgroundColor: particula.color,
                    animationDelay: `${particula.demoraMs}ms`,
                    "--tx": `${particula.tx}px`,
                    "--ty": `${particula.ty}px`,
                  } as EstiloConVariables
                }
              />
            ))}
          </div>
        )}
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
          {pending ? <Spinner /> : completado && <IconoCheck className="shrink-0" />}
          {completado ? "Dia completado" : "Completar el dia"}
        </button>
      </div>
      {error && (
        <p className="text-center text-xs text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

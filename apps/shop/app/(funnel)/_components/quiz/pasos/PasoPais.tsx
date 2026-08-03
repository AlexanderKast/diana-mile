"use client";

import { useEffect, useRef, useState } from "react";
import { cx } from "@diana-mile/shared/utils";
import { PAISES } from "@/lib/quiz/paises";
import { prefiereMenosMovimiento } from "@/lib/quiz/movimiento";

// Mismo criterio que PasoOpcionUnica: corto para no sentirse lento, pero
// suficiente para que se vea el check antes del avance.
const RETRASO_CONFIRMACION_MS = 200;

/** Se auto-avanza al elegir, igual que opcion_unica. */
export function PasoPais({
  valor,
  onElegir,
}: {
  valor: unknown;
  onElegir: (codigo: string) => void;
}) {
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function elegir(codigo: string) {
    if (confirmando) return;

    if (prefiereMenosMovimiento()) {
      onElegir(codigo);
      return;
    }

    setConfirmando(codigo);
    timeoutRef.current = setTimeout(() => {
      onElegir(codigo);
    }, RETRASO_CONFIRMACION_MS);
  }

  return (
    <div className="flex max-h-full flex-col gap-2 overflow-y-auto">
      {PAISES.map((pais) => {
        const elegido = confirmando
          ? confirmando === pais.codigo
          : valor === pais.codigo;

        return (
          <button
            key={pais.codigo}
            type="button"
            onClick={() => elegir(pais.codigo)}
            disabled={confirmando !== null}
            aria-pressed={elegido}
            className={cx(
              "flex min-h-14 w-full items-center gap-3 rounded-2xl border-2 px-5 py-3 text-left text-base font-medium transition-colors active:scale-[0.98] disabled:active:scale-100",
              elegido
                ? "border-dorado-oscuro bg-dorado/10 text-carbon"
                : "border-arena bg-blanco text-carbon-suave hover:border-dorado",
            )}
          >
            <span className="flex-1">{pais.nombre}</span>
            {confirmando === pais.codigo && (
              <span
                className="animate-check-pop flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-dorado-oscuro text-blanco"
                aria-hidden="true"
              >
                <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6l2.5 2.5L10 3"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

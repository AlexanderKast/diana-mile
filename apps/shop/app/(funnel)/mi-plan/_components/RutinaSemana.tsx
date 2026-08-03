"use client";

import { useEffect, useState } from "react";
import { cx } from "@diana-mile/shared/utils";

/**
 * Tarjeta de rutina de la semana: las acciones como checklist marcable,
 * en formato tarjeta pensada para pantallazo/imprimir. El estado de cada
 * check vive en localStorage (por semana) — es un apoyo personal, no
 * progreso "oficial"; lo oficial sigue siendo el check-in semanal que si
 * persiste en la BD.
 */
export function RutinaSemana({
  semana,
  acciones,
}: {
  semana: number;
  acciones: string[];
}) {
  const claveStorage = `milito_rutina_semana_${semana}`;
  const [marcadas, setMarcadas] = useState<boolean[]>(() =>
    acciones.map(() => false),
  );

  useEffect(() => {
    try {
      const guardado = localStorage.getItem(claveStorage);
      if (guardado) {
        const parseado = JSON.parse(guardado) as boolean[];
        if (Array.isArray(parseado)) {
          setMarcadas(acciones.map((_, i) => Boolean(parseado[i])));
        }
      }
    } catch {
      // Best-effort: sin localStorage la checklist simplemente arranca vacia.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claveStorage]);

  function alternar(indice: number) {
    setMarcadas((previas) => {
      const nuevas = previas.map((v, i) => (i === indice ? !v : v));
      try {
        localStorage.setItem(claveStorage, JSON.stringify(nuevas));
      } catch {
        // No-op.
      }
      return nuevas;
    });
  }

  const completadas = marcadas.filter(Boolean).length;

  return (
    <div className="rounded-2xl border-2 border-dorado bg-crema p-4">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-dorado-oscuro">
          Tu rutina de la semana
        </span>
        <span className="text-xs text-carbon-suave">
          {completadas}/{acciones.length}
        </span>
      </div>
      <ul className="mt-3 flex flex-col gap-1">
        {acciones.map((accion, i) => (
          <li key={accion}>
            <button
              type="button"
              onClick={() => alternar(i)}
              aria-pressed={marcadas[i]}
              className="flex min-h-[44px] w-full items-start gap-2.5 rounded-lg px-1 py-2 text-left transition-colors hover:bg-blanco/60"
            >
              <span
                className={cx(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2",
                  marcadas[i]
                    ? "border-dorado-oscuro bg-dorado-oscuro text-blanco"
                    : "border-arena bg-blanco",
                )}
                aria-hidden="true"
              >
                {marcadas[i] && (
                  <svg
                    className="animate-check-pop"
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M2 6l2.5 2.5L10 3"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              <span
                className={cx(
                  "text-sm",
                  marcadas[i] ? "text-carbon-suave line-through" : "text-carbon",
                )}
              >
                {accion}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

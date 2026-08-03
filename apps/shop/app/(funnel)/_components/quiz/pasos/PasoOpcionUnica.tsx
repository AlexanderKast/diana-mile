"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cx } from "@diana-mile/shared/utils";
import type { PasoOpcionUnica as TipoPaso } from "@/lib/quiz/tipos";
import { prefiereMenosMovimiento } from "@/lib/quiz/movimiento";
import { IconoOpcion } from "./IconoOpcion";

// Tiempo que la persona alcanza a ver su eleccion confirmada (borde dorado +
// check) antes de que el paso cambie. Corto a proposito: mas largo se siente
// lento, mas corto no da tiempo a percibirlo.
const RETRASO_CONFIRMACION_MS = 200;

/** Se auto-avanza al elegir — no necesita boton de continuar aparte. */
export function PasoOpcionUnica({
  paso,
  valor,
  onElegir,
}: {
  paso: TipoPaso;
  valor: unknown;
  onElegir: (valor: string) => void;
}) {
  // Opcion recien clickeada, pendiente de disparar el avance — es lo que
  // deja "ver" el check antes de que la pantalla cambie.
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function elegir(opcionValor: string) {
    if (confirmando) return; // ya hay un avance en curso, ignorar reclicks

    if (prefiereMenosMovimiento()) {
      onElegir(opcionValor);
      return;
    }

    setConfirmando(opcionValor);
    timeoutRef.current = setTimeout(() => {
      onElegir(opcionValor);
    }, RETRASO_CONFIRMACION_MS);
  }

  // Layout de tarjetas con foto (estilo muscle-booster) SOLO cuando todas
  // las opciones del paso traen imagen — mezclar tarjetas y filas en el
  // mismo paso leeria roto, asi que una sola opcion sin imagen degrada el
  // paso completo al layout de lista.
  const conImagenes = paso.opciones.every((o) => o.imagenUrl);

  if (conImagenes) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {paso.opciones.map((opcion) => {
          const elegida = confirmando
            ? confirmando === opcion.valor
            : valor === opcion.valor;

          return (
            <button
              key={opcion.valor}
              type="button"
              onClick={() => elegir(opcion.valor)}
              disabled={confirmando !== null}
              aria-pressed={elegida}
              className={cx(
                "flex flex-col overflow-hidden rounded-2xl border-2 text-left transition-colors active:scale-[0.98] disabled:active:scale-100",
                elegida
                  ? "border-dorado-oscuro bg-dorado/10"
                  : "border-arena bg-blanco hover:border-dorado",
              )}
            >
              <span className="relative block aspect-[4/3] w-full">
                <Image
                  src={opcion.imagenUrl!}
                  alt=""
                  fill
                  sizes="(max-width: 448px) 50vw, 224px"
                  className="object-cover"
                />
                {confirmando === opcion.valor && (
                  <span
                    className="animate-check-pop absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-dorado-oscuro text-blanco"
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
              </span>
              <span
                className={cx(
                  "flex min-h-[44px] flex-1 items-center px-3 py-2 text-sm font-medium",
                  elegida ? "text-carbon" : "text-carbon-suave",
                )}
              >
                {opcion.etiqueta}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {paso.opciones.map((opcion) => {
        const elegida = confirmando
          ? confirmando === opcion.valor
          : valor === opcion.valor;

        return (
          <button
            key={opcion.valor}
            type="button"
            onClick={() => elegir(opcion.valor)}
            disabled={confirmando !== null}
            aria-pressed={elegida}
            className={cx(
              "flex min-h-14 w-full items-center gap-3 rounded-2xl border-2 px-5 py-3 text-left text-base font-medium transition-colors active:scale-[0.98] disabled:active:scale-100",
              elegida
                ? "border-dorado-oscuro bg-dorado/10 text-carbon"
                : "border-arena bg-blanco text-carbon-suave hover:border-dorado",
            )}
          >
            {opcion.icono && (
              <IconoOpcion
                clave={opcion.icono}
                className={cx(
                  "shrink-0",
                  elegida ? "text-dorado-oscuro" : "text-carbon-suave",
                )}
              />
            )}
            <span className="flex-1">
              {opcion.etiqueta}
              {opcion.descripcion && (
                <span className="mt-0.5 block text-xs text-ceniza">
                  {opcion.descripcion}
                </span>
              )}
            </span>
            {confirmando === opcion.valor && (
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

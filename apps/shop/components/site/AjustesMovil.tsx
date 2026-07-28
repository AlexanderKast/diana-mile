"use client";

import { useEffect, useState } from "react";
import { PushOptIn } from "@/components/site/PushOptIn";

/**
 * Ajustes de la tienda en el movil.
 *
 * Existe por lo que pasa con las notificaciones: el permiso se ofrece una
 * vez, al instalar, y quien dice que no —o quien lo cierra sin mirar— se
 * queda sin forma de activarlo despues. El navegador tampoco lo vuelve a
 * proponer solo. Sin este acceso, la unica salida seria desinstalar y
 * volver a instalar, que no lo hace nadie.
 *
 * Va en el header y solo en movil: en escritorio las notificaciones de una
 * tienda no aportan gran cosa, y el header de escritorio ya tiene sus
 * enlaces.
 */

function IconoTuerca() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export function AjustesMovil() {
  const [abierto, setAbierto] = useState(false);

  // Cerrar con Escape: en movil casi no aplica, pero el panel tambien sale
  // en tablets con teclado y quedarse sin salida es peor que el codigo.
  useEffect(() => {
    if (!abierto) return;
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, [abierto]);

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        aria-label="Ajustes"
        aria-expanded={abierto}
        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-carbon-suave transition-colors hover:bg-crema hover:text-carbon md:hidden"
      >
        <IconoTuerca />
      </button>

      {abierto && (
        <>
          <button
            type="button"
            aria-label="Cerrar ajustes"
            onClick={() => setAbierto(false)}
            className="fixed inset-0 z-[60] bg-carbon/30 md:hidden"
          />
          <div
            role="dialog"
            aria-label="Ajustes"
            className="fixed inset-x-0 bottom-0 z-[70] rounded-t-2xl border-t border-arena bg-blanco p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:hidden"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display text-xl text-carbon">Ajustes</p>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                aria-label="Cerrar"
                className="min-h-[44px] min-w-[44px] text-lg text-ceniza"
              >
                ✕
              </button>
            </div>

            <PushOptIn
              titulo="Notificaciones"
              descripcion="Te avisamos cuando tu pedido cambie de estado. Sin promociones."
            />

            <p className="mt-4 text-xs text-ceniza">
              Si ya las bloqueaste, actívalas desde los ajustes del navegador:
              el permiso no se puede volver a pedir desde aquí.
            </p>
          </div>
        </>
      )}
    </>
  );
}

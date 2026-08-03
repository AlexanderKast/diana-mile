"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Spinner } from "@diana-mile/shared/ui/Spinner";
import type { PasoCargando as TipoPaso } from "@/lib/quiz/tipos";

/**
 * Avanza sola: no pide interaccion, solo muestra progreso durante
 * `duracionMs` y llama a `onCompletar`. Con `logros` (las etapas nombradas
 * que la persona completo en el quiz) los muestra apareciendo uno a uno —
 * la "coleccion" final antes del resultado. Honesto por construccion: los
 * logros son las secciones que de verdad respondio, nada inventado.
 */
export function PasoCargando({
  paso,
  logros = [],
  onCompletar,
}: {
  paso: TipoPaso;
  logros?: string[];
  onCompletar: () => void;
}) {
  // Con logros a mostrar, la pantalla se toma un poco mas de tiempo para
  // que alcancen a aparecer (300ms por logro extra sobre la duracion base).
  const duracion = (paso.duracionMs ?? 1500) + logros.length * 300;
  const mensajes = paso.mensajes ?? [];
  const [mensajeIndice, setMensajeIndice] = useState(0);

  useEffect(() => {
    const timeoutFinal = setTimeout(onCompletar, duracion);

    const intervaloMensajes =
      mensajes.length > 1
        ? setInterval(
            () => setMensajeIndice((i) => (i + 1) % mensajes.length),
            Math.max(600, duracion / mensajes.length),
          )
        : undefined;

    return () => {
      clearTimeout(timeoutFinal);
      if (intervaloMensajes) clearInterval(intervaloMensajes);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paso.id]);

  return (
    <div className="relative flex min-h-[40vh] w-full flex-col items-center justify-center gap-4 overflow-hidden text-carbon-suave">
      {/* Textura decorativa, muy sutil — no compite con el spinner ni el
          texto. Unica pantalla del quiz con espacio vacio de sobra, por eso
          va aca y no en los payoff (que ya tienen su propia animacion). */}
      <Image
        src={paso.imagenUrl ?? "/images/quiz/fondo_payoff.png"}
        alt=""
        fill
        sizes="400px"
        priority={false}
        className="-z-10 object-cover opacity-[0.08]"
        aria-hidden="true"
      />
      <Spinner className="h-8 w-8 text-dorado-oscuro" />
      {mensajes.length > 0 && (
        <p className="text-center text-sm">{mensajes[mensajeIndice]}</p>
      )}

      {logros.length > 0 && (
        <ul className="mt-2 flex w-full max-w-xs flex-col gap-2">
          {logros.map((logro, i) => (
            <li
              key={logro}
              className="animate-fade-in-up flex items-center gap-2.5 rounded-xl border border-dorado bg-crema px-4 py-2.5 text-sm text-carbon opacity-0 [animation-fill-mode:forwards]"
              style={{ animationDelay: `${300 + i * 300}ms` }}
            >
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-dorado-oscuro text-blanco"
                aria-hidden="true"
              >
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6l2.5 2.5L10 3"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              {logro} — completado
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

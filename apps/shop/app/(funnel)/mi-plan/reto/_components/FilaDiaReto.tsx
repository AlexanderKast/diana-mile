"use client";

import { useState } from "react";
import Link from "next/link";
import { IconoCheck, IconoChevron } from "../../_components/icons";
import { BotonCompletarReto } from "./BotonCompletarReto";

/**
 * Un dia YA DESBLOQUEADO del reto: fila clickeable que expande su contenido
 * (texto en voz de Milito + CTA segun el dia + boton de completar). El dia
 * de hoy arranca expandido; los demas, colapsados pero abribles — asi la
 * pantalla no se llena de texto de una, importante porque la mayoria abre
 * esto desde un link de WhatsApp con poco alto util.
 */
export function FilaDiaReto({
  dia,
  titulo,
  contenido,
  completadoInicial,
  esHoy,
  hrefRitual,
  hrefComunidad,
  mostrarCtaCoaching,
  notaDespacho,
}: {
  dia: number;
  titulo: string;
  contenido: string;
  completadoInicial: boolean;
  esHoy: boolean;
  /** Link a la categoria real del ritual (solo zona_oferta co_cod). */
  hrefRitual?: string | null;
  /** Link de invitacion a la comunidad de WhatsApp (dia 7, co_cod). */
  hrefComunidad?: string | null;
  /** Dia 7, zona_oferta usd_premium: CTA a /coach. */
  mostrarCtaCoaching?: boolean;
  /** Linea de despacho real, sin cuenta regresiva falsa (dia 5, co_cod). */
  notaDespacho?: string | null;
}) {
  const [abierto, setAbierto] = useState(esHoy);

  return (
    <li className="rounded-xl border border-arena">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        className="flex min-h-[44px] w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
            completadoInicial
              ? "bg-verde-ok/15 text-verde-ok"
              : esHoy
                ? "bg-dorado/20 text-dorado-oscuro"
                : "bg-crema text-carbon-suave"
          }`}
        >
          {completadoInicial ? <IconoCheck /> : dia}
        </span>
        <span className="flex-1">
          <span className="block text-sm text-carbon">
            Dia {dia} — {titulo}
          </span>
          {esHoy && (
            <span className="text-xs font-semibold uppercase tracking-wide text-dorado-oscuro">
              Hoy
            </span>
          )}
        </span>
        <IconoChevron className={`shrink-0 text-ceniza transition-transform ${abierto ? "rotate-180" : ""}`} />
      </button>

      {abierto && (
        <div className="flex flex-col gap-3 px-4 pb-4">
          <p className="whitespace-pre-line text-sm text-carbon-suave">{contenido}</p>

          {hrefRitual && (
            <Link
              href={hrefRitual}
              className="btn-shine flex min-h-[44px] w-full items-center justify-center rounded-lg bg-dorado-oscuro px-6 py-3 text-sm font-semibold text-blanco shadow-[0_4px_14px_rgba(168,136,94,0.35)] transition-all hover:bg-dorado active:scale-[0.97]"
            >
              Ver productos del ritual
            </Link>
          )}

          {notaDespacho && <p className="text-xs text-ceniza">{notaDespacho}</p>}

          {mostrarCtaCoaching && (
            <Link
              href="/coach"
              className="btn-shine flex min-h-[44px] w-full items-center justify-center rounded-lg bg-dorado-oscuro px-6 py-3 text-sm font-semibold text-blanco shadow-[0_4px_14px_rgba(168,136,94,0.35)] transition-all hover:bg-dorado active:scale-[0.97]"
            >
              Conoce el coaching
            </Link>
          )}

          {hrefComunidad && (
            <a
              href={hrefComunidad}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[44px] w-full items-center justify-center rounded-lg border border-arena px-6 py-3 text-sm font-semibold text-carbon transition-colors hover:bg-crema"
            >
              Unirme a la comunidad
            </a>
          )}

          <BotonCompletarReto dia={dia} completadoInicial={completadoInicial} />
        </div>
      )}
    </li>
  );
}

"use client";

import { useMemo, type CSSProperties } from "react";
import Image from "next/image";
import { cx } from "@diana-mile/shared/utils";
import type { PasoPayoff as TipoPaso } from "@/lib/quiz/tipos";
import { prefiereMenosMovimiento } from "@/lib/quiz/movimiento";

type EstiloConVariables = CSSProperties & { [variable: `--${string}`]: string };

/**
 * Posiciones fijas de las 8 particulas del "estallido" — nada de librerias:
 * es trigonometria basica (coseno/seno) para repartirlas en circulo. Radios
 * cortos (34-42px) a proposito, para que quepan sin desbordar el wrapper de
 * 112px (h-28 w-28) con overflow-hidden.
 */
const PARTICULAS = [0, 45, 90, 135, 180, 225, 270, 315].map((angulo, i) => {
  const radianes = (angulo * Math.PI) / 180;
  const radio = 34 + (i % 3) * 4; // 34 / 38 / 42 — variacion sutil, no perfectamente circular
  return {
    tx: Math.cos(radianes) * radio,
    ty: Math.sin(radianes) * radio,
    color: ["var(--dorado-oscuro)", "var(--morado)", "var(--lila)"][i % 3],
    demoraMs: (i % 4) * 35, // pequeno desfase para que no salgan todas a la vez
  };
});

/**
 * Llegada a un payoff (pasos 5 y 10 de la puerta piel): insignia central con
 * "pop" + un estallido corto de particulas, luego el contenido de siempre.
 * Es el unico momento del quiz que se siente como un logro en vez de una
 * pregunta mas — por eso el enfasis visual, una sola vez al montar el paso
 * (QuizRunner ya remonta este bloque en cada cambio de pasoActualId).
 */
export function PasoPayoff({ paso }: { paso: TipoPaso }) {
  // Se lee una sola vez al montar: el paso completo se remonta al cambiar,
  // asi que no hace falta un listener de cambios en vivo.
  const menosMovimiento = useMemo(() => prefiereMenosMovimiento(), []);

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Imagen ambiente opcional (Fase 17) — aspect fijo para cero CLS. */}
      {paso.imagenUrl && (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-arena">
          <Image
            src={paso.imagenUrl}
            alt=""
            fill
            sizes="(max-width: 448px) 100vw, 448px"
            className="object-cover"
          />
        </div>
      )}

      <div className="relative h-28 w-28 shrink-0 overflow-hidden">
        {!menosMovimiento &&
          PARTICULAS.map((particula, i) => (
            <span
              key={i}
              aria-hidden="true"
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

        <span
          className={cx(
            "absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-dorado bg-gradient-to-br from-dorado/15 to-lila-suave text-dorado-oscuro",
            !menosMovimiento && "animate-payoff-badge-pop",
          )}
          aria-hidden="true"
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2z" />
          </svg>
        </span>
      </div>

      <ul className="flex w-full flex-col gap-3">
        {paso.contenido.map((linea) => (
          <li
            key={linea}
            className="flex items-start gap-2.5 text-base text-carbon-suave"
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-dorado-oscuro" />
            {linea}
          </li>
        ))}
      </ul>
    </div>
  );
}

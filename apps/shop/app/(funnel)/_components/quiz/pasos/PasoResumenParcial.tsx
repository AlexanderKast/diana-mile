"use client";

import { cx } from "@diana-mile/shared/utils";
import type { QuizPuerta, RespuestasQuiz } from "@/lib/quiz/tipos";
import { CONTRATOS_RESULTADO } from "@/lib/quiz/puertas/contratos";
import type { DimensionHabito } from "@/lib/quiz/puertas/ficha-segmento";

/**
 * Dashboard intermedio del quiz (estilo muscle-booster: el "summary of your
 * fitness level" a mitad de camino): las barras de habito del contrato de
 * la puerta, calculadas con lo respondido HASTA AHORA. Las dimensiones sin
 * dato muestran "Sin dato" (las funciones `dimensionesHabito` ya lo
 * manejan) — cero invencion, es un espejo de sus respuestas. El boton de
 * continuar lo pinta QuizRunner (mismo patron que los payoff).
 */

const COLOR_POR_TONO: Record<DimensionHabito["tono"], string> = {
  bien: "bg-verde-ok",
  atencion: "bg-dorado-oscuro",
  alerta: "bg-morado",
};

export function PasoResumenParcial({
  puertaId,
  respuestas,
}: {
  puertaId: QuizPuerta;
  respuestas: RespuestasQuiz;
}) {
  const dimensiones = CONTRATOS_RESULTADO[puertaId]
    .dimensionesHabito(respuestas)
    // Solo lo que de verdad respondio hasta este punto del quiz.
    .filter((d) => d.valorMostrado !== "Sin dato");

  if (dimensiones.length === 0) {
    return (
      <p className="text-center text-sm text-carbon-suave">
        Sigamos — tus habitos se resumen al final.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {dimensiones.map((dimension) => (
        <div key={dimension.etiqueta} className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-sm text-carbon">{dimension.etiqueta}</span>
            <span className="text-xs font-semibold text-carbon-suave">
              {dimension.valorMostrado}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-arena">
            <div
              className={cx(
                "h-full rounded-full transition-[width] duration-500 ease-out",
                COLOR_POR_TONO[dimension.tono],
              )}
              style={{
                width: `${Math.round(Math.min(1, Math.max(0, dimension.fraccion)) * 100)}%`,
              }}
            />
          </div>
        </div>
      ))}
      <p className="text-xs text-ceniza">
        Esto es lo que nos contaste hasta ahora — no es un examen clinico, es
        tu punto de partida.
      </p>
    </div>
  );
}

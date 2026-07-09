"use client";

import { useState } from "react";
import { cx } from "@diana-mile/shared/utils";

type TipoPiel = "normal" | "grasa" | "seca";

const OPCIONES: { id: TipoPiel; label: string }[] = [
  { id: "normal", label: "Piel normal/mixta" },
  { id: "grasa", label: "Piel grasa" },
  { id: "seca", label: "Piel seca/sensible" },
];

const MENSAJES: Record<TipoPiel, string> = {
  normal: "Perfecto. El Epoch® controla brillos y refina poros sin resecar.",
  grasa: "Ideal para ti. La arcilla marina absorbe el exceso de sebo sin dañar la barrera.",
  seca: "Sin jabón y sin sulfatos — suave y nutritivo incluso para piel delicada.",
};

export function SkinTypeSelector() {
  const [seleccion, setSeleccion] = useState<TipoPiel | null>(null);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-carbon">¿Cuál es tu tipo de piel?</p>
      <div className="flex flex-wrap gap-2">
        {OPCIONES.map((op) => (
          <button
            key={op.id}
            type="button"
            onClick={() => setSeleccion(op.id)}
            className={cx(
              "rounded-full border-[1.5px] px-3.5 py-1.5 text-xs font-medium transition-colors",
              seleccion === op.id
                ? "border-morado bg-lila-suave text-morado-oscuro"
                : "border-arena text-carbon-suave hover:border-morado/50"
            )}
          >
            {op.label}
          </button>
        ))}
      </div>
      {seleccion && (
        <p className="animate-fade-in-up rounded-lg border-l-[3px] border-dorado bg-crema px-3 py-2 text-xs text-carbon-suave">
          ✓ {MENSAJES[seleccion]}
        </p>
      )}
    </div>
  );
}

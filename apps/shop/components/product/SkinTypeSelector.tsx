"use client";

import { useState } from "react";
import { cx } from "@diana-mile/shared/utils";
import type { LandingSkinType } from "@diana-mile/shared/types";

export function SkinTypeSelector({ data }: { data: LandingSkinType }) {
  const [seleccion, setSeleccion] = useState<string | null>(null);

  if (data.options.length === 0) return null;

  const mensaje = data.options.find((op) => op.id === seleccion)?.message;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-carbon">{data.question}</p>
      <div className="flex flex-wrap gap-2">
        {data.options.map((op) => (
          <button
            key={op.id}
            type="button"
            onClick={() => setSeleccion(op.id)}
            className={cx(
              "rounded-full border-[1.5px] px-3.5 py-1.5 text-xs font-medium transition-colors",
              seleccion === op.id
                ? "border-morado bg-lila-suave text-morado-oscuro"
                : "border-arena text-carbon-suave hover:border-morado/50",
            )}
          >
            {op.label}
          </button>
        ))}
      </div>
      {mensaje && (
        <p className="animate-fade-in-up rounded-lg border-l-[3px] border-dorado bg-crema px-3 py-2 text-xs text-carbon-suave">
          ✓ {mensaje}
        </p>
      )}
    </div>
  );
}

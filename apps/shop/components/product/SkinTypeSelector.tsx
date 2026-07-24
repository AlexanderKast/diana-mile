"use client";

import { cx } from "@diana-mile/shared/utils";
import type { LandingSkinType } from "@diana-mile/shared/types";
import { useOrderSheet } from "@/components/product/OrderSheetContext";

/**
 * La seleccion se guarda en OrderSheetContext (no estado local) para que el
 * resto de la pagina (titulo, beneficios, resultados) pueda personalizarse
 * segun la respuesta — ver page.tsx.
 */
export function SkinTypeSelector({ data }: { data: LandingSkinType }) {
  const { selectedSkinTypeId, selectSkinType } = useOrderSheet();

  if (data.options.length === 0) return null;

  const mensaje = data.options.find((op) => op.id === selectedSkinTypeId)?.message;

  return (
    <div className="flex flex-col items-center gap-2 text-center md:items-start md:text-left">
      <p className="text-sm font-medium text-carbon">{data.question}</p>
      <div className="flex flex-wrap justify-center gap-2 md:justify-start">
        {data.options.map((op) => (
          <button
            key={op.id}
            type="button"
            onClick={() => selectSkinType(op.id)}
            className={cx(
              "rounded-md border-[1.5px] px-3.5 py-1.5 text-xs font-medium shadow-[0_1px_3px_rgba(26,23,20,0.12)] transition-colors",
              selectedSkinTypeId === op.id
                ? "border-morado bg-lila-suave text-morado-oscuro"
                : "border-arena bg-blanco text-carbon-suave hover:border-morado/50",
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

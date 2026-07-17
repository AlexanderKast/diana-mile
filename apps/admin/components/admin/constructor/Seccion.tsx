"use client";

import type { ReactNode } from "react";

type SeccionProps = {
  titulo: string;
  descripcion?: string;
  defaultOpen?: boolean;
  children: ReactNode;
  toggle?: {
    activo: boolean;
    onChange: (activo: boolean) => void;
    label?: string;
  };
};

/**
 * Bloque colapsable del constructor de landing. Si recibe `toggle`, es una
 * seccion-objeto opcional de ProductLandingContent (ingredientStory,
 * skinType, etc.) — al desactivarla se omite del guardado pero sus valores
 * se conservan en memoria por si se vuelve a activar.
 */
export default function Seccion({
  titulo,
  descripcion,
  defaultOpen = false,
  children,
  toggle,
}: SeccionProps) {
  return (
    <details
      open={defaultOpen}
      className="border border-arena rounded-[4px] bg-blanco"
    >
      <summary className="cursor-pointer select-none px-4 py-3 flex items-center justify-between gap-3">
        <div>
          <span className="font-display text-lg text-carbon">{titulo}</span>
          {descripcion && (
            <p className="text-xs text-ceniza mt-0.5">{descripcion}</p>
          )}
        </div>
        {toggle && (
          <label
            className="flex items-center gap-2 text-xs text-ceniza shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={toggle.activo}
              onChange={(e) => toggle.onChange(e.target.checked)}
            />
            {toggle.label ?? "Usar esta sección"}
          </label>
        )}
      </summary>
      <div className="px-4 pb-4 pt-1 border-t border-arena/60">
        {toggle && !toggle.activo ? (
          <p className="text-xs text-ceniza py-2">
            Sección desactivada — no se incluirá en la landing.
          </p>
        ) : (
          children
        )}
      </div>
    </details>
  );
}

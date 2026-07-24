"use client";

import type { LandingSkinType } from "@diana-mile/shared/types";
import { useOrderSheet } from "@/components/product/OrderSheetContext";

/**
 * Cambio real de contenido (no solo un titulo) segun lo que la persona
 * respondio en "¿Cual es tu tipo de piel?" — reusa el mensaje que ya existe
 * en el metafield para esa opcion (`landing.skinType.options[].message`),
 * nunca inventa un claim nuevo. Vacio hasta que haya seleccion.
 */
export function PersonalizedBenefitCard({
  skinType,
}: {
  skinType: LandingSkinType | null;
}) {
  const { selectedSkinTypeId } = useOrderSheet();

  if (!skinType || !selectedSkinTypeId) return null;

  const option = skinType.options.find((o) => o.id === selectedSkinTypeId);
  if (!option) return null;

  return (
    <div
      id="beneficio-personalizado"
      className="animate-fade-in-up flex items-start gap-3 rounded-2xl border-[1.5px] border-morado bg-lila-suave p-4"
    >
      <span className="mt-0.5 shrink-0 rounded-full bg-morado px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blanco">
        Para ti
      </span>
      <p className="text-sm text-morado-oscuro">
        <strong>{option.label}:</strong> {option.message}
      </p>
    </div>
  );
}

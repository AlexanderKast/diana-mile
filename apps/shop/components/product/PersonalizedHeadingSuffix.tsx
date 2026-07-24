"use client";

import type { LandingSkinType } from "@diana-mile/shared/types";
import { useOrderSheet } from "@/components/product/OrderSheetContext";

/**
 * Sufijo que se agrega a un encabezado ("Beneficios", "Que esperar de tu
 * ritual") una vez la persona elige su tipo de piel — reusa el `label` que
 * ya existe en el metafield (ej. "Piel grasa"), no inventa copy nuevo.
 * Vacio hasta que haya seleccion, para no romper el layout server-rendered.
 */
export function PersonalizedHeadingSuffix({
  skinType,
}: {
  skinType: LandingSkinType | null;
}) {
  const { selectedSkinTypeId } = useOrderSheet();

  if (!skinType || !selectedSkinTypeId) return null;

  const label = skinType.options.find((o) => o.id === selectedSkinTypeId)?.label;
  if (!label) return null;

  return (
    <span className="block text-sm font-normal text-morado-oscuro mt-1">
      Pensado para tu {label.toLowerCase()}
    </span>
  );
}

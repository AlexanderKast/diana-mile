"use client";

import { useOrderSheet } from "@/components/product/OrderSheetContext";

/**
 * Boton de pedido suelto del constructor visual. En productos contraentrega
 * abre el OrderBottomSheet; en vitrina el bloque recibe el enlace de
 * WhatsApp resuelto en el servidor y navega alla.
 */
export function BotonCTABlock({
  etiqueta,
  enlaceVitrina,
}: {
  etiqueta: string;
  enlaceVitrina: string | null;
}) {
  const { openOrderSheet } = useOrderSheet();

  const clase =
    "btn-shine cta-pulse inline-flex items-center justify-center gap-2 min-h-[44px] px-8 rounded-lg bg-dorado-oscuro text-blanco text-base font-semibold tracking-wide shadow-[0_4px_14px_rgba(168,136,94,0.35)] transition-all duration-200 hover:bg-dorado hover:scale-[1.03] active:scale-[0.97]";

  return (
    <div className="flex justify-center px-6 py-4">
      {enlaceVitrina ? (
        <a href={enlaceVitrina} className={clase}>
          {etiqueta}
        </a>
      ) : (
        <button type="button" onClick={() => openOrderSheet()} className={clase}>
          {etiqueta}
        </button>
      )}
    </div>
  );
}

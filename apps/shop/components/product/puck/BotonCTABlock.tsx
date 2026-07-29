"use client";

import type { EstiloBotonCta } from "@diana-mile/shared/landing/puck-contract";
import { clasesBotonCta } from "@diana-mile/shared/landing/blocks/Primitivos";
import { useOrderSheet } from "@/components/product/OrderSheetContext";

/**
 * Boton de pedido suelto del constructor visual, personalizable (color,
 * estilo, efecto, tamano). En productos contraentrega abre el
 * OrderBottomSheet; en vitrina navega al enlace de WhatsApp resuelto en el
 * servidor.
 */
export function BotonCTABlock({
  etiqueta,
  enlaceVitrina,
  ...estilos
}: EstiloBotonCta & {
  etiqueta: string;
  enlaceVitrina: string | null;
}) {
  const { openOrderSheet } = useOrderSheet();
  const clase = clasesBotonCta(estilos);

  return (
    <div
      className={`flex px-6 py-4 ${estilos.anchoBoton === "completo" ? "" : "justify-center"}`}
    >
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

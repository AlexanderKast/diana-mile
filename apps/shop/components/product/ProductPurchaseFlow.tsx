"use client";

import { formatCOP } from "@diana-mile/shared/utils";
import { useOrderSheet } from "@/components/product/OrderSheetContext";

/**
 * CTA sticky movil (CTA 1). El selector de variantes y el formulario COD
 * viven en components/product/VariantSelector.tsx y
 * components/form/OrderBottomSheet.tsx respectivamente, compartiendo el
 * mismo estado via OrderSheetContext.
 */
export function ProductPurchaseFlow() {
  const { product, selectedVariant, selectedIsNuskin, openOrderSheet } = useOrderSheet();

  function openNuskin() {
    if (product.metafields.nuskinDirectUrl) {
      window.open(product.metafields.nuskinDirectUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <>
      <div
        className="cta-pulse fixed bottom-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-center bg-dorado text-carbon shadow-[0_-6px_24px_rgba(168,136,94,0.45)] md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {selectedIsNuskin ? (
          <button
            type="button"
            onClick={openNuskin}
            className="flex h-full w-full items-center justify-center text-lg font-bold tracking-wide"
          >
            Comprar en Nu Skin ↗
          </button>
        ) : (
          <button
            type="button"
            onClick={() => openOrderSheet()}
            className="btn-shine flex h-full w-full items-center justify-center gap-1.5 text-lg font-bold tracking-wide"
          >
            Pedir ahora ·{" "}
            <span className="font-display text-xl">{formatCOP(selectedVariant?.price ?? product.price)}</span>
          </button>
        )}
      </div>
      <div className="h-16 md:hidden" />
    </>
  );
}

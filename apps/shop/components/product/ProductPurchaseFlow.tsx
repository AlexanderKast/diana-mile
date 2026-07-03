"use client";

import { formatCOP } from "@diana-mile/shared/utils";
import { useOrderSheet } from "@/components/product/OrderSheetContext";

function BagIcon({ className }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M5.5 6.5h9l.7 9.5a1.5 1.5 0 0 1-1.5 1.6H6.3a1.5 1.5 0 0 1-1.5-1.6l.7-9.5z" strokeLinejoin="round" />
      <path d="M7.3 6.5V5a2.7 2.7 0 0 1 5.4 0v1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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
            className="cta-pulse-morado flex h-full w-full items-center justify-center text-lg font-bold tracking-wide"
          >
            Comprar en Nu Skin ↗
          </button>
        ) : (
          <button
            type="button"
            onClick={() => openOrderSheet()}
            className="btn-shine flex h-full w-full items-center justify-center gap-1.5 text-lg font-bold tracking-wide"
          >
            <BagIcon />
            Pedir ahora ·{" "}
            <span className="font-display text-xl">{formatCOP(selectedVariant?.price ?? product.price)}</span>
          </button>
        )}
      </div>
      <div className="h-16 md:hidden" />
    </>
  );
}

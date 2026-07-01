"use client";

import Image from "next/image";
import { TouchEvent, useEffect, useRef, useState } from "react";
import { formatCOP, cx } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { CODForm } from "@/components/form/CODForm";
import { VariantSelector } from "@/components/product/VariantSelector";
import { useOrderSheet } from "@/components/product/OrderSheetContext";

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <line x1="4" y1="4" x2="16" y2="16" strokeLinecap="round" />
      <line x1="16" y1="4" x2="4" y2="16" strokeLinecap="round" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="4.5" y="9" width="11" height="8" rx="1.5" />
      <path d="M6.5 9V6a3.5 3.5 0 0 1 7 0v3" strokeLinecap="round" />
    </svg>
  );
}

function OrderSummary() {
  const { product, selectedVariant } = useOrderSheet();
  if (!selectedVariant) return null;

  return (
    <div className="flex items-center gap-3 rounded-[4px] border border-arena bg-crema p-3">
      <div className="relative h-[52px] w-[52px] shrink-0 overflow-hidden rounded-[2px] bg-arena">
        {product.images[0] && (
          <Image
            src={product.images[0].url}
            alt={product.images[0].altText ?? product.title}
            fill
            className="object-cover"
          />
        )}
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-carbon">{product.title}</span>
        <span className="text-xs text-ceniza">{selectedVariant.title}</span>
        <span className="font-display text-lg text-carbon">{formatCOP(selectedVariant.price)}</span>
      </div>
    </div>
  );
}

function NuskinPanel() {
  const { product } = useOrderSheet();

  function openNuskin() {
    if (product.metafields.nuskinDirectUrl) {
      window.open(product.metafields.nuskinDirectUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-[4px] border border-arena bg-crema p-4">
      <h3 className="font-display text-lg text-carbon">¿Eres distribuidora Nu Skin?</h3>
      <p className="text-sm text-carbon-suave">
        Compra a precio de distribuidora directamente en la plataforma oficial de Nu Skin y
        acumula tus puntos con nuestro link.
      </p>
      <Button
        variant="secondary"
        type="button"
        onClick={openNuskin}
        className="border-morado! text-morado! hover:bg-lila-suave!"
      >
        Comprar en Nu Skin ↗
      </Button>
    </div>
  );
}

function SheetContent({ compact }: { compact: boolean }) {
  const { product, selectedVariant, selectedIsNuskin } = useOrderSheet();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="font-display text-xl text-carbon mb-2">Resumen del pedido</h3>
        <OrderSummary />
        <p className="mt-2 text-xs text-ceniza">Pago al recibir tu pedido</p>
      </div>

      <VariantSelector compact={compact} />

      {selectedIsNuskin ? (
        <NuskinPanel />
      ) : (
        selectedVariant && <CODForm product={product} selectedVariant={selectedVariant} />
      )}

      <p className="flex items-center justify-center gap-1.5 text-xs text-ceniza">
        <LockIcon className="text-ceniza" />
        Datos seguros · Pago al recibir
      </p>
    </div>
  );
}

export function OrderBottomSheet() {
  const { isOpen, closeOrderSheet } = useOrderSheet();
  const touchStartY = useRef<number | null>(null);
  const [dragY, setDragY] = useState(0);

  useEffect(() => {
    if (isOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [isOpen]);

  function handleTouchStart(e: TouchEvent<HTMLDivElement>) {
    touchStartY.current = e.touches[0].clientY;
  }

  function handleTouchMove(e: TouchEvent<HTMLDivElement>) {
    if (touchStartY.current === null) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0) setDragY(delta);
  }

  function handleTouchEnd() {
    if (dragY > 80) {
      closeOrderSheet();
    }
    setDragY(0);
    touchStartY.current = null;
  }

  return (
    <>
      {/* Backdrop movil */}
      <div
        className={cx(
          "fixed inset-0 z-[60] bg-carbon/60 transition-opacity duration-300 md:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={closeOrderSheet}
        aria-hidden="true"
      />

      {/* Bandeja movil */}
      <div
        className={cx(
          "fixed bottom-0 left-0 right-0 z-[70] max-h-[85vh] overflow-y-auto rounded-t-[16px] bg-blanco transition-transform duration-300 ease-out md:hidden",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
        style={{
          paddingBottom: "max(16px, env(safe-area-inset-bottom))",
          transform: isOpen && dragY > 0 ? `translateY(${dragY}px)` : undefined,
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Completa tu pedido"
      >
        <div
          className="flex items-center justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="h-1 w-10 rounded-full bg-arena" />
        </div>

        <div className="flex items-center justify-between px-5 pb-2">
          <span className="font-display text-lg text-carbon">Completa tu pedido</span>
          <button
            type="button"
            onClick={closeOrderSheet}
            aria-label="Cerrar"
            className="flex h-11 w-11 items-center justify-center text-carbon-suave"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="px-5 pb-6">
          <SheetContent compact />
        </div>
      </div>

      {/* Panel sticky desktop */}
      <div
        id="order-form-desktop"
        className="hidden md:block md:sticky md:top-[120px] rounded-[4px] border border-arena bg-blanco p-5"
      >
        <SheetContent compact={false} />
      </div>
    </>
  );
}

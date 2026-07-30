"use client";

import type { LandingSkinType } from "@diana-mile/shared/types";
import { formatCOP } from "@diana-mile/shared/utils";
import { ENTREGA_BADGE } from "@diana-mile/shared/logistica/despacho";
import { useOrderSheet } from "@/components/product/OrderSheetContext";
import { ScarcityBar } from "@/components/product/ScarcityBar";
import { AuthenticitySeals } from "@/components/product/AuthenticitySeals";

function LockIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="4.5" y="9" width="11" height="8" rx="1.5" />
      <path d="M6.5 9V6a3.5 3.5 0 0 1 7 0v3" strokeLinecap="round" />
    </svg>
  );
}

function BagIcon({ className }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M5.5 6.5h9l.7 9.5a1.5 1.5 0 0 1-1.5 1.6H6.3a1.5 1.5 0 0 1-1.5-1.6l.7-9.5z" strokeLinejoin="round" />
      <path d="M7.3 6.5V5a2.7 2.7 0 0 1 5.4 0v1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <path d="M10 2.5 4.5 4.8v4.4c0 3.3 2.3 6.4 5.5 7.3 3.2-.9 5.5-4 5.5-7.3V4.8L10 2.5Z" strokeLinejoin="round" />
      <path d="m7.6 9.9 1.7 1.7 3.1-3.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ReturnIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M4 6.5h9a4.5 4.5 0 0 1 0 9h-2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 3.5 4 6.5l3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Precio con ancla (compareAtPrice), CTA principal y micro-drivers de
 * confianza/urgencia. Reemplaza el selector completo en el primer
 * pantallazo: elegir pack pasa a resolverse dentro del bottom sheet.
 */
export function ProductHeroCTA({
  showAuthenticity = false,
  skinType = null,
}: {
  showAuthenticity?: boolean;
  skinType?: LandingSkinType | null;
}) {
  const { product, selectedVariant, openOrderSheet, selectedSkinTypeId } = useOrderSheet();
  const variant = selectedVariant ?? product.variants[0];
  const selectedSkinLabel = skinType?.options.find((o) => o.id === selectedSkinTypeId)?.label;

  const discountPct =
    variant?.compareAtPrice && parseFloat(variant.compareAtPrice) > 0
      ? Math.round((1 - parseFloat(variant.price) / parseFloat(variant.compareAtPrice)) * 100)
      : null;

  return (
    <div className="flex flex-col gap-3">
      {variant && (
        <div className="flex flex-col items-center gap-1.5 md:items-start">
          <div className="flex items-end justify-center gap-3 flex-wrap md:justify-start">
            <span className="font-display text-[42px] font-black leading-none text-carbon">
              {formatCOP(variant.price)}
            </span>
            <div className="flex flex-col gap-1 pb-0.5">
              {variant.compareAtPrice && (
                <span className="text-sm text-ceniza line-through">{formatCOP(variant.compareAtPrice)}</span>
              )}
              {discountPct !== null && discountPct > 0 && (
                <span className="w-fit rounded-md bg-morado px-2 py-0.5 text-xs font-bold text-blanco">
                  -{discountPct}% OFF
                </span>
              )}
            </div>
          </div>
          <div className="linea-dorada w-14" />
          {product.metafields.ahorroPack3 && (
            <p className="text-xs font-medium text-dorado-oscuro">
              🎁 {product.metafields.ahorroPack3} comprando por pack de 3
            </p>
          )}
        </div>
      )}

      {selectedSkinLabel && (
        <p className="animate-fade-in-up text-center text-xs text-morado-oscuro">
          Tu elección: <strong>{selectedSkinLabel}</strong>
        </p>
      )}

      {/* Distintivo de contraentrega: en un catalogo donde conviven productos
          COD y de vitrina, esto le confirma de entrada en cual esta. */}
      <div className="flex items-center justify-center gap-1.5 self-center rounded-lg bg-lila-suave px-3 py-1.5 text-xs font-semibold text-morado md:self-start">
        <ShieldIcon />
        Pagas al recibir
      </div>

      <button
        type="button"
        onClick={() => openOrderSheet()}
        className="btn-shine cta-pulse flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-dorado-oscuro text-blanco text-lg font-bold uppercase tracking-wide shadow-[0_6px_20px_rgba(168,136,94,0.5)] ring-2 ring-dorado-oscuro/20 transition-all duration-200 hover:bg-dorado hover:scale-[1.02] hover:shadow-[0_10px_28px_rgba(168,136,94,0.6)] active:scale-[0.97]"
      >
        <BagIcon />
        Pedir ahora · Contraentrega
      </button>

      <div className="flex items-center justify-center gap-1.5 text-xs text-ceniza">
        <LockIcon className="text-ceniza" />
        Pago al recibir · {ENTREGA_BADGE}
      </div>

      <ScarcityBar />

      <div className="md:hidden">
        <AuthenticitySeals showAuthenticity={showAuthenticity} />
      </div>

      <div className="flex items-center justify-center gap-1.5 text-xs text-ceniza">
        <ReturnIcon className="text-ceniza" />
        ¿Llega malo o no te funciona? Lo reponemos sin costo adicional
      </div>
    </div>
  );
}

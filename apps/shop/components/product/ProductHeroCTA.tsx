"use client";

import { formatCOP } from "@diana-mile/shared/utils";
import { useOrderSheet } from "@/components/product/OrderSheetContext";

function LockIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="4.5" y="9" width="11" height="8" rx="1.5" />
      <path d="M6.5 9V6a3.5 3.5 0 0 1 7 0v3" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M10 5.5V10l3 2" strokeLinecap="round" strokeLinejoin="round" />
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
export function ProductHeroCTA() {
  const { product, selectedVariant, openOrderSheet } = useOrderSheet();
  const variant = selectedVariant ?? product.variants[0];

  const discountPct =
    variant?.compareAtPrice && parseFloat(variant.compareAtPrice) > 0
      ? Math.round((1 - parseFloat(variant.price) / parseFloat(variant.compareAtPrice)) * 100)
      : null;

  return (
    <div className="flex flex-col gap-3">
      {variant && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-display text-4xl font-semibold text-dorado-oscuro">
            {formatCOP(variant.price)}
          </span>
          {variant.compareAtPrice && (
            <span className="text-base text-ceniza line-through">{formatCOP(variant.compareAtPrice)}</span>
          )}
          {discountPct !== null && discountPct > 0 && (
            <span className="rounded-md bg-morado px-2.5 py-1 text-xs font-bold text-blanco">
              -{discountPct}% OFF
            </span>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => openOrderSheet()}
        className="btn-shine cta-pulse flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-dorado-oscuro text-blanco text-base font-semibold tracking-wide shadow-[0_4px_14px_rgba(168,136,94,0.35)] transition-all duration-200 hover:bg-dorado hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(168,136,94,0.5)] active:scale-[0.97]"
      >
        <BagIcon />
        Pedir ahora · Contraentrega
      </button>

      <div className="flex items-center justify-center gap-1.5 text-xs text-ceniza">
        <LockIcon className="text-ceniza" />
        Pago al recibir · Envío 24-72h
      </div>

      <div className="flex items-center justify-center gap-1.5 text-xs text-morado-oscuro">
        <ClockIcon className="text-morado-oscuro" />
        Stock limitado — los pedidos de esta semana se despachan primero
      </div>

      <div className="flex items-center justify-center gap-1.5 text-xs text-ceniza">
        <ReturnIcon className="text-ceniza" />
        ¿Llega en mal estado? Lo reponemos sin costo adicional
      </div>
    </div>
  );
}

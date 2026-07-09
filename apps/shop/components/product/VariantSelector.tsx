"use client";

import { KeyboardEvent, useMemo, useRef } from "react";
import type { Product, ProductVariant } from "@diana-mile/shared/types";
import { formatCOP, cx } from "@diana-mile/shared/utils";
import { useOrderSheet } from "@/components/product/OrderSheetContext";

function ExternalArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 14L14 6" />
      <path d="M8 6h6v6" />
    </svg>
  );
}

type PackSize = 1 | 2 | 3 | null;

function getPackSize(title: string): PackSize {
  const t = title.toLowerCase();
  if (t.includes("3")) return 3;
  if (t.includes("2")) return 2;
  if (t.includes("1 unidad") || t.includes("1 und")) return 1;
  return null;
}

function getVariantSubtitle(variant: ProductVariant, product: Product) {
  const pack = getPackSize(variant.title);

  if (pack === 1) {
    return <span className="text-xs text-ceniza">Empieza tu ritual</span>;
  }

  if (pack === 2 && product.metafields.ahorroPack2) {
    return <span className="text-xs text-ceniza">{product.metafields.ahorroPack2}</span>;
  }

  if (pack === 3 && product.metafields.ahorroPack3) {
    return <span className="text-xs text-ceniza">{product.metafields.ahorroPack3}</span>;
  }

  return null;
}

function unitPriceLabel(variant: ProductVariant, pack: PackSize) {
  if (!pack || pack === 1) return null;
  const unit = parseFloat(variant.price) / pack;
  return `${formatCOP(unit)} por unidad`;
}

type VariantSelectorProps = {
  compact?: boolean;
};

export function VariantSelector({ compact = false }: VariantSelectorProps) {
  const { product, selectedVariantId, selectedIsNuskin, selectVariant, selectNuskin } = useOrderSheet();

  const hasNuskinDirect = Boolean(product.metafields.nuskinDirectUrl);

  // Anclaje de precio: se muestra primero el pack de mayor valor (Pack 3),
  // luego Pack 2, luego 1 unidad — asi los packs chicos parecen mas baratos
  // en comparacion, en vez de ordenar por el ID/precio ascendente de Shopify.
  const orderedVariants = useMemo(
    () => [...product.variants].sort((a, b) => parseFloat(b.price) - parseFloat(a.price)),
    [product.variants]
  );

  const radioIds = useMemo(() => {
    const ids = orderedVariants.map((v) => v.id);
    return hasNuskinDirect ? [...ids, "nuskin"] : ids;
  }, [orderedVariants, hasNuskinDirect]);

  const radioRefs = useRef(new Map<string, HTMLDivElement>());
  const currentRadioId = selectedIsNuskin ? "nuskin" : selectedVariantId;

  function selectById(id: string) {
    if (id === "nuskin") {
      selectNuskin();
    } else {
      selectVariant(id);
    }
    radioRefs.current.get(id)?.focus();
  }

  function handleCardKeyDown(e: KeyboardEvent<HTMLDivElement>, id: string, onSelect: () => void) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect();
      return;
    }

    if (["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"].includes(e.key)) {
      e.preventDefault();
      const currentIndex = radioIds.indexOf(id);
      const direction = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
      const nextIndex = (currentIndex + direction + radioIds.length) % radioIds.length;
      selectById(radioIds[nextIndex]);
    }
  }

  const cardPadding = compact ? "p-3" : "p-4";
  const gap = compact ? "gap-2" : "gap-3";

  return (
    <div>
      {!compact && <h2 className="font-display text-lg text-carbon mb-3">Elige tu ritual</h2>}

      <div role="radiogroup" aria-label="Elige tu ritual" className={cx("flex flex-col", gap)}>
        {orderedVariants.map((variant) => {
          const isSelected = !selectedIsNuskin && variant.id === selectedVariantId;
          const subtitle = !compact ? getVariantSubtitle(variant, product) : null;
          const pack = getPackSize(variant.title);
          const isMejorValor = pack === 3;
          const isPopular = pack === 2;
          const unitLabel = !compact ? unitPriceLabel(variant, pack) : null;

          return (
            <div
              key={variant.id}
              ref={(node) => {
                if (node) radioRefs.current.set(variant.id, node);
                else radioRefs.current.delete(variant.id);
              }}
              role="radio"
              aria-checked={isSelected}
              tabIndex={variant.id === currentRadioId ? 0 : -1}
              onClick={() => selectVariant(variant.id)}
              onKeyDown={(e) => handleCardKeyDown(e, variant.id, () => selectVariant(variant.id))}
              className={cx(
                "relative flex cursor-pointer flex-col gap-1.5 rounded-2xl border-[1.5px] transition-colors",
                cardPadding,
                isMejorValor ? "border-morado" : "border-arena",
                isSelected && (isMejorValor ? "bg-lila-suave" : "border-morado bg-crema")
              )}
            >
              {isMejorValor && !compact && (
                <span className="absolute -top-2.5 right-3 rounded-lg bg-morado px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blanco">
                  Favorito
                </span>
              )}
              {isPopular && !compact && (
                <span className="absolute -top-2.5 right-3 rounded-lg bg-dorado px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-carbon">
                  Más popular
                </span>
              )}

              {isMejorValor && !compact && (
                <span className="text-[10px] font-bold uppercase tracking-wide text-morado">
                  ★ Mejor valor
                </span>
              )}

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-arena">
                    {isSelected && <span className="h-2.5 w-2.5 rounded-full bg-morado" />}
                  </span>
                  <span className="text-sm font-medium text-carbon">{variant.title}</span>
                </div>
                <span className="flex items-baseline gap-1.5">
                  {variant.compareAtPrice && (
                    <span className="text-sm text-ceniza line-through">
                      {formatCOP(variant.compareAtPrice)}
                    </span>
                  )}
                  <span
                    className={cx(
                      "font-display font-semibold text-dorado-oscuro",
                      compact ? "text-lg" : "text-xl"
                    )}
                  >
                    {formatCOP(variant.price)}
                  </span>
                </span>
              </div>

              {unitLabel && (
                <div className="pl-8 text-xs text-ceniza">{unitLabel}</div>
              )}
              {subtitle && <div className="pl-8">{subtitle}</div>}

              {isMejorValor && !compact && (
                <div className="pl-8 flex flex-col gap-0.5 text-xs text-carbon-suave">
                  <span>✓ Ritual para 90 días</span>
                  <span>✓ Ideal para regalar</span>
                </div>
              )}
            </div>
          );
        })}

        {hasNuskinDirect && (
          <div
            ref={(node) => {
              if (node) radioRefs.current.set("nuskin", node);
              else radioRefs.current.delete("nuskin");
            }}
            role="radio"
            aria-checked={selectedIsNuskin}
            tabIndex={currentRadioId === "nuskin" ? 0 : -1}
            onClick={selectNuskin}
            onKeyDown={(e) => handleCardKeyDown(e, "nuskin", selectNuskin)}
            className={cx(
              "flex cursor-pointer flex-col gap-1.5 rounded-2xl border-[1.5px] border-arena transition-colors",
              cardPadding,
              selectedIsNuskin && "border-morado bg-crema"
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-arena">
                  {selectedIsNuskin && <span className="h-2.5 w-2.5 rounded-full bg-morado" />}
                </span>
                <span className="flex items-center gap-1.5 text-sm font-medium text-carbon">
                  Compra directo en Nu Skin
                  <ExternalArrowIcon className="text-dorado-oscuro" />
                </span>
              </div>
              {product.metafields.nuskinDirectPrecio && !compact && (
                <span className="font-display text-lg text-carbon">
                  {product.metafields.nuskinDirectPrecio}
                </span>
              )}
            </div>
            {!compact && (
              <div className="pl-8">
                <span className="text-xs text-ceniza">Precio distribuidora · Acumulas puntos Nu Skin</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

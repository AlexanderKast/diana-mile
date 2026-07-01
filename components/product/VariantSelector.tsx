"use client";

import { KeyboardEvent, useMemo, useRef } from "react";
import type { Product, ProductVariant } from "@/types";
import { formatCOP, cx } from "@/lib/utils";
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

function getVariantSubtitle(variant: ProductVariant, product: Product) {
  const title = variant.title.toLowerCase();

  if (title.includes("1 unidad")) {
    return <span className="text-xs text-ceniza">Empieza tu ritual</span>;
  }

  if (title.includes("2")) {
    if (!product.metafields.ahorroPack2) return null;
    return (
      <span className="flex items-center gap-2">
        <span className="text-xs text-ceniza">{product.metafields.ahorroPack2}</span>
        <span className="rounded-[2px] bg-morado px-2 py-0.5 text-[10px] text-blanco">POPULAR</span>
      </span>
    );
  }

  if (title.includes("3")) {
    if (!product.metafields.ahorroPack3) return null;
    return (
      <span className="flex items-center gap-2">
        <span className="text-xs text-ceniza">{product.metafields.ahorroPack3}</span>
        <span className="rounded-[2px] bg-morado-oscuro px-2 py-0.5 text-[10px] text-blanco">
          MEJOR VALOR
        </span>
      </span>
    );
  }

  return null;
}

type VariantSelectorProps = {
  compact?: boolean;
};

export function VariantSelector({ compact = false }: VariantSelectorProps) {
  const { product, selectedVariantId, selectedIsNuskin, selectVariant, selectNuskin } = useOrderSheet();

  const hasNuskinDirect = Boolean(product.metafields.nuskinDirectUrl);

  const radioIds = useMemo(() => {
    const ids = product.variants.map((v) => v.id);
    return hasNuskinDirect ? [...ids, "nuskin"] : ids;
  }, [product.variants, hasNuskinDirect]);

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
        {product.variants.map((variant) => {
          const isSelected = !selectedIsNuskin && variant.id === selectedVariantId;
          const subtitle = !compact ? getVariantSubtitle(variant, product) : null;

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
                "flex cursor-pointer flex-col gap-1.5 rounded-[4px] border-[1.5px] border-arena transition-colors",
                cardPadding,
                isSelected && "border-morado bg-crema"
              )}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-arena">
                    {isSelected && <span className="h-2.5 w-2.5 rounded-full bg-morado" />}
                  </span>
                  <span className="text-sm font-medium text-carbon">{variant.title}</span>
                </div>
                <span className={cx("font-display text-carbon", compact ? "text-base" : "text-lg")}>
                  {formatCOP(variant.price)}
                </span>
              </div>
              {subtitle && <div className="pl-8">{subtitle}</div>}
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
              "flex cursor-pointer flex-col gap-1.5 rounded-[4px] border-[1.5px] border-arena transition-colors",
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

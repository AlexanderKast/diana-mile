"use client";

import Image from "next/image";
import { KeyboardEvent, useMemo, useRef, useState } from "react";
import { Product, ProductVariant } from "@/types";
import { formatCOP, cx } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { CODForm } from "@/components/form/CODForm";

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

export function ProductPurchaseFlow({ product }: { product: Product }) {
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product.variants[0]?.id ?? ""
  );
  const [selectedIsNuskin, setSelectedIsNuskin] = useState(false);

  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0];

  const hasNuskinDirect = Boolean(product.metafields.nuskinDirectUrl);

  const radioIds = useMemo(() => {
    const ids = product.variants.map((v) => v.id);
    return hasNuskinDirect ? [...ids, "nuskin"] : ids;
  }, [product.variants, hasNuskinDirect]);

  const radioRefs = useRef(new Map<string, HTMLDivElement>());
  const currentRadioId = selectedIsNuskin ? "nuskin" : selectedVariantId;

  function selectVariant(variantId: string) {
    setSelectedVariantId(variantId);
    setSelectedIsNuskin(false);
  }

  function selectNuskin() {
    setSelectedIsNuskin(true);
  }

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

  function openNuskin() {
    if (product.metafields.nuskinDirectUrl) {
      window.open(product.metafields.nuskinDirectUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-lg text-carbon mb-3">Elige tu ritual</h2>

        <div role="radiogroup" aria-label="Elige tu ritual" className="flex flex-col gap-3">
          {product.variants.map((variant) => {
            const isSelected = !selectedIsNuskin && variant.id === selectedVariantId;
            const subtitle = getVariantSubtitle(variant, product);

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
                  "flex cursor-pointer flex-col gap-1.5 rounded-[4px] border-[1.5px] border-arena p-4 transition-colors",
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
                  <span className="font-display text-lg text-carbon">
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
                "flex cursor-pointer flex-col gap-1.5 rounded-[4px] border-[1.5px] border-arena p-4 transition-colors",
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
                {product.metafields.nuskinDirectPrecio && (
                  <span className="font-display text-lg text-carbon">
                    {product.metafields.nuskinDirectPrecio}
                  </span>
                )}
              </div>
              <div className="pl-8">
                <span className="text-xs text-ceniza">Precio distribuidora · Acumulas puntos Nu Skin</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {hasNuskinDirect && (
        <div className="rounded-[4px] border border-arena bg-crema p-5">
          <h3 className="font-display text-xl text-carbon">¿Eres distribuidora Nu Skin?</h3>
          <p className="mt-2 text-sm text-carbon-suave">
            Compra a precio de distribuidora directamente en la plataforma oficial de Nu Skin y
            acumula tus puntos con nuestro link.
          </p>
          <Button
            variant="secondary"
            type="button"
            onClick={openNuskin}
            className="mt-4 border-morado! text-morado! hover:bg-lila-suave!"
          >
            Comprar en Nu Skin ↗
          </Button>
          <p className="mt-3 text-xs text-ceniza">
            Seras redirigida a Nu Skin. Los puntos se cargan a nuestra linea automaticamente.
          </p>
        </div>
      )}

      {!selectedIsNuskin && selectedVariant && (
        <div id="pedir" className="flex flex-col gap-4">
          <h2 className="font-display text-2xl text-carbon">Completa tu pedido</h2>

          <div className="flex items-center gap-4 rounded-[4px] border border-arena bg-crema p-4">
            <div className="relative h-[60px] w-[60px] shrink-0 overflow-hidden rounded-[2px] bg-arena">
              {product.images[0] && (
                <Image
                  src={product.images[0].url}
                  alt={product.images[0].altText ?? product.title}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-carbon">{product.title}</span>
              <span className="text-xs text-ceniza">{selectedVariant.title}</span>
              <span className="font-display text-lg text-carbon">
                {formatCOP(selectedVariant.price)}
              </span>
              <span className="text-xs text-ceniza">Pago al recibir tu pedido</span>
            </div>
          </div>

          <CODForm product={product} selectedVariant={selectedVariant} />
        </div>
      )}

      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex h-14 w-full items-center justify-center bg-carbon text-blanco md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {selectedIsNuskin ? (
          <button
            type="button"
            onClick={openNuskin}
            className="flex h-full w-full items-center justify-center text-sm font-medium tracking-wide"
          >
            Comprar en Nu Skin ↗
          </button>
        ) : (
          <button
            type="button"
            onClick={() =>
              document.getElementById("pedir")?.scrollIntoView({ behavior: "smooth" })
            }
            className="flex h-full w-full items-center justify-center text-sm font-medium tracking-wide"
          >
            Pedir ahora · <span className="font-display">{formatCOP(selectedVariant?.price ?? product.price)}</span>
          </button>
        )}
      </div>

      <div className="h-14 md:hidden" />
    </div>
  );
}

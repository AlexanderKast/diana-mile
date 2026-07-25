"use client";

import Image from "next/image";
import { useState } from "react";
import { cx } from "@diana-mile/shared/utils";
import { useOrderSheet } from "./OrderSheetContext";

type GalleryImage = { url: string; altText: string | null };

const FALLBACK_IMAGE: GalleryImage = {
  url: "/images/product-epoch-hero.jpg",
  altText: "Epoch Polishing Bar",
};

export function ProductGallery({ images }: { images: GalleryImage[] }) {
  const { selectedVariant } = useOrderSheet();
  const gallery = images.length > 0 ? images : [FALLBACK_IMAGE];
  const [activeIndex, setActiveIndex] = useState(0);
  const variantImageUrl = selectedVariant?.image?.url;

  // Si la variante elegida (ej. un color) tiene su propia foto en Shopify,
  // la galeria salta a esa imagen en vez de quedarse en la generica. Se
  // ajusta durante el render (no en un efecto) para no parpadear la foto
  // vieja antes de saltar a la nueva.
  const [lastVariantImageUrl, setLastVariantImageUrl] = useState(variantImageUrl);
  if (variantImageUrl !== lastVariantImageUrl) {
    setLastVariantImageUrl(variantImageUrl);
    const index = variantImageUrl
      ? gallery.findIndex((img) => img.url === variantImageUrl)
      : -1;
    if (index !== -1) setActiveIndex(index);
  }

  const activeImage = gallery[activeIndex] ?? gallery[0];

  return (
    <div className="flex flex-col gap-2 -mx-6 md:mx-0 md:gap-3">
      {/* Imagen principal — full-bleed en mobile, columna con esquinas redondeadas en desktop */}
      <div className="relative aspect-[4/3] overflow-hidden bg-crema md:aspect-[4/5] md:w-full md:rounded-2xl">
        <Image
          key={activeIndex}
          src={activeImage.url}
          alt={activeImage.altText ?? "Imagen del producto"}
          fill
          className="object-cover transition-opacity duration-200 ease-out"
          sizes="(min-width: 768px) 50vw, 100vw"
          priority={activeIndex === 0}
        />
      </div>

      {/* Miniaturas horizontales — solo desktop */}
      {gallery.length > 1 && (
        <div className="hidden md:flex gap-2 overflow-x-auto md:justify-start" style={{ scrollbarWidth: "none" }}>
          {gallery.map((image, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Ver imagen ${index + 1}`}
              className={cx(
                "relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border transition-colors duration-200",
                index === activeIndex ? "border-dorado" : "border-arena"
              )}
            >
              <Image
                src={image.url}
                alt={image.altText ?? `Miniatura ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

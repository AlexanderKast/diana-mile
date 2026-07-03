"use client";

import Image from "next/image";
import { useState } from "react";
import { cx } from "@diana-mile/shared/utils";

type GalleryImage = { url: string; altText: string | null };

const FALLBACK_IMAGE: GalleryImage = {
  url: "/images/product-epoch-hero.jpg",
  altText: "Epoch Polishing Bar",
};

export function ProductGallery({ images }: { images: GalleryImage[] }) {
  const gallery = images.length > 0 ? images : [FALLBACK_IMAGE];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = gallery[activeIndex];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative mx-auto aspect-square w-[62%] max-w-[280px] rounded-[4px] overflow-hidden bg-crema md:mx-0 md:aspect-[4/5] md:w-full md:max-w-none">
        <Image
          key={activeIndex}
          src={activeImage.url}
          alt={activeImage.altText ?? "Imagen del producto"}
          fill
          className="object-cover transition-opacity duration-200 ease-out"
          sizes="(min-width: 768px) 50vw, 62vw"
          priority={activeIndex === 0}
        />
      </div>

      {gallery.length > 1 ? (
        <div className="flex justify-center gap-2 overflow-x-auto md:justify-start" style={{ scrollbarWidth: "none" }}>
          {gallery.map((image, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Ver imagen ${index + 1}`}
              className={cx(
                "relative shrink-0 w-16 h-16 rounded-[2px] overflow-hidden border transition-colors duration-200",
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
      ) : null}
    </div>
  );
}

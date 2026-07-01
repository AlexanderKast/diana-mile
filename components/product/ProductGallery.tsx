"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { cx } from "@/lib/utils";

type GalleryImage = { url: string; altText: string | null };

export function ProductGallery({ images }: { images: GalleryImage[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  function handleScroll() {
    const container = containerRef.current;
    if (!container) return;
    const index = Math.round(container.scrollLeft / container.clientWidth);
    setActiveIndex(index);
  }

  if (images.length === 0) {
    return <div className="relative aspect-square w-full bg-arena rounded-[2px]" />;
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex w-full aspect-square overflow-x-auto snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: "none" }}
      >
        {images.map((image, index) => (
          <div key={index} className="relative min-w-full snap-center">
            <Image
              src={image.url}
              alt={image.altText ?? `Imagen ${index + 1}`}
              fill
              className="object-cover"
              sizes="100vw"
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      {images.length > 1 ? (
        <div className="flex items-center justify-center gap-2">
          {images.map((_, index) => (
            <span
              key={index}
              className={cx(
                "h-1.5 w-1.5 rounded-full transition-colors",
                index === activeIndex ? "bg-dorado" : "bg-arena"
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { Product } from "@diana-mile/shared/types";
import { formatCOP, cx } from "@diana-mile/shared/utils";

export function ProductCard({ product }: { product: Product }) {
  const image = product.images[0];

  const minPrice =
    product.variants.length > 0
      ? product.variants.reduce(
          (min, variant) => Math.min(min, parseFloat(variant.price)),
          parseFloat(product.variants[0].price)
        )
      : parseFloat(product.price);

  const badgeLabel = product.title.includes("Epoch") ? "Epoch®" : null;

  return (
    <Link
      href={`/productos/${product.handle}`}
      className="group flex flex-col gap-3 border border-arena rounded-2xl p-3 bg-blanco shadow-[0_1px_3px_rgba(26,23,20,0.08)]"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-arena">
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? product.title}
            fill
            className="object-cover transition-transform duration-[400ms] group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : null}

        {badgeLabel ? (
          <span className="absolute top-2 left-2 bg-blanco/90 text-[10px] px-2 py-1 rounded-lg text-carbon">
            {badgeLabel}
          </span>
        ) : null}
      </div>

      <h3 className="font-display text-lg text-carbon">{product.title}</h3>
      <p className="font-display text-xl font-semibold text-dorado-oscuro">Desde {formatCOP(minPrice)}</p>

      <span
        className={cx(
          "inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 min-h-[44px]",
          "text-sm font-medium tracking-wide border border-carbon text-carbon transition-colors duration-200",
          "group-hover:bg-crema"
        )}
      >
        Ver producto
      </span>
    </Link>
  );
}

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { formatCOP } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

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
    <div className="group flex flex-col gap-3 border border-arena rounded-[4px] p-3 bg-blanco shadow-[0_1px_3px_rgba(26,23,20,0.08)]">
      <div className="relative aspect-square w-full overflow-hidden rounded-[2px] bg-arena">
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
          <span className="absolute top-2 left-2 bg-blanco/90 text-[10px] px-2 py-1 rounded-[2px] text-carbon">
            {badgeLabel}
          </span>
        ) : null}
      </div>

      <h3 className="font-display text-lg text-carbon">{product.title}</h3>
      <p className="font-display text-xl text-dorado-oscuro">Desde {formatCOP(minPrice)}</p>

      <div className="md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
        <Link href={`/productos/${product.handle}`} className="w-full">
          <Button variant="secondary" className="w-full">
            Ver producto
          </Button>
        </Link>
      </div>
    </div>
  );
}

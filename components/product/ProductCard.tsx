import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { formatCOP } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export function ProductCard({ product }: { product: Product }) {
  const image = product.images[0];

  return (
    <div className="flex flex-col gap-3 border border-arena rounded-[4px] p-3 bg-blanco shadow-[0_1px_3px_rgba(26,23,20,0.08)]">
      <div className="relative aspect-square w-full overflow-hidden rounded-[2px] bg-arena">
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? product.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : null}
      </div>

      <h3 className="font-display text-lg text-carbon">{product.title}</h3>
      <p className="font-display text-xl text-carbon">{formatCOP(product.price)}</p>

      <Link href={`/productos/${product.handle}`} className="w-full">
        <Button variant="secondary" className="w-full">
          Ver producto
        </Button>
      </Link>
    </div>
  );
}

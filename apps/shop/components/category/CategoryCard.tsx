import Image from "next/image";
import Link from "next/link";
import { Collection } from "@diana-mile/shared/types";

export function CategoryCard({ collection }: { collection: Collection }) {
  return (
    <Link
      href={`/categorias/${collection.handle}`}
      className="group relative flex aspect-[4/5] w-full overflow-hidden rounded-2xl bg-arena"
    >
      {collection.image ? (
        <Image
          src={collection.image.url}
          alt={collection.image.altText ?? collection.title}
          fill
          className="object-cover transition-transform duration-[400ms] group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 80vw, (max-width: 1024px) 50vw, 25vw"
        />
      ) : null}

      <div className="absolute inset-0 bg-gradient-to-t from-carbon/70 via-carbon/10 to-transparent" />

      <div className="relative mt-auto p-5">
        <h3 className="font-display text-xl text-blanco">{collection.title}</h3>
        <span className="mt-1 inline-block text-xs text-blanco/80">
          Explorar →
        </span>
      </div>
    </Link>
  );
}

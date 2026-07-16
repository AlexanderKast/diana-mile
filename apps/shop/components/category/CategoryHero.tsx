import Image from "next/image";
import { Collection } from "@diana-mile/shared/types";
import TrustBadges from "@/components/product/TrustBadges";

export function CategoryHero({ collection }: { collection: Collection }) {
  const eyebrow = collection.landingContent?.eyebrow ?? "Milito Life Shop";
  const tagline = collection.landingContent?.tagline ?? collection.description;

  return (
    <section className="bg-crema">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-2 md:items-center md:gap-10 md:py-16">
        {collection.image ? (
          <div className="relative order-1 aspect-[4/5] w-full overflow-hidden rounded-2xl md:order-2">
            <Image
              src={collection.image.url}
              alt={collection.image.altText ?? collection.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        ) : null}

        <div className="order-2 flex flex-col gap-3 md:order-1">
          <p className="text-[11px] uppercase tracking-wide text-ceniza">
            {eyebrow}
          </p>
          <h1 className="font-display text-3xl leading-tight text-carbon md:text-5xl">
            {collection.title}
          </h1>
          <div className="linea-dorada w-12" />
          <p className="max-w-md text-sm text-carbon-suave">{tagline}</p>
          <div className="mt-2">
            <TrustBadges />
          </div>
        </div>
      </div>

      {collection.landingContent?.storyBody ? (
        <div className="mx-auto max-w-3xl px-6 pb-12 text-center md:pb-16">
          {collection.landingContent.storyHeading ? (
            <h2 className="font-display text-xl text-carbon mb-3">
              {collection.landingContent.storyHeading}
            </h2>
          ) : null}
          <p className="text-sm leading-relaxed text-carbon-suave">
            {collection.landingContent.storyBody}
          </p>
        </div>
      ) : null}
    </section>
  );
}

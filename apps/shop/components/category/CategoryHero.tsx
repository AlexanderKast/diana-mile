import Image from "next/image";
import { Collection } from "@diana-mile/shared/types";
import TrustBadges from "@/components/product/TrustBadges";

export function CategoryHero({ collection }: { collection: Collection }) {
  const eyebrow = collection.landingContent?.eyebrow ?? "Milito Life Shop";
  const tagline = collection.landingContent?.tagline ?? collection.description;

  return (
    <section className="bg-crema">
      <div className="mx-auto grid max-w-6xl gap-7 px-5 py-9 sm:gap-8 sm:px-6 sm:py-12 md:grid-cols-2 md:items-center md:gap-10 md:py-16">
        {collection.image ? (
          // Apaisada en movil: a 4/5 y ancho completo la foto medía ~490px de
          // alto y empujaba el titulo y los sellos bajo el pliegue.
          <div className="relative order-1 aspect-[16/11] w-full overflow-hidden rounded-2xl sm:aspect-[3/2] md:order-2 md:aspect-[4/5]">
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
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-carbon-suave sm:text-[11px]">
            {eyebrow}
          </p>
          <h1 className="font-display text-[32px] leading-tight tracking-tight text-carbon text-balance sm:text-[40px] md:text-5xl">
            {collection.title}
          </h1>
          <div className="linea-dorada w-12" />
          <p className="max-w-md text-[14px] leading-relaxed text-carbon-suave sm:text-sm">
            {tagline}
          </p>
          {/* Una categoria mezcla productos contraentrega y de vitrina, asi
              que aqui NO se puede prometer "Pago al recibir": en "Kits de
              inicio" seria mentira en los 17 productos. Se muestran los
              sellos que valen para ambos. */}
          <div className="mt-2">
            <TrustBadges modo="vitrina" />
          </div>
        </div>
      </div>

      {collection.landingContent?.storyBody ? (
        <div className="mx-auto max-w-3xl px-5 pb-10 text-center sm:px-6 sm:pb-12 md:pb-16">
          {collection.landingContent.storyHeading ? (
            <h2 className="mb-3 font-display text-[20px] leading-tight text-carbon sm:text-xl">
              {collection.landingContent.storyHeading}
            </h2>
          ) : null}
          <p className="text-[14px] leading-relaxed text-carbon-suave sm:text-sm">
            {collection.landingContent.storyBody}
          </p>
        </div>
      ) : null}
    </section>
  );
}

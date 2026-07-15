import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductByHandle } from "@/lib/shopify";
import { resolveLanding } from "@/lib/product-content";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductBenefits } from "@/components/product/ProductBenefits";
import { ProductPurchaseFlow } from "@/components/product/ProductPurchaseFlow";
import { ProductHeroCTA } from "@/components/product/ProductHeroCTA";
import { OrderSheetProvider } from "@/components/product/OrderSheetContext";
import { OrderBottomSheet } from "@/components/form/OrderBottomSheet";
import { IngredientsAccordion } from "@/components/product/IngredientsAccordion";
import { RatingBar } from "@/components/product/RatingBar";
import TrustBadges from "@/components/product/TrustBadges";
import { UGCSection } from "@/components/product/UGCSection";
import { TestimonialsSection } from "@/components/product/TestimonialsSection";
import { GuaranteeSection } from "@/components/product/GuaranteeSection";
import { FAQAccordion } from "@/components/product/FAQAccordion";
import { NuskinSection } from "@/components/product/NuskinSection";
import { ProductQuickNav } from "@/components/product/ProductQuickNav";
import { SocialCTABand } from "@/components/ui/SocialCTABand";
import { ExitIntentPopup } from "@/components/product/ExitIntentPopup";
import { ComparisonSection } from "@/components/product/ComparisonSection";
import { SkinTypeSelector } from "@/components/product/SkinTypeSelector";
import { ResultsTimeline } from "@/components/product/ResultsTimeline";
import { FreeGuide } from "@/components/product/FreeGuide";
import { WithoutRitualSection } from "@/components/product/WithoutRitualSection";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductByHandle(slug);

  if (!product) {
    return { title: "Producto no encontrado - Milito Life Shop" };
  }

  const image = product.images[0];

  return {
    title: `${product.title} - Milito Life Shop`,
    description: product.description,
    openGraph: {
      title: `${product.title} - Milito Life Shop`,
      description: product.description,
      images: image
        ? [{ url: image.url, alt: image.altText ?? product.title }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} - Milito Life Shop`,
      description: product.description,
      images: image ? [image.url] : [],
    },
  };
}

export default async function ProductoPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductByHandle(slug);

  if (!product) {
    notFound();
  }

  const landing = resolveLanding(product);

  return (
    <OrderSheetProvider product={product}>
      <ExitIntentPopup />
      <main className="flex flex-col gap-3 pb-28">
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-8 px-6 pt-3 md:px-10 min-w-0">
          <div className="md:sticky md:top-24 md:self-start min-w-0">
            <ProductGallery images={product.images} />
          </div>

          <div className="flex flex-col gap-4 pt-4 md:pt-0 min-w-0">
            <div className="flex flex-col gap-2">
              <RatingBar />
              <TrustBadges showAuthenticity={landing.authenticity} />
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[11px] text-ceniza uppercase tracking-wide">
                {landing.eyebrow}
              </p>
              <h1 className="font-display text-[26px] md:text-[32px] text-carbon leading-tight">
                {product.title}
              </h1>
              <div className="linea-dorada w-12" />
              <p className="text-sm text-carbon-suave">{landing.tagline}</p>
            </div>

            {landing.skinType && <SkinTypeSelector data={landing.skinType} />}

            <ProductHeroCTA />

            <OrderBottomSheet />
          </div>
        </div>

        <ProductQuickNav showIngredientes={landing.ingredients !== null} />

        {landing.withoutRitual && (
          <WithoutRitualSection data={landing.withoutRitual} />
        )}

        {landing.ingredientStory && (
          <section className="bg-lila-suave py-12 px-6 flex flex-col items-center gap-6 text-center">
            <h2 className="font-display text-[28px] text-carbon max-w-md">
              {landing.ingredientStory.title}
            </h2>
            <p className="text-sm text-carbon-suave leading-relaxed max-w-md">
              {landing.ingredientStory.body}
            </p>
            <div className="relative w-full aspect-[4/5] rounded-lg overflow-hidden max-w-md">
              <Image
                src="/images/lifestyle-ritual.jpg"
                alt={`Ritual ${product.title}`}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 448px, 100vw"
              />
            </div>
          </section>
        )}

        {landing.benefits.length > 0 && (
          <section
            id="beneficios"
            className="py-12 px-6 flex flex-col gap-6 scroll-mt-20"
          >
            <h2 className="font-display text-2xl text-carbon text-center">
              {landing.benefitsHeading}
            </h2>
            <ProductBenefits benefits={landing.benefits} />
          </section>
        )}

        <SocialCTABand tone="outline-morado" buttonLabel="Quiero probarlo" />

        {landing.ugc && (
          <UGCSection
            heading={landing.ugcHeading}
            subheading={landing.ugcSubheading}
            posts={landing.ugc}
          />
        )}

        {landing.usageSteps.length > 0 && (
          <section
            id="como-usarlo"
            className="bg-blanco text-carbon py-12 px-6 flex flex-col gap-8 scroll-mt-20"
          >
            <h2 className="font-display text-2xl text-center">
              {landing.usageHeading}
            </h2>
            <div
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible"
              style={{ scrollbarWidth: "none" }}
            >
              {landing.usageSteps.map((paso) => (
                <div
                  key={paso.numero}
                  className="shrink-0 w-[80%] md:w-auto snap-center flex flex-col gap-3 rounded-2xl border border-arena bg-blanco overflow-hidden shadow-[0_1px_3px_rgba(26,23,20,0.08)]"
                >
                  {paso.imagen ? (
                    <div className="relative aspect-[4/5] w-full">
                      <Image
                        src={paso.imagen}
                        alt={`Paso ${paso.numero}: ${paso.titulo}`}
                        fill
                        className="object-cover"
                        sizes="(min-width: 768px) 33vw, 80vw"
                      />
                      <span className="absolute top-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-dorado-oscuro font-display text-base text-blanco">
                        {paso.numero}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 px-5 pt-5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-dorado-oscuro font-display text-base text-blanco">
                        {paso.numero}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col gap-1.5 p-5 pt-2">
                    <h3 className="font-display text-xl text-carbon">
                      {paso.titulo}
                    </h3>
                    <p className="text-sm text-carbon-suave">
                      {paso.descripcion}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {landing.resultsTimeline && (
          <ResultsTimeline
            heading={landing.resultsHeading}
            stages={landing.resultsTimeline}
          />
        )}

        <TestimonialsSection
          productName={product.title}
          items={landing.testimonials}
          heading={landing.testimonialsHeading}
          showUsageStats={landing.authenticity}
        />

        {landing.comparison && <ComparisonSection data={landing.comparison} />}

        <GuaranteeSection />

        {landing.freeGuide && <FreeGuide data={landing.freeGuide} />}

        <SocialCTABand
          tone="lila-band"
          title="Lista para transformar tu ritual de cuidado?"
          buttonLabel="Reservar el mío · Contraentrega"
        />

        {landing.faqs.length > 0 && (
          <section id="preguntas" className="px-6 py-12 scroll-mt-20">
            <FAQAccordion faqs={landing.faqs} />
          </section>
        )}

        {landing.ingredients && (
          <section id="ingredientes" className="px-6 pb-4 scroll-mt-20">
            <IngredientsAccordion ingredients={landing.ingredients} />
          </section>
        )}

        <NuskinSection />

        <section className="seccion-joya text-carbon py-12 px-6 text-center flex flex-col items-center gap-4">
          <h2 className="font-display text-[28px]">{landing.closingHeading}</h2>
          <p className="text-sm text-carbon-suave">
            Envio contraentrega - Pagas al recibir
          </p>
          <SocialCTABand tone="gold-solid" buttonLabel="Empezar mi ritual" />
        </section>

        <ProductPurchaseFlow />
      </main>
    </OrderSheetProvider>
  );
}

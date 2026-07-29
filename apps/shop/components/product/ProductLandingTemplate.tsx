import Image from "next/image";
import dynamic from "next/dynamic";
import sanitizeHtml from "sanitize-html";
import type { Product } from "@diana-mile/shared/types";
import type { ResolvedLanding } from "@/lib/product-content";
import type { PricingConfig } from "@/lib/pricing-server";
import {
  BandaVitrina,
  BarraVitrinaMovil,
  BloqueVitrina,
  hrefVitrina,
} from "@/components/product/BloqueVitrina";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductBenefits } from "@/components/product/ProductBenefits";
import { ProductPurchaseFlow } from "@/components/product/ProductPurchaseFlow";
import { AuthenticitySeals } from "@/components/product/AuthenticitySeals";
import { ProductHeroCTA } from "@/components/product/ProductHeroCTA";
import { OrderSheetProvider } from "@/components/product/OrderSheetContext";
import { OrderBottomSheet } from "@/components/form/OrderBottomSheet";
import TrustBadges from "@/components/product/TrustBadges";
import { DesktopTrustRow } from "@/components/product/DesktopTrustRow";
import { UGCSection } from "@/components/product/UGCSection";
import { GuaranteeSection } from "@/components/product/GuaranteeSection";
import { CommunitySection } from "@/components/product/CommunitySection";
import { NuskinSection } from "@/components/product/NuskinSection";
import { ProductQuickNav } from "@/components/product/ProductQuickNav";
import { SocialCTABand } from "@/components/ui/SocialCTABand";
import { ExitIntentPopup } from "@/components/product/ExitIntentPopup";
import { BackToTopButton } from "@/components/product/BackToTopButton";
import { ProductViewTracking } from "@/components/product/ProductViewTracking";
import { ComparisonSection } from "@/components/product/ComparisonSection";
import { ResultsTimeline } from "@/components/product/ResultsTimeline";
import { PersonalizedHeadingSuffix } from "@/components/product/PersonalizedHeadingSuffix";
import { PersonalizedBenefitCard } from "@/components/product/PersonalizedBenefitCard";
import { ResultadosRealesGallery } from "@/components/product/ResultadosRealesGallery";
import { WithoutRitualSection } from "@/components/product/WithoutRitualSection";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { TituloWhatsApp } from "@diana-mile/shared/ui/WhatsAppFlotante";

// Client components condicionales (no siempre se renderizan segun el
// producto) — se cargan en un chunk separado para no engordar el bundle
// inicial de la PDP con codigo que a veces ni se usa.
const IngredientsAccordion = dynamic(() =>
  import("@/components/product/IngredientsAccordion").then(
    (m) => m.IngredientsAccordion,
  ),
);
const TestimonialsSection = dynamic(() =>
  import("@/components/product/TestimonialsSection").then(
    (m) => m.TestimonialsSection,
  ),
);
const FAQAccordion = dynamic(() =>
  import("@/components/product/FAQAccordion").then((m) => m.FAQAccordion),
);
const SkinTypeSelector = dynamic(() =>
  import("@/components/product/SkinTypeSelector").then(
    (m) => m.SkinTypeSelector,
  ),
);
const FreeGuide = dynamic(() =>
  import("@/components/product/FreeGuide").then((m) => m.FreeGuide),
);

// Shopify devuelve "<p></p>" para una descripcion vacia — sin este chequeo
// se renderizaria una seccion en blanco.
function hasHtmlContent(html: string): boolean {
  return html.replace(/<[^>]*>/g, "").trim().length > 0;
}

/**
 * Estructura fija de slots de imagen: el orden en que se suben las fotos en
 * Shopify (product.images, 0-indexado) decide que seccion de la PDP las usa.
 * 0-2 (las primeras 3) van siempre a la galeria del hero. De ahi en
 * adelante cada indice es opcional — si el producto no tiene esa foto, la
 * seccion simplemente no muestra imagen (nunca rompe el render).
 */
const IMAGE_SLOT = {
  beneficios: 3, // 4ta foto subida
  resultados: 4, // 5ta foto subida
  ritual: 5, // 6ta foto subida
} as const;

type ProductLandingTemplateProps = {
  product: Product;
  pricing: PricingConfig;
  numeroWhatsapp: string;
  landing: ResolvedLanding;
};

/**
 * Plantilla completa de la landing de producto. La PDP publica
 * (/productos/[slug]) y las variantes ocultas del rotador (/l/[slug])
 * renderizan exactamente este arbol; solo cambia el `landing` que reciben.
 */
export function ProductLandingTemplate({
  product,
  pricing,
  numeroWhatsapp,
  landing,
}: ProductLandingTemplateProps) {
  // La bifurcacion se resuelve ACA, en el servidor. El bundle de un producto
  // de vitrina no incluye el CODForm ni el popup de descuento: no es que
  // esten ocultos, es que no se montan por ningun camino.
  const esCod = product.codDisponible;
  const enlaceVitrina = esCod ? null : hrefVitrina(product, numeroWhatsapp);
  // Un solo valor gobierna todos los bloques de confianza de la pagina.
  const modoCompra = esCod ? "cod" : "vitrina";

  // Contenido escrito en Shopify Admin por el equipo — se sanitiza antes de
  // inyectarlo igual, por si algun dia se agrega mas gente con acceso.
  const descriptionHtml = sanitizeHtml(product.descriptionHtml, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "width", "height"],
    },
  });

  return (
    <OrderSheetProvider product={product} pricing={pricing}>
      {esCod && pricing.discountPopupActivo && <ExitIntentPopup />}
      <BackToTopButton />
      {/* Para que el boton de WhatsApp nombre este producto y no mande un
          "hola" generico desde la pagina donde mas se decide la compra. */}
      <TituloWhatsApp valor={product.title} />
      <ProductViewTracking
        contentId={product.handle}
        contentName={product.title}
        value={product.variants[0] ? parseFloat(product.variants[0].price) : undefined}
      />
      <main className="flex flex-col gap-3 pb-28">
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-8 px-6 pt-3 md:px-10 min-w-0">
          <div className="md:sticky md:top-24 md:self-start min-w-0">
            <ProductGallery images={product.images} />
          </div>

          <div className="flex flex-col gap-4 pt-4 md:pt-0 min-w-0">
            <div className="flex flex-col gap-2">
              <div className="md:hidden">
                <TrustBadges modo={modoCompra} />
              </div>
              <DesktopTrustRow
                showAuthenticity={landing.authenticity}
                modo={modoCompra}
              />
            </div>

            <div className="flex flex-col items-center gap-2 text-center md:items-start md:text-left">
              <p className="text-[11px] text-ceniza uppercase tracking-wide">
                {landing.eyebrow}
              </p>
              <h1 className="font-display text-[26px] md:text-[32px] text-carbon leading-tight">
                {product.title}
              </h1>
              <p className="text-sm text-carbon-suave">{landing.tagline}</p>
            </div>

            {landing.skinType && (
              <>
                <SectionDivider compact />
                <SkinTypeSelector data={landing.skinType} />
              </>
            )}

            {esCod ? (
              <>
                <ProductHeroCTA
                  showAuthenticity={landing.authenticity}
                  skinType={landing.skinType}
                />
                <OrderBottomSheet />
              </>
            ) : (
              <BloqueVitrina
                product={product}
                numeroWhatsapp={numeroWhatsapp}
              />
            )}
          </div>
        </div>

        <ProductQuickNav showIngredientes={landing.ingredients !== null} />

        {/* Dolor: por que el ritual actual no basta */}
        {landing.withoutRitual && (
          <WithoutRitualSection data={landing.withoutRitual} />
        )}

        {landing.withoutRitual && landing.benefits.length > 0 && <SectionDivider />}

        {/* Solucion */}
        {landing.benefits.length > 0 && (
          <section
            id="beneficios"
            className="py-12 px-6 flex flex-col gap-6 scroll-mt-20"
          >
            <h2 className="font-display text-2xl text-carbon text-center">
              {landing.benefitsHeading}
              <PersonalizedHeadingSuffix skinType={landing.skinType} />
            </h2>
            <PersonalizedBenefitCard skinType={landing.skinType} />
            {product.images[IMAGE_SLOT.beneficios] && (
              <div className="relative mx-auto w-full max-w-md aspect-[16/9] rounded-2xl overflow-hidden">
                <Image
                  src={product.images[IMAGE_SLOT.beneficios].url}
                  alt={
                    product.images[IMAGE_SLOT.beneficios].altText ??
                    `${product.title} — beneficios`
                  }
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 448px, 100vw"
                />
              </div>
            )}
            <ProductBenefits benefits={landing.benefits} />
          </section>
        )}

        {landing.benefits.length > 0 && landing.usageSteps.length > 0 && <SectionDivider />}

        {/* Prueba de que es facil de usar */}
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

        {/* Prueba de resultado */}
        {landing.resultsTimeline && (
          <ResultsTimeline
            heading={landing.resultsHeading}
            headingSuffix={<PersonalizedHeadingSuffix skinType={landing.skinType} />}
            stages={landing.resultsTimeline}
            image={product.images[IMAGE_SLOT.resultados]}
          />
        )}

        {/* Fotos reales de clientas — administradas desde Shopify (metafield resultados_reales) */}
        <ResultadosRealesGallery fotos={product.resultadosReales} />

        {product.resultadosReales.length > 0 && hasHtmlContent(descriptionHtml) && (
          <SectionDivider />
        )}

        {/* Sustancia del producto: descripcion real de Shopify + historia de ingredientes + ficha tecnica, agrupadas */}
        {hasHtmlContent(descriptionHtml) && (
          <section id="descripcion" className="px-6 py-8 scroll-mt-20">
            <div
              className="max-w-md mx-auto text-sm text-carbon-suave leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_li]:mb-1 [&_strong]:text-carbon [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          </section>
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
                src={
                  (
                    product.images[IMAGE_SLOT.ritual] ??
                    product.images[1] ??
                    product.images[0]
                  )?.url ?? "/images/lifestyle-ritual.jpg"
                }
                alt={`Ritual ${product.title}`}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 448px, 100vw"
              />
            </div>
          </section>
        )}

        {landing.ingredients && (
          <section id="ingredientes" className="px-6 pb-4 scroll-mt-20">
            <IngredientsAccordion ingredients={landing.ingredients} />
          </section>
        )}

        {landing.ingredients && <SectionDivider />}

        {/* Prueba social */}
        <TestimonialsSection
          productName={product.title}
          items={landing.testimonials}
          heading={landing.testimonialsHeading}
          showUsageStats={esCod && landing.authenticity}
          vitrinaHref={enlaceVitrina}
        />

        {landing.ugc && <SectionDivider />}

        {landing.ugc && (
          <UGCSection
            heading={landing.ugcHeading}
            subheading={landing.ugcSubheading}
            posts={landing.ugc}
          />
        )}

        {landing.ugc && product.images.length > IMAGE_SLOT.ritual + 1 && (
          <SectionDivider />
        )}

        {/* Fotos reales sobrantes (todo lo que quede despues de los slots fijos) como mosaico */}
        {product.images.length > IMAGE_SLOT.ritual + 1 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-6 pb-2">
            {product.images.slice(IMAGE_SLOT.ritual + 1).map((image, index) => (
              <div
                key={image.url}
                className="relative aspect-square rounded-xl overflow-hidden"
              >
                <Image
                  src={image.url}
                  alt={image.altText ?? `${product.title} — foto ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 25vw, 50vw"
                />
              </div>
            ))}
          </div>
        )}

        {/* Diferenciacion */}
        {landing.comparison && <ComparisonSection data={landing.comparison} />}

        {landing.comparison && <SectionDivider />}

        {/* Reversion de riesgo -> pedir */}
        <GuaranteeSection modo={modoCompra} />

        {/* Comunidad como motivo extra para recibir el pedido */}
        <CommunitySection />

        {esCod ? (
          <SocialCTABand
            tone="lila-band"
            title="Lista para transformar tu ritual de cuidado?"
            buttonLabel="Reservar el mío · Contraentrega"
          />
        ) : (
          <BandaVitrina
            product={product}
            numeroWhatsapp={numeroWhatsapp}
            title="Lista para transformar tu ritual de cuidado?"
          />
        )}

        {/* Objeciones */}
        {landing.faqs.length > 0 && (
          <section id="preguntas" className="px-6 py-12 scroll-mt-20">
            <FAQAccordion faqs={landing.faqs} />
          </section>
        )}

        {landing.faqs.length > 0 && landing.freeGuide && <SectionDivider />}

        {landing.freeGuide && <FreeGuide data={landing.freeGuide} />}

        <SectionDivider />

        <NuskinSection />

        {/* Cierre */}
        <section className="seccion-joya text-carbon py-12 px-6 text-center flex flex-col items-center gap-4">
          <h2 className="font-display text-[28px]">{landing.closingHeading}</h2>
          <p className="text-sm text-carbon-suave">
            {esCod
              ? "Envio contraentrega - Pagas al recibir"
              : "Entrega coordinada de forma personalizada con Milito"}
          </p>
          {esCod ? (
            <SocialCTABand tone="gold-solid" buttonLabel="Empezar mi ritual" />
          ) : (
            <BandaVitrina product={product} numeroWhatsapp={numeroWhatsapp} />
          )}
          <div className="self-stretch md:self-auto">
            <AuthenticitySeals showAuthenticity={landing.authenticity} />
          </div>
        </section>

        {esCod ? (
          <ProductPurchaseFlow />
        ) : (
          <BarraVitrinaMovil
            product={product}
            numeroWhatsapp={numeroWhatsapp}
          />
        )}
      </main>
    </OrderSheetProvider>
  );
}

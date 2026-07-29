import Image from "next/image";
import type { Config } from "@measured/puck";
import type {
  LandingBenefit,
  LandingFaq,
  LandingFreeGuideSection,
  LandingSkinTypeOption,
  LandingStep,
  LandingTestimonial,
  LandingTimelineStage,
  LandingUGCPost,
  Product,
} from "@diana-mile/shared/types";
import { BLOQUES, CATEGORIAS } from "@diana-mile/shared/landing/puck-contract";
import { ProductBenefits } from "@diana-mile/shared/landing/blocks/ProductBenefits";
import { UGCSection } from "@diana-mile/shared/landing/blocks/UGCSection";
import { ComparisonSection } from "@diana-mile/shared/landing/blocks/ComparisonSection";
import { WithoutRitualSection } from "@diana-mile/shared/landing/blocks/WithoutRitualSection";
import { ResultsTimeline } from "@diana-mile/shared/landing/blocks/ResultsTimeline";
import { FAQAccordion } from "@diana-mile/shared/landing/blocks/FAQAccordion";
import { IngredientsAccordion } from "@diana-mile/shared/landing/blocks/IngredientsAccordion";
import { FreeGuide } from "@diana-mile/shared/landing/blocks/FreeGuide";
import { PasosSection } from "@diana-mile/shared/landing/blocks/PasosSection";
import {
  BandaBloque,
  ColumnasBloque,
  DivisorBloque,
  EncabezadoBloque,
  EspaciadorBloque,
  ImagenBloque,
  TextoBloque,
} from "@diana-mile/shared/landing/blocks/Primitivos";
import {
  BandaVitrina,
  BloqueVitrina,
} from "@/components/product/BloqueVitrina";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductHeroCTA } from "@/components/product/ProductHeroCTA";
import TrustBadges from "@/components/product/TrustBadges";
import { DesktopTrustRow } from "@/components/product/DesktopTrustRow";
import { GuaranteeSection } from "@/components/product/GuaranteeSection";
import { CommunitySection } from "@/components/product/CommunitySection";
import { NuskinSection } from "@/components/product/NuskinSection";
import { TestimonialsSection } from "@/components/product/TestimonialsSection";
import { SkinTypeSelector } from "@/components/product/SkinTypeSelector";
import { AuthenticitySeals } from "@/components/product/AuthenticitySeals";
import { ResultadosRealesGallery } from "@/components/product/ResultadosRealesGallery";
import { SocialCTABand } from "@/components/ui/SocialCTABand";
import { OrderBottomSheet } from "@/components/form/OrderBottomSheet";
import { BotonCTABlock } from "@/components/product/puck/BotonCTABlock";

/**
 * Contexto real del producto que los bloques leen via `puck.metadata`.
 * Lo arma ProductLandingTemplate antes de montar <Render>.
 */
export type PuckMetadata = {
  product: Product;
  esCod: boolean;
  modoCompra: "cod" | "vitrina";
  numeroWhatsapp: string | null;
  enlaceVitrina: string | null;
  /** descriptionHtml del producto YA sanitizado (lo hace el template). */
  descriptionHtml: string;
  authenticity: boolean;
};

type Meta = { metadata: PuckMetadata };

/** Los array-fields de strings viajan como objetos { linea }. */
const lineas = (items: unknown): string[] =>
  Array.isArray(items)
    ? items
        .map((i) => (i && typeof i === "object" ? String((i as { linea?: unknown }).linea ?? "") : ""))
        .filter(Boolean)
    : [];

const IMAGE_SLOT_RITUAL = 5;

function bloque(nombre: string, render: (props: never) => React.ReactNode) {
  const base = BLOQUES[nombre];
  return {
    label: base.label,
    fields: base.fields as never,
    ...(base.defaultProps ? { defaultProps: base.defaultProps as never } : {}),
    ...(base.protegido
      ? { permissions: { delete: false, duplicate: false } }
      : {}),
    render: render as never,
  };
}

/**
 * Config REAL del constructor visual: mapea cada bloque del contrato a los
 * componentes de la tienda. Se monta dentro de OrderSheetProvider (la shell
 * de ProductLandingTemplate), por eso los bloques con useOrderSheet
 * funcionan tal cual. La config del editor (admin) comparte los mismos
 * fields via puck-contract y solo cambia los renders acoplados por previews.
 */
export const configShop: Config = {
  categories: CATEGORIAS as never,
  components: {
    // ─── Producto / transaccionales ──────────────────────────────────────
    HeroCompra: bloque(
      "HeroCompra",
      ({ eyebrow, tagline, puck }: { eyebrow: string; tagline: string; puck: Meta }) => {
        const { product, esCod, numeroWhatsapp, modoCompra, authenticity } =
          puck.metadata;
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-8 px-6 pt-3 md:px-10 min-w-0">
            <div className="md:sticky md:top-24 md:self-start min-w-0">
              <ProductGallery images={product.images} />
            </div>
            <div className="flex flex-col gap-4 pt-4 md:pt-0 min-w-0">
              <div className="flex flex-col gap-2">
                <div className="md:hidden">
                  <TrustBadges modo={modoCompra} />
                </div>
                <DesktopTrustRow showAuthenticity={authenticity} modo={modoCompra} />
              </div>
              <div className="flex flex-col items-center gap-2 text-center md:items-start md:text-left">
                {eyebrow && (
                  <p className="text-[11px] text-ceniza uppercase tracking-wide">
                    {eyebrow}
                  </p>
                )}
                <h1 className="font-display text-[26px] md:text-[32px] text-carbon leading-tight">
                  {product.title}
                </h1>
                {tagline && (
                  <p className="text-sm text-carbon-suave">{tagline}</p>
                )}
              </div>
              {esCod ? (
                <>
                  <ProductHeroCTA showAuthenticity={authenticity} skinType={null} />
                  {/* En desktop el sheet renderiza inline bajo el CTA, igual
                      que en el arbol legacy: sin esto el boton "salta" a una
                      zona vacia al final de la pagina. */}
                  <OrderBottomSheet />
                </>
              ) : (
                <BloqueVitrina product={product} numeroWhatsapp={numeroWhatsapp} />
              )}
            </div>
          </div>
        );
      },
    ),
    DescripcionShopify: bloque("DescripcionShopify", ({ puck }: { puck: Meta }) => {
      const html = puck.metadata.descriptionHtml;
      if (!html.replace(/<[^>]*>/g, "").trim()) return <></>;
      return (
        <section className="px-6 py-8">
          <div
            className="max-w-md mx-auto text-sm text-carbon-suave leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_li]:mb-1 [&_strong]:text-carbon [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </section>
      );
    }),
    ResultadosReales: bloque("ResultadosReales", ({ puck }: { puck: Meta }) => (
      <ResultadosRealesGallery fotos={puck.metadata.product.resultadosReales} />
    )),
    MosaicoFotos: bloque("MosaicoFotos", ({ puck }: { puck: Meta }) => {
      const fotos = puck.metadata.product.images.slice(IMAGE_SLOT_RITUAL + 1);
      if (fotos.length === 0) return <></>;
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-6 pb-2">
          {fotos.map((image, index) => (
            <div key={image.url} className="relative aspect-square rounded-xl overflow-hidden">
              <Image
                src={image.url}
                alt={image.altText ?? `${puck.metadata.product.title} — foto ${index + 1}`}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 25vw, 50vw"
              />
            </div>
          ))}
        </div>
      );
    }),
    Garantia: bloque("Garantia", ({ puck }: { puck: Meta }) => (
      <GuaranteeSection modo={puck.metadata.modoCompra} />
    )),
    Comunidad: bloque("Comunidad", () => <CommunitySection />),
    NuSkin: bloque("NuSkin", () => <NuskinSection />),
    BandaCTA: bloque(
      "BandaCTA",
      ({ title, buttonLabel, puck }: { title: string; buttonLabel: string; puck: Meta }) =>
        puck.metadata.esCod ? (
          <SocialCTABand tone="lila-band" title={title} buttonLabel={buttonLabel} />
        ) : (
          <BandaVitrina
            product={puck.metadata.product}
            numeroWhatsapp={puck.metadata.numeroWhatsapp}
            title={title}
          />
        ),
    ),
    Cierre: bloque("Cierre", ({ heading, puck }: { heading: string; puck: Meta }) => {
      const { esCod, product, numeroWhatsapp, authenticity } = puck.metadata;
      return (
        <section className="seccion-joya text-carbon py-12 px-6 text-center flex flex-col items-center gap-4">
          <h2 className="font-display text-[28px]">{heading}</h2>
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
            <AuthenticitySeals showAuthenticity={authenticity} />
          </div>
        </section>
      );
    }),
    BotonCTA: bloque("BotonCTA", ({ etiqueta, puck }: { etiqueta: string; puck: Meta }) => (
      <BotonCTABlock etiqueta={etiqueta} enlaceVitrina={puck.metadata.enlaceVitrina} />
    )),

    // ─── Secciones de marca ──────────────────────────────────────────────
    Beneficios: bloque(
      "Beneficios",
      ({ heading, benefits }: { heading: string; benefits: LandingBenefit[] }) => (
        <section className="py-12 px-6 flex flex-col gap-6">
          <h2 className="font-display text-2xl text-carbon text-center">{heading}</h2>
          <ProductBenefits benefits={benefits ?? []} />
        </section>
      ),
    ),
    SinRitual: bloque(
      "SinRitual",
      ({ title, conLabel, sin, con }: { title: string; conLabel: string; sin: unknown; con: unknown }) => (
        <WithoutRitualSection
          data={{ title, conLabel, sin: lineas(sin), con: lineas(con) }}
        />
      ),
    ),
    Pasos: bloque(
      "Pasos",
      ({ heading, steps }: { heading: string; steps: LandingStep[] }) => (
        <PasosSection heading={heading} steps={steps ?? []} />
      ),
    ),
    LineaTiempo: bloque(
      "LineaTiempo",
      ({ heading, stages }: { heading: string; stages: LandingTimelineStage[] }) => (
        <ResultsTimeline heading={heading} stages={stages ?? []} image={undefined} />
      ),
    ),
    Testimonios: bloque(
      "Testimonios",
      ({ heading, testimonials, puck }: { heading: string; testimonials: LandingTestimonial[]; puck: Meta }) => (
        <TestimonialsSection
          productName={puck.metadata.product.title}
          items={testimonials ?? []}
          heading={heading || null}
          showUsageStats={puck.metadata.esCod && puck.metadata.authenticity}
          vitrinaHref={puck.metadata.enlaceVitrina}
        />
      ),
    ),
    Comparacion: bloque(
      "Comparacion",
      ({ title, rows }: { title: string; rows: unknown }) => (
        <ComparisonSection data={{ title, rows: lineas(rows) }} />
      ),
    ),
    Faqs: bloque("Faqs", ({ faqs }: { faqs: LandingFaq[] }) => (
      <section className="px-6 py-12">
        <FAQAccordion faqs={faqs ?? []} />
      </section>
    )),
    Ugc: bloque(
      "Ugc",
      ({ heading, subheading, posts }: { heading: string; subheading: string; posts: LandingUGCPost[] }) => (
        <UGCSection heading={heading} subheading={subheading} posts={posts ?? []} />
      ),
    ),
    GuiaGratis: bloque(
      "GuiaGratis",
      ({ title, description, sections }: { title: string; description: string; sections: LandingFreeGuideSection[] }) => (
        <FreeGuide data={{ title, description, sections: sections ?? [] }} />
      ),
    ),
    Ingredientes: bloque(
      "Ingredientes",
      ({ inci, freeFrom }: { inci: string; freeFrom: string }) => (
        <section className="px-6 pb-4">
          <IngredientsAccordion ingredients={{ inci, freeFrom }} />
        </section>
      ),
    ),
    HistoriaIngrediente: bloque(
      "HistoriaIngrediente",
      ({ title, body }: { title: string; body: string }) => (
        <section className="bg-lila-suave py-12 px-6 flex flex-col items-center gap-6 text-center">
          <h2 className="font-display text-[28px] text-carbon max-w-md">{title}</h2>
          <p className="text-sm text-carbon-suave leading-relaxed max-w-md">{body}</p>
        </section>
      ),
    ),
    TipoDePiel: bloque(
      "TipoDePiel",
      ({ question, options }: { question: string; options: LandingSkinTypeOption[] }) => (
        <div className="px-6">
          <SkinTypeSelector data={{ question, options: options ?? [] }} />
        </div>
      ),
    ),

    // ─── Primitivos ──────────────────────────────────────────────────────
    Encabezado: bloque("Encabezado", (props: { texto: string; nivel: "grande" | "mediano"; alineacion: "izquierda" | "centro" }) => (
      <EncabezadoBloque {...props} />
    )),
    Texto: bloque("Texto", (props: { texto: string; alineacion: "izquierda" | "centro" }) => (
      <TextoBloque {...props} />
    )),
    Imagen: bloque("Imagen", (props: { url: string; alt: string; ancho: "completo" | "medio" }) => (
      <ImagenBloque {...props} />
    )),
    Columnas: bloque(
      "Columnas",
      (props: React.ComponentProps<typeof ColumnasBloque>) => (
        <ColumnasBloque {...props} />
      ),
    ),
    Banda: bloque(
      "Banda",
      (props: React.ComponentProps<typeof BandaBloque>) => (
        <BandaBloque {...props} />
      ),
    ),
    Espaciador: bloque("Espaciador", (props: { alto: "pequeno" | "mediano" | "grande" }) => (
      <EspaciadorBloque {...props} />
    )),
    Divisor: bloque("Divisor", () => <DivisorBloque />),
  },
};

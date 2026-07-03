import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductByHandle } from "@/lib/shopify";
import {
  getIngredientStory,
  getPrimaryProductBenefits,
  getProductEyebrow,
  getProductTagline,
  isEpochProduct,
} from "@/lib/product-content";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductBenefits } from "@/components/product/ProductBenefits";
import { ProductPurchaseFlow } from "@/components/product/ProductPurchaseFlow";
import { ProductHeroCTA } from "@/components/product/ProductHeroCTA";
import { OrderSheetProvider } from "@/components/product/OrderSheetContext";
import { OrderBottomSheet } from "@/components/form/OrderBottomSheet";
import { IngredientsAccordion } from "@/components/product/IngredientsAccordion";
import { LiveActivityBar } from "@/components/product/LiveActivityBar";
import { RatingBar } from "@/components/product/RatingBar";
import TrustBadges from "@/components/product/TrustBadges";
import { UGCSection } from "@/components/product/UGCSection";
import { TestimonialsSection } from "@/components/product/TestimonialsSection";
import { GuaranteeSection } from "@/components/product/GuaranteeSection";
import { FAQAccordion } from "@/components/product/FAQAccordion";
import { NuskinSection } from "@/components/product/NuskinSection";
import { SocialCTABand } from "@/components/ui/SocialCTABand";
import { ExitIntentPopup } from "@/components/product/ExitIntentPopup";
import { ComparisonSection } from "@/components/product/ComparisonSection";

const PASOS_RITUAL = [
  {
    numero: "1",
    titulo: "Humedece",
    descripcion: "Aplica agua tibia sobre la piel",
    imagen: "/images/ritual-paso-1-humedece.jpg",
  },
  {
    numero: "2",
    titulo: "Masajea",
    descripcion: "Movimientos circulares suaves por 60 segundos",
    imagen: "/images/ritual-paso-2-masajea.jpg",
  },
  {
    numero: "3",
    titulo: "Enjuaga",
    descripcion: "Agua tibia. Siente la diferencia inmediata.",
    imagen: "/images/ritual-paso-3-enjuaga.jpg",
  },
];

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
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
      images: image ? [{ url: image.url, alt: image.altText ?? product.title }] : [],
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

  const benefits = getPrimaryProductBenefits(product);
  const ingredientStory = getIngredientStory(product);
  const isEpoch = isEpochProduct(product);

  return (
    <OrderSheetProvider product={product}>
      <ExitIntentPopup />
      <main className="flex flex-col gap-3 pb-28">
        <div className="px-6 pt-3 md:px-10">
          <LiveActivityBar />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-8 px-6 pt-3 md:px-10 min-w-0">
          <div className="md:sticky md:top-24 md:self-start min-w-0">
            <ProductGallery images={product.images} />
          </div>

          <div className="flex flex-col gap-4 pt-4 md:pt-0 min-w-0">
            <div className="flex flex-col gap-2">
              <RatingBar />
              <TrustBadges showAuthenticity={isEpoch} />
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[11px] text-ceniza uppercase tracking-wide">
                {getProductEyebrow(product)}
              </p>
              <h1 className="font-display text-[26px] md:text-[32px] text-carbon leading-tight">
                {product.title}
              </h1>
              <div className="linea-dorada w-12" />
              <p className="text-sm text-carbon-suave">
                {getProductTagline(product)}
              </p>
            </div>

            <ProductHeroCTA />

            <OrderBottomSheet />
          </div>
        </div>

        {ingredientStory && (
          <section className="bg-lila-suave py-12 px-6 flex flex-col items-center gap-6 text-center">
            <h2 className="font-display text-[28px] text-carbon max-w-md">
              {ingredientStory.title}
            </h2>
            <p className="text-sm text-carbon-suave leading-relaxed max-w-md">
              {ingredientStory.body}
            </p>
            <div className="relative w-full aspect-[4/5] rounded-[2px] overflow-hidden max-w-md">
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

        <SocialCTABand tone="outline-morado" buttonLabel={`Probar ${product.title}`} />

        <section className="py-12 px-6 flex flex-col gap-6">
          <h2 className="font-display text-2xl text-carbon text-center">
            Lo que hace por tu piel
          </h2>
          <ProductBenefits benefits={benefits} />
        </section>

        <SocialCTABand
          tone="lila-band"
          title="Lista para transformar tu ritual de cuidado?"
          buttonLabel="Pedirlo ahora - Contraentrega"
        />

        {isEpoch && <UGCSection />}

        <ComparisonSection productName={product.title} />

        <section className="bg-blanco text-carbon py-12 px-6 flex flex-col gap-8">
          <h2 className="font-display text-2xl text-center">Tu ritual en 3 pasos</h2>
          <div
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible"
            style={{ scrollbarWidth: "none" }}
          >
            {PASOS_RITUAL.map((paso) => (
              <div
                key={paso.numero}
                className="shrink-0 w-[80%] md:w-auto snap-center flex flex-col gap-3 rounded-[4px] border border-arena bg-blanco overflow-hidden shadow-[0_1px_3px_rgba(26,23,20,0.08)]"
              >
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
                <div className="flex flex-col gap-1.5 p-5 pt-2">
                  <h3 className="font-display text-xl text-carbon">{paso.titulo}</h3>
                  <p className="text-sm text-carbon-suave">{paso.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <TestimonialsSection productName={product.title} showUsageStats={isEpoch} />

        <GuaranteeSection />

        <section className="px-6 py-12">
          <FAQAccordion />
        </section>

        {isEpoch && (
          <section className="px-6 pb-4">
            <IngredientsAccordion />
          </section>
        )}

        <NuskinSection />

        <section className="seccion-joya text-carbon py-12 px-6 text-center flex flex-col items-center gap-4">
          <h2 className="font-display text-[28px]">Tu piel te lo va a agradecer</h2>
          <p className="text-sm text-carbon-suave">Envio contraentrega - Pagas al recibir</p>
          <SocialCTABand tone="gold-solid" buttonLabel="Empezar mi ritual" />
        </section>

        <ProductPurchaseFlow />
      </main>
    </OrderSheetProvider>
  );
}

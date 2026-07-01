import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductByHandle } from "@/lib/shopify";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductBenefits, Benefit } from "@/components/product/ProductBenefits";
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

const BENEFICIOS: Benefit[] = [
  {
    icon: "gota",
    title: "Limpieza profunda sin jabón",
    description: "No reseca ni altera el pH natural. Tu piel limpia sin sentirse tirante.",
  },
  {
    icon: "mineral",
    title: "Más de 50 minerales marinos",
    description: "Zinc, Cobre, Magnesio y Plata — cada uso nutre mientras limpia.",
  },
  {
    icon: "hoja",
    title: "Exfoliación suave natural",
    description: "Polvo de corteza Tsuga Heterophylla exfolia sin irritar.",
  },
  {
    icon: "sol",
    title: "Piel radiante desde el primer uso",
    description: "Textura visiblemente más suave después de la primera aplicación.",
  },
  {
    icon: "escudo",
    title: "Probado dermatológicamente",
    description: "Seguro para piel sensible. Uso diario recomendado.",
  },
  {
    icon: "planeta",
    title: "Empaque 100% reciclado",
    description: "Caja de papel reciclado. Compromiso con la tierra y contigo.",
  },
];

const PASOS_RITUAL = [
  { numero: "1", titulo: "Humedece", descripcion: "Aplica agua tibia sobre la piel" },
  { numero: "2", titulo: "Masajea", descripcion: "Movimientos circulares suaves por 60 segundos" },
  { numero: "3", titulo: "Enjuaga", descripcion: "Agua tibia. Siente la diferencia inmediata." },
];

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductByHandle(slug);

  if (!product) {
    return { title: "Producto no encontrado — Diana Mile" };
  }

  return {
    title: `${product.title} — Diana Mile`,
    description: product.description,
  };
}

export default async function ProductoPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductByHandle(slug);

  if (!product) {
    notFound();
  }

  return (
    <OrderSheetProvider product={product}>
      <main className="flex flex-col pb-28">
        {/* 1. Prueba social urgente */}
        <div className="px-6 pt-3 md:px-10">
          <LiveActivityBar />
        </div>

        <div className="grid md:grid-cols-2 md:gap-8 px-6 pt-3 md:px-10">
          {/* 2. Galeria — cuadrada y acotada en movil, no full-bleed */}
          <div className="md:sticky md:top-6 md:self-start">
            <ProductGallery images={product.images} />
          </div>

          <div className="flex flex-col gap-4 pt-4 md:pt-0">
            {/* 3. Rating bar + badges de confianza */}
            <div className="flex flex-col gap-2">
              <RatingBar />
              <TrustBadges />
            </div>

            {/* 4. Nombre + linea dorada + tagline */}
            <div className="flex flex-col gap-2">
              <p className="text-[11px] text-ceniza uppercase tracking-wide">
                Colección Epoch® · Nu Skin
              </p>
              <h1 className="font-display text-[26px] md:text-[32px] text-carbon leading-tight">
                {product.title}
              </h1>
              <div className="linea-dorada w-12" />
              <p className="text-sm text-carbon-suave">
                Sabiduría indígena. Mineralización profunda. Piel transformada.
              </p>
            </div>

            {/* 5-6. Precio con ancla + CTA principal (elegir pack se resuelve en el sheet) */}
            <ProductHeroCTA />

            <OrderBottomSheet />
          </div>
        </div>

        {/* 7. Historia del ingrediente */}
        <section className="bg-lila-suave py-12 px-6 flex flex-col items-center gap-6 text-center">
          <h2 className="font-display text-[28px] text-carbon max-w-md">
            El secreto que la naturaleza guardó por siglos
          </h2>
          <p className="text-sm text-carbon-suave leading-relaxed max-w-md">
            La leyenda cuenta que los pueblos indígenas del Noroeste del Pacífico intentaron
            fabricar cerámica con la arcilla marina glacial de la Columbia Británica — y al
            retirarla de sus manos, descubrieron algo inesperado: su piel quedaba
            extraordinariamente suave e hidratada. Ese descubrimiento ancestral es el corazón de
            cada Epoch® Polishing Bar.
          </p>
          <div className="relative w-full aspect-[4/5] rounded-[2px] overflow-hidden max-w-md">
            <Image
              src="/images/lifestyle-ritual.jpg"
              alt="El Ritual Epoch"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 448px, 100vw"
            />
          </div>
        </section>

        {/* 8. CTA 3 */}
        <SocialCTABand tone="outline-morado" buttonLabel="Probar el Epoch® Polishing Bar" />

        {/* 9. Beneficios */}
        <section className="py-12 px-6 flex flex-col gap-6">
          <h2 className="font-display text-2xl text-carbon text-center">
            Lo que hace por tu piel
          </h2>
          <ProductBenefits benefits={BENEFICIOS} />
        </section>

        {/* 10. CTA 4 */}
        <SocialCTABand
          tone="lila-band"
          title="¿Lista para transformar tu ritual de limpieza?"
          buttonLabel="Pedirlo ahora · Contraentrega"
        />

        {/* 11. Asi lo estan usando */}
        <UGCSection />

        {/* 12. Modo de uso */}
        <section className="bg-carbon text-blanco py-12 px-6 flex flex-col gap-8">
          <h2 className="font-display text-2xl text-center">Tu ritual en 3 pasos</h2>
          <div
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible"
            style={{ scrollbarWidth: "none" }}
          >
            {PASOS_RITUAL.map((paso) => (
              <div
                key={paso.numero}
                className="relative shrink-0 w-[80%] md:w-auto snap-center flex flex-col gap-2 pt-2"
              >
                <span className="absolute -top-2 left-0 font-display text-[64px] text-dorado opacity-30 leading-none select-none">
                  {paso.numero}
                </span>
                <div className="relative flex flex-col gap-1 pl-1 pt-10">
                  <h3 className="font-display text-xl">{paso.titulo}</h3>
                  <p className="text-sm text-blanco/70">{paso.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 13-15. Stats + testimonios estilo Instagram + CTA5 (todo dentro de TestimonialsSection) */}
        <TestimonialsSection />

        {/* 16. Garantia y confianza */}
        <GuaranteeSection />

        {/* 17. FAQ */}
        <section className="px-6 py-12">
          <FAQAccordion />
        </section>

        <section className="px-6 pb-4">
          <IngredientsAccordion />
        </section>

        {/* 18. Compra directa Nu Skin */}
        <NuskinSection />

        {/* 19. CTA 6 — banner final */}
        <section className="bg-carbon text-blanco py-12 px-6 text-center flex flex-col items-center gap-4">
          <h2 className="font-display text-[28px]">Tu piel te lo va a agradecer</h2>
          <p className="text-sm text-ceniza">Envío contraentrega · Pagas al recibir</p>
          <SocialCTABand tone="white-button" buttonLabel="Empezar mi ritual" />
        </section>

        <ProductPurchaseFlow />
      </main>
    </OrderSheetProvider>
  );
}

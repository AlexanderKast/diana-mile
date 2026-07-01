import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductByHandle } from "@/lib/shopify";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductBenefits, Benefit } from "@/components/product/ProductBenefits";
import { ProductPurchaseFlow } from "@/components/product/ProductPurchaseFlow";
import { IngredientsAccordion } from "@/components/product/IngredientsAccordion";

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

const TESTIMONIOS = [
  {
    texto:
      "Pensé que era un jabón más. Después de la primera semana, mi piel nunca había estado tan suave. Literalmente no puedo vivir sin él.",
    nombre: "María C.",
    ciudad: "Medellín",
  },
  {
    texto:
      "Lo use para el cuerpo pero también en la cara porque tengo piel grasa. Redujo mis poros notablemente. Ya voy por mi tercer pack.",
    nombre: "Valentina R.",
    ciudad: "Bogotá",
  },
  {
    texto:
      "La textura cambia de color mientras se seca — eso me fascinó. Y el resultado en mi piel es real, no marketing.",
    nombre: "Daniela M.",
    ciudad: "Cali",
  },
];

function EstrellasIcon() {
  return (
    <div className="flex gap-0.5 text-dorado">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.8L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}

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
    <main className="flex flex-col pb-28">
      <div className="grid md:grid-cols-2 md:gap-8 px-6 pt-6 md:px-10 md:pt-10">
        <div className="md:sticky md:top-6 md:self-start">
          <ProductGallery images={product.images} />
        </div>

        <div className="flex flex-col gap-4 pt-6 md:pt-0">
          <div className="flex flex-col gap-3">
            <p className="text-[11px] text-ceniza uppercase tracking-wide">
              Colección Epoch® · Nu Skin
            </p>
            <h1 className="font-display text-[32px] text-carbon leading-tight">{product.title}</h1>
            <div className="linea-dorada w-12" />
            <p className="text-sm text-carbon-suave">
              Sabiduría indígena. Mineralización profunda. Piel transformada.
            </p>
          </div>

          <ProductPurchaseFlow product={product} />
        </div>
      </div>

      <section className="bg-lila-suave py-12 px-6 mt-10 flex flex-col items-center gap-6 text-center">
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

      <section className="py-12 px-6 flex flex-col gap-6">
        <h2 className="font-display text-2xl text-carbon text-center">
          Lo que hace por tu piel
        </h2>
        <ProductBenefits benefits={BENEFICIOS} />
      </section>

      <section className="bg-carbon text-blanco py-12 px-6 flex flex-col gap-8">
        <h2 className="font-display text-2xl text-center">Tu ritual en 3 pasos</h2>
        <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible" style={{ scrollbarWidth: "none" }}>
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

      <section className="py-12 px-6 flex flex-col gap-6">
        <h2 className="font-display text-2xl text-carbon text-center">
          Lo que dice nuestra comunidad
        </h2>
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible" style={{ scrollbarWidth: "none" }}>
          {TESTIMONIOS.map((testimonio, index) => (
            <div
              key={index}
              className="shrink-0 w-[85%] md:w-auto snap-center border border-arena rounded-[4px] p-5 flex flex-col gap-3"
            >
              <span className="font-display text-4xl text-dorado opacity-30 leading-none">
                &ldquo;
              </span>
              <p className="text-sm text-carbon leading-relaxed -mt-4">{testimonio.texto}</p>
              <div className="flex items-center justify-between pt-1">
                <p className="text-[12px] text-ceniza">
                  {testimonio.nombre}, {testimonio.ciudad}
                </p>
                <EstrellasIcon />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-12">
        <IngredientsAccordion />
      </section>
    </main>
  );
}

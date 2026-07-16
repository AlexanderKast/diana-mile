import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getProducts, getCollections } from "@/lib/shopify";
import { Button } from "@diana-mile/shared/ui/Button";
import { ProductCard } from "@/components/product/ProductCard";
import { CategoryCard } from "@/components/category/CategoryCard";
import { DianaStory } from "@/components/site/DianaStory";
import { SocialProofSection } from "@/components/site/SocialProofSection";
import TrustBadges from "@/components/product/TrustBadges";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

export const metadata: Metadata = {
  title: "Milito Life Shop — Bienestar probado por Diana Mile",
  description:
    "Bienestar, piel y tendencia probados por Diana Mile, entrenadora física y personal de salud. Pago contraentrega en toda Colombia, productos 100% originales.",
};

const WHATSAPP_NUMERO = process.env.NEXT_PUBLIC_WHATSAPP_NUMERO;
const WHATSAPP_ENTRENAMIENTO_HREF = WHATSAPP_NUMERO
  ? `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(
      "Hola Diana, quiero información sobre tu acompañamiento de entrenamiento",
    )}`
  : null;

const PILARES = [
  {
    titulo: "Probado antes que tú",
    descripcion:
      "Cada producto que ves aquí pasó primero por el ritual de Diana antes de llegar a la tienda.",
    imagenLabel: "Foto: Diana probando un producto",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12l2.5 2.5L16 9" />
      </svg>
    ),
  },
  {
    titulo: "Pago contraentrega",
    descripcion:
      "Pagas cuando ya lo tienes en tus manos, sin sorpresas ni letra pequeña.",
    imagenLabel: "Foto: entrega contraentrega",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 8l9-5 9 5-9 5-9-5z" />
        <path d="M3 8v8l9 5 9-5V8" />
        <path d="M12 13v8" />
      </svg>
    ),
  },
  {
    titulo: "100% original",
    descripcion:
      "Trabajamos solo con productos auténticos, sin falsificaciones ni intermediarios dudosos.",
    imagenLabel: "Foto: empaque/sello de autenticidad",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
];

const STATS = [
  { numero: "COD", texto: "Pago contraentrega en Colombia" },
  { numero: "WA", texto: "Acompanamiento por WhatsApp" },
  { numero: "24-72h", texto: "Despacho estimado en ciudades principales" },
];

export default async function HomePage() {
  const [products, collections] = await Promise.all([
    getProducts(),
    getCollections(),
  ]);
  const destacados = products.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="bg-crema">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24 grid gap-10 md:grid-cols-2 md:gap-8 md:items-center">
          <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden order-1 md:order-2 animate-fade-in-up">
            <Image
              src="/images/hero-home.jpg"
              alt="Ritual Milito Life Shop con hojas tropicales"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div
            className="order-2 md:order-1 animate-fade-in-up"
            style={{ animationDelay: "100ms" }}
          >
            <h1 className="font-display text-4xl md:text-6xl leading-tight text-carbon">
              Probado por Diana, hecho para ti
            </h1>
            <p className="mt-4 text-[15px] text-carbon-suave max-w-md">
              Bienestar, piel y tendencia — todo lo que uso y recomiendo, con
              pago contraentrega en toda Colombia.
            </p>
            <div className="mt-8">
              <Link href="/productos">
                <Button variant="primary">Descubrir la tienda →</Button>
              </Link>
            </div>
            <div className="mt-6">
              <TrustBadges />
            </div>
          </div>
        </div>
      </section>

      {/* Explora por categoria */}
      {collections.length > 0 && (
        <section className="bg-crema">
          <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
            <h2 className="font-display text-2xl text-carbon mb-8">
              Explora por categoría
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {collections.map((collection, i) => (
                <div
                  key={collection.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <CategoryCard collection={collection} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Por que Milito Life Shop */}
      <section className="bg-blanco">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <h2 className="font-display text-3xl md:text-4xl text-carbon mb-8">
            Por que Milito Life Shop
          </h2>
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible">
            {PILARES.map((pilar, i) => (
              <div
                key={pilar.titulo}
                className="min-w-[80%] snap-center shrink-0 md:min-w-0 md:shrink overflow-hidden bg-blanco border border-arena rounded-2xl animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <ImagePlaceholder
                  label={pilar.imagenLabel}
                  aspect="aspect-[4/3]"
                  rounded="rounded-none"
                  className="border-x-0 border-t-0"
                />
                <div className="p-6">
                  <div className="text-dorado mb-3">{pilar.icon}</div>
                  <h3 className="font-display text-xl text-carbon mb-2">
                    {pilar.titulo}
                  </h3>
                  <p className="text-[15px] text-carbon-suave">
                    {pilar.descripcion}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rituales esenciales */}
      <section className="bg-crema">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <h2 className="font-display text-2xl text-carbon mb-8">
            Rituales esenciales
          </h2>
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible">
            {destacados.map((product, i) => (
              <div
                key={product.id}
                className="min-w-[80%] snap-center shrink-0 md:min-w-0 md:shrink animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <DianaStory />

      {/* Entrena con Diana */}
      {WHATSAPP_ENTRENAMIENTO_HREF && (
        <section className="seccion-joya text-carbon py-16 px-6 md:py-20">
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 md:items-center md:gap-12">
            <ImagePlaceholder
              label="Foto: Diana entrenando"
              aspect="aspect-[4/5]"
            />
            <div className="text-center md:text-left">
              <h2 className="font-display text-2xl md:text-3xl">
                Entrena con Diana
              </h2>
              <p className="mt-3 text-sm text-carbon-suave max-w-md mx-auto md:mx-0">
                Acompañamiento de bienestar y salud personal, uno a uno, con la
                misma entrenadora detrás de esta tienda.
              </p>
              <div className="mt-6">
                <a
                  href={WHATSAPP_ENTRENAMIENTO_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="primary">Escribir por WhatsApp →</Button>
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Prueba social */}
      <section className="bg-blanco">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-20 grid grid-cols-3 gap-3 md:gap-4 text-center">
          {STATS.map((stat) => (
            <div key={stat.numero} className="px-1">
              <p className="font-display text-3xl md:text-4xl text-dorado-oscuro">
                {stat.numero}
              </p>
              <p className="mt-2 text-[13px] leading-snug text-ceniza">
                {stat.texto}
              </p>
            </div>
          ))}
        </div>
      </section>

      <SocialProofSection />

      {/* CTA final */}
      <section className="seccion-joya text-carbon py-12 px-6 text-center">
        <h2 className="font-display text-2xl">Empieza tu ritual hoy</h2>
        <div className="mt-6">
          <Link href="/productos">
            <Button variant="primary">Ver productos</Button>
          </Link>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getProducts } from "@/lib/shopify";
import { Button } from "@/components/ui/Button";
import { WhatsAppFloat } from "@/components/ui/WhatsAppFloat";
import { ProductCard } from "@/components/product/ProductCard";

export const metadata: Metadata = {
  title: "Diana Mile — Bienestar y Anti-edad",
  description:
    "Rituales de piel con sabiduria indigena y minerales del oceano. Descubre los productos Diana Mile para una piel mas luminosa y firme.",
};

const PILARES = [
  {
    titulo: "Minerales del oceano",
    descripcion:
      "Activos marinos de alta concentracion que nutren y revitalizan la piel en cada aplicacion.",
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
        <path d="M2 16c1.5 1.5 3 1.5 4.5 0s3-1.5 4.5 0 3 1.5 4.5 0 3-1.5 4.5 0" />
        <path d="M2 20c1.5 1.5 3 1.5 4.5 0s3-1.5 4.5 0 3 1.5 4.5 0 3-1.5 4.5 0" />
        <path d="M12 4c-2 2-2 4 0 6s2 4 0 6" />
      </svg>
    ),
  },
  {
    titulo: "Sabiduria indigena",
    descripcion:
      "Rituales ancestrales de bienestar transformados en formulas modernas para tu piel.",
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
        <path d="M12 2v20" />
        <path d="M5 8l7-6 7 6" />
        <path d="M5 8v13h14V8" />
      </svg>
    ),
  },
  {
    titulo: "Resultados anti-edad",
    descripcion:
      "Piel mas firme, luminosa y uniforme con uso constante desde las primeras semanas.",
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
        <path d="M12 7v5l3 3" />
      </svg>
    ),
  },
];

const STATS = [
  { numero: "+2.000", texto: "Personas que ya transformaron su piel" },
  { numero: "100%", texto: "Testado dermatologicamente" },
  { numero: "50+", texto: "Minerales marinos activos" },
];

export default async function HomePage() {
  const products = await getProducts();
  const destacados = products.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="bg-crema">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24 grid gap-10 md:grid-cols-2 md:gap-8 md:items-center">
          <div className="relative aspect-[4/5] w-full rounded-[4px] overflow-hidden order-1 md:order-2 animate-fade-in-up">
            <Image
              src="/images/hero-home.jpg"
              alt="Ritual Diana Mile con hojas tropicales"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="order-2 md:order-1 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <h1 className="font-display text-4xl md:text-6xl leading-tight text-carbon">
              Tu version mas luminosa
            </h1>
            <p className="mt-4 text-[15px] text-carbon-suave max-w-md">
              Rituales de piel con sabiduria indigena y minerales del oceano
            </p>
            <div className="mt-8">
              <Link href="/productos">
                <Button variant="primary">Descubrir rituales →</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Por que Diana Mile */}
      <section className="bg-blanco">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <h2 className="font-display text-3xl md:text-4xl text-carbon mb-8">
            Por que Diana Mile
          </h2>
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible">
            {PILARES.map((pilar, i) => (
              <div
                key={pilar.titulo}
                className="min-w-[80%] snap-center shrink-0 md:min-w-0 md:shrink bg-blanco border border-arena rounded-[4px] p-6 animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="text-dorado mb-3">{pilar.icon}</div>
                <h3 className="font-display text-xl text-carbon mb-2">
                  {pilar.titulo}
                </h3>
                <p className="text-[15px] text-carbon-suave">
                  {pilar.descripcion}
                </p>
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

      {/* Prueba social */}
      <section className="bg-blanco">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20 grid grid-cols-3 gap-4 text-center">
          {STATS.map((stat) => (
            <div key={stat.numero}>
              <p className="font-display text-3xl md:text-4xl text-dorado-oscuro">
                {stat.numero}
              </p>
              <p className="mt-2 text-xs text-ceniza">{stat.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="seccion-joya text-carbon py-12 px-6 text-center">
        <h2 className="font-display text-2xl">Empieza tu ritual hoy</h2>
        <div className="mt-6">
          <Link href="/productos">
            <Button variant="primary">Ver productos</Button>
          </Link>
        </div>
      </section>

      <WhatsAppFloat />
    </>
  );
}

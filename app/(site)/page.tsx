import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getProducts } from "@/lib/shopify";
import { formatCOP } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { WhatsAppFloat } from "@/components/ui/WhatsAppFloat";

export const metadata: Metadata = {
  title: "Diana Mile — Bienestar y Anti-edad",
  description:
    "Tecnologia anti-edad que transforma tu rutina en un ritual. Descubre los productos Diana Mile para una piel mas luminosa y firme.",
};

const PILARES = [
  {
    titulo: "Tecnologia probada",
    descripcion:
      "Formulas respaldadas por activos de alta concentracion y procesos clinicamente evaluados.",
  },
  {
    titulo: "Resultados reales",
    descripcion:
      "Piel mas firme, luminosa y uniforme con uso constante desde las primeras semanas.",
  },
  {
    titulo: "Ritual, no rutina",
    descripcion:
      "Cada paso esta pensado para convertir el cuidado diario en un momento tuyo.",
  },
];

export default async function HomePage() {
  const products = await getProducts();
  const destacados = products.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="bg-crema">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24 grid gap-10 md:grid-cols-2 md:items-center">
          <div className="animate-fade-in-up">
            <h1 className="font-display text-4xl md:text-6xl leading-tight text-carbon">
              Tu piel, tu ritual. Tu version mas luminosa.
            </h1>
            <p className="mt-4 text-[15px] text-carbon-suave max-w-md">
              Tecnologia anti-edad que transforma tu rutina en un ritual.
            </p>
            <div className="mt-8">
              <Link href="/productos">
                <Button variant="primary">Ver productos</Button>
              </Link>
            </div>
          </div>
          <div
            className="relative aspect-[4/5] w-full bg-arena rounded-[4px] animate-fade-in-up"
            style={{ animationDelay: "100ms" }}
          >
            {/* Aqui va foto real de producto/persona */}
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
          <h2 className="font-display text-3xl md:text-4xl text-carbon mb-8">
            Rituales esenciales
          </h2>
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible">
            {destacados.map((product, i) => (
              <div
                key={product.id}
                className="min-w-[80%] snap-center shrink-0 md:min-w-0 md:shrink bg-blanco border border-arena rounded-[4px] overflow-hidden shadow-[0_1px_3px_rgba(26,23,20,0.08)] animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="relative aspect-square w-full bg-arena">
                  {product.images[0] && (
                    <Image
                      src={product.images[0].url}
                      alt={product.images[0].altText ?? product.title}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg text-carbon mb-1">
                    {product.title}
                  </h3>
                  <p className="text-[15px] text-dorado-oscuro mb-4">
                    {formatCOP(product.price)}
                  </p>
                  <Link href={`/productos/${product.handle}`}>
                    <Button variant="secondary" className="w-full">
                      Ver mas
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WhatsAppFloat />
    </>
  );
}

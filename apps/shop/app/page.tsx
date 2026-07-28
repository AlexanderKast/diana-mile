import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getProducts, getCollections } from "@/lib/shopify";
import { getCoberturaResumen } from "@/lib/cobertura-server";
import { Button } from "@diana-mile/shared/ui/Button";
import { ProductCard } from "@/components/product/ProductCard";
import { CategoryCard } from "@/components/category/CategoryCard";
import { DianaStory } from "@/components/site/DianaStory";
import { SocialProofSection } from "@/components/site/SocialProofSection";
import { enlaceConTexto } from "@diana-mile/shared/whatsapp/mensajes";

export const metadata: Metadata = {
  title: "Milito Life Shop — Rituales Nu Skin, contraentrega en Colombia",
  description:
    "Los rituales de Nu Skin que ya siguen miles de mujeres en el mundo, ahora en Colombia. Pago contraentrega en buena parte del país, producto 100% original.",
};

const WHATSAPP_ENTRENAMIENTO_HREF = enlaceConTexto(
  process.env.NEXT_PUBLIC_WHATSAPP_NUMERO,
  "Hola Diana, quiero información sobre tu acompañamiento de entrenamiento",
);

/**
 * Los tres argumentos de la tienda, sin foto.
 *
 * Antes cada uno venia con un `ImagePlaceholder` gris rotulado "Foto: Diana
 * probando un producto". Tres rectangulos vacios en fila es exactamente el
 * aspecto de una plantilla a medio llenar. Numerados y con la linea dorada
 * se leen como una decision editorial y no necesitan imagen que no existe.
 */
const PILARES = [
  {
    numero: "01",
    titulo: "Probado aquí antes de llegarte",
    descripcion:
      "Nu Skin fabrica cientos de productos. Aquí solo llega lo que Diana usó primero: si no le funcionó, no entró al catálogo.",
  },
  {
    numero: "02",
    titulo: "Pagas al recibir",
    descripcion:
      "En la mayor parte del país pagas cuando ya lo tienes en las manos. Los de mayor valor se coordinan contigo, uno a uno.",
  },
  {
    numero: "03",
    titulo: "100% original",
    descripcion:
      "Producto auténtico de Nu Skin, sin intermediarios dudosos. Milito Life Shop es distribuidora independiente.",
  },
];

export default async function HomePage() {
  const [products, collections, cobertura] = await Promise.all([
    getProducts(),
    getCollections(),
    getCoberturaResumen(),
  ]);

  // Se destacan los que se pueden pedir aquí mismo y tienen foto: mandar a
  // alguien desde el home a una ficha sin imagen —o a una que termina en
  // "escríbele a Diana"— es gastar el mejor clic de la página.
  const destacados = products
    .filter((p) => p.codDisponible && p.images.length > 0)
    .slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="bg-crema">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 md:grid-cols-[1.05fr_0.95fr] md:gap-14 md:py-28">
          <div className="animate-fade-in-up order-2 md:order-1">
            <p className="text-[11px] uppercase tracking-[0.22em] text-ceniza">
              Distribuidora independiente Nu Skin
            </p>
            <h1 className="mt-5 font-display text-[44px] leading-[0.95] tracking-tight text-carbon md:text-[76px]">
              Lo que el mundo
              <br />
              ya usa
            </h1>
            <div className="linea-dorada mt-7 w-16" />
            <p className="mt-7 max-w-md text-[15px] leading-relaxed text-carbon-suave">
              Los rituales de Nu Skin que ya siguen miles de mujeres en el
              mundo. Aquí los pides pagando al recibir.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link href="/productos">
                <Button variant="primary">Descubrir la tienda →</Button>
              </Link>
              <Link
                href="/categorias"
                className="text-[14px] text-carbon underline decoration-dorado decoration-1 underline-offset-4 transition-colors hover:text-dorado-oscuro"
              >
                Explorar por categoría
              </Link>
            </div>
          </div>

          <div
            className="animate-fade-in-up relative order-1 aspect-[4/5] w-full overflow-hidden rounded-2xl md:order-2"
            style={{ animationDelay: "80ms" }}
          >
            <Image
              src="/images/hero-home.jpg"
              alt="Ritual de cuidado Milito Life Shop"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 45vw"
            />
          </div>
        </div>
      </section>

      {/* Los tres argumentos */}
      <section className="bg-blanco px-6 py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 md:grid-cols-3 md:gap-10">
            {PILARES.map((pilar, i) => (
              <div
                key={pilar.numero}
                className="animate-fade-in-up border-t border-arena pt-6"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <span className="font-display text-[15px] tracking-[0.2em] text-dorado-oscuro">
                  {pilar.numero}
                </span>
                <h2 className="mt-4 font-display text-[26px] leading-tight text-carbon">
                  {pilar.titulo}
                </h2>
                <p className="mt-3 text-[14px] leading-relaxed text-carbon-suave">
                  {pilar.descripcion}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categorias */}
      {collections.length > 0 && (
        <section className="bg-crema px-6 py-20 md:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-ceniza">
                  El catálogo
                </p>
                <h2 className="mt-3 font-display text-[32px] leading-tight tracking-tight text-carbon md:text-[44px]">
                  Explora por categoría
                </h2>
              </div>
              <Link
                href="/categorias"
                className="text-[14px] text-carbon underline decoration-dorado decoration-1 underline-offset-4 transition-colors hover:text-dorado-oscuro"
              >
                Ver todas
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
              {collections.map((collection, i) => (
                <div
                  key={collection.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <CategoryCard collection={collection} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Destacados */}
      {destacados.length > 0 && (
        <section className="bg-blanco px-6 py-20 md:py-28">
          <div className="mx-auto max-w-6xl">
            <p className="text-[11px] uppercase tracking-[0.2em] text-ceniza">
              Para empezar
            </p>
            <h2 className="mt-3 max-w-xl font-display text-[32px] leading-tight tracking-tight text-carbon md:text-[44px]">
              Rituales esenciales
            </h2>
            <p className="mt-4 max-w-md text-[14px] leading-relaxed text-carbon-suave">
              Los pides aquí mismo y pagas cuando llegan a tu puerta.
            </p>

            <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
              {destacados.map((product, i) => (
                <div
                  key={product.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${i * 90}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <DianaStory />

      {/* Entrena con Diana — sin foto: ver el comentario de DianaStory */}
      {WHATSAPP_ENTRENAMIENTO_HREF && (
        <section className="seccion-joya px-6 py-20 text-carbon md:py-24">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
            <p className="text-[11px] uppercase tracking-[0.2em] text-ceniza">
              Más allá de la tienda
            </p>
            <h2 className="font-display text-[32px] leading-tight tracking-tight md:text-[44px]">
              Entrena con Diana
            </h2>
            <div className="linea-dorada w-16" />
            <p className="max-w-md text-[15px] leading-relaxed text-carbon-suave">
              Acompañamiento de bienestar y salud personal, uno a uno, con la
              misma entrenadora que está detrás de esta tienda.
            </p>
            <a
              href={WHATSAPP_ENTRENAMIENTO_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2"
            >
              <Button variant="primary">Escribir por WhatsApp →</Button>
            </a>
          </div>
        </section>
      )}

      <SocialProofSection cobertura={cobertura} />

      {/* Cierre */}
      <section className="bg-crema px-6 py-20 text-center md:py-24">
        <h2 className="font-display text-[32px] leading-tight tracking-tight text-carbon md:text-[40px]">
          Empieza tu ritual hoy
        </h2>
        <div className="mt-8">
          <Link href="/productos">
            <Button variant="primary">Ver productos</Button>
          </Link>
        </div>
      </section>
    </>
  );
}

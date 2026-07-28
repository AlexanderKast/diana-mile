import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getProducts, getCollections } from "@/lib/shopify";
import { getCoberturaResumen } from "@/lib/cobertura-server";
import { Button } from "@diana-mile/shared/ui/Button";
import { ProductCard } from "@/components/product/ProductCard";
import { CategoryCard } from "@/components/category/CategoryCard";
import { HistoriaMilito } from "@/components/site/HistoriaMilito";
import { SocialProofSection } from "@/components/site/SocialProofSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TrustStrip } from "@/components/ui/TrustStrip";
import { enlaceConTexto } from "@diana-mile/shared/whatsapp/mensajes";

export const metadata: Metadata = {
  title: "Milito Life Shop — Bienestar y piel con pago contraentrega",
  description:
    "Nu Skin y otras marcas seleccionadas por Milito, siempre producto original. En buena parte de Colombia pagas cuando el mensajero te lo entrega, no antes.",
};

const WHATSAPP_ENTRENAMIENTO_HREF = enlaceConTexto(
  process.env.NEXT_PUBLIC_WHATSAPP_NUMERO,
  "Hola Milito, quiero información sobre tu acompañamiento de entrenamiento",
);

/**
 * Los tres argumentos de la tienda, sin foto.
 *
 * OJO CON EL COPY: la tienda es MULTIMARCA. Nu Skin es el foco y el unico
 * canal donde Milito es distribuidora, pero no es lo unico que se vende, asi
 * que nada de "catalogo Nu Skin" ni "distribuidora Nu Skin" como descripcion
 * de la tienda entera. Nu Skin se nombra donde aplica: la garantia de
 * autenticidad, el aviso legal y los bloques de ficha condicionados a
 * `metafields.nuskinDirectUrl`.
 *
 * Antes cada uno venia con un `ImagePlaceholder` gris rotulado "Foto: Diana
 * probando un producto". Tres rectangulos vacios en fila es exactamente el
 * aspecto de una plantilla a medio llenar. Numerados y con la linea dorada
 * se leen como una decision editorial y no necesitan imagen que no existe.
 */
const PILARES = [
  {
    numero: "01",
    titulo: "Te asesoran antes de comprar",
    descripcion:
      "El catálogo tiene cientos de productos y no todos son para ti. Escríbele a Milito con tu caso y ella te dice cuál te sirve y cuál no vale la pena.",
  },
  {
    numero: "02",
    titulo: "Pagas cuando te llega",
    descripcion:
      "En la mayor parte del país pagas al mensajero, no antes. Los pedidos de mayor valor se cuadran contigo por WhatsApp.",
  },
  {
    numero: "03",
    titulo: "Producto original",
    descripcion:
      "Milito Life Shop es distribuidora independiente de Nu Skin, y cada marca que entra al catálogo llega por canal autorizado. Nunca por reventa.",
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
  // Los repuestos quedan fuera del home: comparten foto y nombre con el
  // producto completo, asi que la fila abria con dos tarjetas practicamente
  // identicas, y ademas un repuesto no le sirve a quien todavia no tiene el
  // aparato. Siguen estando en el catalogo y en su categoria.
  const elegibles = products.filter(
    (p) =>
      p.codDisponible &&
      p.images.length > 0 &&
      !/^repuesto\b/i.test(p.title.trim()),
  );

  // 3 o 6, nunca 4 ni 5: en la reja de tres columnas de escritorio cualquier
  // otro número deja una tarjeta huérfana en la segunda fila, que es
  // exactamente lo que se veía antes en móvil con tres productos a dos
  // columnas. Lo que no entra sigue estando a un clic en "Ver todo".
  const destacados = elegibles.slice(0, elegibles.length >= 6 ? 6 : 3);

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────
          En móvil la foto ya no ocupa 4/5 del ancho de pantalla (~490px de
          alto a 390px): con ese formato el h1, el párrafo y el botón caían
          bajo el pliegue y la primera pantalla era una foto sin CTA. Con
          16/11 la foto sigue mandando y el botón entra en pantalla. */}
      <section className="bg-crema">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-11 sm:gap-10 sm:px-6 sm:py-16 md:grid-cols-[1.05fr_0.95fr] md:gap-14 lg:py-24">
          <div className="animate-fade-in-up order-2 md:order-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-carbon-suave sm:text-[11px]">
              Bienestar, piel y cuidado personal
            </p>
            <h1 className="mt-4 font-display text-[42px] leading-[0.94] tracking-tight text-carbon sm:mt-5 sm:text-[56px] lg:text-[76px]">
              Primero lo recibes,
              <br />
              después lo pagas
            </h1>
            <div className="linea-dorada mt-5 w-14 sm:mt-7 sm:w-16" />
            <p className="mt-5 max-w-md text-[14.5px] leading-relaxed text-carbon-suave sm:mt-7 sm:text-[15px]">
              Nu Skin y otras marcas que Milito selecciona, siempre producto
              original. En la mayor parte del país le pagas al mensajero, no
              antes.
            </p>
            <div className="mt-7 flex flex-col items-start gap-4 sm:mt-9 sm:flex-row sm:flex-wrap sm:items-center">
              <Link href="/productos" className="w-full sm:w-auto">
                <Button variant="primary" className="w-full sm:w-auto">
                  Ver el catálogo →
                </Button>
              </Link>
              <Link
                href="/categorias"
                className="text-[14px] text-carbon underline decoration-dorado decoration-1 underline-offset-4 transition-colors hover:text-dorado-oscuro"
              >
                Buscar por categoría
              </Link>
            </div>
          </div>

          <div
            className="animate-fade-in-up relative order-1 aspect-[16/11] w-full overflow-hidden rounded-2xl sm:aspect-[3/2] md:order-2 md:aspect-[4/5]"
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

      {/* Las tres garantías, antes del primer scroll. */}
      <TrustStrip cobertura={cobertura} />

      {/* ── Destacados ────────────────────────────────────────────────────
          Sube por delante de las categorías: quien llega de un anuncio con
          intención de comprar tenía que pasar antes por tres argumentos y
          una reja de categorías. Ahora lo primero que ve tras el hero es
          producto con precio y "contraentrega". */}
      {destacados.length > 0 && (
        <section className="seccion-aire bg-blanco px-5 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              eyebrow="Lo esencial"
              titulo="Si es tu primera vez, empieza por aquí"
              descripcion="Se piden en la página y se pagan cuando llegan a tu puerta."
              accion={{ href: "/productos", label: "Ver todo" }}
            />

            {/* Móvil: carrusel que encaja, tarjetas de 70vw — la foto se ve.
                Antes eran dos columnas de ~170px con un botón falso dentro.
                Desde `sm` vuelve a ser reja. */}
            <div className="carrusel-snap -mx-5 mt-8 flex gap-3 overflow-x-auto px-5 pb-2 sm:mx-0 sm:mt-12 sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0">
              {destacados.map((product, i) => (
                <div
                  key={product.id}
                  className="animate-fade-in-up w-[70vw] max-w-[280px] sm:w-auto sm:max-w-none"
                  style={{ animationDelay: `${i * 90}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Los tres argumentos ───────────────────────────────────────────
          En móvil eran tres bloques apilados con `gap-12`: ~600px de texto
          corrido sin jerarquía. Ahora el número hace de ancla a la
          izquierda y cada argumento se lee como una fila. */}
      <section className="seccion-aire bg-crema px-5 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-7 sm:gap-10 md:grid-cols-3">
            {PILARES.map((pilar, i) => (
              <div
                key={pilar.numero}
                className="animate-fade-in-up flex gap-4 border-t border-arena pt-5 sm:gap-5 sm:pt-6 md:block"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <span className="w-7 shrink-0 font-display text-[15px] tracking-[0.16em] text-dorado-oscuro sm:w-9 sm:text-[17px] md:w-auto">
                  {pilar.numero}
                </span>
                <div className="md:mt-4">
                  <h2 className="font-display text-[21px] leading-tight text-carbon text-balance sm:text-[24px] lg:text-[26px]">
                    {pilar.titulo}
                  </h2>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-carbon-suave sm:mt-3 sm:text-[14px]">
                    {pilar.descripcion}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categorías ────────────────────────────────────────────────────*/}
      {collections.length > 0 && (
        <section className="seccion-aire bg-blanco px-5 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              eyebrow="El catálogo"
              titulo="Explora por categoría"
              accion={{ href: "/categorias", label: "Ver todas" }}
            />

            <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-12 sm:grid-cols-3 sm:gap-5 lg:gap-6">
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

      <HistoriaMilito />

      <SocialProofSection cobertura={cobertura} />

      {/* ── Entrena con Milito ────────────────────────────────────────────
          Va después de la cobertura a propósito: el CTA aquí es WhatsApp, no
          catálogo, así que no compite con el botón de la sección anterior. */}
      {WHATSAPP_ENTRENAMIENTO_HREF && (
        <section className="seccion-joya seccion-aire-corta px-5 text-carbon sm:px-6">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center sm:gap-6">
            <div className="relative h-24 w-24 overflow-hidden rounded-full sm:h-28 sm:w-28">
              <Image
                src="/images/diana-retrato.jpg"
                alt="Milito"
                fill
                className="object-cover"
                sizes="112px"
              />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-carbon-suave sm:text-[11px]">
              Entrenamiento
            </p>
            <h2 className="font-display text-[28px] leading-tight tracking-tight text-balance sm:text-[34px] lg:text-[44px]">
              Entrena con Milito
            </h2>
            <div className="linea-dorada w-14 sm:w-16" />
            <p className="max-w-md text-[14.5px] leading-relaxed text-carbon-suave sm:text-[15px]">
              Además de la tienda, Milito entrena uno a uno. Si quieres armar tu
              rutina con ella, escríbele y lo hablan.
            </p>
            <a
              href={WHATSAPP_ENTRENAMIENTO_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 w-full sm:w-auto"
            >
              <Button variant="primary" className="w-full sm:w-auto">
                Escríbele por WhatsApp →
              </Button>
            </a>
          </div>
        </section>
      )}

      {/* ── Cierre ────────────────────────────────────────────────────────*/}
      <section className="seccion-aire-corta bg-crema px-5 text-center sm:px-6">
        <h2 className="font-display text-[28px] leading-tight tracking-tight text-carbon text-balance sm:text-[34px] lg:text-[40px]">
          Pídelo hoy, págalo cuando llegue
        </h2>
        <div className="mx-auto mt-7 max-w-xs sm:mt-8 sm:max-w-none">
          <Link href="/productos">
            <Button variant="primary" className="w-full sm:w-auto">
              Ver productos
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}

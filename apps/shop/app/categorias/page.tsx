import { Metadata } from "next";
import Link from "next/link";
import { getCollections } from "@/lib/shopify";
import { getCoberturaResumen } from "@/lib/cobertura-server";
import { CategoryPanelCard } from "@/components/category/CategoryPanelCard";
import { Migas } from "@/components/site/Migas";
import { TrustStrip } from "@/components/ui/TrustStrip";
import { EnlaceWhatsApp } from "@/components/site/EnlaceWhatsApp";
import { Button } from "@diana-mile/shared/ui/Button";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  title: "Categorías — Milito Life Shop",
  description:
    "Ritual de rostro, tecnología en casa, cuerpo y ducha, bienestar por dentro, color y detalle, y kits de inicio. El catálogo de Milito Life Shop, agrupado por lo que quieres lograr.",
};

export default async function CategoriasPage() {
  const [collections, cobertura] = await Promise.all([
    getCollections(),
    getCoberturaResumen(),
  ]);

  const totalProductos = collections.reduce(
    (n, c) => n + c.products.length,
    0,
  );

  // La primera del orden curado (`COLLECTION_HANDLES`) abre la pagina a ancho
  // completo. Antes las seis pesaban exactamente lo mismo: una reja plana no
  // sugiere por donde empezar, y la unica jerarquia posible era el orden de
  // lectura, que en dos columnas no se lee como orden.
  const [destacada, ...resto] = collections;

  const jsonLd =
    SITE_URL && collections.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Categorías de Milito Life Shop",
          itemListElement: collections.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.title,
            url: `${SITE_URL}/categorias/${c.handle}`,
          })),
        }
      : null;

  return (
    <main className="pb-10">
      <section className="bg-crema px-5 pb-11 pt-6 sm:px-6 sm:pb-14 sm:pt-8">
        <div className="mx-auto max-w-6xl">
          <Migas items={[{ label: "Inicio", href: "/" }, { label: "Categorías" }]} />

          <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.18em] text-carbon-suave sm:mt-9 sm:text-[11px]">
            El catálogo
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-[34px] leading-[0.98] tracking-tight text-carbon text-balance sm:text-[44px] lg:text-[60px]">
            Empieza por lo que quieres lograr
          </h1>
          <div className="linea-dorada mt-5 w-14 sm:mt-6 sm:w-16" />
          <p className="mt-5 max-w-md text-[14.5px] leading-relaxed text-carbon-suave sm:mt-6 sm:text-[15px]">
            Están agrupadas por objetivo, no por marca. Si no sabes en cuál
            entrar, escríbele a Milito y ella te dice.
          </p>

          {/* Que tan grande es el catalogo, en numeros. Una reja de seis fotos
              no deja ver si detras hay seis productos o cien. */}
          {totalProductos > 0 ? (
            <p className="mt-7 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12.5px] text-carbon-suave sm:mt-8">
              <span className="font-display text-[19px] leading-none text-carbon">
                {collections.length}
              </span>
              categorías
              <span aria-hidden className="text-ceniza">
                ·
              </span>
              <span className="font-display text-[19px] leading-none text-carbon">
                {totalProductos}
              </span>
              productos en total
            </p>
          ) : null}
        </div>
      </section>

      <TrustStrip cobertura={cobertura} />

      {collections.length === 0 ? (
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-5 py-16 text-center sm:px-6">
          <p className="font-display text-[22px] text-carbon">
            Estamos organizando el catálogo
          </p>
          <p className="text-[14px] leading-relaxed text-carbon-suave">
            Mientras tanto puedes ver todos los productos, o escribirle a Milito
            y decirle qué buscas.
          </p>
          <Link href="/productos" className="w-full sm:w-auto">
            <Button variant="primary" className="w-full sm:w-auto">
              Ver todos los productos →
            </Button>
          </Link>
        </div>
      ) : (
        <div className="mx-auto max-w-6xl px-5 pt-10 sm:px-6 sm:pt-14">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:gap-6">
            {destacada ? (
              <div className="col-span-2 animate-fade-in-up sm:col-span-3 lg:col-span-2">
                <CategoryPanelCard collection={destacada} destacada prioridad />
              </div>
            ) : null}

            {resto.map((collection, i) => (
              <div
                key={collection.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${(i + 1) * 70}ms` }}
              >
                <CategoryPanelCard collection={collection} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Salida para quien no se decide: es la pregunta que de verdad frena
          una compra de skincare, y hasta ahora la pagina terminaba en el pie
          sin ofrecer ni asesoria ni el catalogo completo. */}
      <section className="seccion-joya mt-12 px-5 py-10 text-carbon sm:mt-16 sm:px-6 sm:py-14">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center sm:gap-5">
          <h2 className="font-display text-[24px] leading-tight tracking-tight text-balance sm:text-[32px]">
            ¿Ninguna te suena?
          </h2>
          <p className="max-w-md text-[14px] leading-relaxed text-carbon-suave sm:text-[15px]">
            Cuéntale a Milito qué te pasa con tu piel o qué quieres mejorar, y
            ella te arma la rutina con lo que hay.
          </p>
          <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
            <EnlaceWhatsApp className="w-full sm:w-auto">
              <Button variant="primary" className="w-full sm:w-auto">
                Escríbele por WhatsApp →
              </Button>
            </EnlaceWhatsApp>
            <Link
              href="/productos"
              className="text-[14px] text-carbon underline decoration-dorado decoration-1 underline-offset-4 transition-colors hover:text-dorado-oscuro"
            >
              Ver el catálogo completo
            </Link>
          </div>
        </div>
      </section>

      {jsonLd ? (
        <script
          type="application/ld+json"
          // "<" escapado: los titulos vienen de Shopify y dentro de un
          // <script> el navegador corta en el primer "</script>" literal.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      ) : null}
    </main>
  );
}

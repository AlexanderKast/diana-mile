import { Metadata } from "next";
import { Suspense } from "react";
import { getCatalogProducts } from "@/lib/shopify";
import { CatalogoFiltrado } from "@/components/product/CatalogoFiltrado";
import { Migas } from "@/components/site/Migas";

export const metadata: Metadata = {
  title: "Productos — Milito Life Shop",
  description:
    "Catálogo de Milito Life Shop: cuidado facial, cuerpo, bienestar y tecnología en casa. Nu Skin y otras marcas seleccionadas, con pago contraentrega en buena parte de Colombia.",
};

export default async function ProductosPage() {
  const products = await getCatalogProducts();

  return (
    <main className="flex flex-col gap-6 pb-16">
      {/* Alineado a la izquierda y con la ruta, como /categorias: el bloque
          centrado no dejaba sitio para las migas y hacia que el titulo, el
          parrafo y el buscador se leyeran como tres cosas sueltas. */}
      <div className="mx-auto w-full max-w-6xl px-5 pt-5 sm:px-6">
        <Migas
          items={[{ label: "Inicio", href: "/" }, { label: "Productos" }]}
        />

        <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-carbon-suave sm:mt-7 sm:text-[11px]">
          El catálogo completo
        </p>
        {/* El conteo NO va en el h1: cambia con cada producto que se publica
            en Shopify y el h1 es lo que Google lee como tema de la pagina. El
            numero vive junto a los filtros, donde ademas responde al filtro
            activo. */}
        <h1 className="mt-2.5 font-display text-[32px] leading-tight tracking-tight text-carbon sm:text-[40px]">
          Todo el catálogo
        </h1>
        <div className="linea-dorada mt-4 w-14 sm:w-16" />
        <p className="mt-4 max-w-lg text-[13.5px] leading-relaxed text-carbon-suave sm:text-sm">
          Los marcados <strong className="font-semibold text-morado">Contraentrega</strong> los
          pides aquí y pagas al recibir. Los de{" "}
          <strong className="font-semibold text-dorado-oscuro">Bajo pedido</strong> se
          coordinan con Milito por WhatsApp.
        </p>
      </div>

      {products.length === 0 ? (
        <p className="px-5 text-center text-sm text-carbon-suave sm:px-6">
          Estamos publicando el catálogo. Escríbele a Milito por WhatsApp y ella
          te dice qué hay disponible hoy.
        </p>
      ) : (
        // useSearchParams necesita un limite de Suspense: sin esto Next
        // fuerza toda la pagina a render dinamico.
        <Suspense fallback={null}>
          <CatalogoFiltrado productos={products} />
        </Suspense>
      )}
    </main>
  );
}

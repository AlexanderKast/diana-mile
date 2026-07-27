import { Metadata } from "next";
import { Suspense } from "react";
import { getCatalogProducts } from "@/lib/shopify";
import { CatalogoFiltrado } from "@/components/product/CatalogoFiltrado";

export const metadata: Metadata = {
  title: "Productos — Milito Life Shop",
  description:
    "Descubre la coleccion de bienestar y anti-edad de Milito Life Shop, disponible contraentrega en toda Colombia.",
};

export default async function ProductosPage() {
  const products = await getCatalogProducts();

  return (
    <main className="flex flex-col gap-6 pb-16">
      <div className="flex flex-col items-center gap-2 px-6 pt-10 text-center">
        <h1 className="font-display text-3xl text-carbon">Productos</h1>
        <p className="max-w-md text-sm text-carbon-suave">
          Los marcados <strong className="font-semibold text-morado">Contraentrega</strong> los
          pides aquí y pagas al recibir. Los de{" "}
          <strong className="font-semibold text-dorado-oscuro">Bajo pedido</strong> se
          coordinan con Diana por WhatsApp.
        </p>
      </div>

      {products.length === 0 ? (
        <p className="px-6 text-center text-sm text-ceniza">
          Pronto nuevos productos.
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

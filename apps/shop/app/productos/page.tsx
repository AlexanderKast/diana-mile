import { Metadata } from "next";
import { Suspense } from "react";
import { getCatalogProducts } from "@/lib/shopify";
import { CatalogoFiltrado } from "@/components/product/CatalogoFiltrado";

export const metadata: Metadata = {
  title: "Productos — Milito Life Shop",
  description:
    "Catálogo Nu Skin de Milito Life Shop: cuidado facial, cuerpo, bienestar y tecnología en casa, con pago contraentrega en buena parte de Colombia.",
};

export default async function ProductosPage() {
  const products = await getCatalogProducts();

  return (
    <main className="flex flex-col gap-6 pb-16">
      <div className="flex flex-col items-center gap-2 px-5 pt-8 text-center sm:px-6 sm:pt-10">
        <h1 className="font-display text-[30px] leading-tight text-carbon sm:text-[38px]">
          Productos
        </h1>
        <p className="max-w-md text-[13.5px] leading-relaxed text-carbon-suave sm:text-sm">
          Los marcados <strong className="font-semibold text-morado">Contraentrega</strong> los
          pides aquí y pagas al recibir. Los de{" "}
          <strong className="font-semibold text-dorado-oscuro">Bajo pedido</strong> se
          coordinan con Milito por WhatsApp.
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

import { Metadata } from "next";
import { getProducts } from "@/lib/shopify";
import { ProductCard } from "@/components/product/ProductCard";

export const metadata: Metadata = {
  title: "Productos — Milito Life Shop",
  description: "Descubre la coleccion de bienestar y anti-edad de Milito Life Shop, disponible contraentrega en toda Colombia.",
};

export default async function ProductosPage() {
  const products = await getProducts();

  return (
    <main className="flex flex-col gap-8 pb-16">
      <h1 className="text-center font-display text-3xl text-carbon pt-10">Productos</h1>

      {products.length === 0 ? (
        <p className="text-center text-sm text-ceniza px-6">Pronto nuevos productos.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

import { Metadata } from "next";
import { getCollections } from "@/lib/shopify";
import { CategoryCard } from "@/components/category/CategoryCard";

export const metadata: Metadata = {
  title: "Categorías — Milito Life Shop",
  description:
    "Explora las categorías de Milito Life Shop: Nuskin, Rituales, Tendencias y Suplementos y Bienestar.",
};

export default async function CategoriasPage() {
  const collections = await getCollections();

  return (
    <main className="flex flex-col gap-8 pb-16">
      <h1 className="pt-10 text-center font-display text-3xl text-carbon">
        Categorías
      </h1>

      {collections.length === 0 ? (
        <p className="px-6 text-center text-sm text-ceniza">
          Pronto nuevas categorías.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 p-6 md:grid-cols-4 md:gap-6">
          {collections.map((collection) => (
            <CategoryCard key={collection.id} collection={collection} />
          ))}
        </div>
      )}
    </main>
  );
}

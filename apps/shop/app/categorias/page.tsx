import { Metadata } from "next";
import { getCollections } from "@/lib/shopify";
import { CategoryCard } from "@/components/category/CategoryCard";

export const metadata: Metadata = {
  title: "Categorías — Milito Life Shop",
  description:
    "Ritual de rostro, tecnología en casa, cuerpo y ducha, bienestar por dentro, color y detalle, y kits de inicio. El catálogo Nu Skin de Milito Life Shop.",
};

export default async function CategoriasPage() {
  const collections = await getCollections();

  return (
    <main className="pb-24">
      <section className="bg-crema px-6 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] uppercase tracking-[0.2em] text-ceniza">
            El catálogo
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-[40px] leading-[0.98] tracking-tight text-carbon md:text-[64px]">
            Seis maneras de empezar
          </h1>
          <div className="linea-dorada mt-6 w-16" />
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-carbon-suave">
            No están ordenadas como las ordena Nu Skin, sino por lo que quieres
            lograr.
          </p>
        </div>
      </section>

      {collections.length === 0 ? (
        <p className="px-6 pt-16 text-center text-sm text-ceniza">
          Pronto nuevas categorías.
        </p>
      ) : (
        <div className="mx-auto max-w-6xl px-6 pt-14">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
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
      )}
    </main>
  );
}

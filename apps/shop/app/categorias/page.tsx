import { Metadata } from "next";
import { getCollections } from "@/lib/shopify";
import { CategoryCard } from "@/components/category/CategoryCard";

export const metadata: Metadata = {
  title: "Categorías — Milito Life Shop",
  description:
    "Ritual de rostro, tecnología en casa, cuerpo y ducha, bienestar por dentro, color y detalle, y kits de inicio. El catálogo de Milito Life Shop.",
};

export default async function CategoriasPage() {
  const collections = await getCollections();

  return (
    <main className="pb-24">
      <section className="bg-crema px-5 py-12 sm:px-6 sm:py-16 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-carbon-suave sm:text-[11px]">
            El catálogo
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-[34px] leading-[0.98] tracking-tight text-carbon sm:text-[44px] lg:text-[64px]">
            Seis maneras de empezar
          </h1>
          <div className="linea-dorada mt-5 w-14 sm:mt-6 sm:w-16" />
          <p className="mt-5 max-w-md text-[14.5px] leading-relaxed text-carbon-suave sm:mt-6 sm:text-[15px]">
            Están agrupadas por lo que quieres lograr, no por marca.
          </p>
        </div>
      </section>

      {collections.length === 0 ? (
        <p className="px-6 pt-16 text-center text-sm text-ceniza">
          Pronto nuevas categorías.
        </p>
      ) : (
        <div className="mx-auto max-w-6xl px-5 pt-10 sm:px-6 sm:pt-14">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:gap-6">
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

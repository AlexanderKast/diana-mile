import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCollectionByHandle } from "@/lib/shopify";
import { CategoryHero } from "@/components/category/CategoryHero";
import { ProductCard } from "@/components/product/ProductCard";
import { TituloWhatsApp } from "@diana-mile/shared/ui/WhatsAppFlotante";

type CategoryPageProps = {
  params: Promise<{ handle: string }>;
};

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle);

  if (!collection) {
    return { title: "Categoría no encontrada - Milito Life Shop" };
  }

  return {
    title: `${collection.title} - Milito Life Shop`,
    description: collection.description,
    openGraph: {
      title: `${collection.title} - Milito Life Shop`,
      description: collection.description,
      images: collection.image ? [{ url: collection.image.url }] : [],
    },
  };
}

export default async function CategoriaPage({ params }: CategoryPageProps) {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle);

  if (!collection) {
    notFound();
  }

  return (
    <main className="flex flex-col gap-8 pb-16">
      <TituloWhatsApp valor={collection.title} />
      <CategoryHero collection={collection} />

      {collection.products.length === 0 ? (
        <p className="px-6 text-center text-sm text-ceniza">
          Pronto nuevos productos en esta categoría.
        </p>
      ) : (
        // Misma reja que el catalogo (`CatalogoFiltrado`): antes esta pagina
        // iba a una sola columna en movil y el catalogo a dos, asi que el
        // mismo producto cambiaba de tamaño segun por donde entraras.
        <div className="grid grid-cols-2 gap-3 px-5 py-2 sm:gap-5 sm:px-6 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {collection.products.map((product, index) => (
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

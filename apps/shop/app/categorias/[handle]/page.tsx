import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCollectionByHandle } from "@/lib/shopify";
import { CategoryHero } from "@/components/category/CategoryHero";
import { ProductCard } from "@/components/product/ProductCard";

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
      <CategoryHero collection={collection} />

      {collection.products.length === 0 ? (
        <p className="px-6 text-center text-sm text-ceniza">
          Pronto nuevos productos en esta categoría.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
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

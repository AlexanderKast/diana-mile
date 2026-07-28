import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCollectionByHandle, getCollections } from "@/lib/shopify";
import { CategoryHero } from "@/components/category/CategoryHero";
import { ProductCard } from "@/components/product/ProductCard";
import { Migas } from "@/components/site/Migas";
import { EnlaceWhatsApp } from "@/components/site/EnlaceWhatsApp";
import { Button } from "@diana-mile/shared/ui/Button";
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

  // Las otras categorias se piden en paralelo: al final de la pagina hacen de
  // salida lateral. Sin ellas, quien llega de Google a una categoria que no
  // era la que buscaba solo tiene el boton atras.
  const [collection, todas] = await Promise.all([
    getCollectionByHandle(handle),
    getCollections(),
  ]);

  if (!collection) {
    notFound();
  }

  const productos = collection.products.length;
  const cod = collection.products.filter((p) => p.codDisponible).length;
  const otras = todas.filter((c) => c.handle !== collection.handle);

  return (
    <main className="flex flex-col pb-4">
      <TituloWhatsApp valor={collection.title} />

      <div className="mx-auto w-full max-w-6xl px-5 pt-5 sm:px-6">
        <Migas
          items={[
            { label: "Inicio", href: "/" },
            { label: "Categorías", href: "/categorias" },
            { label: collection.title },
          ]}
        />
      </div>

      <CategoryHero collection={collection} />

      {productos === 0 ? (
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-5 py-14 text-center sm:px-6">
          <p className="font-display text-[22px] text-carbon">
            Todavía no hay productos aquí
          </p>
          <p className="text-[14px] leading-relaxed text-carbon-suave">
            Escríbele a Milito y dile qué buscabas en {collection.title}: si se
            puede traer, ella te lo consigue.
          </p>
          <EnlaceWhatsApp className="w-full sm:w-auto">
            <Button variant="primary" className="w-full sm:w-auto">
              Escríbele por WhatsApp →
            </Button>
          </EnlaceWhatsApp>
          <Link
            href="/categorias"
            className="text-[14px] text-carbon underline decoration-dorado decoration-1 underline-offset-4 transition-colors hover:text-dorado-oscuro"
          >
            Ver las otras categorías
          </Link>
        </div>
      ) : (
        <>
          {/* Cuantos son y como se pagan, antes de la reja: en una categoria
              mezclada saber que hay contraentrega adentro cambia si sigue
              bajando o se va. */}
          <p className="mx-auto w-full max-w-6xl px-5 pt-8 text-[12.5px] text-carbon-suave sm:px-6 sm:pt-10">
            {productos} {productos === 1 ? "producto" : "productos"}
            {cod > 0 ? (
              <>
                {" · "}
                <span className="font-medium text-morado-oscuro">
                  {cod === productos
                    ? "todos con pago contraentrega"
                    : `${cod} con pago contraentrega`}
                </span>
              </>
            ) : (
              " · se piden por WhatsApp con Milito"
            )}
          </p>

          {/* Misma reja que el catalogo (`CatalogoFiltrado`): antes esta pagina
              iba a una sola columna en movil y el catalogo a dos, asi que el
              mismo producto cambiaba de tamaño segun por donde entraras. */}
          <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-3 px-5 pt-4 sm:gap-5 sm:px-6 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
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
        </>
      )}

      {otras.length > 0 ? (
        <section className="mt-14 border-t border-arena bg-crema px-5 py-11 sm:mt-16 sm:px-6 sm:py-14">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display text-[22px] leading-tight text-carbon sm:text-[28px]">
              Sigue explorando
            </h2>
            <ul className="mt-6 flex flex-wrap gap-2.5">
              {otras.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/categorias/${c.handle}`}
                    className="inline-flex min-h-[40px] items-center rounded-full border border-arena bg-blanco px-4 text-[13px] text-carbon transition-colors hover:border-dorado hover:text-dorado-oscuro"
                  >
                    {c.title}
                    <span className="ml-2 text-[11.5px] text-carbon-suave">
                      {c.products.length}
                    </span>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/productos"
                  className="inline-flex min-h-[40px] items-center rounded-full border border-carbon bg-blanco px-4 text-[13px] font-medium text-carbon transition-colors hover:bg-arena/40"
                >
                  Todo el catálogo →
                </Link>
              </li>
            </ul>
          </div>
        </section>
      ) : null}
    </main>
  );
}

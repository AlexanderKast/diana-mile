import ProductosCategoriasTabs from "@/components/admin/ProductosCategoriasTabs";
import {
  isShopifyCatalogoConfigurado,
  listarCategorias,
  listarProductos,
} from "@/lib/shopify-catalogo";

export const metadata = {
  title: "Productos | Milito Life Shop Admin",
};

export const dynamic = "force-dynamic";

export default async function ProductosPage() {
  if (!isShopifyCatalogoConfigurado) {
    return (
      <div>
        <h1 className="font-display text-2xl text-carbon mb-6">Productos</h1>
        <p className="text-sm text-carbon-suave">
          Shopify no esta configurado en este entorno (faltan
          SHOPIFY_STORE_DOMAIN / SHOPIFY_ADMIN_API_TOKEN). Configura esas
          variables para gestionar el catalogo desde aqui.
        </p>
      </div>
    );
  }

  let productos: Awaited<ReturnType<typeof listarProductos>> = [];
  let categorias: Awaited<ReturnType<typeof listarCategorias>> = [];
  let error: string | null = null;

  try {
    [productos, categorias] = await Promise.all([
      listarProductos(),
      listarCategorias(),
    ]);
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-carbon mb-2">Productos</h1>
      <p className="text-sm text-carbon-suave mb-6">
        El catalogo vive en Shopify. Los productos y categorias nuevos aparecen
        aqui automaticamente — abre el constructor para configurar su landing.
      </p>
      {error ? (
        <p className="text-sm text-error">
          No se pudo cargar el catalogo de Shopify: {error}
        </p>
      ) : (
        <ProductosCategoriasTabs
          productos={productos}
          categorias={categorias}
        />
      )}
    </div>
  );
}

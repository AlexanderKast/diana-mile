import CatalogoNuskinTable from "@/components/admin/CatalogoNuskinTable";
import {
  isShopifyCatalogoConfigurado,
  listarProductosNuskin,
} from "@/lib/shopify-catalogo";

export const metadata = {
  title: "Catálogo Nu Skin | Milito Life Shop Admin",
};

export const dynamic = "force-dynamic";

export default async function CatalogoPage() {
  if (!isShopifyCatalogoConfigurado) {
    return (
      <div>
        <h1 className="mb-6 font-display text-2xl text-carbon">
          Catálogo Nu Skin
        </h1>
        <p className="text-sm text-carbon-suave">
          Shopify no esta configurado en este entorno (faltan
          SHOPIFY_STORE_DOMAIN / SHOPIFY_ADMIN_API_TOKEN). Configura esas
          variables para gestionar el catalogo desde aqui.
        </p>
      </div>
    );
  }

  let productos: Awaited<ReturnType<typeof listarProductosNuskin>> = [];
  let error: string | null = null;

  try {
    productos = await listarProductosNuskin();
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  return (
    <div>
      <h1 className="mb-2 font-display text-2xl text-carbon">
        Catálogo Nu Skin
      </h1>
      <p className="mb-6 max-w-2xl text-sm text-carbon-suave">
        El interruptor decide qué ve la clienta en la página del producto:
        encendido, el formulario de contraentrega; apagado, el bloque para
        hablar contigo por WhatsApp. El cambio queda en Shopify y la tienda lo
        toma en la siguiente carga (hasta un minuto de caché).
      </p>

      {error ? (
        <p className="text-sm text-error">
          No se pudo cargar el catálogo de Shopify: {error}
        </p>
      ) : (
        <CatalogoNuskinTable productos={productos} />
      )}
    </div>
  );
}

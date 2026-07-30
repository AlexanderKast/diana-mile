import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductByHandle } from "@/lib/shopify";
import { applyOverrides, resolveLanding } from "@/lib/product-content";
import { getPricingConfig } from "@/lib/pricing-server";
import { getWhatsappNumero } from "@/lib/whatsapp-server";
import { getLandingVariante } from "@/lib/landing-variantes-server";
import { ProductLandingTemplate } from "@/components/product/ProductLandingTemplate";

// Contenido editable desde el admin sin redeploy: nunca cachear.
export const dynamic = "force-dynamic";

type LandingVariantePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: LandingVariantePageProps): Promise<Metadata> {
  const { slug } = await params;
  const variante = await getLandingVariante(slug);
  const product = variante
    ? await getProductByHandle(variante.producto_handle)
    : null;

  return {
    title: product
      ? `${product.title} - Milito Life Shop`
      : "Milito Life Shop",
    description: product?.description,
    // Landing oculta del rotador de pauta: jamas debe aparecer en buscadores
    // ni competir con la PDP publica del producto.
    robots: { index: false, follow: false },
  };
}

/**
 * Landing variante del rotador de pauta. Renderiza la MISMA plantilla que la
 * PDP publica, con el contenido de la variante aplicado encima de la landing
 * base del producto. No esta enlazada desde ningun lugar del sitio; el
 * trafico llega solo por /go/<handle> (o el link directo).
 *
 * Las variantes pausadas siguen renderizando: hay gente en vuelo desde
 * anuncios ya publicados. Pausar solo las saca de la rotacion de /go/.
 */
export default async function LandingVariantePage({
  params,
}: LandingVariantePageProps) {
  const { slug } = await params;
  const variante = await getLandingVariante(slug);

  if (!variante) {
    notFound();
  }

  const [product, pricing, numeroWhatsapp] = await Promise.all([
    getProductByHandle(variante.producto_handle),
    getPricingConfig(),
    getWhatsappNumero(),
  ]);

  if (!product) {
    notFound();
  }

  const landing = applyOverrides(
    resolveLanding(product),
    variante.contenido ?? {},
  );

  return (
    <>
      {variante.estado === "pausada" && (
        <div className="bg-carbon text-blanco text-center text-xs py-2 px-4">
          VISTA PREVIA — esta variante está pausada y no recibe tráfico del
          rotador. Actívala en el panel cuando esté lista.
        </div>
      )}
      <ProductLandingTemplate
        product={product}
        pricing={pricing}
        numeroWhatsapp={numeroWhatsapp}
        landing={landing}
      />
    </>
  );
}

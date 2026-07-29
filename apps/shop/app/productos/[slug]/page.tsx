import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductByHandle } from "@/lib/shopify";
import { resolveLanding } from "@/lib/product-content";
import { getPricingConfig } from "@/lib/pricing-server";
import { getWhatsappNumero } from "@/lib/whatsapp-server";
import { ProductLandingTemplate } from "@/components/product/ProductLandingTemplate";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductByHandle(slug);

  if (!product) {
    return { title: "Producto no encontrado - Milito Life Shop" };
  }

  const image = product.images[0];

  return {
    title: `${product.title} - Milito Life Shop`,
    description: product.description,
    openGraph: {
      title: `${product.title} - Milito Life Shop`,
      description: product.description,
      images: image
        ? [{ url: image.url, alt: image.altText ?? product.title }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} - Milito Life Shop`,
      description: product.description,
      images: image ? [image.url] : [],
    },
  };
}

export default async function ProductoPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, pricing, numeroWhatsapp] = await Promise.all([
    getProductByHandle(slug),
    getPricingConfig(),
    getWhatsappNumero(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <ProductLandingTemplate
      product={product}
      pricing={pricing}
      numeroWhatsapp={numeroWhatsapp}
      landing={resolveLanding(product)}
    />
  );
}

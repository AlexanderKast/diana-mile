import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductByHandle } from "@/lib/shopify";
import { formatCOP } from "@diana-mile/shared/utils";
import { CODForm } from "@/components/form/CODForm";

type PedidoPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ variant?: string }>;
};

export async function generateMetadata({ params }: PedidoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductByHandle(slug);

  return {
    title: `Completa tu pedido — ${product?.title ?? "Milito Life Shop"}`,
    description: product?.description,
  };
}

export default async function PedidoPage({ params, searchParams }: PedidoPageProps) {
  const { slug } = await params;
  const selectedVariantId = (await searchParams)?.variant;
  const product = await getProductByHandle(slug);

  if (!product) {
    notFound();
  }

  const imagen = product.images[0];
  const selectedVariant = product.variants.find((variant) => variant.id === selectedVariantId) ?? product.variants[0] ?? {
    id: product.variantId,
    title: "Presentacion unica",
    price: product.price,
  };

  return (
    <div id="pedido" className="mx-auto w-full max-w-5xl px-4 py-10 md:py-16">
      <h1 className="animate-fade-in-up font-display text-3xl md:text-4xl text-carbon mb-8">
        Completa tu pedido
      </h1>

      <div className="md:grid md:grid-cols-[1fr_1.2fr] md:gap-8">
        <div className="mb-8 md:mb-0">
          <div className="md:sticky md:top-8 flex flex-col gap-4 rounded-[4px] border border-arena bg-crema p-4">
            <div className="flex items-center gap-4">
              <div className="relative h-[60px] w-[60px] shrink-0 overflow-hidden rounded-[4px] bg-arena">
                {imagen && (
                  <Image
                    src={imagen.url}
                    alt={imagen.altText ?? product.title}
                    fill
                    className="object-cover"
                    sizes="60px"
                  />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-display text-lg text-carbon">{product.title}</span>
                <span className="font-display text-xl text-carbon">{formatCOP(product.price)}</span>
              </div>
            </div>
            <div className="linea-dorada" />
            <p className="text-sm text-ceniza">Pago al recibir tu pedido</p>
          </div>
        </div>

        <div>
          <CODForm product={product} selectedVariant={selectedVariant} />
        </div>
      </div>
    </div>
  );
}

import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductByHandle } from "@/lib/shopify";
import { formatCOP } from "@/lib/utils";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductBenefits } from "@/components/product/ProductBenefits";

const BENEFICIOS_GENERICOS = [
  "Reduce visiblemente lineas de expresion con uso constante",
  "Ilumina y unifica el tono de la piel desde las primeras semanas",
  "Textura de rapida absorcion, sin sensacion grasosa",
  "Formulado con activos de alta concentracion para firmeza duradera",
];

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductByHandle(slug);

  if (!product) {
    return { title: "Producto no encontrado — Diana Mile" };
  }

  return {
    title: `${product.title} — Diana Mile`,
    description: product.description,
  };
}

export default async function ProductoPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductByHandle(slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="flex flex-col pb-28">
      <ProductGallery images={product.images} />

      <div className="flex flex-col gap-4 px-6 pt-6">
        <h1 className="font-display text-[28px] text-carbon leading-tight">{product.title}</h1>
        <p className="font-display text-2xl text-dorado-oscuro">{formatCOP(product.price)}</p>

        <div className="linea-dorada" />

        <p className="text-sm text-carbon-suave leading-relaxed">{product.description}</p>

        <div className="flex flex-col gap-3 pt-2">
          <h2 className="text-sm font-semibold text-carbon">Beneficios</h2>
          <ProductBenefits benefits={BENEFICIOS_GENERICOS} />
        </div>

        <div id="pedido" className="flex flex-col gap-3 items-center text-center pt-10 pb-4 border-t border-arena mt-4">
          <p className="text-sm text-ceniza pt-6">Continua tu pedido en la seccion de abajo</p>
          <Link
            href={`/pedido/${product.handle}`}
            className="inline-flex items-center min-h-[44px] text-sm font-medium text-carbon underline underline-offset-4"
          >
            Ir al formulario de pedido
          </Link>
        </div>
      </div>

      <a
        href="#pedido"
        className="fixed bottom-0 left-0 right-0 w-full bg-carbon text-blanco text-center py-4 min-h-[44px] text-sm font-medium tracking-wide"
      >
        Pedir ahora · Contraentrega
      </a>
    </main>
  );
}

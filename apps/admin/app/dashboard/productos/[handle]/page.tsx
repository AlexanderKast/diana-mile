import Link from "next/link";
import { notFound } from "next/navigation";
import EditorTabs from "@/components/admin/editor/EditorTabs";
import HistorialVersiones from "@/components/admin/editor/HistorialVersiones";
import { obtenerProducto } from "@/lib/shopify-catalogo";

const SHOP_URL =
  process.env.NEXT_PUBLIC_SHOP_URL ?? "https://shop.militolife.com";

type ProductoConstructorPageProps = {
  params: Promise<{ handle: string }>;
};

export const dynamic = "force-dynamic";

export default async function ProductoConstructorPage({
  params,
}: ProductoConstructorPageProps) {
  const { handle } = await params;
  const producto = await obtenerProducto(handle);

  if (!producto) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/dashboard/productos"
        className="text-sm text-ceniza hover:text-carbon mb-4 inline-block"
      >
        ← Volver a Productos
      </Link>
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display text-2xl text-carbon">{producto.title}</h1>
        <span className="text-xs text-ceniza uppercase">{producto.status}</span>
      </div>
      <p className="text-sm text-carbon-suave mb-1">
        Constructor de landing · handle: {producto.handle}
      </p>
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <HistorialVersiones
          referencia={`producto:${producto.handle}`}
          saveEndpoint={`/api/admin/productos/${producto.handle}`}
        />
        <Link
          href={`/dashboard/productos/${producto.handle}/angulos`}
          className="text-sm text-dorado-oscuro hover:underline"
        >
          Ángulos de venta →
        </Link>
      </div>
      <EditorTabs
        handle={producto.handle}
        productoTitulo={producto.title}
        productoImagenUrl={producto.imagenUrl}
        contenidoInicial={producto.landingContent}
        variantes={producto.variantes}
        urlPreview={`${SHOP_URL}/productos/${producto.handle}`}
      />
    </div>
  );
}

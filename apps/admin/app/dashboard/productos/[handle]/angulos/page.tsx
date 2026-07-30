import Link from "next/link";
import { notFound } from "next/navigation";
import AngulosVenta from "@/components/admin/editor/AngulosVenta";
import { obtenerProducto } from "@/lib/shopify-catalogo";

type AngulosProductoPageProps = {
  params: Promise<{ handle: string }>;
};

export const dynamic = "force-dynamic";

export default async function AngulosProductoPage({
  params,
}: AngulosProductoPageProps) {
  const { handle } = await params;
  const producto = await obtenerProducto(handle);

  if (!producto) {
    notFound();
  }

  return (
    <div>
      <Link
        href={`/dashboard/productos/${producto.handle}`}
        className="text-sm text-ceniza hover:text-carbon mb-4 inline-block"
      >
        ← Volver al constructor
      </Link>
      <h1 className="font-display text-2xl text-carbon mb-1">
        Ángulos de venta · {producto.title}
      </h1>
      <p className="text-sm text-carbon-suave mb-6 max-w-2xl">
        Un ángulo es un enfoque de mensaje: el mismo producto contado desde otro
        dolor y para otra clienta. Cada ángulo genera una landing distinta, así
        que puedes tener varias corriendo en pauta y ver cuál convierte mejor.
      </p>
      <AngulosVenta
        handle={producto.handle}
        productoTitulo={producto.title}
        fotosShopify={producto.imagenes.slice(0, 3).map((i) => i.url)}
      />
    </div>
  );
}

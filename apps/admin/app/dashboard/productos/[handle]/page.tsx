import Link from "next/link";
import { notFound } from "next/navigation";
import ConstructorLandingForm from "@/components/admin/constructor/ConstructorLandingForm";
import { obtenerProducto } from "@/lib/shopify-catalogo";

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
      <p className="text-sm text-carbon-suave mb-6">
        Constructor de landing · handle: {producto.handle}
      </p>
      <ConstructorLandingForm
        handle={producto.handle}
        productoTitulo={producto.title}
        productoImagenUrl={producto.imagenUrl}
        contenidoInicial={producto.landingContent}
        variantes={producto.variantes}
      />
    </div>
  );
}

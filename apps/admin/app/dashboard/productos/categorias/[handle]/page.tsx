import Link from "next/link";
import { notFound } from "next/navigation";
import ConstructorCategoriaForm from "@/components/admin/constructor/ConstructorCategoriaForm";
import { obtenerCategoria } from "@/lib/shopify-catalogo";

type CategoriaConstructorPageProps = {
  params: Promise<{ handle: string }>;
};

export const dynamic = "force-dynamic";

export default async function CategoriaConstructorPage({
  params,
}: CategoriaConstructorPageProps) {
  const { handle } = await params;
  const categoria = await obtenerCategoria(handle);

  if (!categoria) {
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
      <h1 className="font-display text-2xl text-carbon mb-2">
        {categoria.title}
      </h1>
      <p className="text-sm text-carbon-suave mb-6">
        Constructor de categoría · handle: {categoria.handle} ·{" "}
        {categoria.productosCount} productos
      </p>
      <ConstructorCategoriaForm
        handle={categoria.handle}
        contenidoInicial={categoria.landingContent}
      />
    </div>
  );
}

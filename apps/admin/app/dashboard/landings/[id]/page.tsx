import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import type { LandingVariante } from "@diana-mile/shared/types";
import ConstructorLandingForm from "@/components/admin/constructor/ConstructorLandingForm";
import { obtenerProducto } from "@/lib/shopify-catalogo";

export const dynamic = "force-dynamic";

const SHOP_URL =
  process.env.NEXT_PUBLIC_SHOP_URL ?? "https://shop.militolife.com";

type VarianteEditorPageProps = {
  params: Promise<{ id: string }>;
};

export default async function VarianteEditorPage({
  params,
}: VarianteEditorPageProps) {
  const { id } = await params;

  const supabase = createAdminSupabaseClient();
  const { data } = await supabase
    .from("landing_variantes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const variante = data as LandingVariante | null;
  if (!variante) {
    notFound();
  }

  const producto = await obtenerProducto(variante.producto_handle);
  if (!producto) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/dashboard/landings"
        className="text-sm text-ceniza hover:text-carbon mb-4 inline-block"
      >
        ← Volver al rotador
      </Link>
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display text-2xl text-carbon">{variante.nombre}</h1>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            variante.estado === "activa"
              ? "bg-dorado/20 text-dorado-oscuro"
              : "bg-arena text-ceniza"
          }`}
        >
          {variante.estado}
        </span>
      </div>
      <p className="text-sm text-carbon-suave mb-1">
        Variante de {producto.title} ·{" "}
        <a
          href={`${SHOP_URL}/l/${variante.slug}`}
          target="_blank"
          rel="noreferrer"
          className="text-dorado-oscuro hover:underline"
        >
          {SHOP_URL}/l/{variante.slug} ↗
        </a>
      </p>
      <p className="text-xs text-ceniza mb-6 max-w-2xl">
        Solo los bloques que edites aquí sobrescriben la landing pública; lo
        demás se hereda. Cero urgencia fabricada, cero testimonios inventados —
        el volumen se atribuye a Nu Skin y la marca visible es Milito.
      </p>
      <ConstructorLandingForm
        handle={producto.handle}
        productoTitulo={producto.title}
        productoImagenUrl={producto.imagenUrl}
        contenidoInicial={variante.contenido ?? {}}
        variantes={[]}
        saveEndpoint={`/api/admin/landings/${variante.id}`}
        modoVariante
      />
    </div>
  );
}

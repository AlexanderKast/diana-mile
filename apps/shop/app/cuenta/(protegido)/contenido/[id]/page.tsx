import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@diana-mile/shared/ui/Button";
import {
  getClienteUser,
  createAdminSupabaseClient,
} from "@diana-mile/shared/supabase/server";
import type { Contenido, TipoContenido } from "@diana-mile/shared/types";
import { clienteHaComprado } from "@/lib/cuenta";

const ETIQUETAS_TIPO: Record<TipoContenido, string> = {
  rutina: "Rutina",
  guia: "Guía",
  plan_alimentacion: "Plan de alimentación",
};

type ContenidoDetallePageProps = {
  params: Promise<{ id: string }>;
};

export default async function ContenidoDetallePage({
  params,
}: ContenidoDetallePageProps) {
  const { id } = await params;
  const cliente = await getClienteUser();
  if (!cliente) return null;

  const haComprado = await clienteHaComprado(cliente.telefono);
  if (!haComprado) {
    notFound();
  }

  const admin = createAdminSupabaseClient();
  const { data: contenido } = await admin
    .from("contenidos")
    .select("*")
    .eq("id", id)
    .eq("publicado", true)
    .maybeSingle<Contenido>();

  if (!contenido) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <Link href="/cuenta/contenido" className="text-xs text-ceniza underline">
        ← Contenido premium
      </Link>

      <div>
        <span className="w-fit rounded-full bg-crema px-3 py-1 text-xs text-carbon-suave">
          {ETIQUETAS_TIPO[contenido.tipo]}
        </span>
        <p className="mt-2 font-display text-2xl text-carbon">
          {contenido.titulo}
        </p>
        {contenido.descripcion && (
          <p className="mt-1 text-sm text-carbon-suave">
            {contenido.descripcion}
          </p>
        )}
      </div>

      {contenido.cuerpo && (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-carbon-suave">
          {contenido.cuerpo}
        </p>
      )}

      {contenido.archivo_path && (
        <a href={`/api/cuenta/contenidos/${contenido.id}/descarga`}>
          <Button variant="primary">Descargar →</Button>
        </a>
      )}
    </div>
  );
}

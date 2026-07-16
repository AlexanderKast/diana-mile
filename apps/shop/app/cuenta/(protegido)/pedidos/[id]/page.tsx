import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getClienteUser,
  createAdminSupabaseClient,
} from "@diana-mile/shared/supabase/server";
import type { Pedido } from "@diana-mile/shared/types";
import { formatCOP } from "@diana-mile/shared/utils";
import { PedidoTimeline } from "@/components/cuenta/PedidoTimeline";

type PedidoDetallePageProps = {
  params: Promise<{ id: string }>;
};

export default async function PedidoDetallePage({
  params,
}: PedidoDetallePageProps) {
  const { id } = await params;
  const cliente = await getClienteUser();
  if (!cliente) return null;

  const admin = createAdminSupabaseClient();

  // El filtro por telefono ES la autorizacion: si el pedido existe pero es
  // de otro cliente, esta query no lo devuelve y cae en notFound().
  const { data: pedido } = await admin
    .from("pedidos")
    .select("*")
    .eq("id", id)
    .eq("telefono", cliente.telefono)
    .maybeSingle<Pedido>();

  if (!pedido) {
    notFound();
  }

  let urlTracking: string | null = null;
  let nombreTransportadora: string | null = null;
  if (pedido.transportadora) {
    const { data: transportadoraRow } = await admin
      .from("transportadoras")
      .select("nombre, url_tracking")
      .eq("slug", pedido.transportadora)
      .maybeSingle();
    urlTracking = transportadoraRow?.url_tracking ?? null;
    nombreTransportadora = transportadoraRow?.nombre ?? pedido.transportadora;
  }

  return (
    <div className="flex flex-col gap-6">
      <Link href="/cuenta/pedidos" className="text-xs text-ceniza underline">
        ← Mis pedidos
      </Link>

      <div className="rounded-2xl border border-arena bg-blanco p-5">
        <p className="font-display text-xl text-carbon">
          {pedido.producto_nombre}
        </p>
        {pedido.variante_nombre && (
          <p className="text-sm text-carbon-suave">{pedido.variante_nombre}</p>
        )}
        <p className="mt-2 text-sm text-carbon-suave">
          {pedido.cantidad} unidad{pedido.cantidad !== 1 ? "es" : ""} ·{" "}
          {formatCOP(pedido.precio_total ?? 0)}
        </p>
        <p className="mt-1 text-sm text-carbon-suave">
          Enviado a {pedido.direccion}, {pedido.ciudad}
        </p>
      </div>

      <div>
        <p className="mb-4 font-display text-lg text-carbon">
          Estado de tu pedido
        </p>
        <PedidoTimeline
          estado={pedido.estado}
          transportadora={nombreTransportadora}
          numeroGuia={pedido.numero_guia}
          urlTracking={urlTracking}
          fechaEnvio={pedido.fecha_envio}
          fechaEntregaEstimada={pedido.fecha_entrega_estimada}
          fechaEntregaReal={pedido.fecha_entrega_real}
        />
      </div>
    </div>
  );
}

import StatsCard from "@/components/admin/StatsCard";
import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import { cx, formatCOP } from "@diana-mile/shared/utils";
import type { EstadoPedido, Lead, Pedido } from "@diana-mile/shared/types";

export const metadata = {
  title: "Dashboard | Milito Life Shop Admin",
};

function inicioDelDia(): string {
  const ahora = new Date();
  ahora.setHours(0, 0, 0, 0);
  return ahora.toISOString();
}

function haceSieteDias(): string {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - 7);
  return fecha.toISOString();
}

function inicioDelMes(): string {
  const ahora = new Date();
  return new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString();
}

const ESTADO_LABELS_DISTRIBUCION: Record<EstadoPedido, string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  en_preparacion: "En preparación",
  enviado: "Enviado",
  entregado: "Entregado",
  devuelto: "Devuelto",
  cancelado: "Cancelado",
  fraude: "Fraude",
};

function estadoBarraClass(estado: EstadoPedido): string {
  switch (estado) {
    case "pendiente":
      return "bg-arena";
    case "confirmado":
      return "bg-dorado";
    case "en_preparacion":
      return "bg-lila-suave";
    case "enviado":
      return "bg-morado";
    case "entregado":
      return "bg-carbon";
    case "devuelto":
      return "bg-error";
    case "cancelado":
      return "bg-ceniza";
    case "fraude":
      return "bg-error";
    default:
      return "bg-arena";
  }
}

function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ESTADO_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  enviado: "Enviado",
  entregado: "Entregado",
  devuelto: "Devuelto",
};

export default async function DashboardPage() {
  const supabase = createAdminSupabaseClient();
  const inicioHoy = inicioDelDia();
  const inicioSemana = haceSieteDias();
  const inicioMes = inicioDelMes();

  const [
    pedidosHoyRes,
    pedidosSemanaRes,
    leadsHoyRes,
    leadsSemanaRes,
    ultimosPedidosRes,
    ultimosLeadsRes,
    pedidosMesRes,
  ] = await Promise.all([
    supabase
      .from("pedidos")
      .select("id", { count: "exact", head: true })
      .gte("created_at", inicioHoy),
    supabase
      .from("pedidos")
      .select("id", { count: "exact", head: true })
      .gte("created_at", inicioSemana),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .gte("created_at", inicioHoy),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .gte("created_at", inicioSemana),
    supabase
      .from("pedidos")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("pedidos")
      .select("estado, precio_total, costo_producto, cantidad")
      .gte("created_at", inicioMes),
  ]);

  const pedidosHoy = pedidosHoyRes.count ?? 0;
  const pedidosSemana = pedidosSemanaRes.count ?? 0;
  const leadsHoy = leadsHoyRes.count ?? 0;
  const leadsSemana = leadsSemanaRes.count ?? 0;
  const ultimosPedidos = (ultimosPedidosRes.data ?? []) as Pedido[];
  const ultimosLeads = (ultimosLeadsRes.data ?? []) as Lead[];

  const pedidosDelMes = (pedidosMesRes.data ?? []) as Pick<
    Pedido,
    "estado" | "precio_total" | "costo_producto" | "cantidad"
  >[];

  const cantidadPedidosMes = pedidosDelMes.length;
  const ingresosMes = pedidosDelMes.reduce(
    (acc, p) => acc + (p.precio_total ?? 0),
    0
  );
  const costoProductosMes = pedidosDelMes.reduce(
    (acc, p) => acc + (p.costo_producto ?? 0) * (p.cantidad ?? 1),
    0
  );
  const utilidadEstimadaMes = ingresosMes - costoProductosMes;
  const ticketPromedioMes =
    cantidadPedidosMes > 0 ? ingresosMes / cantidadPedidosMes : 0;

  const conteoPorEstado = pedidosDelMes.reduce<Record<string, number>>(
    (acc, p) => {
      acc[p.estado] = (acc[p.estado] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const distribucionEstados = Object.entries(conteoPorEstado)
    .map(([estado, cantidad]) => ({
      estado: estado as EstadoPedido,
      cantidad,
      porcentaje:
        cantidadPedidosMes > 0
          ? Math.round((cantidad / cantidadPedidosMes) * 1000) / 10
          : 0,
    }))
    .sort((a, b) => b.cantidad - a.cantidad);

  return (
    <div className="min-h-screen bg-crema px-4 py-8 md:px-8">
      <h1 className="font-display text-2xl text-carbon mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatsCard label="Pedidos hoy" value={pedidosHoy} />
        <StatsCard label="Pedidos semana" value={pedidosSemana} />
        <StatsCard label="Leads hoy" value={leadsHoy} />
        <StatsCard label="Leads semana" value={leadsSemana} />
      </div>

      <h2 className="font-display text-xl text-carbon mb-3">
        Finanzas del mes
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
        <StatsCard label="Ingresos del mes" value={formatCOP(ingresosMes)} />
        <StatsCard label="Pedidos del mes" value={cantidadPedidosMes} />
        <StatsCard
          label="Utilidad estimada"
          value={formatCOP(utilidadEstimadaMes)}
        />
        <StatsCard
          label="Ticket promedio"
          value={formatCOP(ticketPromedioMes)}
        />
      </div>
      <p className="text-xs text-ceniza mb-10">
        (sin incluir gastos de publicidad)
      </p>

      <div className="bg-blanco border border-arena rounded-[4px] p-5 mb-10">
        <h2 className="font-display text-xl text-carbon mb-4">
          Distribución de pedidos del mes
        </h2>
        {distribucionEstados.length === 0 ? (
          <p className="text-sm text-ceniza">
            Sin pedidos registrados este mes.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {distribucionEstados.map(({ estado, cantidad, porcentaje }) => (
              <div key={estado} className="flex items-center gap-3">
                <span className="w-32 shrink-0 text-sm text-carbon-suave">
                  {ESTADO_LABELS_DISTRIBUCION[estado] ?? estado}
                </span>
                <div className="flex-1 h-4 bg-crema border border-arena rounded-[2px] overflow-hidden">
                  <div
                    className={cx(
                      "h-full rounded-[2px]",
                      estadoBarraClass(estado)
                    )}
                    style={{ width: `${Math.max(porcentaje, 2)}%` }}
                  />
                </div>
                <span className="w-20 shrink-0 text-sm text-carbon text-right">
                  {cantidad} ({porcentaje}%)
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-blanco border border-arena rounded-[4px] p-5">
          <h2 className="font-display text-xl text-carbon mb-4">
            Ultimos pedidos
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-arena text-ceniza text-xs uppercase">
                  <th className="text-left py-2 pr-2">Fecha</th>
                  <th className="text-left py-2 pr-2">Nombre</th>
                  <th className="text-left py-2 pr-2">Producto</th>
                  <th className="text-left py-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {ultimosPedidos.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-ceniza text-center">
                      Sin pedidos todavia.
                    </td>
                  </tr>
                ) : (
                  ultimosPedidos.map((pedido) => (
                    <tr key={pedido.id} className="border-b border-arena/50">
                      <td className="py-2 pr-2 text-carbon-suave whitespace-nowrap">
                        {formatFecha(pedido.created_at)}
                      </td>
                      <td className="py-2 pr-2 text-carbon">{pedido.nombre}</td>
                      <td className="py-2 pr-2 text-carbon-suave">
                        {pedido.producto_nombre}
                      </td>
                      <td className="py-2 text-carbon-suave">
                        {ESTADO_LABELS[pedido.estado] ?? pedido.estado}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-blanco border border-arena rounded-[4px] p-5">
          <h2 className="font-display text-xl text-carbon mb-4">
            Ultimos leads
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-arena text-ceniza text-xs uppercase">
                  <th className="text-left py-2 pr-2">Fecha</th>
                  <th className="text-left py-2 pr-2">Nombre</th>
                  <th className="text-left py-2 pr-2">Telefono</th>
                  <th className="text-left py-2">Fuente</th>
                </tr>
              </thead>
              <tbody>
                {ultimosLeads.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-ceniza text-center">
                      Sin leads todavia.
                    </td>
                  </tr>
                ) : (
                  ultimosLeads.map((lead) => (
                    <tr key={lead.id} className="border-b border-arena/50">
                      <td className="py-2 pr-2 text-carbon-suave whitespace-nowrap">
                        {formatFecha(lead.created_at)}
                      </td>
                      <td className="py-2 pr-2 text-carbon">{lead.nombre}</td>
                      <td className="py-2 pr-2 text-carbon-suave">
                        {lead.telefono}
                      </td>
                      <td className="py-2 text-carbon-suave">
                        {lead.fuente ?? "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

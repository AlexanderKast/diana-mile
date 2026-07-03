import StatsCard from "@/components/admin/StatsCard";
import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import type { Lead, Pedido } from "@diana-mile/shared/types";

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

  const [
    pedidosHoyRes,
    pedidosSemanaRes,
    leadsHoyRes,
    leadsSemanaRes,
    ultimosPedidosRes,
    ultimosLeadsRes,
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
  ]);

  const pedidosHoy = pedidosHoyRes.count ?? 0;
  const pedidosSemana = pedidosSemanaRes.count ?? 0;
  const leadsHoy = leadsHoyRes.count ?? 0;
  const leadsSemana = leadsSemanaRes.count ?? 0;
  const ultimosPedidos = (ultimosPedidosRes.data ?? []) as Pedido[];
  const ultimosLeads = (ultimosLeadsRes.data ?? []) as Lead[];

  return (
    <div className="min-h-screen bg-crema px-4 py-8 md:px-8">
      <h1 className="font-display text-2xl text-carbon mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatsCard label="Pedidos hoy" value={pedidosHoy} />
        <StatsCard label="Pedidos semana" value={pedidosSemana} />
        <StatsCard label="Leads hoy" value={leadsHoy} />
        <StatsCard label="Leads semana" value={leadsSemana} />
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

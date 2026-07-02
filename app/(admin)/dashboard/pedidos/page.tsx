import OrdersTable from "@/components/admin/OrdersTable";
import { createAdminSupabaseClient } from "@/lib/supabase-server";
import type { Pedido } from "@/types";

export const metadata = {
  title: "Pedidos | Milito Life Shop Admin",
};

export default async function PedidosPage() {
  const supabase = createAdminSupabaseClient();

  const { data } = await supabase
    .from("pedidos")
    .select("*")
    .order("created_at", { ascending: false });

  const pedidos = (data ?? []) as Pedido[];

  return (
    <div>
      <h1 className="font-display text-2xl text-carbon mb-6">Pedidos</h1>
      <OrdersTable pedidos={pedidos} />
    </div>
  );
}

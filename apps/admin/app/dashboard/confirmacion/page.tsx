import ConfirmacionCards from "@/components/admin/ConfirmacionCards";
import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import type { Pedido } from "@diana-mile/shared/types";

export const metadata = {
  title: "Confirmacion | Milito Life Shop Admin",
};

const ORDEN_PRIORIDAD: Record<Pedido["prioridad"], number> = {
  urgente: 0,
  prioritario: 1,
  normal: 2,
};

export default async function ConfirmacionPage() {
  const supabase = createAdminSupabaseClient();

  const { data } = await supabase
    .from("pedidos")
    .select("*")
    .eq("estado", "pendiente")
    .order("created_at", { ascending: true });

  const pedidos = ((data ?? []) as Pedido[]).slice().sort((a, b) => {
    const diffPrioridad = ORDEN_PRIORIDAD[a.prioridad] - ORDEN_PRIORIDAD[b.prioridad];
    if (diffPrioridad !== 0) return diffPrioridad;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  return (
    <div>
      <h1 className="font-display text-2xl text-carbon mb-6">Confirmacion de pedidos</h1>
      <ConfirmacionCards pedidos={pedidos} />
    </div>
  );
}

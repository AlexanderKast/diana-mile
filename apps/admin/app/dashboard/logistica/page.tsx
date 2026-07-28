import LogisticaTable from "@/components/admin/LogisticaTable";
import { ConsignacionPendiente } from "@/components/admin/ConsignacionPendiente";
import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import type { Pedido } from "@diana-mile/shared/types";

export const metadata = {
  title: "Logistica | Milito Life Shop Admin",
};

export default async function LogisticaPage() {
  const supabase = createAdminSupabaseClient();

  const [{ data: confirmados }, { data: enviados }, { data: sinConsignar }] =
    await Promise.all([
      supabase
        .from("pedidos")
        .select("*")
        .eq("estado", "confirmado")
        .order("created_at", { ascending: true }),
      supabase
        .from("pedidos")
        .select("*")
        .eq("estado", "enviado")
        .order("created_at", { ascending: true }),
      // Entregados cuyo recaudo la transportadora aun no consigna: plata
      // del negocio en manos de un tercero. Los mas viejos primero, que
      // son los que se vuelven incobrables si nadie los reclama.
      supabase
        .from("pedidos")
        .select("*")
        .eq("estado", "entregado")
        .is("fecha_consignacion", null)
        .order("fecha_entrega_real", { ascending: true })
        .limit(100),
    ]);

  const pendientesEnvio = (confirmados ?? []) as Pedido[];
  const enTransito = (enviados ?? []) as Pedido[];

  return (
    <div>
      <h1 className="font-display text-2xl text-carbon mb-6">Logistica</h1>
      <LogisticaTable pendientesEnvio={pendientesEnvio} enTransito={enTransito} />
      <ConsignacionPendiente pedidos={(sinConsignar ?? []) as Pedido[]} />
    </div>
  );
}

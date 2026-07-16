import ContenidosTable from "@/components/admin/ContenidosTable";
import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import type { Contenido } from "@diana-mile/shared/types";

export const metadata = {
  title: "Contenido premium | Milito Life Shop Admin",
};

export default async function ContenidosPage() {
  const supabase = createAdminSupabaseClient();

  const { data } = await supabase
    .from("contenidos")
    .select("*")
    .order("orden", { ascending: true });

  const contenidos = (data ?? []) as Contenido[];

  return (
    <div>
      <h1 className="font-display text-2xl text-carbon mb-6">
        Contenido premium
      </h1>
      <p className="text-sm text-carbon-suave mb-4">
        Rutinas, guías y planes de alimentación visibles en /cuenta para
        clientes que ya compraron.
      </p>
      <ContenidosTable contenidos={contenidos} />
    </div>
  );
}

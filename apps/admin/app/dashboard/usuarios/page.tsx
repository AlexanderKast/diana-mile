import UsuariosTable from "@/components/admin/UsuariosTable";
import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import type { UsuarioAdmin } from "@diana-mile/shared/types";

export const metadata = {
  title: "Usuarios | Milito Life Shop Admin",
};

export default async function UsuariosPage() {
  const supabase = createAdminSupabaseClient();

  const { data } = await supabase
    .from("usuario_roles")
    .select("*")
    .order("created_at", { ascending: false });

  const usuarios = (data ?? []) as UsuarioAdmin[];

  return (
    <div>
      <h1 className="font-display text-2xl text-carbon mb-6">Gestion de usuarios</h1>
      <UsuariosTable usuarios={usuarios} />
    </div>
  );
}

import { redirect } from "next/navigation";
import { createAdminSupabaseClient, getAdminUser } from "@diana-mile/shared/supabase/server";
import type { RolUsuario } from "@diana-mile/shared/types";
import Sidebar from "@/components/admin/Sidebar";
import { SessionProvider } from "@/lib/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAdminUser();
  if (!user) {
    redirect("/login");
  }

  const supabase = createAdminSupabaseClient();
  const { data: rolRow } = await supabase
    .from("usuario_roles")
    .select("nombre, rol")
    .eq("user_id", user.id)
    .maybeSingle();

  // Sin fila en usuario_roles = sin rol asignado. Nunca se asume un rol con
  // privilegios por defecto — se bloquea el acceso al panel por completo.
  if (!rolRow) {
    return (
      <div className="min-h-screen bg-crema flex items-center justify-center p-6">
        <div className="max-w-md text-center bg-blanco border border-arena rounded-[4px] p-8">
          <h1 className="font-display text-2xl text-carbon mb-2">Sin acceso asignado</h1>
          <p className="text-carbon-suave text-sm">
            Tu cuenta ({user.email}) no tiene un rol asignado en el panel. Pedile a un superadmin que
            te agregue desde Usuarios.
          </p>
        </div>
      </div>
    );
  }

  const session = {
    email: user.email ?? "",
    nombre: rolRow.nombre ?? user.email ?? "Admin",
    rol: rolRow.rol as RolUsuario,
  };

  return (
    <SessionProvider value={session}>
      <div className="min-h-screen bg-crema">
        <Sidebar />
        <main className="md:ml-56 min-h-screen bg-crema p-6 pt-20 md:pt-6">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}

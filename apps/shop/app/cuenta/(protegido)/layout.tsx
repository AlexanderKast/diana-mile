import { redirect } from "next/navigation";
import { getClienteUser } from "@diana-mile/shared/supabase/server";
import { CerrarSesionButton } from "@/components/cuenta/CerrarSesionButton";

/**
 * Defensa en profundidad: el proxy.ts ya redirige a /cuenta/login sin
 * sesion, pero un Server Component no debe confiar solo en el middleware.
 */
export default async function CuentaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cliente = await getClienteUser();

  if (!cliente) {
    redirect("/cuenta/login");
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 pb-24 md:pb-10">
      <div className="mb-8 flex items-center justify-between">
        <p className="font-display text-2xl text-carbon">Mi cuenta</p>
        <CerrarSesionButton />
      </div>
      {children}
    </div>
  );
}

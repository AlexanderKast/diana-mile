import Link from "next/link";
import {
  getClienteUser,
  createAdminSupabaseClient,
} from "@diana-mile/shared/supabase/server";
import type { Pedido } from "@diana-mile/shared/types";
import { clienteHaComprado } from "@/lib/cuenta";
import { PushOptIn } from "@/components/site/PushOptIn";

export default async function CuentaPage() {
  const cliente = await getClienteUser();
  if (!cliente) return null;

  const admin = createAdminSupabaseClient();
  const { data: ultimoPedido } = await admin
    .from("pedidos")
    .select("*")
    .eq("telefono", cliente.telefono)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<Pedido>();

  const haComprado = await clienteHaComprado(cliente.telefono);

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-carbon-suave">
        {ultimoPedido ? `Hola, ${ultimoPedido.nombre.split(" ")[0]}.` : "Hola."}{" "}
        Aquí puedes ver tus pedidos y tu contenido.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/cuenta/pedidos"
          className="flex flex-col gap-1 rounded-2xl border border-arena bg-blanco p-5 transition-colors hover:bg-crema"
        >
          <p className="font-display text-lg text-carbon">Mis pedidos</p>
          <p className="text-sm text-carbon-suave">
            {ultimoPedido
              ? `Último: ${ultimoPedido.producto_nombre} — ${ultimoPedido.estado}`
              : "Aún no tienes pedidos."}
          </p>
        </Link>

        <Link
          href="/cuenta/contenido"
          className="flex flex-col gap-1 rounded-2xl border border-arena bg-blanco p-5 transition-colors hover:bg-crema"
        >
          <p className="font-display text-lg text-carbon">Contenido premium</p>
          <p className="text-sm text-carbon-suave">
            {haComprado
              ? "Rutinas, guías y planes de Diana."
              : "Se desbloquea con tu primera compra."}
          </p>
        </Link>
      </div>

      <PushOptIn
        telefono={cliente.telefono}
        titulo="Recibe novedades y el estado de tus pedidos"
        descripcion="Activa las notificaciones para no perderte cambios de estado ni contenido nuevo."
      />
    </div>
  );
}

import Link from "next/link";
import {
  getClienteUser,
  createAdminSupabaseClient,
} from "@diana-mile/shared/supabase/server";
import type { Pedido } from "@diana-mile/shared/types";
import { formatCOP } from "@diana-mile/shared/utils";

export default async function PedidosPage() {
  const cliente = await getClienteUser();
  if (!cliente) return null;

  const admin = createAdminSupabaseClient();
  const { data: pedidos } = await admin
    .from("pedidos")
    .select("*")
    .eq("telefono", cliente.telefono)
    .order("created_at", { ascending: false })
    .returns<Pedido[]>();

  return (
    <div className="flex flex-col gap-6">
      <Link href="/cuenta" className="text-xs text-ceniza underline">
        ← Volver
      </Link>
      <p className="font-display text-xl text-carbon">Mis pedidos</p>

      {!pedidos || pedidos.length === 0 ? (
        <p className="text-sm text-carbon-suave">
          Aún no tienes pedidos.{" "}
          <Link href="/productos" className="text-dorado-oscuro underline">
            Ver productos
          </Link>
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {pedidos.map((pedido) => (
            <Link
              key={pedido.id}
              href={`/cuenta/pedidos/${pedido.id}`}
              className="flex flex-col gap-1 rounded-2xl border border-arena bg-blanco p-5 transition-colors hover:bg-crema"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-lg text-carbon">
                  {pedido.producto_nombre}
                </p>
                <span className="shrink-0 rounded-full bg-crema px-3 py-1 text-xs capitalize text-carbon-suave">
                  {pedido.estado.replace("_", " ")}
                </span>
              </div>
              <p className="text-sm text-carbon-suave">
                {new Date(pedido.created_at).toLocaleDateString("es-CO", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}{" "}
                · {formatCOP(pedido.precio_total ?? 0)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

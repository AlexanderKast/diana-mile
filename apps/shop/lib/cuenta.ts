import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import type { EstadoPedido } from "@diana-mile/shared/types";

const ESTADOS_ACCESO_DEFAULT: EstadoPedido[] = [
  "confirmado",
  "en_preparacion",
  "enviado",
  "entregado",
];

/**
 * Un pedido "pendiente" se crea con solo diligenciar el formulario, sin que
 * haya compra real todavia — por eso no cuenta para desbloquear contenido.
 * Los estados que si cuentan son configurables via config.contenido_estados_acceso
 * (JSON array) para no tener que tocar codigo si cambia la regla de negocio.
 */
export async function clienteHaComprado(telefono: string): Promise<boolean> {
  const admin = createAdminSupabaseClient();

  const { data: configRow } = await admin
    .from("config")
    .select("valor")
    .eq("clave", "contenido_estados_acceso")
    .maybeSingle();

  let estados: EstadoPedido[] = ESTADOS_ACCESO_DEFAULT;
  if (configRow?.valor) {
    try {
      const parsed = JSON.parse(configRow.valor);
      if (Array.isArray(parsed) && parsed.length > 0) {
        estados = parsed as EstadoPedido[];
      }
    } catch {
      // JSON invalido en config -> usar el default, nunca romper el gating.
    }
  }

  const { count } = await admin
    .from("pedidos")
    .select("id", { count: "exact", head: true })
    .eq("telefono", telefono)
    .in("estado", estados);

  return (count ?? 0) > 0;
}

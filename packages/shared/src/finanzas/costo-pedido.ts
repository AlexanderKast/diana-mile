import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";

/**
 * El costo unitario que se congela en el pedido al crearlo.
 *
 * POR QUE SE CONGELA Y NO SE CONSULTA DESPUES
 * El costo cambia: Nu Skin sube precios, cambia la lista de
 * distribuidora. Si el panel calculara el margen de un pedido de marzo
 * con el costo de hoy, la utilidad de marzo cambiaria sola cada vez que
 * se actualiza una lista de precios. Se guarda el costo que regia el dia
 * de la venta y ese pedido ya no se mueve.
 *
 * POR QUE DEVUELVE null Y NO 0
 * `null` significa "no se sabe". Guardar 0 haria que el pedido pareciera
 * costeado y con margen completo — exactamente el error que este modulo
 * viene a corregir, solo que escondido dentro de cada fila. Con `null`,
 * la alerta de "pedidos sin costo" los saca a la luz.
 */
export async function costoUnitarioDeVariante(
  variantId: string | null | undefined,
): Promise<number | null> {
  if (!variantId) return null;

  try {
    const supabase = createAdminSupabaseClient();
    const { data } = await supabase
      .from("costos_producto")
      .select("costo_unitario")
      .eq("shopify_variant_id", variantId)
      .maybeSingle();

    if (data?.costo_unitario === null || data?.costo_unitario === undefined) {
      return null;
    }

    const n = Number(data.costo_unitario);
    return Number.isFinite(n) ? n : null;
  } catch (error) {
    // Esto corre dentro de la creacion de un pedido. Que no se pueda leer
    // el costo NUNCA puede impedir que la venta se registre: se guarda
    // null y la alerta lo recoge despues.
    console.error("No se pudo leer el costo de la variante:", error);
    return null;
  }
}

/**
 * Normaliza el id de variante que manda Shopify en un webhook.
 *
 * Los webhooks REST traen un id numerico (`45678901234`) y el resto del
 * sistema usa el gid de GraphQL. Sin normalizar, el `eq()` no encuentra
 * nada y todos los pedidos que entran por Shopify quedan sin costo.
 */
export function gidDeVariante(id: string | number | null | undefined): string | null {
  if (id === null || id === undefined || id === "") return null;
  const texto = String(id);
  if (texto.startsWith("gid://")) return texto;
  if (!/^\d+$/.test(texto)) return null;
  return `gid://shopify/ProductVariant/${texto}`;
}

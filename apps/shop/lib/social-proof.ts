import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";

/**
 * Cuenta pedidos reales (no "pendientes", que se crean con solo diligenciar
 * el formulario sin compra confirmada) de un producto especifico, para
 * mostrar prueba social honesta en la PDP ("+N pedidos de este producto").
 * Si Supabase falla, devuelve 0 — nunca debe romper el render, y el
 * consumidor (RatingBar) simplemente oculta la linea cuando es 0.
 */
export async function getPedidosCount(productoSku: string): Promise<number> {
  try {
    const admin = createAdminSupabaseClient();
    const { count } = await admin
      .from("pedidos")
      .select("id", { count: "exact", head: true })
      .eq("producto_sku", productoSku)
      .neq("estado", "pendiente");

    return count ?? 0;
  } catch {
    return 0;
  }
}

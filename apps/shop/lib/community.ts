import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import { enlaceConTexto } from "@diana-mile/shared/whatsapp/mensajes";

const CLAVE_LINK = "comunidad_whatsapp_link";

/**
 * Link de invitacion al grupo de WhatsApp de la comunidad Milito Life,
 * editable en el admin (tabla config). Si el admin todavia no ha configurado
 * el link del grupo, cae a un chat directo por WhatsApp para que el boton
 * nunca quede roto — usando `enlaceConTexto`, que valida el numero (nunca
 * pinta un boton con el placeholder de desarrollo "57XXXXXXXXXX"), en vez
 * de armar el `wa.me` a mano como hacia esta funcion antes.
 */
export async function getComunidadWhatsappLink(): Promise<string> {
  try {
    const supabase = createAdminSupabaseClient();
    const { data } = await supabase
      .from("config")
      .select("valor")
      .eq("clave", CLAVE_LINK)
      .maybeSingle();

    if (data?.valor) return data.valor;
  } catch {
    // Config no disponible -> usar el fallback de abajo.
  }

  return (
    enlaceConTexto(
      process.env.NEXT_PUBLIC_WHATSAPP_NUMERO,
      "Hola! Quiero unirme a la comunidad Milito Life",
    ) ?? "https://wa.me/"
  );
}

/**
 * El acceso a la comunidad se gana cuando el pedido llega (estado
 * "entregado"), no solo con la compra — es el motivo para recibir el
 * producto, no un regalo anticipado. Por eso no reusa clienteHaComprado.
 */
export async function clienteTieneComunidad(telefono: string): Promise<boolean> {
  const admin = createAdminSupabaseClient();
  const { count } = await admin
    .from("pedidos")
    .select("id", { count: "exact", head: true })
    .eq("telefono", telefono)
    .eq("estado", "entregado");

  return (count ?? 0) > 0;
}

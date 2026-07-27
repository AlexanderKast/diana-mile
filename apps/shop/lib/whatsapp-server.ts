import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";

const CLAVE = "whatsapp_numero";

/**
 * Numero de WhatsApp de la tienda: el del bot, que es quien atiende.
 *
 * Sale de la tabla `config` y no de una variable de entorno para que se
 * pueda cambiar desde el admin sin volver a desplegar. El env queda de
 * respaldo por si la config no responde; si tampoco hay nada, se devuelve
 * null y quien lo use no pinta boton — es preferible a mandar a la gente a
 * un chat que no existe, que es lo que estuvo pasando.
 *
 * Server-only: usa el cliente con service role.
 */
export async function getWhatsappNumero(): Promise<string | null> {
  try {
    const supabase = createAdminSupabaseClient();
    const { data } = await supabase
      .from("config")
      .select("valor")
      .eq("clave", CLAVE)
      .maybeSingle();

    if (data?.valor) return String(data.valor);
  } catch {
    // Config caida -> se intenta con el entorno.
  }
  return process.env.NEXT_PUBLIC_WHATSAPP_NUMERO ?? null;
}

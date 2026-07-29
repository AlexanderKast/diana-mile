import type { LandingVariante } from "@diana-mile/shared/types";
import { createPublicClient } from "@diana-mile/shared/supabase/client";

/**
 * Busca una variante de landing por su slug. Lectura con el cliente anon
 * (la tabla tiene SELECT publico: el contenido se publica en /l/ igual).
 * Devuelve null si no existe o si Supabase falla — el caller decide el
 * fallback (notFound en /l/, PDP publica en /go/).
 */
export async function getLandingVariante(
  slug: string,
): Promise<LandingVariante | null> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("landing_variantes")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error("[landing-variantes] error leyendo variante:", error.message);
      return null;
    }
    return (data as LandingVariante | null) ?? null;
  } catch (error) {
    console.error("[landing-variantes] error inesperado:", error);
    return null;
  }
}

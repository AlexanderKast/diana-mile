import type { SupabaseClient } from "@supabase/supabase-js";

const MAX_VERSIONES = 20;

/**
 * Archiva la version anterior de una landing antes de sobreescribirla, con
 * el autor del cambio. Best-effort: un fallo aqui nunca bloquea el guardado.
 */
export async function archivarVersion(
  supabase: SupabaseClient,
  referencia: string,
  contenido: unknown,
  autor: string | null,
): Promise<void> {
  try {
    if (!contenido || Object.keys(contenido as object).length === 0) return;

    await supabase.from("landing_versiones").insert({
      referencia,
      contenido,
      autor,
    });

    // Conservar solo las ultimas MAX_VERSIONES (el tope de 60KB por landing
    // hace esto barato).
    const { data: viejas } = await supabase
      .from("landing_versiones")
      .select("id")
      .eq("referencia", referencia)
      .order("created_at", { ascending: false })
      .range(MAX_VERSIONES, MAX_VERSIONES + 50);

    if (viejas && viejas.length > 0) {
      await supabase
        .from("landing_versiones")
        .delete()
        .in(
          "id",
          viejas.map((v) => v.id),
        );
    }
  } catch (error) {
    console.warn("[versiones] no se pudo archivar:", error);
  }
}

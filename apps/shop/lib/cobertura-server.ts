import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";

export type CoberturaResumen = {
  /** Ciudades y municipios donde la transportadora entrega. */
  ciudades: number;
  /** De esas, en cuantas se puede cobrar contraentrega (recaudo). */
  conRecaudo: number;
  /** Ventana de entrega mas rapida que existe hoy, en dias. */
  diasMin: number;
  /** Ventana mas lenta, para no prometer de menos. */
  diasMax: number;
};

/**
 * Prueba social que no hay que inventar.
 *
 * La tabla `cobertura_entrega` tiene el dato real por municipio: si se
 * entrega, si se puede recaudar contraentrega ahi, y en cuantos dias. Es
 * mucho mas convincente que tres reseñas escritas a mano — y sobre todo, es
 * verificable. Si el numero cambia porque la transportadora amplia o recorta
 * cobertura, la pagina lo refleja sin que nadie tenga que acordarse.
 *
 * Server-only: usa el cliente con service role.
 */
export async function getCoberturaResumen(): Promise<CoberturaResumen | null> {
  try {
    const supabase = createAdminSupabaseClient();

    const [total, recaudo, rapidas, lentas] = await Promise.all([
      supabase
        .from("cobertura_entrega")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("cobertura_entrega")
        .select("id", { count: "exact", head: true })
        .eq("recaudo", true),
      supabase
        .from("cobertura_entrega")
        .select("dias_min")
        .order("dias_min", { ascending: true })
        .limit(1),
      supabase
        .from("cobertura_entrega")
        .select("dias_max")
        .order("dias_max", { ascending: false })
        .limit(1),
    ]);

    const ciudades = total.count ?? 0;
    const conRecaudo = recaudo.count ?? 0;
    if (ciudades === 0) return null;

    return {
      ciudades,
      conRecaudo,
      diasMin: rapidas.data?.[0]?.dias_min ?? 1,
      diasMax: lentas.data?.[0]?.dias_max ?? 5,
    };
  } catch {
    // La home nunca debe romperse por esto: sin dato, no se pinta el bloque.
    return null;
  }
}

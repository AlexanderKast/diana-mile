import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";

/**
 * Prueba social con DATOS REALES: pedidos entregados contados de la base.
 * Por regla de marca aqui no se inventa nada — si todavia no hay volumen
 * suficiente, el bloque simplemente no se muestra (mejor nada que un
 * numero chiquito jugando en contra, y jamas un numero falso).
 */
const MINIMO_PARA_MOSTRAR = 25;

export async function PruebaSocialBloque() {
  let entregados = 0;
  try {
    const supabase = createAdminSupabaseClient();
    const { count } = await supabase
      .from("pedidos")
      .select("id", { count: "exact", head: true })
      .eq("estado", "entregado");
    entregados = count ?? 0;
  } catch {
    return null;
  }

  if (entregados < MINIMO_PARA_MOSTRAR) return null;

  // Redondeo hacia abajo a la decena: "130+" es honesto y estable.
  const redondeado = Math.floor(entregados / 10) * 10;

  return (
    <div className="flex items-center justify-center gap-3 px-6 py-4">
      <span className="font-display text-3xl text-dorado-oscuro">
        {redondeado}+
      </span>
      <span className="text-sm text-carbon-suave max-w-[220px]">
        pedidos entregados contraentrega en Colombia
      </span>
    </div>
  );
}

import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";

export type TestimonioPublicable = {
  texto: string;
  nombre: string | null;
  ciudad: string | null;
};

/**
 * Los testimonios que SI se pueden publicar de un producto.
 *
 * PARA QUE SIRVE
 * El generador de la seccion `testimonios` de "Landing magica" tiene que
 * llamar a esto y usar lo que devuelva, literal. Si vuelve vacio, la
 * respuesta correcta es un 400 diciendo que ese producto todavia no tiene
 * testimonios recolectados — nunca inventarse citas ni pedirle al modelo
 * que las redacte. Una resena fabricada es publicidad enganosa, y ademas
 * AGENTS.md lo prohibe explicitamente.
 *
 * LOS DOS FILTROS SON OBLIGATORIOS
 * `aprobado` es que alguien del equipo lo reviso; `consentimiento` es que
 * la clienta autorizo publicarlo. Sin los dos no sale.
 *
 * Si el producto no tiene ninguno propio, cae a los que no estan atados a
 * ningun handle: son igual de reales, solo que la clienta hablo de la
 * tienda y no de un producto concreto.
 */
export async function testimoniosAprobados(
  handle: string,
  limite = 4,
): Promise<TestimonioPublicable[]> {
  const supabase = createAdminSupabaseClient();

  const publicables = () =>
    supabase
      .from("testimonios")
      .select("texto, nombre, ciudad")
      .eq("estado", "aprobado")
      .eq("consentimiento", true)
      .order("created_at", { ascending: false })
      .limit(limite);

  const { data, error } = await publicables().eq("producto_handle", handle);
  if (error) {
    console.error("[testimonios-aprobados] fallo la consulta:", error.message);
    return [];
  }
  if (data?.length) return data as TestimonioPublicable[];

  const { data: generales } = await publicables().is("producto_handle", null);
  return (generales ?? []) as TestimonioPublicable[];
}

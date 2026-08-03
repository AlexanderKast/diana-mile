import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import type { RespuestasQuiz } from "./tipos";

/**
 * Lista BLANCA de ids de paso cuyo significado es identico entre puertas —
 * los unicos que se pueden reusar para no repetirle una pregunta a quien ya
 * la respondio en otro test. Es explicita a proposito: hay ids que
 * coinciden en string entre puertas pero con OPCIONES distintas
 * (`objetivo_principal` existe en piel y energia con listas diferentes) —
 * un matching ciego por id contaminaria el diagnostico con valores que la
 * puerta actual no sabe interpretar.
 *
 * Verificado contra los archivos de puerta (2026-08):
 *   edad                  piel / energia / peso
 *   pais                  las 5 puertas
 *   horas_sueno           piel / energia / peso
 *   constancia_agua       piel / energia
 *   nivel_estres          piel / energia / peso
 *   frecuencia_movimiento energia / peso
 *   horizonte_resultados  piel / energia / peso
 */
export const PASOS_COMPARTIDOS: readonly string[] = [
  "edad",
  "pais",
  "horas_sueno",
  "constancia_agua",
  "nivel_estres",
  "frecuencia_movimiento",
  "horizonte_resultados",
];

/** Nombre de la cookie de identidad anonima — emitida por proxy.ts. */
export const COOKIE_VISITANTE = "ml_visitante";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Respuestas previas reutilizables de este visitante: recorre sus filas de
 * `quiz_respuestas` (cualquier puerta, completadas o a medias, mas
 * recientes primero) y extrae SOLO los pasos de la lista blanca. Si el
 * mismo paso aparece en varias filas gana la respuesta mas reciente.
 * Best-effort: cualquier error devuelve `{}` — el quiz simplemente
 * pregunta todo, nunca se rompe por esto.
 */
export async function obtenerRespuestasPrevias(
  visitanteId: string | undefined,
): Promise<RespuestasQuiz> {
  if (!visitanteId || !UUID_REGEX.test(visitanteId)) return {};

  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("quiz_respuestas")
      .select("respuestas")
      .eq("visitante_id", visitanteId)
      .order("actualizado_en", { ascending: false })
      .limit(10);

    if (error || !data) return {};

    const previas: RespuestasQuiz = {};
    for (const fila of data) {
      const respuestas = (fila.respuestas ?? {}) as RespuestasQuiz;
      for (const id of PASOS_COMPARTIDOS) {
        if (previas[id] === undefined && respuestas[id] !== undefined) {
          previas[id] = respuestas[id];
        }
      }
    }
    return previas;
  } catch {
    return {};
  }
}

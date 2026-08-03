import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import { esPuertaValida, obtenerPuerta } from "@/lib/quiz/puertas";
import { CONTRATOS_RESULTADO } from "@/lib/quiz/puertas/contratos";
import { zonaOfertaDesdePais } from "@/lib/quiz/paises";
import { COOKIE_VISITANTE } from "@/lib/quiz/previas";
import type { RespuestasQuiz } from "@/lib/quiz/tipos";

/**
 * Cierre del quiz: guarda el resultado final en `quiz_respuestas` y
 * devuelve su id — eso es lo que alimenta `usuarios_plan.quiz_respuesta_id`
 * cuando la persona se registra en el panel (siguiente paso del funnel).
 *
 * Si ya existia un id (porque /api/quiz/abandono habia creado la fila
 * mientras la persona todavia estaba respondiendo), se actualiza esa MISMA
 * fila en vez de duplicarla.
 *
 * BUG arreglado aca: esta ruta guardaba a ciegas el `score`/`segmento` que
 * mandaba el cliente (QuizRunner ya los calcula con `puerta.calcularResultado`
 * para poder mostrarlos de inmediato) y nunca escribia `fecha_objetivo` —
 * la pantalla /resultado/[id] lee esa columna y, sin ella, la seccion "Tu
 * fecha objetivo" simplemente no aparecia nunca. Confiar en el score/segmento
 * del cliente ademas es un hueco de integridad (cualquiera puede mandar
 * cualquier `segmento` por fetch). Se recalcula todo en el servidor con las
 * `respuestas` crudas: mismo resultado para un cliente honesto, resultado
 * correcto para uno que no lo es.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, puerta, respuestas, pais } = body ?? {};

    if (!puerta || !respuestas || !esPuertaValida(puerta)) {
      return NextResponse.json(
        { mensaje: "Faltan datos del quiz." },
        { status: 400 },
      );
    }

    const respuestasQuiz = respuestas as RespuestasQuiz;
    const zonaOferta = zonaOfertaDesdePais(
      typeof pais === "string" ? pais : undefined,
    );

    const puertaConfig = obtenerPuerta(puerta);
    const resultado = puertaConfig.calcularResultado(respuestasQuiz, zonaOferta);

    // `calcularFechaObjetivo` solo esta implementado en el contrato de
    // "piel" hoy (unica puerta con contenido real y con
    // `diasResultadoEstimado` por segmento — ver
    // lib/quiz/puertas/piel-prescripcion.ts). El resto todavia usa
    // `crearPuertaEjemplo` y su contrato placeholder no trae la funcion, asi
    // que no hay de donde sacar una fecha honesta.
    const fechaObjetivo =
      CONTRATOS_RESULTADO[puerta]?.calcularFechaObjetivo?.(
        respuestasQuiz,
        resultado.segmento,
      ) ?? null;

    const supabase = createAdminSupabaseClient();
    // De la cookie del request, nunca del body — no falsificable.
    const visitanteId = request.cookies.get(COOKIE_VISITANTE)?.value ?? null;

    const filaFinal = {
      puerta,
      respuestas: respuestasQuiz,
      score: resultado.score,
      segmento: resultado.segmento,
      pais: pais ?? null,
      zona_oferta: resultado.zonaOferta,
      visitante_id: visitanteId,
      // DATE en Postgres: se manda YYYY-MM-DD, sin hora ni zona horaria.
      fecha_objetivo: fechaObjetivo
        ? fechaObjetivo.toISOString().slice(0, 10)
        : null,
      completado: true,
      paso_abandono: null,
    };

    if (id) {
      // El id viaja en el body porque /api/quiz/abandono ya pudo haber
      // creado la fila — pero ese id también queda expuesto en la URL
      // pública /resultado/[id] (se comparte por WhatsApp a propósito).
      // Por eso el update solo puede aplicar sobre una fila que TODAVIA
      // no esté completada: una vez cerrado el diagnóstico, este endpoint
      // no puede volver a reescribirlo aunque alguien reenvíe el mismo id.
      const { data, error } = await supabase
        .from("quiz_respuestas")
        .update(filaFinal)
        .eq("id", id)
        .eq("completado", false)
        .select("id")
        .single();

      if (error || !data) {
        throw error ?? new Error("No se pudo actualizar el quiz.");
      }

      return NextResponse.json({ id: data.id });
    }

    const { data, error } = await supabase
      .from("quiz_respuestas")
      .insert(filaFinal)
      .select("id")
      .single();

    if (error || !data) {
      throw error ?? new Error("No se pudo guardar el quiz.");
    }

    return NextResponse.json({ id: data.id });
  } catch (error) {
    console.error("Error al guardar quiz:", error);
    return NextResponse.json(
      { mensaje: "No pudimos guardar tu resultado. Intenta de nuevo." },
      { status: 500 },
    );
  }
}

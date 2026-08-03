import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import { COOKIE_VISITANTE } from "@/lib/quiz/previas";

/**
 * Registro de abandono: se llama con debounce en cada avance del quiz,
 * ANTES de que la persona lo termine (mismo patron que
 * apps/shop/app/api/leads/carrito/route.ts para el carrito abandonado del
 * checkout). `paso_abandono` queda escrito de antemano — si la persona
 * nunca vuelve, `completado` se queda en false y el dashboard puede ver
 * exactamente en que pregunta se cayo.
 *
 * Primera llamada: no hay `id` todavia -> se inserta la fila y se devuelve
 * su id. El cliente lo guarda (junto al estado en localStorage) y lo manda
 * en las llamadas siguientes para actualizar la MISMA fila en vez de crear
 * una por cada avance.
 *
 * `visitante_id` sale de la cookie del REQUEST (ml_visitante, emitida por
 * proxy.ts), nunca del body — un cliente no puede escribir respuestas a
 * nombre de otro visitante inventando un id.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, puerta, respuestas, pasoActual, pais } = body ?? {};

    if (!puerta || typeof pasoActual !== "number") {
      return NextResponse.json({ ok: false }, { status: 200 });
    }

    const visitanteId = request.cookies.get(COOKIE_VISITANTE)?.value ?? null;
    const supabase = createAdminSupabaseClient();

    if (id) {
      // `.eq("puerta", ...)` + select: el update solo aplica a la fila
      // correcta y detectamos "0 filas afectadas" (id de otra puerta,
      // fila ya completada o borrada) para caer al insert de abajo en vez
      // de responder ok sobre nada — bug arreglado en esta pasada.
      const { data: actualizada } = await supabase
        .from("quiz_respuestas")
        .update({
          respuestas: respuestas ?? {},
          paso_abandono: pasoActual,
          pais: pais ?? null,
          visitante_id: visitanteId,
        })
        .eq("id", id)
        .eq("puerta", puerta)
        .eq("completado", false)
        .select("id")
        .maybeSingle();

      if (actualizada) {
        return NextResponse.json({ ok: true, id });
      }
      // Sin fila actualizable -> sigue al insert como si no hubiera id.
    }

    const { data, error } = await supabase
      .from("quiz_respuestas")
      .insert({
        puerta,
        respuestas: respuestas ?? {},
        paso_abandono: pasoActual,
        pais: pais ?? null,
        visitante_id: visitanteId,
        completado: false,
      })
      .select("id")
      .single();

    if (error || !data) {
      return NextResponse.json({ ok: false }, { status: 200 });
    }

    return NextResponse.json({ ok: true, id: data.id });
  } catch (error) {
    // Best-effort, igual que leads/carrito: el abandono nunca debe
    // interrumpir el flujo del quiz ni mostrarle un error a la persona.
    console.error("Error al registrar abandono de quiz:", error);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

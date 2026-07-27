import type { SupabaseClient } from "@supabase/supabase-js";
import { enviarTexto } from "./client";
import { encolarMensaje } from "./outbox";
import { PLANTILLAS } from "./plantillas";
import { enHorarioDeEnvio } from "./horario";

/**
 * Vigila las conversaciones escaladas que nadie atendio.
 *
 * Cuando el agente escala, le dice a la persona "dejame validar eso y te
 * confirmo en un momentico" — y hasta ahora no quedaba nada corriendo
 * detras de esa promesa: si el equipo no entraba, esa persona no recibia
 * nada nunca. Prometer y no cumplir es peor que no haber prometido.
 *
 * Este vigilante corre con el ciclo del cron y hace dos cosas:
 *  · a los 45 minutos sin atender, le escribe para que sepa que sigue en
 *    pie, y vuelve a avisarle a Diana;
 *  · a las 3 horas, da la cara con honestidad y reactiva el agente, para
 *    que al menos pueda seguir ayudando en lo que si sabe.
 */

const MINUTOS_PRIMER_AVISO = 45;
const HORAS_PARA_RENDIRSE = 3;

/** La ventana de WhatsApp: sin esto no se puede mandar texto libre. */
const VENTANA_MS = 24 * 60 * 60 * 1000;

type ConversacionEscalada = {
  id: string;
  telefono: string;
  nombre: string | null;
  escalado_at: string;
  motivo_escalado: string | null;
  ultimo_entrante_at: string | null;
  aviso_seguimiento_at: string | null;
};

export type ResultadoVigilancia = {
  revisadas: number;
  avisadas: number;
  reactivadas: number;
};

/**
 * Nunca lanza: es una tarea de fondo y un fallo aqui no puede tumbar el
 * resto del ciclo del cron.
 */
export async function vigilarEscalamientos(
  supabase: SupabaseClient,
): Promise<ResultadoVigilancia> {
  const resultado: ResultadoVigilancia = {
    revisadas: 0,
    avisadas: 0,
    reactivadas: 0,
  };

  try {
    const { data: escaladas } = await supabase
      .from("whatsapp_conversaciones")
      .select(
        "id, telefono, nombre, escalado_at, motivo_escalado, ultimo_entrante_at, aviso_seguimiento_at",
      )
      .not("escalado_at", "is", null)
      .eq("ia_activa", false)
      .limit(25);

    if (!escaladas?.length) return resultado;
    resultado.revisadas = escaladas.length;

    const ahora = Date.now();

    for (const conv of escaladas as ConversacionEscalada[]) {
      const minutos = (ahora - new Date(conv.escalado_at).getTime()) / 60_000;
      const primerNombre = (conv.nombre ?? "").split(/\s+/)[0];

      // ¿Sigue abierta la ventana para escribirle texto libre?
      const ventanaAbierta = conv.ultimo_entrante_at
        ? ahora - new Date(conv.ultimo_entrante_at).getTime() < VENTANA_MS
        : false;

      // Se rindio la espera: se devuelve la conversacion al agente para
      // que al menos pueda seguir atendiendo lo que si sabe resolver.
      if (minutos >= HORAS_PARA_RENDIRSE * 60) {
        await supabase
          .from("whatsapp_conversaciones")
          .update({
            ia_activa: true,
            escalado_at: null,
            motivo_escalado: null,
            aviso_seguimiento_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", conv.id);
        resultado.reactivadas++;

        if (ventanaAbierta && enHorarioDeEnvio()) {
          await enviarTexto(
            conv.telefono,
            `${primerNombre ? primerNombre + ", p" : "P"}erdon la demora en responderte. Cuentame de nuevo que necesitas y lo resolvemos ahora 💚`,
          );
        }
        continue;
      }

      // Primer recordatorio: una sola vez, para no acosar.
      if (minutos >= MINUTOS_PRIMER_AVISO && !conv.aviso_seguimiento_at) {
        if (ventanaAbierta && enHorarioDeEnvio()) {
          await enviarTexto(
            conv.telefono,
            `${primerNombre ? primerNombre + ", s" : "S"}igo revisando lo tuyo, no te he dejado. Apenas lo tenga claro te escribo 💚`,
          );
          resultado.avisadas++;
        }

        await supabase
          .from("whatsapp_conversaciones")
          .update({ aviso_seguimiento_at: new Date().toISOString() })
          .eq("id", conv.id);

        // Y se le vuelve a avisar a Diana: la primera notificacion pudo
        // pasar desapercibida.
        const numeroAdmin = process.env.WHATSAPP_ADMIN_NUMERO;
        if (numeroAdmin && PLANTILLAS.avisoAsesor.id) {
          await encolarMensaje(supabase, {
            telefonoE164: numeroAdmin,
            tipo: "escalamiento",
            plantilla: PLANTILLAS.avisoAsesor,
            variables: {
              "1": conv.nombre ?? "Una clienta",
              "2": conv.telefono,
              "3": `SIGUE ESPERANDO hace ${Math.round(minutos)} min: ${(conv.motivo_escalado ?? "sin detalle").slice(0, 180)}`,
            },
          });
        }
      }
    }
  } catch (err) {
    console.error("[vigilante] fallo al revisar escalamientos:", err);
  }

  return resultado;
}

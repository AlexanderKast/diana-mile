import webpush from "web-push";
import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";

let configurado = false;

function asegurarConfiguracion() {
  if (configurado) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  configurado = true;
}

export type EnviarPushResultado = { enviados: number; fallidos: number };

/**
 * Envia una notificacion push a un telefono (E.164) o a "todos" los
 * suscritos. Un envio fallido nunca debe romper el flujo que lo dispara
 * (ej. confirmar/enviar/entregar un pedido) — por eso siempre resuelve,
 * nunca rechaza. Suscripciones muertas (404/410 — el navegador ya no
 * las reconoce) se borran automaticamente.
 */
export async function enviarPush(
  destino: string | "todos",
  payload: { titulo: string; cuerpo: string; url?: string },
): Promise<EnviarPushResultado> {
  asegurarConfiguracion();

  const admin = createAdminSupabaseClient();
  let query = admin.from("push_suscripciones").select("*");
  if (destino !== "todos") {
    query = query.eq("telefono", destino);
  }

  const { data: suscripciones } = await query;
  if (!suscripciones || suscripciones.length === 0) {
    return { enviados: 0, fallidos: 0 };
  }

  const notificacion = JSON.stringify({
    title: payload.titulo,
    body: payload.cuerpo,
    url: payload.url ?? "/",
  });

  let enviados = 0;
  let fallidos = 0;

  await Promise.all(
    suscripciones.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          notificacion,
        );
        enviados++;
      } catch (error) {
        fallidos++;
        const statusCode =
          error && typeof error === "object" && "statusCode" in error
            ? (error as { statusCode?: number }).statusCode
            : undefined;
        if (statusCode === 404 || statusCode === 410) {
          await admin.from("push_suscripciones").delete().eq("id", sub.id);
        }
      }
    }),
  );

  return { enviados, fallidos };
}

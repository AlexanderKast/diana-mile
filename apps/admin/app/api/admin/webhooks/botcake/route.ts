import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import {
  esDeNuestraLinea,
  interpretarWhatsApp,
  procesar,
  type PayloadBotcake,
  type PayloadWhatsApp,
} from "@/lib/webhook-botcake";

/**
 * Webhook de Botcake — formato propio, autenticado por header.
 *
 * Lo usan las pruebas y cualquier flow que se arme a mano dentro de
 * Botcake (donde si se pueden configurar headers). Los eventos reales de
 * WhatsApp llegan por la ruta con token: ver ./[token]/route.ts.
 */

/**
 * Botcake valida la URL antes de dejarla guardar, y esa comprobacion no
 * manda credenciales. Un 200 aqui no revela nada ni ejecuta nada.
 */
export async function GET(request: NextRequest) {
  const challenge = request.nextUrl.searchParams.get("hub.challenge");
  if (challenge) return new NextResponse(challenge, { status: 200 });
  return NextResponse.json({ ok: true }, { status: 200 });
}

/** Comparacion en tiempo constante: no filtra cuantos caracteres acerto. */
function secretValido(provisto: string | null, esperado: string): boolean {
  if (!provisto) return false;
  const a = Buffer.from(provisto);
  const b = Buffer.from(esperado);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  const secret = process.env.BOTCAKE_WEBHOOK_SECRET;
  const provisto = request.headers.get("x-webhook-secret");

  let bruto: (PayloadBotcake & PayloadWhatsApp) | null;
  try {
    bruto = (await request.json()) as PayloadBotcake & PayloadWhatsApp;
  } catch {
    bruto = null;
  }

  if (!bruto) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  let evento: PayloadBotcake | null = null;

  if (bruto.object === "whatsapp_business_account" || bruto.entry) {
    // Compatibilidad: Botcake puede seguir apuntando a esta URL sin token
    // si todavia no se actualizo en su panel. Se procesa validando que el
    // evento sea de la linea de la tienda, pero se avisa en cada llamada:
    // esta ruta no tiene autenticacion fuerte y deberia migrar a la de
    // token, que es la unica forma de evitar que un tercero inyecte
    // mensajes falsos.
    if (!esDeNuestraLinea(bruto)) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }
    console.warn(
      "[webhook-botcake] recibido en la URL sin token — actualizar el callback en Botcake a /api/admin/webhooks/botcake/<token>",
    );
    evento = interpretarWhatsApp(bruto);
  } else if (bruto.telefono || bruto.psid) {
    if (!secret || !secretValido(provisto, secret)) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }
    evento = bruto;
  }

  // Ping de verificacion, acuse de entrega o lectura: nada que procesar.
  if (!evento) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }
  waitUntil(
    procesar(evento).catch((err) => {
      console.error("[webhook-botcake] fallo al procesar:", err);
    }),
  );

  return NextResponse.json({ recibido: true }, { status: 200 });
}

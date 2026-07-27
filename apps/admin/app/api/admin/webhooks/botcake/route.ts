import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import {
  procesar,
  type PayloadBotcake,
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

  let payload: PayloadBotcake | null;
  try {
    payload = (await request.json()) as PayloadBotcake;
  } catch {
    payload = null;
  }

  // Ping de verificacion de la URL: sin destinatario no hay accion posible.
  if (!payload || (!payload.telefono && !payload.psid)) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  if (!secret || !secretValido(provisto, secret)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const evento = payload;
  waitUntil(
    procesar(evento).catch((err) => {
      console.error("[webhook-botcake] fallo al procesar:", err);
    }),
  );

  return NextResponse.json({ recibido: true }, { status: 200 });
}

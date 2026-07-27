import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import {
  esDeNuestraLinea,
  interpretarWhatsApp,
  procesar,
  type PayloadWhatsApp,
} from "@/lib/webhook-botcake";

/**
 * Webhook de Botcake para los eventos reales de WhatsApp.
 *
 * Botcake reenvia el payload nativo de la WhatsApp Cloud API desde su
 * pantalla de Integraciones → API, que NO permite configurar cabeceras.
 * Sin header no hay donde mandar un secret, asi que el secret viaja en la
 * ruta: la URL completa es la credencial y por eso no debe compartirse ni
 * pegarse fuera de Botcake.
 *
 * No se usa `metadata.phone_number_id` como autenticador: identifica la
 * linea pero no es secreto, y cualquiera que lo conociera podria inyectar
 * mensajes falsos y hacer que el bot le escriba a numeros arbitrarios. Se
 * mantiene solo como filtro adicional, despues del token.
 */
export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
}

function tokenValido(provisto: string, esperado: string): boolean {
  const a = Buffer.from(provisto);
  const b = Buffer.from(esperado);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const esperado = process.env.BOTCAKE_WEBHOOK_SECRET;

  if (!esperado || !tokenValido(token, esperado)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  let payload: PayloadWhatsApp | null;
  try {
    payload = (await request.json()) as PayloadWhatsApp;
  } catch {
    payload = null;
  }

  if (!payload) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // Segundo filtro: que el evento sea de la linea de la tienda y no de
  // otra cuenta que compartiera el mismo callback.
  if (!esDeNuestraLinea(payload)) {
    console.warn("[webhook-botcake] evento de otra linea, ignorado");
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // Acuses de entrega y lectura llegan sin mensaje: no hay nada que hacer.
  const evento = interpretarWhatsApp(payload);
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

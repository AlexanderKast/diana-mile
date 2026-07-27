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
 * pantalla de Integraciones → API, que NO permite configurar cabeceras y
 * tampoco reenvia la firma X-Hub-Signature-256 de Meta (se verificaron las
 * cabeceras que llegan: solo content-type, user-agent y las que agrega el
 * proxy). Sin header ni firma, la unica credencial posible viaja en la
 * ruta, asi que la URL completa ES el secreto.
 *
 * Riesgo asumido: una URL con secreto queda escrita en los logs de acceso
 * de Vercel y de cualquier proxy intermedio. Se acota de dos formas:
 *  · el token es exclusivo de esta ruta (BOTCAKE_WEBHOOK_PATH_TOKEN), no
 *    el secret general, asi que filtrarlo no compromete nada mas;
 *  · se rota cambiando la variable y volviendo a pegar la URL en Botcake.
 *
 * `metadata.phone_number_id` NO autentica: identifica la linea pero no es
 * secreto, y cualquiera que lo conociera podria inyectar mensajes falsos.
 * Se usa solo como filtro posterior al token.
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
  const esperado = process.env.BOTCAKE_WEBHOOK_PATH_TOKEN;

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

import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { enviarPlantilla } from "@diana-mile/shared/botcake/client";
import { PLANTILLAS } from "@diana-mile/shared/botcake/plantillas";

/**
 * Manda el codigo de acceso a la cuenta por WhatsApp.
 *
 * Lo llama Supabase Auth: en su panel se configura este endpoint como
 * "Send SMS Hook", y con eso `signInWithOtp` y `verifyOtp` siguen
 * funcionando igual en la tienda, sin tocar una linea del login. Supabase
 * genera y valida el codigo; lo unico que le falta es por donde mandarlo.
 *
 * Por que aqui y no con el proveedor de Supabase: hoy el login esta
 * caido —Supabase responde "phone_provider_disabled"— y habilitarlo obliga
 * a contratar Twilio o similar. El WABA ya esta pagado y funcionando, asi
 * que el mensaje sale por ahi y no hay un proveedor mas que mantener.
 */

const SECRETO = process.env.SUPABASE_AUTH_HOOK_SECRET;

/**
 * Supabase firma con el formato Standard Webhooks: el secreto viene como
 * "v1,whsec_<base64>" y la firma se calcula sobre id.timestamp.cuerpo.
 */
function firmaValida(
  cuerpo: string,
  id: string | null,
  timestamp: string | null,
  cabecera: string | null,
): boolean {
  if (!SECRETO || !id || !timestamp || !cabecera) return false;

  const base64 = SECRETO.replace(/^v1,whsec_/, "").replace(/^whsec_/, "");
  const clave = Buffer.from(base64, "base64");
  const esperada = crypto
    .createHmac("sha256", clave)
    .update(`${id}.${timestamp}.${cuerpo}`)
    .digest("base64");

  // La cabecera puede traer varias firmas separadas por espacio ("v1,xxx
  // v1,yyy") mientras se rota el secreto: basta con que una cuadre.
  return cabecera.split(" ").some((parte) => {
    const valor = parte.split(",").pop() ?? "";
    try {
      return crypto.timingSafeEqual(
        Buffer.from(valor),
        Buffer.from(esperada),
      );
    } catch {
      return false;
    }
  });
}

type CuerpoHook = {
  user?: { phone?: string };
  sms?: { otp?: string };
};

export async function POST(request: NextRequest) {
  const cuerpo = await request.text();

  if (
    !firmaValida(
      cuerpo,
      request.headers.get("webhook-id"),
      request.headers.get("webhook-timestamp"),
      request.headers.get("webhook-signature"),
    )
  ) {
    return NextResponse.json({ error: "Firma invalida." }, { status: 401 });
  }

  let datos: CuerpoHook;
  try {
    datos = JSON.parse(cuerpo);
  } catch {
    return NextResponse.json({ error: "Cuerpo invalido." }, { status: 400 });
  }

  const telefono = datos.user?.phone?.trim();
  const codigo = datos.sms?.otp?.trim();

  if (!telefono || !codigo) {
    return NextResponse.json(
      { error: "Faltan el telefono o el codigo." },
      { status: 400 },
    );
  }

  const plantilla = PLANTILLAS.codigoAcceso;
  if (!plantilla.id) {
    console.error("[otp-whatsapp] la plantilla de codigo aun no tiene id");
    return NextResponse.json(
      { error: "Plantilla de codigo no configurada." },
      { status: 503 },
    );
  }

  // Supabase guarda el telefono sin "+"; Botcake lo quiere en E.164.
  const e164 = telefono.startsWith("+") ? telefono : `+${telefono}`;

  const envio = await enviarPlantilla({
    telefonoE164: e164,
    templateId: plantilla.id,
    categoria: plantilla.categoria,
    variables: { "1": codigo },
  });

  if (!envio.success) {
    // Un 500 hace que Supabase le diga a la persona que no se pudo enviar,
    // en vez de dejarla esperando un codigo que nunca llega.
    console.error(`[otp-whatsapp] no se pudo enviar a ${e164}: ${envio.error}`);
    return NextResponse.json({ error: "No se pudo enviar." }, { status: 500 });
  }

  return NextResponse.json({}, { status: 200 });
}

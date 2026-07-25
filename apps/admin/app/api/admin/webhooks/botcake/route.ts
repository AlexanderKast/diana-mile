import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import { responderMensaje } from "@diana-mile/shared/botcake/ia/agente";
import { agregarNotaOrden, agregarTagsOrden } from "@/lib/shopify";
import { enviarPush } from "@/lib/push";

/**
 * Webhook entrante desde Botcake: los flows de la pagina hacen POST aqui
 * cuando el cliente pulsa un boton de plantilla o escribe un mensaje.
 *
 * Mismo patron que el webhook de Shopify: se responde 200 de una y el
 * trabajo pesado corre despues, para que Botcake no reintente por timeout.
 */

type EventoBotcake =
  | "confirmado"
  | "modificar"
  | "anulado"
  | "asesor"
  | "mensaje";

type PayloadBotcake = {
  telefono?: string;
  psid?: string;
  evento?: EventoBotcake;
  texto?: string;
  nombre?: string;
};

/** wa_573132947776 → +573132947776 */
function normalizarTelefono(payload: PayloadBotcake): string | null {
  const crudo = payload.telefono ?? payload.psid ?? "";
  const digitos = crudo.replace(/\D/g, "");
  if (digitos.length < 10) return null;
  return `+${digitos}`;
}

async function pedidoDe(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
  telefono: string,
) {
  const { data } = await supabase
    .from("pedidos")
    .select("id, estado, shopify_order_id, nombre, producto_nombre")
    .eq("telefono", telefono)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

async function procesar(payload: PayloadBotcake): Promise<void> {
  const telefono = normalizarTelefono(payload);
  if (!telefono) {
    console.warn("[webhook-botcake] payload sin telefono valido");
    return;
  }

  const supabase = createAdminSupabaseClient();
  const evento = payload.evento ?? "mensaje";
  const pedido = await pedidoDe(supabase, telefono);

  await supabase.from("whatsapp_eventos").insert({
    pedido_id: pedido?.id ?? null,
    telefono,
    evento,
    payload: payload as Record<string, unknown>,
  });

  // Un mensaje libre lo atiende el agente de IA.
  if (evento === "mensaje") {
    if (!payload.texto?.trim()) return;
    const resultado = await responderMensaje(supabase, {
      telefonoE164: telefono,
      texto: payload.texto.trim(),
      nombre: payload.nombre ?? pedido?.nombre ?? null,
    });

    if (resultado.escalar) {
      enviarPush("todos", {
        titulo: "WhatsApp necesita a una persona 💬",
        cuerpo: `${payload.nombre ?? telefono}: ${payload.texto.slice(0, 80)}`,
        url: "/dashboard/whatsapp",
      }).catch(() => {});
    }
    return;
  }

  // Los botones de las plantillas mueven el estado del pedido.
  if (!pedido) {
    console.warn(`[webhook-botcake] evento ${evento} sin pedido para ${telefono}`);
    return;
  }

  const nuevoEstado =
    evento === "confirmado"
      ? "confirmado"
      : evento === "anulado"
        ? "cancelado"
        : null;

  if (nuevoEstado) {
    await supabase
      .from("pedidos")
      .update({ estado: nuevoEstado, updated_at: new Date().toISOString() })
      .eq("id", pedido.id);

    await supabase.from("confirmaciones").insert({
      pedido_id: pedido.id,
      usuario_id: "whatsapp-bot",
      usuario_nombre: "Agente WhatsApp",
      resultado: evento === "confirmado" ? "confirmado" : "rechazado",
      notas: "Respuesta del cliente por WhatsApp (boton de plantilla).",
    });

    if (pedido.shopify_order_id) {
      await agregarTagsOrden(pedido.shopify_order_id, [
        evento === "confirmado" ? "confirmado-whatsapp" : "cancelado-whatsapp",
      ]);
      await agregarNotaOrden(
        pedido.shopify_order_id,
        evento === "confirmado"
          ? "Cliente confirmo el pedido por WhatsApp."
          : "Cliente anulo el pedido por WhatsApp.",
      );
    }
  }

  // "Modificar datos" y "hablar con un asesor" necesitan a una persona.
  if (evento === "modificar" || evento === "asesor") {
    enviarPush("todos", {
      titulo:
        evento === "modificar"
          ? "Un cliente quiere modificar sus datos ✏️"
          : "Un cliente pidio hablar con un asesor 💬",
      cuerpo: `${pedido.nombre ?? telefono} — ${pedido.producto_nombre ?? "pedido"}`,
      url: `/dashboard/pedidos/${pedido.id}`,
    }).catch(() => {});
  }
}

export async function POST(request: NextRequest) {
  const secret = process.env.BOTCAKE_WEBHOOK_SECRET;
  if (!secret || request.headers.get("x-webhook-secret") !== secret) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  let payload: PayloadBotcake;
  try {
    payload = (await request.json()) as PayloadBotcake;
  } catch {
    return NextResponse.json({ error: "JSON invalido." }, { status: 400 });
  }

  // Responder ya; procesar despues (Botcake reintenta si tardamos).
  //
  // waitUntil es obligatorio aqui: en serverless, un `void (async () => …)()`
  // suelto se corta en cuanto la funcion devuelve la respuesta, asi que el
  // trabajo nunca llega a correr. waitUntil mantiene viva la invocacion
  // hasta que la promesa termina.
  waitUntil(
    procesar(payload).catch((err) => {
      console.error("[webhook-botcake] fallo al procesar:", err);
    }),
  );

  return NextResponse.json({ recibido: true }, { status: 200 });
}

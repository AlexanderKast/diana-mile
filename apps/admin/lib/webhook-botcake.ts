import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import { responderMensaje } from "@diana-mile/shared/botcake/ia/agente";
import { agregarNotaOrden, agregarTagsOrden } from "@/lib/shopify";
import { enviarPush } from "@/lib/push";

/**
 * Interpretacion y procesamiento de los eventos que manda Botcake.
 *
 * Vive aparte de las rutas porque hay dos entradas con autenticacion
 * distinta: la ruta con token recibe el payload nativo de WhatsApp (que no
 * puede llevar cabeceras), y la ruta base recibe el formato propio con
 * secret por header, para pruebas y flows armados a mano.
 */

type EventoBotcake =
  | "confirmado"
  | "modificar"
  | "anulado"
  | "asesor"
  | "mensaje";

export type PayloadBotcake = {
  telefono?: string;
  psid?: string;
  evento?: EventoBotcake;
  texto?: string;
  nombre?: string;
};

/**
 * Botcake no manda un formato propio: reenvia el payload nativo de la
 * WhatsApp Cloud API de Meta, tal cual. Ademas, su `entry` es un objeto
 * donde Meta usa un array, asi que se aceptan las dos formas.
 */
type MensajeWhatsApp = {
  from?: string;
  type?: string;
  text?: { body?: string };
  button?: { text?: string; payload?: string };
  interactive?: {
    button_reply?: { title?: string };
    list_reply?: { title?: string };
  };
};

type ValorWhatsApp = {
  messages?: MensajeWhatsApp[];
  statuses?: unknown[];
  contacts?: { profile?: { name?: string }; wa_id?: string }[];
  metadata?: { phone_number_id?: string; display_phone_number?: string };
};

export type PayloadWhatsApp = {
  object?: string;
  entry?:
    | { changes?: { field?: string; value?: ValorWhatsApp }[] }
    | { changes?: { field?: string; value?: ValorWhatsApp }[] }[];
};

/** Los botones de las plantillas llegan como texto: se mapean a eventos. */
const EVENTO_POR_BOTON: { patron: RegExp; evento: EventoBotcake }[] = [
  { patron: /confirmar/i, evento: "confirmado" },
  { patron: /modificar/i, evento: "modificar" },
  { patron: /anular|cancelar/i, evento: "anulado" },
  { patron: /asesor|humano/i, evento: "asesor" },
];

/** Extrae lo unico que nos importa del payload de Meta. */
export function interpretarWhatsApp(payload: PayloadWhatsApp): PayloadBotcake | null {
  const entries = Array.isArray(payload.entry)
    ? payload.entry
    : payload.entry
      ? [payload.entry]
      : [];

  for (const entry of entries) {
    for (const cambio of entry.changes ?? []) {
      const valor = cambio.value;
      // Los avisos de entrega y lectura no traen mensaje: se ignoran.
      const mensaje = valor?.messages?.[0];
      if (!mensaje?.from) continue;

      const nombre = valor?.contacts?.[0]?.profile?.name ?? null;

      // Un boton de plantilla puede venir como button o como interactive.
      const textoBoton =
        mensaje.button?.text ??
        mensaje.button?.payload ??
        mensaje.interactive?.button_reply?.title ??
        mensaje.interactive?.list_reply?.title ??
        null;

      if (textoBoton) {
        const regla = EVENTO_POR_BOTON.find((r) => r.patron.test(textoBoton));
        return {
          telefono: mensaje.from,
          nombre: nombre ?? undefined,
          // Un boton que no reconocemos se trata como texto: mejor que la
          // IA lo interprete a que se pierda en silencio.
          evento: regla?.evento ?? "mensaje",
          texto: textoBoton,
        };
      }

      const texto = mensaje.text?.body?.trim();
      if (!texto) continue;

      return {
        telefono: mensaje.from,
        nombre: nombre ?? undefined,
        evento: "mensaje",
        texto,
      };
    }
  }

  return null;
}

/**
 * El webhook global de Botcake (Integraciones → API) no permite configurar
 * headers, asi que no puede mandar un secret. Se valida que el evento
 * venga del numero de WhatsApp de la tienda: es el dato que un tercero no
 * conoce y ata el mensaje a nuestra cuenta.
 */
export function esDeNuestraLinea(payload: PayloadWhatsApp): boolean {
  const esperado = process.env.BOTCAKE_WABA_PAGE_ID?.replace(/^waba_/, "");
  if (!esperado) return false;

  const entries = Array.isArray(payload.entry)
    ? payload.entry
    : payload.entry
      ? [payload.entry]
      : [];

  return entries.some((entry) =>
    entry.changes?.some(
      (c) => c.value?.metadata?.phone_number_id === esperado,
    ),
  );
}

/** 573132947776 o wa_573132947776 → +573132947776 */
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

export async function procesar(payload: PayloadBotcake): Promise<void> {
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

/**
 * Botcake valida la URL antes de dejar guardar el bloque de webhook, y esa
 * comprobacion no manda el header del secret. Un 200 aqui no revela nada ni
 * ejecuta nada: solo confirma que la ruta existe.
 */

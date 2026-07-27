import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import { responderMensaje } from "@diana-mile/shared/botcake/ia/agente";
import {
  agregarNotaOrden,
  agregarTagsOrden,
  cancelarOrdenShopify,
} from "@/lib/shopify";
import { cancelarPedido } from "@diana-mile/shared/botcake/cancelacion";
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
  /** Click id del anuncio de Click-to-WhatsApp, si vino de uno. */
  ctwaClid?: string;
  /** Datos del anuncio que origino la conversacion. */
  origenAnuncio?: Record<string, unknown>;
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
  /**
   * Solo viene en el PRIMER mensaje de quien llego desde un anuncio de
   * Click-to-WhatsApp. El ctwa_clid es lo unico que permite atribuirle la
   * venta a ese anuncio, asi que hay que guardarlo apenas llega.
   */
  referral?: {
    ctwa_clid?: string;
    source_id?: string;
    source_type?: string;
    headline?: string;
    body?: string;
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

      // Atribucion del anuncio: solo llega en el primer mensaje.
      const referral = mensaje.referral;
      const atribucion = referral?.ctwa_clid
        ? {
            ctwaClid: referral.ctwa_clid,
            origenAnuncio: {
              source_id: referral.source_id,
              source_type: referral.source_type,
              headline: referral.headline,
            } as Record<string, unknown>,
          }
        : {};

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
          ...atribucion,
        };
      }

      const texto = mensaje.text?.body?.trim();
      if (!texto) continue;

      return {
        telefono: mensaje.from,
        nombre: nombre ?? undefined,
        evento: "mensaje",
        texto,
        ...atribucion,
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

  // La atribucion del anuncio solo llega en el primer mensaje: se guarda
  // apenas aparece y no se pisa despues, para no perder el anuncio
  // original si la persona vuelve a escribir por otra via.
  if (payload.ctwaClid) {
    await supabase
      .from("whatsapp_conversaciones")
      .update({
        ctwa_clid: payload.ctwaClid,
        origen_anuncio: payload.origenAnuncio ?? null,
      })
      .eq("telefono", telefono)
      .is("ctwa_clid", null);
  }

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

  if (evento === "confirmado") {
    await supabase
      .from("pedidos")
      .update({ estado: "confirmado", updated_at: new Date().toISOString() })
      .eq("id", pedido.id);

    await supabase.from("confirmaciones").insert({
      pedido_id: pedido.id,
      usuario_id: "whatsapp-bot",
      usuario_nombre: "Agente WhatsApp",
      resultado: "confirmado",
      notas: "Respuesta del cliente por WhatsApp (boton de plantilla).",
    });

    if (pedido.shopify_order_id) {
      await agregarTagsOrden(pedido.shopify_order_id, ["confirmado-whatsapp"]);
      await agregarNotaOrden(
        pedido.shopify_order_id,
        "Cliente confirmo el pedido por WhatsApp.",
      );
    }
  }

  if (evento === "anulado") {
    // Pasa por el flujo comun para que quede cancelado tambien en Shopify
    // y el cliente reciba el aviso, igual que si se cancelara desde el
    // panel o desde Shopify.
    await supabase.from("confirmaciones").insert({
      pedido_id: pedido.id,
      usuario_id: "whatsapp-bot",
      usuario_nombre: "Agente WhatsApp",
      resultado: "rechazado",
      notas: "El cliente anulo el pedido por WhatsApp.",
    });

    await cancelarPedido(supabase, pedido.id, {
      origen: "cliente",
      motivo: "el cliente lo anulo desde WhatsApp",
      cancelarEnShopify: async (orderId) => {
        await agregarTagsOrden(orderId, ["cancelado-whatsapp"]);
        await agregarNotaOrden(orderId, "Cliente anulo el pedido por WhatsApp.");
        return cancelarOrdenShopify(orderId);
      },
    });
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

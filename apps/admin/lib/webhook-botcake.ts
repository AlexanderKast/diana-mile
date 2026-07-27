import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import { responderMensaje } from "@diana-mile/shared/botcake/ia/agente";
import {
  agregarNotaOrden,
  agregarTagsOrden,
  cancelarOrdenShopify,
  estadoOrden,
} from "@/lib/shopify";
import { cancelarPedido } from "@diana-mile/shared/botcake/cancelacion";
import { cancelarSeguimiento } from "@diana-mile/shared/botcake/seguimiento";
import { escalarAHumano } from "@diana-mile/shared/botcake/ia/escalamiento";
import { enviarTexto } from "@diana-mile/shared/botcake/client";
import {
  responderAnulado,
  responderAsesor,
  responderConfirmacion,
  responderModificar,
} from "@diana-mile/shared/botcake/respuestas-boton";
import { emparejarClic } from "@diana-mile/shared/whatsapp/clics";
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
  /** Ubicacion compartida, para la entrega. */
  ubicacion?: { lat: number; lng: number; direccion?: string };
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
  /** Ubicacion que comparte para que el mensajero la encuentre. */
  location?: {
    latitude?: number;
    longitude?: number;
    name?: string;
    address?: string;
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

      // Ubicacion compartida: es lo que le pedimos tras confirmar para que
      // el mensajero no ande dando vueltas.
      const loc = mensaje.location;
      if (typeof loc?.latitude === "number" && typeof loc?.longitude === "number") {
        return {
          telefono: mensaje.from,
          nombre: nombre ?? undefined,
          evento: "mensaje",
          texto: "(compartio su ubicacion)",
          ubicacion: {
            lat: loc.latitude,
            lng: loc.longitude,
            direccion: loc.address ?? loc.name,
          },
          ...atribucion,
        };
      }

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
    .select("id, estado, shopify_order_id, nombre, producto_nombre, precio_total, ciudad")
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

  // Ubicacion compartida: se guarda en el pedido y se le agradece. No pasa
  // por la IA porque no hay nada que interpretar.
  if (payload.ubicacion) {
    if (pedido) {
      await supabase
        .from("pedidos")
        .update({
          latitud: payload.ubicacion.lat,
          longitud: payload.ubicacion.lng,
          updated_at: new Date().toISOString(),
        })
        .eq("id", pedido.id);

      if (pedido.shopify_order_id) {
        await agregarNotaOrden(
          pedido.shopify_order_id,
          `Ubicacion compartida por el cliente: https://maps.google.com/?q=${payload.ubicacion.lat},${payload.ubicacion.lng}`,
        );
      }
    }

    await enviarTexto(
      telefono,
      "¡Perfecto, gracias! Con eso el mensajero llega directo 💚",
    );
    return;
  }

  /**
   * Conecta a quien escribio con el clic que dio en la web.
   *
   * Los anuncios de Click-to-WhatsApp ya vienen con ctwa_clid y mandan:
   * si esta, no se toca nada. Esto cubre al resto —organico, el link de la
   * bio, un anuncio que lleva a la tienda y de ahi a WhatsApp—, que hasta
   * ahora cerraba ventas sin que nadie supiera de donde habian salido.
   */
  async function atribuirClicWeb(
    db: typeof supabase,
    tel: string,
    texto: string,
  ): Promise<void> {
    try {
      const { data: conv } = await db
        .from("whatsapp_conversaciones")
        .select("id, ctwa_clid, origen_anuncio")
        .eq("telefono", tel)
        .maybeSingle();

      if (!conv || conv.ctwa_clid) return;

      const clic = await emparejarClic(db, {
        mensaje: texto,
        conversacionId: conv.id,
      });
      if (!clic) return;

      await db
        .from("whatsapp_conversaciones")
        .update({
          origen_anuncio: {
            canal: "web",
            origen: clic.origen,
            ruta: clic.ruta,
            titulo: clic.titulo,
            fbp: clic.fbp,
            fbc: clic.fbc,
            utm_source: clic.utmSource,
            utm_medium: clic.utmMedium,
            utm_campaign: clic.utmCampaign,
            utm_content: clic.utmContent,
            utm_term: clic.utmTerm,
          },
        })
        .eq("id", conv.id);

      console.log(
        `[webhook-botcake] lead atribuido a ${clic.origen ?? "web"}${clic.ruta ?? ""}`,
      );
    } catch (err) {
      // La atribucion es un extra: si falla, la conversacion sigue igual.
      console.warn("[webhook-botcake] no se pudo atribuir el clic:", err);
    }
  }

  // Un mensaje libre lo atiende el agente de IA.
  if (evento === "mensaje") {
    if (!payload.texto?.trim()) return;

    // "Detener promociones" es un boton de las plantillas de marketing y
    // Meta exige respetarlo: se corta todo el marketing para esa persona,
    // aunque la conversacion normal sigue.
    if (/detener promociones|no me escriban|no quiero recibir|dar de baja|baja de la lista/i.test(payload.texto)) {
      await supabase
        .from("whatsapp_conversaciones")
        .update({ promociones_activas: false })
        .eq("telefono", telefono);
      await cancelarSeguimiento(supabase, { telefonoE164: telefono });
      await enviarTexto(
        telefono,
        "Listo, no te vuelvo a escribir promociones 💚 Si en algun momento necesitas algo, aqui estoy.",
      );
      return;
    }
    const resultado = await responderMensaje(supabase, {
      telefonoE164: telefono,
      texto: payload.texto.trim(),
      nombre: payload.nombre ?? pedido?.nombre ?? null,
      // El agente puede cancelar por si mismo, pero solo si el pedido
      // todavia no salio de bodega: si ya va en camino decide una persona.
      cancelarPedido: async (pedidoId, motivo) => {
        const { data: p } = await supabase
          .from("pedidos")
          .select("shopify_order_id")
          .eq("id", pedidoId)
          .maybeSingle();

        if (p?.shopify_order_id) {
          const estado = await estadoOrden(p.shopify_order_id);
          if (!estado?.sePuedeCancelar) {
            return {
              cancelado: false,
              motivo: `ya esta en "${estado?.fulfillmentStatus ?? "estado desconocido"}"`,
            };
          }
        }

        const res = await cancelarPedido(supabase, pedidoId, {
          origen: "cliente",
          motivo,
          cancelarEnShopify: async (orderId) => {
            await agregarTagsOrden(orderId, ["cancelado-whatsapp"]);
            await agregarNotaOrden(
              orderId,
              `Cliente cancelo por WhatsApp: ${motivo}`,
            );
            return cancelarOrdenShopify(orderId);
          },
        });

        if (res.cancelado) {
          await cancelarSeguimiento(supabase, { pedidoId });
        }
        return { cancelado: res.cancelado, motivo: res.motivo };
      },
    });

    // De donde salio: si el texto coincide con un clic reciente al boton
    // de WhatsApp de la web, se recupera la pagina y los cookies del pixel.
    // Va despues de responder porque la atribucion no puede hacerle
    // esperar ni un segundo a quien escribio.
    await atribuirClicWeb(supabase, telefono, payload.texto.trim());

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

    // Confirmar y quedarse mudo es lo peor: es el momento en que mas
    // necesita saber que todo va bien.
    await responderConfirmacion(supabase, {
      pedidoId: pedido.id,
      telefonoE164: telefono,
      nombre: pedido.nombre,
      producto: pedido.producto_nombre ?? "pedido",
      precioTotal: Number(pedido.precio_total ?? 0),
      ciudad: pedido.ciudad,
    });
  }

  if (evento === "modificar") {
    await responderModificar({
      pedidoId: pedido.id,
      telefonoE164: telefono,
      nombre: pedido.nombre,
      producto: pedido.producto_nombre ?? "pedido",
      precioTotal: Number(pedido.precio_total ?? 0),
    });
  }

  if (evento === "asesor") {
    await responderAsesor({
      pedidoId: pedido.id,
      telefonoE164: telefono,
      nombre: pedido.nombre,
      producto: pedido.producto_nombre ?? "pedido",
      precioTotal: Number(pedido.precio_total ?? 0),
    });
  }

  const datosBoton = {
    pedidoId: pedido.id,
    telefonoE164: telefono,
    nombre: pedido.nombre,
    producto: pedido.producto_nombre ?? "pedido",
    precioTotal: Number(pedido.precio_total ?? 0),
  };

  if (evento === "anulado") {
    // Solo se cancela sola si el pedido todavia no salio de bodega. Si ya
    // se preparo o se despacho, cancelarlo dejaria el paquete viajando con
    // la transportadora: eso lo decide una persona.
    const estado = pedido.shopify_order_id
      ? await estadoOrden(pedido.shopify_order_id)
      : null;

    const seguro = !pedido.shopify_order_id || estado?.sePuedeCancelar;

    await supabase.from("confirmaciones").insert({
      pedido_id: pedido.id,
      usuario_id: "whatsapp-bot",
      usuario_nombre: "Agente WhatsApp",
      resultado: "rechazado",
      notas: seguro
        ? "El cliente anulo el pedido por WhatsApp (sin preparar)."
        : `El cliente pidio anular pero el pedido ya esta en "${estado?.fulfillmentStatus ?? "estado desconocido"}": requiere validacion.`,
    });

    if (seguro) {
      await cancelarPedido(supabase, pedido.id, {
        origen: "cliente",
        motivo: "el cliente lo anulo desde WhatsApp",
        cancelarEnShopify: async (orderId) => {
          await agregarTagsOrden(orderId, ["cancelado-whatsapp"]);
          await agregarNotaOrden(
            orderId,
            "Cliente anulo el pedido por WhatsApp.",
          );
          return cancelarOrdenShopify(orderId);
        },
      });
      await cancelarSeguimiento(supabase, { pedidoId: pedido.id });
      await responderAnulado(datosBoton, true);
    } else {
      // El pedido ya avanzo: se frena la IA en ese chat y decide Diana.
      await escalarAHumano(
        supabase,
        {
          telefonoE164: telefono,
          nombre: pedido.nombre ?? null,
          pregunta: `Pidio anular el pedido ${pedido.shopify_order_id}, que ya esta en estado "${estado?.fulfillmentStatus ?? "desconocido"}"`,
          motivo: "reclamo",
        },
        "cancelacion de un pedido que ya salio de bodega",
      );
      await responderAnulado(datosBoton, false);
      enviarPush("todos", {
        titulo: "Piden cancelar un pedido ya despachado ⚠️",
        cuerpo: `${pedido.nombre ?? telefono} — ${pedido.producto_nombre ?? "pedido"}`,
        url: `/dashboard/pedidos/${pedido.id}`,
      }).catch(() => {});
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

import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import { cancelarPorShopifyOrderId } from "@diana-mile/shared/botcake/cancelacion";
import { encolarAvisoPedidoNuevo } from "@diana-mile/shared/botcake/agentes";
import {
  costoUnitarioDeVariante,
  gidDeVariante,
} from "@diana-mile/shared/finanzas/costo-pedido";

const WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET;

function verificarHmac(body: string, hmacHeader: string | null): boolean {
  if (!WEBHOOK_SECRET || !hmacHeader) return false;
  const digest = crypto.createHmac("sha256", WEBHOOK_SECRET).update(body, "utf8").digest("base64");
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader));
  } catch {
    return false;
  }
}

type ShopifyAddress = {
  address1?: string;
  first_name?: string | null;
  last_name?: string | null;
  address2?: string;
  city?: string;
  province?: string;
  phone?: string;
  name?: string;
};

type ShopifyOrder = {
  id: number;
  order_number: number;
  note_attributes?: { name: string; value: string }[];
  financial_status?: string;
  fulfillment_status?: string | null;
  cancelled_at?: string | null;
  cancel_reason?: string | null;
  total_price?: string;
  phone?: string;
  customer?: { first_name?: string; last_name?: string; phone?: string };
  shipping_address?: ShopifyAddress;
  billing_address?: ShopifyAddress;
  line_items?: { title: string; quantity: number; variant_id?: number | null; sku?: string | null }[];
};

async function procesarOrdenCreada(order: ShopifyOrder) {
  const supabase = createAdminSupabaseClient();
  const orderId = String(order.id);

  const { data: existente } = await supabase
    .from("pedidos")
    .select("id")
    .eq("shopify_order_id", orderId)
    .maybeSingle();

  const noteAttrs = new Map((order.note_attributes ?? []).map((a) => [a.name, a.value]));
  const address = order.shipping_address;

  /**
   * Shopify manda los campos que no tienen valor como cadena vacia, no como
   * null, y "" no dispara el ?? — asi que el primer hueco cortaba la
   * cadena de alternativas y el pedido entraba como "Sin nombre" aunque el
   * dato estuviera un campo mas abajo.
   */
  const primero = (...valores: (string | null | undefined)[]) =>
    valores.map((v) => v?.trim()).find((v) => v) ?? "";

  const nombre = primero(
    address?.name,
    [address?.first_name, address?.last_name].filter(Boolean).join(" "),
    [order.customer?.first_name, order.customer?.last_name]
      .filter(Boolean)
      .join(" "),
    order.billing_address?.name,
  );
  const lineItem = order.line_items?.[0];
  const telefono =
    primero(address?.phone, order.customer?.phone, order.phone) || "";
  const total = order.total_price ? parseFloat(order.total_price) : null;

  // El alta se salta si el pedido ya estaba (lo creo el checkout), pero el
  // aviso se manda igual: este webhook es el unico punto por el que pasan
  // TODAS las ordenes, vengan del checkout, del agente o de Shopify a mano.
  let pedidoId = existente?.id as string | undefined;

  if (!existente) {
    // El webhook REST manda el id de variante como numero; el resto del
    // sistema usa el gid de GraphQL. Sin normalizar, la busqueda no
    // encuentra nada y todo pedido que entra por Shopify queda sin costo.
    const costoProducto = await costoUnitarioDeVariante(
      gidDeVariante(lineItem?.variant_id),
    );

    const { data: creado } = await supabase
      .from("pedidos")
      .insert({
        shopify_order_id: orderId,
        shopify_order_number: `#${order.order_number}`,
        nombre: nombre || "Sin nombre",
        telefono,
        direccion: address?.address1 ?? "",
        barrio: address?.address2 ?? null,
        ciudad: address?.city ?? "",
        departamento: address?.province ?? null,
        producto_nombre: lineItem?.title ?? "Producto Shopify",
        producto_sku: lineItem?.sku ?? null,
        // Sin esto no hay forma de recalcular el costo despues si el
        // producto se costea mas tarde.
        variant_id: gidDeVariante(lineItem?.variant_id),
        cantidad: lineItem?.quantity ?? 1,
        precio_total: total,
        costo_producto: costoProducto,
        utm_source: noteAttrs.get("utm_source") ?? null,
        utm_campaign: noteAttrs.get("utm_campaign") ?? null,
        estado: "pendiente",
      })
      .select("id")
      .single();
    pedidoId = creado?.id;
  }

  // En contraentrega los primeros minutos deciden la venta: cuanto antes se
  // llame a confirmar, menos se cae el pedido.
  await encolarAvisoPedidoNuevo(supabase, {
    pedidoId,
    numeroOrden: `#${order.order_number}`,
    cliente: nombre || "Sin nombre",
    telefonoCliente: telefono || "sin telefono",
    ciudad: address?.city ?? "sin ciudad",
    producto: lineItem?.title ?? "Producto",
    precioTotal: total ?? 0,
  });
}

/**
 * La orden se cancelo en Shopify: se refleja en Supabase y se le avisa al
 * cliente por WhatsApp. Es idempotente, y hace falta que lo sea porque
 * Shopify emite orders/cancelled y ademas un orders/updated por lo mismo.
 */
async function procesarOrdenCancelada(order: ShopifyOrder) {
  const supabase = createAdminSupabaseClient();
  const resultado = await cancelarPorShopifyOrderId(
    supabase,
    String(order.id),
    order.cancel_reason ?? undefined,
  );

  if (resultado.cancelado && !resultado.yaEstaba) {
    console.warn(
      `[webhook-shopify] pedido cancelado desde Shopify (orden ${order.id}), aviso encolado: ${resultado.avisoEncolado}`,
    );
  }
}

async function procesarOrdenActualizada(order: ShopifyOrder) {
  // Una cancelacion tambien llega como orders/updated: se atiende por el
  // mismo camino para que no dependa de que topic llegue primero.
  if (order.cancelled_at) {
    await procesarOrdenCancelada(order);
    return;
  }

  const supabase = createAdminSupabaseClient();
  const orderId = String(order.id);

  const { data: pedido } = await supabase
    .from("pedidos")
    .select("id, estado")
    .eq("shopify_order_id", orderId)
    .maybeSingle();

  if (!pedido) return;

  let nuevoEstado: string | null = null;
  if (order.financial_status === "paid" && pedido.estado === "pendiente") {
    nuevoEstado = "confirmado";
  }
  if (order.fulfillment_status === "fulfilled" && ["pendiente", "confirmado", "en_preparacion"].includes(pedido.estado)) {
    nuevoEstado = "enviado";
  }

  if (nuevoEstado) {
    await supabase.from("pedidos").update({ estado: nuevoEstado, updated_at: new Date().toISOString() }).eq("id", pedido.id);
  }
}

async function procesarFulfillmentCreado(payload: {
  order_id: number;
  tracking_number?: string;
  tracking_company?: string;
}) {
  const supabase = createAdminSupabaseClient();
  const orderId = String(payload.order_id);

  const { data: pedido } = await supabase
    .from("pedidos")
    .select("id, estado, numero_guia")
    .eq("shopify_order_id", orderId)
    .maybeSingle();

  if (!pedido || pedido.numero_guia) return;

  await supabase
    .from("pedidos")
    .update({
      numero_guia: payload.tracking_number ?? null,
      transportadora: payload.tracking_company ?? null,
      fecha_envio: new Date().toISOString().slice(0, 10),
      estado: "enviado",
      updated_at: new Date().toISOString(),
    })
    .eq("id", pedido.id);
}

export async function POST(request: NextRequest) {
  const bodyText = await request.text();
  const hmacHeader = request.headers.get("X-Shopify-Hmac-SHA256");

  if (!verificarHmac(bodyText, hmacHeader)) {
    return NextResponse.json({ error: "Firma HMAC invalida." }, { status: 401 });
  }

  const topic = request.headers.get("X-Shopify-Topic") ?? "";
  const payload = JSON.parse(bodyText);

  // Shopify reintenta si no responde 200 rapido — el procesamiento real no
  // debe bloquear la respuesta ni tumbar el webhook si algo falla.
  //
  // waitUntil es obligatorio: sin el, la promesa suelta se corta en cuanto
  // la funcion serverless devuelve la respuesta y el pedido nunca se
  // guarda (Shopify recibe su 200 y no reintenta, asi que se pierde).
  waitUntil(
    (async () => {
      try {
        if (topic === "orders/create") {
          await procesarOrdenCreada(payload);
        } else if (topic === "orders/cancelled") {
          await procesarOrdenCancelada(payload);
        } else if (topic === "orders/updated") {
          await procesarOrdenActualizada(payload);
        } else if (topic === "fulfillments/create") {
          await procesarFulfillmentCreado(payload);
        }
      } catch (error) {
        console.error(`Error procesando webhook Shopify (${topic}):`, error);
      }
    })(),
  );

  return NextResponse.json({ ok: true }, { status: 200 });
}

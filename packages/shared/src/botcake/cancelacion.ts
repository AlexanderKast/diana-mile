import type { SupabaseClient } from "@supabase/supabase-js";
import { encolarPedidoCancelado } from "./agentes";

/**
 * Cancelacion de un pedido, sincronizada en todo el ecosistema.
 *
 * Un pedido se puede cancelar desde tres lados —Shopify, el panel de
 * admin, o el boton "anular" que el cliente pulsa en WhatsApp— y en los
 * tres casos tiene que quedar igual en todas partes y con el cliente
 * avisado. Antes cada camino hacia lo suyo y los estados se separaban.
 *
 * La funcion es idempotente: si el pedido ya estaba cancelado no vuelve a
 * escribir ni a mandar un segundo aviso. Eso importa porque Shopify emite
 * varios webhooks por la misma cancelacion.
 */

export type OrigenCancelacion = "shopify" | "admin" | "cliente";

export type ResultadoCancelacion = {
  cancelado: boolean;
  yaEstaba: boolean;
  avisoEncolado: boolean;
  motivo?: string;
};

export type OpcionesCancelacion = {
  /** De donde vino la orden de cancelar. */
  origen: OrigenCancelacion;
  /** Nota que queda en el pedido. */
  motivo?: string;
  /**
   * Cancela tambien en Shopify. Se omite cuando la cancelacion YA viene de
   * Shopify, para no llamar de vuelta a la misma API.
   */
  cancelarEnShopify?: (shopifyOrderId: string) => Promise<boolean>;
};

export async function cancelarPedido(
  supabase: SupabaseClient,
  pedidoId: string,
  opciones: OpcionesCancelacion,
): Promise<ResultadoCancelacion> {
  const { data: pedido } = await supabase
    .from("pedidos")
    .select(
      "id, estado, nombre, telefono, producto_nombre, shopify_order_id, notas",
    )
    .eq("id", pedidoId)
    .maybeSingle();

  if (!pedido) {
    return {
      cancelado: false,
      yaEstaba: false,
      avisoEncolado: false,
      motivo: "pedido no encontrado",
    };
  }

  // Ya estaba cancelado: no se reescribe ni se avisa dos veces.
  if (pedido.estado === "cancelado") {
    return { cancelado: true, yaEstaba: true, avisoEncolado: false };
  }

  const nota = opciones.motivo
    ? `Cancelado (${opciones.origen}): ${opciones.motivo}`
    : `Cancelado desde ${opciones.origen}`;

  const { error } = await supabase
    .from("pedidos")
    .update({
      estado: "cancelado",
      notas: pedido.notas ? `${pedido.notas} · ${nota}` : nota,
      updated_at: new Date().toISOString(),
    })
    .eq("id", pedidoId);

  if (error) {
    return {
      cancelado: false,
      yaEstaba: false,
      avisoEncolado: false,
      motivo: error.message,
    };
  }

  // Shopify solo si la cancelacion no vino de ahi.
  if (opciones.cancelarEnShopify && pedido.shopify_order_id) {
    try {
      await opciones.cancelarEnShopify(pedido.shopify_order_id);
    } catch (err) {
      // El pedido ya quedo cancelado de este lado: se registra y sigue,
      // porque dejar al cliente sin aviso seria peor.
      console.error("[cancelacion] no se pudo cancelar en Shopify:", err);
    }
  }

  let avisoEncolado = false;
  if (pedido.telefono) {
    try {
      await encolarPedidoCancelado(supabase, {
        pedidoId: pedido.id,
        nombre: pedido.nombre?.split(/\s+/)[0] ?? "Hola",
        telefonoE164: pedido.telefono,
        numeroPedido: pedido.shopify_order_id ?? pedido.id.slice(0, 8),
        producto: pedido.producto_nombre ?? "tu pedido",
      });
      avisoEncolado = true;
    } catch (err) {
      console.error("[cancelacion] no se pudo encolar el aviso:", err);
    }
  }

  return { cancelado: true, yaEstaba: false, avisoEncolado };
}

/** Busca el pedido por su id de Shopify y lo cancela. */
export async function cancelarPorShopifyOrderId(
  supabase: SupabaseClient,
  shopifyOrderId: string,
  motivo?: string,
): Promise<ResultadoCancelacion> {
  const { data } = await supabase
    .from("pedidos")
    .select("id")
    .eq("shopify_order_id", shopifyOrderId)
    .maybeSingle();

  if (!data) {
    return {
      cancelado: false,
      yaEstaba: false,
      avisoEncolado: false,
      motivo: "sin pedido para esa orden",
    };
  }

  return cancelarPedido(supabase, data.id, { origen: "shopify", motivo });
}

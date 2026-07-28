import { NextRequest, NextResponse } from "next/server";
import {
  completeDraftOrder,
  deleteDraftOrder,
  getProductByHandle,
} from "@/lib/shopify";
import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import { encolarConfirmacionPedido } from "@diana-mile/shared/botcake/agentes";
import { normalizeColombianMobile } from "@/lib/phone";
import { getPricingConfig } from "@/lib/pricing-server";
import { costoUnitarioDeVariante } from "@diana-mile/shared/finanzas/costo-pedido";
import { signTelefonoToken } from "@/lib/push-token";
import { sendMetaCapiEvent } from "@/lib/tracking/meta-capi";
import { sendTikTokEvent } from "@/lib/tracking/tiktok-events";

/**
 * Paso "Confirmar pedido": convierte el draft order (creado/actualizado en
 * /api/orders/draft) en una orden real de Shopify. Requiere draftOrderId —
 * el pedido no puede confirmarse sin haber pasado antes por "Realizar
 * pedido".
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      draftOrderId,
      nombre,
      telefono,
      departamento,
      ciudad,
      barrio,
      direccion,
      notas,
      ubicacion,
      variantId,
      slug,
      descuentoAplicado,
      envioPrioritario,
      canal,
    } = body ?? {};

    if (!draftOrderId || !nombre || !telefono || !variantId || !slug) {
      return NextResponse.json(
        { mensaje: "Faltan datos para confirmar el pedido." },
        { status: 400 },
      );
    }

    const telefonoNormalizado = normalizeColombianMobile(String(telefono));
    if (!telefonoNormalizado) {
      return NextResponse.json(
        { mensaje: "Ingresa un celular colombiano valido de 10 digitos." },
        { status: 400 },
      );
    }

    const product = await getProductByHandle(slug);
    const variant = product?.variants.find((v) => v.id === variantId);

    if (!product || !variant) {
      return NextResponse.json(
        { mensaje: "El producto o la variante seleccionada ya no existe." },
        { status: 400 },
      );
    }

    // Se repite la barrera de /api/orders/draft a proposito: confirmar es el
    // paso que crea la orden real, y un draft pudo haberse creado antes de
    // que el producto pasara a vitrina.
    if (!product.codDisponible) {
      return NextResponse.json(
        {
          mensaje:
            "Este producto se gestiona de forma personalizada y no esta disponible para contraentrega. Escribele a Milito por WhatsApp para coordinarlo.",
        },
        { status: 400 },
      );
    }

    // Mismo tope que /api/orders/draft. Se repite porque confirmar es el
    // paso que crea la orden real: el draft pudo crearse antes de que se
    // bajara el tope, o con otra variante.
    const topeConfig = await getPricingConfig();
    const valorLinea = parseFloat(variant.price);
    if (Number.isFinite(valorLinea) && valorLinea > topeConfig.codTopePedido) {
      return NextResponse.json(
        {
          mensaje:
            "Esta presentacion supera el monto que manejamos contraentrega. Escribele a Milito por WhatsApp y lo coordinan directamente.",
        },
        { status: 400 },
      );
    }

    const { orderId, orderNumber } = await completeDraftOrder(draftOrderId);

    let precioTotal: number | undefined;

    try {
      const supabase = createAdminSupabaseClient();
      const nombreProducto = `${product.title} — ${variant.title}`;

      const lat =
        ubicacion &&
        typeof ubicacion.lat === "number" &&
        Number.isFinite(ubicacion.lat)
          ? ubicacion.lat
          : null;
      const lng =
        ubicacion &&
        typeof ubicacion.lng === "number" &&
        Number.isFinite(ubicacion.lng)
          ? ubicacion.lng
          : null;

      const pricing = await getPricingConfig();
      const precioBase = parseFloat(variant.price);
      const precioConDescuento = descuentoAplicado
        ? precioBase * (1 - pricing.discountPercent / 100)
        : precioBase;
      precioTotal =
        precioConDescuento +
        (envioPrioritario ? parseFloat(pricing.envioPrioritarioPrecio) : 0);

      // El costo que rige HOY, congelado en el pedido. Si se consultara
      // despues, la utilidad de un mes ya cerrado cambiaria sola cada vez
      // que Nu Skin actualiza su lista de precios.
      const costoProducto = await costoUnitarioDeVariante(variantId);

      const { data: pedidoInsertado, error: insertError } = await supabase
        .from("pedidos")
        .insert({
          shopify_order_id: orderId,
          // El numero visible ("#1020") es el unico que la clienta conoce y
          // el que le dice el agente al cerrar. Si no se guarda aqui, cuando
          // ella escribe "que paso con mi #1020" no hay con que relacionarlo
          // y el agente termina escalando algo que sabe de sobra.
          shopify_order_number: orderNumber,
          nombre,
          telefono: telefonoNormalizado.e164,
          direccion,
          barrio,
          ciudad,
          departamento,
          latitud: lat,
          longitud: lng,
          producto_nombre: nombreProducto,
          producto_sku: slug,
          variant_id: variantId,
          cantidad: 1,
          precio_total: precioTotal,
          costo_producto: costoProducto,
          estado: "pendiente",
          // De donde salio la venta. Lo manda el agente cuando cierra por
          // chat; el formulario de la web no manda nada y cuenta como web.
          canal_venta: canal === "whatsapp" ? "whatsapp" : "web",
          notas: notas || null,
        })
        .select("id")
        .single();

      if (insertError) {
        console.error(
          "Error al guardar el pedido en Supabase:",
          insertError.message,
        );
      }

      const eventId = `order-${orderNumber}`;
      const eventSourceUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/productos/${slug}`;
      await Promise.allSettled([
        sendMetaCapiEvent({
          eventName: "Purchase",
          eventId,
          eventSourceUrl,
          telefonoE164: telefonoNormalizado.e164,
          value: precioTotal,
          fbp: request.cookies.get("_fbp")?.value,
          fbc: request.cookies.get("_fbc")?.value,
        }),
        sendTikTokEvent({
          eventName: "CompletePayment",
          eventId,
          eventSourceUrl,
          telefonoE164: telefonoNormalizado.e164,
          value: precioTotal,
          ttp: request.cookies.get("_ttp")?.value,
        }),
        encolarConfirmacionPedido(supabase, {
          pedidoId: pedidoInsertado?.id ?? null,
          nombre,
          telefonoE164: telefonoNormalizado.e164,
          telefonoDisplay: telefonoNormalizado.display,
          direccion: [direccion, barrio, ciudad].filter(Boolean).join(", "),
          producto: nombreProducto,
          precioTotal: precioTotal ?? parseFloat(variant.price),
        }),
      ]);

      // El pedido se completo: si habia quedado un carrito abandonado con
      // este telefono, ya no aplica para remarketing — se marca convertido
      // y se borra el draft order de Shopify (la orden real ya existe).
      const { data: carritoAbandonado } = await supabase
        .from("leads")
        .select("id, shopify_draft_order_id")
        .eq("telefono", telefonoNormalizado.e164)
        .eq("fuente", "checkout_abandonado")
        .eq("convertido", false)
        .maybeSingle();

      if (carritoAbandonado) {
        await supabase
          .from("leads")
          .update({ convertido: true })
          .eq("id", carritoAbandonado.id);

        if (carritoAbandonado.shopify_draft_order_id) {
          await deleteDraftOrder(carritoAbandonado.shopify_draft_order_id);
        }
      }
    } catch (syncError) {
      console.error("Error al sincronizar el pedido con Supabase:", syncError);
    }

    return NextResponse.json({
      orderNumber,
      telefono: telefonoNormalizado.display,
      telefonoToken: signTelefonoToken(telefonoNormalizado.e164),
      total: precioTotal ?? parseFloat(variant.price),
    });
  } catch (error) {
    console.error("Error al confirmar el pedido:", error);
    return NextResponse.json(
      { mensaje: "No pudimos confirmar tu pedido. Intenta de nuevo." },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { completeDraftOrder, deleteDraftOrder, getProductByHandle } from "@/lib/shopify";
import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import { normalizeColombianMobile } from "@/lib/phone";
import { DISCOUNT_PERCENT, ENVIO_PRIORITARIO_PRECIO } from "@/lib/pricing";

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
    } = body ?? {};

    if (!draftOrderId || !nombre || !telefono || !variantId || !slug) {
      return NextResponse.json(
        { mensaje: "Faltan datos para confirmar el pedido." },
        { status: 400 }
      );
    }

    const telefonoNormalizado = normalizeColombianMobile(String(telefono));
    if (!telefonoNormalizado) {
      return NextResponse.json(
        { mensaje: "Ingresa un celular colombiano valido de 10 digitos." },
        { status: 400 }
      );
    }

    const product = await getProductByHandle(slug);
    const variant = product?.variants.find((v) => v.id === variantId);

    if (!product || !variant) {
      return NextResponse.json(
        { mensaje: "El producto o la variante seleccionada ya no existe." },
        { status: 400 }
      );
    }

    const { orderId, orderNumber } = await completeDraftOrder(draftOrderId);

    try {
      const supabase = createAdminSupabaseClient();
      const nombreProducto = `${product.title} — ${variant.title}`;

      const lat =
        ubicacion && typeof ubicacion.lat === "number" && Number.isFinite(ubicacion.lat)
          ? ubicacion.lat
          : null;
      const lng =
        ubicacion && typeof ubicacion.lng === "number" && Number.isFinite(ubicacion.lng)
          ? ubicacion.lng
          : null;

      const precioBase = parseFloat(variant.price);
      const precioConDescuento = descuentoAplicado
        ? precioBase * (1 - DISCOUNT_PERCENT / 100)
        : precioBase;
      const precioTotal = precioConDescuento + (envioPrioritario ? parseFloat(ENVIO_PRIORITARIO_PRECIO) : 0);

      const { error: insertError } = await supabase.from("pedidos").insert({
        shopify_order_id: orderId,
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
        estado: "pendiente",
        notas: notas || null,
      });

      if (insertError) {
        console.error("Error al guardar el pedido en Supabase:", insertError.message);
      }

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
        await supabase.from("leads").update({ convertido: true }).eq("id", carritoAbandonado.id);

        if (carritoAbandonado.shopify_draft_order_id) {
          await deleteDraftOrder(carritoAbandonado.shopify_draft_order_id);
        }
      }
    } catch (syncError) {
      console.error("Error al sincronizar el pedido con Supabase:", syncError);
    }

    return NextResponse.json({ orderNumber, telefono: telefonoNormalizado.display });
  } catch (error) {
    console.error("Error al confirmar el pedido:", error);
    return NextResponse.json(
      { mensaje: "No pudimos confirmar tu pedido. Intenta de nuevo." },
      { status: 500 }
    );
  }
}

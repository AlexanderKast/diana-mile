import { NextRequest, NextResponse } from "next/server";
import { createShopifyOrder } from "@/lib/shopify";
import { createAdminSupabaseClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      nombre,
      telefono,
      ciudad,
      direccion,
      notas,
      variantId,
      variantTitle,
      precio,
      productoNombre,
      slug,
    } = body ?? {};

    if (!nombre || !telefono || !ciudad || !direccion || !variantId || !precio) {
      return NextResponse.json(
        { mensaje: "Faltan campos requeridos para procesar el pedido." },
        { status: 400 }
      );
    }

    const { orderId, orderNumber } = await createShopifyOrder({
      variantId,
      quantity: 1,
      nombre,
      telefono,
      direccion,
      ciudad,
    });

    try {
      const supabase = createAdminSupabaseClient();
      const nombreProducto = variantTitle ? `${productoNombre} — ${variantTitle}` : productoNombre;

      const { error: insertError } = await supabase.from("pedidos").insert({
        shopify_order_id: orderId,
        nombre,
        telefono,
        direccion,
        ciudad,
        producto_nombre: nombreProducto,
        producto_sku: slug ?? null,
        variant_id: variantId,
        cantidad: 1,
        precio_total: parseFloat(precio),
        estado: "pendiente",
        notas: notas || null,
      });

      if (insertError) {
        console.error("Error al guardar el pedido en Supabase:", insertError.message);
      }
    } catch (syncError) {
      console.error("Error al sincronizar el pedido con Supabase:", syncError);
    }

    return NextResponse.json({ orderNumber, telefono });
  } catch (error) {
    console.error("Error al procesar el pedido:", error);
    return NextResponse.json(
      { mensaje: "No pudimos procesar tu pedido. Intenta de nuevo." },
      { status: 500 }
    );
  }
}

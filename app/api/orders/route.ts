import { NextRequest, NextResponse } from "next/server";
import { createShopifyOrder, getProductByHandle } from "@/lib/shopify";
import { createAdminSupabaseClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, telefono, ciudad, direccion, notas, productSlug, variantId, cantidad } = body ?? {};

    if (!nombre || !telefono || !ciudad || !direccion || !productSlug || !variantId) {
      return NextResponse.json(
        { mensaje: "Faltan campos requeridos para procesar el pedido." },
        { status: 400 }
      );
    }

    const cantidadFinal = Number(cantidad) > 0 ? Number(cantidad) : 1;

    const { orderId, orderNumber } = await createShopifyOrder({
      variantId,
      quantity: cantidadFinal,
      nombre,
      telefono,
      direccion,
      ciudad,
    });

    try {
      const product = await getProductByHandle(productSlug);

      if (product) {
        const supabase = createAdminSupabaseClient();
        const { error: insertError } = await supabase.from("pedidos").insert({
          shopify_order_id: orderId,
          nombre,
          telefono,
          direccion,
          ciudad,
          producto_nombre: product.title,
          producto_sku: product.id,
          variant_id: variantId,
          cantidad: cantidadFinal,
          precio_total: parseFloat(product.price) * cantidadFinal,
          estado: "pendiente",
          notas: notas || null,
        });

        if (insertError) {
          console.error("Error al guardar el pedido en Supabase:", insertError.message);
        }
      } else {
        console.error(`No se encontro el producto con slug "${productSlug}" para sincronizar el pedido.`);
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

import { NextRequest, NextResponse } from "next/server";
import { createShopifyOrder, getProductByHandle } from "@/lib/shopify";
import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { normalizeColombianMobile } from "@/lib/phone";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      nombre,
      telefono,
      email,
      departamento,
      ciudad,
      barrio,
      direccion,
      notas,
      ubicacion,
      variantId,
      slug,
    } = body ?? {};

    if (
      !nombre ||
      !telefono ||
      !departamento ||
      !ciudad ||
      !barrio ||
      !direccion ||
      !variantId ||
      !slug
    ) {
      return NextResponse.json(
        { mensaje: "Faltan campos requeridos para procesar el pedido." },
        { status: 400 }
      );
    }

    const lat =
      ubicacion && typeof ubicacion.lat === "number" && Number.isFinite(ubicacion.lat)
        ? ubicacion.lat
        : null;
    const lng =
      ubicacion && typeof ubicacion.lng === "number" && Number.isFinite(ubicacion.lng)
        ? ubicacion.lng
        : null;

    const telefonoNormalizado = normalizeColombianMobile(String(telefono));
    if (!telefonoNormalizado) {
      return NextResponse.json(
        { mensaje: "Ingresa un celular colombiano valido de 10 digitos." },
        { status: 400 }
      );
    }

    // precio y nombre del producto se derivan del catalogo real, nunca del
    // body del cliente — evita que alguien manipule el POST y pague menos.
    const product = await getProductByHandle(slug);
    const variant = product?.variants.find((v) => v.id === variantId);

    if (!product || !variant) {
      return NextResponse.json(
        { mensaje: "El producto o la variante seleccionada ya no existe." },
        { status: 400 }
      );
    }

    const { orderId, orderNumber } = await createShopifyOrder({
      variantId,
      quantity: 1,
      nombre,
      telefono: telefonoNormalizado.e164,
      email: email || undefined,
      departamento,
      direccion,
      barrio,
      ciudad,
      lat,
      lng,
    });

    try {
      const supabase = createAdminSupabaseClient();
      const nombreProducto = `${product.title} — ${variant.title}`;

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
        precio_total: parseFloat(variant.price),
        estado: "pendiente",
        notas: notas || null,
      });

      if (insertError) {
        console.error("Error al guardar el pedido en Supabase:", insertError.message);
      }
    } catch (syncError) {
      console.error("Error al sincronizar el pedido con Supabase:", syncError);
    }

    return NextResponse.json({ orderNumber, telefono: telefonoNormalizado.display });
  } catch (error) {
    console.error("Error al procesar el pedido:", error);
    return NextResponse.json(
      { mensaje: "No pudimos procesar tu pedido. Intenta de nuevo." },
      { status: 500 }
    );
  }
}

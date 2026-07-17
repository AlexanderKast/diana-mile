import { NextRequest, NextResponse } from "next/server";
import { upsertCheckoutDraftOrder, getProductByHandle } from "@/lib/shopify";
import { normalizeColombianMobile } from "@/lib/phone";
import { getPricingConfig } from "@/lib/pricing-server";

/**
 * Paso "Realizar pedido": crea o actualiza (si viene draftOrderId) el
 * draft order en Shopify con los datos de envio. Se llama cada vez que la
 * persona confirma el formulario de datos, incluso si vuelve a editarlo
 * despues de ver la pantalla de confirmacion.
 */
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
      ubicacion,
      variantId,
      slug,
      descuentoAplicado,
      envioPrioritario,
      draftOrderId,
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

    // precio y nombre del producto se derivan del catalogo real, nunca del
    // body del cliente — evita que alguien manipule el POST y pague menos.
    const product = await getProductByHandle(slug);
    const variant = product?.variants.find((v) => v.id === variantId);

    if (!product || !variant) {
      return NextResponse.json(
        { mensaje: "El producto o la variante seleccionada ya no existe." },
        { status: 400 },
      );
    }

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

    const result = await upsertCheckoutDraftOrder(
      {
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
        discountPercent: descuentoAplicado
          ? pricing.discountPercent
          : undefined,
        envioPrioritario: Boolean(envioPrioritario),
      },
      draftOrderId || null,
    );

    if (!result) {
      return NextResponse.json(
        { mensaje: "No pudimos guardar tu pedido. Intenta de nuevo." },
        { status: 500 },
      );
    }

    return NextResponse.json({ draftOrderId: result.draftOrderId });
  } catch (error) {
    console.error(
      "Error al crear/actualizar el draft order del pedido:",
      error,
    );
    return NextResponse.json(
      { mensaje: "No pudimos guardar tu pedido. Intenta de nuevo." },
      { status: 500 },
    );
  }
}

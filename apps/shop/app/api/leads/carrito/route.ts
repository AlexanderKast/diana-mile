import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import { normalizeColombianMobile } from "@/lib/phone";
import { upsertAbandonedDraftOrder } from "@/lib/shopify";

const FUENTE = "checkout_abandonado";

/**
 * Captura carritos abandonados: se llama (con debounce) apenas nombre +
 * telefono son validos en el formulario COD, ANTES de que el pedido se
 * complete. Se registra en Supabase (para el panel admin) Y como draft
 * order en Shopify (Orders > Drafts, para que el equipo lo vea directo ahi).
 * Si la persona nunca termina el pedido, ambos quedan para remarketing.
 * Si si lo completa, /api/orders marca convertido=true y borra el draft.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, telefono, ciudad, producto_interes, variantId } = body ?? {};

    if (!nombre || !telefono) {
      return NextResponse.json({ mensaje: "Nombre y telefono son requeridos." }, { status: 400 });
    }

    const telefonoNormalizado = normalizeColombianMobile(String(telefono));
    if (!telefonoNormalizado) {
      return NextResponse.json({ ok: false }, { status: 200 });
    }

    const supabase = createAdminSupabaseClient();

    const { data: existente } = await supabase
      .from("leads")
      .select("id, shopify_draft_order_id")
      .eq("telefono", telefonoNormalizado.e164)
      .eq("fuente", FUENTE)
      .eq("convertido", false)
      .maybeSingle();

    let draftOrderId: string | null = existente?.shopify_draft_order_id ?? null;

    if (variantId) {
      const draft = await upsertAbandonedDraftOrder(
        { variantId, nombre, telefono: telefonoNormalizado.e164, ciudad },
        draftOrderId
      );
      if (draft) draftOrderId = draft.draftOrderId;
    }

    if (existente) {
      await supabase
        .from("leads")
        .update({
          nombre,
          ciudad: ciudad || null,
          producto_interes: producto_interes || null,
          shopify_draft_order_id: draftOrderId,
        })
        .eq("id", existente.id);
    } else {
      await supabase.from("leads").insert({
        nombre,
        telefono: telefonoNormalizado.e164,
        ciudad: ciudad || null,
        producto_interes: producto_interes || null,
        fuente: FUENTE,
        convertido: false,
        shopify_draft_order_id: draftOrderId,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    // Carrito abandonado es best-effort: nunca debe romper la experiencia
    // de compra ni mostrarle un error al cliente.
    console.error("Error al capturar carrito abandonado:", error);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

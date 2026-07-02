import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { normalizeColombianMobile } from "@/lib/phone";

const FUENTE = "checkout_abandonado";

/**
 * Captura carritos abandonados: se llama (con debounce) apenas nombre +
 * telefono son validos en el formulario COD, ANTES de que el pedido se
 * complete. Si la persona nunca termina el pedido, este registro queda
 * para remarketing. Si si lo completa, /api/orders lo marca convertido.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, telefono, ciudad, producto_interes } = body ?? {};

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
      .select("id")
      .eq("telefono", telefonoNormalizado.e164)
      .eq("fuente", FUENTE)
      .eq("convertido", false)
      .maybeSingle();

    if (existente) {
      await supabase
        .from("leads")
        .update({ nombre, ciudad: ciudad || null, producto_interes: producto_interes || null })
        .eq("id", existente.id);
    } else {
      await supabase.from("leads").insert({
        nombre,
        telefono: telefonoNormalizado.e164,
        ciudad: ciudad || null,
        producto_interes: producto_interes || null,
        fuente: FUENTE,
        convertido: false,
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

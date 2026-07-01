import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, telefono, ciudad, producto_interes, fuente, utm_source, utm_campaign } = body ?? {};

    if (!nombre || !telefono) {
      return NextResponse.json(
        { mensaje: "Nombre y telefono son requeridos." },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();
    const { error } = await supabase.from("leads").insert({
      nombre,
      telefono,
      ciudad: ciudad || null,
      producto_interes: producto_interes || null,
      fuente: fuente || null,
      utm_source: utm_source || null,
      utm_campaign: utm_campaign || null,
    });

    if (error) {
      console.error("Error al guardar el lead en Supabase:", error.message);
      return NextResponse.json(
        { mensaje: "No pudimos enviar tus datos. Intenta de nuevo." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al procesar el lead:", error);
    return NextResponse.json(
      { mensaje: "No pudimos enviar tus datos. Intenta de nuevo." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSupabaseClient,
  getAdminUser,
} from "@diana-mile/shared/supabase/server";

/**
 * Marca que la transportadora YA consignó el recaudo de un pedido.
 *
 * Entre la entrega y la consignación, esa plata está en manos de un
 * tercero. Este es el cierre del ciclo del efectivo: sin marcarlo, el
 * panel no puede distinguir "nos deben el recaudo de la semana" de "una
 * guía se quedó sin consignar hace un mes" — que es la fuga clásica de
 * contraentrega.
 *
 * `consignado: false` lo desmarca, para el caso del dedo resbalado.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const usuario = await getAdminUser();
    if (!usuario) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      consignado?: boolean;
      fecha?: string;
    };

    const fecha =
      body.consignado === false
        ? null
        : body.fecha && /^\d{4}-\d{2}-\d{2}$/.test(body.fecha)
          ? body.fecha
          : new Date().toISOString().slice(0, 10);

    const supabase = createAdminSupabaseClient();

    // Solo pedidos ENTREGADOS tienen recaudo que consignar. Marcar otro
    // estado sería inventar plata que nunca se cobró.
    const { data, error } = await supabase
      .from("pedidos")
      .update({ fecha_consignacion: fecha, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("estado", "entregado")
      .select("id, fecha_consignacion")
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: "No se pudo guardar: " + error.message },
        { status: 500 },
      );
    }
    if (!data) {
      return NextResponse.json(
        { error: "El pedido no existe o no está entregado." },
        { status: 400 },
      );
    }

    await supabase.from("actividad_log").insert({
      usuario_id: usuario.id,
      usuario_email: usuario.email,
      accion: fecha ? "recaudo_consignado" : "consignacion_desmarcada",
      entidad: "pedido",
      entidad_id: id,
      datos_nuevos: { fecha_consignacion: fecha },
    });

    return NextResponse.json({ ok: true, fecha_consignacion: data.fecha_consignacion });
  } catch (error) {
    console.error("Error al marcar la consignacion:", error);
    return NextResponse.json({ error: "No se pudo guardar." }, { status: 500 });
  }
}

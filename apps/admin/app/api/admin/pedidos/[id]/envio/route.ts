import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSupabaseClient,
  getAdminUser,
} from "@diana-mile/shared/supabase/server";
import { agregarTagsOrden, crearFulfillment } from "@/lib/shopify";
import { enviarPush } from "@/lib/push";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await request.json();
  const {
    transportadora,
    numero_guia,
    fecha_envio,
    fecha_entrega_estimada,
    costo_envio,
  } = body as {
    transportadora?: string;
    numero_guia?: string;
    fecha_envio?: string;
    fecha_entrega_estimada?: string;
    costo_envio?: number;
  };

  if (!transportadora || !numero_guia) {
    return NextResponse.json(
      {
        error: "Los campos 'transportadora' y 'numero_guia' son obligatorios.",
      },
      { status: 400 },
    );
  }

  const supabase = createAdminSupabaseClient();

  const { data: pedido, error: fetchError } = await supabase
    .from("pedidos")
    .select("id, estado")
    .eq("id", id)
    .single();

  if (fetchError || !pedido) {
    return NextResponse.json(
      { error: "Pedido no encontrado." },
      { status: 404 },
    );
  }

  const { data: pedidoActualizado, error: updateError } = await supabase
    .from("pedidos")
    .update({
      transportadora,
      numero_guia,
      fecha_envio: fecha_envio ?? new Date().toISOString().slice(0, 10),
      fecha_entrega_estimada: fecha_entrega_estimada ?? null,
      costo_envio: costo_envio ?? null,
      estado: "enviado",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json(
      { error: "No se pudo asignar el envío.", detalle: updateError.message },
      { status: 500 },
    );
  }

  await supabase.from("actividad_log").insert({
    usuario_id: user.id,
    usuario_email: user.email,
    accion: "guia_asignada",
    entidad: "pedido",
    entidad_id: id,
    datos_anteriores: { estado: pedido.estado },
    datos_nuevos: { estado: "enviado", transportadora, numero_guia },
  });

  if (pedidoActualizado.shopify_order_id) {
    await crearFulfillment(pedidoActualizado.shopify_order_id, {
      numeroGuia: numero_guia,
      transportadora,
    });
    await agregarTagsOrden(pedidoActualizado.shopify_order_id, ["enviado"]);
  }

  if (pedidoActualizado.telefono) {
    enviarPush(pedidoActualizado.telefono, {
      titulo: "Tu pedido va en camino 🚚",
      cuerpo: `Enviado con ${transportadora}, guía ${numero_guia}.`,
      url: `/cuenta/pedidos/${id}`,
    }).catch((err) => console.warn("[push] fallo al notificar envio:", err));
  }

  return NextResponse.json({ pedido: pedidoActualizado }, { status: 200 });
}

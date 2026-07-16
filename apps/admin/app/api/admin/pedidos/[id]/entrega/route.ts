import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSupabaseClient,
  getAdminUser,
} from "@diana-mile/shared/supabase/server";
import { agregarNotaOrden, agregarTagsOrden } from "@/lib/shopify";
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
  const { accion, motivo, valor_recaudado } = body as {
    accion?: "entregado" | "devolucion";
    motivo?: string;
    valor_recaudado?: number;
  };

  if (accion !== "entregado" && accion !== "devolucion") {
    return NextResponse.json(
      { error: "El campo 'accion' debe ser 'entregado' o 'devolucion'." },
      { status: 400 },
    );
  }

  if (accion === "devolucion" && !motivo) {
    return NextResponse.json(
      { error: "El motivo de la devolución es obligatorio." },
      { status: 400 },
    );
  }

  const supabase = createAdminSupabaseClient();

  const { data: pedido, error: fetchError } = await supabase
    .from("pedidos")
    .select("id, estado, precio_total")
    .eq("id", id)
    .single();

  if (fetchError || !pedido) {
    return NextResponse.json(
      { error: "Pedido no encontrado." },
      { status: 404 },
    );
  }

  const update =
    accion === "entregado"
      ? {
          estado: "entregado" as const,
          fecha_entrega_real: new Date().toISOString().slice(0, 10),
          valor_recaudado: valor_recaudado ?? pedido.precio_total,
          updated_at: new Date().toISOString(),
        }
      : {
          estado: "devuelto" as const,
          devolucion_motivo: motivo,
          updated_at: new Date().toISOString(),
        };

  const { data: pedidoActualizado, error: updateError } = await supabase
    .from("pedidos")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json(
      {
        error: "No se pudo actualizar la entrega.",
        detalle: updateError.message,
      },
      { status: 500 },
    );
  }

  await supabase.from("actividad_log").insert({
    usuario_id: user.id,
    usuario_email: user.email,
    accion: accion === "entregado" ? "pedido_entregado" : "pedido_devuelto",
    entidad: "pedido",
    entidad_id: id,
    datos_anteriores: { estado: pedido.estado },
    datos_nuevos: { estado: pedidoActualizado.estado },
  });

  if (pedidoActualizado.shopify_order_id) {
    await agregarTagsOrden(pedidoActualizado.shopify_order_id, [
      pedidoActualizado.estado,
    ]);
    if (accion === "devolucion") {
      await agregarNotaOrden(
        pedidoActualizado.shopify_order_id,
        `Devolución: ${motivo}`,
      );
    }
  }

  if (accion === "entregado" && pedidoActualizado.telefono) {
    enviarPush(pedidoActualizado.telefono, {
      titulo: "¡Tu pedido llegó! 📦",
      cuerpo: `${pedidoActualizado.producto_nombre} fue entregado. Ya puedes ver tu contenido premium en tu cuenta.`,
      url: "/cuenta/pedidos",
    }).catch((err) => console.warn("[push] fallo al notificar entrega:", err));
  }

  return NextResponse.json({ pedido: pedidoActualizado }, { status: 200 });
}

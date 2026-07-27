import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSupabaseClient,
  getAdminUser,
} from "@diana-mile/shared/supabase/server";
import { cancelarPedido } from "@diana-mile/shared/botcake/cancelacion";
import {
  agregarNotaOrden,
  agregarTagsOrden,
  cancelarOrdenShopify,
} from "@/lib/shopify";

/**
 * Cancelar un pedido desde el panel. Deja el mismo resultado que cancelar
 * desde Shopify o que el cliente pulse "anular" en WhatsApp: estado
 * actualizado, orden cancelada en Shopify con el stock devuelto, y el
 * cliente avisado por WhatsApp.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { motivo } = (await request.json().catch(() => ({}))) as {
    motivo?: string;
  };

  const supabase = createAdminSupabaseClient();

  const resultado = await cancelarPedido(supabase, id, {
    origen: "admin",
    motivo: motivo?.trim() || undefined,
    cancelarEnShopify: async (orderId) => {
      await agregarTagsOrden(orderId, ["cancelado-admin"]);
      await agregarNotaOrden(
        orderId,
        `Cancelado desde el panel por ${user.email}${motivo ? `: ${motivo}` : ""}.`,
      );
      return cancelarOrdenShopify(orderId);
    },
  });

  if (!resultado.cancelado) {
    return NextResponse.json(
      { error: resultado.motivo ?? "No se pudo cancelar el pedido." },
      { status: 400 },
    );
  }

  if (!resultado.yaEstaba) {
    await supabase.from("actividad_log").insert({
      usuario_id: user.id,
      usuario_email: user.email,
      accion: "pedido_cancelado",
      entidad: "pedido",
      entidad_id: id,
      datos_nuevos: { motivo: motivo ?? null },
    });
  }

  return NextResponse.json({
    cancelado: true,
    yaEstaba: resultado.yaEstaba,
    avisoEnviado: resultado.avisoEncolado,
  });
}

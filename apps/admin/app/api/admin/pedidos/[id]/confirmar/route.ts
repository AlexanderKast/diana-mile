import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient, getAdminUser } from "@diana-mile/shared/supabase/server";
import type { EstadoPedido, ResultadoConfirmacion } from "@diana-mile/shared/types";
import { agregarNotaOrden, agregarTagsOrden } from "@/lib/shopify";

const RESULTADOS_VALIDOS: ResultadoConfirmacion[] = [
  "confirmado",
  "rechazado",
  "no_contesta",
  "numero_invalido",
  "rellamar",
  "duplicado",
  "fraude",
];

function estadoParaResultado(resultado: ResultadoConfirmacion): EstadoPedido | null {
  if (resultado === "confirmado") return "confirmado";
  if (resultado === "rechazado" || resultado === "duplicado") return "cancelado";
  if (resultado === "fraude") return "fraude";
  return null;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await request.json();
  const { resultado, notas, duracion_segundos } = body as {
    resultado?: ResultadoConfirmacion;
    notas?: string;
    duracion_segundos?: number;
  };

  if (!resultado || !RESULTADOS_VALIDOS.includes(resultado)) {
    return NextResponse.json(
      { error: `Resultado invalido. Valores permitidos: ${RESULTADOS_VALIDOS.join(", ")}.` },
      { status: 400 }
    );
  }

  const supabase = createAdminSupabaseClient();

  const { data: pedido, error: fetchError } = await supabase
    .from("pedidos")
    .select("id, estado, intentos_llamada")
    .eq("id", id)
    .single();

  if (fetchError || !pedido) {
    return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404 });
  }

  const { data: rolRow } = await supabase
    .from("usuario_roles")
    .select("nombre")
    .eq("user_id", user.id)
    .maybeSingle();
  const usuarioNombre = rolRow?.nombre ?? user.email ?? "Admin";

  const nuevoIntento = (pedido.intentos_llamada ?? 0) + 1;
  const nuevoEstado = estadoParaResultado(resultado);

  const { error: confirmacionError } = await supabase.from("confirmaciones").insert({
    pedido_id: id,
    usuario_id: user.id,
    usuario_nombre: usuarioNombre,
    intento: nuevoIntento,
    resultado,
    notas: notas ?? null,
    duracion_segundos: duracion_segundos ?? null,
  });

  if (confirmacionError) {
    return NextResponse.json(
      { error: "No se pudo registrar la confirmación.", detalle: confirmacionError.message },
      { status: 500 }
    );
  }

  const update: Record<string, unknown> = {
    intentos_llamada: nuevoIntento,
    updated_at: new Date().toISOString(),
  };
  if (nuevoEstado) {
    update.estado = nuevoEstado;
  }
  if (resultado === "confirmado") {
    update.confirmado_por = usuarioNombre;
    update.fecha_confirmacion = new Date().toISOString();
  }

  const { data: pedidoActualizado, error: updateError } = await supabase
    .from("pedidos")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json(
      { error: "No se pudo actualizar el pedido.", detalle: updateError.message },
      { status: 500 }
    );
  }

  await supabase.from("actividad_log").insert({
    usuario_id: user.id,
    usuario_email: user.email,
    accion: "pedido_confirmacion",
    entidad: "pedido",
    entidad_id: id,
    datos_anteriores: { estado: pedido.estado },
    datos_nuevos: { estado: pedidoActualizado.estado, resultado },
  });

  if (pedidoActualizado.shopify_order_id) {
    await agregarNotaOrden(
      pedidoActualizado.shopify_order_id,
      `Confirmacion (${resultado}) por ${usuarioNombre} el ${new Date().toLocaleDateString("es-CO")}${notas ? `: ${notas}` : ""}`
    );
    if (nuevoEstado) {
      await agregarTagsOrden(pedidoActualizado.shopify_order_id, [nuevoEstado]);
    }
  }

  return NextResponse.json({ pedido: pedidoActualizado }, { status: 200 });
}

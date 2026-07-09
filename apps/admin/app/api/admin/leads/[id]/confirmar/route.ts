import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient, getAdminUser } from "@diana-mile/shared/supabase/server";
import { completarDraftComoOrden, crearOrdenDirecta } from "@/lib/shopify";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await request.json();
  const { direccion, barrio, departamento, ciudad, producto_nombre, cantidad, precio_total, notas } = body as {
    direccion?: string;
    barrio?: string;
    departamento?: string;
    ciudad?: string;
    producto_nombre?: string;
    cantidad?: number;
    precio_total?: number;
    notas?: string;
  };

  if (!direccion || !ciudad || !producto_nombre || !precio_total) {
    return NextResponse.json(
      { error: "Los campos 'direccion', 'ciudad', 'producto_nombre' y 'precio_total' son obligatorios." },
      { status: 400 }
    );
  }

  const supabase = createAdminSupabaseClient();

  const { data: lead, error: fetchError } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !lead) {
    return NextResponse.json({ error: "Lead no encontrado." }, { status: 404 });
  }

  if (lead.convertido) {
    return NextResponse.json({ error: "Este lead ya fue convertido a pedido." }, { status: 400 });
  }

  const cantidadFinal = cantidad && cantidad > 0 ? cantidad : 1;
  const direccionEnvio = {
    nombre: lead.nombre,
    telefono: lead.telefono,
    direccion,
    barrio: barrio ?? null,
    ciudad,
    departamento: departamento ?? null,
  };

  const { data: rolRow } = await supabase
    .from("usuario_roles")
    .select("nombre")
    .eq("user_id", user.id)
    .maybeSingle();
  const usuarioNombre = rolRow?.nombre ?? user.email ?? "Admin";

  let shopifyResult: { orderId: string; orderNumber: string } | null = null;
  if (lead.shopify_draft_order_id) {
    shopifyResult = await completarDraftComoOrden(lead.shopify_draft_order_id, direccionEnvio);
  } else {
    shopifyResult = await crearOrdenDirecta(
      direccionEnvio,
      [{ title: producto_nombre, quantity: cantidadFinal, price: String(precio_total / cantidadFinal) }],
      notas
    );
  }

  const { data: pedidoCreado, error: insertError } = await supabase
    .from("pedidos")
    .insert({
      shopify_order_id: shopifyResult?.orderId ?? null,
      shopify_order_number: shopifyResult?.orderNumber ?? null,
      nombre: lead.nombre,
      telefono: lead.telefono,
      direccion,
      barrio: barrio ?? null,
      ciudad,
      departamento: departamento ?? null,
      producto_nombre,
      cantidad: cantidadFinal,
      precio_total,
      precio_venta: precio_total,
      canal_adquisicion: lead.fuente,
      utm_source: lead.utm_source,
      utm_campaign: lead.utm_campaign,
      estado: "confirmado",
      confirmado_por: usuarioNombre,
      fecha_confirmacion: new Date().toISOString(),
      intentos_llamada: 1,
      notas: notas ?? null,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json(
      { error: "No se pudo crear el pedido.", detalle: insertError.message },
      { status: 500 }
    );
  }

  await supabase.from("leads").update({ convertido: true }).eq("id", id);

  await supabase.from("actividad_log").insert({
    usuario_id: user.id,
    usuario_email: user.email,
    accion: "lead_convertido_pedido",
    entidad: "lead",
    entidad_id: id,
    datos_anteriores: { convertido: false },
    datos_nuevos: { convertido: true, pedido_id: pedidoCreado.id, shopify_order_id: shopifyResult?.orderId ?? null },
  });

  return NextResponse.json(
    { pedido: pedidoCreado, shopify_sincronizado: shopifyResult !== null },
    { status: 200 }
  );
}

import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSupabaseClient,
  getAdminUser,
} from "@diana-mile/shared/supabase/server";
import { enviarTexto } from "@diana-mile/shared/botcake/client";
import { silenciarIA } from "@diana-mile/shared/botcake/ia/conversacion";

const VENTANA_MS = 24 * 60 * 60 * 1000;

type RouteParams = { params: Promise<{ id: string }> };

/** El hilo completo de una conversacion. */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminSupabaseClient();

  const [conv, mensajes] = await Promise.all([
    supabase
      .from("whatsapp_conversaciones")
      .select(
        "id, telefono, nombre, ultimo_experto, ia_activa, ultimo_entrante_at, escalado_at, motivo_escalado",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("whatsapp_conversacion_mensajes")
      .select("id, rol, contenido, experto, created_at")
      .eq("conversacion_id", id)
      .order("created_at", { ascending: true })
      .limit(200),
  ]);

  if (!conv.data) {
    return NextResponse.json({ error: "No existe." }, { status: 404 });
  }

  const ventanaAbierta = conv.data.ultimo_entrante_at
    ? Date.now() - new Date(conv.data.ultimo_entrante_at).getTime() < VENTANA_MS
    : false;

  return NextResponse.json({
    conversacion: { ...conv.data, ventanaAbierta },
    mensajes: mensajes.data ?? [],
  });
}

/**
 * Escribe como asesora desde el panel.
 *
 * DOS COSAS QUE NO SON OPCIONALES
 *
 * 1. La ventana de 24h. Meta solo deja mandar texto libre dentro de las 24h
 *    desde el ultimo mensaje de la persona. Fuera de eso hay que usar una
 *    plantilla aprobada. No es una limitacion del codigo y no se puede
 *    rodear: se comprueba aca y se explica, en vez de fallar sin decir por
 *    que.
 *
 * 2. Silenciar la IA. Si una persona entra a escribir y el agente sigue
 *    activo, los dos responden a la vez y la clienta recibe dos versiones
 *    distintas de lo mismo. Escribir a mano apaga la IA de esa conversacion.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const { texto } = (await request.json().catch(() => ({}))) as {
    texto?: string;
  };

  const mensaje = String(texto ?? "").trim();
  if (!mensaje) {
    return NextResponse.json({ error: "El mensaje está vacío." }, { status: 400 });
  }

  const supabase = createAdminSupabaseClient();
  const { data: conv } = await supabase
    .from("whatsapp_conversaciones")
    .select("id, telefono, ultimo_entrante_at, ia_activa")
    .eq("id", id)
    .maybeSingle();

  if (!conv) {
    return NextResponse.json({ error: "No existe." }, { status: 404 });
  }

  const ventanaAbierta = conv.ultimo_entrante_at
    ? Date.now() - new Date(conv.ultimo_entrante_at).getTime() < VENTANA_MS
    : false;

  if (!ventanaAbierta) {
    return NextResponse.json(
      {
        error:
          "Pasaron más de 24h desde su último mensaje. WhatsApp no permite texto libre fuera de esa ventana: hay que usar una plantilla aprobada por Meta.",
      },
      { status: 409 },
    );
  }

  const envio = await enviarTexto(conv.telefono, mensaje);
  if (!envio.success) {
    return NextResponse.json(
      { error: `No se pudo enviar: ${envio.error ?? "error de Botcake"}` },
      { status: 502 },
    );
  }

  // Queda en el mismo historial que usa el agente, para que si retoma la
  // conversacion sepa lo que ya se dijo y no se contradiga.
  await supabase.from("whatsapp_conversacion_mensajes").insert({
    conversacion_id: id,
    rol: "assistant",
    contenido: mensaje,
    experto: "humano",
  });

  if (conv.ia_activa) {
    await silenciarIA(supabase, conv.telefono, false);
  }

  return NextResponse.json({ ok: true, iaSilenciada: conv.ia_activa });
}

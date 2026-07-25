import { NextResponse } from "next/server";
import {
  createAdminSupabaseClient,
  getAdminUser,
} from "@diana-mile/shared/supabase/server";

/** Actividad reciente de los agentes de WhatsApp para el panel. */
export async function GET() {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const supabase = createAdminSupabaseClient();

  const [mensajes, conversaciones, eventos] = await Promise.all([
    supabase
      .from("whatsapp_mensajes")
      .select(
        "id, telefono, tipo, plantilla, estado, intentos, ultimo_error, enviado_at, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("whatsapp_conversaciones")
      .select("id, telefono, nombre, ultimo_experto, ia_activa, ultimo_entrante_at")
      .order("updated_at", { ascending: false })
      .limit(30),
    supabase
      .from("whatsapp_eventos")
      .select("id, telefono, evento, created_at")
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  return NextResponse.json({
    mensajes: mensajes.data ?? [],
    conversaciones: conversaciones.data ?? [],
    eventos: eventos.data ?? [],
  });
}

import { NextResponse } from "next/server";
import {
  createAdminSupabaseClient,
  getAdminUser,
} from "@diana-mile/shared/supabase/server";

/** 24h de Meta: fuera de esa ventana solo se puede mandar una plantilla aprobada. */
const VENTANA_MS = 24 * 60 * 60 * 1000;

/**
 * La bandeja: todas las conversaciones, ordenadas por quien necesita atencion.
 *
 * El orden no es cronologico a secas — primero va quien esta escalado y
 * esperando a una persona, porque es el unico caso en que el silencio le
 * cuesta al negocio.
 */
export async function GET() {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const supabase = createAdminSupabaseClient();

  const { data, error } = await supabase
    .from("whatsapp_conversaciones")
    .select(
      "id, telefono, nombre, ultimo_experto, ia_activa, ultimo_entrante_at, escalado_at, motivo_escalado, updated_at",
    )
    .order("escalado_at", { ascending: false, nullsFirst: false })
    .order("ultimo_entrante_at", { ascending: false, nullsFirst: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const ahora = Date.now();
  const conversaciones = (data ?? []).map((c) => ({
    ...c,
    // Se calcula aca y no en el cliente: el navegador puede tener la hora
    // corrida y creer que puede escribir cuando ya no se puede.
    ventanaAbierta: c.ultimo_entrante_at
      ? ahora - new Date(c.ultimo_entrante_at).getTime() < VENTANA_MS
      : false,
  }));

  return NextResponse.json({ conversaciones });
}

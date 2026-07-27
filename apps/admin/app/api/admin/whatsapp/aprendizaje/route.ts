import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSupabaseClient,
  getAdminUser,
} from "@diana-mile/shared/supabase/server";
import { ensenar } from "@diana-mile/shared/botcake/ia/aprendizaje";

/**
 * Lo que el agente aprendio y lo que todavia no sabe.
 *
 * Aqui es donde el sistema deja de depender de que alguien toque el
 * codigo: una pregunta que el agente no supo se contesta una vez desde el
 * panel y a partir de ahi la resuelve solo.
 */
export async function GET() {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const supabase = createAdminSupabaseClient();

  const [pendientes, aprendido] = await Promise.all([
    supabase
      .from("whatsapp_pendientes_aprender")
      .select("id, telefono, pregunta, contexto, created_at")
      .eq("estado", "pendiente")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("whatsapp_aprendizaje")
      .select("id, pregunta, respuesta, veces_usada, activa, created_at")
      .order("veces_usada", { ascending: false })
      .limit(100),
  ]);

  return NextResponse.json({
    pendientes: pendientes.data ?? [],
    aprendido: aprendido.data ?? [],
  });
}

/** Enseñar una respuesta nueva. */
export async function POST(request: NextRequest) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { pregunta, respuesta, pendienteId } = (await request.json()) as {
    pregunta?: string;
    respuesta?: string;
    pendienteId?: string;
  };

  if (!pregunta?.trim() || !respuesta?.trim()) {
    return NextResponse.json(
      { error: "Se requiere la pregunta y la respuesta." },
      { status: 400 },
    );
  }

  const supabase = createAdminSupabaseClient();
  const resultado = await ensenar(supabase, {
    pregunta,
    respuesta,
    creadoPor: user.email ?? undefined,
    pendienteId,
  });

  if (!resultado.ok) {
    return NextResponse.json(
      { error: resultado.motivo ?? "No se pudo guardar." },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: resultado.id });
}

/** Desactivar algo aprendido que ya no aplica, o descartar una pendiente. */
export async function PATCH(request: NextRequest) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id, tipo, activa } = (await request.json()) as {
    id?: string;
    tipo?: "aprendido" | "pendiente";
    activa?: boolean;
  };

  if (!id || !tipo) {
    return NextResponse.json({ error: "Faltan datos." }, { status: 400 });
  }

  const supabase = createAdminSupabaseClient();

  if (tipo === "pendiente") {
    await supabase
      .from("whatsapp_pendientes_aprender")
      .update({ estado: "descartada" })
      .eq("id", id);
  } else {
    await supabase
      .from("whatsapp_aprendizaje")
      .update({ activa: activa ?? false, updated_at: new Date().toISOString() })
      .eq("id", id);
  }

  return NextResponse.json({ ok: true });
}

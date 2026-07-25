import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSupabaseClient,
  getAdminUser,
} from "@diana-mile/shared/supabase/server";
import { silenciarIA } from "@diana-mile/shared/botcake/ia/conversacion";

/**
 * Prende o apaga el agente de IA para una conversacion concreta: cuando
 * una persona del equipo entra a atender a alguien, el bot debe callarse.
 */
export async function POST(request: NextRequest) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { telefono, activa } = (await request.json()) as {
    telefono?: string;
    activa?: boolean;
  };

  if (!telefono || typeof activa !== "boolean") {
    return NextResponse.json(
      { error: "Se requiere 'telefono' y 'activa'." },
      { status: 400 },
    );
  }

  const supabase = createAdminSupabaseClient();
  await silenciarIA(supabase, telefono, activa);

  return NextResponse.json({ telefono, activa });
}

import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSupabaseClient,
  getAdminUser,
} from "@diana-mile/shared/supabase/server";

/**
 * GET ?referencia=variante:<id>|producto:<handle> — historial de versiones
 * de una landing (quien guardo que y cuando). Restaurar = PUT normal con el
 * contenido de la version elegida (que a su vez archiva la actual).
 */
export async function GET(request: NextRequest) {
  try {
    if (!(await getAdminUser())) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const referencia = request.nextUrl.searchParams.get("referencia");
    if (!referencia || !/^(variante|producto):[\w-]+$/.test(referencia)) {
      return NextResponse.json({ error: "Referencia invalida." }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("landing_versiones")
      .select("id, autor, created_at, contenido")
      .eq("referencia", referencia)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw new Error(error.message);

    return NextResponse.json({ versiones: data ?? [] }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "No se pudo listar el historial.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

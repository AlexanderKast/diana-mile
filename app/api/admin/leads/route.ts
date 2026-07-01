import { NextResponse } from "next/server";
import { createAdminSupabaseClient, requireAdminSession } from "@/lib/supabase-server";

const LEADS_LIMIT = 200;

export async function GET() {
  try {
    if (!(await requireAdminSession())) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const supabase = createAdminSupabaseClient();

    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(LEADS_LIMIT);

    if (error) {
      return NextResponse.json(
        { error: "No se pudieron obtener los leads.", detalle: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ leads: data ?? [] }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error inesperado al obtener los leads.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

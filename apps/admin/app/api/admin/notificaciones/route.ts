import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@diana-mile/shared/supabase/server";
import { enviarPush } from "@/lib/push";

export async function POST(request: NextRequest) {
  try {
    if (!(await getAdminUser())) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const { titulo, cuerpo, url } = body as {
      titulo?: string;
      cuerpo?: string;
      url?: string;
    };

    if (!titulo?.trim() || !cuerpo?.trim()) {
      return NextResponse.json(
        { error: "Los campos 'titulo' y 'cuerpo' son obligatorios." },
        { status: 400 },
      );
    }

    const resultado = await enviarPush("todos", {
      titulo: titulo.trim(),
      cuerpo: cuerpo.trim(),
      url: url?.trim() || "/",
    });

    return NextResponse.json(resultado, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error inesperado al enviar la notificación.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

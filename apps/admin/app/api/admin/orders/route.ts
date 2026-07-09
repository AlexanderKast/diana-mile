import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient, requireAdminSession } from "@diana-mile/shared/supabase/server";
import type { EstadoPedido } from "@diana-mile/shared/types";

const DEFAULT_LIMIT = 100;

export async function GET(request: NextRequest) {
  try {
    if (!(await requireAdminSession())) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const estado = searchParams.get("estado");
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : DEFAULT_LIMIT;

    const supabase = createAdminSupabaseClient();

    let query = supabase
      .from("pedidos")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(Number.isFinite(limit) && limit > 0 ? limit : DEFAULT_LIMIT);

    if (estado) {
      query = query.eq("estado", estado);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: "No se pudieron obtener los pedidos.", detalle: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ pedidos: data ?? [] }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error inesperado al obtener los pedidos.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!(await requireAdminSession())) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const { id, estado } = body as { id?: string; estado?: EstadoPedido };

    if (!id || !estado) {
      return NextResponse.json(
        { error: "Los campos 'id' y 'estado' son obligatorios." },
        { status: 400 }
      );
    }

    const estadosValidos: EstadoPedido[] = [
      "pendiente",
      "confirmado",
      "en_preparacion",
      "enviado",
      "entregado",
      "devuelto",
      "cancelado",
      "fraude",
    ];

    if (!estadosValidos.includes(estado)) {
      return NextResponse.json(
        { error: `Estado invalido. Valores permitidos: ${estadosValidos.join(", ")}.` },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();

    const { data, error } = await supabase
      .from("pedidos")
      .update({ estado, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "No se pudo actualizar el pedido.", detalle: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ pedido: data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error inesperado al actualizar el pedido.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

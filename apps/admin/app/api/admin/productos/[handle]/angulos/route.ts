import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSupabaseClient,
  getAdminUser,
} from "@diana-mile/shared/supabase/server";
import { normalizarAngulo } from "@diana-mile/shared/landing/angulo";

type RouteParams = { params: Promise<{ handle: string }> };

/** Los angulos de un producto, el ultimo tocado primero. */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    if (!(await getAdminUser())) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { handle } = await params;
    const supabase = createAdminSupabaseClient();

    const { data, error } = await supabase
      .from("angulos_venta")
      .select("id, nombre, datos, created_at, updated_at")
      .eq("producto_handle", handle)
      .order("updated_at", { ascending: false });

    if (error) throw new Error(error.message);

    return NextResponse.json({ angulos: data ?? [] }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "No se pudieron listar los angulos.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

/**
 * Crea un angulo. `datos` es opcional: un angulo vacio es un formulario en
 * blanco al que el admin le va llenando campos (o que el prellenado con IA
 * completa despues).
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    if (!(await getAdminUser())) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { handle } = await params;
    const body = await request.json().catch(() => ({}));
    const { nombre, datos } = body ?? {};

    if (!nombre || typeof nombre !== "string" || !nombre.trim()) {
      return NextResponse.json(
        { error: "Falta el nombre del angulo." },
        { status: 400 },
      );
    }

    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("angulos_venta")
      .insert({
        producto_handle: handle,
        nombre: nombre.trim().slice(0, 120),
        datos: normalizarAngulo(datos),
      })
      .select("id, nombre, datos, created_at, updated_at")
      .single();

    if (error) {
      const duplicado = error.code === "23505";
      return NextResponse.json(
        {
          error: duplicado
            ? "Ya existe un angulo con ese nombre para este producto."
            : "No se pudo crear el angulo.",
          detalle: error.message,
        },
        { status: duplicado ? 409 : 500 },
      );
    }

    return NextResponse.json({ angulo: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "No se pudo crear el angulo.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

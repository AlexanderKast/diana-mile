import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSupabaseClient,
  getAdminUser,
} from "@diana-mile/shared/supabase/server";

type RouteParams = { params: Promise<{ handle: string }> };

const HEX_REGEX = /^#([0-9a-fA-F]{3}){1,2}$/;

type ColorInput = { variantId: string; colorHex: string | null };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    if (!(await getAdminUser())) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { handle } = await params;
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("variante_colores")
      .select("variant_id, color_hex")
      .eq("producto_handle", handle);

    if (error) {
      return NextResponse.json(
        {
          error: "No se pudieron obtener los colores.",
          detalle: error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        colores: (data ?? []).map((fila) => ({
          variantId: fila.variant_id,
          colorHex: fila.color_hex,
        })),
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error inesperado al obtener los colores.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    if (!(await getAdminUser())) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { handle } = await params;
    const body = await request.json();
    const colores: ColorInput[] = Array.isArray(body?.colores)
      ? body.colores
      : [];

    for (const item of colores) {
      if (!item?.variantId || typeof item.variantId !== "string") {
        return NextResponse.json(
          { error: "Cada color debe incluir 'variantId'." },
          { status: 400 },
        );
      }
      if (item.colorHex !== null && !HEX_REGEX.test(item.colorHex ?? "")) {
        return NextResponse.json(
          {
            error: `Color invalido para la variante ${item.variantId}: debe ser un hex como #RRGGBB.`,
          },
          { status: 400 },
        );
      }
    }

    const supabase = createAdminSupabaseClient();
    const now = new Date().toISOString();

    const conColor = colores.filter(
      (c): c is { variantId: string; colorHex: string } => Boolean(c.colorHex),
    );
    const sinColor = colores.filter((c) => !c.colorHex);

    if (conColor.length > 0) {
      const { error: upsertError } = await supabase
        .from("variante_colores")
        .upsert(
          conColor.map((c) => ({
            producto_handle: handle,
            variant_id: c.variantId,
            color_hex: c.colorHex,
            updated_at: now,
          })),
          { onConflict: "variant_id" },
        );
      if (upsertError) {
        return NextResponse.json(
          {
            error: "No se pudieron guardar los colores.",
            detalle: upsertError.message,
          },
          { status: 500 },
        );
      }
    }

    if (sinColor.length > 0) {
      const { error: deleteError } = await supabase
        .from("variante_colores")
        .delete()
        .in(
          "variant_id",
          sinColor.map((c) => c.variantId),
        );
      if (deleteError) {
        return NextResponse.json(
          {
            error: "No se pudieron limpiar los colores.",
            detalle: deleteError.message,
          },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error inesperado al guardar los colores.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

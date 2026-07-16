import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSupabaseClient,
  getAdminUser,
} from "@diana-mile/shared/supabase/server";
import type { Contenido, TipoContenido } from "@diana-mile/shared/types";

const TIPOS_VALIDOS: TipoContenido[] = ["rutina", "guia", "plan_alimentacion"];

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    if (!(await getAdminUser())) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { titulo, descripcion, tipo, cuerpo, orden, publicado } = body as {
      titulo?: string;
      descripcion?: string | null;
      tipo?: string;
      cuerpo?: string | null;
      orden?: number;
      publicado?: boolean;
    };

    if (tipo && !TIPOS_VALIDOS.includes(tipo as TipoContenido)) {
      return NextResponse.json(
        {
          error: `Tipo invalido. Valores permitidos: ${TIPOS_VALIDOS.join(", ")}.`,
        },
        { status: 400 },
      );
    }

    const cambios: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (titulo !== undefined) cambios.titulo = titulo;
    if (descripcion !== undefined) cambios.descripcion = descripcion;
    if (tipo !== undefined) cambios.tipo = tipo;
    if (cuerpo !== undefined) cambios.cuerpo = cuerpo;
    if (orden !== undefined) cambios.orden = orden;
    if (publicado !== undefined) cambios.publicado = publicado;

    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("contenidos")
      .update(cambios)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          error: "No se pudo actualizar el contenido.",
          detalle: error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ contenido: data as Contenido }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error inesperado al actualizar el contenido.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    if (!(await getAdminUser())) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createAdminSupabaseClient();

    const { data: contenido } = await supabase
      .from("contenidos")
      .select("archivo_path")
      .eq("id", id)
      .maybeSingle();

    const { error } = await supabase.from("contenidos").delete().eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "No se pudo eliminar el contenido.", detalle: error.message },
        { status: 500 },
      );
    }

    if (contenido?.archivo_path) {
      await supabase.storage
        .from("contenidos")
        .remove([contenido.archivo_path]);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error inesperado al eliminar el contenido.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSupabaseClient,
  getAdminUser,
} from "@diana-mile/shared/supabase/server";
import type { Contenido, TipoContenido } from "@diana-mile/shared/types";

const TIPOS_VALIDOS: TipoContenido[] = ["rutina", "guia", "plan_alimentacion"];

export async function GET() {
  try {
    if (!(await getAdminUser())) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("contenidos")
      .select("*")
      .order("orden", { ascending: true });

    if (error) {
      return NextResponse.json(
        {
          error: "No se pudieron obtener los contenidos.",
          detalle: error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { contenidos: (data ?? []) as Contenido[] },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error inesperado al obtener los contenidos.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

/**
 * multipart/form-data: titulo, tipo, descripcion?, cuerpo?, orden?,
 * publicado?, archivo? (PDF u otro descargable, opcional).
 */
export async function POST(request: NextRequest) {
  try {
    if (!(await getAdminUser())) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const form = await request.formData();
    const titulo = String(form.get("titulo") ?? "").trim();
    const tipo = String(form.get("tipo") ?? "");
    const descripcion = form.get("descripcion");
    const cuerpo = form.get("cuerpo");
    const orden = form.get("orden");
    const publicado = form.get("publicado") === "true";
    const archivo = form.get("archivo");

    if (!titulo) {
      return NextResponse.json(
        { error: "El campo 'titulo' es obligatorio." },
        { status: 400 },
      );
    }
    if (!TIPOS_VALIDOS.includes(tipo as TipoContenido)) {
      return NextResponse.json(
        {
          error: `Tipo invalido. Valores permitidos: ${TIPOS_VALIDOS.join(", ")}.`,
        },
        { status: 400 },
      );
    }

    const supabase = createAdminSupabaseClient();
    let archivoPath: string | null = null;

    if (archivo instanceof File && archivo.size > 0) {
      archivoPath = `${crypto.randomUUID()}-${archivo.name}`;
      const { error: uploadError } = await supabase.storage
        .from("contenidos")
        .upload(archivoPath, archivo, {
          contentType: archivo.type || undefined,
        });

      if (uploadError) {
        return NextResponse.json(
          {
            error: "No se pudo subir el archivo.",
            detalle: uploadError.message,
          },
          { status: 500 },
        );
      }
    }

    const { data, error } = await supabase
      .from("contenidos")
      .insert({
        titulo,
        tipo,
        descripcion: descripcion ? String(descripcion) : null,
        cuerpo: cuerpo ? String(cuerpo) : null,
        orden: orden ? Number(orden) : 0,
        publicado,
        archivo_path: archivoPath,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "No se pudo crear el contenido.", detalle: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ contenido: data as Contenido }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error inesperado al crear el contenido.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

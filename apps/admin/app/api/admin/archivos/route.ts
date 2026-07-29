import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@diana-mile/shared/supabase/server";
import {
  confirmarSubida,
  listarArchivos,
  MAX_BYTES_IMAGEN,
  MAX_BYTES_VIDEO,
  MIMES_IMAGEN,
  MIMES_VIDEO,
  prepararSubida,
} from "@/lib/shopify-archivos";

// Confirmar un video espera a que Shopify lo procese (hasta ~60s de poll).
export const maxDuration = 120;

/**
 * GET ?tipo=imagen|video&buscar=&cursor= — biblioteca de Shopify (Contenido >
 * Archivos) para elegir contenido ya subido desde el editor visual.
 */
export async function GET(request: NextRequest) {
  try {
    if (!(await getAdminUser())) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }
    const params = request.nextUrl.searchParams;
    const resultado = await listarArchivos({
      tipo: params.get("tipo") === "video" ? "video" : "imagen",
      buscar: params.get("buscar")?.slice(0, 80) ?? undefined,
      cursor: params.get("cursor") ?? undefined,
    });
    return NextResponse.json(resultado, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "No se pudo listar la biblioteca.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

/**
 * Subida de archivos del constructor visual, en dos pasos (el archivo viaja
 * directo del navegador al CDN de Shopify; por aqui solo pasan los datos):
 *
 *   POST { paso: "preparar", filename, mimeType, tamano }
 *     -> { url, parameters, resourceUrl }  (URL firmada para subir directo)
 *   POST { paso: "confirmar", resourceUrl, mimeType, alt? }
 *     -> { url }  (URL publica en cdn.shopify.com)
 */
export async function POST(request: NextRequest) {
  try {
    if (!(await getAdminUser())) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const body = await request.json();

    if (body?.paso === "preparar") {
      const { filename, mimeType, tamano } = body;
      if (typeof filename !== "string" || typeof mimeType !== "string") {
        return NextResponse.json({ error: "Faltan datos." }, { status: 400 });
      }
      const bytes = Number(tamano) || 0;
      const esImagen = MIMES_IMAGEN.has(mimeType);
      const esVideo = MIMES_VIDEO.has(mimeType);
      if (!esImagen && !esVideo) {
        return NextResponse.json(
          { error: "Formato no soportado. Imagenes: JPG/PNG/WebP/GIF. Videos: MP4/WebM." },
          { status: 400 },
        );
      }
      const tope = esVideo ? MAX_BYTES_VIDEO : MAX_BYTES_IMAGEN;
      if (bytes <= 0 || bytes > tope) {
        return NextResponse.json(
          { error: `El archivo supera el maximo (${Math.round(tope / 1024 / 1024)}MB).` },
          { status: 413 },
        );
      }
      const target = await prepararSubida(
        filename.slice(0, 120).replace(/[^\w.\-]+/g, "-"),
        mimeType,
        bytes,
      );
      return NextResponse.json(target, { status: 200 });
    }

    if (body?.paso === "confirmar") {
      const { resourceUrl, mimeType, alt } = body;
      if (typeof resourceUrl !== "string" || typeof mimeType !== "string") {
        return NextResponse.json({ error: "Faltan datos." }, { status: 400 });
      }
      const url = await confirmarSubida(
        resourceUrl,
        mimeType,
        typeof alt === "string" ? alt.slice(0, 200) : "",
      );
      return NextResponse.json({ url }, { status: 200 });
    }

    return NextResponse.json({ error: "Paso invalido." }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "No se pudo subir el archivo.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

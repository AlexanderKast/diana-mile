import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSupabaseClient,
  getAdminUser,
} from "@diana-mile/shared/supabase/server";
import {
  normalizarAngulo,
  type AnguloVenta,
} from "@diana-mile/shared/landing/angulo";
import { generarImagenSeccion, tieneGeminiApiKey } from "@/lib/gemini-imagen";
import { construirPromptSeccion } from "@/lib/prompt-seccion";
import { obtenerProducto } from "@/lib/shopify-catalogo";
import { subirImagenBuffer } from "@/lib/shopify-archivos";
import {
  descargarComoB64,
  elegirReferenciaSeccion,
  referenciaPorId,
  type ReferenciaImagen,
} from "@/lib/referencias-secciones";

export const maxDuration = 120;

type RouteParams = { params: Promise<{ handle: string }> };

const TIPOS_VALIDOS = new Set([
  "hero",
  "oferta",
  "beneficios",
  "comparativa",
  "autoridad",
  "uso",
  "sensorial",
  "testimonios",
  "antes_despues",
  "logistica",
  "faq",
]);

/** Fotos de referencia que se le mandan al modelo ademas de la plantilla. */
const MAX_FOTOS_PRODUCTO = 3;

/**
 * Tamano nominal a 2K por proporcion — solo se usa si no se pudo leer el
 * real. Errar aqui deforma la seccion en el editor, asi que el fallback
 * tiene que seguir la proporcion que se le pidio al modelo, no una fija.
 */
const ALTO_FALLBACK = 2048;
const ANCHO_FALLBACK: Record<string, number> = {
  "9:16": 1152,
  "3:4": 1536,
  "4:5": 1638,
};

/**
 * Dimensiones reales del PNG leyendo el IHDR (los primeros 8 bytes son la
 * firma, luego longitud+tipo, y el ancho/alto van big-endian en 16-23).
 * Se hace a mano porque el repo no admite dependencias de imagen y el
 * editor necesita el tamano exacto para no deformar la seccion.
 */
function medirPNG(buffer: Buffer, mimeType: string, proporcion: string) {
  if (mimeType.includes("png") && buffer.length >= 24) {
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    if (width > 0 && height > 0) return { width, height };
  }
  return {
    width: ANCHO_FALLBACK[proporcion] ?? ANCHO_FALLBACK["9:16"],
    height: ALTO_FALLBACK,
  };
}

/**
 * Paso "imagen" de Landing magica: toma el copy ya revisado por el admin,
 * se lo pasa a Gemini junto con la plantilla de layout y las fotos reales
 * del producto, y sube el resultado al CDN de Shopify. Devuelve la URL con
 * sus dimensiones, listo para insertarse como seccion de la landing.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    if (!(await getAdminUser())) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }
    if (!tieneGeminiApiKey()) {
      return NextResponse.json(
        { error: "Falta GEMINI_API_KEY en el servidor." },
        { status: 503 },
      );
    }

    const { handle } = await params;
    const body = await request.json().catch(() => ({}));
    const tipo = String(body?.tipo ?? "");
    const copy = body?.copy ?? {};
    const anguloId =
      typeof body?.angulo_id === "string" && body.angulo_id
        ? body.angulo_id
        : null;
    // La misma referencia que ya leyo Gemini para escribir este copy en
    // `copy-secciones`: si se sorteara otra aqui, el texto pudo haberse
    // escrito para una estructura distinta a la que termina dibujandose.
    const referenciaIdFijada =
      typeof body?.referencia_id === "string" && body.referencia_id
        ? body.referencia_id
        : null;

    if (!TIPOS_VALIDOS.has(tipo)) {
      return NextResponse.json({ error: "Tipo de seccion invalido." }, { status: 400 });
    }
    if (typeof copy?.titular !== "string" || !copy.titular.trim()) {
      return NextResponse.json(
        { error: "El copy necesita al menos un titular." },
        { status: 400 },
      );
    }

    const producto = await obtenerProducto(handle);
    if (!producto) {
      return NextResponse.json(
        { error: "Producto no encontrado en Shopify." },
        { status: 404 },
      );
    }

    // El cliente solo puede pedir un ID de la biblioteca (referenciaIdFijada),
    // nunca una URL: una URL elegida por el body convertiria este endpoint en
    // un proxy de descargas. Sin ID (o si ya no existe), cascada: biblioteca
    // privada aleatoria → plantilla activa del tipo → sin referencia.
    const supabase = createAdminSupabaseClient();

    // El angulo se lee de la base por id (con el handle en el filtro), nunca
    // del body: es texto que entra al prompt del modelo. Su nombre es el
    // enfoque que dirige la direccion de arte de la seccion.
    let angulo: AnguloVenta | null = null;
    if (anguloId) {
      const { data } = await supabase
        .from("angulos_venta")
        .select("nombre, datos")
        .eq("producto_handle", handle)
        .eq("id", anguloId)
        .maybeSingle();
      if (data) {
        angulo = { ...normalizarAngulo(data.datos), nombre: data.nombre };
      }
    }

    const referencias: ReferenciaImagen[] = [];
    let referenciaId: string | null = null;

    if (referenciaIdFijada) {
      const fijada = await referenciaPorId(supabase, referenciaIdFijada);
      if (fijada) {
        referencias.push(fijada);
        referenciaId = referenciaIdFijada;
      }
    }
    // Sin fijada (llamado directo, sin pasar por copy-secciones) o la fijada
    // ya no existe (se apago o se borro entre el copy y la imagen): cascada
    // normal, biblioteca aleatoria -> plantilla activa -> sin referencia.
    if (referencias.length === 0) {
      const elegida = await elegirReferenciaSeccion(supabase, tipo);
      if (elegida) {
        referencias.push(elegida.referencia);
        referenciaId = elegida.referenciaId;
      }
    }
    const hayReferencia = referencias.length > 0;

    for (const imagen of producto.imagenes.slice(0, MAX_FOTOS_PRODUCTO)) {
      referencias.push(await descargarComoB64(imagen.url));
    }

    const prompt = construirPromptSeccion({
      tipo,
      copy,
      productoTitulo: producto.title,
      hayReferencia,
      angulo,
    });

    const proporcion = angulo?.proporcion ?? "9:16";
    const generada = await generarImagenSeccion({
      prompt,
      referencias,
      aspectRatio: proporcion,
    });
    const buffer = Buffer.from(generada.dataB64, "base64");
    const { width, height } = medirPNG(buffer, generada.mimeType, proporcion);

    // La extension tiene que coincidir con el mimeType que declara Gemini:
    // Shopify rechaza la subida si el nombre dice .png y el tipo es otro.
    const extension = generada.mimeType.split("/")[1]?.split("+")[0] || "png";
    const url = await subirImagenBuffer(
      buffer,
      `seccion-${tipo}-${handle}.${extension}`,
      generada.mimeType,
      copy.titular,
    );

    // referencia_id es solo telemetria (para apagar una referencia mala):
    // la imagen de referencia jamas se expone al editor ni a la landing.
    return NextResponse.json(
      { url, width, height, tipo, referencia_id: referenciaId },
      { status: 200 },
    );
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : String(error);
    // Sin esto un 500 no dejaba rastro en el log del servidor — solo el
    // status y el tiempo, nunca el motivo real.
    console.error("generar-seccion fallo:", error);
    if (error && typeof error === "object" && "reintentable" in error) {
      return NextResponse.json({ error: mensaje, reintentable: true }, { status: 429 });
    }
    return NextResponse.json(
      { error: "No se pudo generar la seccion.", detalle: mensaje },
      { status: 500 },
    );
  }
}

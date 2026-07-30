import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createAdminSupabaseClient,
  getAdminUser,
} from "@diana-mile/shared/supabase/server";
import { generarImagenSeccion, tieneGeminiApiKey } from "@/lib/gemini-imagen";
import { construirPromptSeccion } from "@/lib/prompt-seccion";
import { obtenerProducto } from "@/lib/shopify-catalogo";
import { subirImagenBuffer } from "@/lib/shopify-archivos";

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

const BUCKET_REFERENCIAS = "referencias-secciones";

/** Fotos de referencia que se le mandan al modelo ademas de la plantilla. */
const MAX_FOTOS_PRODUCTO = 3;

/** 3:4 nominal a 2K — solo se usa si no se pudo leer el tamano real. */
const ANCHO_FALLBACK = 1536;
const ALTO_FALLBACK = 2048;

/** Unico origen del que este endpoint acepta descargar (anti-SSRF). */
const HOST_CDN = "cdn.shopify.com";

/**
 * Descarga una referencia y la deja en base64. Solo del CDN de Shopify:
 * tanto las fotos del producto como las plantillas viven ahi, y sin esta
 * restriccion el endpoint seria un proxy de peticiones arbitrarias desde
 * el servidor (SSRF hacia la red interna o los metadatos del proveedor).
 * `redirect: "error"` cierra el rodeo de un 302 del CDN hacia otro host.
 */
async function descargarComoB64(
  url: string,
): Promise<{ mimeType: string; dataB64: string }> {
  let destino: URL;
  try {
    destino = new URL(url);
  } catch {
    throw new Error("URL de referencia invalida.");
  }
  if (destino.protocol !== "https:" || destino.hostname !== HOST_CDN) {
    throw new Error(
      `Solo se aceptan imagenes de https://${HOST_CDN} (recibido: ${destino.hostname}).`,
    );
  }

  const res = await fetch(url, { redirect: "error" });
  if (!res.ok) throw new Error(`No se pudo descargar ${url} (${res.status}).`);
  const buffer = Buffer.from(await res.arrayBuffer());
  return {
    mimeType: res.headers.get("content-type")?.split(";")[0] || "image/jpeg",
    dataB64: buffer.toString("base64"),
  };
}

/**
 * Baja una referencia del bucket PRIVADO con el SDK, no por URL: no hay host
 * que validar ni URL firmada que pueda filtrarse, asi que la allowlist
 * anti-SSRF de descargarComoB64 se queda intacta (solo cdn.shopify.com).
 */
async function descargarReferencia(
  supabase: SupabaseClient,
  ruta: string,
): Promise<{ mimeType: string; dataB64: string }> {
  const { data, error } = await supabase.storage
    .from(BUCKET_REFERENCIAS)
    .download(ruta);
  if (error || !data) {
    throw new Error(`No se pudo leer la referencia ${ruta}.`);
  }
  const buffer = Buffer.from(await data.arrayBuffer());
  return {
    mimeType: data.type || "image/png",
    dataB64: buffer.toString("base64"),
  };
}

/**
 * Dimensiones reales del PNG leyendo el IHDR (los primeros 8 bytes son la
 * firma, luego longitud+tipo, y el ancho/alto van big-endian en 16-23).
 * Se hace a mano porque el repo no admite dependencias de imagen y el
 * editor necesita el tamano exacto para no deformar la seccion.
 */
function medirPNG(buffer: Buffer, mimeType: string) {
  if (mimeType.includes("png") && buffer.length >= 24) {
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    if (width > 0 && height > 0) return { width, height };
  }
  return { width: ANCHO_FALLBACK, height: ALTO_FALLBACK };
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

    // La referencia de layout NUNCA viene del cliente: una URL elegida por
    // el body convertiria este endpoint en un proxy de descargas. Cascada:
    // biblioteca privada (aleatoria, para variar la composicion cada vez) →
    // plantilla activa del tipo → sin referencia (layout descrito en texto).
    const supabase = createAdminSupabaseClient();
    const referencias: { mimeType: string; dataB64: string }[] = [];
    let referenciaId: string | null = null;

    const { data: aleatoria } = await supabase.rpc(
      "referencia_seccion_aleatoria",
      { p_tipo: tipo },
    );
    const elegida = Array.isArray(aleatoria) ? aleatoria[0] : null;

    if (elegida?.ruta_storage) {
      referencias.push(await descargarReferencia(supabase, elegida.ruta_storage));
      referenciaId = elegida.id ?? null;
    } else {
      const { data: plantilla } = await supabase
        .from("plantillas_secciones")
        .select("url_imagen")
        .eq("tipo_seccion", tipo)
        .eq("activa", true)
        .maybeSingle();
      if (plantilla?.url_imagen) {
        referencias.push(await descargarComoB64(plantilla.url_imagen));
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
    });

    const generada = await generarImagenSeccion({ prompt, referencias });
    const buffer = Buffer.from(generada.dataB64, "base64");
    const { width, height } = medirPNG(buffer, generada.mimeType);

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
    if (error && typeof error === "object" && "reintentable" in error) {
      return NextResponse.json({ error: mensaje, reintentable: true }, { status: 429 });
    }
    return NextResponse.json(
      { error: "No se pudo generar la seccion.", detalle: mensaje },
      { status: 500 },
    );
  }
}

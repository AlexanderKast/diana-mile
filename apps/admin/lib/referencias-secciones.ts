import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Descarga y cascada de eleccion de la referencia de layout de una seccion
 * de "Landing magica". Vive aparte porque tanto `copy-secciones` (para
 * describirla y guiar el copy) como `generar-seccion` (para dibujar sobre
 * ella) necesitan la misma logica de descarga y el mismo anti-SSRF.
 */

/** Unico origen del que se acepta descargar por URL directa (anti-SSRF). */
const HOST_CDN = "cdn.shopify.com";
const BUCKET_REFERENCIAS = "referencias-secciones";

export type ReferenciaImagen = { mimeType: string; dataB64: string };

/**
 * Descarga una imagen y la deja en base64. Solo del CDN de Shopify: tanto
 * las fotos del producto como las plantillas publicas viven ahi, y sin esta
 * restriccion cualquier endpoint que la use seria un proxy de peticiones
 * arbitrarias desde el servidor (SSRF hacia la red interna o los metadatos
 * del proveedor). `redirect: "error"` cierra el rodeo de un 302 del CDN
 * hacia otro host.
 */
export async function descargarComoB64(url: string): Promise<ReferenciaImagen> {
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
export async function descargarReferencia(
  supabase: SupabaseClient,
  ruta: string,
): Promise<ReferenciaImagen> {
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

export type ReferenciaElegida = {
  referencia: ReferenciaImagen;
  /** Solo la biblioteca privada tiene id; la plantilla publica no. */
  referenciaId: string | null;
};

/**
 * Cascada de eleccion de referencia para un tipo de seccion: biblioteca
 * privada (aleatoria, para variar la composicion) -> plantilla activa del
 * tipo -> sin referencia (el llamador cae al layout descrito en texto).
 */
export async function elegirReferenciaSeccion(
  supabase: SupabaseClient,
  tipo: string,
): Promise<ReferenciaElegida | null> {
  const { data: aleatoria } = await supabase.rpc("referencia_seccion_aleatoria", {
    p_tipo: tipo,
  });
  const elegida = Array.isArray(aleatoria) ? aleatoria[0] : null;

  if (elegida?.ruta_storage) {
    return {
      referencia: await descargarReferencia(supabase, elegida.ruta_storage),
      referenciaId: elegida.id ?? null,
    };
  }

  const { data: plantilla } = await supabase
    .from("plantillas_secciones")
    .select("url_imagen")
    .eq("tipo_seccion", tipo)
    .eq("activa", true)
    .maybeSingle();
  if (plantilla?.url_imagen) {
    return { referencia: await descargarComoB64(plantilla.url_imagen), referenciaId: null };
  }

  return null;
}

/**
 * Trae una referencia PUNTUAL de la biblioteca por id, para cuando el copy
 * ya se escribio mirando esa maqueta especifica y `generar-seccion` tiene
 * que dibujar sobre la MISMA, no sobre otra sorteada de nuevo.
 */
export async function referenciaPorId(
  supabase: SupabaseClient,
  id: string,
): Promise<ReferenciaImagen | null> {
  const { data } = await supabase
    .from("referencias_secciones")
    .select("ruta_storage")
    .eq("id", id)
    .eq("apta", true)
    .maybeSingle();
  if (!data?.ruta_storage) return null;
  return descargarReferencia(supabase, data.ruta_storage);
}

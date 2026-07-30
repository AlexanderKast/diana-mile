import { adminGraphQL } from "@/lib/shopify-catalogo";

/**
 * Subida de archivos del constructor visual al CDN de Shopify (Files).
 *
 * Flujo en dos pasos porque Vercel corta los bodies en ~4.5MB: la API solo
 * PREPARA (URL firmada de Shopify) y CONFIRMA; el archivo viaja directo del
 * navegador al bucket de Shopify. La optimizacion de formato (WebP/AVIF,
 * tamanos responsive) la hace next/image al servir — da igual que se suba
 * un JPG pesado.
 */

export const MIMES_IMAGEN = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

export const MIMES_VIDEO = new Set(["video/mp4", "video/webm", "video/quicktime"]);

export const MAX_BYTES_IMAGEN = 20 * 1024 * 1024; // 20MB
export const MAX_BYTES_VIDEO = 200 * 1024 * 1024; // 200MB

type StagedTarget = {
  url: string;
  resourceUrl: string;
  parameters: { name: string; value: string }[];
};

export type ArchivoShopify = {
  url: string;
  alt: string;
  /** Miniatura para la galeria (en videos, el frame de preview). */
  miniatura: string;
};

/**
 * Lista el contenido ya subido a Shopify (Admin > Contenido > Archivos):
 * la biblioteca desde la que el editor deja ELEGIR en vez de re-subir.
 */
export async function listarArchivos(opciones: {
  tipo: "imagen" | "video";
  buscar?: string;
  cursor?: string;
}): Promise<{ archivos: ArchivoShopify[]; cursor: string | null }> {
  const filtroTipo =
    opciones.tipo === "video" ? "media_type:VIDEO" : "media_type:IMAGE";
  const buscar = opciones.buscar?.trim();
  const query = buscar ? `${filtroTipo} AND ${buscar}` : filtroTipo;

  const data = await adminGraphQL<{
    files: {
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      nodes: Array<{
        __typename: string;
        fileStatus?: string;
        alt?: string | null;
        image?: { url: string } | null;
        sources?: { url: string; mimeType: string }[];
        preview?: { image?: { url: string } | null } | null;
      }>;
    };
  }>(
    `query($query: String!, $cursor: String) {
      files(first: 24, query: $query, after: $cursor, sortKey: CREATED_AT, reverse: true) {
        pageInfo { hasNextPage endCursor }
        nodes {
          __typename
          fileStatus
          alt
          ... on MediaImage { image { url } }
          ... on Video {
            sources { url mimeType }
            preview { image { url } }
          }
        }
      }
    }`,
    { query, cursor: opciones.cursor || null },
  );

  const archivos: ArchivoShopify[] = [];
  for (const nodo of data.files.nodes) {
    if (nodo.fileStatus && nodo.fileStatus !== "READY") continue;
    if (nodo.__typename === "MediaImage" && nodo.image?.url) {
      archivos.push({
        url: nodo.image.url,
        alt: nodo.alt ?? "",
        miniatura: nodo.image.url,
      });
    } else if (nodo.__typename === "Video") {
      const fuente =
        nodo.sources?.find((s) => s.mimeType === "video/mp4") ??
        nodo.sources?.[0];
      if (fuente) {
        archivos.push({
          url: fuente.url,
          alt: nodo.alt ?? "",
          miniatura: nodo.preview?.image?.url ?? "",
        });
      }
    }
  }

  return {
    archivos,
    cursor: data.files.pageInfo.hasNextPage ? data.files.pageInfo.endCursor : null,
  };
}

/** Paso 1: pide a Shopify una URL firmada para que el navegador suba directo. */
export async function prepararSubida(
  filename: string,
  mimeType: string,
  tamanoBytes: number,
): Promise<StagedTarget> {
  const esVideo = MIMES_VIDEO.has(mimeType);
  const data = await adminGraphQL<{
    stagedUploadsCreate: {
      stagedTargets: StagedTarget[];
      userErrors: { field: string; message: string }[];
    };
  }>(
    `mutation($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets { url resourceUrl parameters { name value } }
        userErrors { field message }
      }
    }`,
    {
      input: [
        {
          filename,
          mimeType,
          httpMethod: "POST",
          resource: esVideo ? "VIDEO" : "IMAGE",
          // Shopify exige el tamano exacto para videos.
          ...(esVideo ? { fileSize: String(tamanoBytes) } : {}),
        },
      ],
    },
  );

  const errores = data.stagedUploadsCreate.userErrors;
  if (errores.length) {
    throw new Error("stagedUploadsCreate: " + JSON.stringify(errores));
  }
  return data.stagedUploadsCreate.stagedTargets[0];
}

/**
 * Paso 2: registra el archivo ya subido y espera a que el CDN lo procese.
 * Devuelve la URL publica definitiva (cdn.shopify.com).
 */
export async function confirmarSubida(
  resourceUrl: string,
  mimeType: string,
  alt: string,
): Promise<string> {
  const esVideo = MIMES_VIDEO.has(mimeType);

  const creado = await adminGraphQL<{
    fileCreate: {
      files: { id: string }[];
      userErrors: { field: string; message: string }[];
    };
  }>(
    `mutation($files: [FileCreateInput!]!) {
      fileCreate(files: $files) {
        files { id }
        userErrors { field message }
      }
    }`,
    {
      files: [
        {
          originalSource: resourceUrl,
          contentType: esVideo ? "VIDEO" : "IMAGE",
          alt,
        },
      ],
    },
  );

  const errores = creado.fileCreate.userErrors;
  if (errores.length) {
    throw new Error("fileCreate: " + JSON.stringify(errores));
  }
  const fileId = creado.fileCreate.files[0].id;

  // Los videos tardan mas (Shopify los procesa); las imagenes suelen estar
  // listas en segundos.
  const intentos = esVideo ? 30 : 15;
  for (let i = 0; i < intentos; i++) {
    const data = await adminGraphQL<{ node: Record<string, unknown> | null }>(
      `query($id: ID!) {
        node(id: $id) {
          ... on MediaImage { fileStatus image { url } }
          ... on Video { fileStatus sources { url mimeType } }
        }
      }`,
      { id: fileId },
    );
    const nodo = data.node as
      | {
          fileStatus?: string;
          image?: { url?: string };
          sources?: { url: string; mimeType: string }[];
        }
      | null;

    if (nodo?.fileStatus === "READY") {
      const url = esVideo
        ? (nodo.sources?.find((s) => s.mimeType === "video/mp4") ?? nodo.sources?.[0])?.url
        : nodo.image?.url;
      if (url) return url;
    }
    if (nodo?.fileStatus === "FAILED") {
      throw new Error("Shopify no pudo procesar el archivo.");
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error("El archivo no quedo listo a tiempo. Intenta de nuevo.");
}

/**
 * Gemelo server-side del flujo del navegador (CampoArchivo): preparar →
 * POST al bucket → confirmar, pero con el archivo ya en memoria. Lo usa el
 * generador de secciones-imagen, donde la imagen nace en el servidor y
 * nunca pasa por el navegador. Devuelve la URL de cdn.shopify.com.
 */
export async function subirImagenBuffer(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  alt: string,
): Promise<string> {
  const target = await prepararSubida(filename, mimeType, buffer.length);

  const form = new FormData();
  // Los parametros firmados van ANTES del campo "file": el bucket de
  // Shopify (GCS) ignora los que lleguen despues.
  for (const p of target.parameters) form.append(p.name, p.value);
  // Se copia a Uint8Array porque el Buffer de Node puede apuntar a un
  // SharedArrayBuffer y el tipo BlobPart no lo acepta.
  form.append("file", new Blob([new Uint8Array(buffer)], { type: mimeType }), filename);

  const res = await fetch(target.url, { method: "POST", body: form });
  if (!res.ok) {
    throw new Error(
      `La subida al CDN fallo (${res.status}): ${(await res.text()).slice(0, 300)}`,
    );
  }

  return confirmarSubida(target.resourceUrl, mimeType, alt);
}

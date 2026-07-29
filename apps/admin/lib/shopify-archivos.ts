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

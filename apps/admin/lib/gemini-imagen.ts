/**
 * Cliente REST de la API de imagenes de Gemini para "Landing magica".
 *
 * fetch pelado, sin SDK: el repo no admite dependencias nuevas y la API
 * de generateContent es un solo POST con JSON.
 *
 * El nombre del modelo de imagen de Google cambia con frecuencia (y las
 * versiones viejas se apagan sin aviso), por eso GEMINI_IMAGE_MODEL existe:
 * si el default deja de responder, se cambia la env var en Vercel y queda
 * arreglado sin tocar codigo ni redeployar.
 */

const MODELO_POR_DEFECTO = "gemini-3-pro-image";

/** Error de cuota/rate limit: el llamador puede reintentar mas tarde. */
type ErrorReintentable = Error & { reintentable?: boolean };

export function tieneGeminiApiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

type RespuestaGemini = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
        // En la RESPUESTA viene camelCase, aunque en el request va snake_case.
        inlineData?: { mimeType?: string; data?: string };
      }>;
    };
  }>;
  error?: { message?: string };
};

export async function generarImagenSeccion(args: {
  prompt: string;
  /** Plantilla de layout primero, luego fotos del producto. Maximo 4. */
  referencias: { mimeType: string; dataB64: string }[];
  aspectRatio?: "9:16" | "3:4" | "4:5";
  imageSize?: "1K" | "2K";
}): Promise<{ dataB64: string; mimeType: string }> {
  const modelo = process.env.GEMINI_IMAGE_MODEL || MODELO_POR_DEFECTO;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Falta GEMINI_API_KEY en el servidor.");

  const partes: Array<Record<string, unknown>> = [{ text: args.prompt }];
  for (const ref of args.referencias.slice(0, 4)) {
    partes.push({
      inline_data: { mime_type: ref.mimeType, data: ref.dataB64 },
    });
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: partes }],
        generationConfig: {
          responseModalities: ["IMAGE"],
          imageConfig: {
            aspectRatio: args.aspectRatio ?? "9:16",
            imageSize: args.imageSize ?? "2K",
          },
        },
      }),
    },
  );

  const cuerpo = await res.text();
  let json: RespuestaGemini;
  try {
    json = JSON.parse(cuerpo) as RespuestaGemini;
  } catch {
    json = {};
  }

  if (res.status === 429) {
    const espera = res.headers.get("retry-after");
    const error: ErrorReintentable = new Error(
      "Gemini esta limitando las peticiones (cuota agotada)." +
        (espera ? ` Reintenta en ${espera} segundos.` : " Reintenta en unos minutos."),
    );
    error.reintentable = true;
    throw error;
  }

  if (!res.ok) {
    throw new Error(
      `Gemini respondio ${res.status}: ${json.error?.message ?? cuerpo.slice(0, 300)}`,
    );
  }

  const partesRespuesta = json.candidates?.[0]?.content?.parts ?? [];
  const imagen = partesRespuesta.find((p) => p.inlineData?.data);
  if (imagen?.inlineData?.data) {
    return {
      dataB64: imagen.inlineData.data,
      mimeType: imagen.inlineData.mimeType || "image/png",
    };
  }

  // Sin imagen: normalmente el modelo devolvio texto explicando por que se
  // nego (filtros de seguridad, prompt rechazado). Ese texto es el error util.
  const texto = partesRespuesta
    .map((p) => p.text)
    .filter(Boolean)
    .join(" ")
    .trim();
  throw new Error(
    "Gemini no devolvio imagen. " + (texto ? texto.slice(0, 300) : cuerpo.slice(0, 300)),
  );
}

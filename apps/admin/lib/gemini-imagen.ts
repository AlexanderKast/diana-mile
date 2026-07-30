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

/**
 * Modelo de TEXTO (con vision) para describir una maqueta antes de escribir
 * su copy. Deliberadamente distinto de GEMINI_IMAGE_MODEL: es una llamada de
 * solo-texto, mucho mas barata, y el modelo de imagen no siempre acepta
 * responseModalities: ["TEXT"].
 */
const MODELO_VISION_POR_DEFECTO = "gemini-2.5-flash";

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

  let res: Response;
  try {
    res = await fetch(
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
  } catch (causa) {
    // Fetch que ni siquiera llega a responder (ECONNRESET, timeout de red):
    // no es culpa del prompt ni de la cuota, es la red cayendose a mitad de
    // una llamada de 20-30s. Vale la pena reintentar igual que un 429.
    const error: ErrorReintentable = new Error(
      "No se pudo conectar con Gemini (falla de red). Reintenta en unos segundos.",
    );
    error.reintentable = true;
    error.cause = causa;
    throw error;
  }

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

  // 500/502/503/504: casi siempre "modelo saturado, reintenta" del lado de
  // Google (lo vimos en vivo probando la key), no un prompt roto — un fallo
  // de verdad en el prompt vuelve 400, no 5xx.
  if (res.status >= 500) {
    const error: ErrorReintentable = new Error(
      `Gemini respondio ${res.status} (servidor saturado): ${json.error?.message ?? cuerpo.slice(0, 200)}`,
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

/**
 * "Lee" una maqueta de referencia y la traduce a una guia de texto: cuantos
 * bloques trae, cuanto espacio tiene cada uno, cuantas palabras caben. El
 * copy (Mistral, sin vision) usa esa guia para escribir un texto que quepa
 * en ESA estructura en vez de escribir a ciegas y descubrir despues, en la
 * imagen, que no cabia.
 *
 * Se le pide explicitamente ignorar el CONTENIDO de la maqueta (marca,
 * fotos, texto real) y describir solo su estructura: la referencia es
 * inspiracion de composicion, nunca de contenido (ver AGENTS.md).
 */
export async function describirReferenciaSeccion(args: {
  referencia: { mimeType: string; dataB64: string };
  tipo: string;
}): Promise<string> {
  const modelo = process.env.GEMINI_VISION_MODEL || MODELO_VISION_POR_DEFECTO;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Falta GEMINI_API_KEY en el servidor.");

  const prompt = `Estas viendo la MAQUETA de referencia (layout de composicion) para una seccion publicitaria vertical tipo "${args.tipo}" de una landing de e-commerce.

Describe en espanol, en un parrafo corto (maximo 80 palabras), UNICAMENTE la estructura de texto de la maqueta — ignora su contenido real (marca, fotos, texto, colores):
- Cuantos bloques de texto hay y en que orden, de arriba a abajo.
- Cuanto espacio (relativo) tiene cada bloque: da una cantidad de palabras aproximada que cabe bien en cada uno (ej. "titular de 4 a 6 palabras", "3 bullets cortos de 4 a 5 palabras cada uno", "sin espacio para subtitulo").
- Si hay boton y si hay bloque de precio.

Esto se lo vas a entregar a un copywriter que no ve la imagen: se concreto con las cantidades para que el texto que escriba quepa sin verse apretado ni sobrar espacio.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: args.referencia.mimeType,
                  data: args.referencia.dataB64,
                },
              },
            ],
          },
        ],
        generationConfig: { responseModalities: ["TEXT"] },
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
      `Gemini (vision) respondio ${res.status}: ${json.error?.message ?? cuerpo.slice(0, 300)}`,
    );
  }

  const texto = (json.candidates?.[0]?.content?.parts ?? [])
    .map((p) => p.text)
    .filter(Boolean)
    .join(" ")
    .trim();
  if (!texto) throw new Error("Gemini no devolvio descripcion de la maqueta.");
  return texto;
}

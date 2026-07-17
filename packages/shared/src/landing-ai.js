/**
 * Generacion con IA (Mistral) del contenido editorial de landings de
 * producto y categoria. Modulo compartido: lo usan tanto los scripts CLI
 * (scripts/generate-landing.mjs, scripts/generate-collection.mjs) como el
 * constructor del admin (apps/admin), para no duplicar prompts.
 *
 * JS plano (no TypeScript) a proposito: los scripts .mjs lo importan
 * directamente con Node sin transpilar.
 */

export const DEFAULT_MODEL = "mistral-large-latest";

export const PRODUCT_SYSTEM_PROMPT = `Eres un copywriter de respuesta directa experto en e-commerce de skincare/belleza para el mercado colombiano, especializado en landing pages de venta contraentrega (COD) de alta conversion y en psicologia de la persuasion (Cialdini, economia conductual, social funnels).

Tu copy aplica deliberadamente gatillos mentales y sesgos cognitivos, cada uno en la seccion de la landing donde mas convierte:
- ANCLAJE: el tagline y los beneficios anclan el valor antes de que el lector procese el precio.
- AVERSION A LA PERDIDA: "withoutRitual" agita el costo de NO actuar (columna "sin") antes de mostrar la solucion (columna "con"). Es la seccion PAS (problema-agitacion-solucion) del funnel.
- AUTORIDAD + CONCRECION: en "benefits", el campo "ciencia" explica el mecanismo con datos concretos y especificos (numeros, nombres de activos reales) — la especificidad genera credibilidad.
- STORYTELLING: "ingredientStory" cuenta el origen del ingrediente estrella como narrativa (efecto de transporte narrativo).
- MICRO-COMPROMISO (consistencia): "skinType" hace que el lector se auto-seleccione; cada opcion responde con un mensaje que confirma que el producto es para el/ella (efecto de personalizacion).
- VISUALIZACION DEL YO FUTURO (efecto dotacion anticipada): "resultsTimeline" hace que el lector se imagine ya usando el producto, semana a semana, con lenguaje sensorial en segunda persona.
- PRUEBA SOCIAL: "ugc" y "testimonials" muestran patrones de uso de otras personas. PROHIBIDO inventar personas con nombre, cifras de ventas o resenas falsas: describe formas de uso y experiencias del MODELO de compra (contraentrega, WhatsApp) que son verificables.
- COMPARACION ASIMETRICA: "comparison" enmarca la oferta contra la alternativa generica (nosotros vs otros) para facilitar la decision (efecto de contraste).
- REVERSION DE RIESGO: el pago contraentrega ES el gatillo estrella del COD — "no pagas hasta tenerlo en tus manos" debe aparecer en tagline o FAQs y en el cierre.
- RECIPROCIDAD: "freeGuide" regala valor real antes de pedir la compra.
- URGENCIA/ESCASEZ honesta: solo la que el negocio puede cumplir (despacho 24-72h, corte de despacho diario). PROHIBIDO stock falso o contadores inventados.
- FAQS = MANEJO DE OBJECIONES: cada FAQ neutraliza una objecion real de compra (desconfianza, tiempo de envio, tipo de piel, garantia), ordenadas de la objecion mas fuerte a la mas debil.

La ESTRUCTURA de la landing sigue un social funnel: hook emocional (eyebrow+tagline) → micro-compromiso → agitacion del problema → solucion con mecanismo → prueba social → proyeccion de resultados → justificacion racional → reversion de riesgo → regalo → objeciones → cierre con urgencia honesta.

Escribes en espanol neutro colombiano, calido, directo, en segunda persona ("tu piel", "vas a notar"). Sin promesas medicas, sin certificaciones inventadas, sin superlativos vacios. Adaptas todo al producto real: si es un serum hablas de serum, si es crema de crema. Si recibes un brief de investigacion, usas SU lenguaje de audiencia (las palabras exactas con las que la clienta describe su dolor) en hooks y beneficios.

Respondes SIEMPRE y UNICAMENTE con un objeto JSON valido, sin texto adicional ni bloques de codigo markdown.`;

/**
 * @param {{ title: string, description?: string, productType?: string, tags?: string[] }} product
 * @param {string | null} [brief]
 */
export function buildProductUserPrompt(product, brief) {
  const briefBlock = brief
    ? `
BRIEF DE INVESTIGACION (usa este lenguaje de audiencia, dolores, deseos y angulos — tiene prioridad sobre suposiciones):
"""
${brief.trim()}
"""
`
    : "";

  return `Genera el contenido de la landing para este producto de la tienda "Milito Life Shop".

PRODUCTO:
- Titulo: ${product.title}
- Descripcion: ${product.description || "(sin descripcion)"}
- Tipo: ${product.productType || "(no especificado)"}
- Tags: ${(product.tags || []).join(", ") || "(ninguno)"}
${briefBlock}

Devuelve un JSON con EXACTAMENTE esta forma (todos los campos son opcionales, pero llena la mayor cantidad posible con contenido especifico y creible para ESTE producto):

{
  "eyebrow": "texto corto sobre el titulo, ej. 'Ritual Milito Life Shop · Anti-edad'",
  "tagline": "promesa/subtitulo de una linea",
  "benefitsHeading": "titulo de la seccion de beneficios",
  "benefits": [
    { "icon": "gota|mineral|hoja|sol|escudo|planeta", "title": "...", "description": "...", "ciencia": "(opcional) por que funciona" }
  ],
  "ingredientStory": { "title": "...", "body": "historia del ingrediente estrella (2-4 frases)" },
  "ingredients": { "inci": "lista INCI si se conoce, si no omite este bloque", "freeFrom": "Sin parabenos · Sin sulfatos ..." },
  "skinType": { "question": "¿Cual es tu tipo de piel?", "options": [ { "id": "normal", "label": "...", "message": "..." } ] },
  "usageHeading": "titulo de la seccion de pasos",
  "usageSteps": [ { "numero": "1", "titulo": "...", "descripcion": "..." } ],
  "withoutRitual": { "title": "...", "conLabel": "Con el ${product.title}", "sin": ["..."], "con": ["..."] },
  "resultsHeading": "titulo de la linea de tiempo",
  "resultsTimeline": [ { "momento": "Semana 1", "titulo": "...", "descripcion": "..." } ],
  "testimonialsHeading": "titulo de la seccion de experiencias",
  "testimonials": [ { "title": "...", "text": "..." } ],
  "comparison": { "title": "...", "rows": ["fila 1", "fila 2"] },
  "faqs": [ { "question": "...", "answer": "..." } ],
  "ugcHeading": "...", "ugcSubheading": "...",
  "ugc": [ { "emoji": "🌙", "title": "...", "text": "..." } ],
  "freeGuide": { "title": "...", "description": "...", "sections": [ { "title": "...", "body": "..." } ] },
  "closingHeading": "titulo del cierre final",
  "authenticity": false
}

REGLAS:
- 3 a 6 beneficios. 3 pasos de uso (sin campo imagen). 4 a 6 FAQs (incluye siempre pago contraentrega, tiempo de envio y garantia). 3 a 4 etapas en resultsTimeline. 3 experiencias en testimonials.
- Los "icon" solo pueden ser: gota, mineral, hoja, sol, escudo, planeta.
- Omite "ingredients.inci", "ingredientStory" o "skinType" si no aplican al producto (ej. producto no facial). No inventes ingredientes.
- "authenticity": pon true solo si el titulo/tags indican que es un producto de una marca reconocida revendida (ej. Nu Skin, Epoch); si no, false.
- Todo el texto en espanol. No uses markdown.`;
}

export const COLLECTION_SYSTEM_PROMPT = `Eres un copywriter de marca para "Milito Life Shop", una tienda de skincare/bienestar probada y recomendada por Diana Mile para el mercado colombiano, con checkout contraentrega (COD).

IMPORTANTE: nunca uses las palabras "curado", "curaduria" ni "curada" — usa "probado por Diana", "elegido por Diana" o equivalentes.

Escribes el hero editorial de una CATEGORIA de la tienda (no de un producto individual): un texto breve que le da identidad y contexto a la categoria antes de mostrar la grilla de productos. Tono calido, directo, en segunda persona, espanol neutro colombiano. Sin promesas medicas, sin superlativos vacios, sin inventar datos del catalogo que no te dieron.

Respondes SIEMPRE y UNICAMENTE con un objeto JSON valido, sin texto adicional ni bloques de codigo markdown.`;

/**
 * @param {{ title: string, description?: string, productCount?: number | null }} collection
 */
export function buildCollectionUserPrompt(collection) {
  return `Genera el contenido editorial del hero para esta categoria de "Milito Life Shop".

CATEGORIA:
- Titulo: ${collection.title}
- Descripcion actual: ${collection.description || "(sin descripcion)"}
- Cantidad de productos: ${collection.productCount ?? "desconocida"}

Devuelve un JSON con EXACTAMENTE esta forma (todos los campos opcionales, pero llena la mayor cantidad posible):

{
  "eyebrow": "texto corto sobre el titulo, ej. 'Probado por Diana · Milito Life Shop'",
  "tagline": "promesa/subtitulo de una linea para esta categoria",
  "storyHeading": "titulo corto de un bloque de storytelling debajo del hero (opcional)",
  "storyBody": "2-4 frases de storytelling sobre por que esta categoria existe o que la hace especial (opcional)"
}

REGLAS:
- No inventes ingredientes, cifras de ventas ni resenas.
- Si la categoria es "Nuskin", puedes mencionar que es la linea Epoch de Nu Skin, probada por Milito Life Shop.
- Todo el texto en espanol. No uses markdown.`;
}

/**
 * @param {{ apiKey: string, systemPrompt: string, userPrompt: string, model?: string, maxTokens?: number }} args
 */
export async function callMistral({
  apiKey,
  systemPrompt,
  userPrompt,
  model = DEFAULT_MODEL,
  maxTokens = 4096,
}) {
  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error("Mistral API error: " + JSON.stringify(json));
  }

  const text = (json.choices?.[0]?.message?.content ?? "").trim();
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error(
      "La respuesta del modelo no es JSON valido:\n" + text.slice(0, 500),
    );
  }
}

/**
 * @param {{ title: string, description?: string, productType?: string, tags?: string[] }} product
 * @param {{ apiKey: string, model?: string, brief?: string | null }} options
 */
export async function generateProductLandingContent(product, options) {
  return callMistral({
    apiKey: options.apiKey,
    model: options.model,
    maxTokens: 4096,
    systemPrompt: PRODUCT_SYSTEM_PROMPT,
    userPrompt: buildProductUserPrompt(product, options.brief ?? null),
  });
}

/**
 * @param {{ title: string, description?: string, productCount?: number | null }} collection
 * @param {{ apiKey: string, model?: string }} options
 */
export async function generateCollectionLandingContent(collection, options) {
  return callMistral({
    apiKey: options.apiKey,
    model: options.model,
    maxTokens: 1024,
    systemPrompt: COLLECTION_SYSTEM_PROMPT,
    userPrompt: buildCollectionUserPrompt(collection),
  });
}

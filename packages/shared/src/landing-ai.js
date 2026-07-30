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

// ── Landing magica: copy exacto por seccion-imagen ──────────────────────
//
// El copy que va RENDERIZADO DENTRO de las imagenes publicitarias (estilo
// ecom-magic). El modelo de imagen recibe estos textos literales entre
// comillas y los dibuja caracter por caracter — por eso deben ser cortos,
// exactos y con ortografia perfecta. Nunca dejar que el modelo de imagen
// redacte el espanol.

export const TIPOS_SECCION_MAGICA = [
  { tipo: "hero", proposito: "Gancho emocional: el dolor/deseo principal en una frase potente + el producto como protagonista." },
  { tipo: "oferta", proposito: "El precio REAL y los packs con su ahorro REAL (se te dan las cifras; no inventes ninguna)." },
  { tipo: "beneficios", proposito: "3-4 beneficios concretos y creibles, cada uno en pocas palabras." },
  { tipo: "comparativa", proposito: "Comprar con Milito (contraentrega, original, asesoria por WhatsApp) vs comprar a un vendedor generico. Sobre el MODELO de compra, no sobre resultados." },
  { tipo: "autoridad", proposito: "Respaldo real: producto original de Nu Skin, fabricante con decadas de trayectoria. El volumen es de Nu Skin, nunca de la tienda." },
  { tipo: "uso", proposito: "3 pasos simples de uso, numerados, una linea cada uno." },
  { tipo: "sensorial", proposito: "La experiencia de usarlo: textura, aroma, ritual. PROHIBIDO prometer resultados o antes/despues." },
  { tipo: "logistica", proposito: "Contraentrega (pagas al recibir), envio 24-72h, y la garantia real: llega malo o no funciona, se repone sin costo." },
  { tipo: "faq", proposito: "4 preguntas frecuentes MUY cortas con respuestas de una linea (desconfianza, envio, pago, tipo de piel)." },
];

export const SECCIONES_SYSTEM_PROMPT = `Eres un copywriter de respuesta directa experto en e-commerce contraentrega colombiano (tienda "Milito Life Shop", productos originales de Nu Skin). Escribes el texto EXACTO que ira dibujado dentro de imagenes publicitarias verticales de una landing.

REGLAS DURAS (violarlas invalida la respuesta):
- PROHIBIDO: escasez o urgencia fabricada (contadores, "solo quedan X", "solo hoy"), testimonios o personas inventadas, resenas falsas, cifras de ventas inventadas, claims de salud o promesas de resultado sobre cosmetica, precios o descuentos que no esten en los datos que se te dan.
- La unica urgencia permitida es el corte real de despacho (pide hoy y sale hoy/manana).
- El volumen y la trayectoria se atribuyen a Nu Skin (el fabricante), nunca a la tienda.
- La marca visible es "Milito" o "Milito Life Shop", jamas "Diana".
- Espanol de Colombia impecable, con todas sus tildes. Cada texto CORTO: los titulares maximo 8 palabras, los bullets maximo 7 palabras — van renderizados en una imagen y el espacio es limitado.

Respondes SIEMPRE y UNICAMENTE con un objeto JSON valido, sin markdown.`;

/**
 * @param {{ title: string, description?: string, productType?: string, tags?: string[] }} product
 * @param {{ brief?: string | null, secciones: string[], precios?: string | null }} datos
 */
export function buildSeccionesUserPrompt(product, datos) {
  const briefBlock = datos.brief
    ? `\nBRIEF (lenguaje de audiencia, tiene prioridad):\n"""\n${datos.brief.trim()}\n"""\n`
    : "";
  const preciosBlock = datos.precios
    ? `\nPRECIOS REALES (usa SOLO estas cifras, formateadas como $89.700):\n${datos.precios}\n`
    : "";
  const seleccion = TIPOS_SECCION_MAGICA.filter((s) =>
    datos.secciones.includes(s.tipo),
  );

  return `Escribe el copy de estas secciones-imagen para la landing del producto:

PRODUCTO:
- Titulo: ${product.title}
- Descripcion: ${product.description || "(sin descripcion)"}
- Tipo: ${product.productType || "(no especificado)"}
${briefBlock}${preciosBlock}
SECCIONES PEDIDAS (una entrada por cada una):
${seleccion.map((s) => `- "${s.tipo}": ${s.proposito}`).join("\n")}

Devuelve JSON con EXACTAMENTE esta forma:
{
  "secciones": [
    {
      "tipo": "hero",
      "titular": "string corto y potente",
      "subtitular": "string opcional, una linea",
      "bullets": ["maximo 4, cortos"],
      "cta": "texto de boton opcional",
      "precio_texto": "solo en 'oferta', con las cifras reales",
      "notas_visuales": "direccion de arte en una frase: que mostrar, que ambiente"
    }
  ]
}

Todo en espanol con tildes correctas. Sin markdown.`;
}

/**
 * @param {{ title: string, description?: string, productType?: string, tags?: string[] }} product
 * @param {{ apiKey: string, model?: string, brief?: string | null, secciones: string[], precios?: string | null }} options
 */
export async function generateCopySecciones(product, options) {
  return callMistral({
    apiKey: options.apiKey,
    model: options.model,
    maxTokens: 3072,
    systemPrompt: SECCIONES_SYSTEM_PROMPT,
    userPrompt: buildSeccionesUserPrompt(product, {
      brief: options.brief ?? null,
      secciones: options.secciones,
      precios: options.precios ?? null,
    }),
  });
}

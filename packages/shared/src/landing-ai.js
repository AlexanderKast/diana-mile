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
  { tipo: "testimonios", proposito: "Tarjetas con testimonios REALES ya entregados; se transcriben literales, jamas se inventan ni se completan." },
  { tipo: "antes_despues", proposito: "Composicion con fotos reales de clientas o material oficial del fabricante; describe lo que se ve, sin prometer resultados." },
  { tipo: "logistica", proposito: "Contraentrega (pagas al recibir), envio 24-72h, y la garantia real: llega malo o no funciona, se repone sin costo." },
  { tipo: "faq", proposito: "4 preguntas frecuentes MUY cortas con respuestas de una linea (desconfianza, envio, pago, tipo de piel)." },
];

export const SECCIONES_SYSTEM_PROMPT = `Eres un copywriter de respuesta directa experto en e-commerce contraentrega colombiano (tienda "Milito Life Shop", productos originales de Nu Skin). Escribes el texto EXACTO que ira dibujado dentro de imagenes publicitarias verticales de una landing.

REGLAS DURAS (violarlas invalida la respuesta):
- PROHIBIDO: escasez o urgencia fabricada (contadores, "solo quedan X", "solo hoy"), testimonios o personas inventadas, resenas falsas, cifras de ventas inventadas, claims de salud o promesas de resultado sobre cosmetica, precios o descuentos que no esten en los datos que se te dan.
- La unica urgencia permitida es el corte real de despacho (pide hoy y sale hoy/manana).
- PROHIBIDO inventar condiciones comerciales: envio gratis, umbrales de compra minima, regalos, cupones, garantias de devolucion del dinero o plazos de entrega. Si no te lo dieron en los datos, NO EXISTE. Reincidencia detectada: el modelo se inventa un "envio gratis desde $X" que la tienda no ofrece.
- El volumen y la trayectoria se atribuyen a Nu Skin (el fabricante), nunca a la tienda, y solo con cifras que te hayan dado. PROHIBIDO redondear anos de trayectoria o escribir "millones de clientes" si nadie te dio esa cifra.
- La marca visible es "Milito" o "Milito Life Shop", jamas "Diana".
- Espanol de Colombia impecable, con todas sus tildes. Cada texto CORTO: los titulares maximo 8 palabras, los bullets maximo 7 palabras — van renderizados en una imagen y el espacio es limitado.

TONO: respuesta directa, no catalogo. El titular es un GANCHO que le habla a ella de tu a tu sobre su problema concreto — no el nombre de la seccion ("Preguntas frecuentes", "Beneficios" y "Respaldado por X" son titulares muertos). Verbo en segunda persona, especifico y con tension. Los bullets empiezan con verbo o con el beneficio, nunca con relleno. El CTA es una orden clara, no una invitacion tibia. Vende fuerte con lo que SI es verdad: contraentrega, producto original, asesoria — la fuerza sale de la especificidad, jamas de inventar.

Respondes SIEMPRE y UNICAMENTE con un objeto JSON valido, sin markdown.`;

/**
 * El angulo, si lo hay, va ANTES que el producto: es desde donde se escribe
 * todo el copy. La ficha de Shopify solo aporta los datos duros.
 *
 * @param {Record<string, unknown> | null | undefined} angulo
 */
function bloqueAngulo(angulo) {
  if (!angulo) return "";

  const campos = [
    // El nombre del angulo va primero y como titulo: es el enfoque que se
    // pidio, y el copy de TODAS las secciones tiene que hablar de eso.
    ["ENFOQUE DE ESTA LANDING", angulo.nombre],
    ["Angulo de venta", angulo.angulo_venta],
    ["Problema de la clienta", angulo.problema],
    ["Avatar", angulo.avatar],
    ["Resultado que ella desea", angulo.resultado_deseado],
    ["Solucion ideal", angulo.solucion_ideal],
    ["Mecanismo unico", angulo.mecanismo_unico],
  ].filter(([, valor]) => typeof valor === "string" && valor.trim());

  const paisVenta =
    typeof angulo.pais_venta === "string" && angulo.pais_venta.trim()
      ? angulo.pais_venta.trim()
      : null;
  const paisLogistica =
    typeof angulo.pais_logistica === "string" && angulo.pais_logistica.trim()
      ? angulo.pais_logistica.trim()
      : null;
  if (paisVenta) {
    campos.push([
      "Pais",
      paisLogistica && paisLogistica !== paisVenta
        ? `se vende en ${paisVenta}, se despacha desde ${paisLogistica}`
        : `se vende y se despacha en ${paisVenta}`,
    ]);
  }

  if (!campos.length) return "";

  return `ANGULO DE VENTA (manda sobre todo lo demas: el copy entero se escribe desde aqui):
${campos.map(([etiqueta, valor]) => `- ${etiqueta}: ${String(valor).trim()}`).join("\n")}

`;
}

/**
 * @param {{ title: string, description?: string, productType?: string, tags?: string[] }} product
 * @param {{ brief?: string | null, secciones: string[], precios?: string | null, angulo?: Record<string, unknown> | null }} datos
 */
export function buildSeccionesUserPrompt(product, datos) {
  const anguloBlock = bloqueAngulo(datos.angulo);
  const briefBlock = datos.brief
    ? `\nBRIEF (lenguaje de audiencia, tiene prioridad):\n"""\n${datos.brief.trim()}\n"""\n`
    : "";
  const preciosBlock = datos.precios
    ? `\nPRECIOS REALES (usa SOLO estas cifras, formateadas como $89.700):\n${datos.precios}\n`
    : "";
  const seleccion = TIPOS_SECCION_MAGICA.filter((s) =>
    datos.secciones.includes(s.tipo),
  );

  return `${anguloBlock}Escribe el copy de estas secciones-imagen para la landing del producto:

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
 * @param {{ apiKey: string, model?: string, brief?: string | null, secciones: string[], precios?: string | null, angulo?: Record<string, unknown> | null }} options
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
      angulo: options.angulo ?? null,
    }),
  });
}

// ── Angulo de venta: el brief estrategico ───────────────────────────────
//
// Esto NO escribe copy. Escribe el brief interno con el que despues se
// escribe el copy: a quien le hablamos, que le duele, que desea, por que
// este producto. Se genera una vez por angulo y se edita a mano; el copy
// de cada seccion se genera muchas veces a partir de el.

export const ANGULO_SYSTEM_PROMPT = `Eres un estratega de marketing directo para venta contraentrega (COD) en Colombia. Trabajas para "Milito Life Shop", una tienda que vende productos ORIGINALES de Nu Skin con pago contraentrega.

Tu trabajo es escribir el BRIEF ESTRATEGICO interno de un producto: la materia prima con la que despues otro escribira el copy. NO escribes copy, ni titulares, ni frases publicitarias. Escribes analisis: quien es la clienta, que le pasa, que quiere, por que este producto le sirve y que lo hace distinto.

REGLAS DURAS (violarlas invalida la respuesta):
- PROHIBIDO inventar: testimonios, personas, nombres, cifras de ventas, numero de clientas, estudios, porcentajes de eficacia, certificaciones, premios, ingredientes que no aparezcan en los datos que se te dan, y precios o descuentos distintos de los que se te dan.
- PROHIBIDO cualquier claim de salud y cualquier promesa de resultado. El campo "resultado_deseado" es lo que la clienta DESEA, redactado como deseo de ella ("quiere volver a verse la piel pareja"), jamas como promesa de la marca ("tu piel quedara pareja").
- PROHIBIDA la escasez o urgencia fabricada (contadores, "solo quedan X", "solo por hoy"). La unica urgencia real es el corte de despacho.
- El volumen, la trayectoria y el respaldo cientifico son de Nu Skin, el fabricante — nunca de la tienda. La tienda solo reclama lo suyo: producto original, contraentrega, cobertura y acompanamiento por WhatsApp.
- La marca visible es "Milito" o "Milito Life Shop". Jamas "Diana".
- Mercado Colombia, espanol de Colombia impecable CON TODAS SUS TILDES, precios en pesos colombianos (COP).
- Cada campo: maximo 700 caracteres, en prosa corrida. Sin markdown, sin vinetas, sin numeracion, sin titulos.

Respondes SIEMPRE y UNICAMENTE con un objeto JSON valido, sin texto adicional ni bloques de codigo markdown.`;

/**
 * @param {{ title: string, description?: string, productType?: string, tags?: string[] }} product
 * @param {{ parcial?: Record<string, unknown> | null, precios?: string | null, nombreAngulo?: string | null }} datos
 */
export function buildAnguloUserPrompt(product, datos) {
  const preciosBlock = datos.precios
    ? `\nPRECIOS REALES (las unicas cifras que puedes mencionar):\n${datos.precios}\n`
    : "";

  // El nombre del angulo es la ENTRADA principal: no es una etiqueta para
  // ordenar la lista, es la instruccion de por donde se ataca el producto.
  // Un mismo exfoliante vendido por "piel aspera en brazos" o por "codos
  // oscuros" son dos landings distintas, y todo el brief tiene que girar
  // sobre el que se pidio.
  const anguloBlock = datos.nombreAngulo
    ? `\nANGULO QUE SE PIDIO — es el EJE de todo el brief: "${datos.nombreAngulo.trim()}"
Todos los campos deben desarrollar ESTE angulo en concreto (el problema, la
clienta, el deseo y el mecanismo se escriben para el). No escribas un brief
generico del producto: si el angulo habla de un uso o una zona especifica,
el brief entero va de eso. Si el angulo no encaja con lo que el producto
realmente hace segun los datos, ajustalo a lo que si es cierto en vez de
inventar propiedades.\n`
    : "";

  // Lo que el admin ya escribio manda. El modelo rellena huecos, no
  // reescribe: si pisara lo tecleado, cada prellenado borraria el criterio
  // de quien conoce el producto.
  const escritos = Object.entries(datos.parcial ?? {}).filter(
    ([, valor]) => typeof valor === "string" && valor.trim(),
  );
  const parcialBlock = escritos.length
    ? `\nLO QUE EL ADMIN YA ESCRIBIO (tiene PRIORIDAD y NO debe reescribirse — devuelvelo TAL CUAL y limitate a rellenar los campos vacios de forma coherente con esto):\n${escritos
        .map(([campo, valor]) => `- ${campo}: ${String(valor).trim()}`)
        .join("\n")}\n`
    : "";

  return `Escribe el brief estrategico de este producto de "Milito Life Shop".

PRODUCTO:
- Titulo: ${product.title}
- Descripcion: ${product.description || "(sin descripcion)"}
- Tipo: ${product.productType || "(no especificado)"}
- Tags: ${(product.tags || []).join(", ") || "(ninguno)"}
${anguloBlock}${preciosBlock}${parcialBlock}
Devuelve un JSON con EXACTAMENTE estos 7 campos, todos string:

{
  "angulo_venta": "el enfoque comercial con el que se vende este producto: por cual de sus usos se ataca y por que ese y no otro",
  "problema": "la situacion concreta que vive hoy la clienta y que la haria buscar este producto",
  "avatar": "quien es ella: edad, momento de vida, contexto colombiano, como compra, que le genera desconfianza",
  "resultado_deseado": "lo que ELLA desea lograr, redactado como deseo suyo, nunca como promesa de la marca",
  "solucion_ideal": "que caracteristicas tendria para ella la solucion perfecta, y como este producto se acerca",
  "mecanismo_unico": "que hace distinto a este producto segun la informacion real disponible: formulacion, origen, respaldo del fabricante Nu Skin, modelo de compra contraentrega",
  "detalles_producto": "descripcion factual del producto: que es, que contiene segun los datos dados, presentacion, como se usa"
}

Maximo 700 caracteres por campo. Todo en espanol de Colombia con tildes. Sin markdown.`;
}

/**
 * @param {{ title: string, description?: string, productType?: string, tags?: string[] }} product
 * @param {{ apiKey: string, model?: string, parcial?: Record<string, unknown> | null, precios?: string | null, nombreAngulo?: string | null }} options
 */
export async function generateAnguloVenta(product, options) {
  return callMistral({
    apiKey: options.apiKey,
    model: options.model,
    maxTokens: 3072,
    systemPrompt: ANGULO_SYSTEM_PROMPT,
    userPrompt: buildAnguloUserPrompt(product, {
      parcial: options.parcial ?? null,
      precios: options.precios ?? null,
      nombreAngulo: options.nombreAngulo ?? null,
    }),
  });
}

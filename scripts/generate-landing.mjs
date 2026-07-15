#!/usr/bin/env node
/**
 * Genera el contenido de la landing de un producto con IA y lo guarda en el
 * metafield `diana_mile.landing_content` de Shopify. Ese metafield es lo que
 * la tienda (apps/shop) lee para armar una landing UNICA por producto.
 *
 * Uso:
 *   node scripts/generate-landing.mjs <handle>       # un producto
 *   node scripts/generate-landing.mjs --all          # todos los que no tengan contenido
 *   node scripts/generate-landing.mjs --all --force  # regenera aunque ya tengan
 *   node scripts/generate-landing.mjs <handle> --dry # imprime el JSON, no escribe
 *   node scripts/generate-landing.mjs <handle> --brief docs/briefs/<handle>.md
 *       # inyecta un brief de investigacion (lenguaje de audiencia, dolores,
 *       # angulos, competencia) al prompt — lo produce la skill /crear-producto
 *
 * Env requeridas (se leen de apps/shop/.env.local si existe, o del entorno):
 *   SHOPIFY_STORE_DOMAIN        ej. milito-life.myshopify.com
 *   SHOPIFY_ADMIN_API_TOKEN     token Admin API con write_products
 *   ANTHROPIC_API_KEY           clave de la API de Claude
 *   LANDING_MODEL (opcional)    default: claude-sonnet-5
 */

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// --- Carga simple de .env.local (sin dependencias) -----------------------
function loadEnv(path) {
  if (!existsSync(path)) return;
  for (const rawLine of readFileSync(path, "utf8").split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadEnv(join(ROOT, "apps/shop/.env.local"));
loadEnv(join(ROOT, ".env.local"));

const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.LANDING_MODEL || "claude-sonnet-5";
const API_VERSION = "2024-01";

const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const ALL = args.includes("--all");
const FORCE = args.includes("--force");

// --brief <ruta>: brief de investigación (markdown/texto) que se inyecta al
// prompt para que el copy use datos reales de mercado, audiencia y ángulos.
const briefIdx = args.indexOf("--brief");
const briefPath = briefIdx !== -1 ? args[briefIdx + 1] : null;
const BRIEF =
  briefPath && existsSync(briefPath) ? readFileSync(briefPath, "utf8") : null;
if (briefPath && !BRIEF) {
  console.error(`No se pudo leer el brief: ${briefPath}`);
  process.exit(1);
}

const handleArg = args.find(
  (a) => !a.startsWith("--") && a !== briefPath,
);

function requireEnv() {
  const missing = [];
  if (!STORE_DOMAIN) missing.push("SHOPIFY_STORE_DOMAIN");
  if (!ADMIN_TOKEN) missing.push("SHOPIFY_ADMIN_API_TOKEN");
  if (!ANTHROPIC_API_KEY) missing.push("ANTHROPIC_API_KEY");
  if (missing.length) {
    console.error("Faltan variables de entorno: " + missing.join(", "));
    process.exit(1);
  }
}

// --- Shopify Admin GraphQL ------------------------------------------------
async function adminGraphQL(query, variables) {
  const res = await fetch(
    `https://${STORE_DOMAIN}/admin/api/${API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": ADMIN_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    },
  );
  const json = await res.json();
  if (!res.ok || json.errors) {
    throw new Error("Shopify Admin GraphQL error: " + JSON.stringify(json.errors ?? json));
  }
  return json.data;
}

/**
 * Crea la definicion del metafield con acceso de lectura desde la Storefront
 * API. Sin esto, la tienda (que lee via Storefront) recibe null aunque el
 * metafield exista. Si ya existe, Shopify responde TAKEN y lo ignoramos.
 */
async function ensureDefinition() {
  const data = await adminGraphQL(
    `mutation Create($definition: MetafieldDefinitionInput!) {
      metafieldDefinitionCreate(definition: $definition) {
        createdDefinition { id }
        userErrors { code message }
      }
    }`,
    {
      definition: {
        name: "Landing Content",
        namespace: "diana_mile",
        key: "landing_content",
        description: "Contenido editorial de la landing (JSON, generado por IA).",
        type: "json",
        ownerType: "PRODUCT",
        access: { storefront: "PUBLIC_READ" },
      },
    },
  );
  const errs = data.metafieldDefinitionCreate.userErrors.filter(
    (e) => e.code !== "TAKEN",
  );
  if (errs.length) {
    throw new Error("No se pudo crear la definicion: " + JSON.stringify(errs));
  }
}

async function fetchProduct(handle) {
  const data = await adminGraphQL(
    `query($handle: String!) {
      productByHandle(handle: $handle) {
        id
        title
        description
        productType
        tags
        metafield(namespace: "diana_mile", key: "landing_content") { value }
      }
    }`,
    { handle },
  );
  return data.productByHandle;
}

async function fetchAllProducts() {
  const data = await adminGraphQL(
    `query {
      products(first: 100) {
        edges {
          node {
            id
            title
            description
            productType
            tags
            metafield(namespace: "diana_mile", key: "landing_content") { value }
          }
        }
      }
    }`,
    {},
  );
  return data.products.edges.map((e) => e.node);
}

async function writeMetafield(ownerId, content) {
  const data = await adminGraphQL(
    `mutation Set($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { id }
        userErrors { field message }
      }
    }`,
    {
      metafields: [
        {
          ownerId,
          namespace: "diana_mile",
          key: "landing_content",
          type: "json",
          value: JSON.stringify(content),
        },
      ],
    },
  );
  const errs = data.metafieldsSet.userErrors;
  if (errs.length) {
    throw new Error("Error al escribir el metafield: " + JSON.stringify(errs));
  }
}

// --- Generacion con Claude ------------------------------------------------
const SYSTEM_PROMPT = `Eres un copywriter de respuesta directa experto en e-commerce de skincare/belleza para el mercado colombiano, especializado en landing pages de venta contraentrega (COD) de alta conversion y en psicologia de la persuasion (Cialdini, economia conductual, social funnels).

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

function buildUserPrompt(product) {
  const briefBlock = BRIEF
    ? `
BRIEF DE INVESTIGACION (usa este lenguaje de audiencia, dolores, deseos y angulos — tiene prioridad sobre suposiciones):
"""
${BRIEF.trim()}
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

async function generateContent(product) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(product) }],
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error("Anthropic API error: " + JSON.stringify(json));
  }

  const text = (json.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();

  // Por si el modelo envuelve en ```json ... ```
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error("La respuesta del modelo no es JSON valido:\n" + text.slice(0, 500));
  }
}

async function processOne(product) {
  const hasContent = Boolean(product.metafield?.value);
  if (hasContent && !FORCE) {
    console.log(`⏭  ${product.title} ya tiene contenido (usa --force para regenerar).`);
    return;
  }
  console.log(`✨ Generando: ${product.title} ...`);
  const content = await generateContent(product);

  if (DRY) {
    console.log(JSON.stringify(content, null, 2));
    return;
  }
  await writeMetafield(product.id, content);
  console.log(`✅ Guardado en metafield: ${product.title}`);
}

async function main() {
  requireEnv();

  if (!ALL && !handleArg) {
    console.error("Indica un <handle> o usa --all. Ver cabecera del script.");
    process.exit(1);
  }

  if (!DRY) await ensureDefinition();

  if (ALL) {
    const products = await fetchAllProducts();
    console.log(`Encontrados ${products.length} productos.`);
    for (const p of products) {
      try {
        await processOne(p);
      } catch (err) {
        console.error(`❌ ${p.title}: ${err.message}`);
      }
    }
  } else {
    const product = await fetchProduct(handleArg);
    if (!product) {
      console.error(`No se encontro el producto con handle "${handleArg}".`);
      process.exit(1);
    }
    await processOne(product);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

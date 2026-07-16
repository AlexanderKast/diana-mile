#!/usr/bin/env node
/**
 * Genera el contenido editorial del hero de una categoria con IA y lo
 * guarda en el metafield `diana_mile.collection_content` de Shopify. Mismo
 * patron que generate-landing.mjs pero a nivel de Collection en vez de
 * Product (eyebrow/tagline/storytelling corto, no una landing completa).
 *
 * Uso:
 *   node scripts/generate-collection.mjs <handle>       # una categoria
 *   node scripts/generate-collection.mjs --all          # todas las que no tengan contenido
 *   node scripts/generate-collection.mjs --all --force  # regenera aunque ya tengan
 *   node scripts/generate-collection.mjs <handle> --dry # imprime el JSON, no escribe
 *
 * Env requeridas (se leen de apps/shop/.env.local si existe, o del entorno):
 *   SHOPIFY_STORE_DOMAIN        ej. milito-life.myshopify.com
 *   SHOPIFY_ADMIN_API_TOKEN     token Admin API con write_products
 *   MISTRAL_API_KEY             clave de la API de Mistral
 *   LANDING_MODEL (opcional)    default: mistral-large-latest
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
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MODEL = process.env.LANDING_MODEL || "mistral-large-latest";
const API_VERSION = "2024-01";

const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const ALL = args.includes("--all");
const FORCE = args.includes("--force");
const handleArg = args.find((a) => !a.startsWith("--"));

function requireEnv() {
  const missing = [];
  if (!STORE_DOMAIN) missing.push("SHOPIFY_STORE_DOMAIN");
  if (!ADMIN_TOKEN) missing.push("SHOPIFY_ADMIN_API_TOKEN");
  if (!MISTRAL_API_KEY) missing.push("MISTRAL_API_KEY");
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
    throw new Error(
      "Shopify Admin GraphQL error: " + JSON.stringify(json.errors ?? json),
    );
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
        name: "Collection Content",
        namespace: "diana_mile",
        key: "collection_content",
        description:
          "Contenido editorial del hero de la categoria (JSON, generado por IA).",
        type: "json",
        ownerType: "COLLECTION",
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

async function fetchCollection(handle) {
  const data = await adminGraphQL(
    `query($handle: String!) {
      collectionByHandle(handle: $handle) {
        id
        title
        description
        productsCount { count }
        metafield(namespace: "diana_mile", key: "collection_content") { value }
      }
    }`,
    { handle },
  );
  return data.collectionByHandle;
}

async function fetchAllCollections() {
  const data = await adminGraphQL(
    `query {
      collections(first: 50) {
        edges {
          node {
            id
            handle
            title
            description
            productsCount { count }
            metafield(namespace: "diana_mile", key: "collection_content") { value }
          }
        }
      }
    }`,
    {},
  );
  return data.collections.edges.map((e) => e.node);
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
          key: "collection_content",
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

// --- Generacion con Mistral ------------------------------------------------
const SYSTEM_PROMPT = `Eres un copywriter de marca para "Milito Life Shop", una tienda de skincare/bienestar probada y recomendada por Diana Mile para el mercado colombiano, con checkout contraentrega (COD).

IMPORTANTE: nunca uses las palabras "curado", "curaduria" ni "curada" — usa "probado por Diana", "elegido por Diana" o equivalentes.

Escribes el hero editorial de una CATEGORIA de la tienda (no de un producto individual): un texto breve que le da identidad y contexto a la categoria antes de mostrar la grilla de productos. Tono calido, directo, en segunda persona, espanol neutro colombiano. Sin promesas medicas, sin superlativos vacios, sin inventar datos del catalogo que no te dieron.

Respondes SIEMPRE y UNICAMENTE con un objeto JSON valido, sin texto adicional ni bloques de codigo markdown.`;

function buildUserPrompt(collection) {
  return `Genera el contenido editorial del hero para esta categoria de "Milito Life Shop".

CATEGORIA:
- Titulo: ${collection.title}
- Descripcion actual: ${collection.description || "(sin descripcion)"}
- Cantidad de productos: ${collection.productsCount?.count ?? "desconocida"}

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

async function generateContent(collection) {
  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(collection) },
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

async function processOne(collection) {
  const hasContent = Boolean(collection.metafield?.value);
  if (hasContent && !FORCE) {
    console.log(
      `⏭  ${collection.title} ya tiene contenido (usa --force para regenerar).`,
    );
    return;
  }
  console.log(`✨ Generando: ${collection.title} ...`);
  const content = await generateContent(collection);

  if (DRY) {
    console.log(JSON.stringify(content, null, 2));
    return;
  }
  await writeMetafield(collection.id, content);
  console.log(`✅ Guardado en metafield: ${collection.title}`);
}

async function main() {
  requireEnv();

  if (!ALL && !handleArg) {
    console.error("Indica un <handle> o usa --all. Ver cabecera del script.");
    process.exit(1);
  }

  if (!DRY) await ensureDefinition();

  if (ALL) {
    const collections = await fetchAllCollections();
    console.log(`Encontradas ${collections.length} categorias.`);
    for (const c of collections) {
      try {
        await processOne(c);
      } catch (err) {
        console.error(`❌ ${c.title}: ${err.message}`);
      }
    }
  } else {
    const collection = await fetchCollection(handleArg);
    if (!collection) {
      console.error(`No se encontro la categoria con handle "${handleArg}".`);
      process.exit(1);
    }
    await processOne(collection);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

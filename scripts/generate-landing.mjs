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
 *   MISTRAL_API_KEY             clave de la API de Mistral
 *   LANDING_MODEL (opcional)    default: mistral-large-latest
 */

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { generateProductLandingContent } from "../packages/shared/src/landing-ai.js";

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

async function processOne(product) {
  const hasContent = Boolean(product.metafield?.value);
  if (hasContent && !FORCE) {
    console.log(`⏭  ${product.title} ya tiene contenido (usa --force para regenerar).`);
    return;
  }
  console.log(`✨ Generando: ${product.title} ...`);
  const content = await generateProductLandingContent(product, {
    apiKey: MISTRAL_API_KEY,
    model: MODEL,
    brief: BRIEF,
  });

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

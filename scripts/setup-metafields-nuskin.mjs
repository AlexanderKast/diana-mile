#!/usr/bin/env node
/**
 * Script de un solo uso: crea las definiciones de metafield que gobiernan el
 * catalogo Nu Skin (namespace `diana_mile`, owner PRODUCT).
 *
 * Se corre UNA vez desde la terminal. No se importa desde ningun lado de la
 * aplicacion.
 *
 *   node scripts/setup-metafields-nuskin.mjs
 *   node scripts/setup-metafields-nuskin.mjs --dry   # solo imprime que haria
 *
 * Env requeridas (se leen de apps/shop/.env.local si existe, o del entorno):
 *   SHOPIFY_STORE_DOMAIN      ej. militolife.myshopify.com
 *   SHOPIFY_ADMIN_API_TOKEN   token Admin API con write_products
 *
 * IMPORTANTE — access.storefront: PUBLIC_READ
 * Un metafield NO aparece en la Storefront API a menos que su definicion
 * tenga acceso storefront habilitado. Sin eso las queries de la tienda
 * devuelven null en silencio y parece un bug del codigo.
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
// Misma version que usan apps/shop y apps/admin. Shopify retira versiones
// ~12 meses despues de publicadas: si esto queda viejo, la API responde 401.
const API_VERSION = "2026-04";

const DRY = process.argv.includes("--dry");

if (!STORE_DOMAIN || !ADMIN_TOKEN) {
  console.error(
    "Faltan SHOPIFY_STORE_DOMAIN o SHOPIFY_ADMIN_API_TOKEN.\n" +
      "Definelas en apps/shop/.env.local o en el entorno antes de correr esto.",
  );
  process.exit(1);
}

/**
 * Las 4 definiciones que gobiernan el estado COD del catalogo. `linea` y
 * `sku_oficial` no cambian el comportamiento de compra pero viajan por el
 * mismo camino (Storefront) porque el catalogo filtra por linea y el bloque
 * de vitrina muestra el SKU en el mensaje de WhatsApp.
 */
const DEFINICIONES = [
  {
    key: "cod_disponible",
    name: "COD disponible",
    type: "boolean",
    description:
      "Gobierna el bloque de compra de la pagina de producto. true = formulario contraentrega. false = bloque vitrina (WhatsApp con Diana).",
  },
  {
    key: "motivo_no_cod",
    name: "Motivo sin COD",
    type: "single_line_text_field",
    description:
      "Por que el producto no es apto para contraentrega: ticket_alto | solo_suscripcion | accesorio. Vacio cuando cod_disponible es true.",
  },
  {
    key: "sku_oficial",
    name: "SKU oficial Nu Skin",
    type: "single_line_text_field",
    description:
      "Codigo oficial Nu Skin del producto — trazabilidad contra la lista de precios de Nu Skin Colombia.",
  },
  {
    key: "linea",
    name: "Linea de producto",
    type: "single_line_text_field",
    description:
      "Linea comercial: ageLOC, Epoch, Pharmanex, Nu Colour, LumiSpa iO... Alimenta el filtro del catalogo.",
  },
];

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
      `Shopify Admin GraphQL error (${res.status}): ` +
        JSON.stringify(json.errors ?? json),
    );
  }
  return json.data;
}

const CREATE_MUTATION = `
  mutation CrearDefinicion($definition: MetafieldDefinitionInput!) {
    metafieldDefinitionCreate(definition: $definition) {
      createdDefinition { id key }
      userErrors { code field message }
    }
  }
`;

async function crearDefinicion(def) {
  const data = await adminGraphQL(CREATE_MUTATION, {
    definition: {
      name: def.name,
      namespace: "diana_mile",
      key: def.key,
      description: def.description,
      type: def.type,
      ownerType: "PRODUCT",
      // Sin esto la Storefront API devuelve null aunque el metafield exista.
      access: { storefront: "PUBLIC_READ" },
    },
  });

  const { createdDefinition, userErrors } = data.metafieldDefinitionCreate;

  // TAKEN = la definicion ya existe. No es un fallo: se salta y se reporta.
  const yaExistia = userErrors.some((e) => e.code === "TAKEN");
  if (yaExistia) return { estado: "ya_existia" };

  if (userErrors.length > 0) {
    return { estado: "error", errores: userErrors };
  }

  return { estado: "creada", id: createdDefinition?.id };
}

async function main() {
  console.log(`Tienda: ${STORE_DOMAIN} (API ${API_VERSION})`);
  console.log(
    `Definiciones a asegurar en el namespace "diana_mile": ${DEFINICIONES.length}\n`,
  );

  if (DRY) {
    for (const def of DEFINICIONES) {
      console.log(
        `  [dry] diana_mile.${def.key} (${def.type}) — storefront PUBLIC_READ`,
      );
    }
    console.log("\nModo --dry: no se escribio nada.");
    return;
  }

  const resumen = { creadas: 0, ya_existian: 0, errores: 0 };

  for (const def of DEFINICIONES) {
    try {
      const resultado = await crearDefinicion(def);

      if (resultado.estado === "creada") {
        resumen.creadas += 1;
        console.log(`  ✓ diana_mile.${def.key} — creada`);
      } else if (resultado.estado === "ya_existia") {
        resumen.ya_existian += 1;
        console.log(`  · diana_mile.${def.key} — ya existia, se salta`);
        console.log(
          `      Revisa a mano que tenga acceso storefront habilitado en` +
            ` Configuracion → Metadatos personalizados.`,
        );
      } else {
        resumen.errores += 1;
        console.error(
          `  ✗ diana_mile.${def.key} — ${JSON.stringify(resultado.errores)}`,
        );
      }
    } catch (error) {
      resumen.errores += 1;
      console.error(`  ✗ diana_mile.${def.key} — ${error.message}`);
    }
  }

  console.log(
    `\nResumen: ${resumen.creadas} creadas · ${resumen.ya_existian} ya existian · ${resumen.errores} con error`,
  );

  if (resumen.errores > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

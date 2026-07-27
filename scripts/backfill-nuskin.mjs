#!/usr/bin/env node
/**
 * Script de un solo uso: rellena los metafields del catalogo Nu Skin a
 * partir de lo que ya trae cada producto en Shopify (tags, SKU, tipo,
 * precio). Corre DESPUES de scripts/setup-metafields-nuskin.mjs.
 *
 *   node scripts/backfill-nuskin.mjs
 *   node scripts/backfill-nuskin.mjs --dry   # imprime el plan, no escribe
 *
 * Env requeridas (se leen de apps/shop/.env.local si existe, o del entorno):
 *   SHOPIFY_STORE_DOMAIN      ej. militolife.myshopify.com
 *   SHOPIFY_ADMIN_API_TOKEN   token Admin API con write_products
 *
 * REGLAS (derivadas del catalogo, no adivinadas):
 *   cod_disponible = true  si el producto tiene el tag "cod-candidato"
 *                    false si tiene el tag "vitrina"
 *                    si no tiene ninguno de los dos -> NO se toca, va al reporte
 *   motivo_no_cod  = ""                 cuando cod_disponible es true
 *                    "solo_suscripcion" si el tag incluye solo-suscripcion
 *                    "accesorio"        si el precio es menor a 60000
 *                    "ticket_alto"      en cualquier otro caso
 *   sku_oficial    = SKU de la primera variante
 *   linea          = productType del producto
 */

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

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
const API_VERSION = "2026-04";

const DRY = process.argv.includes("--dry");

/** Umbral por debajo del cual un producto de vitrina se considera accesorio
 *  (cargadores, bases) y no un producto de ticket alto. */
const UMBRAL_ACCESORIO = 60000;

/** Tope duro de la mutation metafieldsSet: 25 metafields por llamada. */
const LOTE_METAFIELDS = 25;

if (!STORE_DOMAIN || !ADMIN_TOKEN) {
  console.error(
    "Faltan SHOPIFY_STORE_DOMAIN o SHOPIFY_ADMIN_API_TOKEN.\n" +
      "Definelas en apps/shop/.env.local o en el entorno antes de correr esto.",
  );
  process.exit(1);
}

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

const PRODUCTOS_QUERY = `
  query ProductosNuskin($cursor: String) {
    products(first: 50, after: $cursor, query: "vendor:'Nu Skin'") {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id
          handle
          title
          productType
          tags
          variants(first: 1) {
            edges { node { sku price } }
          }
        }
      }
    }
  }
`;

async function listarProductosNuskin() {
  const productos = [];
  let cursor = null;

  do {
    const data = await adminGraphQL(PRODUCTOS_QUERY, { cursor });
    for (const edge of data.products.edges) {
      const node = edge.node;
      const variante = node.variants.edges[0]?.node ?? null;
      productos.push({
        id: node.id,
        handle: node.handle,
        title: node.title,
        productType: node.productType ?? "",
        tags: node.tags ?? [],
        sku: variante?.sku ?? "",
        precio: variante?.price ? parseFloat(variante.price) : null,
      });
    }
    cursor = data.products.pageInfo.hasNextPage
      ? data.products.pageInfo.endCursor
      : null;
  } while (cursor);

  return productos;
}

function normalizarTags(tags) {
  return tags.map((t) => t.trim().toLowerCase());
}

/**
 * Decide el estado COD del producto. Devuelve null cuando el producto no
 * trae ninguno de los dos tags: en ese caso no se adivina — se salta y
 * aparece en el reporte final para revisarlo a mano.
 */
function decidirEstado(producto) {
  const tags = normalizarTags(producto.tags);
  const esCod = tags.includes("cod-candidato");
  const esVitrina = tags.includes("vitrina");

  if (esCod && esVitrina) return null; // contradictorio: tampoco se adivina
  if (!esCod && !esVitrina) return null;

  if (esCod) return { codDisponible: true, motivo: "" };

  if (tags.includes("solo-suscripcion")) {
    return { codDisponible: false, motivo: "solo_suscripcion" };
  }
  if (producto.precio !== null && producto.precio < UMBRAL_ACCESORIO) {
    return { codDisponible: false, motivo: "accesorio" };
  }
  return { codDisponible: false, motivo: "ticket_alto" };
}

function construirMetafields(producto, estado) {
  const metafields = [
    {
      ownerId: producto.id,
      namespace: "diana_mile",
      key: "cod_disponible",
      type: "boolean",
      value: String(estado.codDisponible),
    },
    {
      ownerId: producto.id,
      namespace: "diana_mile",
      key: "linea",
      type: "single_line_text_field",
      value: producto.productType || "Nu Skin",
    },
  ];

  // Shopify rechaza un single_line_text_field vacio, asi que el SKU solo se
  // escribe cuando la variante realmente lo trae.
  if (producto.sku) {
    metafields.push({
      ownerId: producto.id,
      namespace: "diana_mile",
      key: "sku_oficial",
      type: "single_line_text_field",
      value: producto.sku,
    });
  }

  // Mismo motivo: cuando el producto SI es contraentrega el motivo queda
  // vacio, y "vacio" en Shopify significa borrar el metafield, no escribir "".
  if (estado.motivo) {
    metafields.push({
      ownerId: producto.id,
      namespace: "diana_mile",
      key: "motivo_no_cod",
      type: "single_line_text_field",
      value: estado.motivo,
    });
  }

  return metafields;
}

const SET_MUTATION = `
  mutation Escribir($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields { id key }
      userErrors { field message }
    }
  }
`;

const DELETE_MUTATION = `
  mutation Borrar($metafields: [MetafieldIdentifierInput!]!) {
    metafieldsDelete(metafields: $metafields) {
      deletedMetafields { key }
      userErrors { field message }
    }
  }
`;

async function escribirEnLotes(metafields) {
  for (let i = 0; i < metafields.length; i += LOTE_METAFIELDS) {
    const lote = metafields.slice(i, i + LOTE_METAFIELDS);
    const data = await adminGraphQL(SET_MUTATION, { metafields: lote });
    const errores = data.metafieldsSet.userErrors;
    if (errores.length > 0) {
      throw new Error(
        "metafieldsSet fallo: " + JSON.stringify(errores),
      );
    }
    console.log(
      `  · escritos ${Math.min(i + LOTE_METAFIELDS, metafields.length)}/${metafields.length} metafields`,
    );
  }
}

/**
 * Los productos que pasan a contraentrega no deben conservar un motivo
 * viejo colgando (ej. Diana enciende el interruptor de uno que estaba en
 * vitrina). Borrar un metafield inexistente no es un error en Shopify.
 */
async function borrarMotivos(identificadores) {
  for (let i = 0; i < identificadores.length; i += LOTE_METAFIELDS) {
    const lote = identificadores.slice(i, i + LOTE_METAFIELDS);
    const data = await adminGraphQL(DELETE_MUTATION, { metafields: lote });
    const errores = data.metafieldsDelete.userErrors;
    if (errores.length > 0) {
      console.warn(
        "  ! metafieldsDelete reporto: " + JSON.stringify(errores),
      );
    }
  }
}

async function main() {
  console.log(`Tienda: ${STORE_DOMAIN} (API ${API_VERSION})`);
  console.log('Buscando productos con vendor "Nu Skin"...\n');

  const productos = await listarProductosNuskin();
  console.log(`Encontrados: ${productos.length} productos\n`);

  const metafields = [];
  const motivosABorrar = [];
  const saltados = [];
  let cod = 0;
  let vitrina = 0;
  const porMotivo = { ticket_alto: 0, solo_suscripcion: 0, accesorio: 0 };
  let sinSku = 0;
  let sinLinea = 0;

  for (const producto of productos) {
    const estado = decidirEstado(producto);

    if (!estado) {
      saltados.push({
        handle: producto.handle,
        title: producto.title,
        razon: `tags sin "cod-candidato" ni "vitrina" (o ambos a la vez): [${producto.tags.join(", ")}]`,
      });
      continue;
    }

    if (estado.codDisponible) {
      cod += 1;
      motivosABorrar.push({
        ownerId: producto.id,
        namespace: "diana_mile",
        key: "motivo_no_cod",
      });
    } else {
      vitrina += 1;
      porMotivo[estado.motivo] += 1;
    }

    if (!producto.sku) sinSku += 1;
    if (!producto.productType) sinLinea += 1;

    metafields.push(...construirMetafields(producto, estado));
  }

  if (DRY) {
    console.log("Modo --dry: nada se escribe. Plan:\n");
    for (const producto of productos) {
      const estado = decidirEstado(producto);
      if (!estado) continue;
      console.log(
        `  ${producto.handle.padEnd(52)} cod=${String(estado.codDisponible).padEnd(5)} motivo=${estado.motivo || "-"} linea=${producto.productType || "-"} sku=${producto.sku || "-"}`,
      );
    }
  } else {
    console.log(`Escribiendo ${metafields.length} metafields...`);
    await escribirEnLotes(metafields);

    if (motivosABorrar.length > 0) {
      console.log(
        `Limpiando motivo_no_cod de ${motivosABorrar.length} productos contraentrega...`,
      );
      await borrarMotivos(motivosABorrar);
    }
  }

  console.log("\n--- Resumen ---");
  console.log(`Productos Nu Skin encontrados : ${productos.length}`);
  console.log(`Contraentrega (cod_disponible): ${cod}`);
  console.log(`Vitrina                       : ${vitrina}`);
  console.log(`   · ticket_alto              : ${porMotivo.ticket_alto}`);
  console.log(`   · solo_suscripcion         : ${porMotivo.solo_suscripcion}`);
  console.log(`   · accesorio                : ${porMotivo.accesorio}`);
  console.log(`Sin SKU en la primera variante: ${sinSku}`);
  console.log(`Sin productType (linea)       : ${sinLinea}`);
  console.log(`Saltados                      : ${saltados.length}`);

  if (saltados.length > 0) {
    console.log("\nProductos saltados (revisar a mano en Shopify):");
    for (const s of saltados) {
      console.log(`  - ${s.handle} — ${s.title}`);
      console.log(`      ${s.razon}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

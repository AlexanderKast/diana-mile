#!/usr/bin/env node
/**
 * Pasa los productos Nu Skin de borrador a publicos: los pone en estado
 * ACTIVE y los publica en el canal Online Store.
 *
 *   node scripts/publicar-nuskin.mjs --dry     # muestra que haria
 *   node scripts/publicar-nuskin.mjs           # publica
 *   node scripts/publicar-nuskin.mjs --despublicar   # revierte a borrador
 *
 * NO BASTA CON status: ACTIVE
 * Un producto puede estar ACTIVE y aun asi no verse en la tienda si no esta
 * publicado en el canal "Online Store". Son dos cosas distintas y hay que
 * hacer las dos: productUpdate(status) y publishablePublish(canal).
 *
 * EXCLUIDOS
 * Las donaciones de Nourish the Children (VitaMeal) NO se publican: son una
 * donacion a un programa de alimentacion infantil, no un producto de la
 * tienda, y venderlas contraentrega junto a un serum es otra conversacion.
 * Se pueden forzar con --incluir-donaciones si algun dia se decide.
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

const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const DESPUBLICAR = args.includes("--despublicar");
const INCLUIR_DONACIONES = args.includes("--incluir-donaciones");
/**
 * Publicar solo lo que tiene foto. Una ficha sin imagen se ve como un
 * rectangulo gris en la grilla del catalogo y no vende: es peor que no
 * estar. Los demas se quedan en borrador hasta que tengan foto.
 */
const SOLO_CON_FOTO = args.includes("--solo-con-foto");

if (!STORE_DOMAIN || !ADMIN_TOKEN) {
  console.error("Faltan SHOPIFY_STORE_DOMAIN o SHOPIFY_ADMIN_API_TOKEN.");
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

async function canalOnlineStore() {
  const d = await adminGraphQL(`{
    publications(first: 25) { edges { node { id name } } }
  }`);
  const canales = d.publications.edges.map((e) => e.node);
  const online = canales.find((c) => /online store|tienda online/i.test(c.name));
  if (!online) {
    throw new Error(
      "No se encontro el canal Online Store. Canales: " +
        canales.map((c) => c.name).join(", "),
    );
  }
  return online;
}

const PRODUCTOS_QUERY = `
  query($cursor: String) {
    products(first: 50, after: $cursor, query: "vendor:'Nu Skin'") {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id
          handle
          title
          status
          productType
          media(first: 1) { edges { node { id } } }
          landing: metafield(namespace: "diana_mile", key: "landing_content") { value }
        }
      }
    }
  }
`;

const esDonacion = (p) =>
  /nourish the children/i.test(p.productType) || /donacion|donación|vitameal/i.test(p.title);

async function main() {
  const canal = await canalOnlineStore();
  console.log(`Tienda: ${STORE_DOMAIN}`);
  console.log(`Canal: ${canal.name}\n`);

  const productos = [];
  let cursor = null;
  do {
    const d = await adminGraphQL(PRODUCTOS_QUERY, { cursor });
    for (const { node } of d.products.edges) {
      productos.push({
        id: node.id,
        handle: node.handle,
        title: node.title,
        status: node.status,
        productType: node.productType ?? "",
        tieneFoto: node.media.edges.length > 0,
        tieneLanding: Boolean(node.landing?.value),
      });
    }
    cursor = d.products.pageInfo.hasNextPage ? d.products.pageInfo.endCursor : null;
  } while (cursor);

  const donaciones = productos.filter(esDonacion);
  let objetivo = INCLUIR_DONACIONES
    ? productos
    : productos.filter((p) => !esDonacion(p));

  const excluidosSinFoto = SOLO_CON_FOTO
    ? objetivo.filter((p) => !p.tieneFoto)
    : [];
  if (SOLO_CON_FOTO) objetivo = objetivo.filter((p) => p.tieneFoto);

  const sinFoto = objetivo.filter((p) => !p.tieneFoto);
  const sinLanding = objetivo.filter((p) => !p.tieneLanding);

  console.log(`Productos Nu Skin: ${productos.length}`);
  console.log(`A ${DESPUBLICAR ? "despublicar" : "publicar"}: ${objetivo.length}`);
  if (!INCLUIR_DONACIONES && donaciones.length) {
    console.log(`Excluidas (donaciones): ${donaciones.map((d) => d.handle).join(", ")}`);
  }
  if (excluidosSinFoto.length) {
    console.log(
      `Se quedan en borrador por no tener foto: ${excluidosSinFoto.length}`,
    );
    for (const p of excluidosSinFoto) console.log(`  - ${p.handle}`);
    console.log();
  }
  console.log(`Sin foto: ${sinFoto.length} · Sin copy de landing: ${sinLanding.length}\n`);

  if (DRY) {
    if (sinFoto.length) {
      console.log("Se publicarian SIN foto (placeholder gris en el catalogo):");
      for (const p of sinFoto) console.log(`  - ${p.handle}`);
    }
    if (sinLanding.length) {
      console.log("\nSe publicarian SIN copy propio:");
      for (const p of sinLanding) console.log(`  - ${p.handle}`);
    }
    console.log("\nModo --dry: no se escribio nada.");
    return;
  }

  const resumen = { ok: 0, errores: 0 };

  for (const p of objetivo) {
    try {
      await adminGraphQL(
        `mutation($input: ProductInput!) {
          productUpdate(input: $input) {
            product { id status }
            userErrors { field message }
          }
        }`,
        { input: { id: p.id, status: DESPUBLICAR ? "DRAFT" : "ACTIVE" } },
      );

      const mut = DESPUBLICAR ? "publishableUnpublish" : "publishablePublish";
      const d = await adminGraphQL(
        `mutation($id: ID!, $input: [PublicationInput!]!) {
          ${mut}(id: $id, input: $input) {
            userErrors { field message }
          }
        }`,
        { id: p.id, input: [{ publicationId: canal.id }] },
      );

      const errs = d[mut].userErrors;
      if (errs.length) {
        resumen.errores += 1;
        console.error(`  ✗ ${p.title} — ${JSON.stringify(errs)}`);
        continue;
      }

      resumen.ok += 1;
      const marcas = [!p.tieneFoto && "sin foto", !p.tieneLanding && "sin copy"]
        .filter(Boolean)
        .join(", ");
      console.log(`  ✓ ${p.title}${marcas ? ` (${marcas})` : ""}`);
    } catch (err) {
      resumen.errores += 1;
      console.error(`  ✗ ${p.handle} — ${err.message}`);
    }
  }

  console.log("\n--- Resumen ---");
  console.log(resumen);
  if (sinFoto.length) {
    console.log(`\nOJO: ${sinFoto.length} quedaron publicados sin foto:`);
    for (const p of sinFoto) console.log(`  - ${p.handle}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * Quita el codigo/SKU oficial de Nu Skin de las descripciones PUBLICAS de
 * los productos.
 *
 *   node scripts/quitar-sku-descripciones.mjs --dry   # muestra antes/despues
 *   node scripts/quitar-sku-descripciones.mjs         # escribe
 *
 * POR QUE
 * El SKU oficial es el numero exacto con el que cualquiera busca y compra
 * el producto en el canal de Nu Skin, con el enlace de otra distribuidora.
 * Publicarlo en la ficha es regalarle la venta a quien lo copie. El dato no
 * se pierde: sigue en el metafield `diana_mile.sku_oficial`, que es interno
 * y es el que usa el bloque de vitrina para armarle a Diana el mensaje de
 * WhatsApp con el producto ya identificado.
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

/**
 * El codigo aparece en formas distintas segun como lo redacto el modelo:
 * dentro de un <strong>, como frase suelta al final de un parrafo, o con
 * la etiqueta y el numero separados. Se limpian todas y despues se barren
 * los restos (parrafos vacios, puntuacion huerfana).
 */
function limpiar(html) {
  let out = html;

  // "<strong>SKU oficial Nu Skin Colombia:</strong> 50129982" y similares,
  // incluyendo el numero que queda fuera de la etiqueta.
  out = out.replace(
    /<strong>[^<]*(?:c[oó]digo|sku)\s+oficial[^<]*<\/strong>\s*:?\s*\d{4,}\.?/gi,
    "",
  );

  // "<strong>Codigo oficial Nu Skin: 50001647</strong>" (todo adentro).
  out = out.replace(
    /<strong>[^<]*(?:c[oó]digo|sku)\s+oficial[^<]*\d{4,}[^<]*<\/strong>\.?/gi,
    "",
  );

  // Frase suelta, con el numero envuelto o no en <strong>.
  out = out.replace(
    /[^.<>]*(?:c[oó]digo|sku)\s+oficial[^.<>]*(?:<strong>\s*)?\d{4,}(?:\s*<\/strong>)?[^.<>]*\.?/gi,
    "",
  );

  // Etiqueta sin numero visible (quedo huerfana tras los pasos anteriores).
  out = out.replace(
    /[^.<>]*(?:c[oó]digo|sku)\s+oficial[^.<>]*\.?/gi,
    "",
  );

  // Restos: parrafos que quedaron vacios, espacios dobles, puntuacion suelta.
  out = out.replace(/<p>\s*(?:<strong>\s*<\/strong>)?\s*<\/p>/gi, "");
  out = out.replace(/<strong>\s*<\/strong>/gi, "");
  out = out.replace(/\s{2,}/g, " ");
  out = out.replace(/\s+([.,;])/g, "$1");
  out = out.replace(/([.,;])\s*\1+/g, "$1");
  out = out.replace(/<p>\s*[.,;]\s*/gi, "<p>");

  return out.trim();
}

const QUERY = `
  query($cursor: String) {
    products(first: 50, after: $cursor, query: "vendor:'Nu Skin'") {
      pageInfo { hasNextPage endCursor }
      edges { node { id handle title descriptionHtml } }
    }
  }
`;

async function main() {
  const productos = [];
  let cursor = null;
  do {
    const d = await adminGraphQL(QUERY, { cursor });
    for (const { node } of d.products.edges) productos.push(node);
    cursor = d.products.pageInfo.hasNextPage ? d.products.pageInfo.endCursor : null;
  } while (cursor);

  console.log(`Productos Nu Skin: ${productos.length}\n`);

  const aCambiar = [];
  for (const p of productos) {
    const limpio = limpiar(p.descriptionHtml || "");
    if (limpio !== (p.descriptionHtml || "").trim()) {
      aCambiar.push({ ...p, limpio });
    }
  }

  console.log(`Con codigo visible: ${aCambiar.length}\n`);

  if (DRY) {
    for (const p of aCambiar.slice(0, 5)) {
      console.log(`=== ${p.title} ===`);
      console.log("ANTES : ..." + p.descriptionHtml.slice(-260));
      console.log("DESPUES: ..." + p.limpio.slice(-260));
      console.log();
    }
    // Nadie deberia confiar en un reemplazo con regex sobre HTML sin ver si
    // quedo algun numero de 4+ digitos suelto donde estaba el codigo.
    const sospechosos = aCambiar.filter((p) => /(?:c[oó]digo|sku)/i.test(p.limpio));
    if (sospechosos.length) {
      console.log(`OJO: ${sospechosos.length} siguen mencionando "codigo"/"sku":`);
      for (const s of sospechosos) console.log(`  - ${s.handle}`);
    }
    console.log("\nModo --dry: no se escribio nada.");
    return;
  }

  let ok = 0;
  let errores = 0;
  for (const p of aCambiar) {
    try {
      const d = await adminGraphQL(
        `mutation($input: ProductInput!) {
          productUpdate(input: $input) {
            product { id }
            userErrors { field message }
          }
        }`,
        { input: { id: p.id, descriptionHtml: p.limpio } },
      );
      const errs = d.productUpdate.userErrors;
      if (errs.length) {
        errores += 1;
        console.error(`  ✗ ${p.title} — ${JSON.stringify(errs)}`);
        continue;
      }
      ok += 1;
      console.log(`  ✓ ${p.title}`);
    } catch (err) {
      errores += 1;
      console.error(`  ✗ ${p.handle} — ${err.message}`);
    }
  }

  console.log(`\n--- Resumen ---\nLimpiados: ${ok} · Errores: ${errores}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

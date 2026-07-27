#!/usr/bin/env node
/**
 * Sube a Shopify las fotos oficiales del kit de distribuidoras de Nu Skin
 * (nuskinsocial.smugmug.com) para los productos del catalogo Nu Skin.
 *
 *   node scripts/subir-imagenes-nuskin.mjs <archivo.json>          # sube
 *   node scripts/subir-imagenes-nuskin.mjs <archivo.json> --dry    # solo reporta
 *   node scripts/subir-imagenes-nuskin.mjs <archivo.json> --force  # aunque ya tenga fotos
 *
 * El archivo JSON tiene la forma:
 *   { "<handle>": [ { "u": "https://photos.smugmug.com/...", "f": "nombre.jpg" } ] }
 *
 * ORDEN DE LAS FOTOS — no es decorativo
 * La PDP (apps/shop/app/productos/[slug]/page.tsx, constante IMAGE_SLOT) usa
 * la POSICION de cada foto para decidir en que seccion aparece:
 *   0-2 galeria del hero · 3 beneficios · 4 resultados · 5 ritual · 6+ mosaico
 * Por eso se suben en el orden del arreglo y no se reordenan despues.
 *
 * FUENTE Y PERMISO
 * Las fotos salen del kit oficial de Nu Skin para distribuidoras LATAM, que
 * es material autorizado. NO se toman de nuskin.com — eso si estaria fuera
 * del acuerdo de distribuidor.
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
const FORCE = args.includes("--force");
const ARCHIVO = args.find((a) => !a.startsWith("--"));

if (!STORE_DOMAIN || !ADMIN_TOKEN) {
  console.error("Faltan SHOPIFY_STORE_DOMAIN o SHOPIFY_ADMIN_API_TOKEN.");
  process.exit(1);
}
if (!ARCHIVO || !existsSync(ARCHIVO)) {
  console.error("Pasa la ruta del JSON de imagenes. Ej: node scripts/subir-imagenes-nuskin.mjs imagenes-nuskin.json");
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

async function buscarProducto(handle) {
  const d = await adminGraphQL(
    `query($handle: String!) {
      productByHandle(handle: $handle) {
        id
        title
        media(first: 20) { edges { node { id } } }
      }
    }`,
    { handle },
  );
  return d.productByHandle;
}

/**
 * Un alt honesto y util: nombre del producto + que muestra la foto, deducido
 * del nombre de archivo del kit. Sin alt, la foto no le dice nada a quien usa
 * lector de pantalla ni a Google.
 */
function alt(titulo, fileName, i) {
  const f = (fileName || "").toLowerCase();
  if (/packshot|packaging|empaque|bottle/.test(f)) return `${titulo} — empaque`;
  if (/ingredient/.test(f)) return `${titulo} — ingredientes`;
  if (/model|application|uso|hand|mano/.test(f)) return `${titulo} — en uso`;
  if (/texture|textura/.test(f)) return `${titulo} — textura`;
  return i === 0 ? titulo : `${titulo} — foto ${i + 1}`;
}

async function main() {
  const mapa = JSON.parse(readFileSync(ARCHIVO, "utf8"));
  const handles = Object.keys(mapa);
  console.log(`Tienda: ${STORE_DOMAIN}`);
  console.log(`Productos en el archivo: ${handles.length}\n`);

  const resumen = { subidos: 0, saltados: 0, sinProducto: 0, errores: 0 };
  let fotosTotal = 0;

  for (const handle of handles) {
    const fotos = mapa[handle] || [];
    if (fotos.length === 0) continue;

    try {
      const producto = await buscarProducto(handle);
      if (!producto) {
        resumen.sinProducto += 1;
        console.log(`  ? ${handle} — no existe en Shopify`);
        continue;
      }

      const yaTiene = producto.media.edges.length;
      if (yaTiene > 0 && !FORCE) {
        resumen.saltados += 1;
        console.log(`  · ${producto.title} — ya tiene ${yaTiene} foto(s), se salta`);
        continue;
      }

      if (DRY) {
        console.log(`  [dry] ${producto.title} — ${fotos.length} fotos`);
        for (const f of fotos) console.log(`         ${f.f}`);
        resumen.subidos += 1;
        fotosTotal += fotos.length;
        continue;
      }

      const data = await adminGraphQL(
        `mutation($productId: ID!, $media: [CreateMediaInput!]!) {
          productCreateMedia(productId: $productId, media: $media) {
            media { id }
            mediaUserErrors { field message }
          }
        }`,
        {
          productId: producto.id,
          media: fotos.map((f, i) => ({
            originalSource: f.u,
            alt: alt(producto.title, f.f, i),
            mediaContentType: "IMAGE",
          })),
        },
      );

      const errs = data.productCreateMedia.mediaUserErrors;
      if (errs.length) {
        resumen.errores += 1;
        console.error(`  ✗ ${producto.title} — ${JSON.stringify(errs)}`);
        continue;
      }

      resumen.subidos += 1;
      fotosTotal += fotos.length;
      console.log(`  ✓ ${producto.title} — ${fotos.length} fotos`);
    } catch (err) {
      resumen.errores += 1;
      console.error(`  ✗ ${handle} — ${err.message}`);
    }
  }

  console.log("\n--- Resumen ---");
  console.log(resumen);
  console.log(`Fotos ${DRY ? "a subir" : "subidas"}: ${fotosTotal}`);
  console.log(
    "\nShopify procesa las imagenes de forma asincrona: pueden tardar un" +
      " par de minutos en aparecer listas en el admin.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

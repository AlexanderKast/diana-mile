#!/usr/bin/env node
/**
 * Mete cada producto Nu Skin en una categoria de la tienda y crea las
 * colecciones automaticas que las representan.
 *
 *   node scripts/categorizar-nuskin.mjs --dry   # muestra el reparto
 *   node scripts/categorizar-nuskin.mjs         # etiqueta y crea colecciones
 *
 * POR QUE TAGS Y NO EL METAFIELD `linea`
 * Las colecciones automaticas de Shopify sólo saben leer tag, titulo, tipo,
 * vendor, precio y peso — no metafields. Asi que la categoria viaja como un
 * tag `cat-<slug>`. La ventaja es que un producto nuevo con su tag entra a
 * la categoria solo, sin tocar codigo ni el admin.
 *
 * POR QUE ESTAS CATEGORIAS Y NO LAS 11 LINEAS DE NU SKIN
 * "Tratamientos ageLOC" o "WellSpa iO" son nomenclatura interna de la marca:
 * a una clienta no le dicen nada. Se agrupa por lo que la persona quiere
 * lograr, no por como Nu Skin ordena su portafolio.
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
 * Las 6 categorias de la tienda. El `handle` es la URL: cambiarlo despues
 * rompe enlaces vivos, asi que se elige una sola vez y en serio.
 */
const CATEGORIAS = [
  {
    slug: "ritual-de-rostro",
    titulo: "Ritual de rostro",
    descripcion:
      "Limpieza, tratamiento e hidratación para la piel del rostro. El orden que sí se sostiene en el día a día.",
  },
  {
    slug: "tecnologia-en-casa",
    titulo: "Tecnología en casa",
    descripcion:
      "Los dispositivos de Nu Skin y todo lo que necesitan para seguir funcionando: cabezales, geles y repuestos.",
  },
  {
    slug: "cuerpo-y-ducha",
    titulo: "Cuerpo y ducha",
    descripcion:
      "Lo que se usa de la cabeza a los pies, en el único momento del día que de verdad es tuyo.",
  },
  {
    slug: "bienestar-por-dentro",
    titulo: "Bienestar por dentro",
    descripcion:
      "Suplementos dietarios de Pharmanex. Complementan una alimentación balanceada, no la reemplazan.",
  },
  {
    slug: "color-y-detalle",
    titulo: "Color y detalle",
    descripcion:
      "Labios, pestañas, cejas y sonrisa. Los detalles que se notan de cerca.",
  },
  {
    slug: "kits-de-inicio",
    titulo: "Kits de inicio",
    descripcion:
      "Para empezar con todo en un solo paso, o para armar tu negocio como distribuidora.",
  },
];

/**
 * Reparte por titulo y linea. El orden importa: lo mas especifico primero.
 * Un "Kit ageLOC Facial" es kit, no ritual de rostro; un "Cargador para
 * LumiSpa" es tecnologia, no accesorio suelto.
 */
function categoriaDe(p) {
  const t = p.title.toLowerCase();
  const l = (p.linea || p.productType || "").toLowerCase();

  if (/^kit|kit |social seller|essentials|sistema /.test(t)) return "kits-de-inicio";
  if (/kits de inicio/.test(l)) return "kits-de-inicio";

  // Lo que se aplica en el cuerpo va con el cuerpo, aunque se use con un
  // dispositivo. A quien busca algo para la piel del cuerpo no se le ocurre
  // entrar a "Tecnologia en casa" — ahi buscaria el aparato, no el gel.
  if (/body io|body shaping|polishing bar|corporal|ducha/.test(t))
    return "cuerpo-y-ducha";

  if (/lumispa|wellspa|galvanic|boost|cabezal|cargador|base para|prysm/.test(t + l))
    return "tecnologia-en-casa";

  if (/pharmanex|nourish/.test(l) || /omega|collagen|g3|youthspan|tr90|lifepak|tegreen/.test(t))
    return "bienestar-por-dentro";

  if (/nu colour|dental/.test(l) || /peptide pout|lash|brow|toothpaste|ap 24|cleansing balm/.test(t))
    return "color-y-detalle";

  if (/cuidado corporal/.test(l) || /polishing bar|body shaping|corporal|ducha/.test(t))
    return "cuerpo-y-ducha";

  return "ritual-de-rostro";
}

const PRODUCTOS_QUERY = `
  query($cursor: String) {
    products(first: 50, after: $cursor, query: "vendor:'Nu Skin'") {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id handle title productType tags status
          linea: metafield(namespace: "diana_mile", key: "linea") { value }
        }
      }
    }
  }
`;

async function listarProductos() {
  const out = [];
  let cursor = null;
  do {
    const d = await adminGraphQL(PRODUCTOS_QUERY, { cursor });
    for (const { node } of d.products.edges) {
      out.push({
        id: node.id,
        handle: node.handle,
        title: node.title,
        productType: node.productType ?? "",
        tags: node.tags ?? [],
        status: node.status,
        linea: node.linea?.value ?? "",
      });
    }
    cursor = d.products.pageInfo.hasNextPage ? d.products.pageInfo.endCursor : null;
  } while (cursor);
  return out;
}

/**
 * Crea la coleccion automatica si no existe. Si ya existe se deja como
 * esta: puede tener imagen o contenido editorial puestos a mano y no hay
 * por que pisarlos.
 */
async function asegurarColeccion(cat) {
  const existe = await adminGraphQL(
    `query($handle: String!) { collectionByHandle(handle: $handle) { id title } }`,
    { handle: cat.slug },
  );
  if (existe.collectionByHandle) {
    return { id: existe.collectionByHandle.id, creada: false };
  }

  const d = await adminGraphQL(
    `mutation($input: CollectionInput!) {
      collectionCreate(input: $input) {
        collection { id handle }
        userErrors { field message }
      }
    }`,
    {
      input: {
        handle: cat.slug,
        title: cat.titulo,
        descriptionHtml: `<p>${cat.descripcion}</p>`,
        ruleSet: {
          appliedDisjunctively: false,
          rules: [
            { column: "TAG", relation: "EQUALS", condition: `cat-${cat.slug}` },
          ],
        },
      },
    },
  );
  const errs = d.collectionCreate.userErrors;
  if (errs.length) {
    throw new Error(`No se pudo crear ${cat.slug}: ` + JSON.stringify(errs));
  }
  return { id: d.collectionCreate.collection.id, creada: true };
}

async function main() {
  const productos = await listarProductos();
  console.log(`Tienda: ${STORE_DOMAIN}`);
  console.log(`Productos Nu Skin: ${productos.length}\n`);

  const reparto = {};
  const plan = [];
  for (const p of productos) {
    const cat = categoriaDe(p);
    reparto[cat] = (reparto[cat] || 0) + 1;
    const tag = `cat-${cat}`;
    const yaTiene = p.tags.includes(tag);
    // Un producto sólo puede estar en una categoria: si tenia otra, se quita.
    const sobrantes = p.tags.filter((t) => t.startsWith("cat-") && t !== tag);
    if (!yaTiene || sobrantes.length) plan.push({ p, tag, sobrantes });
  }

  console.log("Reparto:");
  for (const c of CATEGORIAS) {
    console.log(`  ${c.titulo.padEnd(24)} ${String(reparto[c.slug] || 0).padStart(3)}`);
  }
  console.log(`\nProductos a etiquetar: ${plan.length}\n`);

  if (DRY) {
    for (const c of CATEGORIAS) {
      console.log(`\n=== ${c.titulo} ===`);
      for (const p of productos.filter((x) => categoriaDe(x) === c.slug)) {
        console.log(`  ${p.status === "ACTIVE" ? "●" : "○"} ${p.title}`);
      }
    }
    console.log("\nModo --dry: no se escribio nada.");
    return;
  }

  for (const cat of CATEGORIAS) {
    const r = await asegurarColeccion(cat);
    console.log(`  ${r.creada ? "✓ creada" : "· ya existia"}  ${cat.slug}`);
  }
  console.log();

  let ok = 0;
  let errores = 0;
  for (const { p, tag, sobrantes } of plan) {
    try {
      if (sobrantes.length) {
        await adminGraphQL(
          `mutation($id: ID!, $tags: [String!]!) {
            tagsRemove(id: $id, tags: $tags) { userErrors { message } }
          }`,
          { id: p.id, tags: sobrantes },
        );
      }
      const d = await adminGraphQL(
        `mutation($id: ID!, $tags: [String!]!) {
          tagsAdd(id: $id, tags: $tags) { userErrors { message } }
        }`,
        { id: p.id, tags: [tag] },
      );
      const errs = d.tagsAdd.userErrors;
      if (errs.length) {
        errores += 1;
        console.error(`  ✗ ${p.title} — ${JSON.stringify(errs)}`);
        continue;
      }
      ok += 1;
      console.log(`  ✓ ${p.title} → ${tag}`);
    } catch (err) {
      errores += 1;
      console.error(`  ✗ ${p.handle} — ${err.message}`);
    }
  }

  console.log(`\n--- Resumen ---\nEtiquetados: ${ok} · Errores: ${errores}`);
  console.log(
    "\nLas colecciones automaticas tardan unos segundos en recalcular." +
      "\nRecuerda que COLLECTION_HANDLES en apps/shop/lib/shopify.ts gobierna" +
      " que categorias ve la tienda: hay que incluir estos handles ahi.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

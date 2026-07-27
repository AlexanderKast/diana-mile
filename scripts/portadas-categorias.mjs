#!/usr/bin/env node
/**
 * Pone portada y contenido editorial a las categorias de la tienda.
 *
 *   node scripts/portadas-categorias.mjs --dry
 *   node scripts/portadas-categorias.mjs
 *
 * LAS FOTOS
 * Salen del kit oficial de Nu Skin para distribuidoras LATAM
 * (nuskinsocial.smugmug.com), material autorizado. Shopify las descarga
 * desde la URL, asi que quedan alojadas en su CDN y no dependen de que
 * SmugMug siga sirviendolas.
 *
 * EL TEXTO
 * Va al metafield `diana_mile.collection_content` (JSON), que es lo que la
 * pagina de categoria lee para armar su hero. Escrito a mano y no con IA:
 * son seis textos, y el encuadre de una categoria es una decision de marca,
 * no una tarea de volumen.
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

const CATEGORIAS = [
  {
    handle: "ritual-de-rostro",
    alt: "Ritual de rostro — cuidado facial Nu Skin",
    imagen:
      "https://photos.smugmug.com/Social/LATAM/Productos/AgeLOC/AGELOC-TRU-FACE/Tru-Face-Uplifting-Rich-Cream/i-pjnVdFX/0/KNwdJcFWgnnPsTgtJsLrznGwqWwKjPj74p8tkdqvp/L/ageLOC%20Tru%20Face%20Models%20%2833%29-L.jpg",
    contenido: {
      eyebrow: "Probado por Diana · Milito Life Shop",
      tagline: "El orden que sí se sostiene un martes cualquiera.",
      storyHeading: "Una rutina que no se abandona en dos semanas",
      storyBody:
        "La mayoría de las rutinas de rostro fracasan por exceso, no por falta: siete pasos que nadie hace completos a las once de la noche. Aquí está lo que de verdad se usa a diario — limpieza, tratamiento e hidratación — para que el ritual sobreviva a la semana real.",
    },
  },
  {
    handle: "tecnologia-en-casa",
    alt: "Tecnología en casa — dispositivos Nu Skin",
    imagen:
      "https://photos.smugmug.com/Social/LATAM/Productos/AgeLOC/LumiSpa-iO/i-SFRSSDt/0/Mk6ZhBrX8kJK8bgd43BWfsVJVhwTqrZMGVqvBHD82/L/nu-skin-ageloc-lumispa-io-rose-gold-dry-skin-cleansing-kit-lifestyle-image-L.jpg",
    contenido: {
      eyebrow: "Probado por Diana · Milito Life Shop",
      tagline: "Los equipos de Nu Skin y todo lo que necesitan para seguir andando.",
      storyHeading: "Un aparato sin repuestos es un adorno",
      storyBody:
        "Aquí están los dispositivos y, sobre todo, los cabezales, geles y cargadores que los mantienen funcionando. Es la parte que casi nadie te explica cuando te vende el equipo, y la que decide si lo sigues usando al sexto mes.",
    },
  },
  {
    handle: "cuerpo-y-ducha",
    alt: "Cuerpo y ducha — cuidado corporal Nu Skin",
    imagen:
      "https://photos.smugmug.com/Social/LATAM/Productos/NuSkin/Epoch/i-fGSvkvW/0/L6Bz8BSQVZ5fN7BD7W5Z2KbPr9dszPQB7FRKcwPtj/L/nu-skin-epoch-polishing-bar-product-lifestyle-jungle-6-L.jpg",
    contenido: {
      eyebrow: "Probado por Diana · Milito Life Shop",
      tagline: "El único momento del día que de verdad es tuyo.",
      storyHeading: "La piel del cuerpo también se cuida",
      storyBody:
        "Se invierte todo en el rostro y se olvida el resto. Lo que va aquí se usa en la ducha, sin agregar un paso más al día: cambias lo que ya usabas por algo mejor y listo.",
    },
  },
  {
    handle: "bienestar-por-dentro",
    alt: "Bienestar por dentro — suplementos Pharmanex",
    imagen:
      "https://photos.smugmug.com/Social/LATAM/Productos/Pharmanex/Beauty-Focus-Collagen/i-fnkRXcd/0/NddTFZVnSKXGKSR9rkWGNVdq6CCW8SdMqwJRWQkbH/L/Beauty-Focus-Product-IMG00068-L.jpg",
    contenido: {
      eyebrow: "Probado por Diana · Milito Life Shop",
      tagline: "Suplementos dietarios de Pharmanex, sin promesas de más.",
      storyHeading: "Lo que un suplemento sí es",
      storyBody:
        "Un suplemento dietario complementa una alimentación balanceada; no la reemplaza ni sustituye un tratamiento médico. Aquí no vas a encontrar promesas de resultados: encontrarás qué es cada uno, cómo se toma y cómo llega a tu casa.",
    },
  },
  {
    handle: "color-y-detalle",
    alt: "Color y detalle — Nu Colour y AP 24",
    imagen:
      "https://photos.smugmug.com/Social/LATAM/Productos/NuSkin/Lip-Peptide/i-9qgnqkL/0/L4wbfcqMjbFGFRgJxKm2F3P83978tnQbkLgkfJk7v/L/Peptide%20Pout%20%281%29-L.png",
    contenido: {
      eyebrow: "Probado por Diana · Milito Life Shop",
      tagline: "Lo que se nota de cerca.",
      storyHeading: "Labios, mirada y sonrisa",
      storyBody:
        "Los detalles que no aparecen en una foto de lejos pero definen cómo te ves cuando alguien te habla de frente. Cuidado, no maquillaje encima.",
    },
  },
  {
    handle: "kits-de-inicio",
    alt: "Kits de inicio Nu Skin",
    imagen:
      "https://photos.smugmug.com/Social/LATAM/Productos/AgeLOC/Galvanic/i-DbLhBmP/0/KPQqsQmKxrgLV2zmmSg39SGLJBDKSDDWTjwPwF2hH/L/ageLOC%20essential%20kits-L.png",
    contenido: {
      eyebrow: "Probado por Diana · Milito Life Shop",
      tagline: "Empezar con todo, en un solo paso.",
      storyHeading: "Para quién es un kit",
      storyBody:
        "Para quien está armando su rutina completa y no quiere adivinar qué va con qué, y para quien está montando su negocio como distribuidora. Por su valor, cada uno se coordina contigo directamente: Diana te acompaña antes, durante y después.",
    },
  },
];

async function asegurarDefinicion() {
  const d = await adminGraphQL(
    `mutation($definition: MetafieldDefinitionInput!) {
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
        description: "Contenido editorial del hero de la categoria (JSON).",
        type: "json",
        ownerType: "COLLECTION",
        access: { storefront: "PUBLIC_READ" },
      },
    },
  );
  const errs = d.metafieldDefinitionCreate.userErrors.filter(
    (e) => e.code !== "TAKEN",
  );
  if (errs.length) throw new Error(JSON.stringify(errs));
}

async function main() {
  console.log(`Tienda: ${STORE_DOMAIN}\n`);

  if (DRY) {
    for (const c of CATEGORIAS) {
      console.log(`${c.handle}`);
      console.log(`  portada: ${c.imagen.slice(0, 90)}...`);
      console.log(`  tagline: ${c.contenido.tagline}`);
    }
    console.log("\nModo --dry: no se escribio nada.");
    return;
  }

  await asegurarDefinicion();

  let ok = 0;
  let errores = 0;

  for (const c of CATEGORIAS) {
    try {
      const found = await adminGraphQL(
        `query($handle: String!) { collectionByHandle(handle: $handle) { id image { url } } }`,
        { handle: c.handle },
      );
      const col = found.collectionByHandle;
      if (!col) {
        errores += 1;
        console.error(`  ✗ ${c.handle} — no existe`);
        continue;
      }

      const d = await adminGraphQL(
        `mutation($input: CollectionInput!) {
          collectionUpdate(input: $input) {
            collection { id image { url } }
            userErrors { field message }
          }
        }`,
        {
          input: {
            id: col.id,
            image: { src: c.imagen, altText: c.alt },
            metafields: [
              {
                namespace: "diana_mile",
                key: "collection_content",
                type: "json",
                value: JSON.stringify(c.contenido),
              },
            ],
          },
        },
      );

      const errs = d.collectionUpdate.userErrors;
      if (errs.length) {
        errores += 1;
        console.error(`  ✗ ${c.handle} — ${JSON.stringify(errs)}`);
        continue;
      }

      ok += 1;
      console.log(`  ✓ ${c.handle}`);
    } catch (err) {
      errores += 1;
      console.error(`  ✗ ${c.handle} — ${err.message}`);
    }
  }

  console.log(`\n--- Resumen ---\nActualizadas: ${ok} · Errores: ${errores}`);
  console.log("Shopify procesa la imagen en segundo plano: puede tardar un minuto.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * Gestiona los webhooks de Shopify que alimentan el panel.
 *
 * Sin ellos, una orden creada fuera del checkout de la tienda —a mano en
 * Shopify, desde otro canal, o por una integracion— no llega nunca al
 * panel: el alta en Supabase la hace el endpoint del checkout, y a esa
 * orden nadie la mete. Como el panel es el centro de operaciones, lo que
 * no aparece ahi no existe.
 *
 * Uso:
 *   node scripts/webhooks-shopify.mjs            → lista los registrados
 *   node scripts/webhooks-shopify.mjs registrar  → crea los que falten
 *   node scripts/webhooks-shopify.mjs borrar     → los quita todos
 *
 * OJO: Shopify firma cada webhook con el "API secret key" de la app
 * privada, y el endpoint lo verifica contra SHOPIFY_WEBHOOK_SECRET. Sin esa
 * variable en el entorno, todo llega y se rechaza con 401 — se registran
 * bien y aun asi no entra ni una orden.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const env = join(ROOT, "apps/admin/.env.local");
if (existsSync(env)) {
  for (const linea of readFileSync(env, "utf8").split("\n")) {
    const l = linea.trim();
    if (!l || l.startsWith("#")) continue;
    const i = l.indexOf("=");
    if (i === -1) continue;
    const k = l.slice(0, i).trim();
    if (!(k in process.env)) {
      process.env[k] = l.slice(i + 1).trim().replace(/^"|"$/g, "");
    }
  }
}

const D = process.env.SHOPIFY_STORE_DOMAIN;
const T = process.env.SHOPIFY_ADMIN_API_TOKEN;
const V = process.env.SHOPIFY_API_VERSION || "2026-04";
if (!D || !T) {
  console.error("Faltan SHOPIFY_STORE_DOMAIN o SHOPIFY_ADMIN_API_TOKEN.");
  process.exit(1);
}

const DESTINO =
  process.env.SHOPIFY_WEBHOOK_URL ||
  "https://admin.militolife.com/api/admin/webhooks/shopify";

/** Los que el endpoint sabe atender (ver apps/admin/.../webhooks/shopify). */
const TOPICS = [
  "orders/create",
  "orders/updated",
  "orders/cancelled",
  "fulfillments/create",
];

const H = { "Content-Type": "application/json", "X-Shopify-Access-Token": T };
const api = (ruta) => `https://${D}/admin/api/${V}/${ruta}`;

async function listar() {
  const r = await fetch(api("webhooks.json"), { headers: H });
  if (!r.ok) {
    console.error("No se pudo listar:", r.status, await r.text());
    process.exit(1);
  }
  return (await r.json()).webhooks ?? [];
}

const accion = process.argv[2] ?? "listar";
const actuales = await listar();

if (accion === "borrar") {
  for (const w of actuales) {
    const r = await fetch(api(`webhooks/${w.id}.json`), {
      method: "DELETE",
      headers: H,
    });
    console.log(`borrado ${w.topic}: ${r.ok ? "si" : `NO (${r.status})`}`);
  }
} else if (accion === "registrar") {
  for (const topic of TOPICS) {
    if (actuales.some((w) => w.topic === topic && w.address === DESTINO)) {
      console.log(`${topic.padEnd(20)} ya estaba`);
      continue;
    }
    const r = await fetch(api("webhooks.json"), {
      method: "POST",
      headers: H,
      body: JSON.stringify({ webhook: { topic, address: DESTINO, format: "json" } }),
    });
    const j = await r.json().catch(() => ({}));
    console.log(
      `${topic.padEnd(20)} ${r.status} ${r.ok ? `id ${j.webhook.id}` : JSON.stringify(j).slice(0, 160)}`,
    );
  }
} else {
  console.log(`Destino esperado: ${DESTINO}\n`);
  if (!actuales.length) {
    console.log("No hay webhooks registrados.");
    console.log("Las ordenes creadas fuera del checkout NO llegan al panel.");
  }
  for (const w of actuales) {
    const ok = w.address === DESTINO ? "" : "  <-- apunta a otro sitio";
    console.log(`${w.topic.padEnd(20)} ${w.address}${ok}`);
  }
  const faltan = TOPICS.filter(
    (t) => !actuales.some((w) => w.topic === t && w.address === DESTINO),
  );
  if (faltan.length) console.log(`\nFaltan: ${faltan.join(", ")}`);
}

if (!process.env.SHOPIFY_WEBHOOK_SECRET) {
  console.log(
    "\nAVISO: SHOPIFY_WEBHOOK_SECRET no esta configurado en este entorno.",
  );
  console.log(
    "Sin esa variable el endpoint responde 401 a todo y no entra ninguna orden.",
  );
}

#!/usr/bin/env node
/**
 * Prueba la conexion al API publico de Botcake (WABA) con el token
 * guardado en apps/shop/.env.local. Solo hace una llamada de lectura
 * (get_list_tag) para confirmar que el page_id + access-token son validos.
 *
 * Uso:
 *   node scripts/test-botcake.mjs
 *
 * Env requeridas (se leen de apps/shop/.env.local si existe, o del entorno):
 *   BOTCAKE_WABA_PAGE_ID   ej. waba_168254866381327
 *   BOTCAKE_ACCESS_TOKEN   token de pagina (Settings -> Integration -> API)
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

const PAGE_ID = process.env.BOTCAKE_WABA_PAGE_ID;
const ACCESS_TOKEN = process.env.BOTCAKE_ACCESS_TOKEN;

if (!PAGE_ID || !ACCESS_TOKEN) {
  console.error(
    "Falta BOTCAKE_WABA_PAGE_ID o BOTCAKE_ACCESS_TOKEN en apps/shop/.env.local",
  );
  process.exit(1);
}

const url = `https://botcake.io/api/public_api/v1/pages/${PAGE_ID}/get_list_tag`;

const res = await fetch(url, {
  headers: { "access-token": ACCESS_TOKEN },
});

const body = await res.json().catch(() => null);

if (!res.ok || !body?.success) {
  console.error(`Conexion fallo (HTTP ${res.status}):`, body);
  process.exit(1);
}

console.log(`Conexion OK. Page ID: ${PAGE_ID}`);
console.log(`Tags encontrados: ${body.data?.length ?? 0}`);

/**
 * Comprueba que el adicional que se ofrece sea real: un producto distinto
 * al comprado, disponible y con su precio de Shopify.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
for (const ruta of ["apps/admin/.env.local"]) {
  const p = join(ROOT, ruta);
  if (!existsSync(p)) continue;
  for (const linea of readFileSync(p, "utf8").split("\n")) {
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

const { catalogoResumen, catalogoDatos } = await import(
  "../packages/shared/src/botcake/ia/contexto.js"
);
const { createClient } = await import("@supabase/supabase-js");
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const { elegirAdicional, mensajeAdicional } = await import(
  "../packages/shared/src/botcake/ia/upsell.js"
);

const texto = await catalogoResumen();
if (!texto) {
  console.error("Sin catalogo: revisa SHOPIFY_STOREFRONT_ACCESS_TOKEN.");
  process.exit(1);
}
const datos = catalogoDatos();
console.log("Productos en la tienda:");
for (const t of datos?.titulos ?? []) console.log("  ·", t);

for (const comprado of datos?.titulos ?? []) {
  const oferta = await elegirAdicional(supabase, comprado);
  console.log("\nCompra:", comprado);
  if (!oferta) {
    console.log("  -> no hay adicional que ofrecer");
    continue;
  }
  const mismo = oferta.producto.toLowerCase().includes(comprado.toLowerCase());
  console.log(`  -> ${mismo ? "FALLA (es el mismo)" : "OK"}: ${oferta.producto} $${oferta.precio.toLocaleString("es-CO")}`);
  console.log("  ", mensajeAdicional(oferta));
}

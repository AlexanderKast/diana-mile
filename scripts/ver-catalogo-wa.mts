/**
 * Muestra el catalogo exactamente como lo recibe el agente de WhatsApp.
 * Sirve para verificar que los precios que va a citar coinciden con los de
 * la tienda antes de que se los diga a una clienta.
 *
 * Uso: npx tsx scripts/ver-catalogo-wa.mts
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function cargarEnv(ruta: string) {
  if (!existsSync(ruta)) return;
  for (const linea of readFileSync(ruta, "utf8").split("\n")) {
    const l = linea.trim();
    if (!l || l.startsWith("#")) continue;
    const i = l.indexOf("=");
    if (i === -1) continue;
    const clave = l.slice(0, i).trim();
    let valor = l.slice(i + 1).trim();
    if (valor.startsWith('"') && valor.endsWith('"')) valor = valor.slice(1, -1);
    if (!(clave in process.env)) process.env[clave] = valor;
  }
}
cargarEnv(join(ROOT, "apps/admin/.env.local"));
cargarEnv(join(ROOT, "apps/shop/.env.local"));

const { catalogoResumen } = await import(
  "../packages/shared/src/botcake/ia/contexto"
);

const catalogo = await catalogoResumen();
console.log(catalogo ?? "SIN CATALOGO — el agente no podra dar precios");

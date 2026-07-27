/**
 * Prueba la resolucion de producto y la validacion de datos del pedido
 * por WhatsApp, SIN crear ordenes reales en Shopify.
 *
 * Uso: npx tsx scripts/probar-pedido-wa.mts
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

const { resolverVariante } = await import(
  "../packages/shared/src/botcake/ia/pedido"
);
const { validarDatosPedido } = await import(
  "../packages/shared/src/botcake/ia/datos-pedido"
);

console.log("═══ Resolucion de producto (como lo dice la clienta) ═══\n");
const casos: [string, string | null][] = [
  ["barra exfoliante Epoch", "pack de 2"],
  ["epoch polishing bar", null],
  ["la barra exfoliante", "2 unidades"],
  ["base coreana", null],
  ["maquina de afeitar", null],
  ["base ocheal", null],
  ["serum de vitamina C que no existe", null],
];

for (const [producto, presentacion] of casos) {
  const v = await resolverVariante(producto, presentacion);
  const etiqueta = `"${producto}"${presentacion ? ` + "${presentacion}"` : ""}`;
  console.log(
    v
      ? `✓ ${etiqueta}\n   → ${v.productoTitulo} · ${v.varianteTitulo} · $${v.precio.toLocaleString("es-CO")}\n     ${v.variantId}`
      : `✗ ${etiqueta}\n   → no se pudo identificar (el agente debe preguntar)`,
  );
}

console.log("\n═══ Validacion de datos ═══\n");
const pedidos = [
  {
    caso: "completo y bien escrito",
    datos: {
      nombre: "Laura Gómez",
      telefono: "3132947776",
      departamento: "Antioquia",
      ciudad: "Medellín",
      barrio: "El Poblado",
      direccion: "Calle 10 #43-25 apto 502",
    },
  },
  {
    caso: "con erratas (debe corregirse solo)",
    datos: {
      nombre: "Laura Gomez",
      telefono: "313-294.7776",
      departamento: "antioqia",
      ciudad: "medellin",
      barrio: "poblado",
      direccion: "Calle 10 #43-25",
    },
  },
  {
    caso: "sin departamento (se deduce de la ciudad)",
    datos: {
      nombre: "Laura Gómez",
      telefono: "3132947776",
      ciudad: "Bogota",
      barrio: "Chapinero",
      direccion: "Carrera 13 #63-39",
    },
  },
  {
    caso: "incompleto (debe pedir lo que falta)",
    datos: { nombre: "Laura", telefono: "601234", ciudad: "Medellín" },
  },
];

for (const { caso, datos } of pedidos) {
  const r = validarDatosPedido(datos);
  console.log(`${r.ok ? "✓" : "✗"} ${caso}`);
  if (r.ok) {
    console.log(
      `   → ${r.datos.nombre} · ${r.datos.telefonoE164} · ${r.datos.departamento} / ${r.datos.ciudad}`,
    );
  } else {
    console.log(
      `   → falta: ${r.faltantes.join(", ") || "—"}${r.problemas.length ? ` · problemas: ${r.problemas.join("; ")}` : ""}`,
    );
  }
}

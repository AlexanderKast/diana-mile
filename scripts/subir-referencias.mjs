/**
 * Sube la biblioteca de referencias de layout de "Landing magica" al bucket
 * PRIVADO de Supabase Storage y la registra en `referencias_secciones`.
 *
 * Son capturas que alimentan al modelo de imagen como inspiracion de
 * composicion: nunca se muestran al usuario ni se publican. Por eso el
 * bucket es privado y el generador las lee con download() del SDK.
 *
 * Es IDEMPOTENTE (upsert en Storage y en la tabla): re-correrlo es seguro.
 *
 * Uso:
 *   node scripts/subir-referencias.mjs "F:\\Descargas"
 *   node scripts/subir-referencias.mjs "F:\\Descargas" --dry
 *   node scripts/subir-referencias.mjs "F:\\Descargas" --solo hero
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function cargarEnv(ruta) {
  if (!existsSync(ruta)) return;
  for (const linea of readFileSync(ruta, "utf8").split("\n")) {
    const l = linea.trim();
    if (!l || l.startsWith("#")) continue;
    const i = l.indexOf("=");
    if (i === -1) continue;
    const k = l.slice(0, i).trim();
    const v = l.slice(i + 1).trim().replace(/^"|"$/g, "");
    if (!(k in process.env)) process.env[k] = v;
  }
}
cargarEnv(join(ROOT, "apps/admin/.env.local"));

/**
 * Mapeo carpeta -> tipo de seccion. Cada carpeta alimenta al tipo del mismo
 * nombre; el orden aqui es el del catalogo de secciones.
 */
const CARPETAS = [
  { carpeta: "Hero", tipo: "hero" },
  { carpeta: "Oferta", tipo: "oferta" },
  { carpeta: "Beneficios", tipo: "beneficios" },
  { carpeta: "Tabla comparativa", tipo: "comparativa" },
  { carpeta: "Prueba de autoridad", tipo: "autoridad" },
  { carpeta: "Modo de uso", tipo: "uso" },
  { carpeta: "Testimonios", tipo: "testimonios" },
  { carpeta: "Antes y despues", tipo: "antes_despues" },
  { carpeta: "Logistica", tipo: "logistica" },
  { carpeta: "Preguntas frecuentes", tipo: "faq" },
];

const BUCKET = "referencias-secciones";
const CONCURRENCIA = 4;

const args = process.argv.slice(2);
const base = args.find((a) => !a.startsWith("--")) ?? "F:\\Descargas";
const dry = args.includes("--dry");
const soloIndex = args.indexOf("--solo");
const solo = soloIndex >= 0 ? args[soloIndex + 1] : null;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (apps/admin/.env.local).",
  );
  process.exit(1);
}
const supabase = createClient(url, key, { auth: { persistSession: false } });

/** Lista los PNG de una carpeta. Sin shell ni globs: los espacios y los
 *  acentos de las rutas de Windows no dan problema. */
function listarPng(carpeta) {
  const ruta = join(base, carpeta);
  if (!existsSync(ruta)) {
    console.warn(`  ! carpeta no encontrada: ${ruta}`);
    return [];
  }
  return readdirSync(ruta)
    .filter((n) => /\.png$/i.test(n))
    // NFC: Windows puede entregar los acentos descompuestos y entonces la
    // misma ruta no coincidiria con la ya guardada en la tabla.
    .map((n) => n.normalize("NFC"));
}

async function subirUno({ carpeta, tipo, archivo }) {
  const rutaLocal = join(base, carpeta, archivo);
  const rutaStorage = `${tipo}/${archivo}`;

  const buffer = readFileSync(rutaLocal);
  const { error: errorSubida } = await supabase.storage
    .from(BUCKET)
    .upload(rutaStorage, buffer, { contentType: "image/png", upsert: true });
  if (errorSubida) throw new Error(`storage: ${errorSubida.message}`);

  const { error: errorFila } = await supabase
    .from("referencias_secciones")
    .upsert(
      { tipo_seccion: tipo, ruta_storage: rutaStorage, carpeta_origen: carpeta },
      { onConflict: "ruta_storage" },
    );
  if (errorFila) throw new Error(`tabla: ${errorFila.message}`);
}

async function main() {
  const trabajos = [];
  for (const { carpeta, tipo } of CARPETAS) {
    if (solo && tipo !== solo) continue;
    const archivos = listarPng(carpeta);
    console.log(`${carpeta} -> ${tipo}: ${archivos.length} archivos`);
    for (const archivo of archivos) trabajos.push({ carpeta, tipo, archivo });
  }

  console.log(`\nTotal: ${trabajos.length} referencias${dry ? " (dry run)" : ""}`);
  if (dry || trabajos.length === 0) return;

  let subidas = 0;
  let fallidas = 0;
  const cola = [...trabajos];

  const trabajador = async () => {
    for (;;) {
      const trabajo = cola.shift();
      if (!trabajo) return;
      try {
        await subirUno(trabajo);
        subidas++;
      } catch (error) {
        // Un reintento: casi siempre es un corte de red puntual.
        try {
          await subirUno(trabajo);
          subidas++;
        } catch (segundo) {
          fallidas++;
          console.error(`  x ${trabajo.archivo}: ${segundo.message}`);
        }
      }
      if (subidas % 25 === 0) console.log(`  ... ${subidas}/${trabajos.length}`);
    }
  };

  await Promise.all(
    Array.from({ length: CONCURRENCIA }, () => trabajador()),
  );

  console.log(`\nSubidas: ${subidas} · Fallidas: ${fallidas}`);

  const { data } = await supabase
    .from("referencias_secciones")
    .select("tipo_seccion");
  const conteo = {};
  for (const fila of data ?? []) {
    conteo[fila.tipo_seccion] = (conteo[fila.tipo_seccion] ?? 0) + 1;
  }
  console.log("En la biblioteca:", conteo);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

/**
 * Importa la matriz de cobertura de Grupo EFI a Supabase.
 *
 * Consolida las ocho hojas —una por transportadora— en una sola tabla por
 * ciudad de destino, porque para atender a una clienta no importa que hace
 * cada transportadora sino dos cosas:
 *   · ¿se le puede cobrar al recibir? (basta con que UNA lo permita)
 *   · ¿en cuantos dias le llega? (el mejor tiempo entre las que cubren)
 *
 * Todo se filtra por origen Medellin, que es de donde sale el despacho.
 *
 * Uso: node scripts/importar-cobertura.mjs "<ruta del .xlsb>"
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";
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

const archivo = process.argv[2];
if (!archivo || !existsSync(archivo)) {
  console.error("Falta la ruta del archivo .xlsb");
  process.exit(1);
}

const clave = (t) =>
  String(t ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    // "(ANT)" o "(C/MARCA)" son sufijos de departamento que estorban al comparar
    .replace(/\([^)]*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();

const esMedellin = (t) => clave(t) === "medellin";

/** Ciudades que se despachan desde Medellin en 1 o 2 dias. */
const VALLE_DE_ABURRA = new Set([
  "medellin", "itagui", "sabaneta", "envigado", "bello",
  "la estrella", "caldas", "copacabana", "girardota", "barbosa",
]);

const wb = XLSX.readFile(archivo);
const hoja = (n) =>
  wb.Sheets[n]
    ? XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, blankrows: false })
    : [];

/** ciudad_clave → datos consolidados */
const ciudades = new Map();

function anotar(ciudadCruda, { recaudo, dias, departamento, transportadora }) {
  const k = clave(ciudadCruda);
  if (!k || k.length < 2) return;

  const previo = ciudades.get(k) ?? {
    ciudad_clave: k,
    ciudad: String(ciudadCruda).replace(/\([^)]*\)/g, "").trim(),
    departamento: null,
    recaudo: false,
    dias_min: null,
    dias_max: null,
    transportadoras: new Set(),
  };

  if (recaudo) {
    previo.recaudo = true;
    // Solo cuentan los tiempos de quien SI cobra al recibir: el tiempo de
    // una transportadora que no hace recaudo no le sirve a la clienta,
    // porque por ahi no se le puede despachar.
    if (typeof dias === "number" && dias > 0 && dias < 30) {
      previo.dias_min =
        previo.dias_min === null ? dias : Math.min(previo.dias_min, dias);
      previo.dias_max =
        previo.dias_max === null ? dias : Math.max(previo.dias_max, dias);
    }
    if (transportadora) previo.transportadoras.add(transportadora);
  }

  if (departamento && !previo.departamento) {
    previo.departamento = String(departamento).trim();
  }

  ciudades.set(k, previo);
}

// ── ENVIA: matriz ancha, la columna 1 marca si hace reparto con recaudo ──
{
  const filas = hoja("ENVIA");
  let n = 0;
  for (const f of filas.slice(1)) {
    if (!f[0]) continue;
    const m = String(f[0]).match(/^(.*?)\s*\(([^)]+)\)\s*$/);
    anotar(m ? m[1] : f[0], {
      recaudo: Boolean(f[1]),
      departamento: m ? m[2] : null,
      transportadora: "Envía",
    });
    n++;
  }
  console.log(`ENVIA: ${n} ciudades`);
}

// ── INTER RAPIDISIMO: trae dias y contraentrega explicita ────────────────
{
  const filas = hoja("INTER RAPIDISIMO");
  const c = filas[0] ?? [];
  const iOrigen = c.indexOf("CIUDAD ORIGEN");
  const iDestino = c.indexOf("CIUDAD DESTINO");
  const iDias = c.findIndex((x) => String(x).includes("ANS"));
  const iContra = c.indexOf("CONTRAENTREGA");
  const iDepto = c.indexOf("DPTO");

  let n = 0;
  for (const f of filas.slice(1)) {
    if (!esMedellin(f[iOrigen])) continue;
    anotar(f[iDestino], {
      recaudo: String(f[iContra]).toUpperCase().startsWith("SI"),
      dias: Number(f[iDias]),
      departamento: f[iDepto],
      transportadora: "Inter Rapidísimo",
    });
    n++;
  }
  console.log(`INTER RAPIDISIMO: ${n} destinos desde Medellín`);
}

// ── SERVIENTREGA CON RECAUDO: por definicion todas cobran al recibir ─────
{
  const filas = hoja("SERVIENTREGA CON RECAUDO");
  const c = filas[0] ?? [];
  const iOrigen = c.indexOf("CIUDAD ORIGEN");
  const iDestino = c.indexOf("CIUDAD DESTINO");
  const iDias = c.indexOf("TIEMPO ENTREGA");
  const iDepto = c.indexOf("DEPARTAMENTO DESTINO");

  let n = 0;
  for (const f of filas.slice(1)) {
    if (!esMedellin(f[iOrigen])) continue;
    anotar(f[iDestino], {
      recaudo: true,
      dias: Number(f[iDias]),
      departamento: f[iDepto],
      transportadora: "Servientrega",
    });
    n++;
  }
  console.log(`SERVIENTREGA: ${n} destinos desde Medellín`);
}

// ── DOMINA: aporta la ciudad, pero la hoja no dice si hace recaudo ───────
{
  const filas = hoja("DOMINA");
  const c = filas[0] ?? [];
  const iOrigen = c.indexOf("CIUDAD ORIGEN");
  const iDestino = c.indexOf("CIUDAD DESTINO");
  const iDepto = c.indexOf("DEPTO DESTINO");

  let n = 0;
  for (const f of filas.slice(1)) {
    if (!esMedellin(f[iOrigen])) continue;
    anotar(f[iDestino], { recaudo: false, departamento: f[iDepto] });
    n++;
  }
  console.log(`DOMINA: ${n} destinos desde Medellín`);
}

// ── TCC: reparto con recaudo por ciudad de destino ───────────────────────
{
  const filas = hoja("TCC");
  const c = filas[0] ?? [];
  const iDestino = c.indexOf("CIUDAD DESTINO");
  const iDepto = c.indexOf("DEPARTAMENTO DESTINO");
  const iRecaudo = c.findIndex((x) => String(x).includes("RECAUDO"));

  let n = 0;
  for (const f of filas.slice(1)) {
    if (!f[iDestino]) continue;
    anotar(f[iDestino], {
      recaudo: String(f[iRecaudo]).toUpperCase().startsWith("SI"),
      departamento: f[iDepto],
      transportadora: "TCC",
    });
    n++;
  }
  console.log(`TCC: ${n} filas`);
}

// ── Consolidar y aplicar los tiempos del negocio ─────────────────────────
const lista = [];
for (const c of ciudades.values()) {
  const enAburra = VALLE_DE_ABURRA.has(c.ciudad_clave);

  // Manda la operacion real, no el ANS de la matriz: el despacho sale de
  // Medellin, asi que el Valle de Aburra recibe en 1-2 dias y el resto del
  // pais entre 3 y 5. Los ANS de las transportadoras son optimistas —hay
  // quien promete Bogota en un dia— y prometer de menos genera reclamos.
  //
  // La matriz si se respeta cuando avisa que un destino es MAS lento que
  // eso: son los pueblos apartados, donde el ANS refleja la realidad.
  let diasMin = enAburra ? 1 : 3;
  let diasMax = enAburra ? 2 : 5;

  if (!enAburra && c.dias_max !== null && c.dias_max > diasMax) {
    diasMin = Math.max(diasMin, c.dias_min ?? diasMin);
    diasMax = c.dias_max;
  }

  lista.push({
    ciudad_clave: c.ciudad_clave,
    ciudad: c.ciudad,
    departamento: c.departamento,
    recaudo: c.recaudo,
    dias_min: diasMin,
    dias_max: diasMax,
    transportadora: [...c.transportadoras].join(", ") || null,
  });
}

const conRecaudo = lista.filter((r) => r.recaudo);
console.log("");
console.log(`Ciudades consolidadas: ${lista.length}`);
console.log(`  con pago contraentrega: ${conRecaudo.length}`);
console.log(`  sin contraentrega: ${lista.length - conRecaudo.length}`);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

for (let i = 0; i < lista.length; i += 500) {
  const lote = lista.slice(i, i + 500);
  const { error } = await supabase
    .from("cobertura_entrega")
    .upsert(lote, { onConflict: "ciudad_clave" });
  if (error) {
    console.error("Error en el lote", i, error.message);
    process.exit(1);
  }
}
console.log(`Importadas ${lista.length} ciudades.`);

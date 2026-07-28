#!/usr/bin/env node
/**
 * Baja el peso de las fotos que viven en `public/` de cualquiera de las apps.
 *
 *   node scripts/optimizar-imagenes.mjs            # revisa y reescribe
 *   node scripts/optimizar-imagenes.mjs --revisar  # solo dice que haria
 *
 * POR QUE EXISTE
 * Las fotos entraban al repo tal cual salieron de la camara: `hero-home.jpg`
 * pesaba 2,2 MB y entre seis archivos sumaban casi 8 MB. Next redimensiona al
 * servir, asi que la clienta nunca descargaba esos 2,2 MB — pero el repo si
 * los carga, el build tiene que procesarlos y cada `next dev` frio se demora
 * en optimizarlos la primera vez que alguien abre la pagina.
 *
 * EL ANCHO MAXIMO
 * 2000px. El uso mas grande de una de estas fotos es el hero a 45vw de
 * escritorio (~720px) y a pantalla completa en movil (~430px). Con pantallas
 * de densidad 2x eso son ~1440px. 2000 deja margen para un monitor grande sin
 * guardar el doble de pixeles de los que alguien va a ver. Las de `ritual-paso`
 * ademas se suben a Shopify desde `apps/shop/scripts/push-epoch-real-photos.ts`
 * y 2000px tambien le sobra a Shopify.
 *
 * NO TOCA
 * Nada por debajo de `MINIMO_KB`: comprimir una foto ya liviana solo le quita
 * calidad. Y nada que no sea jpg — el unico png del repo pesa 26 KB.
 *
 * sharp entra como dependencia de Next, no del proyecto. Se usa SOLO aqui, en
 * un script que se corre a mano — igual que `procesar-foto-diana.mjs`.
 */

import sharp from "sharp";
import { readdirSync, statSync, renameSync, unlinkSync } from "node:fs";
import { join, dirname, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ANCHO_MAX = 2000;
const CALIDAD = 82;
const MINIMO_KB = 250;
const soloRevisar = process.argv.includes("--revisar");

/** Recorre `apps/<app>/public` sin meterse en node_modules. */
function buscarImagenes(dir, encontradas = []) {
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    if (entrada.name === "node_modules" || entrada.name.startsWith(".")) continue;
    const ruta = join(dir, entrada.name);
    if (entrada.isDirectory()) {
      buscarImagenes(ruta, encontradas);
    } else if ([".jpg", ".jpeg"].includes(extname(entrada.name).toLowerCase())) {
      encontradas.push(ruta);
    }
  }
  return encontradas;
}

const apps = readdirSync(join(ROOT, "apps"), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => join(ROOT, "apps", d.name, "public"))
  .filter((p) => {
    try {
      return statSync(p).isDirectory();
    } catch {
      return false;
    }
  });

const imagenes = apps.flatMap((p) => buscarImagenes(p));

let antesTotal = 0;
let despuesTotal = 0;
let tocadas = 0;

for (const ruta of imagenes) {
  const antes = statSync(ruta).size;
  const relativa = ruta.replace(ROOT, ".").replace(/\\/g, "/");

  if (antes < MINIMO_KB * 1024) {
    console.log(`  ·  ${relativa} — ${Math.round(antes / 1024)} KB, se deja`);
    continue;
  }

  const meta = await sharp(ruta).metadata();
  antesTotal += antes;

  if (soloRevisar) {
    console.log(
      `  →  ${relativa} — ${meta.width}x${meta.height}, ${Math.round(antes / 1024)} KB`,
    );
    continue;
  }

  // A un archivo temporal primero: sharp no puede leer y escribir el mismo
  // archivo en la misma pasada, se lo come a medio procesar.
  const temporal = join(dirname(ruta), `.tmp-${basename(ruta)}`);

  await sharp(ruta)
    .rotate() // respeta la orientacion del EXIF antes de recortar nada
    .resize({ width: ANCHO_MAX, withoutEnlargement: true })
    .jpeg({ quality: CALIDAD, mozjpeg: true, progressive: true })
    .toFile(temporal);

  const despues = statSync(temporal).size;

  // Si comprimir no gano nada (foto ya optimizada), se descarta el intento.
  if (despues >= antes) {
    unlinkSync(temporal);
    despuesTotal += antes;
    console.log(`  ·  ${relativa} — ya estaba optimizada, se deja`);
    continue;
  }

  renameSync(temporal, ruta);
  despuesTotal += despues;
  tocadas++;

  const ahorro = Math.round((1 - despues / antes) * 100);
  console.log(
    `  ✓  ${relativa}\n     ${meta.width}x${meta.height} · ${Math.round(antes / 1024)} KB` +
      `  →  ${Math.min(meta.width, ANCHO_MAX)}px · ${Math.round(despues / 1024)} KB  (-${ahorro}%)`,
  );
}

if (soloRevisar) {
  console.log(`\nRevision: ${Math.round(antesTotal / 1024 / 1024)} MB en juego.`);
} else {
  const ahorro = antesTotal > 0 ? Math.round((1 - despuesTotal / antesTotal) * 100) : 0;
  console.log(
    `\n${tocadas} imagenes reescritas · ${(antesTotal / 1024 / 1024).toFixed(1)} MB` +
      ` → ${(despuesTotal / 1024 / 1024).toFixed(1)} MB  (-${ahorro}%)`,
  );
}

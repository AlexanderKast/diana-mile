#!/usr/bin/env node
/**
 * Prepara una foto de estudio para los tres sitios donde la web habla de Diana.
 *
 *   node scripts/procesar-foto-diana.mjs "F:/Fotos 03-07-2026/1B5A9470.JPG"
 *
 * POR QUE ESTE SCRIPT EXISTE
 * Hasta hoy el sitio no tenia ninguna foto real de ella: el bloque de marca
 * estaba resuelto solo con tipografia y el linktree usaba una foto de stock de
 * producto como si fuera su perfil. Eso ultimo es lo peor que puede tener una
 * tienda que se sostiene sobre "yo lo probe primero".
 *
 * LA ROTACION
 * La camara marca la orientacion en el EXIF (`orientation=lower-left` = girar
 * 90°). Quien lea el archivo sin mirar el EXIF la ve acostada. `.rotate()` sin
 * argumentos aplica esa marca y la deja derecha de verdad, no solo "marcada
 * como derecha".
 *
 * sharp entra como dependencia de Next, no del proyecto. Se usa SOLO aqui, en
 * un script que se corre a mano — no en codigo de la aplicacion, donde
 * depender de un paquete que nadie declaro seria fragil.
 */

import sharp from "sharp";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const origen = process.argv[2];

if (!origen || !existsSync(origen)) {
  console.error("Pasa la ruta de la foto. Ej:");
  console.error('  node scripts/procesar-foto-diana.mjs "F:/Fotos/foto.JPG"');
  process.exit(1);
}

/**
 * Tres recortes, uno por uso real:
 *  · retrato 4:5  -> el bloque "Hola, soy Diana" y "Entrena con Diana"
 *  · cuadrado     -> el perfil del linktree
 *  · apaisado     -> imagen para compartir en redes (Open Graph)
 */
const SALIDAS = [
  {
    archivo: join(ROOT, "apps/shop/public/images/diana-retrato.jpg"),
    ancho: 1400,
    alto: 1750,
    // "top": en un retrato de estudio la cara esta arriba; recortar por el
    // centro le cortaria la frente.
    posicion: "top",
    nota: "retrato 4:5 para la tienda",
  },
  {
    archivo: join(ROOT, "apps/linktree/public/images/diana-profile.jpg"),
    ancho: 800,
    alto: 800,
    // "attention" busca la zona con mas informacion visual — en una foto de
    // persona, la cara. Para un avatar circular es lo unico que sirve.
    posicion: "attention",
    nota: "perfil cuadrado del linktree (reemplaza la foto de stock)",
  },
  {
    archivo: join(ROOT, "apps/shop/public/images/diana-og.jpg"),
    ancho: 1200,
    alto: 630,
    posicion: "top",
    nota: "imagen para compartir (Open Graph)",
  },
];

const meta = await sharp(origen).metadata();
console.log(`Origen: ${origen}`);
console.log(`  ${meta.width}x${meta.height} · EXIF orientation ${meta.orientation ?? "sin marca"}\n`);

for (const s of SALIDAS) {
  mkdirSync(dirname(s.archivo), { recursive: true });
  const info = await sharp(origen)
    // Sin argumentos = aplica la orientacion del EXIF. Es lo que la endereza.
    .rotate()
    .resize({
      width: s.ancho,
      height: s.alto,
      fit: "cover",
      position: s.posicion,
    })
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(s.archivo);

  const kb = Math.round(info.size / 1024);
  console.log(`  ✓ ${s.nota}`);
  console.log(`    ${info.width}x${info.height} · ${kb} KB`);
  console.log(`    ${s.archivo.replace(ROOT, ".")}\n`);
}

console.log("Listo. Revisa los recortes antes de publicar: 'attention' acierta");
console.log("casi siempre con la cara, pero conviene mirarlo con los ojos.");

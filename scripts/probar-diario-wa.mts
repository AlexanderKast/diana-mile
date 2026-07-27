/**
 * Genera mensajes de comunidad de prueba sin enviarlos, para calibrar el
 * tono antes de activarlos. Usa el mismo prompt que produccion.
 *
 * Uso: npm run wa:diario -- 6
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

const { chat } = await import("../packages/shared/src/botcake/ia/mistral");
const { SYSTEM_DIARIO, TEMAS_DIARIOS, LARGO_MAXIMO } = await import(
  "../packages/shared/src/botcake/mensaje-diario"
);

const cantidad = Number(process.argv[2] ?? 6);
const generados: string[] = [];

// Palabras que delatan que el mensaje se fue a producto o a frase de taza.
const PROHIBIDAS =
  /\b(producto|serum|crema|rutina de piel|comprar|pedido|oferta|descuento|brilla|tu puedes con todo|el exito es)\b/i;

for (let i = 0; i < cantidad; i++) {
  const tema = TEMAS_DIARIOS[i % TEMAS_DIARIOS.length];
  const evitar = generados.length
    ? `\n\nNO repitas la idea de estos:\n${generados.map((p) => `- ${p}`).join("\n")}`
    : "";

  const { texto } = await chat(
    [
      { role: "system", content: SYSTEM_DIARIO },
      {
        role: "user",
        content: `Escribe el mensaje de hoy. Tema sugerido: ${tema}.${evitar}`,
      },
    ],
    { maxTokens: 200, temperatura: 0.9 },
  );

  const limpio = texto.trim().replace(/^["']([\s\S]*)["']$/, "$1");
  generados.push(limpio);

  const lineas = limpio.split("\n").filter((l) => l.trim()).length;
  const emojis = (limpio.match(/\p{Extended_Pictographic}/gu) ?? []).length;

  const alertas: string[] = [];
  if (lineas > 3) alertas.push(`${lineas} lineas`);
  if (emojis > 1) alertas.push(`${emojis} emojis`);
  // El largo importa mas que las lineas: un parrafo sin saltos igual se ve
  // como un ladrillo en el celular.
  if (limpio.length > LARGO_MAXIMO)
    alertas.push(`${limpio.length} caracteres (max ${LARGO_MAXIMO})`);
  if (PROHIBIDAS.test(limpio)) alertas.push("suena a producto o a frase de taza");

  console.log(
    `─── ${tema} · ${limpio.length} car.` +
      (alertas.length ? `  ⚠️  ${alertas.join(" · ")}` : "  ✓"),
  );
  console.log(limpio + "\n");
}

/**
 * Genera mensajes diarios de prueba sin enviarlos, para calibrar el tono.
 * Uso: npx tsx scripts/probar-diario-wa.mts [cantidad]
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
    const k = l.slice(0, i).trim();
    let v = l.slice(i + 1).trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    if (!(k in process.env)) process.env[k] = v;
  }
}
cargarEnv(join(ROOT, "apps/admin/.env.local"));
cargarEnv(join(ROOT, "apps/shop/.env.local"));

const { chat } = await import("../packages/shared/src/botcake/ia/mistral");

const SYSTEM = `Eres Milito (Diana Mile), de Milito Life: una marca colombiana de skincare y bienestar. Escribes el mensaje que le llega hoy a tu comunidad por WhatsApp.

Es un mensaje de valor, NO una promocion: no vendes nada, no mencionas productos ni precios, no pides que compren. Es la razon por la que la gente no bloquea el numero.

Como escribes:
- Espanol colombiano natural, de tu a tu, calido y directo.
- MAXIMO 3 lineas. Es WhatsApp.
- Un solo emoji, o ninguno.
- Sin markdown. Para resaltar, un asterisco a cada lado.
- Nada de frases de taza motivacional ("el exito es una actitud"). Algo concreto y aplicable hoy, o una observacion honesta que se sienta de una persona real.
- Nada de promesas medicas ni de resultados.
- No saludes con "Hola" ni uses el nombre: eso lo pone la plantilla.

Respondes UNICAMENTE con el texto del mensaje, sin comillas ni explicaciones.`;

const TEMAS = [
  "cuidado de la piel",
  "constancia y habitos pequenos",
  "movimiento y energia",
  "descanso y sueno",
  "hablarse bonito a una misma",
  "tomar agua y alimentacion simple",
  "sostener la rutina cuando no hay ganas",
];

const cantidad = Number(process.argv[2] ?? 5);
const generados: string[] = [];

for (let i = 0; i < cantidad; i++) {
  const evitar = generados.length
    ? `\n\nNO repitas la idea de estos:\n${generados.map((p) => `- ${p}`).join("\n")}`
    : "";
  const { texto } = await chat(
    [
      { role: "system", content: SYSTEM },
      { role: "user", content: `Escribe el mensaje de hoy. Tema sugerido: ${TEMAS[i % TEMAS.length]}.${evitar}` },
    ],
    { maxTokens: 200, temperatura: 0.9 },
  );
  const limpio = texto.trim().replace(/^["']([\s\S]*)["']$/, "$1");
  generados.push(limpio);
  const lineas = limpio.split("\n").filter((l) => l.trim()).length;
  const emojis = (limpio.match(/\p{Extended_Pictographic}/gu) ?? []).length;
  console.log(`─── día ${i + 1} · ${TEMAS[i % TEMAS.length]} · ${lineas}L · ${emojis}emoji`);
  console.log(limpio + "\n");
}

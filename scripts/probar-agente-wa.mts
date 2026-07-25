/**
 * Prueba el agente de IA de WhatsApp SIN enviar mensajes reales ni tocar
 * Supabase: usa el router, los expertos y la voz de verdad, y muestra que
 * responderia Milito a cada mensaje.
 *
 * Sirve para calibrar el entrenamiento: si una respuesta no suena a
 * Milito o se pasa de larga, se ajusta voz.ts o el conocimiento del area.
 *
 * Uso:
 *   npx tsx scripts/probar-agente-wa.mts
 *   npx tsx scripts/probar-agente-wa.mts "tu mensaje de prueba"
 *
 * Requiere MISTRAL_API_KEY en apps/admin/.env.local (o en el entorno).
 */

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function cargarEnv(ruta: string) {
  if (!existsSync(ruta)) return;
  for (const linea of readFileSync(ruta, "utf8").split("\n")) {
    const limpia = linea.trim();
    if (!limpia || limpia.startsWith("#")) continue;
    const i = limpia.indexOf("=");
    if (i === -1) continue;
    const clave = limpia.slice(0, i).trim();
    let valor = limpia.slice(i + 1).trim();
    if (
      (valor.startsWith('"') && valor.endsWith('"')) ||
      (valor.startsWith("'") && valor.endsWith("'"))
    ) {
      valor = valor.slice(1, -1);
    }
    if (!(clave in process.env)) process.env[clave] = valor;
  }
}

cargarEnv(join(ROOT, "apps/admin/.env.local"));
cargarEnv(join(ROOT, "apps/shop/.env.local"));

const { EXPERTOS } = await import("../packages/shared/src/botcake/ia/expertos");
const { elegirExperto } = await import("../packages/shared/src/botcake/ia/router");
const { chat } = await import("../packages/shared/src/botcake/ia/mistral");
const { catalogoResumen, formatearContexto } = await import(
  "../packages/shared/src/botcake/ia/contexto"
);
const { VOZ_MILITO, FORMATO_WHATSAPP } = await import(
  "../packages/shared/src/botcake/ia/voz"
);

const CASOS = [
  "Hola, buenas tardes",
  "Cuanto vale el serum de vitamina C?",
  "Tengo manchas en la cara desde el embarazo, que me sirve?",
  "Quiero bajar de peso pero no tengo tiempo de ir al gym",
  "Me interesa el negocio de Nu Skin, eso es una piramide?",
  "Como empiezo a hacer contenido si me da pena la camara?",
  "Somos una marca de cafe y buscamos creadoras para una campana",
  "Mi pedido no me ha llegado y ya pasaron 5 dias",
];

const mensajes = process.argv.slice(2).length
  ? [process.argv.slice(2).join(" ")]
  : CASOS;

if (!process.env.MISTRAL_API_KEY) {
  console.error("Falta MISTRAL_API_KEY en apps/admin/.env.local");
  process.exit(1);
}

const catalogo = await catalogoResumen();
console.log(
  catalogo
    ? `Catalogo cargado (${catalogo.split("\n").length} productos)\n`
    : "Sin catalogo: el agente no debe afirmar precios\n",
);

for (const mensaje of mensajes) {
  const expertoId = await elegirExperto(mensaje);
  const experto = EXPERTOS[expertoId];

  const contexto = formatearContexto({
    nombre: "Laura",
    pedido:
      expertoId === "pedido"
        ? {
            id: "demo",
            estado: "enviado",
            producto: "Epoch Glacial Marine Mud",
            numeroGuia: "240012345",
            transportadora: "Envia",
            creadoAt: new Date(Date.now() - 5 * 86400000).toISOString(),
          }
        : null,
    catalogo: experto.necesitaCatalogo ? catalogo : null,
    comunidad: "https://chat.whatsapp.com/demo",
  });

  const extra = experto.escalaAHumano
    ? "\n\nATENCION — ESTA CONVERSACION ES DE SOPORTE: no vendes ni invitas a la comunidad. Solo datos reales del pedido, con empatia. Si no tienes el dato, escalas a una persona del equipo."
    : "";

  const system = [
    VOZ_MILITO,
    `TU ESPECIALIDAD EN ESTE MOMENTO:\n${experto.conocimiento}`,
    contexto,
    extra,
    FORMATO_WHATSAPP,
  ]
    .filter(Boolean)
    .join("\n\n───\n\n");

  const { texto, tokens } = await chat([
    { role: "system", content: system },
    { role: "user", content: mensaje },
  ]);

  console.log("─".repeat(70));
  console.log(`👤 ${mensaje}`);
  console.log(`   [experto: ${expertoId} · ${tokens} tokens]`);
  console.log(`💚 ${texto}\n`);
}

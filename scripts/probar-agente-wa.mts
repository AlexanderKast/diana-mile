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
const { TECNICAS_CIERRE } = await import(
  "../packages/shared/src/botcake/ia/cierre"
);
const { MARCA_ESCALAR, detectarEscalada } = await import(
  "../packages/shared/src/botcake/ia/escalamiento"
);
const { limpiarFormato, problemasDeFormato, pareceDespedida } = await import(
  "../packages/shared/src/botcake/ia/formato"
);

const REGLA_NO_INVENTAR = `SI NO SABES, NO RESPONDAS.

Cuando te pregunten algo que no puedas responder con lo que tienes arriba —un precio que no esta en el catalogo, el estado de un pedido que no aparece, una fecha de entrega, una condicion medica, una promocion, una politica que no conoces, cualquier dato duro que no tengas— NO improvises, NO estimes, NO respondas "creo que" ni "normalmente".

En ese caso tu respuesta completa debe ser exactamente:
${MARCA_ESCALAR} seguido de una frase corta diciendo que te falta.

Ejemplo: ${MARCA_ESCALAR} pregunta si el producto sirve durante el embarazo

Ese texto NUNCA lo ve la clienta: el sistema lo intercepta, le avisa a Diana y le responde a ella que le confirmas en un momento. Escalar no es fallar, es lo correcto. Inventar si es fallar.`;

const CASOS = [
  "Hola, buenas tardes",
  // Precio de un producto que SI esta en el catalogo: debe citar las
  // presentaciones reales, no una cifra suelta.
  "Cuanto vale la barra exfoliante Epoch?",
  // Producto que NO existe: no debe inventar precio, debe escalar.
  "Cuanto vale el serum de vitamina C?",
  // Dato que no tiene: debe escalar en vez de improvisar.
  "El producto se puede usar en el embarazo?",
  "Tengo manchas en la cara, que me sirve?",
  "Quiero bajar de peso pero no tengo tiempo de ir al gym",
  "Me interesa el negocio de Nu Skin, eso es una piramide?",
  "Como empiezo a hacer contenido si me da pena la camara?",
  "Somos una marca de cafe y buscamos creadoras para una campana",
  // Objecion de precio: no debe soltar el descuento de una.
  "Uy no, esta muy caro para mi",
  // Soporte: sin emojis, sin venta, sin prometer fechas.
  "Mi pedido no me ha llegado y ya pasaron 5 dias",
  // Despedida: NO debe cerrar con pregunta.
  "Listo, gracias, despues te escribo",
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
    ? `

ATENCION — ESTA CONVERSACION ES DE SOPORTE: la persona esta preguntando por un pedido o tiene un problema.
- CERO EMOJIS. Ninguno, ni siquiera uno de empatia.
- NO vendes, NO recomiendas otro producto, NO invitas a la comunidad.
- Respondes solo con los datos reales del pedido que tienes arriba.
- Nunca inventes una fecha de entrega. Si no la tienes, escalas.`
    : "";

  const system = [
    VOZ_MILITO,
    `TU ESPECIALIDAD EN ESTE MOMENTO:\n${experto.conocimiento}`,
    experto.vende ? TECNICAS_CIERRE : "",
    contexto,
    REGLA_NO_INVENTAR,
    extra,
    FORMATO_WHATSAPP,
  ]
    .filter(Boolean)
    .join("\n\n───\n\n");

  const opciones = {
    soporte: experto.escalaAHumano,
    despedida: pareceDespedida(mensaje),
  };

  const primera = await chat([
    { role: "system", content: system },
    { role: "user", content: mensaje },
  ]);

  // Mismo pipeline que en produccion: limpiar y, si algo no cumple, un
  // unico reintento pidiendole al modelo que lo corrija.
  let texto = limpiarFormato(primera.texto, opciones);
  let tokens = primera.tokens;
  let corregido = false;

  const problemas = problemasDeFormato(texto, opciones);
  if (problemas.length) {
    const reintento = await chat([
      { role: "system", content: system },
      { role: "user", content: mensaje },
      { role: "assistant", content: texto },
      {
        role: "user",
        content: `[CORRECCION DE FORMATO — no es la clienta quien escribe esto] Tu mensaje anterior ${problemas.join(" y ")}. Reescribelo respetando eso. Responde solo con el mensaje corregido.`,
      },
    ]);
    const nuevo = limpiarFormato(reintento.texto, opciones);
    if (!problemasDeFormato(nuevo, opciones).length) {
      texto = nuevo;
      corregido = true;
    }
    tokens += reintento.tokens;
  }

  const escalada = detectarEscalada(texto);
  const lineas = texto.split("\n").filter((l) => l.trim()).length;
  const emojis = (texto.match(/\p{Extended_Pictographic}/gu) ?? []).length;
  const preguntas = (texto.match(/\?/g) ?? []).length;
  const restantes = escalada ? [] : problemasDeFormato(texto, opciones);

  console.log("─".repeat(70));
  console.log(`👤 ${mensaje}`);
  console.log(
    `   [${expertoId} · ${tokens} tok · ${lineas}L · ${emojis}emoji · ${preguntas}?]` +
      (restantes.length
        ? `  ⚠️  ${restantes.join(" · ")}`
        : corregido
          ? "  ✓ (corregido en 2do intento)"
          : "  ✓"),
  );
  if (escalada) {
    console.log(`🔔 ESCALA A DIANA: ${escalada}\n`);
  } else {
    console.log(`💚 ${texto}\n`);
  }
}

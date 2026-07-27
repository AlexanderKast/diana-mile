#!/usr/bin/env node
/**
 * Genera con IA el contenido de venta de los productos Nu Skin: la
 * descripcion nativa de Shopify (`descriptionHtml`) y el metafield
 * `diana_mile.landing_content` que arma la landing.
 *
 *   node scripts/generate-nuskin-contenido.mjs --dry            # imprime, no escribe
 *   node scripts/generate-nuskin-contenido.mjs                  # los que no tengan contenido
 *   node scripts/generate-nuskin-contenido.mjs --force          # regenera todos
 *   node scripts/generate-nuskin-contenido.mjs <handle>         # uno solo
 *   node scripts/generate-nuskin-contenido.mjs --limit 5        # prueba con pocos
 *
 * Env requeridas (se leen de apps/shop/.env.local si existe):
 *   SHOPIFY_STORE_DOMAIN · SHOPIFY_ADMIN_API_TOKEN · MISTRAL_API_KEY
 *
 * POR QUE NO SE USA scripts/generate-landing.mjs
 * Ese script tiene un solo prompt, escrito para skincare. Aplicado tal cual a
 * un cargador magnetico, a un kit de seis millones o a una donacion de
 * alimento produce copy absurdo; aplicado a un suplemento produce
 * afirmaciones de salud que ni el negocio ni la ley respaldan. Aca el copy se
 * segmenta por tipo de producto y cada tipo trae sus propias prohibiciones.
 *
 * LIMITE LEGAL (Nu Skin, distribuidora independiente)
 * Milito Life Shop revende como distribuidora, no es Nu Skin corporativo.
 * El copy se escribe propio: NUNCA se copia el de nuskin.com. Y el modelo
 * tiene prohibido inventar ingredientes, certificaciones, avales medicos o
 * resultados clinicos — solo puede trabajar con lo que ya sabe del nombre,
 * la linea y la descripcion existente.
 */

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { callMistral } from "../packages/shared/src/landing-ai.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function loadEnv(path) {
  if (!existsSync(path)) return;
  for (const rawLine of readFileSync(path, "utf8").split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadEnv(join(ROOT, "apps/shop/.env.local"));
loadEnv(join(ROOT, ".env.local"));

const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MODEL = process.env.LANDING_MODEL || "mistral-large-latest";
const API_VERSION = "2026-04";

const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const FORCE = args.includes("--force");
const limitIdx = args.indexOf("--limit");
const LIMIT = limitIdx !== -1 ? Number(args[limitIdx + 1]) : null;
const HANDLE = args.find(
  (a, i) => !a.startsWith("--") && args[i - 1] !== "--limit",
);

if (!STORE_DOMAIN || !ADMIN_TOKEN || !MISTRAL_API_KEY) {
  console.error(
    "Faltan SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_API_TOKEN o MISTRAL_API_KEY.",
  );
  process.exit(1);
}

// ── Shopify ──────────────────────────────────────────────────────────────

async function adminGraphQL(query, variables) {
  const res = await fetch(
    `https://${STORE_DOMAIN}/admin/api/${API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": ADMIN_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    },
  );
  const json = await res.json();
  if (!res.ok || json.errors) {
    throw new Error(
      `Shopify Admin GraphQL error (${res.status}): ` +
        JSON.stringify(json.errors ?? json),
    );
  }
  return json.data;
}

const PRODUCTOS_QUERY = `
  query($cursor: String) {
    products(first: 50, after: $cursor, query: "vendor:'Nu Skin'") {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id
          handle
          title
          descriptionHtml
          productType
          tags
          variants(first: 1) { edges { node { sku price } } }
          landing: metafield(namespace: "diana_mile", key: "landing_content") { value }
          cod: metafield(namespace: "diana_mile", key: "cod_disponible") { value }
        }
      }
    }
  }
`;

async function listarProductos() {
  const productos = [];
  let cursor = null;
  do {
    const data = await adminGraphQL(PRODUCTOS_QUERY, { cursor });
    for (const { node } of data.products.edges) {
      const v = node.variants.edges[0]?.node;
      productos.push({
        id: node.id,
        handle: node.handle,
        title: node.title,
        descriptionHtml: node.descriptionHtml ?? "",
        productType: node.productType ?? "",
        tags: node.tags ?? [],
        sku: v?.sku ?? "",
        precio: v?.price ? Math.round(parseFloat(v.price)) : null,
        tieneLanding: Boolean(node.landing?.value),
        // Mismo default seguro que la tienda: solo "true" es contraentrega.
        cod: node.cod?.value?.trim().toLowerCase() === "true",
      });
    }
    cursor = data.products.pageInfo.hasNextPage
      ? data.products.pageInfo.endCursor
      : null;
  } while (cursor);
  return productos;
}

async function guardar(producto, { descripcionHtml, landing }) {
  await adminGraphQL(
    `mutation($input: ProductInput!) {
      productUpdate(input: $input) {
        product { id }
        userErrors { field message }
      }
    }`,
    { input: { id: producto.id, descriptionHtml: descripcionHtml } },
  );

  const data = await adminGraphQL(
    `mutation($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { id }
        userErrors { field message }
      }
    }`,
    {
      metafields: [
        {
          ownerId: producto.id,
          namespace: "diana_mile",
          key: "landing_content",
          type: "json",
          value: JSON.stringify(landing),
        },
      ],
    },
  );
  const errs = data.metafieldsSet.userErrors;
  if (errs.length) {
    throw new Error("metafieldsSet fallo: " + JSON.stringify(errs));
  }
}

// ── Clasificacion por tipo ───────────────────────────────────────────────

/**
 * El tipo decide que secciones tienen sentido y que le queda PROHIBIDO al
 * modelo. Se deduce del titulo y del productType, en orden de especificidad:
 * lo mas concreto primero (un "Cargador para LumiSpa" es accesorio, no
 * dispositivo, aunque diga LumiSpa).
 */
function clasificar(p) {
  const t = p.title.toLowerCase();
  const tipo = p.productType.toLowerCase();

  if (/donaci[oó]n|vitameal|nourish/.test(t + tipo)) return "donacion";
  if (/cargador|base |base$|repuesto de base|cabezal|adaptador/.test(t))
    return "accesorio";
  if (/^repuesto|recambio|refill/.test(t)) return "repuesto";
  if (/^kit|kit /.test(t) || /kits de inicio/.test(tipo)) return "kit";
  if (/lumispa io$|wellspa|galvanic spa|esc[aá]ner|dispositivo|prysm io kit/.test(t))
    return "dispositivo";
  if (/pharmanex|nourish/.test(tipo) || /omega|collagen|g3|youthspan|tr90|lifepak|tegreen/.test(t))
    return "suplemento";
  if (/dental/.test(tipo) || /toothpaste|dental|crema dental/.test(t))
    return "dental";
  if (/sunright|spf|solar/.test(t + tipo)) return "solar";
  if (/nu colour/.test(tipo)) return "cosmetico";
  return "skincare";
}

const BASE_PROMPT = `Eres copywriter de respuesta directa para "Milito Life Shop", una tienda colombiana que revende productos Nu Skin como DISTRIBUIDORA INDEPENDIENTE (no es Nu Skin corporativo). Escribes en espanol neutro colombiano, calido y directo, en segunda persona.

PROHIBICIONES ABSOLUTAS — se aplican SIEMPRE, sin excepcion:
- NO inventes ingredientes, formulas, porcentajes, estudios, certificaciones, avales medicos ni premios. Si no lo sabes con certeza a partir del nombre y la linea del producto, NO lo menciones.
- NO prometas resultados medicos ni curativos. Nada de "cura", "elimina", "previene", "trata", "corrige", "regenera celulas", "quita las arrugas".
- NO inventes personas con nombre, cifras de ventas, cantidades vendidas ni resenas de clientas. NUNCA escribas testimonios: no existen todavia y fabricarlos es enganar.
- NO inventes stock, contadores ni fechas limite. La unica urgencia permitida es la real del negocio: despacho estimado 24-72h en ciudades principales.
- NO copies textos de marketing de nuskin.com. Escribe copy propio.
- NO uses las palabras "curado", "curaduria" ni "curada". Usa "probado por Diana" o "elegido por Diana".

Lo que SI puedes usar como gancho, porque es verdad del negocio: soporte por WhatsApp con Diana, producto original de Nu Skin, despacho estimado 24-72h en ciudades principales.

EL MODO DE COMPRA NO SE INVENTA: te lo dicen en el prompt de cada producto y es un dato del negocio, no una decision tuya. Prometer "pagas al recibir" en un producto que no es contraentrega es la peor falla posible de este copy.

Respondes SIEMPRE y UNICAMENTE con un objeto JSON valido, sin texto adicional ni markdown.`;

/**
 * Reglas por tipo. `secciones` le dice al modelo que bloques llenar y
 * `prohibido` agrega los limites propios de esa categoria.
 */
const REGLAS = {
  skincare: {
    encuadre:
      "Es un producto de cuidado de la piel de uso diario o frecuente.",
    secciones:
      "Llena todo: benefits (3-5), skinType, usageSteps (3), withoutRitual, resultsTimeline (3), comparison, faqs (4-6), freeGuide, ingredientStory SOLO si conoces el ingrediente estrella real.",
    prohibido:
      "En resultsTimeline habla de SENSACION y HABITO ('la piel se siente mas suave', 'ya es parte de tu rutina'), nunca de resultados clinicos garantizados.",
  },
  cosmetico: {
    encuadre: "Es un producto de color/belleza de la linea Nu Colour.",
    secciones:
      "Llena benefits (3-4), usageSteps (3), comparison, faqs (4-6). OMITE skinType, ingredientStory e ingredients salvo que los conozcas.",
    prohibido:
      "Nada de promesas de crecimiento, densidad o cambios permanentes. Habla de uso, textura y acabado.",
  },
  solar: {
    encuadre: "Es un protector solar.",
    secciones:
      "Llena benefits (3-4), usageSteps (3), faqs (4-6, incluye reaplicacion), comparison. OMITE resultsTimeline e ingredientStory.",
    prohibido:
      "NO prometas proteccion total ni prevencion de cancer o manchas. Habla de habito de uso y reaplicacion.",
  },
  dental: {
    encuadre: "Es un producto de cuidado dental.",
    secciones:
      "Llena benefits (3-4), usageSteps (3), faqs (4-6), comparison. OMITE skinType, ingredientStory, resultsTimeline.",
    prohibido:
      "NO prometas blanqueamiento garantizado, tonos especificos ni beneficios odontologicos. Nada que suene a tratamiento dental.",
  },
  suplemento: {
    encuadre:
      "Es un suplemento dietario. En Colombia un suplemento dietario NO es un medicamento y no puede presentarse como tal.",
    secciones:
      "Llena benefits (3-4) enfocados en HABITO y conveniencia (facil de tomar, cabe en tu rutina, presentacion), usageSteps (3, como incorporarlo al dia), faqs (4-6, incluye una que aclare que es un suplemento dietario y no reemplaza una alimentacion balanceada ni un tratamiento medico), comparison. OMITE skinType, ingredientStory, ingredients y resultsTimeline POR COMPLETO.",
    prohibido:
      "PROHIBIDO ABSOLUTO: atribuirle efectos sobre la salud, la energia, el sueno, las defensas, el peso, la piel o cualquier funcion del cuerpo. Prohibido mencionar enfermedades. Prohibido 'antioxidante', 'refuerza', 'mejora', 'aumenta', 'reduce'. Habla SOLO de que es, como se toma y como llega a tu casa.",
  },
  dispositivo: {
    encuadre:
      "Es un dispositivo de uso en casa, de inversion alta y venta consultiva.",
    secciones:
      "Llena benefits (3-4) sobre uso y comodidad, usageSteps (3), faqs (5-6, incluye garantia, que trae la caja, y como se coordina la entrega), comparison. OMITE skinType, ingredientStory, ingredients, resultsTimeline.",
    prohibido:
      "NO inventes especificaciones tecnicas (bateria, potencia, frecuencias, materiales, duracion) ni que trae la caja si no lo sabes. NO prometas resultados de tratamiento.",
  },
  kit: {
    encuadre:
      "Es un kit de inicio: un paquete de varios productos, de ticket alto. Quien lo compra suele estar empezando el negocio o armando una rutina completa.",
    secciones:
      "Llena benefits (3-4) sobre para quien es y por que conviene un kit frente a comprar suelto, faqs (5-6, incluye como se coordina la entrega de un pedido de este valor y que la asesoria va con Diana), comparison. OMITE skinType, ingredientStory, ingredients, usageSteps, resultsTimeline.",
    prohibido:
      "NO enumeres el contenido exacto del kit ni cantidades: no lo sabes. Habla en general de lo que representa y remite a coordinar con Diana los detalles. Y NO afirmes que el kit sale mas barato que comprar suelto ni menciones ahorro o descuento: no tienes los precios individuales para saberlo.",
  },
  repuesto: {
    encuadre:
      "Es un repuesto o recambio de un producto que la persona ya tiene.",
    secciones:
      "Se breve. Llena benefits (2-3), usageSteps (2-3) y faqs (3-4, incluye compatibilidad y cada cuanto se cambia si es evidente). OMITE todo lo demas.",
    prohibido:
      "NO inventes compatibilidades ni duracion. Si no sabes con que equipo va, dilo de forma general y remite a confirmarlo por WhatsApp.",
  },
  accesorio: {
    encuadre:
      "Es un accesorio de un equipo (cargador, base, cabezal). No se vende solo: acompana al equipo.",
    secciones:
      "Se muy breve. Llena benefits (2-3) y faqs (3-4, incluye compatibilidad y que se envia junto con el equipo). OMITE todo lo demas.",
    prohibido:
      "NO inventes especificaciones electricas, voltajes, tiempos de carga ni compatibilidades. Remite a confirmar por WhatsApp.",
  },
  donacion: {
    encuadre:
      "NO es un producto de belleza: es una DONACION al programa Nourish the Children de Nu Skin, que entrega alimento a ninos. Quien 'compra' esto esta donando, no comprando algo para si.",
    secciones:
      "Llena solo: tagline, benefits (2-3) sobre el sentido de donar, faqs (3-4 explicando que es una donacion, que no recibe un producto en casa, y como se coordina). OMITE todo lo demas.",
    prohibido:
      "PROHIBIDO escribir esto como una venta. Nada de 'pide el tuyo', 'tu ritual', descuentos, urgencia ni beneficios personales. Tono sobrio y honesto. NO inventes cifras de ninos alimentados ni impacto.",
  },
};

function construirPrompt(p, tipo) {
  const r = REGLAS[tipo];
  const modo = p.cod
    ? `CONTRAENTREGA. Se pide en la tienda y se PAGA AL RECIBIR, en efectivo, cuando llega a la puerta. Puedes usarlo como gancho de reversion de riesgo en el tagline, en las FAQs y en el cierre.`
    : `NO ES CONTRAENTREGA. Este producto se coordina de forma personalizada con Diana por WhatsApp; la entrega se acuerda con ella. PROHIBIDO decir "pagas al recibir", "pago contraentrega", "sin anticipos" o cualquier variante: seria mentir. Las FAQs deben explicar que la compra se coordina con Diana.`;

  return `Genera el contenido de venta de este producto para "Milito Life Shop".

MODO DE COMPRA DE ESTE PRODUCTO: ${modo}

PRODUCTO
- Titulo: ${p.title}
- Linea: ${p.productType || "(sin linea)"}
- Codigo oficial Nu Skin: ${p.sku || "(sin codigo)"}
- Precio en Colombia: ${p.precio ? "$" + p.precio.toLocaleString("es-CO") + " COP" : "(sin precio)"}
- Tags: ${p.tags.join(", ") || "(ninguno)"}

TIPO DE PRODUCTO: ${tipo}
${r.encuadre}

QUE LLENAR
${r.secciones}

LIMITE ADICIONAL PARA ESTE TIPO
${r.prohibido}

Devuelve un JSON con esta forma (omite las claves que las instrucciones te digan omitir; NO inventes para rellenar):

{
  "descripcionHtml": "2 a 4 parrafos en HTML simple (<p>, <strong>, <ul>/<li>) describiendo el producto con honestidad. Sin encabezados <h>. Sin afirmaciones de resultados. NO menciones el codigo ni el SKU del producto: es el numero con el que cualquiera lo compra en otro lado, y esta tienda no se lo va a servir en bandeja. El codigo vive en el metafield sku_oficial, que es interno.",
  "eyebrow": "texto corto sobre el titulo",
  "tagline": "una linea",
  "benefitsHeading": "...",
  "benefits": [ { "icon": "gota|mineral|hoja|sol|escudo|planeta", "title": "...", "description": "...", "ciencia": "(opcional, solo si es un hecho que conoces)" } ],
  "ingredientStory": { "title": "...", "body": "..." },
  "ingredients": { "inci": "...", "freeFrom": "..." },
  "skinType": { "question": "¿Cual es tu tipo de piel?", "options": [ { "id": "normal", "label": "...", "message": "..." } ] },
  "usageHeading": "...",
  "usageSteps": [ { "numero": "1", "titulo": "...", "descripcion": "..." } ],
  "withoutRitual": { "title": "...", "conLabel": "Con el ${p.title}", "sin": ["..."], "con": ["..."] },
  "resultsHeading": "...",
  "resultsTimeline": [ { "momento": "Semana 1", "titulo": "...", "descripcion": "..." } ],
  "comparison": { "title": "...", "rows": ["..."] },
  "faqs": [ { "question": "...", "answer": "..." } ],
  "freeGuide": { "title": "...", "description": "...", "sections": [ { "title": "...", "body": "..." } ] },
  "closingHeading": "...",
  "authenticity": true
}

REGLAS DE FORMA
- Los "icon" solo pueden ser: gota, mineral, hoja, sol, escudo, planeta.
- "authenticity" va en true (es producto Nu Skin original revendido), salvo en donaciones donde va en false.
- Todo en espanol. Nada de markdown dentro de los textos.`;
}

// ── Validacion de salida ─────────────────────────────────────────────────

/**
 * Promesa AFIRMATIVA de contraentrega. Se busca la promesa, no la palabra:
 * un producto de vitrina puede (y debe) decir "este producto no se maneja
 * contraentrega", y eso no es una falla sino justo lo que se le pidio.
 */
const PROMESA_COD =
  /pag(?:as|a|aras|ar[aá]s)\s+(?:solo\s+|unicamente\s+|[uú]nicamente\s+)?(?:al|cuando)\s+(?:lo\s+|la\s+|te\s+)?recib|pago\s+contra\s*entrega|(?:disponible|env[ií]o|compra|p[ií]delo)\s+(?:con\s+|en\s+)?contra\s*entrega|no\s+pagas\s+hasta/i;

/**
 * Texto donde una promesa SI seria una promesa. Deja fuera las preguntas de
 * las FAQ: "¿Puedo pagar contraentrega?" respondida con "No" es exactamente
 * el copy que se le pidio a un producto de vitrina, no una falla.
 */
function textoAfirmativo(landing) {
  const copia = { ...landing };
  if (Array.isArray(copia.faqs)) {
    copia.faqs = copia.faqs.map((f) => ({ answer: f?.answer ?? "" }));
  }
  return JSON.stringify(copia);
}

/**
 * Busca una promesa de contraentrega que sea de verdad una promesa.
 *
 * "No es pago contraentrega, se coordina con Diana" contiene la frase pero
 * dice justo lo contrario, y es el copy correcto para un producto de
 * vitrina. Sin mirar la negacion previa, el guardia bloqueaba precisamente
 * a los que hicieron bien la tarea.
 */
function promesaDeCod(texto) {
  return afirmacionReal(texto, PROMESA_COD, 45);
}

/**
 * Devuelve la primera coincidencia que ademas se este AFIRMANDO.
 *
 * Casi todas las frases prohibidas de este copy aparecen tambien dentro de
 * la aclaracion que las desmiente: el descargo obligatorio de un suplemento
 * dice "no esta disenado para diagnosticar, tratar, curar o prevenir
 * ninguna enfermedad", y sin mirar la negacion previa el guardia bloquea
 * justo al producto que puso el descargo correcto.
 *
 * La ventana es mas larga para las afirmaciones de salud que para las de
 * pago porque ese descargo mete varias palabras entre el "no" y el verbo.
 */
function afirmacionReal(texto, patron, ventana = 90) {
  const re = new RegExp(patron.source, "gi");
  let m;
  while ((m = re.exec(texto)) !== null) {
    const antes = texto.slice(Math.max(0, m.index - ventana), m.index);
    if (/\bno\b|\bni\b|\btampoco\b|\bsin\s+pago\b/i.test(antes)) continue;
    return {
      frase: m[0],
      contexto: texto.slice(Math.max(0, m.index - 70), m.index + 70),
    };
  }
  return null;
}

const ICONOS = ["gota", "mineral", "hoja", "sol", "escudo", "planeta"];

/**
 * Frases que, si aparecen, significan que el modelo se salto una
 * prohibicion. No se corrige a mano: se reporta y ese producto queda sin
 * escribir, para revisarlo. Es preferible un producto sin copy que un copy
 * que promete algo que el negocio no puede sostener.
 */
const BANDERAS_ROJAS = [
  /\bcura\b/i,
  /\bcurar\b/i,
  /\belimina las arrugas\b/i,
  /\bprevien[e|en]\b/i,
  /\btrata (el|la|los|las)\b/i,
  /\bclinicamente (probado|comprobado)\b/i,
  /\bcertificad[oa] por\b/i,
  /\bavalado por\b/i,
  /\brecomendado por (dermatolog|medic)/i,
  /\bmiles de (clientas|mujeres|personas)\b/i,
];

function limpiar(content, tipo, cod) {
  const out = { ...content };
  const problemas = [];

  if (Array.isArray(out.benefits)) {
    out.benefits = out.benefits.filter((b) => b && ICONOS.includes(b.icon));
  }

  // Prueba social fabricada: fuera siempre. El modelo no tiene de donde
  // sacar una resena real, asi que lo que devuelve son clientas inventadas.
  // La pagina ya sabe renderizar sin estos bloques.
  delete out.testimonials;
  delete out.testimonialsHeading;
  delete out.ugc;
  delete out.ugcHeading;
  delete out.ugcSubheading;

  // Segunda barrera del modo de compra: aunque el prompt lo prohiba, si el
  // modelo promete contraentrega en un producto de vitrina no se escribe.
  if (!cod) {
    const hallazgo = promesaDeCod(textoAfirmativo(out));
    if (hallazgo) {
      problemas.push(
        `promete contraentrega en producto de vitrina: …${hallazgo.contexto}…`,
      );
    }
  }

  // Los tipos que no deben proyectar resultados no llevan la linea de
  // tiempo aunque el modelo la mande igual.
  if (["suplemento", "dispositivo", "kit", "repuesto", "accesorio", "donacion", "dental", "solar"].includes(tipo)) {
    delete out.resultsTimeline;
    delete out.resultsHeading;
  }
  if (["suplemento", "kit", "repuesto", "accesorio", "donacion", "dispositivo"].includes(tipo)) {
    delete out.skinType;
    delete out.ingredientStory;
    delete out.ingredients;
  }
  if (tipo === "donacion") {
    out.authenticity = false;
    delete out.withoutRitual;
    delete out.comparison;
    delete out.freeGuide;
  }

  const textoPlano = JSON.stringify(out);
  for (const re of BANDERAS_ROJAS) {
    const hallazgo = afirmacionReal(textoPlano, re);
    if (!hallazgo) continue;
    problemas.push(`"${hallazgo.frase}" en …${hallazgo.contexto}…`);
  }

  return { landing: out, problemas };
}

// ── Main ─────────────────────────────────────────────────────────────────

async function procesar(p) {
  const tipo = clasificar(p);
  const raw = await callMistral({
    apiKey: MISTRAL_API_KEY,
    model: MODEL,
    maxTokens: 4096,
    systemPrompt: BASE_PROMPT,
    userPrompt: construirPrompt(p, tipo),
  });

  const descripcionHtml = String(raw.descripcionHtml || "").trim();
  delete raw.descripcionHtml;

  const { landing, problemas } = limpiar(raw, tipo, p.cod);

  if (!p.cod) {
    if (promesaDeCod(descripcionHtml)) {
      problemas.push("la descripcion promete contraentrega en producto de vitrina");
    }
  }

  if (!descripcionHtml) {
    return { tipo, estado: "sin_descripcion" };
  }
  if (problemas.length) {
    return { tipo, estado: "banderas", problemas };
  }

  if (DRY) {
    return { tipo, estado: "dry", descripcionHtml, landing };
  }

  await guardar(p, { descripcionHtml, landing });
  return { tipo, estado: "ok" };
}

async function main() {
  console.log(`Tienda: ${STORE_DOMAIN} · modelo: ${MODEL}\n`);

  let productos = await listarProductos();
  if (HANDLE) productos = productos.filter((p) => p.handle === HANDLE);
  if (!FORCE && !HANDLE) productos = productos.filter((p) => !p.tieneLanding);
  if (LIMIT) productos = productos.slice(0, LIMIT);

  console.log(`A procesar: ${productos.length} productos\n`);

  const resumen = { ok: 0, dry: 0, banderas: 0, sin_descripcion: 0, error: 0 };
  const porTipo = {};
  const revisar = [];

  for (const p of productos) {
    try {
      const r = await procesar(p);
      porTipo[r.tipo] = (porTipo[r.tipo] || 0) + 1;
      resumen[r.estado] = (resumen[r.estado] || 0) + 1;

      if (r.estado === "banderas") {
        revisar.push(`${p.handle} — frases marcadas: ${r.problemas.join(", ")}`);
        console.log(`  ⚠ ${p.title} [${r.tipo}] — NO escrito: ${r.problemas.join(", ")}`);
      } else if (r.estado === "sin_descripcion") {
        revisar.push(`${p.handle} — el modelo no devolvio descripcion`);
        console.log(`  ⚠ ${p.title} [${r.tipo}] — sin descripcion, no escrito`);
      } else if (r.estado === "dry") {
        console.log(`\n=== ${p.title} [${r.tipo}] ===`);
        console.log(r.descripcionHtml);
        console.log(JSON.stringify(r.landing, null, 1).slice(0, 1200));
      } else {
        console.log(`  ✓ ${p.title} [${r.tipo}]`);
      }
    } catch (err) {
      resumen.error += 1;
      revisar.push(`${p.handle} — ${err.message}`);
      console.error(`  ✗ ${p.title}: ${err.message}`);
    }
  }

  console.log("\n--- Resumen ---");
  console.log(resumen);
  console.log("Por tipo:", porTipo);
  if (revisar.length) {
    console.log("\nPara revisar a mano:");
    for (const r of revisar) console.log("  - " + r);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

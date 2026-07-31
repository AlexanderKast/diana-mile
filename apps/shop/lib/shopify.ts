import {
  Collection,
  CollectionLandingContent,
  MotivoNoCod,
  Product,
  ProductLandingContent,
  ProductMetafields,
} from "@diana-mile/shared/types";
import { splitFullName } from "@diana-mile/shared/utils";
import { createPublicClient } from "@diana-mile/shared/supabase/client";
import {
  ENVIO_ESTANDAR_VARIANT_ID,
  ENVIO_PRIORITARIO_VARIANT_ID,
} from "@/lib/pricing";

const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;
// Shopify retira versiones ~12 meses despues de publicadas — hay que subir
// esto periodicamente o la API empieza a responder 401. Minimo 2024-07 para
// leer swatches nativos de color (ProductOption.optionValues.swatch).
const API_VERSION = "2026-04";

const isShopifyConfigured = Boolean(STORE_DOMAIN && STOREFRONT_TOKEN);

const MOCK_PRODUCTS: Product[] = [
  {
    id: "mock-1",
    handle: "serum-luminoso-24h",
    title: "Serum Luminoso 24H",
    description:
      "Serum anti-edad de accion prolongada. Ilumina, firma y reduce lineas de expresion con uso constante en tu ritual nocturno.",
    descriptionHtml:
      "<p>Serum anti-edad de accion prolongada. Ilumina, firma y reduce lineas de expresion con uso constante en tu ritual nocturno.</p>",
    price: "289000",
    currencyCode: "COP",
    images: [
      { url: "/images/product-epoch-hero.jpg", altText: "Serum Luminoso 24H" },
    ],
    variantId: "mock-variant-1",
    variants: [
      {
        id: "mock-variant-1",
        title: "1 unidad",
        price: "289000",
        compareAtPrice: null,
        colorSwatch: null,
        image: null,
      },
    ],
    resultadosReales: [],
    codDisponible: true,
    motivoNoCod: null,
    skuOficial: "MOCK-SERUM-01",
    linea: "Cuidado Facial",
    metafields: {
      nuskinDirectUrl: null,
      nuskinDirectPrecio: null,
      ahorroPack2: null,
      ahorroPack3: null,
      landingContent: {
        eyebrow: "Ritual Milito Life Shop · Anti-edad",
        tagline: "Luminosidad que se nota de cerca — noche tras noche.",
        benefitsHeading: "Lo que vas a ver en el espejo",
        benefits: [
          {
            icon: "gota",
            title: "Ilumina desde la primera semana",
            description:
              "Concentrado de accion prolongada que unifica el tono y devuelve el brillo apagado por el tiempo.",
            ciencia:
              "Los activos iluminadores actuan sobre la melanina superficial y aceleran la renovacion celular nocturna, cuando la piel se repara mas rapido.",
          },
          {
            icon: "escudo",
            title: "Firma y reduce lineas finas",
            description:
              "Con uso constante la piel se ve mas tensa y las lineas de expresion se suavizan.",
          },
          {
            icon: "sol",
            title: "Absorcion inmediata",
            description:
              "Textura ligera que penetra sin dejar sensacion grasa. Perfecto bajo tu crema de noche.",
          },
        ],
        usageHeading: "Como aplicarlo en 3 pasos",
        usageSteps: [
          {
            numero: "1",
            titulo: "Limpia",
            descripcion:
              "Aplica sobre la piel limpia y seca antes de tu crema.",
          },
          {
            numero: "2",
            titulo: "Dosifica",
            descripcion: "2 a 3 gotas son suficientes para todo el rostro.",
          },
          {
            numero: "3",
            titulo: "Sella",
            descripcion: "Masajea hacia arriba y sella con tu crema nocturna.",
          },
        ],
        resultsHeading: "Que esperar del serum",
        resultsTimeline: [
          {
            momento: "Semana 1",
            titulo: "Piel mas luminosa",
            descripcion:
              "El tono se ve mas uniforme y descansado al despertar.",
          },
          {
            momento: "Semana 3-4",
            titulo: "Lineas mas suaves",
            descripcion:
              "Las lineas finas de expresion empiezan a difuminarse.",
          },
          {
            momento: "Dia 60+",
            titulo: "Firmeza visible",
            descripcion:
              "La piel luce mas tensa, elastica y con brillo saludable.",
          },
        ],
        faqs: [
          {
            question: "¿Se usa de dia o de noche?",
            answer:
              "Idealmente de noche, cuando la piel se repara. Si lo usas de dia, aplica siempre protector solar encima.",
          },
          {
            question: "¿Cada cuanto se aplica?",
            answer:
              "Todas las noches. Con 2-3 gotas el frasco te rinde entre 6 y 8 semanas.",
          },
          {
            question: "¿Sirve para piel sensible?",
            answer:
              "Si. Empieza aplicandolo dia por medio la primera semana para que tu piel se acostumbre.",
          },
        ],
        testimonialsHeading: "Antes de pedir tu serum",
        closingHeading: "Tu piel iluminada te esta esperando",
      },
    },
  },
  {
    id: "mock-2",
    handle: "crema-ritual-nocturno",
    title: "Crema Ritual Nocturno",
    description:
      "Textura envolvente con tecnologia regeneradora. Trabaja mientras duermes para devolver firmeza y luminosidad a tu piel.",
    descriptionHtml:
      "<p>Textura envolvente con tecnologia regeneradora. Trabaja mientras duermes para devolver firmeza y luminosidad a tu piel.</p>",
    price: "319000",
    currencyCode: "COP",
    images: [
      { url: "/images/lifestyle-ritual.jpg", altText: "Crema Ritual Nocturno" },
    ],
    variantId: "mock-variant-2",
    variants: [
      {
        id: "mock-variant-2",
        title: "1 unidad",
        price: "319000",
        compareAtPrice: null,
        colorSwatch: null,
        image: null,
      },
    ],
    resultadosReales: [],
    codDisponible: true,
    motivoNoCod: null,
    skuOficial: "MOCK-CREMA-02",
    linea: "Cuidado Facial",
    metafields: {
      nuskinDirectUrl: null,
      nuskinDirectPrecio: null,
      ahorroPack2: null,
      ahorroPack3: null,
      landingContent: {
        eyebrow: "Ritual Milito Life Shop · Noche",
        tagline: "Firmeza y luminosidad mientras duermes.",
        benefits: [
          {
            icon: "gota",
            title: "Nutricion intensa nocturna",
            description:
              "Textura envolvente que repone la hidratacion perdida durante el dia.",
          },
          {
            icon: "escudo",
            title: "Regenera mientras descansas",
            description:
              "Tecnologia regeneradora que trabaja en las horas de mayor reparacion de la piel.",
          },
        ],
        faqs: [
          {
            question: "¿Se puede usar todos los dias?",
            answer:
              "Si, es de uso diario nocturno. Aplica una capa fina sobre el rostro y cuello.",
          },
          {
            question: "¿Va antes o despues del serum?",
            answer:
              "Despues. El serum primero, la crema sella y potencia sus activos.",
          },
        ],
      },
    },
  },
  // Producto de VITRINA: ticket alto, no se puede pedir contraentrega. Sin
  // este mock el modo sin credenciales solo ejercitaria el camino COD y la
  // bifurcacion de la pagina de producto quedaria sin probar en local.
  {
    id: "mock-3",
    handle: "kit-ritual-completo",
    title: "Kit Ritual Completo",
    description:
      "Kit de inicio con el equipo y los consumibles del ritual completo. Por su valor, la entrega se coordina de forma personalizada.",
    descriptionHtml:
      "<p>Kit de inicio con el equipo y los consumibles del ritual completo. Por su valor, la entrega se coordina de forma personalizada.</p>",
    price: "3087000",
    currencyCode: "COP",
    images: [{ url: "/images/hero-home.jpg", altText: "Kit Ritual Completo" }],
    variantId: "mock-variant-3",
    variants: [
      {
        id: "mock-variant-3",
        title: "1 unidad",
        price: "3087000",
        compareAtPrice: null,
        colorSwatch: null,
        image: null,
      },
    ],
    resultadosReales: [],
    codDisponible: false,
    motivoNoCod: "ticket_alto",
    skuOficial: "MOCK-KIT-03",
    linea: "Kits de Inicio",
    metafields: {
      nuskinDirectUrl: "https://www.nuskin.com/es_CO/",
      nuskinDirectPrecio: null,
      ahorroPack2: null,
      ahorroPack3: null,
      // Sin landingContent: prueba el camino de fallback neutral del resolver.
      landingContent: null,
    },
  },
];

/**
 * Handles de las categorias de la tienda, EN EL ORDEN EN QUE SE MUESTRAN.
 * Deben existir como Collections custom en Shopify Admin con estos mismos
 * handles (autogenerados por Shopify a partir del titulo al crearlas — no son
 * arbitrarios).
 *
 * El orden importa: /categorias abre la primera a ancho completo como puerta
 * de entrada del catalogo. Cambiar el orden aqui cambia cual se destaca.
 */
export const COLLECTION_HANDLES = [
  "ritual-de-rostro",
  "tecnologia-en-casa",
  "cuerpo-y-ducha",
  "bienestar-por-dentro",
  "color-y-detalle",
  "kits-de-inicio",
] as const;

/**
 * Collections que existen en Shopify pero NO son navegacion de la tienda.
 *
 * Esta es la unica lista que hay que mantener a mano. `getCollections()`
 * muestra todo lo demas que tenga productos publicados, asi que crear una
 * categoria nueva en Shopify Admin la publica sola, sin tocar codigo ni
 * desplegar. El precio de esa comodidad es este archivo: una collection
 * interna nueva sale publicada hasta que se agregue aqui.
 *
 * Por que esta cada una:
 *  · frontpage              — la crea Shopify sola en cada tienda, esta vacia.
 *  · liteshop-import        — catalogo importado de referencia, uso interno.
 *  · ritual-epoch           — legacy: duplica "Ritual de rostro" con 1 producto.
 *  · rituales-de-piel       — legacy vacia de la version anterior de la tienda.
 *  · suplementos-y-bienestar— legacy vacia, la reemplazo "Bienestar por dentro".
 *  · tendencia-milito       — "Tendencias" NO es una categoria mala: es que hoy
 *                             sus dos unicos productos publicados son vendor
 *                             "Liteshop Import" ("BASE O'CHEAL", "BASE EN BARRA
 *                             COREANA 3 EN 1... + OBSEQUIO"), y estan tambien
 *                             en `liteshop-import`. Sin esta linea, la
 *                             importacion de referencia que se excluye arriba
 *                             se publicaba igual por esta otra puerta, con
 *                             titulos en mayusculas y fotos de landing. Cuando
 *                             tenga producto propio, se borra esta linea y
 *                             aparece sola.
 *
 * Las tres legacy siguen en Shopify a peticion de Alexander (27/07/2026): no
 * se borran desde aqui. Vacias ya no se mostrarian por el filtro de
 * productos, pero quedan listadas para que tampoco aparezcan si alguien les
 * mete un producto por error.
 */
const COLLECTION_HANDLES_OCULTOS: readonly string[] = [
  "frontpage",
  "liteshop-import",
  "ritual-epoch",
  "rituales-de-piel",
  "suplementos-y-bienestar",
  "tendencia-milito",
];

const COLLECTION_HANDLES_QUERY = `
  query CollectionHandles($first: Int!) {
    collections(first: $first) {
      edges { node { handle } }
    }
  }
`;

const MOCK_COLLECTIONS: Collection[] = [
  {
    id: "mock-collection-ritual-de-rostro",
    handle: "ritual-de-rostro",
    title: "Ritual de rostro",
    description: "La linea Epoch® de Nu Skin, probada por Milito Life Shop.",
    image: {
      url: "/images/product-epoch-hero.jpg",
      altText: "Ritual de rostro",
    },
    landingContent: null,
    products: [],
  },
  {
    id: "mock-collection-cuerpo-y-ducha",
    handle: "cuerpo-y-ducha",
    title: "Cuerpo y ducha",
    description:
      "Skincare para tu ritual diario: sueros, cremas y contornos de ojos.",
    image: { url: "/images/lifestyle-ritual.jpg", altText: "Cuerpo y ducha" },
    landingContent: null,
    products: MOCK_PRODUCTS,
  },
  {
    id: "mock-collection-color-y-detalle",
    handle: "color-y-detalle",
    title: "Color y detalle",
    description: "Lo que mas estan pidiendo esta temporada.",
    image: null,
    landingContent: null,
    products: [],
  },
  {
    id: "mock-collection-bienestar-por-dentro",
    handle: "bienestar-por-dentro",
    title: "Bienestar por dentro",
    description:
      "Bienestar desde adentro — lo que Milito recomienda desde su experiencia como entrenadora física.",
    image: null,
    landingContent: null,
    products: [],
  },
];

const METAFIELD_IDENTIFIERS_GQL = `[
  {namespace: "diana_mile", key: "nuskin_direct_url"},
  {namespace: "diana_mile", key: "nuskin_direct_precio"},
  {namespace: "diana_mile", key: "ahorro_pack2"},
  {namespace: "diana_mile", key: "ahorro_pack3"},
  {namespace: "diana_mile", key: "landing_content"},
  {namespace: "diana_mile", key: "cod_disponible"},
  {namespace: "diana_mile", key: "motivo_no_cod"},
  {namespace: "diana_mile", key: "sku_oficial"},
  {namespace: "diana_mile", key: "linea"}
]`;

const COLLECTION_METAFIELD_IDENTIFIERS_GQL = `[
  {namespace: "diana_mile", key: "collection_content"}
]`;

const PRODUCT_BY_HANDLE_QUERY = `
  query ProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      handle
      title
      description
      descriptionHtml
      priceRange { minVariantPrice { amount currencyCode } }
      images(first: 20) { edges { node { url altText } } }
      options(first: 10) { name optionValues { name swatch { color } } }
      variants(first: 20) { edges { node { id title price { amount } compareAtPrice { amount } selectedOptions { name value } image { url altText } } } }
      metafields(identifiers: ${METAFIELD_IDENTIFIERS_GQL}) { key value }
      resultadosReales: metafield(namespace: "diana_mile", key: "resultados_reales") {
        references(first: 20) {
          edges { node { ... on MediaImage { image { url altText } } } }
        }
      }
    }
  }
`;

const COLLECTION_BY_HANDLE_QUERY = `
  query CollectionByHandle($handle: String!) {
    collectionByHandle(handle: $handle) {
      id
      handle
      title
      description
      image { url altText }
      metafields(identifiers: ${COLLECTION_METAFIELD_IDENTIFIERS_GQL}) { key value }
      products(first: 100) {
        edges {
          node {
            id
            handle
            title
            description
            descriptionHtml
            priceRange { minVariantPrice { amount currencyCode } }
            images(first: 3) { edges { node { url altText } } }
            options(first: 10) { name optionValues { name swatch { color } } }
            variants(first: 10) { edges { node { id title price { amount } compareAtPrice { amount } selectedOptions { name value } image { url altText } } } }
            metafields(identifiers: ${METAFIELD_IDENTIFIERS_GQL}) { key value }
          }
        }
      }
    }
  }
`;

async function storefrontFetch<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(
    `https://${STORE_DOMAIN}/api/${API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN!,
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 60 },
    },
  );

  if (!res.ok) {
    throw new Error(`Shopify Storefront API error: ${res.status}`);
  }

  const json = await res.json();
  return json.data as T;
}

function mapMetafields(
  metafields: { key: string; value: string }[] | null | undefined,
): ProductMetafields {
  const byKey = new Map(
    (metafields ?? []).filter(Boolean).map((m) => [m.key, m.value]),
  );
  return {
    nuskinDirectUrl: byKey.get("nuskin_direct_url") ?? null,
    nuskinDirectPrecio: byKey.get("nuskin_direct_precio") ?? null,
    ahorroPack2: byKey.get("ahorro_pack2") ?? null,
    ahorroPack3: byKey.get("ahorro_pack3") ?? null,
    landingContent: parseLandingContent(byKey.get("landing_content")),
  };
}

const MOTIVOS_NO_COD: MotivoNoCod[] = [
  "ticket_alto",
  "solo_suscripcion",
  "accesorio",
];

/**
 * REGLA DE SEGURIDAD: solo el string exacto "true" habilita contraentrega.
 * Null, undefined, vacio o cualquier otra cosa deja el producto en vitrina.
 * Nunca al reves — un producto de $3M colandose al formulario COD cuesta
 * mucho mas que uno de $80.000 que se pide por WhatsApp.
 */
function parseCodDisponible(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === "true";
}

function parseMotivoNoCod(value: string | undefined): MotivoNoCod | null {
  const normalizado = value?.trim().toLowerCase();
  return MOTIVOS_NO_COD.find((m) => m === normalizado) ?? null;
}

/**
 * El metafield `diana_mile.landing_content` es un JSON (tipo `json` en
 * Shopify) con el contenido editorial de la landing. Si esta vacio o mal
 * formado devolvemos null y el resolver usa fallbacks neutrales — nunca
 * debe romper el render del producto.
 */
function parseLandingContent(
  value: string | undefined,
): ProductLandingContent | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object"
      ? (parsed as ProductLandingContent)
      : null;
  } catch (error) {
    console.warn("landing_content no es un JSON valido:", error);
    return null;
  }
}

type RawProductOption = {
  name: string;
  optionValues: { name: string; swatch: { color: string | null } | null }[];
};

/**
 * Cruza el nombre/valor de la opcion "Color" seleccionada por la variante
 * contra los swatches nativos del producto (Shopify Admin > Opciones >
 * Color, configurados por el equipo). Devuelve null si el producto no usa
 * una opcion de color o esa opcion no tiene swatch configurado.
 */
function resolveColorSwatch(
  options: RawProductOption[],
  selectedOptions: { name: string; value: string }[],
): string | null {
  const colorOption = options.find(
    (o) => o.name.trim().toLowerCase() === "color",
  );
  if (!colorOption) return null;

  const selected = selectedOptions.find(
    (o) => o.name.trim().toLowerCase() === "color",
  );
  if (!selected) return null;

  const optionValue = colorOption.optionValues.find(
    (v) => v.name === selected.value,
  );
  return optionValue?.swatch?.color ?? null;
}

function mapNode(node: {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  images: { edges: { node: { url: string; altText: string | null } }[] };
  options: RawProductOption[];
  variants: {
    edges: {
      node: {
        id: string;
        title: string;
        price: { amount: string };
        compareAtPrice: { amount: string } | null;
        selectedOptions: { name: string; value: string }[];
        image: { url: string; altText: string | null } | null;
      };
    }[];
  };
  metafields: ({ key: string; value: string } | null)[];
  resultadosReales?: {
    references: {
      edges: { node: { image: { url: string; altText: string | null } } }[];
    };
  } | null;
}): Product {
  const variants = node.variants.edges
    .map((e) => ({
      id: e.node.id,
      title: e.node.title,
      price: e.node.price.amount,
      compareAtPrice: e.node.compareAtPrice?.amount ?? null,
      colorSwatch: resolveColorSwatch(node.options, e.node.selectedOptions),
      image: e.node.image,
    }))
    .sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

  // La Storefront API entrega TODO como string, incluido el boolean. El
  // estado COD se resuelve aca, en el servidor, y viaja tipado con el
  // producto — ningun componente vuelve a inferirlo.
  const rawMetafields = new Map(
    node.metafields
      .filter((m): m is { key: string; value: string } => m !== null)
      .map((m) => [m.key, m.value]),
  );

  const codDisponible = parseCodDisponible(rawMetafields.get("cod_disponible"));

  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    description: node.description,
    descriptionHtml: node.descriptionHtml,
    price: node.priceRange.minVariantPrice.amount,
    currencyCode: node.priceRange.minVariantPrice.currencyCode,
    images: node.images.edges.map((e) => e.node),
    variantId: variants[0]?.id ?? "",
    variants,
    metafields: mapMetafields(
      node.metafields.filter(
        (m): m is { key: string; value: string } => m !== null,
      ),
    ),
    codDisponible,
    // Un producto contraentrega no arrastra motivo, aunque quede uno viejo
    // escrito en Shopify de cuando estaba en vitrina.
    motivoNoCod: codDisponible
      ? null
      : parseMotivoNoCod(rawMetafields.get("motivo_no_cod")),
    skuOficial: rawMetafields.get("sku_oficial")?.trim() || null,
    linea: rawMetafields.get("linea")?.trim() || null,
    resultadosReales: (node.resultadosReales?.references.edges ?? []).map(
      (e) => e.node.image,
    ),
  };
}

/**
 * Aplica el color propio (tabla `variante_colores`, editable desde el
 * constructor del admin) sobre el swatch nativo de Shopify ya resuelto en
 * mapNode. Si Supabase falla, se devuelven los productos sin modificar —
 * nunca debe romper el render por esto.
 */
async function overrideVariantColors(products: Product[]): Promise<Product[]> {
  const variantIds = products.flatMap((p) => p.variants.map((v) => v.id));
  if (variantIds.length === 0) return products;

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("variante_colores")
      .select("variant_id, color_hex")
      .in("variant_id", variantIds);

    if (error || !data || data.length === 0) return products;

    const overrides = new Map<string, string>(
      data.map((row) => [row.variant_id as string, row.color_hex as string]),
    );

    return products.map((product) => ({
      ...product,
      variants: product.variants.map((variant) =>
        overrides.has(variant.id)
          ? { ...variant, colorSwatch: overrides.get(variant.id)! }
          : variant,
      ),
    }));
  } catch (error) {
    console.warn("No se pudieron aplicar los colores de variante:", error);
    return products;
  }
}

/**
 * Devuelve SOLO los productos que pertenecen a alguna de las 4 categorias
 * curadas (COLLECTION_HANDLES) — no el catalogo Shopify completo, que
 * incluye productos de importaciones genericas (ej. "Liteshop Import")
 * ajenos al posicionamiento de la tienda. Deduplicado por id (un producto
 * puede estar en mas de una categoria).
 */
export async function getProducts(): Promise<Product[]> {
  if (!isShopifyConfigured) return MOCK_PRODUCTS;

  const collections = await getCollections();
  const byId = new Map<string, Product>();
  for (const collection of collections) {
    for (const product of collection.products) {
      byId.set(product.id, product);
    }
  }
  return Array.from(byId.values());
}

const PRODUCTS_BY_VENDOR_QUERY = `
  query ProductsByVendor($query: String!, $cursor: String) {
    products(first: 100, after: $cursor, query: $query) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id
          handle
          title
          description
          descriptionHtml
          priceRange { minVariantPrice { amount currencyCode } }
          images(first: 3) { edges { node { url altText } } }
          options(first: 10) { name optionValues { name swatch { color } } }
          variants(first: 10) { edges { node { id title price { amount } compareAtPrice { amount } selectedOptions { name value } image { url altText } } } }
          metafields(identifiers: ${METAFIELD_IDENTIFIERS_GQL}) { key value }
        }
      }
    }
  }
`;

/**
 * Catalogo completo de la tienda: las 4 categorias curadas MAS todo el
 * catalogo Nu Skin (vendor "Nu Skin"), deduplicado por id.
 *
 * getProducts() no basta aca porque solo devuelve lo que esta dentro de las
 * colecciones curadas, y los 72 productos importados de la lista de precios
 * de Nu Skin Colombia no pertenecen a ninguna. Se sigue excluyendo el resto
 * del catalogo Shopify (importaciones genericas ajenas al posicionamiento).
 *
 * Ojo: la Storefront API solo ve productos ACTIVOS y publicados en el canal
 * de ventas. Los que entran del CSV en borrador no aparecen aqui hasta que
 * se publiquen desde Shopify Admin — eso es intencional.
 */
export async function getCatalogProducts(): Promise<Product[]> {
  if (!isShopifyConfigured) return MOCK_PRODUCTS;

  const byId = new Map<string, Product>();

  const curados = await getProducts();
  for (const product of curados) byId.set(product.id, product);

  try {
    let cursor: string | null = null;
    do {
      const data: {
        products: {
          pageInfo: { hasNextPage: boolean; endCursor: string };
          edges: { node: Parameters<typeof mapNode>[0] }[];
        };
      } = await storefrontFetch(PRODUCTS_BY_VENDOR_QUERY, {
        query: "vendor:'Nu Skin'",
        cursor,
      });

      const productos = await overrideVariantColors(
        data.products.edges.map((e) => mapNode(e.node)),
      );
      for (const product of productos) {
        if (!byId.has(product.id)) byId.set(product.id, product);
      }

      cursor = data.products.pageInfo.hasNextPage
        ? data.products.pageInfo.endCursor
        : null;
    } while (cursor);
  } catch (error) {
    // Si esta consulta falla, el catalogo sigue mostrando las categorias
    // curadas en vez de quedar en blanco.
    console.warn("No se pudo traer el catalogo Nu Skin completo:", error);
  }

  return Array.from(byId.values());
}

export async function getProductByHandle(
  handle: string,
): Promise<Product | null> {
  if (!isShopifyConfigured) {
    return MOCK_PRODUCTS.find((p) => p.handle === handle) ?? null;
  }

  const data = await storefrontFetch<{
    productByHandle: Parameters<typeof mapNode>[0] | null;
  }>(PRODUCT_BY_HANDLE_QUERY, { handle });

  if (!data.productByHandle) return null;

  const [product] = await overrideVariantColors([
    mapNode(data.productByHandle),
  ]);
  return product;
}

/**
 * El metafield `diana_mile.collection_content` sigue el mismo patron que
 * `landing_content`: JSON tolerante a errores, null si esta vacio o mal
 * formado (la pagina de categoria nunca debe romperse por esto).
 */
function parseCollectionLandingContent(
  value: string | undefined,
): CollectionLandingContent | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object"
      ? (parsed as CollectionLandingContent)
      : null;
  } catch (error) {
    console.warn("collection_content no es un JSON valido:", error);
    return null;
  }
}

function mapCollectionNode(node: {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: { url: string; altText: string | null } | null;
  metafields: ({ key: string; value: string } | null)[];
  products: { edges: { node: Parameters<typeof mapNode>[0] }[] };
}): Collection {
  const byKey = new Map(
    node.metafields.filter(Boolean).map((m) => [m!.key, m!.value]),
  );

  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    description: node.description,
    image: node.image,
    landingContent: parseCollectionLandingContent(
      byKey.get("collection_content"),
    ),
    products: node.products.edges.map((e) => mapNode(e.node)),
  };
}

/**
 * Las categorias que se muestran en la tienda, en orden.
 *
 * Antes esto devolvia exactamente los seis handles de `COLLECTION_HANDLES` y
 * nada mas. El problema no era lo que mostraba sino lo que callaba: crear una
 * categoria en Shopify Admin no hacia absolutamente nada —no aparecia en el
 * home, ni en /categorias, ni en el menu— hasta que alguien editaba este
 * archivo y desplegaba. Para quien administra la tienda desde Shopify, eso se
 * siente como que la categoria "no se guardo".
 *
 * Ahora se leen todas las collections de Shopify y se descartan dos cosas: las
 * de `COLLECTION_HANDLES_OCULTOS` (internas y legacy) y las que no tienen
 * ningun producto publicado — una categoria vacia en el escaparate parece una
 * tienda a medio montar, y ademas es un clic que no lleva a nada.
 *
 * El orden: primero las curadas en el orden de `COLLECTION_HANDLES` (la
 * primera abre /categorias a ancho completo, asi que ese orden es una decision
 * de merchandising), y despues las nuevas en el orden que trae Shopify.
 *
 * Si la consulta de handles falla, cae a la lista curada: es preferible una
 * tienda con seis categorias a una sin ninguna.
 */
export async function getCollections(): Promise<Collection[]> {
  if (!isShopifyConfigured) return MOCK_COLLECTIONS;

  let handles: string[] = [...COLLECTION_HANDLES];

  try {
    const data = await storefrontFetch<{
      collections: { edges: { node: { handle: string } }[] };
    }>(COLLECTION_HANDLES_QUERY, { first: 50 });

    const enShopify = data.collections.edges.map((e) => e.node.handle);
    const curadas: readonly string[] = COLLECTION_HANDLES;

    handles = [
      ...COLLECTION_HANDLES.filter((h) => enShopify.includes(h)),
      ...enShopify.filter(
        (h) => !curadas.includes(h) && !COLLECTION_HANDLES_OCULTOS.includes(h),
      ),
    ];
  } catch (error) {
    console.warn(
      "No se pudo listar las collections de Shopify, se usa la lista curada:",
      error,
    );
  }

  const collections = await Promise.all(
    handles.map((handle) => getCollectionByHandle(handle)),
  );

  return collections.filter(
    (c): c is Collection => c !== null && c.products.length > 0,
  );
}

export async function getCollectionByHandle(
  handle: string,
): Promise<Collection | null> {
  if (!isShopifyConfigured) {
    return MOCK_COLLECTIONS.find((c) => c.handle === handle) ?? null;
  }

  const data = await storefrontFetch<{
    collectionByHandle: Parameters<typeof mapCollectionNode>[0] | null;
  }>(COLLECTION_BY_HANDLE_QUERY, { handle });

  if (!data.collectionByHandle) return null;

  const collection = mapCollectionNode(data.collectionByHandle);
  const products = await overrideVariantColors(collection.products);
  return { ...collection, products };
}

export type CreateOrderInput = {
  variantId: string;
  quantity: number;
  nombre: string;
  telefono: string;
  email?: string;
  departamento: string;
  direccion: string;
  barrio?: string;
  ciudad: string;
  lat?: number | null;
  lng?: number | null;
  discountPercent?: number;
  envioPrioritario?: boolean;
  /** Decidido en el servidor comparando el precio real contra el umbral de
   * envio gratis — nunca lo manda el cliente. */
  envioEstandar?: boolean;
};

/**
 * La Storefront API (GraphQL) entrega los IDs de variante como
 * "gid://shopify/ProductVariant/123". La Admin API REST (usada aca para
 * crear la orden) necesita el numero plano, si no responde 400.
 */
function toRestVariantId(id: string): string {
  const match = id.match(/(\d+)$/);
  return match ? match[1] : id;
}

/**
 * Shopify rechaza la orden ENTERA con 422 "phone_number has already been
 * taken" si mandas un objeto customer nuevo con un telefono que ya
 * pertenece a otro cliente (ej. alguien que pide por segunda vez). Hay que
 * buscarlo primero y reusar su id en vez de intentar crear uno duplicado.
 */
async function findExistingCustomerId(phone: string): Promise<string | null> {
  const res = await fetch(
    `https://${STORE_DOMAIN}/admin/api/${API_VERSION}/customers/search.json?query=${encodeURIComponent(`phone:${phone}`)}`,
    { headers: { "X-Shopify-Access-Token": ADMIN_TOKEN! } },
  );

  if (!res.ok) return null;

  const json = await res.json();
  return json.customers?.[0]?.id ? String(json.customers[0].id) : null;
}

/**
 * A diferencia de orders.json, draft_orders.json NO crea un customer
 * inline a partir de {first_name, phone} — solo acepta {id: existente}.
 * Si no hay uno ya, hay que crearlo primero via /customers.json.
 */
async function findOrCreateCustomerId(
  phone: string,
  firstName: string,
  lastName: string,
): Promise<string | null> {
  const existing = await findExistingCustomerId(phone);
  if (existing) return existing;

  try {
    const res = await fetch(
      `https://${STORE_DOMAIN}/admin/api/${API_VERSION}/customers.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": ADMIN_TOKEN!,
        },
        body: JSON.stringify({
          customer: { first_name: firstName, last_name: lastName, phone },
        }),
      },
    );

    if (!res.ok) {
      console.error(
        "Error al crear customer para carrito abandonado:",
        res.status,
        await res.text(),
      );
      return null;
    }

    const json = await res.json();
    return json.customer?.id ? String(json.customer.id) : null;
  } catch (error) {
    console.error("Error al crear customer para carrito abandonado:", error);
    return null;
  }
}

/**
 * Crea o actualiza (si se pasa existingDraftOrderId) el draft order que
 * representa el pedido MIENTRAS la persona todavia puede volver atras y
 * editar sus datos (pasos "Realizar pedido" <-> "Confirmar pedido"). A
 * diferencia de una orden real, un draft order se puede modificar por
 * completo via PUT — asi que editar y reenviar nunca duplica el pedido,
 * solo actualiza el mismo draft.
 */
export async function upsertCheckoutDraftOrder(
  input: CreateOrderInput,
  existingDraftOrderId?: string | null,
): Promise<{ draftOrderId: string } | null> {
  if (!STORE_DOMAIN || !ADMIN_TOKEN) {
    return { draftOrderId: existingDraftOrderId ?? `MOCK-DRAFT-${Date.now()}` };
  }

  try {
    const { firstName, lastName } = splitFullName(input.nombre);
    const customerId = await findOrCreateCustomerId(
      input.telefono,
      firstName,
      lastName,
    );

    // Shopify descarta shipping_address/customer ENTERO y sin error si
    // faltan last_name, province o country_code — asi se rompio antes.
    const address = {
      first_name: firstName,
      last_name: lastName,
      address1: input.direccion,
      address2: input.barrio || undefined,
      city: input.ciudad,
      province: input.departamento,
      country: "Colombia",
      country_code: "CO",
      phone: input.telefono,
    };

    const notePartes = ["Pedido COD — Contraentrega"];
    if (typeof input.lat === "number" && typeof input.lng === "number") {
      notePartes.push(
        `Ubicación GPS del cliente: https://maps.google.com/?q=${input.lat},${input.lng}`,
      );
    }
    if (input.discountPercent) {
      notePartes.push(
        `Descuento popup exit-intent aplicado: ${input.discountPercent}%`,
      );
    }

    // El descuento va en la linea del producto, no en el pedido entero.
    //
    // A nivel de pedido Shopify lo reparte tambien sobre el envio
    // prioritario, y ahi la cuenta deja de cuadrar: con $89.700 mas $12.000
    // de envio y un 10%, la app le dice a la clienta $92.730 —descuento
    // solo sobre el producto— y la orden queda en $91.530. Mil doscientos
    // de diferencia entre lo que cobra el mensajero y lo que dice Shopify,
    // que aparecen al cuadrar caja y no se sabe de donde salen.
    const lineItems: Record<string, unknown>[] = [
      {
        variant_id: toRestVariantId(input.variantId),
        quantity: input.quantity,
        ...(input.discountPercent
          ? {
              applied_discount: {
                description: "Oferta exit-intent",
                title: "Descuento",
                value_type: "percentage",
                value: String(input.discountPercent),
              },
            }
          : {}),
      },
    ];
    if (input.envioPrioritario) {
      lineItems.push({ variant_id: ENVIO_PRIORITARIO_VARIANT_ID, quantity: 1 });
    }
    if (input.envioEstandar) {
      lineItems.push({ variant_id: ENVIO_ESTANDAR_VARIANT_ID, quantity: 1 });
    }

    const payload = {
      draft_order: {
        line_items: lineItems,
        ...(customerId ? { customer: { id: customerId } } : {}),
        shipping_address: address,
        billing_address: address,
        note: notePartes.join("\n"),
        tags: "COD, milito-life-shop, checkout-en-progreso",
        use_customer_default_address: false,
      },
    };

    const url = existingDraftOrderId
      ? `https://${STORE_DOMAIN}/admin/api/${API_VERSION}/draft_orders/${existingDraftOrderId}.json`
      : `https://${STORE_DOMAIN}/admin/api/${API_VERSION}/draft_orders.json`;

    const res = await fetch(url, {
      method: existingDraftOrderId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": ADMIN_TOKEN,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error(
        "Error al crear/actualizar draft order de checkout:",
        res.status,
        await res.text(),
      );
      return null;
    }

    const json = await res.json();
    return { draftOrderId: String(json.draft_order.id) };
  } catch (error) {
    console.error("Error al registrar draft order de checkout:", error);
    return null;
  }
}

/**
 * Convierte el draft order en una orden real de Shopify — el momento en
 * que el pedido "nace" de verdad, con los datos tal como quedaron despues
 * de cualquier edicion. payment_pending=true mantiene financial_status en
 * "pending" (es contraentrega, no se cobra en el momento).
 */
export async function completeDraftOrder(
  draftOrderId: string,
): Promise<{ orderId: string; orderNumber: string }> {
  if (!STORE_DOMAIN || !ADMIN_TOKEN) {
    return {
      orderId: `MOCK-${Date.now()}`,
      orderNumber: `#DM${Math.floor(1000 + Math.random() * 9000)}`,
    };
  }

  const completeRes = await fetch(
    `https://${STORE_DOMAIN}/admin/api/${API_VERSION}/draft_orders/${draftOrderId}/complete.json?payment_pending=true`,
    {
      method: "PUT",
      headers: { "X-Shopify-Access-Token": ADMIN_TOKEN },
    },
  );

  if (!completeRes.ok) {
    const errorBody = await completeRes.text();
    throw new Error(
      `Shopify Admin API error al completar el pedido: ${completeRes.status} — ${errorBody}`,
    );
  }

  const completeJson = await completeRes.json();
  const orderId = String(completeJson.draft_order.order_id);

  const orderRes = await fetch(
    `https://${STORE_DOMAIN}/admin/api/${API_VERSION}/orders/${orderId}.json`,
    {
      headers: { "X-Shopify-Access-Token": ADMIN_TOKEN },
    },
  );

  if (!orderRes.ok) {
    throw new Error(
      `Shopify Admin API error al leer la orden confirmada: ${orderRes.status}`,
    );
  }

  const orderJson = await orderRes.json();
  return { orderId, orderNumber: `#${orderJson.order.order_number}` };
}

export type AbandonedCartInput = {
  variantId: string;
  nombre: string;
  telefono: string;
  ciudad?: string | null;
};

/**
 * Registra el carrito abandonado como BORRADOR (draft order) en Shopify —
 * visible en Orders > Drafts. Si ya existe un draft para esta persona
 * (existingDraftOrderId), lo actualiza en vez de crear uno duplicado cada
 * vez que sigue escribiendo. Devuelve null si Shopify no esta configurado
 * o si algo falla (esto nunca debe romper el flujo de compra).
 */
export async function upsertAbandonedDraftOrder(
  input: AbandonedCartInput,
  existingDraftOrderId?: string | null,
): Promise<{ draftOrderId: string } | null> {
  if (!STORE_DOMAIN || !ADMIN_TOKEN) return null;

  try {
    const { firstName, lastName } = splitFullName(input.nombre);
    const customerId = await findOrCreateCustomerId(
      input.telefono,
      firstName,
      lastName,
    );

    const payload = {
      draft_order: {
        line_items: [
          { variant_id: toRestVariantId(input.variantId), quantity: 1 },
        ],
        ...(customerId ? { customer: { id: customerId } } : {}),
        note: `Carrito abandonado — checkout no completado${input.ciudad ? ` (${input.ciudad})` : ""}\nNombre: ${input.nombre} · Tel: ${input.telefono}`,
        tags: "carrito-abandonado",
        use_customer_default_address: false,
      },
    };

    const url = existingDraftOrderId
      ? `https://${STORE_DOMAIN}/admin/api/${API_VERSION}/draft_orders/${existingDraftOrderId}.json`
      : `https://${STORE_DOMAIN}/admin/api/${API_VERSION}/draft_orders.json`;

    const res = await fetch(url, {
      method: existingDraftOrderId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": ADMIN_TOKEN,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error(
        "Error al crear/actualizar draft order de carrito abandonado:",
        res.status,
        await res.text(),
      );
      return null;
    }

    const json = await res.json();
    return { draftOrderId: String(json.draft_order.id) };
  } catch (error) {
    console.error("Error al registrar carrito abandonado en Shopify:", error);
    return null;
  }
}

/**
 * El pedido se completo: el draft ya no representa un carrito abandonado,
 * asi que se borra para que no quede duplicado con la orden real.
 */
export async function deleteDraftOrder(draftOrderId: string): Promise<void> {
  if (!STORE_DOMAIN || !ADMIN_TOKEN) return;
  try {
    await fetch(
      `https://${STORE_DOMAIN}/admin/api/${API_VERSION}/draft_orders/${draftOrderId}.json`,
      {
        method: "DELETE",
        headers: { "X-Shopify-Access-Token": ADMIN_TOKEN },
      },
    );
  } catch (error) {
    console.error("Error al borrar draft order de carrito abandonado:", error);
  }
}

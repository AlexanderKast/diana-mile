import {
  Collection,
  CollectionLandingContent,
  Product,
  ProductLandingContent,
  ProductMetafields,
} from "@diana-mile/shared/types";
import { splitFullName } from "@diana-mile/shared/utils";
import { ENVIO_PRIORITARIO_VARIANT_ID } from "@/lib/pricing";

const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;
const API_VERSION = "2024-01";

const isShopifyConfigured = Boolean(STORE_DOMAIN && STOREFRONT_TOKEN);

const MOCK_PRODUCTS: Product[] = [
  {
    id: "mock-1",
    handle: "serum-luminoso-24h",
    title: "Serum Luminoso 24H",
    description:
      "Serum anti-edad de accion prolongada. Ilumina, firma y reduce lineas de expresion con uso constante en tu ritual nocturno.",
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
      },
    ],
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
      },
    ],
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
  {
    id: "mock-3",
    handle: "contorno-ojos-dorado",
    title: "Contorno de Ojos Dorado",
    description:
      "Formula concentrada para la zona mas delicada del rostro. Reduce ojeras y lineas finas con particulas de oro coloidal.",
    price: "199000",
    currencyCode: "COP",
    images: [
      { url: "/images/hero-home.jpg", altText: "Contorno de Ojos Dorado" },
    ],
    variantId: "mock-variant-3",
    variants: [
      {
        id: "mock-variant-3",
        title: "1 unidad",
        price: "199000",
        compareAtPrice: null,
      },
    ],
    metafields: {
      nuskinDirectUrl: null,
      nuskinDirectPrecio: null,
      ahorroPack2: null,
      ahorroPack3: null,
      // Sin landingContent: prueba el camino de fallback neutral del resolver.
      landingContent: null,
    },
  },
];

/**
 * Handles de las 4 categorias de la tienda. Deben existir como Collections
 * custom en Shopify Admin con estos mismos handles (autogenerados por
 * Shopify a partir del titulo al crearlas — no son arbitrarios).
 */
export const COLLECTION_HANDLES = [
  "ritual-epoch",
  "rituales-de-piel",
  "tendencia-milito",
  "suplementos-y-bienestar",
] as const;

const MOCK_COLLECTIONS: Collection[] = [
  {
    id: "mock-collection-ritual-epoch",
    handle: "ritual-epoch",
    title: "Nuskin",
    description: "La linea Epoch® de Nu Skin, curada por Milito Life Shop.",
    image: {
      url: "/images/product-epoch-hero.jpg",
      altText: "Nuskin",
    },
    landingContent: null,
    products: [],
  },
  {
    id: "mock-collection-rituales-de-piel",
    handle: "rituales-de-piel",
    title: "Rituales",
    description:
      "Skincare para tu ritual diario: sueros, cremas y contornos de ojos.",
    image: { url: "/images/lifestyle-ritual.jpg", altText: "Rituales" },
    landingContent: null,
    products: MOCK_PRODUCTS,
  },
  {
    id: "mock-collection-tendencia-milito",
    handle: "tendencia-milito",
    title: "Tendencias",
    description: "Lo que mas estan pidiendo esta temporada.",
    image: null,
    landingContent: null,
    products: [],
  },
  {
    id: "mock-collection-suplementos-y-bienestar",
    handle: "suplementos-y-bienestar",
    title: "Suplementos y Bienestar",
    description: "Bienestar desde adentro, complemento de tu ritual de piel.",
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
  {namespace: "diana_mile", key: "landing_content"}
]`;

const COLLECTION_METAFIELD_IDENTIFIERS_GQL = `[
  {namespace: "diana_mile", key: "collection_content"}
]`;

const PRODUCTS_QUERY = `
  query Products($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          handle
          title
          description
          priceRange { minVariantPrice { amount currencyCode } }
          images(first: 3) { edges { node { url altText } } }
          variants(first: 10) { edges { node { id title price { amount } compareAtPrice { amount } } } }
          metafields(identifiers: ${METAFIELD_IDENTIFIERS_GQL}) { key value }
        }
      }
    }
  }
`;

const PRODUCT_BY_HANDLE_QUERY = `
  query ProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      handle
      title
      description
      priceRange { minVariantPrice { amount currencyCode } }
      images(first: 6) { edges { node { url altText } } }
      variants(first: 10) { edges { node { id title price { amount } compareAtPrice { amount } } } }
      metafields(identifiers: ${METAFIELD_IDENTIFIERS_GQL}) { key value }
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
      products(first: 24) {
        edges {
          node {
            id
            handle
            title
            description
            priceRange { minVariantPrice { amount currencyCode } }
            images(first: 3) { edges { node { url altText } } }
            variants(first: 10) { edges { node { id title price { amount } compareAtPrice { amount } } } }
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

function mapNode(node: {
  id: string;
  handle: string;
  title: string;
  description: string;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  images: { edges: { node: { url: string; altText: string | null } }[] };
  variants: {
    edges: {
      node: {
        id: string;
        title: string;
        price: { amount: string };
        compareAtPrice: { amount: string } | null;
      };
    }[];
  };
  metafields: ({ key: string; value: string } | null)[];
}): Product {
  const variants = node.variants.edges
    .map((e) => ({
      id: e.node.id,
      title: e.node.title,
      price: e.node.price.amount,
      compareAtPrice: e.node.compareAtPrice?.amount ?? null,
    }))
    .sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    description: node.description,
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
  };
}

export async function getProducts(): Promise<Product[]> {
  if (!isShopifyConfigured) return MOCK_PRODUCTS;

  const data = await storefrontFetch<{
    products: { edges: { node: Parameters<typeof mapNode>[0] }[] };
  }>(PRODUCTS_QUERY, { first: 24 });

  return data.products.edges.map((e) => mapNode(e.node));
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

  return data.productByHandle ? mapNode(data.productByHandle) : null;
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
 * Trae SOLO las categorias curadas de la tienda (COLLECTION_HANDLES), no
 * todas las collections que existan en Shopify — la tienda tiene otras
 * (ej. "Home page", "Liteshop Import") que no son parte de esta navegacion.
 */
export async function getCollections(): Promise<Collection[]> {
  if (!isShopifyConfigured) return MOCK_COLLECTIONS;

  const collections = await Promise.all(
    COLLECTION_HANDLES.map((handle) => getCollectionByHandle(handle)),
  );
  return collections.filter((c): c is Collection => c !== null);
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

  return data.collectionByHandle
    ? mapCollectionNode(data.collectionByHandle)
    : null;
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

    const lineItems: Record<string, unknown>[] = [
      {
        variant_id: toRestVariantId(input.variantId),
        quantity: input.quantity,
      },
    ];
    if (input.envioPrioritario) {
      lineItems.push({ variant_id: ENVIO_PRIORITARIO_VARIANT_ID, quantity: 1 });
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

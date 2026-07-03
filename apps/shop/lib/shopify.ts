import { Product, ProductMetafields } from "@diana-mile/shared/types";
import { splitFullName } from "@diana-mile/shared/utils";

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
    images: [{ url: "/images/product-epoch-hero.jpg", altText: "Serum Luminoso 24H" }],
    variantId: "mock-variant-1",
    variants: [{ id: "mock-variant-1", title: "1 unidad", price: "289000", compareAtPrice: null }],
    metafields: { nuskinDirectUrl: null, nuskinDirectPrecio: null, ahorroPack2: null, ahorroPack3: null },
  },
  {
    id: "mock-2",
    handle: "crema-ritual-nocturno",
    title: "Crema Ritual Nocturno",
    description:
      "Textura envolvente con tecnologia regeneradora. Trabaja mientras duermes para devolver firmeza y luminosidad a tu piel.",
    price: "319000",
    currencyCode: "COP",
    images: [{ url: "/images/lifestyle-ritual.jpg", altText: "Crema Ritual Nocturno" }],
    variantId: "mock-variant-2",
    variants: [{ id: "mock-variant-2", title: "1 unidad", price: "319000", compareAtPrice: null }],
    metafields: { nuskinDirectUrl: null, nuskinDirectPrecio: null, ahorroPack2: null, ahorroPack3: null },
  },
  {
    id: "mock-3",
    handle: "contorno-ojos-dorado",
    title: "Contorno de Ojos Dorado",
    description:
      "Formula concentrada para la zona mas delicada del rostro. Reduce ojeras y lineas finas con particulas de oro coloidal.",
    price: "199000",
    currencyCode: "COP",
    images: [{ url: "/images/hero-home.jpg", altText: "Contorno de Ojos Dorado" }],
    variantId: "mock-variant-3",
    variants: [{ id: "mock-variant-3", title: "1 unidad", price: "199000", compareAtPrice: null }],
    metafields: { nuskinDirectUrl: null, nuskinDirectPrecio: null, ahorroPack2: null, ahorroPack3: null },
  },
];

const METAFIELD_IDENTIFIERS_GQL = `[
  {namespace: "diana_mile", key: "nuskin_direct_url"},
  {namespace: "diana_mile", key: "nuskin_direct_precio"},
  {namespace: "diana_mile", key: "ahorro_pack2"},
  {namespace: "diana_mile", key: "ahorro_pack3"}
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

async function storefrontFetch<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(`https://${STORE_DOMAIN}/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN!,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Shopify Storefront API error: ${res.status}`);
  }

  const json = await res.json();
  return json.data as T;
}

function mapMetafields(metafields: { key: string; value: string }[] | null | undefined): ProductMetafields {
  const byKey = new Map((metafields ?? []).filter(Boolean).map((m) => [m.key, m.value]));
  return {
    nuskinDirectUrl: byKey.get("nuskin_direct_url") ?? null,
    nuskinDirectPrecio: byKey.get("nuskin_direct_precio") ?? null,
    ahorroPack2: byKey.get("ahorro_pack2") ?? null,
    ahorroPack3: byKey.get("ahorro_pack3") ?? null,
  };
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
      node: { id: string; title: string; price: { amount: string }; compareAtPrice: { amount: string } | null };
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
    metafields: mapMetafields(node.metafields.filter((m): m is { key: string; value: string } => m !== null)),
  };
}

export async function getProducts(): Promise<Product[]> {
  if (!isShopifyConfigured) return MOCK_PRODUCTS;

  const data = await storefrontFetch<{
    products: { edges: { node: Parameters<typeof mapNode>[0] }[] };
  }>(PRODUCTS_QUERY, { first: 24 });

  return data.products.edges.map((e) => mapNode(e.node));
}

export async function getProductByHandle(handle: string): Promise<Product | null> {
  if (!isShopifyConfigured) {
    return MOCK_PRODUCTS.find((p) => p.handle === handle) ?? null;
  }

  const data = await storefrontFetch<{ productByHandle: Parameters<typeof mapNode>[0] | null }>(
    PRODUCT_BY_HANDLE_QUERY,
    { handle }
  );

  return data.productByHandle ? mapNode(data.productByHandle) : null;
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
    { headers: { "X-Shopify-Access-Token": ADMIN_TOKEN! } }
  );

  if (!res.ok) return null;

  const json = await res.json();
  return json.customers?.[0]?.id ? String(json.customers[0].id) : null;
}

export async function createShopifyOrder(
  input: CreateOrderInput
): Promise<{ orderId: string; orderNumber: string }> {
  if (!STORE_DOMAIN || !ADMIN_TOKEN) {
    return { orderId: `MOCK-${Date.now()}`, orderNumber: `#DM${Math.floor(1000 + Math.random() * 9000)}` };
  }

  const { firstName, lastName } = splitFullName(input.nombre);
  const existingCustomerId = await findExistingCustomerId(input.telefono);

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
    notePartes.push(`Ubicación GPS del cliente: https://maps.google.com/?q=${input.lat},${input.lng}`);
  }

  const res = await fetch(`https://${STORE_DOMAIN}/admin/api/${API_VERSION}/orders.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": ADMIN_TOKEN,
    },
    body: JSON.stringify({
      order: {
        line_items: [{ variant_id: toRestVariantId(input.variantId), quantity: input.quantity }],
        customer: existingCustomerId
          ? { id: existingCustomerId }
          : {
              first_name: firstName,
              last_name: lastName,
              phone: input.telefono,
              ...(input.email ? { email: input.email } : {}),
            },
        shipping_address: address,
        billing_address: address,
        financial_status: "pending",
        fulfillment_status: null,
        note: notePartes.join("\n"),
        tags: "COD, milito-life-shop",
        send_receipt: false,
        send_fulfillment_receipt: false,
      },
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Shopify Admin API error: ${res.status} — ${errorBody}`);
  }

  const json = await res.json();
  return { orderId: String(json.order.id), orderNumber: `#${json.order.order_number}` };
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
  existingDraftOrderId?: string | null
): Promise<{ draftOrderId: string } | null> {
  if (!STORE_DOMAIN || !ADMIN_TOKEN) return null;

  try {
    const { firstName, lastName } = splitFullName(input.nombre);
    const existingCustomerId = await findExistingCustomerId(input.telefono);

    const payload = {
      draft_order: {
        line_items: [{ variant_id: toRestVariantId(input.variantId), quantity: 1 }],
        customer: existingCustomerId
          ? { id: existingCustomerId }
          : { first_name: firstName, last_name: lastName, phone: input.telefono },
        note: `Carrito abandonado — checkout no completado${input.ciudad ? ` (${input.ciudad})` : ""}`,
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
      console.error("Error al crear/actualizar draft order de carrito abandonado:", res.status, await res.text());
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
    await fetch(`https://${STORE_DOMAIN}/admin/api/${API_VERSION}/draft_orders/${draftOrderId}.json`, {
      method: "DELETE",
      headers: { "X-Shopify-Access-Token": ADMIN_TOKEN },
    });
  } catch (error) {
    console.error("Error al borrar draft order de carrito abandonado:", error);
  }
}

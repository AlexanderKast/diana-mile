import { Product } from "@/types";

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
    images: [{ url: "/mock/producto-1.jpg", altText: "Serum Luminoso 24H" }],
    variantId: "mock-variant-1",
  },
  {
    id: "mock-2",
    handle: "crema-ritual-nocturno",
    title: "Crema Ritual Nocturno",
    description:
      "Textura envolvente con tecnologia regeneradora. Trabaja mientras duermes para devolver firmeza y luminosidad a tu piel.",
    price: "319000",
    currencyCode: "COP",
    images: [{ url: "/mock/producto-2.jpg", altText: "Crema Ritual Nocturno" }],
    variantId: "mock-variant-2",
  },
  {
    id: "mock-3",
    handle: "contorno-ojos-dorado",
    title: "Contorno de Ojos Dorado",
    description:
      "Formula concentrada para la zona mas delicada del rostro. Reduce ojeras y lineas finas con particulas de oro coloidal.",
    price: "199000",
    currencyCode: "COP",
    images: [{ url: "/mock/producto-3.jpg", altText: "Contorno de Ojos Dorado" }],
    variantId: "mock-variant-3",
  },
];

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
          variants(first: 1) { edges { node { id } } }
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
      images(first: 5) { edges { node { url altText } } }
      variants(first: 1) { edges { node { id } } }
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

function mapNode(node: {
  id: string;
  handle: string;
  title: string;
  description: string;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  images: { edges: { node: { url: string; altText: string | null } }[] };
  variants: { edges: { node: { id: string } }[] };
}): Product {
  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    description: node.description,
    price: node.priceRange.minVariantPrice.amount,
    currencyCode: node.priceRange.minVariantPrice.currencyCode,
    images: node.images.edges.map((e) => e.node),
    variantId: node.variants.edges[0]?.node.id ?? "",
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
  direccion: string;
  ciudad: string;
};

export async function createShopifyOrder(
  input: CreateOrderInput
): Promise<{ orderId: string; orderNumber: string }> {
  if (!STORE_DOMAIN || !ADMIN_TOKEN) {
    return { orderId: `MOCK-${Date.now()}`, orderNumber: `#DM${Math.floor(1000 + Math.random() * 9000)}` };
  }

  const res = await fetch(`https://${STORE_DOMAIN}/admin/api/${API_VERSION}/orders.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": ADMIN_TOKEN,
    },
    body: JSON.stringify({
      order: {
        line_items: [{ variant_id: input.variantId, quantity: input.quantity }],
        customer: { first_name: input.nombre, phone: input.telefono },
        shipping_address: {
          first_name: input.nombre,
          address1: input.direccion,
          city: input.ciudad,
          country: "Colombia",
          phone: input.telefono,
        },
        financial_status: "pending",
        fulfillment_status: null,
        note: "Pedido COD — Contraentrega",
        tags: "COD, diana-mile",
        send_receipt: false,
        send_fulfillment_receipt: false,
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Shopify Admin API error: ${res.status}`);
  }

  const json = await res.json();
  return { orderId: String(json.order.id), orderNumber: `#${json.order.order_number}` };
}

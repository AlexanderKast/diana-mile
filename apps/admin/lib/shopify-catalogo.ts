import type {
  CollectionLandingContent,
  ProductLandingContent,
} from "@diana-mile/shared/types";

const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;
const API_VERSION = "2024-01";

export const isShopifyCatalogoConfigurado = Boolean(
  STORE_DOMAIN && ADMIN_TOKEN,
);

async function adminGraphQL<T = unknown>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(
    `https://${STORE_DOMAIN}/admin/api/${API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": ADMIN_TOKEN!,
      },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    },
  );
  const json = await res.json();
  if (!res.ok || json.errors) {
    throw new Error(
      "Shopify Admin GraphQL error: " + JSON.stringify(json.errors ?? json),
    );
  }
  return json.data as T;
}

function requireConfigurado() {
  if (!isShopifyCatalogoConfigurado) {
    throw new Error(
      "Shopify no esta configurado (faltan SHOPIFY_STORE_DOMAIN / SHOPIFY_ADMIN_API_TOKEN).",
    );
  }
}

function parseMetafield<T>(
  raw: { value: string } | null | undefined,
): T | null {
  if (!raw?.value) return null;
  try {
    return JSON.parse(raw.value) as T;
  } catch {
    return null;
  }
}

/**
 * Crea la definicion del metafield con acceso de lectura desde la Storefront
 * API. Sin esto, la tienda (que lee via Storefront) recibe null aunque el
 * metafield exista. Si ya existe, Shopify responde TAKEN y lo ignoramos.
 * Misma logica que scripts/generate-landing.mjs y generate-collection.mjs.
 */
async function ensureDefinition(
  ownerType: "PRODUCT" | "COLLECTION",
  key: "landing_content" | "collection_content",
  name: string,
  description: string,
) {
  const data = await adminGraphQL<{
    metafieldDefinitionCreate: {
      userErrors: { code: string; message: string }[];
    };
  }>(
    `mutation Create($definition: MetafieldDefinitionInput!) {
      metafieldDefinitionCreate(definition: $definition) {
        createdDefinition { id }
        userErrors { code message }
      }
    }`,
    {
      definition: {
        name,
        namespace: "diana_mile",
        key,
        description,
        type: "json",
        ownerType,
        access: { storefront: "PUBLIC_READ" },
      },
    },
  );
  const errs = data.metafieldDefinitionCreate.userErrors.filter(
    (e) => e.code !== "TAKEN",
  );
  if (errs.length) {
    throw new Error("No se pudo crear la definicion: " + JSON.stringify(errs));
  }
}

type RawMetafield = { value: string } | null;

type RawProductNode = {
  id: string;
  handle: string;
  title: string;
  description?: string | null;
  productType?: string | null;
  tags?: string[];
  status: string;
  featuredImage: { url: string } | null;
  metafield: RawMetafield;
  variants?: { edges: { node: { id: string; title: string } }[] };
};

type RawCollectionNode = {
  id: string;
  handle: string;
  title: string;
  description?: string | null;
  productsCount?: { count: number };
  metafield: RawMetafield;
};

// --- Productos --------------------------------------------------------

export type ProductoResumen = {
  id: string;
  handle: string;
  title: string;
  status: string;
  imagenUrl: string | null;
  configurado: boolean;
};

export type VarianteResumen = {
  id: string;
  title: string;
};

export type ProductoDetalle = {
  id: string;
  handle: string;
  title: string;
  description: string;
  productType: string;
  tags: string[];
  status: string;
  imagenUrl: string | null;
  landingContent: ProductLandingContent | null;
  variantes: VarianteResumen[];
};

const PRODUCT_FIELDS = `
  id
  handle
  title
  status
  featuredImage { url }
  metafield(namespace: "diana_mile", key: "landing_content") { value }
`;

function mapProductoResumen(node: RawProductNode): ProductoResumen {
  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    status: node.status,
    imagenUrl: node.featuredImage?.url ?? null,
    configurado: Boolean(parseMetafield(node.metafield)),
  };
}

export async function listarProductos(): Promise<ProductoResumen[]> {
  requireConfigurado();
  const data = await adminGraphQL<{
    products: { edges: { node: RawProductNode }[] };
  }>(
    `query {
      products(first: 100, sortKey: TITLE) {
        edges { node { ${PRODUCT_FIELDS} } }
      }
    }`,
  );
  return data.products.edges.map((e) => mapProductoResumen(e.node));
}

export async function obtenerProducto(
  handle: string,
): Promise<ProductoDetalle | null> {
  requireConfigurado();
  const data = await adminGraphQL<{ productByHandle: RawProductNode | null }>(
    `query($handle: String!) {
      productByHandle(handle: $handle) {
        id
        handle
        title
        description
        productType
        tags
        status
        featuredImage { url }
        metafield(namespace: "diana_mile", key: "landing_content") { value }
        variants(first: 25) { edges { node { id title } } }
      }
    }`,
    { handle },
  );
  const node = data.productByHandle;
  if (!node) return null;
  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    description: node.description ?? "",
    productType: node.productType ?? "",
    tags: node.tags ?? [],
    status: node.status,
    imagenUrl: node.featuredImage?.url ?? null,
    landingContent: parseMetafield<ProductLandingContent>(node.metafield),
    variantes: (node.variants?.edges ?? []).map((e) => ({
      id: e.node.id,
      title: e.node.title,
    })),
  };
}

export async function guardarLandingProducto(
  ownerId: string,
  content: ProductLandingContent,
): Promise<void> {
  requireConfigurado();
  await ensureDefinition(
    "PRODUCT",
    "landing_content",
    "Landing Content",
    "Contenido editorial de la landing (JSON, generado por IA o editado en el admin).",
  );
  const data = await adminGraphQL<{
    metafieldsSet: { userErrors: { field: string; message: string }[] };
  }>(
    `mutation Set($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { id }
        userErrors { field message }
      }
    }`,
    {
      metafields: [
        {
          ownerId,
          namespace: "diana_mile",
          key: "landing_content",
          type: "json",
          value: JSON.stringify(content),
        },
      ],
    },
  );
  const errs = data.metafieldsSet.userErrors;
  if (errs.length) {
    throw new Error("Error al escribir el metafield: " + JSON.stringify(errs));
  }
}

// --- Categorias (collections) ------------------------------------------

export type CategoriaResumen = {
  id: string;
  handle: string;
  title: string;
  productosCount: number;
  configurado: boolean;
};

export type CategoriaDetalle = {
  id: string;
  handle: string;
  title: string;
  description: string;
  productosCount: number;
  landingContent: CollectionLandingContent | null;
};

const COLLECTION_FIELDS = `
  id
  handle
  title
  productsCount { count }
  metafield(namespace: "diana_mile", key: "collection_content") { value }
`;

function mapCategoriaResumen(node: RawCollectionNode): CategoriaResumen {
  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    productosCount: node.productsCount?.count ?? 0,
    configurado: Boolean(parseMetafield(node.metafield)),
  };
}

export async function listarCategorias(): Promise<CategoriaResumen[]> {
  requireConfigurado();
  const data = await adminGraphQL<{
    collections: { edges: { node: RawCollectionNode }[] };
  }>(
    `query {
      collections(first: 50, sortKey: TITLE) {
        edges { node { ${COLLECTION_FIELDS} } }
      }
    }`,
  );
  return data.collections.edges.map((e) => mapCategoriaResumen(e.node));
}

export async function obtenerCategoria(
  handle: string,
): Promise<CategoriaDetalle | null> {
  requireConfigurado();
  const data = await adminGraphQL<{
    collectionByHandle: RawCollectionNode | null;
  }>(
    `query($handle: String!) {
      collectionByHandle(handle: $handle) {
        id
        handle
        title
        description
        productsCount { count }
        metafield(namespace: "diana_mile", key: "collection_content") { value }
      }
    }`,
    { handle },
  );
  const node = data.collectionByHandle;
  if (!node) return null;
  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    description: node.description ?? "",
    productosCount: node.productsCount?.count ?? 0,
    landingContent: parseMetafield<CollectionLandingContent>(node.metafield),
  };
}

export async function guardarLandingCategoria(
  ownerId: string,
  content: CollectionLandingContent,
): Promise<void> {
  requireConfigurado();
  await ensureDefinition(
    "COLLECTION",
    "collection_content",
    "Collection Content",
    "Contenido editorial del hero de la categoria (JSON, generado por IA o editado en el admin).",
  );
  const data = await adminGraphQL<{
    metafieldsSet: { userErrors: { field: string; message: string }[] };
  }>(
    `mutation Set($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { id }
        userErrors { field message }
      }
    }`,
    {
      metafields: [
        {
          ownerId,
          namespace: "diana_mile",
          key: "collection_content",
          type: "json",
          value: JSON.stringify(content),
        },
      ],
    },
  );
  const errs = data.metafieldsSet.userErrors;
  if (errs.length) {
    throw new Error("Error al escribir el metafield: " + JSON.stringify(errs));
  }
}

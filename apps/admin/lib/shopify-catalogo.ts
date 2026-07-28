import type {
  CollectionLandingContent,
  ProductLandingContent,
} from "@diana-mile/shared/types";

const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;
// Shopify retira versiones ~12 meses despues de publicadas — hay que subir
// esto periodicamente o la API empieza a responder 401.
const API_VERSION = "2026-04";

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
  key: string,
  name: string,
  description: string,
  type: "json" | "boolean" | "single_line_text_field" = "json",
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
        type,
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

// --- Catalogo Nu Skin: estado contraentrega ----------------------------

export type ProductoCatalogoNuskin = {
  id: string;
  handle: string;
  title: string;
  status: string;
  /** Metafield `diana_mile.sku_oficial` — el codigo de la lista de Nu Skin. */
  skuOficial: string | null;
  /** Metafield `diana_mile.linea`; cae al productType si el metafield falta. */
  linea: string | null;
  /** Precio de la primera variante, en COP y como numero. Null si no tiene. */
  precio: number | null;
  codDisponible: boolean;
  motivoNoCod: string | null;
};

const CATALOGO_NUSKIN_QUERY = `
  query CatalogoNuskin($cursor: String) {
    products(first: 100, after: $cursor, query: "vendor:'Nu Skin'", sortKey: TITLE) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id
          handle
          title
          status
          productType
          variants(first: 1) { edges { node { price } } }
          codDisponible: metafield(namespace: "diana_mile", key: "cod_disponible") { value }
          motivoNoCod: metafield(namespace: "diana_mile", key: "motivo_no_cod") { value }
          skuOficial: metafield(namespace: "diana_mile", key: "sku_oficial") { value }
          linea: metafield(namespace: "diana_mile", key: "linea") { value }
        }
      }
    }
  }
`;

type RawCatalogoNode = {
  id: string;
  handle: string;
  title: string;
  status: string;
  productType: string | null;
  variants: { edges: { node: { price: string } }[] };
  codDisponible: RawMetafield;
  motivoNoCod: RawMetafield;
  skuOficial: RawMetafield;
  linea: RawMetafield;
};

/**
 * Todo el catalogo Nu Skin con su estado de contraentrega. A diferencia de
 * la tienda, aca se listan tambien los borradores: Diana necesita ver y
 * ajustar lo que todavia no ha publicado.
 *
 * Mismo default seguro que la tienda: cualquier cosa distinta del string
 * "true" cuenta como NO apto para contraentrega.
 */
export async function listarProductosNuskin(): Promise<
  ProductoCatalogoNuskin[]
> {
  requireConfigurado();

  const productos: ProductoCatalogoNuskin[] = [];
  let cursor: string | null = null;

  do {
    const data: {
      products: {
        pageInfo: { hasNextPage: boolean; endCursor: string };
        edges: { node: RawCatalogoNode }[];
      };
    } = await adminGraphQL(CATALOGO_NUSKIN_QUERY, { cursor });

    for (const edge of data.products.edges) {
      const node = edge.node;
      const precioRaw = node.variants.edges[0]?.node.price;
      const codDisponible =
        node.codDisponible?.value?.trim().toLowerCase() === "true";

      productos.push({
        id: node.id,
        handle: node.handle,
        title: node.title,
        status: node.status,
        skuOficial: node.skuOficial?.value?.trim() || null,
        linea: node.linea?.value?.trim() || node.productType || null,
        precio: precioRaw ? parseFloat(precioRaw) : null,
        codDisponible,
        motivoNoCod: codDisponible
          ? null
          : node.motivoNoCod?.value?.trim() || null,
      });
    }

    cursor = data.products.pageInfo.hasNextPage
      ? data.products.pageInfo.endCursor
      : null;
  } while (cursor);

  return productos;
}

/**
 * Cambia el estado de contraentrega de un producto. Se llama SOLO desde una
 * route handler del servidor: el token de Shopify nunca sale al cliente.
 *
 * Cuando el producto pasa a contraentrega se borra el motivo, que ya no
 * aplica y en la tienda quedaria colgando de la version anterior.
 */
export async function guardarCodDisponible(
  ownerId: string,
  codDisponible: boolean,
): Promise<void> {
  requireConfigurado();

  await ensureDefinition(
    "PRODUCT",
    "cod_disponible",
    "COD disponible",
    "Gobierna el bloque de compra de la pagina de producto (true = contraentrega).",
    "boolean",
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
          key: "cod_disponible",
          type: "boolean",
          value: String(codDisponible),
        },
      ],
    },
  );

  const errs = data.metafieldsSet.userErrors;
  if (errs.length) {
    throw new Error("Error al escribir el metafield: " + JSON.stringify(errs));
  }

  if (codDisponible) {
    await adminGraphQL(
      `mutation Borrar($metafields: [MetafieldIdentifierInput!]!) {
        metafieldsDelete(metafields: $metafields) {
          deletedMetafields { key }
          userErrors { field message }
        }
      }`,
      {
        metafields: [
          {
            ownerId,
            namespace: "diana_mile",
            key: "motivo_no_cod",
          },
        ],
      },
    );
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

// ════════════════════════════════════════════════════════════════════
// COSTEO
// ════════════════════════════════════════════════════════════════════

export type VarianteCosteo = {
  /** gid de la variante. Es la llave contra `costos_producto`. */
  id: string;
  productoId: string;
  productoTitulo: string;
  /** La marca. La tienda es multimarca aunque el foco sea Nu Skin. */
  marca: string;
  varianteTitulo: string;
  handle: string;
  estado: string;
  precio: number;
  /** Necesario para escribir el costo de vuelta en Shopify. */
  inventoryItemId: string | null;
  /** `unitCost` de Shopify. Sirve para detectar desincronizacion. */
  costoShopify: number | null;
  codDisponible: boolean;
};

const VARIANTES_COSTEO_QUERY = `
  query VariantesCosteo($cursor: String) {
    productVariants(first: 100, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id
          title
          price
          inventoryItem { id unitCost { amount } }
          product {
            id
            title
            handle
            status
            vendor
            codDisponible: metafield(namespace: "diana_mile", key: "cod_disponible") { value }
          }
        }
      }
    }
  }
`;

type RawVarianteCosteo = {
  id: string;
  title: string;
  price: string;
  inventoryItem: {
    id: string;
    unitCost: { amount: string } | null;
  } | null;
  product: {
    id: string;
    title: string;
    handle: string;
    status: string;
    vendor: string | null;
    codDisponible: RawMetafield;
  };
};

/**
 * Todas las variantes del catalogo con lo que hace falta para costearlas.
 *
 * NO se filtra por marca. La tienda es multimarca aunque el foco sea Nu
 * Skin, y una consulta con `vendor:'Nu Skin'` dejaria los productos de
 * las demas marcas fuera de la lista de "sin costo" sin que nadie se
 * entere — que es exactamente el fallo silencioso que este modulo existe
 * para evitar. El costeo tiene que cubrir todo lo que se vende.
 *
 * Se consulta a nivel de VARIANTE y no de producto porque el costo vive
 * ahi: un pack de 3 cuesta el triple que la unidad, y costear por
 * producto le daria al pack un margen que no tiene.
 *
 * Se listan tambien los borradores: un producto sin publicar igual hay
 * que costearlo antes de decidir a que precio sale.
 */
export async function listarVariantesParaCosteo(): Promise<VarianteCosteo[]> {
  requireConfigurado();

  const variantes: VarianteCosteo[] = [];
  let cursor: string | null = null;

  do {
    const data: {
      productVariants: {
        pageInfo: { hasNextPage: boolean; endCursor: string };
        edges: { node: RawVarianteCosteo }[];
      };
    } = await adminGraphQL(VARIANTES_COSTEO_QUERY, { cursor });

    for (const edge of data.productVariants.edges) {
      const node = edge.node;
      const precio = parseFloat(node.price);
      const costoRaw = node.inventoryItem?.unitCost?.amount;
      const costoShopify = costoRaw != null ? parseFloat(costoRaw) : null;

      variantes.push({
        id: node.id,
        productoId: node.product.id,
        productoTitulo: node.product.title,
        marca: node.product.vendor?.trim() || "Sin marca",
        varianteTitulo: node.title,
        handle: node.product.handle,
        estado: node.product.status,
        precio: Number.isFinite(precio) ? precio : 0,
        inventoryItemId: node.inventoryItem?.id ?? null,
        costoShopify: Number.isFinite(costoShopify as number) ? costoShopify : null,
        codDisponible:
          node.product.codDisponible?.value?.trim().toLowerCase() === "true",
      });
    }

    cursor = data.productVariants.pageInfo.hasNextPage
      ? data.productVariants.pageInfo.endCursor
      : null;
  } while (cursor);

  return variantes;
}

/**
 * Escribe el costo unitario en el `inventoryItem` de Shopify.
 *
 * La fuente de verdad es nuestra tabla `costos_producto`; esto es un
 * espejo, para que el costo tambien se vea en el admin de Shopify y en
 * sus informes de margen. Por eso quien llama debe tratar un fallo aqui
 * como advertencia y no como error: que Shopify rechace el espejo no
 * puede impedir que el costo quede guardado donde de verdad se usa.
 */
export async function guardarCostoEnShopify(
  inventoryItemId: string,
  costoUnitario: number,
): Promise<void> {
  requireConfigurado();

  const data = await adminGraphQL<{
    inventoryItemUpdate: {
      userErrors: { field: string[]; message: string }[];
    };
  }>(
    `mutation GuardarCosto($id: ID!, $input: InventoryItemInput!) {
      inventoryItemUpdate(id: $id, input: $input) {
        inventoryItem { id unitCost { amount } }
        userErrors { field message }
      }
    }`,
    {
      id: inventoryItemId,
      input: { cost: costoUnitario.toFixed(2) },
    },
  );

  const errs = data.inventoryItemUpdate.userErrors;
  if (errs.length) {
    throw new Error("Shopify rechazo el costo: " + JSON.stringify(errs));
  }
}

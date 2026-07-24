import { getProductByHandle } from "../lib/shopify";
import { resolveLanding } from "../lib/product-content";

const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!;
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN!;
const API_VERSION = "2026-04";

async function adminGraphQL(query: string, variables?: Record<string, unknown>) {
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
    throw new Error("Shopify Admin GraphQL error: " + JSON.stringify(json.errors ?? json));
  }
  return json.data;
}

async function main() {
  const handle = "epoch-polishing-bar-barra-exfoliante-corporal";

  const product = await getProductByHandle(handle);
  if (!product) throw new Error("Producto no encontrado en Shopify: " + handle);

  const content = resolveLanding(product);

  console.log("=== Contenido a escribir en diana_mile.landing_content ===");
  console.log(JSON.stringify(content, null, 2));

  await adminGraphQL(
    `mutation Create($definition: MetafieldDefinitionInput!) {
      metafieldDefinitionCreate(definition: $definition) {
        createdDefinition { id }
        userErrors { code message }
      }
    }`,
    {
      definition: {
        name: "Landing Content",
        namespace: "diana_mile",
        key: "landing_content",
        description: "Contenido editorial de la landing (JSON, generado por IA o editado en el admin).",
        type: "json",
        ownerType: "PRODUCT",
        access: { storefront: "PUBLIC_READ" },
      },
    },
  );

  const result = await adminGraphQL(
    `mutation Set($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { id }
        userErrors { field message }
      }
    }`,
    {
      metafields: [
        {
          ownerId: product.id,
          namespace: "diana_mile",
          key: "landing_content",
          type: "json",
          value: JSON.stringify(content),
        },
      ],
    },
  );

  console.log("=== Resultado metafieldsSet ===");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

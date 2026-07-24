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

// Fotos oficiales de Nu Skin (kit de distribuidoras, nuskinsocial.smugmug.com/Social/LATAM/Productos/NuSkin/Epoch)
const NEW_IMAGES = [
  { url: "https://photos.smugmug.com/Social/LATAM/Productos/NuSkin/Epoch/i-GdShFSM/0/MqVzqTM6HrHbjG8HhHd2QZv89XnSzmXHrXvS95DrH/L/Epoch%20Polishing%20Bar%202-L.jpg", alt: "Epoch Polishing Bar — empaque y barra" },
  { url: "https://photos.smugmug.com/Social/LATAM/Productos/NuSkin/Epoch/i-z263dTg/0/KxkQQsBrVP8SttpWSJ69fFJFrG2P6TngZHrP9vrL7/L/Epoch%20Polishing%20Bar%2010-L.jpg", alt: "Epoch Polishing Bar — empaque" },
  { url: "https://photos.smugmug.com/Social/LATAM/Productos/NuSkin/Epoch/i-KTxxGJS/0/LWpCKHvFdHBKx7r2QXvqjPdRS4dh5bpJMTD3xNwMv/L/Epoch%20Polishing%20Bar%201-L.jpg", alt: "Epoch Polishing Bar en uso — beneficios" },
  { url: "https://photos.smugmug.com/Social/LATAM/Productos/NuSkin/Epoch/i-dfjjhgQ/0/L2KpXJGQM9t2xDBCGtC67kqvMpfKJ2rPbBbFzgP57/L/Epoch%20Polishing%20Bar%2016-L.jpg", alt: "Epoch Polishing Bar — textura" },
  { url: "https://photos.smugmug.com/Social/LATAM/Productos/NuSkin/Epoch/i-64wvfTp/0/MfXkPrv6wFRmvzMfGgpHQJsjZcZj8Z9mZhVJVBX8d/L/nu-skin-epoch-polishing-bar-ingredient-4-L.jpg", alt: "Epoch Polishing Bar — ingredientes" },
  { url: "https://photos.smugmug.com/Social/LATAM/Productos/NuSkin/Epoch/i-nRVBCLw/0/K6WsmpvFH23Wvr27kHfSWc9pXhKNQvSPNcGsj9bXN/L/Epoch%20Polishing%20Bar%205-L.jpg", alt: "Epoch Polishing Bar" },
  { url: "https://photos.smugmug.com/Social/LATAM/Productos/NuSkin/Epoch/i-McgG2dM/0/NgHjHwvpC6KNps6VWNV8qG27FKMNvFvPSrzhvt3Nj/L/Epoch%20Polishing%20Bar%2018-L.jpg", alt: "Epoch Polishing Bar" },
  { url: "https://photos.smugmug.com/Social/LATAM/Productos/NuSkin/Epoch/i-npr2hdR/0/L7s7KV7NK6tMf3h44P9CgxfhKZGthjdNsRnhH6GT4/L/Epoch%20Polishing%20Bar%2017-L.jpg", alt: "Epoch Polishing Bar" },
  { url: "https://photos.smugmug.com/Social/LATAM/Productos/NuSkin/Epoch/i-9Jfb573/0/NGB22xvBRd5vJHLWFp8QMMvDscv8hJVgN3Sn4tZHP/L/IMG2010280019-Polishing-Bar-L.jpg", alt: "Epoch Polishing Bar — corteza" },
];

const DUPLICATE_MEDIA_ID = "gid://shopify/MediaImage/28940765265963";
const KEPT_HERO_MEDIA_ID = "gid://shopify/MediaImage/28940765200427";

async function main() {
  const lookup = await adminGraphQL(
    `{ productByHandle(handle: "epoch-polishing-bar-barra-exfoliante-corporal") { id } }`,
  );
  const productId = lookup.productByHandle.id;
  console.log("productId:", productId);

  const del = await adminGraphQL(
    `mutation($productId: ID!, $mediaIds: [ID!]!) {
      productDeleteMedia(productId: $productId, mediaIds: $mediaIds) {
        deletedMediaIds
        mediaUserErrors { field message }
      }
    }`,
    { productId, mediaIds: [DUPLICATE_MEDIA_ID] },
  );
  console.log("delete duplicate:", JSON.stringify(del, null, 2));

  const create = await adminGraphQL(
    `mutation($productId: ID!, $media: [CreateMediaInput!]!) {
      productCreateMedia(productId: $productId, media: $media) {
        media { id ... on MediaImage { image { url } } }
        mediaUserErrors { field message }
      }
    }`,
    {
      productId,
      media: NEW_IMAGES.map((img) => ({
        originalSource: img.url,
        alt: img.alt,
        mediaContentType: "IMAGE",
      })),
    },
  );
  console.log("create media:", JSON.stringify(create, null, 2));

  const newIds: string[] = create.productCreateMedia.media.map((m: { id: string }) => m.id);
  const orderedIds = [KEPT_HERO_MEDIA_ID, ...newIds];

  const reorder = await adminGraphQL(
    `mutation($id: ID!, $moves: [MoveInput!]!) {
      productReorderMedia(id: $id, moves: $moves) {
        job { id }
        mediaUserErrors { field message }
      }
    }`,
    {
      id: productId,
      moves: orderedIds.map((id, index) => ({ id, newPosition: String(index) })),
    },
  );
  console.log("reorder:", JSON.stringify(reorder, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

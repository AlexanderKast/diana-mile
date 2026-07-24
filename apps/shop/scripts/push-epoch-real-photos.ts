import { readFile } from "fs/promises";
import path from "path";

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

const PUBLIC_DIR = path.join(__dirname, "..", "public", "images");

// key = como se identifica despues; usageStepKey si va a reemplazar un
// paso['imagen'] del landing_content, o "resultado" si va al metafield nuevo.
const RITUAL_FILES = [
  { file: "ritual-paso-1-humedece.jpg", stepNumero: "1", alt: "Paso 1: humedece la piel" },
  { file: "ritual-paso-2-masajea.jpg", stepNumero: "2", alt: "Paso 2: masajea" },
  { file: "ritual-paso-3-enjuaga.jpg", stepNumero: "3", alt: "Paso 3: enjuaga" },
];

const RESULTADO_FILES = Array.from({ length: 8 }, (_, i) => ({
  file: `resultados-reales/resultado-${String(i + 1).padStart(2, "0")}.jpg`,
  alt: `Resultado real de una clienta usando Epoch Polishing Bar — foto ${i + 1}`,
}));

async function uploadFileToShopify(localFile: string, alt: string): Promise<string> {
  const filePath = path.join(PUBLIC_DIR, localFile);
  const bytes = await readFile(filePath);
  const filename = path.basename(localFile);

  const staged = await adminGraphQL(
    `mutation($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets { url resourceUrl parameters { name value } }
        userErrors { field message }
      }
    }`,
    {
      input: [
        {
          filename,
          mimeType: "image/jpeg",
          httpMethod: "POST",
          resource: "IMAGE",
        },
      ],
    },
  );
  const errs = staged.stagedUploadsCreate.userErrors;
  if (errs.length) throw new Error("stagedUploadsCreate error: " + JSON.stringify(errs));
  const target = staged.stagedUploadsCreate.stagedTargets[0];

  const form = new FormData();
  for (const p of target.parameters) form.append(p.name, p.value);
  form.append("file", new Blob([bytes], { type: "image/jpeg" }), filename);

  const uploadRes = await fetch(target.url, { method: "POST", body: form });
  if (!uploadRes.ok) {
    throw new Error(`Staged upload failed for ${filename}: ${uploadRes.status} ${await uploadRes.text()}`);
  }

  const created = await adminGraphQL(
    `mutation($files: [FileCreateInput!]!) {
      fileCreate(files: $files) {
        files { id ... on MediaImage { image { url } } }
        userErrors { field message }
      }
    }`,
    {
      files: [
        {
          originalSource: target.resourceUrl,
          contentType: "IMAGE",
          alt,
        },
      ],
    },
  );
  const createErrs = created.fileCreate.userErrors;
  if (createErrs.length) throw new Error("fileCreate error: " + JSON.stringify(createErrs));
  return created.fileCreate.files[0].id as string;
}

async function waitForFileReady(fileId: string): Promise<{ url: string; alt: string | null }> {
  for (let i = 0; i < 15; i++) {
    const data = await adminGraphQL(
      `query($id: ID!) {
        node(id: $id) {
          ... on MediaImage {
            fileStatus
            image { url altText }
          }
        }
      }`,
      { id: fileId },
    );
    const node = data.node;
    if (node?.fileStatus === "READY" && node.image?.url) {
      return { url: node.image.url, alt: node.image.altText };
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`File ${fileId} nunca quedo READY`);
}

async function main() {
  const lookup = await adminGraphQL(
    `{ productByHandle(handle: "epoch-polishing-bar-barra-exfoliante-corporal") {
      id
      metafield(namespace: "diana_mile", key: "landing_content") { value }
    } }`,
  );
  const productId = lookup.productByHandle.id;
  const landingContent = JSON.parse(lookup.productByHandle.metafield.value);
  console.log("productId:", productId);

  console.log("Subiendo 3 fotos de ritual...");
  const ritualIds: string[] = [];
  for (const r of RITUAL_FILES) {
    const id = await uploadFileToShopify(r.file, r.alt);
    ritualIds.push(id);
    console.log(" ", r.file, "->", id);
  }

  console.log("Subiendo 8 fotos de resultados reales...");
  const resultadoIds: string[] = [];
  for (const r of RESULTADO_FILES) {
    const id = await uploadFileToShopify(r.file, r.alt);
    resultadoIds.push(id);
    console.log(" ", r.file, "->", id);
  }

  console.log("Esperando a que Shopify procese los archivos...");
  const ritualReady = await Promise.all(ritualIds.map(waitForFileReady));
  const resultadoReady = await Promise.all(resultadoIds.map(waitForFileReady));

  console.log("Actualizando landing_content con las URLs reales de Shopify...");
  landingContent.usageSteps = landingContent.usageSteps.map((paso: { numero: string; imagen?: string }) => {
    const match = RITUAL_FILES.findIndex((r) => r.stepNumero === paso.numero);
    if (match === -1) return paso;
    return { ...paso, imagen: ritualReady[match].url };
  });

  const setLanding = await adminGraphQL(
    `mutation($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { id }
        userErrors { field message }
      }
    }`,
    {
      metafields: [
        {
          ownerId: productId,
          namespace: "diana_mile",
          key: "landing_content",
          type: "json",
          value: JSON.stringify(landingContent),
        },
      ],
    },
  );
  console.log("landing_content actualizado:", JSON.stringify(setLanding, null, 2));

  console.log("Creando definicion de metafield resultados_reales...");
  const defResult = await adminGraphQL(
    `mutation($definition: MetafieldDefinitionInput!) {
      metafieldDefinitionCreate(definition: $definition) {
        createdDefinition { id }
        userErrors { code message }
      }
    }`,
    {
      definition: {
        name: "Resultados reales",
        namespace: "diana_mile",
        key: "resultados_reales",
        description: "Fotos reales de antes/despues de clientas, con autorizacion de uso. Cualquier persona con acceso a Shopify puede agregar/quitar fotos aqui.",
        type: "list.file_reference",
        ownerType: "PRODUCT",
        access: { storefront: "PUBLIC_READ" },
      },
    },
  );
  const defErrs = defResult.metafieldDefinitionCreate.userErrors.filter((e: { code: string }) => e.code !== "TAKEN");
  if (defErrs.length) throw new Error("metafieldDefinitionCreate error: " + JSON.stringify(defErrs));

  console.log("Guardando resultados_reales...");
  const setResultados = await adminGraphQL(
    `mutation($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { id }
        userErrors { field message }
      }
    }`,
    {
      metafields: [
        {
          ownerId: productId,
          namespace: "diana_mile",
          key: "resultados_reales",
          type: "list.file_reference",
          value: JSON.stringify(resultadoIds),
        },
      ],
    },
  );
  console.log("resultados_reales guardado:", JSON.stringify(setResultados, null, 2));
  console.log("URLs finales de resultados:", resultadoReady.map((r) => r.url));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

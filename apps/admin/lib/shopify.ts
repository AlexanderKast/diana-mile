import { splitFullName } from "@diana-mile/shared/utils";

const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;
const API_VERSION = "2024-01";

const isShopifyConfigured = Boolean(STORE_DOMAIN && ADMIN_TOKEN);

function adminHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": ADMIN_TOKEN!,
  };
}

/**
 * Todas las funciones de este archivo son best-effort: si Shopify no esta
 * configurado o una llamada falla, se loguea y se sigue — nunca deben
 * romper una accion del admin que ya se guardo en Supabase.
 */
async function safeShopifyCall<T>(label: string, fn: () => Promise<T>): Promise<T | null> {
  if (!isShopifyConfigured) return null;
  try {
    return await fn();
  } catch (error) {
    console.error(`Error de sincronizacion con Shopify (${label}):`, error);
    return null;
  }
}

async function findExistingCustomerId(phone: string): Promise<string | null> {
  const res = await fetch(
    `https://${STORE_DOMAIN}/admin/api/${API_VERSION}/customers/search.json?query=${encodeURIComponent(`phone:${phone}`)}`,
    { headers: { "X-Shopify-Access-Token": ADMIN_TOKEN! } }
  );
  if (!res.ok) return null;
  const json = await res.json();
  return json.customers?.[0]?.id ? String(json.customers[0].id) : null;
}

async function findOrCreateCustomerId(phone: string, firstName: string, lastName: string): Promise<string | null> {
  const existing = await findExistingCustomerId(phone);
  if (existing) return existing;

  const res = await fetch(`https://${STORE_DOMAIN}/admin/api/${API_VERSION}/customers.json`, {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify({ customer: { first_name: firstName, last_name: lastName, phone } }),
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.customer?.id ? String(json.customer.id) : null;
}

export type DireccionEnvio = {
  nombre: string;
  telefono: string;
  direccion: string;
  barrio?: string | null;
  ciudad: string;
  departamento?: string | null;
};

/**
 * Completa un lead (carrito abandonado) a orden real: actualiza el draft
 * order existente con la direccion de envio final (recolectada por
 * telefono) y lo convierte en orden. Si Shopify no esta configurado o el
 * draft ya no existe, retorna null y el pedido queda solo en Supabase.
 */
export async function completarDraftComoOrden(
  draftOrderId: string,
  address: DireccionEnvio
): Promise<{ orderId: string; orderNumber: string } | null> {
  return safeShopifyCall("completar draft order", async () => {
    const { firstName, lastName } = splitFullName(address.nombre);
    const shippingAddress = {
      first_name: firstName,
      last_name: lastName,
      address1: address.direccion,
      address2: address.barrio || undefined,
      city: address.ciudad,
      province: address.departamento || undefined,
      country: "Colombia",
      country_code: "CO",
      phone: address.telefono,
    };

    const updateRes = await fetch(
      `https://${STORE_DOMAIN}/admin/api/${API_VERSION}/draft_orders/${draftOrderId}.json`,
      {
        method: "PUT",
        headers: adminHeaders(),
        body: JSON.stringify({
          draft_order: {
            id: draftOrderId,
            shipping_address: shippingAddress,
            billing_address: shippingAddress,
            use_customer_default_address: false,
          },
        }),
      }
    );
    if (!updateRes.ok) {
      throw new Error(`No se pudo actualizar direccion del draft order: ${updateRes.status} — ${await updateRes.text()}`);
    }

    const completeRes = await fetch(
      `https://${STORE_DOMAIN}/admin/api/${API_VERSION}/draft_orders/${draftOrderId}/complete.json?payment_pending=true`,
      { method: "PUT", headers: { "X-Shopify-Access-Token": ADMIN_TOKEN! } }
    );
    if (!completeRes.ok) {
      throw new Error(`No se pudo completar el draft order: ${completeRes.status} — ${await completeRes.text()}`);
    }
    const completeJson = await completeRes.json();
    const orderId = String(completeJson.draft_order.order_id);

    const orderRes = await fetch(`https://${STORE_DOMAIN}/admin/api/${API_VERSION}/orders/${orderId}.json`, {
      headers: { "X-Shopify-Access-Token": ADMIN_TOKEN! },
    });
    if (!orderRes.ok) throw new Error(`No se pudo leer la orden confirmada: ${orderRes.status}`);
    const orderJson = await orderRes.json();

    return { orderId, orderNumber: `#${orderJson.order.order_number}` };
  });
}

/**
 * Crea una orden real directo (sin draft previo) para leads sin
 * shopify_draft_order_id — ej. si la captura de carrito abandonado fallo.
 */
/**
 * Line items van por title/quantity/price a proposito, sin variant_id: esto
 * es fallback para leads sin draft order previo (ya no queda referencia
 * confiable a la variante original), y Shopify los trata como custom line
 * items sin afectar inventario — comportamiento aceptado, no un olvido.
 */
export async function crearOrdenDirecta(
  address: DireccionEnvio,
  lineItems: { title: string; quantity: number; price: string }[],
  nota?: string
): Promise<{ orderId: string; orderNumber: string } | null> {
  return safeShopifyCall("crear orden directa", async () => {
    const { firstName, lastName } = splitFullName(address.nombre);
    const customerId = await findOrCreateCustomerId(address.telefono, firstName, lastName);
    const shippingAddress = {
      first_name: firstName,
      last_name: lastName,
      address1: address.direccion,
      address2: address.barrio || undefined,
      city: address.ciudad,
      province: address.departamento || undefined,
      country: "Colombia",
      country_code: "CO",
      phone: address.telefono,
    };

    const res = await fetch(`https://${STORE_DOMAIN}/admin/api/${API_VERSION}/orders.json`, {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify({
        order: {
          line_items: lineItems.map((li) => ({
            title: li.title,
            quantity: li.quantity,
            price: li.price,
          })),
          ...(customerId ? { customer: { id: customerId } } : {}),
          shipping_address: shippingAddress,
          billing_address: shippingAddress,
          financial_status: "pending",
          note: nota ?? "Pedido COD — confirmado desde admin",
          tags: "COD, milito-life-shop, confirmado-admin",
        },
      }),
    });
    if (!res.ok) throw new Error(`No se pudo crear la orden: ${res.status} — ${await res.text()}`);
    const json = await res.json();
    return { orderId: String(json.order.id), orderNumber: `#${json.order.order_number}` };
  });
}

export async function agregarNotaOrden(orderId: string, linea: string): Promise<void> {
  await safeShopifyCall("agregar nota", async () => {
    const getRes = await fetch(`https://${STORE_DOMAIN}/admin/api/${API_VERSION}/orders/${orderId}.json?fields=note`, {
      headers: { "X-Shopify-Access-Token": ADMIN_TOKEN! },
    });
    const notaActual = getRes.ok ? (await getRes.json()).order?.note ?? "" : "";
    const notaNueva = [notaActual, linea].filter(Boolean).join("\n");

    const res = await fetch(`https://${STORE_DOMAIN}/admin/api/${API_VERSION}/orders/${orderId}.json`, {
      method: "PUT",
      headers: adminHeaders(),
      body: JSON.stringify({ order: { id: orderId, note: notaNueva } }),
    });
    if (!res.ok) throw new Error(`No se pudo actualizar la nota: ${res.status}`);
  });
}

/**
 * Usa la mutacion GraphQL tagsAdd (aditiva, atomica del lado de Shopify) en
 * vez de leer tags actuales + reescribir por REST — dos acciones del admin
 * casi simultaneas (ej. confirmar y luego envio) podian pisarse el tag de
 * la otra con el enfoque read-then-write anterior.
 */
export async function agregarTagsOrden(orderId: string, tagsNuevos: string[]): Promise<void> {
  await safeShopifyCall("agregar tags", async () => {
    const res = await fetch(`https://${STORE_DOMAIN}/admin/api/${API_VERSION}/graphql.json`, {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify({
        query: `mutation tagsAdd($id: ID!, $tags: [String!]!) {
          tagsAdd(id: $id, tags: $tags) {
            userErrors { field message }
          }
        }`,
        variables: { id: `gid://shopify/Order/${orderId}`, tags: tagsNuevos },
      }),
    });
    if (!res.ok) throw new Error(`No se pudo actualizar tags: ${res.status}`);
    const json = await res.json();
    const userErrors = json.data?.tagsAdd?.userErrors ?? [];
    if (userErrors.length > 0) {
      throw new Error(`No se pudo actualizar tags: ${JSON.stringify(userErrors)}`);
    }
  });
}

/**
 * La Fulfillment Orders API reemplazo el POST directo a
 * orders/{id}/fulfillments.json desde la version 2023-01 — hay que ubicar
 * el/los fulfillment_order de la orden y crear el fulfillment sobre esos ids.
 * Una orden puede tener mas de un fulfillment_order (multi-bodega) o tener
 * el primero en estado closed/cancelled — tomar solo fulfillment_orders[0]
 * fallaba silenciosamente en esos casos. Se crea un fulfillment por cada
 * fulfillment_order que todavia admita "create_fulfillment".
 */
export async function crearFulfillment(
  orderId: string,
  tracking: { numeroGuia: string; transportadora: string; urlTracking?: string }
): Promise<void> {
  await safeShopifyCall("crear fulfillment", async () => {
    const foRes = await fetch(
      `https://${STORE_DOMAIN}/admin/api/${API_VERSION}/orders/${orderId}/fulfillment_orders.json`,
      { headers: { "X-Shopify-Access-Token": ADMIN_TOKEN! } }
    );
    if (!foRes.ok) throw new Error(`No se pudieron obtener fulfillment orders: ${foRes.status}`);
    const foJson = await foRes.json();
    const fulfillmentOrders: { id: string; supported_actions?: string[] }[] =
      foJson.fulfillment_orders ?? [];
    const elegibles = fulfillmentOrders.filter((fo) =>
      (fo.supported_actions ?? []).includes("create_fulfillment")
    );

    if (elegibles.length === 0) {
      throw new Error("La orden no tiene fulfillment orders disponibles para despachar.");
    }

    for (const fo of elegibles) {
      const res = await fetch(`https://${STORE_DOMAIN}/admin/api/${API_VERSION}/fulfillments.json`, {
        method: "POST",
        headers: adminHeaders(),
        body: JSON.stringify({
          fulfillment: {
            line_items_by_fulfillment_order: [{ fulfillment_order_id: fo.id }],
            tracking_info: {
              number: tracking.numeroGuia,
              company: tracking.transportadora,
              url: tracking.urlTracking,
            },
            notify_customer: false,
          },
        }),
      });
      if (!res.ok) throw new Error(`No se pudo crear el fulfillment: ${res.status} — ${await res.text()}`);
    }
  });
}

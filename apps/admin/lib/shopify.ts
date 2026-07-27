import { splitFullName } from "@diana-mile/shared/utils";

const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;
// Shopify retira versiones ~12 meses despues de publicadas — hay que subir
// esto periodicamente o la API empieza a responder 401.
const API_VERSION = "2026-04";

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

export type EstadoOrden = {
  cancelada: boolean;
  /** null o "unfulfilled" = todavia no salio de la bodega. */
  fulfillmentStatus: string | null;
  /** Si es seguro cancelarla sin intervencion humana. */
  sePuedeCancelar: boolean;
};

/**
 * Consulta si la orden todavia se puede cancelar sin riesgo.
 *
 * Solo es seguro cuando no se ha preparado: si ya salio, cancelarla sin
 * mas deja el paquete viajando con la transportadora y el cobro pendiente.
 * En ese caso decide una persona.
 */
export async function estadoOrden(orderId: string): Promise<EstadoOrden | null> {
  return safeShopifyCall("estado de orden", async () => {
    const res = await fetch(
      `https://${STORE_DOMAIN}/admin/api/${API_VERSION}/orders/${orderId}.json?fields=id,cancelled_at,fulfillment_status`,
      { headers: adminHeaders() },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const { order } = (await res.json()) as {
      order: { cancelled_at: string | null; fulfillment_status: string | null };
    };

    const sinPreparar =
      !order.fulfillment_status || order.fulfillment_status === "unfulfilled";

    return {
      cancelada: Boolean(order.cancelled_at),
      fulfillmentStatus: order.fulfillment_status,
      sePuedeCancelar: !order.cancelled_at && sinPreparar,
    };
  });
}

/**
 * Cancela la orden en Shopify y devuelve el inventario al stock.
 *
 * `email: false` a proposito: el aviso al cliente lo manda el agente de
 * WhatsApp con su plantilla, no queremos que Shopify mande ademas un
 * correo con otro tono. Devuelve true si quedo cancelada (o ya lo estaba).
 */
export async function cancelarOrdenShopify(
  orderId: string,
  motivo = "other",
): Promise<boolean> {
  const resultado = await safeShopifyCall("cancelar orden", async () => {
    const res = await fetch(
      `https://${STORE_DOMAIN}/admin/api/${API_VERSION}/orders/${orderId}/cancel.json`,
      {
        method: "POST",
        headers: adminHeaders(),
        body: JSON.stringify({ reason: motivo, email: false, restock: true }),
      },
    );

    if (!res.ok) {
      const detalle = await res.text();
      // Shopify responde 422 si ya estaba cancelada: eso no es un fallo.
      if (res.status === 422 && detalle.includes("already")) return true;
      throw new Error(`HTTP ${res.status}: ${detalle.slice(0, 200)}`);
    }
    return true;
  });

  return resultado ?? false;
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

/**
 * Agrega un producto a una orden que ya existe.
 *
 * Es lo que permite ofrecer un adicional DESPUES de cerrar el pedido sin
 * perder la venta original: la orden se crea en cuanto la clienta
 * confirma, y si luego acepta el adicional se le suma aqui. La
 * alternativa —esperar la respuesta del adicional para crear la orden—
 * significa perderlo todo cuando la persona se queda callada, que es lo
 * que mas pasa.
 *
 * La edicion de ordenes de Shopify son tres pasos: se abre una edicion, se
 * anaden las variantes y se confirma. Solo al confirmar cambia la orden,
 * asi que si algo falla a mitad no queda a medias.
 *
 * `notifyCustomer` va en false a proposito: el aviso se lo damos nosotros
 * por WhatsApp, con nuestras palabras, no con la plantilla de Shopify.
 */
export async function agregarProductoAOrden(
  orderId: string,
  variantId: string,
  cantidad = 1,
): Promise<boolean> {
  const resultado = await safeShopifyCall("agregar producto a orden", async () => {
    const gql = async (query: string, variables: Record<string, unknown>) => {
      const res = await fetch(
        `https://${STORE_DOMAIN}/admin/api/${API_VERSION}/graphql.json`,
        {
          method: "POST",
          headers: adminHeaders(),
          body: JSON.stringify({ query, variables }),
        },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      return res.json();
    };

    const inicio = await gql(
      `mutation ordenEditar($id: ID!) {
        orderEditBegin(id: $id) {
          calculatedOrder { id }
          userErrors { field message }
        }
      }`,
      { id: `gid://shopify/Order/${orderId}` },
    );

    const errInicio = inicio.data?.orderEditBegin?.userErrors ?? [];
    if (errInicio.length) throw new Error(JSON.stringify(errInicio));

    const calculada = inicio.data?.orderEditBegin?.calculatedOrder?.id;
    if (!calculada) throw new Error("Shopify no devolvio la orden calculada");

    const anadir = await gql(
      `mutation anadir($id: ID!, $variantId: ID!, $quantity: Int!) {
        orderEditAddVariant(id: $id, variantId: $variantId, quantity: $quantity) {
          userErrors { field message }
        }
      }`,
      {
        id: calculada,
        variantId: variantId.startsWith("gid://")
          ? variantId
          : `gid://shopify/ProductVariant/${variantId}`,
        quantity: cantidad,
      },
    );

    const errAnadir = anadir.data?.orderEditAddVariant?.userErrors ?? [];
    if (errAnadir.length) throw new Error(JSON.stringify(errAnadir));

    const commit = await gql(
      `mutation confirmar($id: ID!) {
        orderEditCommit(id: $id, notifyCustomer: false, staffNote: "Adicional agregado por WhatsApp") {
          userErrors { field message }
        }
      }`,
      { id: calculada },
    );

    const errCommit = commit.data?.orderEditCommit?.userErrors ?? [];
    if (errCommit.length) throw new Error(JSON.stringify(errCommit));

    return true;
  });

  return resultado ?? false;
}

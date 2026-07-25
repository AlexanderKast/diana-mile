import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Datos reales que se le inyectan al agente antes de responder. Todo lo
 * que el agente afirma sobre precios, pedidos o links tiene que salir de
 * aqui — nunca de su memoria entrenada.
 */

export type PedidoContexto = {
  id: string;
  estado: string;
  producto: string;
  numeroGuia: string | null;
  transportadora: string | null;
  creadoAt: string;
};

/** Ultimo pedido de ese telefono (para responder "donde va mi pedido"). */
export async function pedidoReciente(
  supabase: SupabaseClient,
  telefonoE164: string,
): Promise<PedidoContexto | null> {
  const { data } = await supabase
    .from("pedidos")
    .select(
      "id, estado, producto_nombre, numero_guia, transportadora, created_at",
    )
    .eq("telefono", telefonoE164)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  return {
    id: data.id,
    estado: data.estado,
    producto: data.producto_nombre ?? "producto",
    numeroGuia: data.numero_guia ?? null,
    transportadora: data.transportadora ?? null,
    creadoAt: data.created_at,
  };
}

// ── Catalogo (Shopify Storefront, cacheado en memoria) ──────────────────

type CacheCatalogo = { texto: string; expira: number };
let cacheCatalogo: CacheCatalogo | null = null;
const TTL_CATALOGO_MS = 10 * 60 * 1000;

const QUERY_CATALOGO = `{
  products(first: 40, sortKey: BEST_SELLING) {
    edges {
      node {
        title
        handle
        availableForSale
        priceRange { minVariantPrice { amount currencyCode } }
      }
    }
  }
}`;

/**
 * Resumen del catalogo real para inyectar en el prompt. Devuelve null si
 * faltan credenciales o falla Shopify: en ese caso el agente sabe que no
 * debe afirmar precios.
 */
export async function catalogoResumen(): Promise<string | null> {
  if (cacheCatalogo && cacheCatalogo.expira > Date.now()) {
    return cacheCatalogo.texto;
  }

  const dominio = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const sitio = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  if (!dominio || !token) return null;

  try {
    const res = await fetch(`https://${dominio}/api/2026-04/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
      },
      body: JSON.stringify({ query: QUERY_CATALOGO }),
    });
    if (!res.ok) return null;

    const json = (await res.json()) as {
      data?: {
        products?: {
          edges: {
            node: {
              title: string;
              handle: string;
              availableForSale: boolean;
              priceRange: {
                minVariantPrice: { amount: string; currencyCode: string };
              };
            };
          }[];
        };
      };
    };

    const productos = json.data?.products?.edges ?? [];
    if (!productos.length) return null;

    const lineas = productos.map(({ node }) => {
      const precio = Math.round(
        parseFloat(node.priceRange.minVariantPrice.amount),
      ).toLocaleString("es-CO");
      const estado = node.availableForSale ? "" : " (AGOTADO)";
      const link = sitio ? ` — ${sitio}/productos/${node.handle}` : "";
      return `- ${node.title}: $${precio}${estado}${link}`;
    });

    const texto = lineas.join("\n");
    cacheCatalogo = { texto, expira: Date.now() + TTL_CATALOGO_MS };
    return texto;
  } catch (err) {
    console.warn("[wa-contexto] fallo al leer el catalogo:", err);
    return null;
  }
}

/** Link de la comunidad, configurable desde el admin. */
export async function linkComunidad(
  supabase: SupabaseClient,
): Promise<string | null> {
  const { data } = await supabase
    .from("config")
    .select("valor")
    .eq("clave", "comunidad_whatsapp_link")
    .maybeSingle();
  return (data?.valor as string) || null;
}

export type ContextoConversacion = {
  nombre: string | null;
  pedido: PedidoContexto | null;
  catalogo: string | null;
  comunidad: string | null;
};

/** Arma el bloque de contexto que se mete en el system prompt. */
export function formatearContexto(ctx: ContextoConversacion): string {
  const partes: string[] = ["DATOS REALES DE ESTA CONVERSACION"];

  partes.push(
    ctx.nombre
      ? `La persona se llama ${ctx.nombre}.`
      : "Todavia no sabes su nombre. Puedes preguntarselo con naturalidad.",
  );

  if (ctx.pedido) {
    const guia = ctx.pedido.numeroGuia
      ? `guia ${ctx.pedido.numeroGuia}${ctx.pedido.transportadora ? ` con ${ctx.pedido.transportadora}` : ""}`
      : "todavia sin guia asignada";
    partes.push(
      `PEDIDO DE ESTA PERSONA: ${ctx.pedido.producto}, estado "${ctx.pedido.estado}", ${guia}. Fecha: ${new Date(ctx.pedido.creadoAt).toLocaleDateString("es-CO")}. Estos son los unicos datos de pedido que puedes afirmar.`,
    );
  } else {
    partes.push(
      "Esta persona no tiene pedidos registrados. Si te pregunta por un pedido, no inventes: dile que lo verificas con el equipo.",
    );
  }

  if (ctx.catalogo) {
    partes.push(
      `CATALOGO REAL (precios en pesos colombianos, unico origen de verdad para precios):\n${ctx.catalogo}`,
    );
  } else {
    partes.push(
      "NO tienes el catalogo disponible en este momento: no afirmes ningun precio ni disponibilidad. Di que lo confirmas y sigues la conversacion.",
    );
  }

  if (ctx.comunidad) {
    partes.push(`LINK DE LA COMUNIDAD (solo si la invitas): ${ctx.comunidad}`);
  }

  return partes.join("\n\n");
}

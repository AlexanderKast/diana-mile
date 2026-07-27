import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Datos reales que se le inyectan al agente antes de responder. Todo lo
 * que el agente afirma sobre precios, pedidos o links tiene que salir de
 * aqui — nunca de su memoria entrenada.
 */

export type PedidoContexto = {
  id: string;
  /** El "#1020" que la clienta ve y menciona en el chat. */
  numeroOrden: string | null;
  estado: string;
  producto: string;
  numeroGuia: string | null;
  transportadora: string | null;
  creadoAt: string;
  /** Ciudad de entrega, para calcular cuando le llega. */
  ciudad: string | null;
  /** Rango de dias habiles de esa ciudad, ya consultado en la matriz. */
  diasEntrega: { min: number; max: number } | null;
};

/**
 * Datos de entrega que ya se le conocen a la persona, de compras previas.
 *
 * Sin esto el agente le vuelve a preguntar el nombre y la direccion a
 * alguien que ya le compro, que es lo que mas molesta de un chat de
 * atencion: "ya te di esos datos".
 */
export type DatosConocidos = {
  nombre: string;
  telefono: string;
  direccion: string;
  barrio: string | null;
  ciudad: string;
  departamento: string | null;
};

export async function datosConocidos(
  supabase: SupabaseClient,
  telefonoE164: string,
): Promise<DatosConocidos | null> {
  const { data } = await supabase
    .from("pedidos")
    .select("nombre, telefono, direccion, barrio, ciudad, departamento")
    .eq("telefono", telefonoE164)
    .not("direccion", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data?.direccion) return null;
  return {
    nombre: data.nombre,
    telefono: data.telefono,
    direccion: data.direccion,
    barrio: data.barrio,
    ciudad: data.ciudad,
    departamento: data.departamento,
  };
}

/** Ultimo pedido de ese telefono (para responder "donde va mi pedido"). */
export async function pedidoReciente(
  supabase: SupabaseClient,
  telefonoE164: string,
): Promise<PedidoContexto | null> {
  const { data } = await supabase
    .from("pedidos")
    .select(
      "id, shopify_order_number, estado, producto_nombre, numero_guia, transportadora, created_at, ciudad",
    )
    .eq("telefono", telefonoE164)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;

  // Sin esto el agente no sabia responder "¿cuando me llega?" y terminaba
  // pasandole a Diana una pregunta que se contesta sola con la matriz de
  // cobertura. Es la consulta mas comun despues de comprar.
  const cobertura = data.ciudad
    ? await coberturaDe(supabase, data.ciudad)
    : null;

  return {
    id: data.id,
    numeroOrden: data.shopify_order_number ?? null,
    estado: data.estado,
    producto: data.producto_nombre ?? "producto",
    numeroGuia: data.numero_guia ?? null,
    transportadora: data.transportadora ?? null,
    creadoAt: data.created_at,
    ciudad: data.ciudad ?? null,
    diasEntrega: cobertura
      ? { min: cobertura.diasMin, max: cobertura.diasMax }
      : null,
  };
}

// ── Catalogo (Shopify Storefront, cacheado en memoria) ──────────────────

type CacheCatalogo = { texto: string; expira: number };
let cacheCatalogo: CacheCatalogo | null = null;
const TTL_CATALOGO_MS = 10 * 60 * 1000;

// Se piden TODAS las variantes, no solo minVariantPrice: la tienda vende
// packs (1, 2, 3 unidades) a precios distintos y el minimo es la unidad
// suelta. Si el agente cita solo el minimo, le dice un precio mas bajo del
// que la clienta esta viendo en pantalla.
const QUERY_CATALOGO = `{
  products(first: 40, sortKey: BEST_SELLING) {
    edges {
      node {
        title
        handle
        availableForSale
        variants(first: 20) {
          edges {
            node {
              title
              availableForSale
              price { amount }
            }
          }
        }
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

  // El dominio se normaliza: si viene con protocolo o barra final, la URL
  // quedaria malformada y el fetch fallaria sin una causa evidente.
  const dominio = process.env.SHOPIFY_STORE_DOMAIN?.replace(
    /^https?:\/\//,
    "",
  ).replace(/\/+$/, "");
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const sitio = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  // Sin catalogo el agente no puede dar precios, asi que cada motivo de
  // fallo se registra: si no, la unica senal es que Milito responde
  // "dejame confirmarte el precio" para todo, sin explicacion.
  if (!dominio || !token) {
    console.warn(
      `[wa-contexto] sin catalogo: falta ${!dominio ? "SHOPIFY_STORE_DOMAIN" : "SHOPIFY_STOREFRONT_ACCESS_TOKEN"}`,
    );
    return null;
  }

  try {
    const res = await fetch(`https://${dominio}/api/2026-04/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
      },
      body: JSON.stringify({ query: QUERY_CATALOGO }),
    });
    if (!res.ok) {
      console.warn(
        `[wa-contexto] sin catalogo: Shopify respondio ${res.status} para ${dominio}`,
      );
      return null;
    }

    const json = (await res.json()) as {
      data?: {
        products?: {
          edges: {
            node: {
              title: string;
              handle: string;
              availableForSale: boolean;
              variants: {
                edges: {
                  node: {
                    title: string;
                    availableForSale: boolean;
                    price: { amount: string };
                  };
                }[];
              };
            };
          }[];
        };
      };
    };

    const productos = json.data?.products?.edges ?? [];
    if (!productos.length) {
      console.warn(
        `[wa-contexto] sin catalogo: Shopify no devolvio productos (${JSON.stringify(json).slice(0, 200)})`,
      );
      return null;
    }

    const lineas = productos.map(({ node }) => {
      const todas = node.variants.edges.map((v) => v.node);
      const disponibles = todas.filter((v) => v.availableForSale);
      // Las agotadas se nombran, no se ocultan: si alguien pregunta por la
      // presentacion que no hay, el agente tiene que poder decirle "esa
      // esta agotada" en vez de actuar como si no existiera.
      const agotadas = todas
        .filter((v) => !v.availableForSale && v.title !== "Default Title")
        .map((v) => v.title);

      const precios = new Set(
        disponibles.map((v) => Math.round(parseFloat(v.price.amount))),
      );

      let detalle: string;
      if (!disponibles.length) {
        detalle = "sin presentaciones disponibles";
      } else if (precios.size === 1) {
        // Todas valen lo mismo (tonos, colores, tallas): un solo precio. Se
        // repetiria seis veces la misma cifra y el agente terminaria
        // recitando una lista en vez de recomendar.
        const precio = [...precios][0].toLocaleString("es-CO");
        const nombrada = disponibles[0].title !== "Default Title";

        if (disponibles.length === 1 && nombrada) {
          // Una sola presentacion con nombre propio: se conserva, porque
          // "Pack 2 unidades $161.500" le dice a la clienta que son dos y
          // "$161.500" a secas la deja creyendo que es una.
          //
          // El "UNICA PRESENTACION" es necesario: sin eso el modelo ve
          // "Pack 2 unidades" y deduce que tambien existe la individual,
          // se la ofrece a la clienta y le inventa un precio.
          detalle = `${disponibles[0].title} $${precio} (UNICA PRESENTACION DISPONIBLE)`;
        } else {
          const opciones =
            disponibles.length > 1 && nombrada
              ? ` (${disponibles.length} opciones para elegir)`
              : "";
          detalle = `$${precio}${opciones}`;
        }
      } else {
        // Precios distintos = presentaciones reales (unidad, pack de 2...).
        // De menor a mayor: se nombra primero la mas accesible.
        detalle = disponibles
          .slice()
          .sort((a, b) => parseFloat(a.price.amount) - parseFloat(b.price.amount))
          .map((v) => {
            const precio = Math.round(
              parseFloat(v.price.amount),
            ).toLocaleString("es-CO");
            return `${v.title} $${precio}`;
          })
          .join(" · ");
      }

      const estado = node.availableForSale ? "" : " (AGOTADO)";
      const sinStock = agotadas.length
        ? ` [agotadas por ahora: ${agotadas.join(", ")}]`
        : "";
      const link = sitio ? ` — ${sitio}/productos/${node.handle}` : "";
      return `- ${node.title}: ${detalle}${sinStock}${estado}${link}`;
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

export type Cobertura = {
  ciudad: string;
  departamento: string | null;
  recaudo: boolean;
  diasMin: number;
  diasMax: number;
};

/**
 * Cobertura y tiempo de entrega de una ciudad.
 *
 * Importa por dos cosas: el tiempo real (el despacho sale de Medellin, asi
 * que el Valle de Aburra recibe mucho antes que el resto del pais) y sobre
 * todo si ahi se puede cobrar contraentrega — solo el 42% de las ciudades
 * lo admite, y prometerlo donde no hay recaudo deja un pedido incobrable.
 */
export async function coberturaDe(
  supabase: SupabaseClient,
  ciudad: string,
): Promise<Cobertura | null> {
  if (!ciudad?.trim()) return null;

  const clave = ciudad
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const { data } = await supabase
    .from("cobertura_entrega")
    .select("ciudad, departamento, recaudo, dias_min, dias_max")
    .eq("ciudad_clave", clave)
    .maybeSingle();

  if (!data) return null;
  return {
    ciudad: data.ciudad,
    departamento: data.departamento,
    recaudo: data.recaudo,
    diasMin: data.dias_min,
    diasMax: data.dias_max,
  };
}

export type ContextoConversacion = {
  nombre: string | null;
  pedido: PedidoContexto | null;
  catalogo: string | null;
  comunidad: string | null;
  conocidos?: DatosConocidos | null;
  cobertura?: Cobertura | null;
};

/** Arma el bloque de contexto que se mete en el system prompt. */
export function formatearContexto(ctx: ContextoConversacion): string {
  const partes: string[] = ["DATOS REALES DE ESTA CONVERSACION"];

  partes.push(
    ctx.nombre
      ? `La persona se llama ${ctx.nombre}.`
      : "Todavia no sabes su nombre. Puedes preguntarselo con naturalidad.",
  );

  if (ctx.cobertura) {
    const c = ctx.cobertura;
    partes.push(
      c.recaudo
        ? `ENTREGA EN ${c.ciudad.toUpperCase()}: llega en ${c.diasMin} a ${c.diasMax} dias habiles y SI se puede pagar contra entrega. Ese es el tiempo que le dices, no inventes otro.`
        : `⚠️ ENTREGA EN ${c.ciudad.toUpperCase()}: ahi NO hay pago contra entrega. NO se lo prometas. Puedes tomarle el pedido, pero le explicas que a su ciudad el pago va por adelantado y le confirmas como hacerlo. El tiempo es de ${c.diasMin} a ${c.diasMax} dias habiles.`,
    );
  }

  if (ctx.conocidos) {
    const c = ctx.conocidos;
    partes.push(
      `YA LE HAS VENDIDO ANTES. Estos son sus datos de la ultima entrega:
- Nombre: ${c.nombre}
- Celular: ${c.telefono}
- Direccion: ${c.direccion}${c.barrio ? `, ${c.barrio}` : ""}, ${c.ciudad}${c.departamento ? ` (${c.departamento})` : ""}

USALOS. Si te pide un pedido nuevo, NO le preguntes todo de cero: le confirmas si va a la misma direccion y ya. Preguntarle otra vez lo que ya te dio es lo que mas molesta en un chat de atencion. Si te dice "los mismos datos de antes", son estos y con eso alcanza para cerrar.`,
    );
  }

  if (ctx.pedido) {
    const guia = ctx.pedido.numeroGuia
      ? `guia ${ctx.pedido.numeroGuia}${ctx.pedido.transportadora ? ` con ${ctx.pedido.transportadora}` : ""}`
      : "todavia sin guia asignada";
    const entrega = ctx.pedido.diasEntrega
      ? `Le llega en ${ctx.pedido.diasEntrega.min} a ${ctx.pedido.diasEntrega.max} dias habiles contados desde esa fecha${ctx.pedido.ciudad ? ` (${ctx.pedido.ciudad})` : ""}.`
      : "No tienes el tiempo de entrega de su ciudad.";

    partes.push(
      `PEDIDO DE ESTA PERSONA${ctx.pedido.numeroOrden ? ` (orden ${ctx.pedido.numeroOrden})` : ""}: ${ctx.pedido.producto}, estado "${ctx.pedido.estado}", ${guia}. Fecha: ${new Date(ctx.pedido.creadoAt).toLocaleDateString("es-CO")}. ${entrega} Estos son los unicos datos de pedido que puedes afirmar.

SI TE PREGUNTA POR EL ESTADO O CUANDO LLEGA: contestale tu con lo de arriba. Eso NO se escala. Le dices en que va y en cuantos dias habiles lo recibe; si todavia no hay guia es normal y se lo explicas con naturalidad, no como un problema. Solo escalas si te pregunta algo que estos datos no responden.`,
    );
  } else {
    partes.push(
      "Esta persona no tiene pedidos registrados. Si te pregunta por un pedido, no inventes: dile que lo verificas con el equipo.",
    );
  }

  if (ctx.catalogo) {
    partes.push(
      `CATALOGO REAL (pesos colombianos, unico origen de verdad para precios):
${ctx.catalogo}

COMO CITAR PRECIOS (para no decirle una cifra distinta a la que ve en la web):
- Solo puedes vender las presentaciones con precio. Las que aparecen entre corchetes como "agotadas por ahora" EXISTEN pero no hay stock: no las ofrezcas ni las tomes en un pedido. Si te preguntan por una de esas, se lo dices de frente —"esa presentacion esta agotada ahorita"— y le ofreces la que si hay. Ofrecer algo agotado es prometer lo que no puedes cumplir.
- Cada producto puede tener varias presentaciones con precios distintos. NUNCA des una cifra suelta sin decir a que presentacion corresponde.
- Si el producto tiene varias presentaciones, mencionas la MAS BARATA PRIMERO y despues la otra, en la misma linea: "la unidad esta en $89.700 y el pack de 2 en $161.500". Empezar por la mas cara la espanta; mostrar solo la barata deja plata sobre la mesa.
- El envio es gratis. El "envio prioritario" es un adicional OPCIONAL de $12.000 que ella marca si quiere en el formulario: no viene incluido y no lo menciones salvo que pregunte.
- En la pagina puede aparecer un precio tachado mas alto: eso es precio de referencia, no lo que paga. Lo que paga es el precio del catalogo de arriba.
- Si te nombra un producto que NO esta en esta lista, no inventes precio ni digas que lo tienes. Escala (ver mas abajo).

DESCUENTO DEL 10% (tienes permitido ofrecerlo, pero con criterio):
- Es tu ultima carta, no la primera. Solo despues de haber construido valor y si el precio sigue siendo el freno real. Si lo sueltas de entrada, quemas margen y le ensenas a esperar rebaja.
- Cuando lo ofrezcas, mandale el link del producto con "?d=1" al final (ej: ${ctx.catalogo.includes("http") ? "el link del catalogo" : "el link del producto"} + "?d=1"). Ese link activa el descuento solo, sin que ella tenga que hacer nada mas.
- Si le mandas el link normal, NO tiene descuento. Nunca le prometas el 10% sin el "?d=1", porque llegaria a pagar precio completo.
- Dura 5 minutos desde que abre el link: diselo con naturalidad, es urgencia honesta.`,
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

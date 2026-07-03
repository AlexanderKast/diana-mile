module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/apps/shop/app/favicon.ico (static in ecmascript, tag client)", ((__turbopack_context__) => {

__turbopack_context__.v("/_next/static/media/favicon.2vob68tjqpejf.ico" + (globalThis["NEXT_CLIENT_ASSET_SUFFIX"] || ''));}),
"[project]/apps/shop/app/favicon.ico.mjs { IMAGE => \"[project]/apps/shop/app/favicon.ico (static in ecmascript, tag client)\" } [app-rsc] (structured image object, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$app$2f$favicon$2e$ico__$28$static__in__ecmascript$2c$__tag__client$29$__ = __turbopack_context__.i("[project]/apps/shop/app/favicon.ico (static in ecmascript, tag client)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$app$2f$favicon$2e$ico__$28$static__in__ecmascript$2c$__tag__client$29$__["default"],
    width: 256,
    height: 256
};
}),
"[project]/packages/shared/src/utils.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cx",
    ()=>cx,
    "formatCOP",
    ()=>formatCOP,
    "splitFullName",
    ()=>splitFullName
]);
function formatCOP(amount) {
    const value = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
    }).format(value);
}
function cx(...classes) {
    return classes.filter(Boolean).join(" ");
}
function splitFullName(nombreCompleto) {
    const partes = nombreCompleto.trim().split(/\s+/);
    const firstName = partes[0] ?? "";
    const lastName = partes.length > 1 ? partes.slice(1).join(" ") : firstName;
    return {
        firstName,
        lastName
    };
}
}),
"[project]/apps/shop/lib/shopify.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createShopifyOrder",
    ()=>createShopifyOrder,
    "deleteDraftOrder",
    ()=>deleteDraftOrder,
    "getProductByHandle",
    ()=>getProductByHandle,
    "getProducts",
    ()=>getProducts,
    "upsertAbandonedDraftOrder",
    ()=>upsertAbandonedDraftOrder
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/utils.ts [app-rsc] (ecmascript)");
;
const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;
const API_VERSION = "2024-01";
const isShopifyConfigured = Boolean(STORE_DOMAIN && STOREFRONT_TOKEN);
const MOCK_PRODUCTS = [
    {
        id: "mock-1",
        handle: "serum-luminoso-24h",
        title: "Serum Luminoso 24H",
        description: "Serum anti-edad de accion prolongada. Ilumina, firma y reduce lineas de expresion con uso constante en tu ritual nocturno.",
        price: "289000",
        currencyCode: "COP",
        images: [
            {
                url: "/images/product-epoch-hero.jpg",
                altText: "Serum Luminoso 24H"
            }
        ],
        variantId: "mock-variant-1",
        variants: [
            {
                id: "mock-variant-1",
                title: "1 unidad",
                price: "289000",
                compareAtPrice: null
            }
        ],
        metafields: {
            nuskinDirectUrl: null,
            nuskinDirectPrecio: null,
            ahorroPack2: null,
            ahorroPack3: null
        }
    },
    {
        id: "mock-2",
        handle: "crema-ritual-nocturno",
        title: "Crema Ritual Nocturno",
        description: "Textura envolvente con tecnologia regeneradora. Trabaja mientras duermes para devolver firmeza y luminosidad a tu piel.",
        price: "319000",
        currencyCode: "COP",
        images: [
            {
                url: "/images/lifestyle-ritual.jpg",
                altText: "Crema Ritual Nocturno"
            }
        ],
        variantId: "mock-variant-2",
        variants: [
            {
                id: "mock-variant-2",
                title: "1 unidad",
                price: "319000",
                compareAtPrice: null
            }
        ],
        metafields: {
            nuskinDirectUrl: null,
            nuskinDirectPrecio: null,
            ahorroPack2: null,
            ahorroPack3: null
        }
    },
    {
        id: "mock-3",
        handle: "contorno-ojos-dorado",
        title: "Contorno de Ojos Dorado",
        description: "Formula concentrada para la zona mas delicada del rostro. Reduce ojeras y lineas finas con particulas de oro coloidal.",
        price: "199000",
        currencyCode: "COP",
        images: [
            {
                url: "/images/hero-home.jpg",
                altText: "Contorno de Ojos Dorado"
            }
        ],
        variantId: "mock-variant-3",
        variants: [
            {
                id: "mock-variant-3",
                title: "1 unidad",
                price: "199000",
                compareAtPrice: null
            }
        ],
        metafields: {
            nuskinDirectUrl: null,
            nuskinDirectPrecio: null,
            ahorroPack2: null,
            ahorroPack3: null
        }
    }
];
const METAFIELD_IDENTIFIERS_GQL = `[
  {namespace: "diana_mile", key: "nuskin_direct_url"},
  {namespace: "diana_mile", key: "nuskin_direct_precio"},
  {namespace: "diana_mile", key: "ahorro_pack2"},
  {namespace: "diana_mile", key: "ahorro_pack3"}
]`;
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
          variants(first: 10) { edges { node { id title price { amount } compareAtPrice { amount } } } }
          metafields(identifiers: ${METAFIELD_IDENTIFIERS_GQL}) { key value }
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
      images(first: 6) { edges { node { url altText } } }
      variants(first: 10) { edges { node { id title price { amount } compareAtPrice { amount } } } }
      metafields(identifiers: ${METAFIELD_IDENTIFIERS_GQL}) { key value }
    }
  }
`;
async function storefrontFetch(query, variables) {
    const res = await fetch(`https://${STORE_DOMAIN}/api/${API_VERSION}/graphql.json`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN
        },
        body: JSON.stringify({
            query,
            variables
        }),
        next: {
            revalidate: 60
        }
    });
    if (!res.ok) {
        throw new Error(`Shopify Storefront API error: ${res.status}`);
    }
    const json = await res.json();
    return json.data;
}
function mapMetafields(metafields) {
    const byKey = new Map((metafields ?? []).filter(Boolean).map((m)=>[
            m.key,
            m.value
        ]));
    return {
        nuskinDirectUrl: byKey.get("nuskin_direct_url") ?? null,
        nuskinDirectPrecio: byKey.get("nuskin_direct_precio") ?? null,
        ahorroPack2: byKey.get("ahorro_pack2") ?? null,
        ahorroPack3: byKey.get("ahorro_pack3") ?? null
    };
}
function mapNode(node) {
    const variants = node.variants.edges.map((e)=>({
            id: e.node.id,
            title: e.node.title,
            price: e.node.price.amount,
            compareAtPrice: e.node.compareAtPrice?.amount ?? null
        })).sort((a, b)=>parseFloat(a.price) - parseFloat(b.price));
    return {
        id: node.id,
        handle: node.handle,
        title: node.title,
        description: node.description,
        price: node.priceRange.minVariantPrice.amount,
        currencyCode: node.priceRange.minVariantPrice.currencyCode,
        images: node.images.edges.map((e)=>e.node),
        variantId: variants[0]?.id ?? "",
        variants,
        metafields: mapMetafields(node.metafields.filter((m)=>m !== null))
    };
}
async function getProducts() {
    if (!isShopifyConfigured) return MOCK_PRODUCTS;
    const data = await storefrontFetch(PRODUCTS_QUERY, {
        first: 24
    });
    return data.products.edges.map((e)=>mapNode(e.node));
}
async function getProductByHandle(handle) {
    if (!isShopifyConfigured) {
        return MOCK_PRODUCTS.find((p)=>p.handle === handle) ?? null;
    }
    const data = await storefrontFetch(PRODUCT_BY_HANDLE_QUERY, {
        handle
    });
    return data.productByHandle ? mapNode(data.productByHandle) : null;
}
/**
 * La Storefront API (GraphQL) entrega los IDs de variante como
 * "gid://shopify/ProductVariant/123". La Admin API REST (usada aca para
 * crear la orden) necesita el numero plano, si no responde 400.
 */ function toRestVariantId(id) {
    const match = id.match(/(\d+)$/);
    return match ? match[1] : id;
}
/**
 * Shopify rechaza la orden ENTERA con 422 "phone_number has already been
 * taken" si mandas un objeto customer nuevo con un telefono que ya
 * pertenece a otro cliente (ej. alguien que pide por segunda vez). Hay que
 * buscarlo primero y reusar su id en vez de intentar crear uno duplicado.
 */ async function findExistingCustomerId(phone) {
    const res = await fetch(`https://${STORE_DOMAIN}/admin/api/${API_VERSION}/customers/search.json?query=${encodeURIComponent(`phone:${phone}`)}`, {
        headers: {
            "X-Shopify-Access-Token": ADMIN_TOKEN
        }
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.customers?.[0]?.id ? String(json.customers[0].id) : null;
}
async function createShopifyOrder(input) {
    if (!STORE_DOMAIN || !ADMIN_TOKEN) {
        return {
            orderId: `MOCK-${Date.now()}`,
            orderNumber: `#DM${Math.floor(1000 + Math.random() * 9000)}`
        };
    }
    const { firstName, lastName } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["splitFullName"])(input.nombre);
    const existingCustomerId = await findExistingCustomerId(input.telefono);
    // Shopify descarta shipping_address/customer ENTERO y sin error si
    // faltan last_name, province o country_code — asi se rompio antes.
    const address = {
        first_name: firstName,
        last_name: lastName,
        address1: input.direccion,
        address2: input.barrio || undefined,
        city: input.ciudad,
        province: input.departamento,
        country: "Colombia",
        country_code: "CO",
        phone: input.telefono
    };
    const notePartes = [
        "Pedido COD — Contraentrega"
    ];
    if (typeof input.lat === "number" && typeof input.lng === "number") {
        notePartes.push(`Ubicación GPS del cliente: https://maps.google.com/?q=${input.lat},${input.lng}`);
    }
    const res = await fetch(`https://${STORE_DOMAIN}/admin/api/${API_VERSION}/orders.json`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": ADMIN_TOKEN
        },
        body: JSON.stringify({
            order: {
                line_items: [
                    {
                        variant_id: toRestVariantId(input.variantId),
                        quantity: input.quantity
                    }
                ],
                customer: existingCustomerId ? {
                    id: existingCustomerId
                } : {
                    first_name: firstName,
                    last_name: lastName,
                    phone: input.telefono,
                    ...input.email ? {
                        email: input.email
                    } : {}
                },
                shipping_address: address,
                billing_address: address,
                financial_status: "pending",
                fulfillment_status: null,
                note: notePartes.join("\n"),
                tags: "COD, milito-life-shop",
                send_receipt: false,
                send_fulfillment_receipt: false
            }
        })
    });
    if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(`Shopify Admin API error: ${res.status} — ${errorBody}`);
    }
    const json = await res.json();
    return {
        orderId: String(json.order.id),
        orderNumber: `#${json.order.order_number}`
    };
}
async function upsertAbandonedDraftOrder(input, existingDraftOrderId) {
    if (!STORE_DOMAIN || !ADMIN_TOKEN) return null;
    try {
        const { firstName, lastName } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["splitFullName"])(input.nombre);
        const existingCustomerId = await findExistingCustomerId(input.telefono);
        const payload = {
            draft_order: {
                line_items: [
                    {
                        variant_id: toRestVariantId(input.variantId),
                        quantity: 1
                    }
                ],
                customer: existingCustomerId ? {
                    id: existingCustomerId
                } : {
                    first_name: firstName,
                    last_name: lastName,
                    phone: input.telefono
                },
                note: `Carrito abandonado — checkout no completado${input.ciudad ? ` (${input.ciudad})` : ""}`,
                tags: "carrito-abandonado",
                use_customer_default_address: false
            }
        };
        const url = existingDraftOrderId ? `https://${STORE_DOMAIN}/admin/api/${API_VERSION}/draft_orders/${existingDraftOrderId}.json` : `https://${STORE_DOMAIN}/admin/api/${API_VERSION}/draft_orders.json`;
        const res = await fetch(url, {
            method: existingDraftOrderId ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": ADMIN_TOKEN
            },
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            console.error("Error al crear/actualizar draft order de carrito abandonado:", res.status, await res.text());
            return null;
        }
        const json = await res.json();
        return {
            draftOrderId: String(json.draft_order.id)
        };
    } catch (error) {
        console.error("Error al registrar carrito abandonado en Shopify:", error);
        return null;
    }
}
async function deleteDraftOrder(draftOrderId) {
    if (!STORE_DOMAIN || !ADMIN_TOKEN) return;
    try {
        await fetch(`https://${STORE_DOMAIN}/admin/api/${API_VERSION}/draft_orders/${draftOrderId}.json`, {
            method: "DELETE",
            headers: {
                "X-Shopify-Access-Token": ADMIN_TOKEN
            }
        });
    } catch (error) {
        console.error("Error al borrar draft order de carrito abandonado:", error);
    }
}
}),
"[project]/apps/shop/lib/product-content.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getIngredientStory",
    ()=>getIngredientStory,
    "getPrimaryProductBenefits",
    ()=>getPrimaryProductBenefits,
    "getProductEyebrow",
    ()=>getProductEyebrow,
    "getProductTagline",
    ()=>getProductTagline,
    "isEpochProduct",
    ()=>isEpochProduct
]);
function isEpochProduct(product) {
    return /epoch|polishing bar/i.test(product.title);
}
function getProductEyebrow(product) {
    return isEpochProduct(product) ? "Coleccion Epoch® · Nu Skin" : "Ritual Milito Life Shop";
}
function getProductTagline(product) {
    return isEpochProduct(product) ? "Sabiduria indigena. Mineralizacion profunda. Piel transformada." : product.description || "Un ritual de cuidado elegido para tu piel.";
}
function getPrimaryProductBenefits(product) {
    if (isEpochProduct(product)) {
        return [
            {
                icon: "gota",
                title: "Limpieza profunda sin jabon",
                description: "No reseca ni altera el pH natural. Tu piel limpia sin sentirse tirante."
            },
            {
                icon: "mineral",
                title: "Mas de 50 minerales marinos",
                description: "Zinc, Cobre, Magnesio y Plata: cada uso nutre mientras limpia."
            },
            {
                icon: "hoja",
                title: "Exfoliacion suave natural",
                description: "Polvo de corteza Tsuga Heterophylla exfolia sin irritar."
            },
            {
                icon: "sol",
                title: "Piel radiante desde el primer uso",
                description: "Textura visiblemente mas suave despues de la primera aplicacion."
            },
            {
                icon: "escudo",
                title: "Probado dermatologicamente",
                description: "Seguro para piel sensible. Uso diario recomendado."
            },
            {
                icon: "planeta",
                title: "Empaque 100% reciclado",
                description: "Caja de papel reciclado. Compromiso con la tierra y contigo."
            }
        ];
    }
    return [
        {
            icon: "gota",
            title: "Ritual facil de usar",
            description: "Integra este producto a tu rutina diaria sin pasos complicados."
        },
        {
            icon: "sol",
            title: "Cuidado visible",
            description: "Pensado para acompañar una piel mas luminosa y con mejor textura."
        },
        {
            icon: "escudo",
            title: "Compra contraentrega",
            description: "Pide desde Colombia y paga cuando recibas el producto."
        }
    ];
}
function getIngredientStory(product) {
    if (!isEpochProduct(product)) return null;
    return {
        title: "El secreto que la naturaleza guardo por siglos",
        body: "La leyenda cuenta que los pueblos indigenas del Noroeste del Pacifico intentaron fabricar ceramica con la arcilla marina glacial de la Columbia Britanica y, al retirarla de sus manos, descubrieron algo inesperado: su piel quedaba extraordinariamente suave e hidratada. Ese descubrimiento ancestral es el corazon de cada Epoch® Polishing Bar."
    };
}
}),
"[project]/apps/shop/components/product/ProductGallery.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProductGallery",
    ()=>ProductGallery
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const ProductGallery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call ProductGallery() from the server but ProductGallery is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/shop/components/product/ProductGallery.tsx <module evaluation>", "ProductGallery");
}),
"[project]/apps/shop/components/product/ProductGallery.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProductGallery",
    ()=>ProductGallery
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const ProductGallery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call ProductGallery() from the server but ProductGallery is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/shop/components/product/ProductGallery.tsx", "ProductGallery");
}),
"[project]/apps/shop/components/product/ProductGallery.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$ProductGallery$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/apps/shop/components/product/ProductGallery.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$ProductGallery$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/apps/shop/components/product/ProductGallery.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$ProductGallery$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/apps/shop/components/product/ProductBenefits.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProductBenefits",
    ()=>ProductBenefits
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
;
function IconGota() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "20",
        height: "20",
        viewBox: "0 0 20 20",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.5",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
            d: "M10 2.5c2.8 3.6 5 6.7 5 9.4a5 5 0 11-10 0c0-2.7 2.2-5.8 5-9.4z",
            strokeLinecap: "round",
            strokeLinejoin: "round"
        }, void 0, false, {
            fileName: "[project]/apps/shop/components/product/ProductBenefits.tsx",
            lineNumber: 14,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/shop/components/product/ProductBenefits.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
function IconMineral() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "20",
        height: "20",
        viewBox: "0 0 20 20",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M10 2l5 4-1.6 9.5H6.6L5 6l5-4z",
                strokeLinecap: "round",
                strokeLinejoin: "round"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/ProductBenefits.tsx",
                lineNumber: 26,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M10 2v14.5M5 6h10M6.6 15.5L10 9l3.4 6.5",
                strokeLinecap: "round",
                strokeLinejoin: "round"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/ProductBenefits.tsx",
                lineNumber: 27,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/shop/components/product/ProductBenefits.tsx",
        lineNumber: 25,
        columnNumber: 5
    }, this);
}
function IconHoja() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "20",
        height: "20",
        viewBox: "0 0 20 20",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M17 3C9 3 3 9 3 17c8 0 14-6 14-14z",
                strokeLinecap: "round",
                strokeLinejoin: "round"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/ProductBenefits.tsx",
                lineNumber: 35,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M17 3C11 5 6 10 4 16",
                strokeLinecap: "round",
                strokeLinejoin: "round"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/ProductBenefits.tsx",
                lineNumber: 40,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/shop/components/product/ProductBenefits.tsx",
        lineNumber: 34,
        columnNumber: 5
    }, this);
}
function IconSol() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "20",
        height: "20",
        viewBox: "0 0 20 20",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "10",
                cy: "10",
                r: "3.5"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/ProductBenefits.tsx",
                lineNumber: 48,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M10 1.5v2M10 16.5v2M18.5 10h-2M3.5 10h-2M15.9 4.1l-1.4 1.4M5.5 14.5l-1.4 1.4M15.9 15.9l-1.4-1.4M5.5 5.5L4.1 4.1",
                strokeLinecap: "round"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/ProductBenefits.tsx",
                lineNumber: 49,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/shop/components/product/ProductBenefits.tsx",
        lineNumber: 47,
        columnNumber: 5
    }, this);
}
function IconEscudo() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "20",
        height: "20",
        viewBox: "0 0 20 20",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M10 2l6.5 2.5v5c0 4.5-2.9 7.4-6.5 8.5-3.6-1.1-6.5-4-6.5-8.5v-5L10 2z",
                strokeLinecap: "round",
                strokeLinejoin: "round"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/ProductBenefits.tsx",
                lineNumber: 60,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M7 10l2 2 4-4.2",
                strokeLinecap: "round",
                strokeLinejoin: "round"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/ProductBenefits.tsx",
                lineNumber: 65,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/shop/components/product/ProductBenefits.tsx",
        lineNumber: 59,
        columnNumber: 5
    }, this);
}
function IconPlaneta() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "20",
        height: "20",
        viewBox: "0 0 20 20",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "10",
                cy: "10",
                r: "6"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/ProductBenefits.tsx",
                lineNumber: 73,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("ellipse", {
                cx: "10",
                cy: "10",
                rx: "9",
                ry: "2.8"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/ProductBenefits.tsx",
                lineNumber: 74,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/shop/components/product/ProductBenefits.tsx",
        lineNumber: 72,
        columnNumber: 5
    }, this);
}
const ICONS = {
    gota: IconGota,
    mineral: IconMineral,
    hoja: IconHoja,
    sol: IconSol,
    escudo: IconEscudo,
    planeta: IconPlaneta
};
function ProductBenefits({ benefits }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid grid-cols-2 md:grid-cols-3 gap-5",
        children: benefits.map((benefit, index)=>{
            const Icon = ICONS[benefit.icon];
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-dorado",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {}, void 0, false, {
                            fileName: "[project]/apps/shop/components/product/ProductBenefits.tsx",
                            lineNumber: 96,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/shop/components/product/ProductBenefits.tsx",
                        lineNumber: 95,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm font-semibold text-carbon",
                        children: benefit.title
                    }, void 0, false, {
                        fileName: "[project]/apps/shop/components/product/ProductBenefits.tsx",
                        lineNumber: 98,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-carbon-suave",
                        children: benefit.description
                    }, void 0, false, {
                        fileName: "[project]/apps/shop/components/product/ProductBenefits.tsx",
                        lineNumber: 99,
                        columnNumber: 13
                    }, this)
                ]
            }, index, true, {
                fileName: "[project]/apps/shop/components/product/ProductBenefits.tsx",
                lineNumber: 94,
                columnNumber: 11
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/apps/shop/components/product/ProductBenefits.tsx",
        lineNumber: 90,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/shop/components/product/ProductPurchaseFlow.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProductPurchaseFlow",
    ()=>ProductPurchaseFlow
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const ProductPurchaseFlow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call ProductPurchaseFlow() from the server but ProductPurchaseFlow is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/shop/components/product/ProductPurchaseFlow.tsx <module evaluation>", "ProductPurchaseFlow");
}),
"[project]/apps/shop/components/product/ProductPurchaseFlow.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProductPurchaseFlow",
    ()=>ProductPurchaseFlow
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const ProductPurchaseFlow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call ProductPurchaseFlow() from the server but ProductPurchaseFlow is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/shop/components/product/ProductPurchaseFlow.tsx", "ProductPurchaseFlow");
}),
"[project]/apps/shop/components/product/ProductPurchaseFlow.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$ProductPurchaseFlow$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/apps/shop/components/product/ProductPurchaseFlow.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$ProductPurchaseFlow$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/apps/shop/components/product/ProductPurchaseFlow.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$ProductPurchaseFlow$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/apps/shop/components/product/ProductHeroCTA.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProductHeroCTA",
    ()=>ProductHeroCTA
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const ProductHeroCTA = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call ProductHeroCTA() from the server but ProductHeroCTA is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/shop/components/product/ProductHeroCTA.tsx <module evaluation>", "ProductHeroCTA");
}),
"[project]/apps/shop/components/product/ProductHeroCTA.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProductHeroCTA",
    ()=>ProductHeroCTA
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const ProductHeroCTA = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call ProductHeroCTA() from the server but ProductHeroCTA is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/shop/components/product/ProductHeroCTA.tsx", "ProductHeroCTA");
}),
"[project]/apps/shop/components/product/ProductHeroCTA.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$ProductHeroCTA$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/apps/shop/components/product/ProductHeroCTA.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$ProductHeroCTA$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/apps/shop/components/product/ProductHeroCTA.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$ProductHeroCTA$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/apps/shop/components/product/OrderSheetContext.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OrderSheetProvider",
    ()=>OrderSheetProvider,
    "useOrderSheet",
    ()=>useOrderSheet
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const OrderSheetProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call OrderSheetProvider() from the server but OrderSheetProvider is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/shop/components/product/OrderSheetContext.tsx <module evaluation>", "OrderSheetProvider");
const useOrderSheet = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call useOrderSheet() from the server but useOrderSheet is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/shop/components/product/OrderSheetContext.tsx <module evaluation>", "useOrderSheet");
}),
"[project]/apps/shop/components/product/OrderSheetContext.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OrderSheetProvider",
    ()=>OrderSheetProvider,
    "useOrderSheet",
    ()=>useOrderSheet
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const OrderSheetProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call OrderSheetProvider() from the server but OrderSheetProvider is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/shop/components/product/OrderSheetContext.tsx", "OrderSheetProvider");
const useOrderSheet = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call useOrderSheet() from the server but useOrderSheet is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/shop/components/product/OrderSheetContext.tsx", "useOrderSheet");
}),
"[project]/apps/shop/components/product/OrderSheetContext.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$OrderSheetContext$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/apps/shop/components/product/OrderSheetContext.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$OrderSheetContext$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/apps/shop/components/product/OrderSheetContext.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$OrderSheetContext$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/apps/shop/components/form/OrderBottomSheet.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OrderBottomSheet",
    ()=>OrderBottomSheet
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const OrderBottomSheet = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call OrderBottomSheet() from the server but OrderBottomSheet is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/shop/components/form/OrderBottomSheet.tsx <module evaluation>", "OrderBottomSheet");
}),
"[project]/apps/shop/components/form/OrderBottomSheet.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OrderBottomSheet",
    ()=>OrderBottomSheet
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const OrderBottomSheet = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call OrderBottomSheet() from the server but OrderBottomSheet is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/shop/components/form/OrderBottomSheet.tsx", "OrderBottomSheet");
}),
"[project]/apps/shop/components/form/OrderBottomSheet.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$form$2f$OrderBottomSheet$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/apps/shop/components/form/OrderBottomSheet.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$form$2f$OrderBottomSheet$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/apps/shop/components/form/OrderBottomSheet.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$form$2f$OrderBottomSheet$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/apps/shop/components/product/IngredientsAccordion.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "IngredientsAccordion",
    ()=>IngredientsAccordion
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const IngredientsAccordion = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call IngredientsAccordion() from the server but IngredientsAccordion is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/shop/components/product/IngredientsAccordion.tsx <module evaluation>", "IngredientsAccordion");
}),
"[project]/apps/shop/components/product/IngredientsAccordion.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "IngredientsAccordion",
    ()=>IngredientsAccordion
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const IngredientsAccordion = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call IngredientsAccordion() from the server but IngredientsAccordion is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/shop/components/product/IngredientsAccordion.tsx", "IngredientsAccordion");
}),
"[project]/apps/shop/components/product/IngredientsAccordion.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$IngredientsAccordion$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/apps/shop/components/product/IngredientsAccordion.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$IngredientsAccordion$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/apps/shop/components/product/IngredientsAccordion.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$IngredientsAccordion$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/apps/shop/components/product/LiveActivityBar.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LiveActivityBar",
    ()=>LiveActivityBar
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const LiveActivityBar = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call LiveActivityBar() from the server but LiveActivityBar is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/shop/components/product/LiveActivityBar.tsx <module evaluation>", "LiveActivityBar");
}),
"[project]/apps/shop/components/product/LiveActivityBar.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LiveActivityBar",
    ()=>LiveActivityBar
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const LiveActivityBar = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call LiveActivityBar() from the server but LiveActivityBar is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/shop/components/product/LiveActivityBar.tsx", "LiveActivityBar");
}),
"[project]/apps/shop/components/product/LiveActivityBar.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$LiveActivityBar$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/apps/shop/components/product/LiveActivityBar.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$LiveActivityBar$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/apps/shop/components/product/LiveActivityBar.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$LiveActivityBar$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/apps/shop/components/product/RatingBar.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RatingBar",
    ()=>RatingBar
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const RatingBar = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call RatingBar() from the server but RatingBar is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/shop/components/product/RatingBar.tsx <module evaluation>", "RatingBar");
}),
"[project]/apps/shop/components/product/RatingBar.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RatingBar",
    ()=>RatingBar
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const RatingBar = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call RatingBar() from the server but RatingBar is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/shop/components/product/RatingBar.tsx", "RatingBar");
}),
"[project]/apps/shop/components/product/RatingBar.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$RatingBar$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/apps/shop/components/product/RatingBar.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$RatingBar$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/apps/shop/components/product/RatingBar.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$RatingBar$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/apps/shop/components/product/TrustBadges.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TrustBadges
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
;
function IconEntrega() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "14",
        height: "14",
        viewBox: "0 0 20 20",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M2 5.5h9v8.5H2v-8.5zM11 8.5h4l3 3v2.5h-7v-5.5z",
                strokeLinecap: "round",
                strokeLinejoin: "round"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/TrustBadges.tsx",
                lineNumber: 4,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "6",
                cy: "15.5",
                r: "1.7"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/TrustBadges.tsx",
                lineNumber: 9,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "14.5",
                cy: "15.5",
                r: "1.7"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/TrustBadges.tsx",
                lineNumber: 10,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/shop/components/product/TrustBadges.tsx",
        lineNumber: 3,
        columnNumber: 5
    }, this);
}
function IconPago() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "14",
        height: "14",
        viewBox: "0 0 20 20",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                x: "2",
                y: "5",
                width: "16",
                height: "10.5",
                rx: "1.5",
                strokeLinejoin: "round"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/TrustBadges.tsx",
                lineNumber: 18,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "10",
                cy: "10.25",
                r: "2.5"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/TrustBadges.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M9 10.25l0.7 0.7 1.3-1.4",
                strokeLinecap: "round",
                strokeLinejoin: "round"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/TrustBadges.tsx",
                lineNumber: 20,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/shop/components/product/TrustBadges.tsx",
        lineNumber: 17,
        columnNumber: 5
    }, this);
}
function IconCaja() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "14",
        height: "14",
        viewBox: "0 0 20 20",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M10 2.5l7.5 3.75V13.75L10 17.5l-7.5-3.75V6.25L10 2.5z",
                strokeLinecap: "round",
                strokeLinejoin: "round"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/TrustBadges.tsx",
                lineNumber: 28,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M2.5 6.25L10 10l7.5-3.75M10 10v7.5",
                strokeLinecap: "round",
                strokeLinejoin: "round"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/TrustBadges.tsx",
                lineNumber: 33,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/shop/components/product/TrustBadges.tsx",
        lineNumber: 27,
        columnNumber: 5
    }, this);
}
function IconCandado() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "14",
        height: "14",
        viewBox: "0 0 20 20",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                x: "4",
                y: "9",
                width: "12",
                height: "8.5",
                rx: "1.5",
                strokeLinejoin: "round"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/TrustBadges.tsx",
                lineNumber: 41,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M6.5 9V6a3.5 3.5 0 017 0v3",
                strokeLinecap: "round",
                strokeLinejoin: "round"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/TrustBadges.tsx",
                lineNumber: 42,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "10",
                cy: "13",
                r: "1.2"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/TrustBadges.tsx",
                lineNumber: 43,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/shop/components/product/TrustBadges.tsx",
        lineNumber: 40,
        columnNumber: 5
    }, this);
}
const badges = [
    {
        icon: IconEntrega,
        label: "Contraentrega Colombia"
    },
    {
        icon: IconPago,
        label: "Pago al recibir"
    },
    {
        icon: IconCaja,
        label: "Envío en 24-72h"
    },
    {
        icon: IconCandado,
        label: "Compra segura"
    }
];
function TrustBadges() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex gap-2 overflow-x-auto md:flex-wrap",
        style: {
            scrollbarWidth: "none"
        },
        children: badges.map(({ icon: Icon, label })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-arena px-3 py-1.5 text-[11px] font-sans text-carbon-suave",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-ceniza",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {}, void 0, false, {
                            fileName: "[project]/apps/shop/components/product/TrustBadges.tsx",
                            lineNumber: 72,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/shop/components/product/TrustBadges.tsx",
                        lineNumber: 71,
                        columnNumber: 11
                    }, this),
                    label
                ]
            }, label, true, {
                fileName: "[project]/apps/shop/components/product/TrustBadges.tsx",
                lineNumber: 67,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/apps/shop/components/product/TrustBadges.tsx",
        lineNumber: 62,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/shop/components/product/UGCSection.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UGCSection",
    ()=>UGCSection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
;
const POSTS = [
    {
        emoji: "💆‍♀️",
        title: "Para la cara + el cuerpo",
        text: "Muchas clientas lo usan en rostro (piel grasa/mixta) y en cuerpo el mismo día. Un solo producto, doble uso.",
        bg: "bg-lila-suave"
    },
    {
        emoji: "🌙",
        title: "Como ritual de noche",
        text: "5 minutos antes de tu sérum. La exfoliación suave prepara la piel para absorber mejor los activos nocturnos.",
        bg: "bg-crema"
    },
    {
        emoji: "☀️",
        title: "Rutina de mañana",
        text: "Al despertar, activa la circulación y deja la piel lista para el maquillaje. Poros visiblemente más finos.",
        bg: "bg-lila-suave"
    },
    {
        emoji: "🎁",
        title: "El regalo perfecto",
        text: "El empaque de papel reciclado con diseño botánico es un regalo que se ve lujoso sin envolver.",
        bg: "bg-crema"
    }
];
function UGCSection() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "font-display text-2xl text-carbon text-center",
                children: "Así lo están usando"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/UGCSection.tsx",
                lineNumber: 38,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "font-sans text-[13px] text-ceniza text-center mt-1",
                children: "Mujeres reales · Resultados reales"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/UGCSection.tsx",
                lineNumber: 41,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-2 md:grid-cols-4 gap-4 mt-6",
                children: POSTS.map((post)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `p-5 rounded-[4px] ${post.bg}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-3xl",
                                children: post.emoji
                            }, void 0, false, {
                                fileName: "[project]/apps/shop/components/product/UGCSection.tsx",
                                lineNumber: 47,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "font-sans text-[13px] font-semibold text-carbon mt-2",
                                children: post.title
                            }, void 0, false, {
                                fileName: "[project]/apps/shop/components/product/UGCSection.tsx",
                                lineNumber: 48,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "font-sans text-xs text-carbon-suave leading-relaxed mt-1",
                                children: post.text
                            }, void 0, false, {
                                fileName: "[project]/apps/shop/components/product/UGCSection.tsx",
                                lineNumber: 51,
                                columnNumber: 13
                            }, this)
                        ]
                    }, post.title, true, {
                        fileName: "[project]/apps/shop/components/product/UGCSection.tsx",
                        lineNumber: 46,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/UGCSection.tsx",
                lineNumber: 44,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/shop/components/product/UGCSection.tsx",
        lineNumber: 37,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/shop/components/product/TestimonialsSection.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TestimonialsSection",
    ()=>TestimonialsSection
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const TestimonialsSection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call TestimonialsSection() from the server but TestimonialsSection is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/shop/components/product/TestimonialsSection.tsx <module evaluation>", "TestimonialsSection");
}),
"[project]/apps/shop/components/product/TestimonialsSection.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TestimonialsSection",
    ()=>TestimonialsSection
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const TestimonialsSection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call TestimonialsSection() from the server but TestimonialsSection is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/shop/components/product/TestimonialsSection.tsx", "TestimonialsSection");
}),
"[project]/apps/shop/components/product/TestimonialsSection.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$TestimonialsSection$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/apps/shop/components/product/TestimonialsSection.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$TestimonialsSection$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/apps/shop/components/product/TestimonialsSection.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$TestimonialsSection$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/apps/shop/components/product/GuaranteeSection.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GuaranteeSection",
    ()=>GuaranteeSection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
;
function HomeIcon({ className }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "24",
        height: "24",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        className: className,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M4 11.5 12 4l8 7.5"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/GuaranteeSection.tsx",
                lineNumber: 4,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M6 10v9h12v-9"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/GuaranteeSection.tsx",
                lineNumber: 5,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/shop/components/product/GuaranteeSection.tsx",
        lineNumber: 3,
        columnNumber: 5
    }, this);
}
function PackageIcon({ className }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "24",
        height: "24",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        className: className,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M3.5 8 12 4l8.5 4-8.5 4-8.5-4Z"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/GuaranteeSection.tsx",
                lineNumber: 13,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M3.5 8v8L12 20l8.5-4V8"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/GuaranteeSection.tsx",
                lineNumber: 14,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M12 12v8"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/GuaranteeSection.tsx",
                lineNumber: 15,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/shop/components/product/GuaranteeSection.tsx",
        lineNumber: 12,
        columnNumber: 5
    }, this);
}
function ChatIcon({ className }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "24",
        height: "24",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        className: className,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
            d: "M4 5.5h16v11H9l-4 3.5v-3.5H4v-11Z"
        }, void 0, false, {
            fileName: "[project]/apps/shop/components/product/GuaranteeSection.tsx",
            lineNumber: 23,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/shop/components/product/GuaranteeSection.tsx",
        lineNumber: 22,
        columnNumber: 5
    }, this);
}
const ITEMS = [
    {
        Icon: HomeIcon,
        label: "Pagas al recibir"
    },
    {
        Icon: PackageIcon,
        label: "Envío 24-72h"
    },
    {
        Icon: ChatIcon,
        label: "Soporte por WhatsApp"
    }
];
function GuaranteeSection() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "bg-crema py-12 px-6 text-center",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "font-display text-2xl text-carbon",
                children: "Tu pedido está protegido"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/GuaranteeSection.tsx",
                lineNumber: 37,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-8 grid grid-cols-3 gap-4",
                children: ITEMS.map(({ Icon, label })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                className: "text-morado"
                            }, void 0, false, {
                                fileName: "[project]/apps/shop/components/product/GuaranteeSection.tsx",
                                lineNumber: 42,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs text-ceniza",
                                children: label
                            }, void 0, false, {
                                fileName: "[project]/apps/shop/components/product/GuaranteeSection.tsx",
                                lineNumber: 43,
                                columnNumber: 13
                            }, this)
                        ]
                    }, label, true, {
                        fileName: "[project]/apps/shop/components/product/GuaranteeSection.tsx",
                        lineNumber: 41,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/GuaranteeSection.tsx",
                lineNumber: 39,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-8 max-w-md mx-auto text-sm text-carbon-suave leading-relaxed",
                children: "Si el producto llega en mal estado, lo reponemos sin costo adicional. Tu satisfacción es nuestra garantía."
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/GuaranteeSection.tsx",
                lineNumber: 48,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/shop/components/product/GuaranteeSection.tsx",
        lineNumber: 36,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/shop/components/product/FAQAccordion.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FAQAccordion",
    ()=>FAQAccordion
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const FAQAccordion = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call FAQAccordion() from the server but FAQAccordion is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/shop/components/product/FAQAccordion.tsx <module evaluation>", "FAQAccordion");
}),
"[project]/apps/shop/components/product/FAQAccordion.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FAQAccordion",
    ()=>FAQAccordion
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const FAQAccordion = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call FAQAccordion() from the server but FAQAccordion is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/shop/components/product/FAQAccordion.tsx", "FAQAccordion");
}),
"[project]/apps/shop/components/product/FAQAccordion.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$FAQAccordion$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/apps/shop/components/product/FAQAccordion.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$FAQAccordion$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/apps/shop/components/product/FAQAccordion.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$FAQAccordion$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/apps/shop/components/product/NuskinSection.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NuskinSection",
    ()=>NuskinSection
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const NuskinSection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call NuskinSection() from the server but NuskinSection is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/shop/components/product/NuskinSection.tsx <module evaluation>", "NuskinSection");
}),
"[project]/apps/shop/components/product/NuskinSection.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NuskinSection",
    ()=>NuskinSection
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const NuskinSection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call NuskinSection() from the server but NuskinSection is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/shop/components/product/NuskinSection.tsx", "NuskinSection");
}),
"[project]/apps/shop/components/product/NuskinSection.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$NuskinSection$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/apps/shop/components/product/NuskinSection.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$NuskinSection$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/apps/shop/components/product/NuskinSection.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$NuskinSection$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/apps/shop/components/ui/SocialCTABand.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SocialCTABand",
    ()=>SocialCTABand
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const SocialCTABand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call SocialCTABand() from the server but SocialCTABand is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/shop/components/ui/SocialCTABand.tsx <module evaluation>", "SocialCTABand");
}),
"[project]/apps/shop/components/ui/SocialCTABand.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SocialCTABand",
    ()=>SocialCTABand
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const SocialCTABand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call SocialCTABand() from the server but SocialCTABand is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/shop/components/ui/SocialCTABand.tsx", "SocialCTABand");
}),
"[project]/apps/shop/components/ui/SocialCTABand.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$ui$2f$SocialCTABand$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/apps/shop/components/ui/SocialCTABand.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$ui$2f$SocialCTABand$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/apps/shop/components/ui/SocialCTABand.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$ui$2f$SocialCTABand$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/apps/shop/app/productos/[slug]/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ProductoPage,
    "generateMetadata",
    ()=>generateMetadata
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$lib$2f$shopify$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/shop/lib/shopify.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$lib$2f$product$2d$content$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/shop/lib/product-content.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$ProductGallery$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/shop/components/product/ProductGallery.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$ProductBenefits$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/shop/components/product/ProductBenefits.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$ProductPurchaseFlow$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/shop/components/product/ProductPurchaseFlow.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$ProductHeroCTA$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/shop/components/product/ProductHeroCTA.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$OrderSheetContext$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/shop/components/product/OrderSheetContext.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$form$2f$OrderBottomSheet$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/shop/components/form/OrderBottomSheet.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$IngredientsAccordion$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/shop/components/product/IngredientsAccordion.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$LiveActivityBar$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/shop/components/product/LiveActivityBar.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$RatingBar$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/shop/components/product/RatingBar.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$TrustBadges$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/shop/components/product/TrustBadges.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$UGCSection$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/shop/components/product/UGCSection.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$TestimonialsSection$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/shop/components/product/TestimonialsSection.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$GuaranteeSection$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/shop/components/product/GuaranteeSection.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$FAQAccordion$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/shop/components/product/FAQAccordion.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$NuskinSection$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/shop/components/product/NuskinSection.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$ui$2f$SocialCTABand$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/shop/components/ui/SocialCTABand.tsx [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
const PASOS_RITUAL = [
    {
        numero: "1",
        titulo: "Humedece",
        descripcion: "Aplica agua tibia sobre la piel"
    },
    {
        numero: "2",
        titulo: "Masajea",
        descripcion: "Movimientos circulares suaves por 60 segundos"
    },
    {
        numero: "3",
        titulo: "Enjuaga",
        descripcion: "Agua tibia. Siente la diferencia inmediata."
    }
];
async function generateMetadata({ params }) {
    const { slug } = await params;
    const product = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$lib$2f$shopify$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getProductByHandle"])(slug);
    if (!product) {
        return {
            title: "Producto no encontrado - Milito Life Shop"
        };
    }
    const image = product.images[0];
    return {
        title: `${product.title} - Milito Life Shop`,
        description: product.description,
        openGraph: {
            title: `${product.title} - Milito Life Shop`,
            description: product.description,
            images: image ? [
                {
                    url: image.url,
                    alt: image.altText ?? product.title
                }
            ] : []
        },
        twitter: {
            card: "summary_large_image",
            title: `${product.title} - Milito Life Shop`,
            description: product.description,
            images: image ? [
                image.url
            ] : []
        }
    };
}
async function ProductoPage({ params }) {
    const { slug } = await params;
    const product = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$lib$2f$shopify$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getProductByHandle"])(slug);
    if (!product) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notFound"])();
    }
    const benefits = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$lib$2f$product$2d$content$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getPrimaryProductBenefits"])(product);
    const ingredientStory = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$lib$2f$product$2d$content$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getIngredientStory"])(product);
    const isEpoch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$lib$2f$product$2d$content$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isEpochProduct"])(product);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$OrderSheetContext$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["OrderSheetProvider"], {
        product: product,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            className: "flex flex-col pb-28",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "px-6 pt-3 md:px-10",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$LiveActivityBar$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["LiveActivityBar"], {}, void 0, false, {
                        fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                        lineNumber: 82,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                    lineNumber: 81,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-1 md:grid-cols-2 md:gap-8 px-6 pt-3 md:px-10 min-w-0",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "md:sticky md:top-24 md:self-start min-w-0",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$ProductGallery$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ProductGallery"], {
                                images: product.images
                            }, void 0, false, {
                                fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                                lineNumber: 87,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                            lineNumber: 86,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-4 pt-4 md:pt-0 min-w-0",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$RatingBar$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["RatingBar"], {}, void 0, false, {
                                            fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                                            lineNumber: 92,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$TrustBadges$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                            fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                                            lineNumber: 93,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                                    lineNumber: 91,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[11px] text-ceniza uppercase tracking-wide",
                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$lib$2f$product$2d$content$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getProductEyebrow"])(product)
                                        }, void 0, false, {
                                            fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                                            lineNumber: 97,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                            className: "font-display text-[26px] md:text-[32px] text-carbon leading-tight",
                                            children: product.title
                                        }, void 0, false, {
                                            fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                                            lineNumber: 100,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "linea-dorada w-12"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                                            lineNumber: 103,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-carbon-suave",
                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$lib$2f$product$2d$content$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getProductTagline"])(product)
                                        }, void 0, false, {
                                            fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                                            lineNumber: 104,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                                    lineNumber: 96,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$ProductHeroCTA$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ProductHeroCTA"], {}, void 0, false, {
                                    fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                                    lineNumber: 109,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$form$2f$OrderBottomSheet$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["OrderBottomSheet"], {}, void 0, false, {
                                    fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                                    lineNumber: 111,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                            lineNumber: 90,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                    lineNumber: 85,
                    columnNumber: 9
                }, this),
                ingredientStory && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    className: "bg-lila-suave py-12 px-6 flex flex-col items-center gap-6 text-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "font-display text-[28px] text-carbon max-w-md",
                            children: ingredientStory.title
                        }, void 0, false, {
                            fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                            lineNumber: 117,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-carbon-suave leading-relaxed max-w-md",
                            children: ingredientStory.body
                        }, void 0, false, {
                            fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                            lineNumber: 120,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative w-full aspect-[4/5] rounded-[2px] overflow-hidden max-w-md",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                src: "/images/lifestyle-ritual.jpg",
                                alt: `Ritual ${product.title}`,
                                fill: true,
                                className: "object-cover",
                                sizes: "(min-width: 768px) 448px, 100vw"
                            }, void 0, false, {
                                fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                                lineNumber: 124,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                            lineNumber: 123,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                    lineNumber: 116,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$ui$2f$SocialCTABand$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SocialCTABand"], {
                    tone: "outline-morado",
                    buttonLabel: `Probar ${product.title}`
                }, void 0, false, {
                    fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                    lineNumber: 135,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    className: "py-12 px-6 flex flex-col gap-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "font-display text-2xl text-carbon text-center",
                            children: "Lo que hace por tu piel"
                        }, void 0, false, {
                            fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                            lineNumber: 138,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$ProductBenefits$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ProductBenefits"], {
                            benefits: benefits
                        }, void 0, false, {
                            fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                            lineNumber: 141,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                    lineNumber: 137,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$ui$2f$SocialCTABand$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SocialCTABand"], {
                    tone: "lila-band",
                    title: "Lista para transformar tu ritual de cuidado?",
                    buttonLabel: "Pedirlo ahora - Contraentrega"
                }, void 0, false, {
                    fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                    lineNumber: 144,
                    columnNumber: 9
                }, this),
                isEpoch && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$UGCSection$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["UGCSection"], {}, void 0, false, {
                    fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                    lineNumber: 150,
                    columnNumber: 21
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    className: "bg-blanco text-carbon py-12 px-6 flex flex-col gap-8",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "font-display text-2xl text-center",
                            children: "Tu ritual en 3 pasos"
                        }, void 0, false, {
                            fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                            lineNumber: 153,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-4 overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible",
                            style: {
                                scrollbarWidth: "none"
                            },
                            children: PASOS_RITUAL.map((paso)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "shrink-0 w-[80%] md:w-auto snap-center flex flex-col gap-3 rounded-[4px] border border-arena bg-blanco p-5 shadow-[0_1px_3px_rgba(26,23,20,0.08)]",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "flex h-10 w-10 items-center justify-center rounded-full bg-dorado-oscuro font-display text-lg text-blanco",
                                            children: paso.numero
                                        }, void 0, false, {
                                            fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                                            lineNumber: 163,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "font-display text-xl text-carbon",
                                            children: paso.titulo
                                        }, void 0, false, {
                                            fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                                            lineNumber: 166,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-carbon-suave",
                                            children: paso.descripcion
                                        }, void 0, false, {
                                            fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                                            lineNumber: 167,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, paso.numero, true, {
                                    fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                                    lineNumber: 159,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                            lineNumber: 154,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                    lineNumber: 152,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$TestimonialsSection$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["TestimonialsSection"], {
                    productName: product.title,
                    showUsageStats: isEpoch
                }, void 0, false, {
                    fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                    lineNumber: 173,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$GuaranteeSection$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["GuaranteeSection"], {}, void 0, false, {
                    fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                    lineNumber: 175,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    className: "px-6 py-12",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$FAQAccordion$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["FAQAccordion"], {}, void 0, false, {
                        fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                        lineNumber: 178,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                    lineNumber: 177,
                    columnNumber: 9
                }, this),
                isEpoch && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    className: "px-6 pb-4",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$IngredientsAccordion$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["IngredientsAccordion"], {}, void 0, false, {
                        fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                        lineNumber: 183,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                    lineNumber: 182,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$NuskinSection$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["NuskinSection"], {}, void 0, false, {
                    fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                    lineNumber: 187,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    className: "seccion-joya text-carbon py-12 px-6 text-center flex flex-col items-center gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "font-display text-[28px]",
                            children: "Tu piel te lo va a agradecer"
                        }, void 0, false, {
                            fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                            lineNumber: 190,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-carbon-suave",
                            children: "Envio contraentrega - Pagas al recibir"
                        }, void 0, false, {
                            fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                            lineNumber: 191,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$ui$2f$SocialCTABand$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SocialCTABand"], {
                            tone: "gold-solid",
                            buttonLabel: "Empezar mi ritual"
                        }, void 0, false, {
                            fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                            lineNumber: 192,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                    lineNumber: 189,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$ProductPurchaseFlow$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ProductPurchaseFlow"], {}, void 0, false, {
                    fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
                    lineNumber: 195,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
            lineNumber: 80,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/shop/app/productos/[slug]/page.tsx",
        lineNumber: 79,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/shop/app/productos/[slug]/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/apps/shop/app/productos/[slug]/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__20zf3l2._.js.map
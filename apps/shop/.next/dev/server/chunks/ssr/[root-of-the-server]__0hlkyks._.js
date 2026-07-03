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
"[project]/packages/shared/src/ui/Button.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/utils.ts [app-rsc] (ecmascript)");
;
;
;
const Button = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["forwardRef"])(({ variant = "primary", className, children, disabled, ...props }, ref)=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        ref: ref,
        disabled: disabled,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cx"])("inline-flex items-center justify-center gap-2 rounded-[2px] px-6 py-3.5 min-h-[44px] text-base font-semibold tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100", variant === "primary" && "btn-shine bg-dorado-oscuro text-blanco shadow-[0_4px_14px_rgba(168,136,94,0.35)] hover:bg-dorado hover:scale-[1.03] hover:shadow-[0_8px_24px_rgba(168,136,94,0.5)] active:scale-[0.97]", variant === "secondary" && "border-2 border-carbon text-carbon bg-transparent hover:bg-crema hover:scale-[1.02] active:scale-[0.98]", className),
        ...props,
        children: children
    }, void 0, false, {
        fileName: "[project]/packages/shared/src/ui/Button.tsx",
        lineNumber: 11,
        columnNumber: 7
    }, ("TURBOPACK compile-time value", void 0));
});
Button.displayName = "Button";
}),
"[project]/apps/shop/components/ui/WhatsAppFloat.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WhatsAppFloat",
    ()=>WhatsAppFloat
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const WhatsAppFloat = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call WhatsAppFloat() from the server but WhatsAppFloat is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/shop/components/ui/WhatsAppFloat.tsx <module evaluation>", "WhatsAppFloat");
}),
"[project]/apps/shop/components/ui/WhatsAppFloat.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WhatsAppFloat",
    ()=>WhatsAppFloat
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const WhatsAppFloat = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call WhatsAppFloat() from the server but WhatsAppFloat is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/shop/components/ui/WhatsAppFloat.tsx", "WhatsAppFloat");
}),
"[project]/apps/shop/components/ui/WhatsAppFloat.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$ui$2f$WhatsAppFloat$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/apps/shop/components/ui/WhatsAppFloat.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$ui$2f$WhatsAppFloat$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/apps/shop/components/ui/WhatsAppFloat.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$ui$2f$WhatsAppFloat$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/apps/shop/components/product/ProductCard.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProductCard",
    ()=>ProductCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/utils.ts [app-rsc] (ecmascript)");
;
;
;
;
function ProductCard({ product }) {
    const image = product.images[0];
    const minPrice = product.variants.length > 0 ? product.variants.reduce((min, variant)=>Math.min(min, parseFloat(variant.price)), parseFloat(product.variants[0].price)) : parseFloat(product.price);
    const badgeLabel = product.title.includes("Epoch") ? "Epoch®" : null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
        href: `/productos/${product.handle}`,
        className: "group flex flex-col gap-3 border border-arena rounded-[4px] p-3 bg-blanco shadow-[0_1px_3px_rgba(26,23,20,0.08)]",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative aspect-square w-full overflow-hidden rounded-[2px] bg-arena",
                children: [
                    image ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                        src: image.url,
                        alt: image.altText ?? product.title,
                        fill: true,
                        className: "object-cover transition-transform duration-[400ms] group-hover:scale-[1.02]",
                        sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    }, void 0, false, {
                        fileName: "[project]/apps/shop/components/product/ProductCard.tsx",
                        lineNumber: 26,
                        columnNumber: 11
                    }, this) : null,
                    badgeLabel ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "absolute top-2 left-2 bg-blanco/90 text-[10px] px-2 py-1 rounded-[2px] text-carbon",
                        children: badgeLabel
                    }, void 0, false, {
                        fileName: "[project]/apps/shop/components/product/ProductCard.tsx",
                        lineNumber: 36,
                        columnNumber: 11
                    }, this) : null
                ]
            }, void 0, true, {
                fileName: "[project]/apps/shop/components/product/ProductCard.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: "font-display text-lg text-carbon",
                children: product.title
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/ProductCard.tsx",
                lineNumber: 42,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "font-display text-xl font-semibold text-dorado-oscuro",
                children: [
                    "Desde ",
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["formatCOP"])(minPrice)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/shop/components/product/ProductCard.tsx",
                lineNumber: 43,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cx"])("inline-flex items-center justify-center gap-2 rounded-[2px] px-6 py-3.5 min-h-[44px]", "text-sm font-medium tracking-wide border border-carbon text-carbon transition-colors duration-200", "group-hover:bg-crema"),
                children: "Ver producto"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/ProductCard.tsx",
                lineNumber: 45,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/shop/components/product/ProductCard.tsx",
        lineNumber: 20,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/shop/app/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>HomePage,
    "metadata",
    ()=>metadata
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$lib$2f$shopify$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/shop/lib/shopify.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$ui$2f$Button$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/ui/Button.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$ui$2f$WhatsAppFloat$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/shop/components/ui/WhatsAppFloat.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$ProductCard$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/shop/components/product/ProductCard.tsx [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
const metadata = {
    title: "Milito Life Shop — Bienestar y Anti-edad",
    description: "Rituales de piel con sabiduria indigena y minerales del oceano. Descubre los productos Milito Life Shop para una piel mas luminosa y firme."
};
const PILARES = [
    {
        titulo: "Minerales del oceano",
        descripcion: "Activos marinos de alta concentracion que nutren y revitalizan la piel en cada aplicacion.",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            width: "20",
            height: "20",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "1.5",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    d: "M2 16c1.5 1.5 3 1.5 4.5 0s3-1.5 4.5 0 3 1.5 4.5 0 3-1.5 4.5 0"
                }, void 0, false, {
                    fileName: "[project]/apps/shop/app/page.tsx",
                    lineNumber: 31,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    d: "M2 20c1.5 1.5 3 1.5 4.5 0s3-1.5 4.5 0 3 1.5 4.5 0 3-1.5 4.5 0"
                }, void 0, false, {
                    fileName: "[project]/apps/shop/app/page.tsx",
                    lineNumber: 32,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    d: "M12 4c-2 2-2 4 0 6s2 4 0 6"
                }, void 0, false, {
                    fileName: "[project]/apps/shop/app/page.tsx",
                    lineNumber: 33,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/apps/shop/app/page.tsx",
            lineNumber: 21,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    },
    {
        titulo: "Sabiduria indigena",
        descripcion: "Rituales ancestrales de bienestar transformados en formulas modernas para tu piel.",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            width: "20",
            height: "20",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "1.5",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    d: "M12 2v20"
                }, void 0, false, {
                    fileName: "[project]/apps/shop/app/page.tsx",
                    lineNumber: 52,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    d: "M5 8l7-6 7 6"
                }, void 0, false, {
                    fileName: "[project]/apps/shop/app/page.tsx",
                    lineNumber: 53,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    d: "M5 8v13h14V8"
                }, void 0, false, {
                    fileName: "[project]/apps/shop/app/page.tsx",
                    lineNumber: 54,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/apps/shop/app/page.tsx",
            lineNumber: 42,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    },
    {
        titulo: "Resultados anti-edad",
        descripcion: "Piel mas firme, luminosa y uniforme con uso constante desde las primeras semanas.",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            width: "20",
            height: "20",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "1.5",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                    cx: "12",
                    cy: "12",
                    r: "9"
                }, void 0, false, {
                    fileName: "[project]/apps/shop/app/page.tsx",
                    lineNumber: 73,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    d: "M12 7v5l3 3"
                }, void 0, false, {
                    fileName: "[project]/apps/shop/app/page.tsx",
                    lineNumber: 74,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/apps/shop/app/page.tsx",
            lineNumber: 63,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }
];
const STATS = [
    {
        numero: "COD",
        texto: "Pago contraentrega en Colombia"
    },
    {
        numero: "WA",
        texto: "Acompanamiento por WhatsApp"
    },
    {
        numero: "24-72h",
        texto: "Despacho estimado en ciudades principales"
    }
];
async function HomePage() {
    const products = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$lib$2f$shopify$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getProducts"])();
    const destacados = products.slice(0, 3);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "bg-crema",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mx-auto max-w-6xl px-6 py-16 md:py-24 grid gap-10 md:grid-cols-2 md:gap-8 md:items-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative aspect-[4/5] w-full rounded-[4px] overflow-hidden order-1 md:order-2 animate-fade-in-up",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                src: "/images/hero-home.jpg",
                                alt: "Ritual Milito Life Shop con hojas tropicales",
                                fill: true,
                                priority: true,
                                className: "object-cover",
                                sizes: "(max-width: 768px) 100vw, 50vw"
                            }, void 0, false, {
                                fileName: "[project]/apps/shop/app/page.tsx",
                                lineNumber: 96,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/apps/shop/app/page.tsx",
                            lineNumber: 95,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "order-2 md:order-1 animate-fade-in-up",
                            style: {
                                animationDelay: "100ms"
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "font-display text-4xl md:text-6xl leading-tight text-carbon",
                                    children: "Tu version mas luminosa"
                                }, void 0, false, {
                                    fileName: "[project]/apps/shop/app/page.tsx",
                                    lineNumber: 106,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-4 text-[15px] text-carbon-suave max-w-md",
                                    children: "Rituales de piel con sabiduria indigena y minerales del oceano"
                                }, void 0, false, {
                                    fileName: "[project]/apps/shop/app/page.tsx",
                                    lineNumber: 109,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-8",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/productos",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$ui$2f$Button$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Button"], {
                                            variant: "primary",
                                            children: "Descubrir rituales →"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/shop/app/page.tsx",
                                            lineNumber: 114,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/shop/app/page.tsx",
                                        lineNumber: 113,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/apps/shop/app/page.tsx",
                                    lineNumber: 112,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/shop/app/page.tsx",
                            lineNumber: 105,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/shop/app/page.tsx",
                    lineNumber: 94,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/shop/app/page.tsx",
                lineNumber: 93,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "bg-blanco",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mx-auto max-w-6xl px-6 py-16 md:py-20",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "font-display text-3xl md:text-4xl text-carbon mb-8",
                            children: "Por que Milito Life Shop"
                        }, void 0, false, {
                            fileName: "[project]/apps/shop/app/page.tsx",
                            lineNumber: 124,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible",
                            children: PILARES.map((pilar, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "min-w-[80%] snap-center shrink-0 md:min-w-0 md:shrink bg-blanco border border-arena rounded-[4px] p-6 animate-fade-in-up",
                                    style: {
                                        animationDelay: `${i * 100}ms`
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-dorado mb-3",
                                            children: pilar.icon
                                        }, void 0, false, {
                                            fileName: "[project]/apps/shop/app/page.tsx",
                                            lineNumber: 134,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "font-display text-xl text-carbon mb-2",
                                            children: pilar.titulo
                                        }, void 0, false, {
                                            fileName: "[project]/apps/shop/app/page.tsx",
                                            lineNumber: 135,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[15px] text-carbon-suave",
                                            children: pilar.descripcion
                                        }, void 0, false, {
                                            fileName: "[project]/apps/shop/app/page.tsx",
                                            lineNumber: 138,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, pilar.titulo, true, {
                                    fileName: "[project]/apps/shop/app/page.tsx",
                                    lineNumber: 129,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/apps/shop/app/page.tsx",
                            lineNumber: 127,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/shop/app/page.tsx",
                    lineNumber: 123,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/shop/app/page.tsx",
                lineNumber: 122,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "bg-crema",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mx-auto max-w-6xl px-6 py-16 md:py-20",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "font-display text-2xl text-carbon mb-8",
                            children: "Rituales esenciales"
                        }, void 0, false, {
                            fileName: "[project]/apps/shop/app/page.tsx",
                            lineNumber: 150,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible",
                            children: destacados.map((product, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "min-w-[80%] snap-center shrink-0 md:min-w-0 md:shrink animate-fade-in-up",
                                    style: {
                                        animationDelay: `${i * 100}ms`
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$ProductCard$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ProductCard"], {
                                        product: product
                                    }, void 0, false, {
                                        fileName: "[project]/apps/shop/app/page.tsx",
                                        lineNumber: 160,
                                        columnNumber: 17
                                    }, this)
                                }, product.id, false, {
                                    fileName: "[project]/apps/shop/app/page.tsx",
                                    lineNumber: 155,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/apps/shop/app/page.tsx",
                            lineNumber: 153,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/shop/app/page.tsx",
                    lineNumber: 149,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/shop/app/page.tsx",
                lineNumber: 148,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "bg-blanco",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mx-auto max-w-6xl px-6 py-16 md:py-20 grid grid-cols-3 gap-4 text-center",
                    children: STATS.map((stat)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "font-display text-3xl md:text-4xl text-dorado-oscuro",
                                    children: stat.numero
                                }, void 0, false, {
                                    fileName: "[project]/apps/shop/app/page.tsx",
                                    lineNumber: 172,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-2 text-xs text-ceniza",
                                    children: stat.texto
                                }, void 0, false, {
                                    fileName: "[project]/apps/shop/app/page.tsx",
                                    lineNumber: 175,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, stat.numero, true, {
                            fileName: "[project]/apps/shop/app/page.tsx",
                            lineNumber: 171,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/apps/shop/app/page.tsx",
                    lineNumber: 169,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/shop/app/page.tsx",
                lineNumber: 168,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "seccion-joya text-carbon py-12 px-6 text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "font-display text-2xl",
                        children: "Empieza tu ritual hoy"
                    }, void 0, false, {
                        fileName: "[project]/apps/shop/app/page.tsx",
                        lineNumber: 183,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-6",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                            href: "/productos",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$ui$2f$Button$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Button"], {
                                variant: "primary",
                                children: "Ver productos"
                            }, void 0, false, {
                                fileName: "[project]/apps/shop/app/page.tsx",
                                lineNumber: 186,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/apps/shop/app/page.tsx",
                            lineNumber: 185,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/shop/app/page.tsx",
                        lineNumber: 184,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/shop/app/page.tsx",
                lineNumber: 182,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$ui$2f$WhatsAppFloat$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["WhatsAppFloat"], {}, void 0, false, {
                fileName: "[project]/apps/shop/app/page.tsx",
                lineNumber: 191,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
}),
"[project]/apps/shop/app/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/apps/shop/app/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0hlkyks._.js.map
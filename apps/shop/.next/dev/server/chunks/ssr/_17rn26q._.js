module.exports = [
"[project]/packages/shared/src/utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/apps/shop/components/product/ProductGallery.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProductGallery",
    ()=>ProductGallery
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/utils.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
const FALLBACK_IMAGE = {
    url: "/images/product-epoch-hero.jpg",
    altText: "Epoch Polishing Bar"
};
function ProductGallery({ images }) {
    const gallery = images.length > 0 ? images : [
        FALLBACK_IMAGE
    ];
    const [activeIndex, setActiveIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const activeImage = gallery[activeIndex];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative mx-auto aspect-square w-[62%] max-w-[280px] rounded-[4px] overflow-hidden bg-crema md:mx-0 md:aspect-[4/5] md:w-full md:max-w-none",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    src: activeImage.url,
                    alt: activeImage.altText ?? "Imagen del producto",
                    fill: true,
                    className: "object-cover transition-opacity duration-200 ease-out",
                    sizes: "(min-width: 768px) 50vw, 62vw",
                    priority: activeIndex === 0
                }, activeIndex, false, {
                    fileName: "[project]/apps/shop/components/product/ProductGallery.tsx",
                    lineNumber: 22,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/ProductGallery.tsx",
                lineNumber: 21,
                columnNumber: 7
            }, this),
            gallery.length > 1 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-center gap-2 overflow-x-auto md:justify-start",
                style: {
                    scrollbarWidth: "none"
                },
                children: gallery.map((image, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>setActiveIndex(index),
                        "aria-label": `Ver imagen ${index + 1}`,
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cx"])("relative shrink-0 w-16 h-16 rounded-[2px] overflow-hidden border transition-colors duration-200", index === activeIndex ? "border-dorado" : "border-arena"),
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            src: image.url,
                            alt: image.altText ?? `Miniatura ${index + 1}`,
                            fill: true,
                            className: "object-cover",
                            sizes: "64px"
                        }, void 0, false, {
                            fileName: "[project]/apps/shop/components/product/ProductGallery.tsx",
                            lineNumber: 46,
                            columnNumber: 15
                        }, this)
                    }, index, false, {
                        fileName: "[project]/apps/shop/components/product/ProductGallery.tsx",
                        lineNumber: 36,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/ProductGallery.tsx",
                lineNumber: 34,
                columnNumber: 9
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/apps/shop/components/product/ProductGallery.tsx",
        lineNumber: 20,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/shop/components/product/OrderSheetContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OrderSheetProvider",
    ()=>OrderSheetProvider,
    "useOrderSheet",
    ()=>useOrderSheet
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
const OrderSheetContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(null);
function OrderSheetProvider({ product, children }) {
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedVariantId, setSelectedVariantId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(product.variants[0]?.id ?? "");
    const [selectedIsNuskin, setSelectedIsNuskin] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const selectedVariant = product.variants.find((v)=>v.id === selectedVariantId) ?? product.variants[0];
    const selectVariant = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((variantId)=>{
        setSelectedVariantId(variantId);
        setSelectedIsNuskin(false);
    }, []);
    const selectNuskin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setSelectedIsNuskin(true);
    }, []);
    const openOrderSheet = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((variantId)=>{
        if (variantId) selectVariant(variantId);
        setIsOpen(true);
        if (("TURBOPACK compile-time value", "undefined") !== "undefined" && window.innerWidth >= 768) //TURBOPACK unreachable
        ;
    }, [
        selectVariant
    ]);
    const closeOrderSheet = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setIsOpen(false);
    }, []);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            product,
            isOpen,
            selectedVariantId,
            selectedIsNuskin,
            selectedVariant,
            openOrderSheet,
            closeOrderSheet,
            selectVariant,
            selectNuskin
        }), [
        product,
        isOpen,
        selectedVariantId,
        selectedIsNuskin,
        selectedVariant,
        openOrderSheet,
        closeOrderSheet,
        selectVariant,
        selectNuskin
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(OrderSheetContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/apps/shop/components/product/OrderSheetContext.tsx",
        lineNumber: 83,
        columnNumber: 10
    }, this);
}
function useOrderSheet() {
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(OrderSheetContext);
    if (!ctx) {
        throw new Error("useOrderSheet debe usarse dentro de OrderSheetProvider");
    }
    return ctx;
}
}),
"[project]/apps/shop/components/product/ProductPurchaseFlow.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProductPurchaseFlow",
    ()=>ProductPurchaseFlow
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$OrderSheetContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/shop/components/product/OrderSheetContext.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
function ProductPurchaseFlow() {
    const { product, selectedVariant, selectedIsNuskin, openOrderSheet } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$OrderSheetContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useOrderSheet"])();
    function openNuskin() {
        if (product.metafields.nuskinDirectUrl) {
            window.open(product.metafields.nuskinDirectUrl, "_blank", "noopener,noreferrer");
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "cta-pulse fixed bottom-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-center bg-dorado text-carbon shadow-[0_-6px_24px_rgba(168,136,94,0.45)] md:hidden",
                style: {
                    paddingBottom: "env(safe-area-inset-bottom)"
                },
                children: selectedIsNuskin ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    onClick: openNuskin,
                    className: "flex h-full w-full items-center justify-center text-lg font-bold tracking-wide",
                    children: "Comprar en Nu Skin ↗"
                }, void 0, false, {
                    fileName: "[project]/apps/shop/components/product/ProductPurchaseFlow.tsx",
                    lineNumber: 28,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    onClick: ()=>openOrderSheet(),
                    className: "btn-shine flex h-full w-full items-center justify-center gap-1.5 text-lg font-bold tracking-wide",
                    children: [
                        "Pedir ahora ·",
                        " ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "font-display text-xl",
                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatCOP"])(selectedVariant?.price ?? product.price)
                        }, void 0, false, {
                            fileName: "[project]/apps/shop/components/product/ProductPurchaseFlow.tsx",
                            lineNumber: 42,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/shop/components/product/ProductPurchaseFlow.tsx",
                    lineNumber: 36,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/ProductPurchaseFlow.tsx",
                lineNumber: 23,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-16 md:hidden"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/ProductPurchaseFlow.tsx",
                lineNumber: 46,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
}),
"[project]/apps/shop/components/product/ProductHeroCTA.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProductHeroCTA",
    ()=>ProductHeroCTA
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$OrderSheetContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/shop/components/product/OrderSheetContext.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
function LockIcon({ className }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "14",
        height: "14",
        viewBox: "0 0 20 20",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.5",
        className: className,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                x: "4.5",
                y: "9",
                width: "11",
                height: "8",
                rx: "1.5"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/ProductHeroCTA.tsx",
                lineNumber: 9,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M6.5 9V6a3.5 3.5 0 0 1 7 0v3",
                strokeLinecap: "round"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/ProductHeroCTA.tsx",
                lineNumber: 10,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/shop/components/product/ProductHeroCTA.tsx",
        lineNumber: 8,
        columnNumber: 5
    }, this);
}
function ClockIcon({ className }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "14",
        height: "14",
        viewBox: "0 0 20 20",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.5",
        className: className,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "10",
                cy: "10",
                r: "7.5"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/ProductHeroCTA.tsx",
                lineNumber: 18,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M10 5.5V10l3 2",
                strokeLinecap: "round",
                strokeLinejoin: "round"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/ProductHeroCTA.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/shop/components/product/ProductHeroCTA.tsx",
        lineNumber: 17,
        columnNumber: 5
    }, this);
}
function ProductHeroCTA() {
    const { product, selectedVariant, openOrderSheet } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$OrderSheetContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useOrderSheet"])();
    const variant = selectedVariant ?? product.variants[0];
    const discountPct = variant?.compareAtPrice && parseFloat(variant.compareAtPrice) > 0 ? Math.round((1 - parseFloat(variant.price) / parseFloat(variant.compareAtPrice)) * 100) : null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-3",
        children: [
            variant && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3 flex-wrap",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "font-display text-4xl font-semibold text-dorado-oscuro",
                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatCOP"])(variant.price)
                    }, void 0, false, {
                        fileName: "[project]/apps/shop/components/product/ProductHeroCTA.tsx",
                        lineNumber: 42,
                        columnNumber: 11
                    }, this),
                    variant.compareAtPrice && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-base text-ceniza line-through",
                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatCOP"])(variant.compareAtPrice)
                    }, void 0, false, {
                        fileName: "[project]/apps/shop/components/product/ProductHeroCTA.tsx",
                        lineNumber: 46,
                        columnNumber: 13
                    }, this),
                    discountPct !== null && discountPct > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "rounded-[3px] bg-morado px-2.5 py-1 text-xs font-bold text-blanco",
                        children: [
                            "-",
                            discountPct,
                            "% OFF"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/shop/components/product/ProductHeroCTA.tsx",
                        lineNumber: 49,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/shop/components/product/ProductHeroCTA.tsx",
                lineNumber: 41,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: ()=>openOrderSheet(),
                className: "btn-shine min-h-[44px] w-full rounded-[2px] bg-dorado-oscuro text-blanco text-base font-semibold tracking-wide shadow-[0_4px_14px_rgba(168,136,94,0.35)] transition-all duration-200 hover:bg-dorado hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(168,136,94,0.5)] active:scale-[0.97]",
                children: "Pedir ahora · Contraentrega"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/ProductHeroCTA.tsx",
                lineNumber: 56,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-center gap-1.5 text-xs text-ceniza",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(LockIcon, {
                        className: "text-ceniza"
                    }, void 0, false, {
                        fileName: "[project]/apps/shop/components/product/ProductHeroCTA.tsx",
                        lineNumber: 65,
                        columnNumber: 9
                    }, this),
                    "Pago al recibir · Envío 24-72h"
                ]
            }, void 0, true, {
                fileName: "[project]/apps/shop/components/product/ProductHeroCTA.tsx",
                lineNumber: 64,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-center gap-1.5 text-xs text-morado-oscuro",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ClockIcon, {
                        className: "text-morado-oscuro"
                    }, void 0, false, {
                        fileName: "[project]/apps/shop/components/product/ProductHeroCTA.tsx",
                        lineNumber: 70,
                        columnNumber: 9
                    }, this),
                    "Stock limitado — los pedidos de esta semana se despachan primero"
                ]
            }, void 0, true, {
                fileName: "[project]/apps/shop/components/product/ProductHeroCTA.tsx",
                lineNumber: 69,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/shop/components/product/ProductHeroCTA.tsx",
        lineNumber: 39,
        columnNumber: 5
    }, this);
}
}),
"[project]/packages/shared/src/ui/Button.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/utils.ts [app-ssr] (ecmascript)");
;
;
;
const Button = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ variant = "primary", className, children, disabled, ...props }, ref)=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        ref: ref,
        disabled: disabled,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cx"])("inline-flex items-center justify-center gap-2 rounded-[2px] px-6 py-3.5 min-h-[44px] text-base font-semibold tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100", variant === "primary" && "btn-shine bg-dorado-oscuro text-blanco shadow-[0_4px_14px_rgba(168,136,94,0.35)] hover:bg-dorado hover:scale-[1.03] hover:shadow-[0_8px_24px_rgba(168,136,94,0.5)] active:scale-[0.97]", variant === "secondary" && "border-2 border-carbon text-carbon bg-transparent hover:bg-crema hover:scale-[1.02] active:scale-[0.98]", className),
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
"[project]/packages/shared/src/ui/Input.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Input",
    ()=>Input,
    "Textarea",
    ()=>Textarea
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/utils.ts [app-ssr] (ecmascript)");
;
;
;
const Input = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ label, error, id, className, ...props }, ref)=>{
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-1.5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                htmlFor: inputId,
                className: "text-xs text-ceniza font-medium",
                children: label
            }, void 0, false, {
                fileName: "[project]/packages/shared/src/ui/Input.tsx",
                lineNumber: 11,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                ref: ref,
                id: inputId,
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cx"])("min-h-[44px] rounded-[2px] border border-arena bg-blanco px-4 py-2.5 text-base text-carbon placeholder:text-ceniza focus:outline-none focus:border-dorado transition-colors", error && "border-error", className),
                ...props
            }, void 0, false, {
                fileName: "[project]/packages/shared/src/ui/Input.tsx",
                lineNumber: 14,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-xs text-error",
                children: error
            }, void 0, false, {
                fileName: "[project]/packages/shared/src/ui/Input.tsx",
                lineNumber: 24,
                columnNumber: 19
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/packages/shared/src/ui/Input.tsx",
        lineNumber: 10,
        columnNumber: 7
    }, ("TURBOPACK compile-time value", void 0));
});
Input.displayName = "Input";
const Textarea = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ label, error, id, className, ...props }, ref)=>{
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-1.5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                htmlFor: inputId,
                className: "text-xs text-ceniza font-medium",
                children: label
            }, void 0, false, {
                fileName: "[project]/packages/shared/src/ui/Input.tsx",
                lineNumber: 38,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                ref: ref,
                id: inputId,
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cx"])("rounded-[2px] border border-arena bg-blanco px-4 py-2.5 text-base text-carbon placeholder:text-ceniza focus:outline-none focus:border-dorado transition-colors resize-none", error && "border-error", className),
                ...props
            }, void 0, false, {
                fileName: "[project]/packages/shared/src/ui/Input.tsx",
                lineNumber: 41,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-xs text-error",
                children: error
            }, void 0, false, {
                fileName: "[project]/packages/shared/src/ui/Input.tsx",
                lineNumber: 51,
                columnNumber: 19
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/packages/shared/src/ui/Input.tsx",
        lineNumber: 37,
        columnNumber: 7
    }, ("TURBOPACK compile-time value", void 0));
});
Textarea.displayName = "Textarea";
}),
"[project]/packages/shared/src/ui/Spinner.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Spinner",
    ()=>Spinner
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/utils.ts [app-ssr] (ecmascript)");
;
;
function Spinner({ className }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cx"])("inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent", className),
        role: "status",
        "aria-label": "Cargando"
    }, void 0, false, {
        fileName: "[project]/packages/shared/src/ui/Spinner.tsx",
        lineNumber: 5,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/shop/lib/phone.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "normalizeColombianMobile",
    ()=>normalizeColombianMobile
]);
function normalizeColombianMobile(input) {
    let digits = input.replace(/\D/g, "");
    if (digits.startsWith("0057")) {
        digits = digits.slice(4);
    } else if (digits.startsWith("57") && digits.length === 12) {
        digits = digits.slice(2);
    }
    if (!/^3\d{9}$/.test(digits)) {
        return null;
    }
    return {
        digits,
        e164: `+57${digits}`,
        display: `+57 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
    };
}
}),
"[project]/apps/shop/lib/colombia.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Nombres de departamento tal como Shopify los reconoce para resolver
 * shipping_address.province/province_code. Un valor libre que Shopify no
 * matchea contra su lista interna hace que descarte la direccion ENTERA
 * silenciosamente (sin error), asi que este campo va como select, no texto libre.
 */ __turbopack_context__.s([
    "BARRIOS_POR_CIUDAD",
    ()=>BARRIOS_POR_CIUDAD,
    "CIUDADES_POR_DEPARTAMENTO",
    ()=>CIUDADES_POR_DEPARTAMENTO,
    "DEPARTAMENTOS_COLOMBIA",
    ()=>DEPARTAMENTOS_COLOMBIA,
    "getBarriosSugeridos",
    ()=>getBarriosSugeridos
]);
const DEPARTAMENTOS_COLOMBIA = [
    "Amazonas",
    "Antioquia",
    "Arauca",
    "Atlántico",
    "Bogotá D.C.",
    "Bolívar",
    "Boyacá",
    "Caldas",
    "Caquetá",
    "Casanare",
    "Cauca",
    "Cesar",
    "Chocó",
    "Córdoba",
    "Cundinamarca",
    "Guainía",
    "Guaviare",
    "Huila",
    "La Guajira",
    "Magdalena",
    "Meta",
    "Nariño",
    "Norte de Santander",
    "Putumayo",
    "Quindío",
    "Risaralda",
    "San Andrés y Providencia",
    "Santander",
    "Sucre",
    "Tolima",
    "Valle del Cauca",
    "Vaupés",
    "Vichada"
];
const CIUDADES_POR_DEPARTAMENTO = {
    Amazonas: [
        "Leticia",
        "Puerto Nariño"
    ],
    Antioquia: [
        "Medellín",
        "Bello",
        "Itagüí",
        "Envigado",
        "Apartadó",
        "Turbo",
        "Rionegro",
        "Sabaneta",
        "La Estrella",
        "Caldas",
        "Copacabana",
        "Girardota",
        "Marinilla",
        "Caucasia",
        "Necoclí",
        "Chigorodó"
    ],
    Arauca: [
        "Arauca",
        "Arauquita",
        "Saravena",
        "Tame"
    ],
    Atlántico: [
        "Barranquilla",
        "Soledad",
        "Malambo",
        "Sabanalarga",
        "Puerto Colombia",
        "Galapa"
    ],
    "Bogotá D.C.": [
        "Bogotá"
    ],
    Bolívar: [
        "Cartagena",
        "Magangué",
        "Turbaco",
        "Arjona",
        "El Carmen de Bolívar"
    ],
    Boyacá: [
        "Tunja",
        "Duitama",
        "Sogamoso",
        "Chiquinquirá",
        "Paipa"
    ],
    Caldas: [
        "Manizales",
        "La Dorada",
        "Chinchiná",
        "Villamaría"
    ],
    Caquetá: [
        "Florencia",
        "San Vicente del Caguán"
    ],
    Casanare: [
        "Yopal",
        "Aguazul",
        "Villanueva"
    ],
    Cauca: [
        "Popayán",
        "Santander de Quilichao",
        "Puerto Tejada"
    ],
    Cesar: [
        "Valledupar",
        "Aguachica",
        "Codazzi"
    ],
    Chocó: [
        "Quibdó",
        "Istmina"
    ],
    Córdoba: [
        "Montería",
        "Lorica",
        "Cereté",
        "Sahagún"
    ],
    Cundinamarca: [
        "Soacha",
        "Facatativá",
        "Zipaquirá",
        "Chía",
        "Girardot",
        "Fusagasugá",
        "Mosquera",
        "Madrid",
        "Funza",
        "Cajicá"
    ],
    Guainía: [
        "Inírida"
    ],
    Guaviare: [
        "San José del Guaviare"
    ],
    Huila: [
        "Neiva",
        "Pitalito",
        "Garzón"
    ],
    "La Guajira": [
        "Riohacha",
        "Maicao",
        "Uribia"
    ],
    Magdalena: [
        "Santa Marta",
        "Ciénaga",
        "Fundación"
    ],
    Meta: [
        "Villavicencio",
        "Acacías",
        "Granada"
    ],
    Nariño: [
        "Pasto",
        "Tumaco",
        "Ipiales"
    ],
    "Norte de Santander": [
        "Cúcuta",
        "Ocaña",
        "Villa del Rosario",
        "Los Patios"
    ],
    Putumayo: [
        "Mocoa",
        "Puerto Asís"
    ],
    Quindío: [
        "Armenia",
        "Calarcá",
        "La Tebaida"
    ],
    Risaralda: [
        "Pereira",
        "Dosquebradas",
        "Santa Rosa de Cabal"
    ],
    "San Andrés y Providencia": [
        "San Andrés",
        "Providencia"
    ],
    Santander: [
        "Bucaramanga",
        "Floridablanca",
        "Girón",
        "Piedecuesta",
        "Barrancabermeja"
    ],
    Sucre: [
        "Sincelejo",
        "Corozal"
    ],
    Tolima: [
        "Ibagué",
        "Espinal",
        "Melgar"
    ],
    "Valle del Cauca": [
        "Cali",
        "Palmira",
        "Buenaventura",
        "Tuluá",
        "Cartago",
        "Buga",
        "Yumbo"
    ],
    Vaupés: [
        "Mitú"
    ],
    Vichada: [
        "Puerto Carreño"
    ]
};
const BARRIOS_POR_CIUDAD = {
    bogota: [
        "Chapinero",
        "Usaquén",
        "Suba",
        "Kennedy",
        "Engativá",
        "Teusaquillo",
        "Fontibón",
        "Santa Fe",
        "La Candelaria",
        "San Cristóbal",
        "Bosa",
        "Ciudad Bolívar",
        "Rafael Uribe Uribe",
        "Puente Aranda",
        "Barrios Unidos",
        "Tunjuelito",
        "Antonio Nariño",
        "Los Mártires",
        "Usme",
        "Chicó",
        "Cedritos",
        "Salitre",
        "Modelia",
        "Restrepo",
        "Niza",
        "Rosales",
        "La Macarena",
        "Galerías"
    ],
    medellin: [
        "El Poblado",
        "Laureles",
        "Belén",
        "Robledo",
        "Manrique",
        "Buenos Aires",
        "Castilla",
        "Aranjuez",
        "Guayabal",
        "Santa Cruz",
        "Doce de Octubre",
        "La Candelaria",
        "Floresta",
        "San Javier",
        "La América",
        "Simón Bolívar",
        "Prado"
    ],
    cali: [
        "San Fernando",
        "Granada",
        "El Peñón",
        "Ciudad Jardín",
        "Tequendama",
        "Champagnat",
        "Miraflores",
        "San Antonio",
        "El Ingenio",
        "Pance",
        "Menga",
        "Chipichape",
        "Versalles",
        "Santa Mónica"
    ],
    barranquilla: [
        "El Prado",
        "Alto Prado",
        "Riomar",
        "Boston",
        "Ciudad Jardín",
        "Villa Country",
        "El Golf",
        "La Concepción",
        "Miramar",
        "Bellavista",
        "Los Nogales",
        "Modelo",
        "San Vicente"
    ]
};
function normalizarCiudad(valor) {
    return valor.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}
function getBarriosSugeridos(ciudad) {
    return BARRIOS_POR_CIUDAD[normalizarCiudad(ciudad)] ?? [];
}
}),
"[project]/apps/shop/components/form/CODForm.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CODForm",
    ()=>CODForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$ui$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/ui/Input.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/ui/Button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$ui$2f$Spinner$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/ui/Spinner.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$lib$2f$phone$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/shop/lib/phone.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$lib$2f$colombia$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/shop/lib/colombia.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
function CODForm({ product, selectedVariant }) {
    const [nombre, setNombre] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [telefono, setTelefono] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [email, setEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [departamento, setDepartamento] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [ciudad, setCiudad] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [barrio, setBarrio] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [direccion, setDireccion] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [notas, setNotas] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [success, setSuccess] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [ubicacion, setUbicacion] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [ubicacionEstado, setUbicacionEstado] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("idle");
    const ciudadesSugeridas = departamento ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$lib$2f$colombia$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CIUDADES_POR_DEPARTAMENTO"][departamento] ?? [] : [];
    const barriosSugeridos = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$lib$2f$colombia$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getBarriosSugeridos"])(ciudad);
    // Carrito abandonado: en cuanto nombre + telefono son validos, se
    // registra para remarketing (con debounce, no en cada tecla). Si el
    // pedido se termina completando, /api/orders lo marca como convertido.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (success) return;
        const telefonoValido = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$lib$2f$phone$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeColombianMobile"])(telefono);
        if (!nombre.trim() || !telefonoValido) return;
        const timeout = setTimeout(()=>{
            fetch("/api/leads/carrito", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nombre,
                    telefono: telefonoValido.e164,
                    ciudad: ciudad || null,
                    producto_interes: `${product.title} — ${selectedVariant.title}`,
                    variantId: selectedVariant.id
                })
            }).catch(()=>{
            // Best-effort, nunca debe interrumpir el flujo de compra.
            });
        }, 1500);
        return ()=>clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        nombre,
        telefono,
        ciudad,
        success
    ]);
    function capturarUbicacion() {
        if (!navigator.geolocation) {
            setUbicacionEstado("error");
            return;
        }
        setUbicacionEstado("cargando");
        navigator.geolocation.getCurrentPosition((pos)=>{
            setUbicacion({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
            });
            setUbicacionEstado("lista");
        }, ()=>setUbicacionEstado("error"), {
            enableHighAccuracy: true,
            timeout: 10000
        });
    }
    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        if (!nombre.trim() || !telefono.trim() || !departamento || !ciudad.trim() || !barrio.trim() || !direccion.trim()) {
            setError("Por favor completa todos los campos requeridos.");
            return;
        }
        const telefonoNormalizado = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$lib$2f$phone$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeColombianMobile"])(telefono);
        if (!telefonoNormalizado) {
            setError("Ingresa un celular colombiano valido de 10 digitos, por ejemplo 300 123 4567.");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nombre,
                    telefono: telefonoNormalizado.e164,
                    email: email.trim() || undefined,
                    departamento,
                    ciudad,
                    barrio: barrio.trim() || undefined,
                    direccion,
                    notas,
                    ubicacion,
                    variantId: selectedVariant.id,
                    slug: product.handle
                })
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.mensaje ?? "No pudimos procesar tu pedido. Intenta de nuevo.");
            }
            setSuccess({
                orderNumber: data.orderNumber,
                telefono: data.telefono
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "No pudimos procesar tu pedido. Intenta de nuevo.");
        } finally{
            setLoading(false);
        }
    }
    if (success) {
        const whatsappNumero = ("TURBOPACK compile-time value", "57XXXXXXXXXX");
        const mensaje = `Hola, acabo de confirmar mi pedido ${success.orderNumber} de ${product.title} (${selectedVariant.title}).`;
        const whatsappUrl = `https://wa.me/${whatsappNumero}?text=${encodeURIComponent(mensaje)}`;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "animate-fade-in-up flex flex-col items-start gap-4 rounded-[4px] border border-arena bg-crema p-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                    children: `
          @keyframes codform-check-circle {
            from { transform: scale(0); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          @keyframes codform-check-mark {
            from { stroke-dashoffset: 24; }
            to { stroke-dashoffset: 0; }
          }
          .codform-check-circle {
            animation: codform-check-circle 300ms ease-out both;
          }
          .codform-check-mark {
            stroke-dasharray: 24;
            stroke-dashoffset: 24;
            animation: codform-check-mark 400ms 200ms ease-out forwards;
          }
        `
                }, void 0, false, {
                    fileName: "[project]/apps/shop/components/form/CODForm.tsx",
                    lineNumber: 152,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "codform-check-circle flex h-11 w-11 items-center justify-center rounded-full border border-dorado text-dorado",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        width: "20",
                        height: "20",
                        viewBox: "0 0 24 24",
                        fill: "none",
                        stroke: "currentColor",
                        strokeWidth: "1.5",
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            className: "codform-check-mark",
                            d: "M20 6L9 17l-5-5"
                        }, void 0, false, {
                            fileName: "[project]/apps/shop/components/form/CODForm.tsx",
                            lineNumber: 181,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/shop/components/form/CODForm.tsx",
                        lineNumber: 171,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/shop/components/form/CODForm.tsx",
                    lineNumber: 170,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "font-display text-2xl text-carbon",
                            children: "Pedido confirmado"
                        }, void 0, false, {
                            fileName: "[project]/apps/shop/components/form/CODForm.tsx",
                            lineNumber: 185,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-ceniza",
                            children: [
                                "Numero de pedido: ",
                                success.orderNumber
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/shop/components/form/CODForm.tsx",
                            lineNumber: 186,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/shop/components/form/CODForm.tsx",
                    lineNumber: 184,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm text-carbon-suave",
                    children: [
                        "Te contactaremos en maximo 24 horas al ",
                        success.telefono,
                        "."
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/shop/components/form/CODForm.tsx",
                    lineNumber: 188,
                    columnNumber: 9
                }, this),
                ("TURBOPACK compile-time truthy", 1) ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                    variant: "secondary",
                    type: "button",
                    onClick: ()=>window.open(whatsappUrl, "_blank", "noopener,noreferrer"),
                    children: "Escribenos por WhatsApp"
                }, void 0, false, {
                    fileName: "[project]/apps/shop/components/form/CODForm.tsx",
                    lineNumber: 192,
                    columnNumber: 11
                }, this) : "TURBOPACK unreachable"
            ]
        }, void 0, true, {
            fileName: "[project]/apps/shop/components/form/CODForm.tsx",
            lineNumber: 151,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
        onSubmit: handleSubmit,
        className: "flex flex-col gap-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$ui$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
                label: "Nombre completo",
                type: "text",
                autoComplete: "name",
                required: true,
                value: nombre,
                onChange: (e)=>setNombre(e.target.value),
                placeholder: "Tu nombre y apellido"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/form/CODForm.tsx",
                lineNumber: 208,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-1.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        htmlFor: "telefono",
                        className: "text-xs text-ceniza font-medium",
                        children: "Telefono celular"
                    }, void 0, false, {
                        fileName: "[project]/apps/shop/components/form/CODForm.tsx",
                        lineNumber: 219,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex min-h-[44px] overflow-hidden rounded-[2px] border border-arena bg-blanco focus-within:border-dorado transition-colors",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "flex items-center px-4 text-base text-ceniza border-r border-arena",
                                children: "+57"
                            }, void 0, false, {
                                fileName: "[project]/apps/shop/components/form/CODForm.tsx",
                                lineNumber: 223,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                id: "telefono",
                                type: "tel",
                                inputMode: "numeric",
                                autoComplete: "tel-national",
                                maxLength: 13,
                                required: true,
                                value: telefono,
                                onChange: (e)=>setTelefono(e.target.value.replace(/[^\d\s]/g, "")),
                                placeholder: "300 123 4567",
                                className: "flex-1 min-h-[44px] bg-transparent px-4 py-2.5 text-base text-carbon placeholder:text-ceniza focus:outline-none"
                            }, void 0, false, {
                                fileName: "[project]/apps/shop/components/form/CODForm.tsx",
                                lineNumber: 224,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/shop/components/form/CODForm.tsx",
                        lineNumber: 222,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/shop/components/form/CODForm.tsx",
                lineNumber: 218,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$ui$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
                label: "Correo (opcional)",
                type: "email",
                autoComplete: "email",
                value: email,
                onChange: (e)=>setEmail(e.target.value),
                placeholder: "tucorreo@ejemplo.com"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/form/CODForm.tsx",
                lineNumber: 239,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-1.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        htmlFor: "departamento",
                        className: "text-xs text-ceniza font-medium",
                        children: "Departamento"
                    }, void 0, false, {
                        fileName: "[project]/apps/shop/components/form/CODForm.tsx",
                        lineNumber: 249,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        id: "departamento",
                        autoComplete: "address-level1",
                        required: true,
                        value: departamento,
                        onChange: (e)=>setDepartamento(e.target.value),
                        className: "min-h-[44px] rounded-[2px] border border-arena bg-blanco px-4 py-2.5 text-base text-carbon focus:outline-none focus:border-dorado transition-colors",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "",
                                disabled: true,
                                children: "Selecciona tu departamento"
                            }, void 0, false, {
                                fileName: "[project]/apps/shop/components/form/CODForm.tsx",
                                lineNumber: 260,
                                columnNumber: 11
                            }, this),
                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$lib$2f$colombia$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEPARTAMENTOS_COLOMBIA"].map((dep)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: dep,
                                    children: dep
                                }, dep, false, {
                                    fileName: "[project]/apps/shop/components/form/CODForm.tsx",
                                    lineNumber: 264,
                                    columnNumber: 13
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/shop/components/form/CODForm.tsx",
                        lineNumber: 252,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/shop/components/form/CODForm.tsx",
                lineNumber: 248,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$ui$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
                label: "Ciudad",
                type: "text",
                autoComplete: "address-level2",
                list: "ciudades-sugeridas",
                required: true,
                value: ciudad,
                onChange: (e)=>setCiudad(e.target.value),
                placeholder: departamento ? "Escribe o elige tu ciudad" : "Bogota, Medellin..."
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/form/CODForm.tsx",
                lineNumber: 271,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("datalist", {
                id: "ciudades-sugeridas",
                children: ciudadesSugeridas.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                        value: c
                    }, c, false, {
                        fileName: "[project]/apps/shop/components/form/CODForm.tsx",
                        lineNumber: 283,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/form/CODForm.tsx",
                lineNumber: 281,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$ui$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
                label: "Barrio o sector",
                type: "text",
                autoComplete: "address-line2",
                list: "barrios-sugeridos",
                required: true,
                value: barrio,
                onChange: (e)=>setBarrio(e.target.value),
                placeholder: "Ej. Chapinero, El Poblado..."
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/form/CODForm.tsx",
                lineNumber: 287,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("datalist", {
                id: "barrios-sugeridos",
                children: barriosSugeridos.map((b)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                        value: b
                    }, b, false, {
                        fileName: "[project]/apps/shop/components/form/CODForm.tsx",
                        lineNumber: 299,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/form/CODForm.tsx",
                lineNumber: 297,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$ui$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Textarea"], {
                label: "Direccion completa",
                rows: 3,
                autoComplete: "street-address",
                required: true,
                value: direccion,
                onChange: (e)=>setDireccion(e.target.value),
                placeholder: "Calle, numero, apto..."
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/form/CODForm.tsx",
                lineNumber: 303,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-1.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: capturarUbicacion,
                        disabled: ubicacionEstado === "cargando" || ubicacionEstado === "lista",
                        className: "flex min-h-[44px] items-center justify-center gap-2 rounded-[2px] border border-arena text-sm text-carbon-suave transition-colors hover:bg-crema disabled:opacity-70",
                        children: [
                            ubicacionEstado === "cargando" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$ui$2f$Spinner$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Spinner"], {
                                className: "text-carbon-suave"
                            }, void 0, false, {
                                fileName: "[project]/apps/shop/components/form/CODForm.tsx",
                                lineNumber: 320,
                                columnNumber: 46
                            }, this),
                            ubicacionEstado === "lista" ? "Ubicación compartida ✓" : "Compartir mi ubicación (opcional, ayuda a la entrega)"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/shop/components/form/CODForm.tsx",
                        lineNumber: 314,
                        columnNumber: 9
                    }, this),
                    ubicacionEstado === "error" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-ceniza",
                        children: "No pudimos obtener tu ubicación. No pasa nada, tu pedido igual se procesa con la dirección que escribiste."
                    }, void 0, false, {
                        fileName: "[project]/apps/shop/components/form/CODForm.tsx",
                        lineNumber: 326,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/shop/components/form/CODForm.tsx",
                lineNumber: 313,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$ui$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Textarea"], {
                label: "Notas adicionales",
                rows: 2,
                value: notas,
                onChange: (e)=>setNotas(e.target.value),
                placeholder: "Referencias de entrega (opcional)"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/form/CODForm.tsx",
                lineNumber: 333,
                columnNumber: 7
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-error",
                role: "alert",
                children: error
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/form/CODForm.tsx",
                lineNumber: 342,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                variant: "primary",
                type: "submit",
                disabled: loading,
                className: "w-full",
                children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$ui$2f$Spinner$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Spinner"], {
                            className: "text-blanco"
                        }, void 0, false, {
                            fileName: "[project]/apps/shop/components/form/CODForm.tsx",
                            lineNumber: 350,
                            columnNumber: 13
                        }, this),
                        "Procesando tu pedido..."
                    ]
                }, void 0, true) : "Confirmar pedido — Contraentrega"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/form/CODForm.tsx",
                lineNumber: 347,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/shop/components/form/CODForm.tsx",
        lineNumber: 207,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/shop/components/product/VariantSelector.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VariantSelector",
    ()=>VariantSelector
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$OrderSheetContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/shop/components/product/OrderSheetContext.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function ExternalArrowIcon({ className }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "20",
        height: "20",
        viewBox: "0 0 20 20",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        className: className,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M6 14L14 6"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/VariantSelector.tsx",
                lineNumber: 21,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M8 6h6v6"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/VariantSelector.tsx",
                lineNumber: 22,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/shop/components/product/VariantSelector.tsx",
        lineNumber: 10,
        columnNumber: 5
    }, this);
}
function getVariantSubtitle(variant, product) {
    const title = variant.title.toLowerCase();
    if (title.includes("1 unidad")) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-xs text-ceniza",
            children: "Empieza tu ritual"
        }, void 0, false, {
            fileName: "[project]/apps/shop/components/product/VariantSelector.tsx",
            lineNumber: 31,
            columnNumber: 12
        }, this);
    }
    if (title.includes("2")) {
        if (!product.metafields.ahorroPack2) return null;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "flex items-center gap-2",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-xs text-ceniza",
                    children: product.metafields.ahorroPack2
                }, void 0, false, {
                    fileName: "[project]/apps/shop/components/product/VariantSelector.tsx",
                    lineNumber: 38,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "rounded-[2px] bg-morado px-2 py-0.5 text-[10px] text-blanco",
                    children: "POPULAR"
                }, void 0, false, {
                    fileName: "[project]/apps/shop/components/product/VariantSelector.tsx",
                    lineNumber: 39,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/shop/components/product/VariantSelector.tsx",
            lineNumber: 37,
            columnNumber: 7
        }, this);
    }
    if (title.includes("3")) {
        if (!product.metafields.ahorroPack3) return null;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "flex items-center gap-2",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-xs text-ceniza",
                    children: product.metafields.ahorroPack3
                }, void 0, false, {
                    fileName: "[project]/apps/shop/components/product/VariantSelector.tsx",
                    lineNumber: 48,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "rounded-[2px] bg-morado-oscuro px-2 py-0.5 text-[10px] text-blanco",
                    children: "MEJOR VALOR"
                }, void 0, false, {
                    fileName: "[project]/apps/shop/components/product/VariantSelector.tsx",
                    lineNumber: 49,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/shop/components/product/VariantSelector.tsx",
            lineNumber: 47,
            columnNumber: 7
        }, this);
    }
    return null;
}
function VariantSelector({ compact = false }) {
    const { product, selectedVariantId, selectedIsNuskin, selectVariant, selectNuskin } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$OrderSheetContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useOrderSheet"])();
    const hasNuskinDirect = Boolean(product.metafields.nuskinDirectUrl);
    const radioIds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const ids = product.variants.map((v)=>v.id);
        return hasNuskinDirect ? [
            ...ids,
            "nuskin"
        ] : ids;
    }, [
        product.variants,
        hasNuskinDirect
    ]);
    const radioRefs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(new Map());
    const currentRadioId = selectedIsNuskin ? "nuskin" : selectedVariantId;
    function selectById(id) {
        if (id === "nuskin") {
            selectNuskin();
        } else {
            selectVariant(id);
        }
        radioRefs.current.get(id)?.focus();
    }
    function handleCardKeyDown(e, id, onSelect) {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect();
            return;
        }
        if ([
            "ArrowDown",
            "ArrowRight",
            "ArrowUp",
            "ArrowLeft"
        ].includes(e.key)) {
            e.preventDefault();
            const currentIndex = radioIds.indexOf(id);
            const direction = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
            const nextIndex = (currentIndex + direction + radioIds.length) % radioIds.length;
            selectById(radioIds[nextIndex]);
        }
    }
    const cardPadding = compact ? "p-3" : "p-4";
    const gap = compact ? "gap-2" : "gap-3";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            !compact && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "font-display text-lg text-carbon mb-3",
                children: "Elige tu ritual"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/VariantSelector.tsx",
                lineNumber: 106,
                columnNumber: 20
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                role: "radiogroup",
                "aria-label": "Elige tu ritual",
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cx"])("flex flex-col", gap),
                children: [
                    product.variants.map((variant)=>{
                        const isSelected = !selectedIsNuskin && variant.id === selectedVariantId;
                        const subtitle = !compact ? getVariantSubtitle(variant, product) : null;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            ref: (node)=>{
                                if (node) radioRefs.current.set(variant.id, node);
                                else radioRefs.current.delete(variant.id);
                            },
                            role: "radio",
                            "aria-checked": isSelected,
                            tabIndex: variant.id === currentRadioId ? 0 : -1,
                            onClick: ()=>selectVariant(variant.id),
                            onKeyDown: (e)=>handleCardKeyDown(e, variant.id, ()=>selectVariant(variant.id)),
                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cx"])("flex cursor-pointer flex-col gap-1.5 rounded-[4px] border-[1.5px] border-arena transition-colors", cardPadding, isSelected && "border-morado bg-crema"),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-between gap-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-arena",
                                                    children: isSelected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "h-2.5 w-2.5 rounded-full bg-morado"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/shop/components/product/VariantSelector.tsx",
                                                        lineNumber: 134,
                                                        columnNumber: 36
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/shop/components/product/VariantSelector.tsx",
                                                    lineNumber: 133,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-sm font-medium text-carbon",
                                                    children: variant.title
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/shop/components/product/VariantSelector.tsx",
                                                    lineNumber: 136,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/apps/shop/components/product/VariantSelector.tsx",
                                            lineNumber: 132,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "flex items-baseline gap-1.5",
                                            children: [
                                                variant.compareAtPrice && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-sm text-ceniza line-through",
                                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatCOP"])(variant.compareAtPrice)
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/shop/components/product/VariantSelector.tsx",
                                                    lineNumber: 140,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cx"])("font-display font-semibold text-dorado-oscuro", compact ? "text-lg" : "text-xl"),
                                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatCOP"])(variant.price)
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/shop/components/product/VariantSelector.tsx",
                                                    lineNumber: 144,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/apps/shop/components/product/VariantSelector.tsx",
                                            lineNumber: 138,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/shop/components/product/VariantSelector.tsx",
                                    lineNumber: 131,
                                    columnNumber: 15
                                }, this),
                                subtitle && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "pl-8",
                                    children: subtitle
                                }, void 0, false, {
                                    fileName: "[project]/apps/shop/components/product/VariantSelector.tsx",
                                    lineNumber: 154,
                                    columnNumber: 28
                                }, this)
                            ]
                        }, variant.id, true, {
                            fileName: "[project]/apps/shop/components/product/VariantSelector.tsx",
                            lineNumber: 114,
                            columnNumber: 13
                        }, this);
                    }),
                    hasNuskinDirect && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        ref: (node)=>{
                            if (node) radioRefs.current.set("nuskin", node);
                            else radioRefs.current.delete("nuskin");
                        },
                        role: "radio",
                        "aria-checked": selectedIsNuskin,
                        tabIndex: currentRadioId === "nuskin" ? 0 : -1,
                        onClick: selectNuskin,
                        onKeyDown: (e)=>handleCardKeyDown(e, "nuskin", selectNuskin),
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cx"])("flex cursor-pointer flex-col gap-1.5 rounded-[4px] border-[1.5px] border-arena transition-colors", cardPadding, selectedIsNuskin && "border-morado bg-crema"),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-arena",
                                                children: selectedIsNuskin && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "h-2.5 w-2.5 rounded-full bg-morado"
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/shop/components/product/VariantSelector.tsx",
                                                    lineNumber: 179,
                                                    columnNumber: 40
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/apps/shop/components/product/VariantSelector.tsx",
                                                lineNumber: 178,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "flex items-center gap-1.5 text-sm font-medium text-carbon",
                                                children: [
                                                    "Compra directo en Nu Skin",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ExternalArrowIcon, {
                                                        className: "text-dorado-oscuro"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/shop/components/product/VariantSelector.tsx",
                                                        lineNumber: 183,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/shop/components/product/VariantSelector.tsx",
                                                lineNumber: 181,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/shop/components/product/VariantSelector.tsx",
                                        lineNumber: 177,
                                        columnNumber: 15
                                    }, this),
                                    product.metafields.nuskinDirectPrecio && !compact && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-display text-lg text-carbon",
                                        children: product.metafields.nuskinDirectPrecio
                                    }, void 0, false, {
                                        fileName: "[project]/apps/shop/components/product/VariantSelector.tsx",
                                        lineNumber: 187,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/shop/components/product/VariantSelector.tsx",
                                lineNumber: 176,
                                columnNumber: 13
                            }, this),
                            !compact && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "pl-8",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xs text-ceniza",
                                    children: "Precio distribuidora · Acumulas puntos Nu Skin"
                                }, void 0, false, {
                                    fileName: "[project]/apps/shop/components/product/VariantSelector.tsx",
                                    lineNumber: 194,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/apps/shop/components/product/VariantSelector.tsx",
                                lineNumber: 193,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/shop/components/product/VariantSelector.tsx",
                        lineNumber: 160,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/shop/components/product/VariantSelector.tsx",
                lineNumber: 108,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/shop/components/product/VariantSelector.tsx",
        lineNumber: 105,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/shop/components/form/OrderBottomSheet.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OrderBottomSheet",
    ()=>OrderBottomSheet
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/ui/Button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$form$2f$CODForm$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/shop/components/form/CODForm.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$VariantSelector$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/shop/components/product/VariantSelector.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$OrderSheetContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/shop/components/product/OrderSheetContext.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
function CloseIcon({ className }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "18",
        height: "18",
        viewBox: "0 0 20 20",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.5",
        className: className,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: "4",
                y1: "4",
                x2: "16",
                y2: "16",
                strokeLinecap: "round"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/form/OrderBottomSheet.tsx",
                lineNumber: 14,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: "16",
                y1: "4",
                x2: "4",
                y2: "16",
                strokeLinecap: "round"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/form/OrderBottomSheet.tsx",
                lineNumber: 15,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/shop/components/form/OrderBottomSheet.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
function LockIcon({ className }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "14",
        height: "14",
        viewBox: "0 0 20 20",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.5",
        className: className,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                x: "4.5",
                y: "9",
                width: "11",
                height: "8",
                rx: "1.5"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/form/OrderBottomSheet.tsx",
                lineNumber: 23,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M6.5 9V6a3.5 3.5 0 0 1 7 0v3",
                strokeLinecap: "round"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/form/OrderBottomSheet.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/shop/components/form/OrderBottomSheet.tsx",
        lineNumber: 22,
        columnNumber: 5
    }, this);
}
function OrderSummary() {
    const { product, selectedVariant } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$OrderSheetContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useOrderSheet"])();
    if (!selectedVariant) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-3 rounded-[4px] border border-arena bg-crema p-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative h-[52px] w-[52px] shrink-0 overflow-hidden rounded-[2px] bg-arena",
                children: product.images[0] && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    src: product.images[0].url,
                    alt: product.images[0].altText ?? product.title,
                    fill: true,
                    className: "object-cover",
                    sizes: "52px"
                }, void 0, false, {
                    fileName: "[project]/apps/shop/components/form/OrderBottomSheet.tsx",
                    lineNumber: 37,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/form/OrderBottomSheet.tsx",
                lineNumber: 35,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-0.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm font-medium text-carbon",
                        children: product.title
                    }, void 0, false, {
                        fileName: "[project]/apps/shop/components/form/OrderBottomSheet.tsx",
                        lineNumber: 47,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs text-ceniza",
                        children: selectedVariant.title
                    }, void 0, false, {
                        fileName: "[project]/apps/shop/components/form/OrderBottomSheet.tsx",
                        lineNumber: 48,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "font-display text-lg text-carbon",
                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatCOP"])(selectedVariant.price)
                    }, void 0, false, {
                        fileName: "[project]/apps/shop/components/form/OrderBottomSheet.tsx",
                        lineNumber: 49,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/shop/components/form/OrderBottomSheet.tsx",
                lineNumber: 46,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/shop/components/form/OrderBottomSheet.tsx",
        lineNumber: 34,
        columnNumber: 5
    }, this);
}
function NuskinPanel() {
    const { product } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$OrderSheetContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useOrderSheet"])();
    function openNuskin() {
        if (product.metafields.nuskinDirectUrl) {
            window.open(product.metafields.nuskinDirectUrl, "_blank", "noopener,noreferrer");
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-3 rounded-[4px] border border-arena bg-crema p-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: "font-display text-lg text-carbon",
                children: "¿Eres distribuidora Nu Skin?"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/form/OrderBottomSheet.tsx",
                lineNumber: 66,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-carbon-suave",
                children: "Compra a precio de distribuidora directamente en la plataforma oficial de Nu Skin y acumula tus puntos con nuestro link."
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/form/OrderBottomSheet.tsx",
                lineNumber: 67,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                variant: "secondary",
                type: "button",
                onClick: openNuskin,
                className: "border-morado! text-morado! hover:bg-lila-suave!",
                children: "Comprar en Nu Skin ↗"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/form/OrderBottomSheet.tsx",
                lineNumber: 71,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/shop/components/form/OrderBottomSheet.tsx",
        lineNumber: 65,
        columnNumber: 5
    }, this);
}
function SheetContent({ compact }) {
    const { product, selectedVariant, selectedIsNuskin } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$OrderSheetContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useOrderSheet"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "font-display text-xl text-carbon mb-2",
                        children: "Resumen del pedido"
                    }, void 0, false, {
                        fileName: "[project]/apps/shop/components/form/OrderBottomSheet.tsx",
                        lineNumber: 89,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(OrderSummary, {}, void 0, false, {
                        fileName: "[project]/apps/shop/components/form/OrderBottomSheet.tsx",
                        lineNumber: 90,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-2 text-xs text-ceniza",
                        children: "Pago al recibir tu pedido"
                    }, void 0, false, {
                        fileName: "[project]/apps/shop/components/form/OrderBottomSheet.tsx",
                        lineNumber: 91,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/shop/components/form/OrderBottomSheet.tsx",
                lineNumber: 88,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$VariantSelector$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["VariantSelector"], {
                compact: compact
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/form/OrderBottomSheet.tsx",
                lineNumber: 94,
                columnNumber: 7
            }, this),
            selectedIsNuskin ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(NuskinPanel, {}, void 0, false, {
                fileName: "[project]/apps/shop/components/form/OrderBottomSheet.tsx",
                lineNumber: 97,
                columnNumber: 9
            }, this) : selectedVariant && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$form$2f$CODForm$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CODForm"], {
                product: product,
                selectedVariant: selectedVariant
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/form/OrderBottomSheet.tsx",
                lineNumber: 99,
                columnNumber: 28
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "flex items-center justify-center gap-1.5 text-xs text-ceniza",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(LockIcon, {
                        className: "text-ceniza"
                    }, void 0, false, {
                        fileName: "[project]/apps/shop/components/form/OrderBottomSheet.tsx",
                        lineNumber: 103,
                        columnNumber: 9
                    }, this),
                    "Datos seguros · Pago al recibir"
                ]
            }, void 0, true, {
                fileName: "[project]/apps/shop/components/form/OrderBottomSheet.tsx",
                lineNumber: 102,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/shop/components/form/OrderBottomSheet.tsx",
        lineNumber: 87,
        columnNumber: 5
    }, this);
}
function OrderBottomSheet() {
    const { isOpen, closeOrderSheet } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$OrderSheetContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useOrderSheet"])();
    const touchStartY = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const dialogRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const closeButtonRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const previousFocusRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [dragY, setDragY] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!isOpen) return;
        previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        closeButtonRef.current?.focus();
        function handleKeyDown(e) {
            if (e.key === "Escape") {
                closeOrderSheet();
            }
        }
        document.addEventListener("keydown", handleKeyDown);
        return ()=>{
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeyDown);
            previousFocusRef.current?.focus();
        };
    }, [
        isOpen,
        closeOrderSheet
    ]);
    function handleDialogKeyDown(e) {
        if (e.key !== "Tab") return;
        const focusable = dialogRef.current?.querySelectorAll('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])');
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }
    function handleTouchStart(e) {
        touchStartY.current = e.touches[0].clientY;
    }
    function handleTouchMove(e) {
        if (touchStartY.current === null) return;
        const delta = e.touches[0].clientY - touchStartY.current;
        if (delta > 0) setDragY(delta);
    }
    function handleTouchEnd() {
        if (dragY > 80) {
            closeOrderSheet();
        }
        setDragY(0);
        touchStartY.current = null;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "fixed inset-0 z-[60] bg-carbon/60 transition-opacity duration-300 md:hidden",
                        onClick: closeOrderSheet,
                        "aria-hidden": "true"
                    }, void 0, false, {
                        fileName: "[project]/apps/shop/components/form/OrderBottomSheet.tsx",
                        lineNumber: 184,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        ref: dialogRef,
                        className: "fixed bottom-0 left-0 right-0 z-[70] max-h-[85vh] overflow-y-auto rounded-t-[16px] bg-blanco transition-transform duration-300 ease-out md:hidden",
                        style: {
                            paddingBottom: "max(16px, env(safe-area-inset-bottom))",
                            transform: dragY > 0 ? `translateY(${dragY}px)` : undefined
                        },
                        role: "dialog",
                        "aria-modal": "true",
                        "aria-label": "Completa tu pedido",
                        onKeyDown: handleDialogKeyDown,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing",
                                onTouchStart: handleTouchStart,
                                onTouchMove: handleTouchMove,
                                onTouchEnd: handleTouchEnd,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-1 w-10 rounded-full bg-arena"
                                }, void 0, false, {
                                    fileName: "[project]/apps/shop/components/form/OrderBottomSheet.tsx",
                                    lineNumber: 209,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/apps/shop/components/form/OrderBottomSheet.tsx",
                                lineNumber: 203,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between px-5 pb-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-display text-lg text-carbon",
                                        children: "Completa tu pedido"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/shop/components/form/OrderBottomSheet.tsx",
                                        lineNumber: 213,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        ref: closeButtonRef,
                                        type: "button",
                                        onClick: closeOrderSheet,
                                        "aria-label": "Cerrar",
                                        className: "flex h-11 w-11 items-center justify-center text-carbon-suave",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CloseIcon, {}, void 0, false, {
                                            fileName: "[project]/apps/shop/components/form/OrderBottomSheet.tsx",
                                            lineNumber: 221,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/shop/components/form/OrderBottomSheet.tsx",
                                        lineNumber: 214,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/shop/components/form/OrderBottomSheet.tsx",
                                lineNumber: 212,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "px-5 pb-6",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SheetContent, {
                                    compact: true
                                }, void 0, false, {
                                    fileName: "[project]/apps/shop/components/form/OrderBottomSheet.tsx",
                                    lineNumber: 226,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/apps/shop/components/form/OrderBottomSheet.tsx",
                                lineNumber: 225,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/shop/components/form/OrderBottomSheet.tsx",
                        lineNumber: 191,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                id: "order-form-desktop",
                className: "hidden md:block md:sticky md:top-[120px] rounded-[4px] border border-arena bg-blanco p-5",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SheetContent, {
                    compact: false
                }, void 0, false, {
                    fileName: "[project]/apps/shop/components/form/OrderBottomSheet.tsx",
                    lineNumber: 237,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/form/OrderBottomSheet.tsx",
                lineNumber: 233,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
}),
"[project]/apps/shop/components/product/IngredientsAccordion.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "IngredientsAccordion",
    ()=>IngredientsAccordion
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
const INGREDIENTES = "Sodium Cocoyl Isethionate, Stearic Acid, Aqua, Sodium Isethionate, Parfum, Sea Clay Extract, Sodium Chloride, Titanium Dioxide, Tsuga Heterophylla Bark Powder, Iron Oxides, Ascorbyl Palmitate, Tocopherol, Allantoin.";
function IngredientsAccordion() {
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-3 border-t border-arena pt-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: ()=>setOpen((prev)=>!prev),
                className: "inline-flex items-center min-h-[44px] text-sm font-medium text-carbon text-left",
                children: open ? "Ver ingredientes completos −" : "Ver ingredientes completos +"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/IngredientsAccordion.tsx",
                lineNumber: 13,
                columnNumber: 7
            }, this),
            open ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-carbon-suave leading-relaxed animate-fade-in-up",
                children: INGREDIENTES
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/IngredientsAccordion.tsx",
                lineNumber: 22,
                columnNumber: 9
            }, this) : null,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-ceniza",
                children: "Sin parabenos · Sin sulfatos · Sin jabón · Sin aceites minerales"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/IngredientsAccordion.tsx",
                lineNumber: 27,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/shop/components/product/IngredientsAccordion.tsx",
        lineNumber: 12,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/shop/components/product/LiveActivityBar.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LiveActivityBar",
    ()=>LiveActivityBar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
const MIN_VIEWERS = 18;
const MAX_VIEWERS = 31;
const UPDATE_INTERVAL_MS = 45000;
function randomViewers() {
    return Math.floor(Math.random() * (MAX_VIEWERS - MIN_VIEWERS + 1)) + MIN_VIEWERS;
}
function LiveActivityBar() {
    const [viewers, setViewers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>randomViewers());
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const interval = setInterval(()=>{
            setViewers(randomViewers());
        }, UPDATE_INTERVAL_MS);
        return ()=>clearInterval(interval);
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-2 border-l-[3px] border-morado bg-lila-suave px-4 py-2.5 text-[12px] text-morado-oscuro",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-2 w-2 shrink-0 animate-pulse rounded-full bg-red-500"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/LiveActivityBar.tsx",
                lineNumber: 26,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: [
                    viewers,
                    " personas están viendo esto ahora"
                ]
            }, void 0, true, {
                fileName: "[project]/apps/shop/components/product/LiveActivityBar.tsx",
                lineNumber: 27,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/shop/components/product/LiveActivityBar.tsx",
        lineNumber: 25,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/shop/components/product/RatingBar.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RatingBar",
    ()=>RatingBar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
"use client";
;
function ShieldIcon() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "14",
        height: "14",
        viewBox: "0 0 20 20",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.5",
        "aria-hidden": "true",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M10 2l6.5 2.5v5c0 4.5-2.9 7.4-6.5 8.5-3.6-1.1-6.5-4-6.5-8.5v-5L10 2z",
                strokeLinecap: "round",
                strokeLinejoin: "round"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/RatingBar.tsx",
                lineNumber: 6,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M7 10l2 2 4-4.2",
                strokeLinecap: "round",
                strokeLinejoin: "round"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/RatingBar.tsx",
                lineNumber: 7,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/shop/components/product/RatingBar.tsx",
        lineNumber: 5,
        columnNumber: 5
    }, this);
}
function RatingBar() {
    function handleDetailsClick(e) {
        e.preventDefault();
        document.getElementById("testimonios")?.scrollIntoView({
            behavior: "smooth"
        });
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-wrap items-center gap-2 text-[13px]",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "flex items-center gap-1.5 font-medium text-carbon",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ShieldIcon, {}, void 0, false, {
                        fileName: "[project]/apps/shop/components/product/RatingBar.tsx",
                        lineNumber: 21,
                        columnNumber: 9
                    }, this),
                    "Compra contraentrega"
                ]
            }, void 0, true, {
                fileName: "[project]/apps/shop/components/product/RatingBar.tsx",
                lineNumber: 20,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-ceniza",
                children: "·"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/RatingBar.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-ceniza",
                children: "Soporte por WhatsApp"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/RatingBar.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-ceniza",
                children: "·"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/RatingBar.tsx",
                lineNumber: 26,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                href: "#testimonios",
                onClick: handleDetailsClick,
                className: "text-morado underline underline-offset-2 cursor-pointer",
                children: "Ver detalles"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/RatingBar.tsx",
                lineNumber: 27,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/shop/components/product/RatingBar.tsx",
        lineNumber: 19,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/shop/components/product/TestimonialsSection.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TestimonialsSection",
    ()=>TestimonialsSection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$OrderSheetContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/shop/components/product/OrderSheetContext.tsx [app-ssr] (ecmascript)");
"use client";
;
;
const EXPERIENCES = [
    {
        title: "Compra sin anticipo",
        text: "El pago contraentrega ayuda a probar el producto sin transferencias previas ni tarjeta."
    },
    {
        title: "Acompanamiento por WhatsApp",
        text: "Si tienes dudas sobre uso, entrega o disponibilidad, puedes confirmar antes de comprar."
    },
    {
        title: "Rutina simple",
        text: "La recomendacion es mantener pocos pasos, constancia y elegir el pack segun frecuencia de uso."
    }
];
function IconStar() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "14",
        height: "14",
        viewBox: "0 0 20 20",
        fill: "var(--dorado)",
        "aria-hidden": "true",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
            d: "M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.9L10 1.5z"
        }, void 0, false, {
            fileName: "[project]/apps/shop/components/product/TestimonialsSection.tsx",
            lineNumber: 31,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/shop/components/product/TestimonialsSection.tsx",
        lineNumber: 30,
        columnNumber: 5
    }, this);
}
function TestimonialsSection({ productName, showUsageStats = false }) {
    const { openOrderSheet } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$OrderSheetContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useOrderSheet"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        id: "testimonios",
        children: [
            showUsageStats && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "seccion-joya text-carbon py-8 px-6 text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "font-display text-2xl",
                        children: "Un ritual pensado para uso constante"
                    }, void 0, false, {
                        fileName: "[project]/apps/shop/components/product/TestimonialsSection.tsx",
                        lineNumber: 49,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-1 text-[13px] text-carbon-suave",
                        children: "Rostro, cuerpo y rutina semanal segun tu tipo de piel"
                    }, void 0, false, {
                        fileName: "[project]/apps/shop/components/product/TestimonialsSection.tsx",
                        lineNumber: 50,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-6 grid grid-cols-3 gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "font-display text-3xl text-morado-oscuro",
                                        children: "COD"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/shop/components/product/TestimonialsSection.tsx",
                                        lineNumber: 56,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[11px] text-carbon-suave",
                                        children: "Pagas al recibir"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/shop/components/product/TestimonialsSection.tsx",
                                        lineNumber: 57,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/shop/components/product/TestimonialsSection.tsx",
                                lineNumber: 55,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "font-display text-3xl text-morado-oscuro",
                                        children: "24-72h"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/shop/components/product/TestimonialsSection.tsx",
                                        lineNumber: 60,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[11px] text-carbon-suave",
                                        children: "Despacho estimado"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/shop/components/product/TestimonialsSection.tsx",
                                        lineNumber: 61,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/shop/components/product/TestimonialsSection.tsx",
                                lineNumber: 59,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "font-display text-3xl text-morado-oscuro",
                                        children: "WA"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/shop/components/product/TestimonialsSection.tsx",
                                        lineNumber: 64,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[11px] text-carbon-suave",
                                        children: "Soporte directo"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/shop/components/product/TestimonialsSection.tsx",
                                        lineNumber: 65,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/shop/components/product/TestimonialsSection.tsx",
                                lineNumber: 63,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/shop/components/product/TestimonialsSection.tsx",
                        lineNumber: 54,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/shop/components/product/TestimonialsSection.tsx",
                lineNumber: 48,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-blanco py-12 px-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "font-display text-2xl text-carbon text-center mb-6",
                        children: [
                            "Antes de pedir ",
                            productName
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/shop/components/product/TestimonialsSection.tsx",
                        lineNumber: 72,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex overflow-x-auto snap-x snap-mandatory gap-4 md:grid md:grid-cols-3 md:overflow-visible md:gap-4",
                        style: {
                            scrollbarWidth: "none"
                        },
                        children: EXPERIENCES.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "min-w-[85%] snap-center flex flex-col gap-3 bg-blanco border border-arena rounded-[8px] p-5 md:min-w-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-0.5",
                                        children: Array.from({
                                            length: 5
                                        }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(IconStar, {}, i, false, {
                                                fileName: "[project]/apps/shop/components/product/TestimonialsSection.tsx",
                                                lineNumber: 87,
                                                columnNumber: 19
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/apps/shop/components/product/TestimonialsSection.tsx",
                                        lineNumber: 85,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[14px] font-semibold text-carbon",
                                        children: item.title
                                    }, void 0, false, {
                                        fileName: "[project]/apps/shop/components/product/TestimonialsSection.tsx",
                                        lineNumber: 90,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[14px] leading-relaxed text-carbon-suave",
                                        children: item.text
                                    }, void 0, false, {
                                        fileName: "[project]/apps/shop/components/product/TestimonialsSection.tsx",
                                        lineNumber: 91,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, item.title, true, {
                                fileName: "[project]/apps/shop/components/product/TestimonialsSection.tsx",
                                lineNumber: 81,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/apps/shop/components/product/TestimonialsSection.tsx",
                        lineNumber: 76,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/shop/components/product/TestimonialsSection.tsx",
                lineNumber: 71,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-blanco py-8 px-6 text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "font-display text-xl text-carbon mb-4",
                        children: "Lista para empezar tu ritual?"
                    }, void 0, false, {
                        fileName: "[project]/apps/shop/components/product/TestimonialsSection.tsx",
                        lineNumber: 98,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>openOrderSheet(),
                        className: "btn-shine mx-auto flex min-h-[44px] w-full max-w-sm items-center justify-center rounded-[2px] bg-morado px-6 text-blanco text-sm font-medium tracking-wide transition-all duration-200 hover:bg-morado-oscuro hover:scale-[1.02] active:scale-[0.97]",
                        children: [
                            "Pedir ",
                            productName
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/shop/components/product/TestimonialsSection.tsx",
                        lineNumber: 99,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/shop/components/product/TestimonialsSection.tsx",
                lineNumber: 97,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/shop/components/product/TestimonialsSection.tsx",
        lineNumber: 46,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/shop/components/product/FAQAccordion.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FAQAccordion",
    ()=>FAQAccordion
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
const FAQS = [
    {
        question: "¿Cómo funciona el pago contraentrega?",
        answer: "Recibes el producto en la puerta de tu casa y pagas en efectivo al mensajero. No necesitas tarjeta de crédito ni hacer transferencias por adelantado."
    },
    {
        question: "¿Cuánto demora el envío?",
        answer: "Entre 24 y 72 horas hábiles según tu ciudad. Ciudades principales (Bogotá, Medellín, Cali, Barranquilla) generalmente en 24-48 horas."
    },
    {
        question: "¿Para qué tipo de piel funciona?",
        answer: "Para todo tipo de piel. Es especialmente efectivo para piel mixta a grasa. Sin jabón, no reseca. Si tienes piel muy sensible, recomendamos usarlo 2-3 veces por semana al inicio."
    },
    {
        question: "¿Se puede usar en el rostro?",
        answer: "Sí. Muchas de nuestras clientas lo usan tanto en rostro como en cuerpo. La exfoliación es suave y no irrita. Consulta con tu dermatólogo si tienes condiciones de piel activas."
    },
    {
        question: "¿Qué pasa si no quedo satisfecha?",
        answer: "Escríbenos por WhatsApp. Si el producto llega en mal estado o hay algún inconveniente con tu pedido, lo solucionamos sin complicaciones."
    }
];
function FAQAccordion() {
    const [openIndex, setOpenIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const toggleItem = (index)=>{
        setOpenIndex((prev)=>prev === index ? null : index);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "font-display text-2xl text-carbon text-center mb-6",
                children: "Preguntas frecuentes"
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/FAQAccordion.tsx",
                lineNumber: 47,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: FAQS.map((faq, index)=>{
                    const isOpen = openIndex === index;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "border-b border-arena py-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>toggleItem(index),
                                "aria-expanded": isOpen,
                                className: "w-full flex items-center justify-between min-h-[44px] text-left",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm font-semibold text-carbon pr-4",
                                        children: faq.question
                                    }, void 0, false, {
                                        fileName: "[project]/apps/shop/components/product/FAQAccordion.tsx",
                                        lineNumber: 63,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `shrink-0 text-xl font-light text-carbon transition-transform duration-300 ${isOpen ? "rotate-45" : "rotate-0"}`,
                                        "aria-hidden": "true",
                                        children: "+"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/shop/components/product/FAQAccordion.tsx",
                                        lineNumber: 66,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/shop/components/product/FAQAccordion.tsx",
                                lineNumber: 57,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "overflow-hidden transition-[max-height] duration-300 ease-in-out",
                                style: {
                                    maxHeight: isOpen ? "200px" : "0px"
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-carbon-suave leading-[1.7] pt-2",
                                    children: faq.answer
                                }, void 0, false, {
                                    fileName: "[project]/apps/shop/components/product/FAQAccordion.tsx",
                                    lineNumber: 80,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/apps/shop/components/product/FAQAccordion.tsx",
                                lineNumber: 76,
                                columnNumber: 15
                            }, this)
                        ]
                    }, faq.question, true, {
                        fileName: "[project]/apps/shop/components/product/FAQAccordion.tsx",
                        lineNumber: 56,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/product/FAQAccordion.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/shop/components/product/FAQAccordion.tsx",
        lineNumber: 46,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/shop/components/product/NuskinSection.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NuskinSection",
    ()=>NuskinSection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$OrderSheetContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/shop/components/product/OrderSheetContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/ui/Button.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
function NuskinSection() {
    const { product } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$OrderSheetContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useOrderSheet"])();
    const nuskinDirectUrl = product.metafields.nuskinDirectUrl;
    if (!nuskinDirectUrl) return null;
    function openNuskin() {
        window.open(nuskinDirectUrl, "_blank", "noopener,noreferrer");
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "px-6 py-10",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mx-auto max-w-md rounded-[4px] border border-arena bg-crema p-6 text-center",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    className: "font-display text-xl text-carbon",
                    children: "¿Eres distribuidora Nu Skin?"
                }, void 0, false, {
                    fileName: "[project]/apps/shop/components/product/NuskinSection.tsx",
                    lineNumber: 19,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "mt-2 text-sm text-carbon-suave",
                    children: "Compra a precio de distribuidora directamente en la plataforma oficial de Nu Skin y acumula tus puntos con nuestro link."
                }, void 0, false, {
                    fileName: "[project]/apps/shop/components/product/NuskinSection.tsx",
                    lineNumber: 20,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                    variant: "secondary",
                    type: "button",
                    onClick: openNuskin,
                    className: "mt-4 border-morado! text-morado! hover:bg-lila-suave!",
                    children: "Comprar en Nu Skin ↗"
                }, void 0, false, {
                    fileName: "[project]/apps/shop/components/product/NuskinSection.tsx",
                    lineNumber: 24,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "mt-3 text-xs text-ceniza",
                    children: "Seras redirigida a Nu Skin. Los puntos se cargan a nuestra linea automaticamente."
                }, void 0, false, {
                    fileName: "[project]/apps/shop/components/product/NuskinSection.tsx",
                    lineNumber: 32,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/shop/components/product/NuskinSection.tsx",
            lineNumber: 18,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/shop/components/product/NuskinSection.tsx",
        lineNumber: 17,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/shop/components/ui/SocialCTABand.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SocialCTABand",
    ()=>SocialCTABand
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$OrderSheetContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/shop/components/product/OrderSheetContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/src/utils.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
function SocialCTABand({ title, buttonLabel, tone, variantId }) {
    const { openOrderSheet } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$shop$2f$components$2f$product$2f$OrderSheetContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useOrderSheet"])();
    if (tone === "outline-morado") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col items-center gap-4 py-8 px-6 text-center",
            children: [
                title && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "font-display text-xl text-carbon max-w-sm",
                    children: title
                }, void 0, false, {
                    fileName: "[project]/apps/shop/components/ui/SocialCTABand.tsx",
                    lineNumber: 19,
                    columnNumber: 19
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    onClick: ()=>openOrderSheet(variantId),
                    className: "inline-flex items-center justify-center min-h-[44px] px-8 rounded-[2px] border-2 border-morado text-morado text-base font-semibold tracking-wide transition-all duration-200 hover:bg-lila-suave hover:scale-[1.03] active:scale-[0.97]",
                    children: buttonLabel
                }, void 0, false, {
                    fileName: "[project]/apps/shop/components/ui/SocialCTABand.tsx",
                    lineNumber: 20,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/shop/components/ui/SocialCTABand.tsx",
            lineNumber: 18,
            columnNumber: 7
        }, this);
    }
    if (tone === "gold-solid") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            type: "button",
            onClick: ()=>openOrderSheet(variantId),
            className: "btn-shine inline-flex items-center justify-center min-h-[44px] px-8 rounded-[2px] bg-dorado-oscuro text-blanco text-base font-semibold tracking-wide shadow-[0_4px_14px_rgba(168,136,94,0.35)] transition-all duration-200 hover:bg-dorado hover:scale-[1.03] hover:shadow-[0_8px_24px_rgba(168,136,94,0.5)] active:scale-[0.97]",
            children: buttonLabel
        }, void 0, false, {
            fileName: "[project]/apps/shop/components/ui/SocialCTABand.tsx",
            lineNumber: 33,
            columnNumber: 7
        }, this);
    }
    const isMorado = tone === "morado-band";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cx"])("flex flex-col items-center gap-4 py-6 px-6 text-center", isMorado ? "bg-morado" : "bg-lila-suave"),
        children: [
            title && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cx"])("font-display text-xl max-w-sm", isMorado ? "text-blanco" : "text-carbon"),
                children: title
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/ui/SocialCTABand.tsx",
                lineNumber: 53,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: ()=>openOrderSheet(variantId),
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$src$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cx"])("btn-shine inline-flex items-center justify-center min-h-[44px] w-full max-w-sm px-6 rounded-[2px] text-base font-semibold tracking-wide transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]", isMorado ? "bg-blanco text-morado shadow-[0_4px_14px_rgba(0,0,0,0.12)] hover:bg-lila-suave" : "bg-dorado-oscuro text-blanco shadow-[0_4px_14px_rgba(168,136,94,0.35)] hover:bg-dorado hover:shadow-[0_8px_24px_rgba(168,136,94,0.5)]"),
                children: buttonLabel
            }, void 0, false, {
                fileName: "[project]/apps/shop/components/ui/SocialCTABand.tsx",
                lineNumber: 57,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/shop/components/ui/SocialCTABand.tsx",
        lineNumber: 46,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=_17rn26q._.js.map
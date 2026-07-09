# Arquitectura — diana-mile (Milito Life Shop)

Monorepo npm workspaces. E-commerce COD (contraentrega) en Colombia, backend Shopify + Supabase.

## Estructura

```
diana-mile/
├── apps/
│   ├── shop/       # Tienda pública (Next.js 16.2.9) — producto, checkout COD
│   ├── admin/      # Panel admin (dashboard pedidos/leads/config, login Supabase Auth)
│   ├── linktree/   # Linktree de la marca
│   ├── app/        # Scaffold vacío, sin desarrollar
│   └── www/        # Scaffold default de Next, sin desarrollar
├── packages/
│   └── shared/     # @diana-mile/shared — tipos, UI kit (Input/Button/Spinner), utils, clientes Supabase
└── supabase/
    └── migrations/ # SQL: leads, pedidos, config, admins (RLS por service_role)
```

**IMPORTANTE**: `AGENTS.md` en la raíz advierte que Next.js 16.2.9 tiene breaking changes vs. conocimiento de entrenamiento. Leer `node_modules/next/dist/docs/` antes de asumir convenciones de App Router.

**Breaking change confirmado**: `middleware.ts` no existe en esta versión. Es **`proxy.ts`** con export `proxy()` (ver `apps/admin/proxy.ts`, protege `/dashboard/**` y `/api/admin/**` verificando sesión Supabase). Mismo `matcher` config que antes. Si hace falta middleware en otra app, replicar ese patrón, no `middleware.ts`.

## Stack

- Next.js 16.2.9, React 19.2.4, TypeScript 5, Tailwind 4
- Sin librerías de forms/state management — todo con `useState`/Context nativo
- Backend de datos: Supabase (Postgres + Auth), catálogo/checkout: Shopify (Storefront GraphQL + Admin REST)
- `@diana-mile/shared` (workspace package) comparte tipos, UI primitiva y clientes Supabase entre apps

## apps/shop — flujo de datos

- `lib/shopify.ts`: cliente Shopify. `getProducts`/`getProductByHandle` vía Storefront GraphQL API (`2024-01`), con fallback a `MOCK_PRODUCTS` si no hay env vars configuradas. `createShopifyOrder` (Admin REST) crea la orden real; `upsertAbandonedDraftOrder`/`deleteDraftOrder` manejan carritos abandonados como draft orders.
- `app/api/orders/route.ts`: valida input, **recalcula precio en servidor desde el catálogo real** (nunca confía en el precio del body), crea la orden en Shopify, espeja el pedido en tabla `pedidos` de Supabase, y si había un lead de carrito abandonado con ese teléfono lo marca `convertido` y borra el draft order.
- `app/api/leads/carrito/route.ts`: registra lead de carrito abandonado (debounced desde `CODForm`).
- `app/api/products/route.ts`, `app/api/leads/route.ts`: endpoints adicionales de catálogo/leads.

## Componentes clave (producto/checkout)

- **`OrderSheetContext.tsx`** (`components/product/`): contexto global del flujo de compra en la página de producto — variante seleccionada, apertura del sheet de pedido, y el descuento del popup exit-intent (persistido 5 min en `sessionStorage`, key `milito_descuento_expira`). Expone `DISCOUNT_PERCENT` (10%, definido server-side en `lib/pricing.ts`).
- **`ExitIntentPopup.tsx`**: popup de descuento por abandono. Se dispara por: mouseout hacia arriba del viewport, inactividad (35s sin touch/scroll), o cierre del formulario sin completar pedido (`isOpen` pasó a `false` sin `orderCompleted`). Solo se muestra una vez por sesión (`sessionStorage` key `milito_popup_descuento_mostrado`). Countdown de 5 min.
- **`CODForm.tsx`** (`components/form/`): formulario de pedido contraentrega — nombre, teléfono (normalizado a colombiano vía `lib/phone.ts`), departamento/ciudad/barrio (autocompletado desde `lib/colombia.ts`), dirección, geolocalización opcional, checkbox de **envío prioritario** (upsell, `lib/pricing.ts`: $12.000 COP, mapea a variant real de Shopify oculta del storefront). Registra lead de carrito abandonado con debounce de 1.5s mientras el usuario escribe. Al enviar, POST a `/api/orders`.
- `ComparisonSection.tsx` / `NuskinSection.tsx`: comparativa de precio vs. canal Nuskin directo (metafields `nuskin_direct_url`, `nuskin_direct_precio`).

## Supabase — tablas

- `leads` — capturas (incluye carrito abandonado, `fuente='checkout_abandonado'`, `shopify_draft_order_id` para no duplicar el draft)
- `pedidos` — espejo local de las órdenes Shopify (`estado`: pendiente/confirmado/enviado/entregado/devuelto)
- `config` — llave/valor editable desde el admin (lectura pública, escritura solo service_role)
- `admins` — allowlist de `user_id` autorizados al dashboard (Supabase Auth por sí solo NO basta — ver comentario en la migración)
- RLS activo en las 4 tablas; todo el acceso de escritura pasa por `service_role` desde server (`@diana-mile/shared/supabase/server`)

## Styling

Tailwind 4 con tokens custom en `app/globals.css` vía `@theme inline`. Paleta: dorado (lujo, acento principal) + lila/morado (identidad personal de "Mile", acento secundario) sobre base crema/carbon. Fuentes: Cormorant (display) + Inter (sans). Animaciones utilitarias: `cta-pulse`, `btn-shine`, `fade-in-up`, respeta `prefers-reduced-motion`.

## Env vars (`apps/shop/.env.local.example`)

```
SHOPIFY_STORE_DOMAIN / SHOPIFY_STOREFRONT_ACCESS_TOKEN / SHOPIFY_ADMIN_API_TOKEN
NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_WHATSAPP_NUMERO / NEXT_PUBLIC_SITE_URL / NEXT_PUBLIC_LINKTREE_URL
```
Sin estas vars de Shopify, la app corre en modo mock (3 productos hardcodeados, órdenes fake `MOCK-<timestamp>`).

## WIP actual (working tree sucio)

`envio prioritario, popup exit-intent, comparativa` (commit `c76197f`) ya está commiteado — descuento exit-intent + envío prioritario + trigger por cierre de formulario, integrados end-to-end hasta la orden de Shopify y Supabase.

Sin commitear ahora: nuevo componente `components/product/PurchaseNotifications.tsx` (untracked), enganchado en `app/productos/[slug]/page.tsx` justo después de `<ExitIntentPopup />`, con soporte de estilos nuevos en `app/globals.css` (+8 líneas). Notificaciones tipo "fulanito acaba de comprar" — revisar ese componente para ver estado real de la feature antes de seguir.

## apps/admin

Dashboard con login (Supabase Auth) + tablas `LeadsTable`/`OrdersTable`, `StatsCard`, sección `configuracion` (edita tabla `config`). Rutas API bajo `app/api/admin/{config,leads,orders}`.

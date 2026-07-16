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

## Contenido de landing por producto (data-driven)

Cada landing de producto (`app/productos/[slug]/page.tsx`) se arma desde un objeto de contenido resuelto, **no** desde copy hardcodeado. Fuente: metafield JSON `diana_mile.landing_content` de Shopify.

- `lib/product-content.ts` → `resolveLanding(product)` devuelve el contenido final con esta precedencia: **metafield** > preset Epoch (solo si el título matchea `epoch|polishing bar`, conserva la landing actual del producto estrella) > **fallback neutral** derivado de título/descripción. Un producto sin metafield igual renderiza una landing coherente pero sobria (sin afirmaciones inventadas de ingredientes/resultados).
- Los tipos del contenido (`ProductLandingContent`, `Landing*`) viven en `@diana-mile/shared/types`. `lib/shopify.ts` trae el metafield en el query GraphQL y lo parsea en `mapMetafields` (JSON, tolerante a errores → null).
- Cada sección es un componente que recibe su data por props y se **oculta si no hay contenido** (`ResultsTimeline`, `WithoutRitualSection`, `UGCSection`, `IngredientsAccordion`, `SkinTypeSelector`, `ingredientStory` → condicionales en la page).
- **Generación automática**: `scripts/generate-landing.mjs` (`npm run landing:gen -- <handle>` o `-- --all`) lee el producto de Shopify, genera el JSON de la landing con la API de Mistral (`chat/completions`, `response_format: json_object`) y lo guarda en el metafield. El prompt aplica gatillos mentales/sesgos cognitivos mapeados a cada sección (estructura social funnel; ver mapa en `.claude/skills/crear-producto/SKILL.md`) y acepta `--brief docs/briefs/<handle>.md` para inyectar investigación de audiencia/competencia. Crea la definición del metafield con `storefront: PUBLIC_READ` (imprescindible para que la Storefront API lo devuelva). Env: `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_ADMIN_API_TOKEN`, `MISTRAL_API_KEY`, opcional `LANDING_MODEL` (default `mistral-large-latest`).
- **Skill `/crear-producto`** (`.claude/skills/crear-producto/`): flujo completo de alta de producto — investigación de mercado/audiencia → brief psicológico (`docs/briefs/<handle>.md`) → producto en Shopify (DRAFT) → generación de landing con brief → verificación → ACTIVE.

## Categorías (Collections de Shopify)

La tienda organiza el catálogo en 4 categorías — Shopify **Collections manuales** (no smart/tags): `ritual-epoch` (título público "Nuskin"), `rituales-de-piel` (título "Rituales"), `tendencia-milito` (título "Tendencias"), `suplementos-y-bienestar` (título "Suplementos y Bienestar"). Los **handles** los autogenera Shopify a partir del título original al crear la collection y quedan fijos — están hardcodeados en `COLLECTION_HANDLES` (`lib/shopify.ts`). El **título** (`collection.title`) sí se puede renombrar libremente desde Shopify Admin sin romper las rutas, porque `getCollections()`/`getCollectionByHandle()` lo leen dinámicamente — la nav y las páginas de categoría siempre muestran el título actual de Shopify, no el handle.

**Nota de naming**: la categoría "Nuskin" usa el nombre del fabricante (Nu Skin) por decisión explícita del dueño de la tienda, aun sabiendo que puede leerse como aval/asociación oficial que no existe (Milito solo revende el Epoch® Polishing Bar). Riesgo aceptado conscientemente — no es un descuido.

- `lib/shopify.ts` → `getCollections()`/`getCollectionByHandle(handle)` traen las collections vía Storefront GraphQL (productos anidados incluidos), con fallback a `MOCK_COLLECTIONS` si no hay env vars. Mismo tipo de mapeo que productos (`mapCollectionNode`).
- Cada Collection tiene su propio metafield JSON `diana_mile.collection_content` (tipos `Collection`/`CollectionLandingContent` en `@diana-mile/shared/types`) para el hero editorial (eyebrow, tagline, storytelling corto) — mismo patrón de precedencia metafield → fallback neutral que `landing_content` de producto. **Generación automática**: `scripts/generate-collection.mjs` (`npm run collection:gen -- <handle>` o `-- --all`), clon del generador de landings pero para categorías. Mismas env vars (`SHOPIFY_STORE_DOMAIN`, `SHOPIFY_ADMIN_API_TOKEN`, `MISTRAL_API_KEY`).
- Rutas: `app/categorias/page.tsx` (índice, grid de `CategoryCard`) y `app/categorias/[handle]/page.tsx` (hero vía `CategoryHero` + grid de `ProductCard` de los productos de la collection). `SiteHeader`/`SiteFooter` son server components async que llaman `getCollections()` para listar la nav.
- Curaduría inicial: de los productos reales en Shopify (incluida una importación masiva "Liteshop Import" de dropshipping genérico ajena a la marca), se asignó a las 4 collections solo lo que encaja con el posicionamiento premium/skincare (Epoch Polishing Bar, mascarilla bio-colágeno, bases de maquillaje, kit de probióticos). El resto de productos importados (faros de auto, afeitadoras, plantillas, ventilador) quedó fuera de las categorías a propósito.

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

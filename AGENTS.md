<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Convenciones de este repo

## Dependencias

La regla es **cero dependencias nuevas**: el monorepo se sostiene sobre Next,
React, Tailwind y `@supabase/*`. Todo lo demás se escribe a mano.

Excepciones autorizadas, con su motivo:

| Paquete | Dónde | Por qué |
|---|---|---|
| `@dnd-kit/core` + `@dnd-kit/sortable` | `apps/admin` | Arrastrar tarjetas en el pipeline. Autorizado explícitamente por Alexander. Se eligió por accesibilidad de teclado y soporte táctil; escribirlo a mano habría dejado el tablero inutilizable con lector de pantalla. El tablero conserva además un menú "mover a" como camino alternativo. |
| `@measured/puck` (versión exacta, sin `^`) | `apps/admin` (editor) y `apps/shop` (solo `Render`) | Constructor visual drag-and-drop de landings. Autorizado explícitamente por Alexander. Editor con motor grid/flex y render RSC oficial sobre nuestros propios componentes; reimplementar zones/slots a mano quedaría desincronizado del `Data` que produce el editor en cada versión. Ambas apps deben llevar la MISMA versión exacta para que el JSON se renderice idéntico. |

Antes de agregar otra, hay que pedirlo. Si aparece una dependencia en un
`package.json` sin fila en esta tabla, es un error.

## Dinero

- Una sola moneda: **pesos colombianos**. Los porcentajes viajan como fracción
  (`0.20`), nunca como `20`.
- `pedidos.costo_producto` es el costo **unitario** y se congela al crear el
  pedido. Hay que multiplicarlo por `cantidad` al sumarlo.
- `null` en un costo significa *no se sabe*, y nunca puede sustituirse por `0`:
  un cero hace que el producto parezca costeado y con margen completo.
- En contraentrega, **facturar no es recaudar**. Cualquier cálculo de utilidad
  que parta de la facturación está inflado; se parte del recaudo.

## Honestidad del contenido

- Cero testimonios, reseñas o conteos de clientas inventados. Tampoco se
  toman reseñas de terceros de la web y se presentan como propias. Los
  testimonios salen del recolector post-entrega (`testimonios`, aprobados a
  mano y con consentimiento) o no existen.
- Cero antes/después generados o retocados. Solo fotos reales de clientas o
  material oficial de Nu Skin, y en ese caso con la atribución visible.
- Las referencias de layout (`referencias_secciones`) son inspiración de
  composición, nunca de contenido: que una referencia muestre un
  antes/después o una reseña con estrellas no autoriza dibujar una.
- El volumen ("miles de mujeres") se le atribuye a **Nu Skin**, nunca a la
  tienda. La tienda solo reclama lo suyo: contraentrega, cobertura medida,
  acompañamiento.
- Cero urgencia o escasez fabricada. La única urgencia permitida es el corte
  de despacho real.
- Cero afirmaciones de salud sobre suplementos; cero promesas de resultado
  sobre cosmética.
- En lo que ve la clienta la marca es **Milito**, nunca Diana. Los
  identificadores internos (`diana_mile`, `diana-mile`) se quedan como están.
- Estas reglas aplican tal cual a cualquier texto generado por IA
  (ej. `lib/ia/mistral.ts`): un modelo puede reescribir tono, orden y
  énfasis, nunca inventar un hecho, resultado, urgencia o testimonio que no
  venga en la lista de hechos reales que se le pasa. Ver ese archivo para el
  patrón de "lista blanca" — no alcanza con pedirle "no inventes" en el
  prompt, hay que darle un set cerrado de datos y nada más.

## Zona congelada — home y root layout de apps/shop

- **Excepción puntual autorizada (2026-08-02, Alexander):** reposicionamiento
  de Milito de "piel y cuidado personal" a "bienestar y entrenamiento"
  (coincide con su credencial real, ya escrita en `HistoriaMilito.tsx`:
  "entrenadora física y personal de salud"). Se tocaron SOLO 4 líneas de
  `apps/shop/app/page.tsx`: `metadata.title`, `metadata.description`, el
  eyebrow del hero y el subcopy del hero. El H1, los PILARES, la sección
  "Entrena con Milito", `HistoriaMilito` y el cierre no se tocaron. Esto no
  reabre la zona congelada en general — sigue aplicando la regla de abajo
  para cualquier otro cambio futuro.
- `apps/shop/app/page.tsx` (home), `apps/shop/app/layout.tsx` (root layout) y
  cualquier ruta ya existente del sitio de marca Milito **no se tocan**. El
  root layout monta `TrackingScripts`, `RegistroVisita`,
  `ProveedorWhatsApp`, `SiteHeader`, `InstallBanner`, `children`,
  `SiteFooter`, `MobileTabBar` y `BotonWhatsApp` — ese árbol se queda
  exactamente como está. No se crea un segundo root layout ni se usan Route
  Groups para bifurcarlo, aunque Next lo permita técnicamente.
- Cualquier pantalla nueva (por ejemplo las del funnel, o el editor visual)
  que necesite ir full-bleed, sin el header/footer/tabbar de marca, usa el
  mecanismo YA EXISTENTE en `apps/shop/app/globals.css`:

  ```css
  body:has([data-ocultar-header]) #sitio-header, body:has([data-ocultar-header]) #sitio-tabbar { display: none; }
  body:has([data-ocultar-footer]) #sitio-footer { display: none; }
  ```

  La página renderiza `<span data-ocultar-header hidden />` y/o
  `<span data-ocultar-footer hidden />` en su árbol para apagar esas piezas
  del marco. Es la única forma correcta de aislar una pantalla; nunca se
  toca `app/layout.tsx` para lograrlo.
- Código nuevo que no sea el sitio de marca (funnels, herramientas internas,
  editores) vive en su propia carpeta de rutas (ej. `app/(funnel)/`), nunca
  mezclado dentro de las rutas congeladas de arriba.

## Responsive — tráfico de anuncios, mayoría Android gama media

El tráfico paga (Instagram/TikTok Ads) es +90% móvil, mayoritariamente
Android gama media en Colombia/LATAM. Estas reglas son obligatorias para
cualquier pantalla nueva (funnel, formularios, popups, landings) y deseables
al tocar código existente en el camino:

- **Piso 360px**: ninguna pantalla puede producir scroll horizontal a
  360px de ancho. Probar el layout más angosto antes de dar por terminada
  una pantalla.
- **Alto de viewport**: usar `100dvh` / `100svh`, nunca `100vh` — en Android
  con barra de navegación/URL dinámica, `100vh` deja contenido tapado o un
  hueco en blanco.
- **Safe area**: cualquier elemento `fixed`/`sticky` pegado al borde
  superior o inferior de la pantalla debe respetar
  `env(safe-area-inset-top)` / `env(safe-area-inset-bottom)` en su padding o
  posición, como ya hacen `MobileTabBar`, `BotonWhatsApp` y
  `OrderBottomSheet`.
- **Área táctil**: todo elemento interactivo (botón, link con función de
  botón, checkbox/radio, icono clickeable) mide mínimo 44×44px, con al
  menos 8px de separación entre elementos táctiles contiguos. Un `<a>` o
  `<button>` de solo texto también cuenta — se le da suficiente
  padding/min-height, no basta con que el texto "se vea" clickeable.
- **Inputs sin zoom-jack**: todo `input`, `select` y `textarea` lleva
  `font-size` mínimo 16px. Por debajo de eso, iOS Safari hace zoom
  automático al enfocar el campo y rompe el layout (rompe también en algunos
  Android/Chrome). El componente compartido `Input`/`Textarea` en
  `packages/shared/src/ui/Input.tsx` ya usa `text-base` (16px) — no
  achicarlo con un `className` que lo pise.
- **Teclado correcto por campo**: `inputMode`, `type` y `autoComplete`
  deben coincidir con el dato pedido (`type="tel"` + `inputMode="numeric"`
  o `"tel"` para teléfono, `type="email"` para correo,
  `autoComplete="address-level1|level2|line1|line2"` para dirección, etc.).
  No dejar campos de datos estructurados como `type="text"` genérico si
  existe un tipo/inputMode más específico.
- **Cero CLS por imágenes**: toda imagen usa `next/image` con `sizes`
  explícito, dentro de un contenedor con `aspect-ratio` fijo (clases
  `aspect-[…]` o `fill` sobre un contenedor `relative` de alto conocido).
  Nunca una `<img>` sin dimensiones reservadas ni un `next/image` sin
  `sizes`.
- **Video**: cualquier `<video>` con reproducción automática lleva
  `autoPlay`, `muted` y `playsInline` juntos — sin los tres, Android/iOS
  puede bloquear el autoplay o el video se abre a pantalla completa. Un
  video con `controls` (sin autoplay) no necesita `muted`.
- **Movimiento reducido**: toda animación (CSS `@keyframes`, clases
  `animate-*`, transiciones largas) debe respetar
  `prefers-reduced-motion: reduce`, igual que ya hace el bloque
  correspondiente en `apps/shop/app/globals.css`. Una animación nueva que
  vive fuera de ese archivo (ej. un `<style>` inline en un componente) tiene
  que traer su propia guarda `@media (prefers-reduced-motion: reduce)` o
  sumarse a las clases ya cubiertas en globals.css.
- **Server Components por defecto**: una pantalla nueva empieza como Server
  Component. `"use client"` solo se agrega al componente hoja que
  realmente necesita estado, efectos o eventos del navegador — nunca al
  archivo de página completo ni a un componente contenedor solo porque un
  hijo suyo es interactivo.

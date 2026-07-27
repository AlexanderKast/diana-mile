# Rediseño de la tienda — home, categorías y catálogo

**Objetivo:** que Milito Life Shop se vea como una tienda de marca, no como un
catálogo genérico. Alineada con la estética Nu Skin (clínica, luminosa, mucho
aire) y con la identidad Mile (dorado, morado, calidez).

**Restricciones del proyecto** (no negociables, vienen de `AGENTS.md` y del
plan del catálogo): Next.js 16.2.9 · cero dependencias nuevas · animación solo
en CSS y respetando `prefers-reduced-motion` · tokens ya definidos en
`globals.css` · Cormorant Garamond + Inter · mobile-first.

---

## 0. El diagnóstico real

El home y `/categorias` no se ven pobres por el diseño. Se ven pobres porque
están vacíos:

| Categoría | Productos hoy |
|---|---|
| `ritual-epoch` | 1 |
| `rituales-de-piel` | 0 |
| `tendencia-milito` | 2 |
| `suplementos-y-bienestar` | 0 |

Los 39 productos Nu Skin publicados no pertenecen a ninguna colección.
`getProducts()` sólo devuelve lo que está dentro de las colecciones curadas,
así que el home muestra 3 productos y las categorías se ven como tarjetas
huecas. **Ningún rediseño arregla eso.** Primero se llenan las categorías.

---

## 1. Arquitectura de categorías

Las 11 `linea` del catálogo son nomenclatura interna de Nu Skin
("Tratamientos ageLOC", "WellSpa iO"). A una clienta no le dicen nada. La
taxonomía se organiza por **lo que la persona quiere lograr**, no por cómo
Nu Skin ordena su portafolio.

| Categoría | Qué entra | Aprox. |
|---|---|---|
| **Ritual de rostro** | Cuidado Facial, Tratamientos ageLOC, Nu Skin 180, Sunright | ~14 |
| **Tecnología en casa** | LumiSpa iO, WellSpa iO, Galvanic Spa, Boost, cabezales, geles | ~16 |
| **Cuerpo y ducha** | Epoch, Body Shaping Gel, Body iO | ~4 |
| **Bienestar por dentro** | Pharmanex (G3, Collagen, Omega, YouthSpan) | ~5 |
| **Color y detalle** | Nu Colour, AP 24 | ~5 |
| **Kits de inicio** | Los kits que sobrevivan a la limpieza | ~16 |

Cada producto cae en **exactamente una** categoría principal, para que la
navegación no se sienta redundante.

Implementación: colecciones **automáticas** por tag (`ruleSet` sobre
`diana_mile.linea` no es posible — Shopify sólo permite reglas sobre tag,
título, tipo, vendor, precio). Se usa un tag `cat-<slug>` por producto,
escrito por script desde la `linea`. Ventaja: un producto nuevo con su tag
entra solo, sin tocar código ni admin.

---

## 2. Dirección visual

**Concepto: editorial de laboratorio.** Nu Skin es ciencia; Mile es cercanía.
La tensión entre las dos es la marca. Se traduce en:

- **Retícula asimétrica.** Nada de tres tarjetas iguales en fila. Bloques de
  distinto peso, imagen que se sale del margen, texto que respira.
- **Tipografía con jerarquía real.** Cormorant en tamaños grandes de verdad
  (clamp 40-72px) con `letter-spacing` negativo; Inter sólo para cuerpo y
  microtexto, en 15-16px, nunca para titulares.
- **Aire.** Secciones de 96-128px de alto en escritorio. El lujo es el vacío.
- **Color contenido.** Crema y blanco dominan; dorado y morado son acentos,
  no fondos. Cero degradados morados sobre blanco.
- **Movimiento sobrio.** Una sola orquestación al cargar (revelado escalonado
  con `animation-delay`), y estados hover que no rebotan. Nada de parallax.
- **Textura.** Grano sutil y filos dorados de 1px en vez de sombras difusas.

**Lo que se elimina por verse "hecho por IA":** las tres tarjetas de pilares
con ícono-título-párrafo, los placeholders grises, y las estadísticas
"COD / WA / 24-72h" en cajas iguales.

---

## 3. Imágenes

**Fuente primaria: el kit oficial de Nu Skin para distribuidoras**
(`nuskinsocial.smugmug.com`), material autorizado. Del índice ya construido
hay 54 fotos lifestyle/modelo, 43 packshots, 24 de ingredientes y 8 de
textura.

**Nunca** se toman fotos de `nuskin.com` — eso sí está fuera del acuerdo de
distribuidora.

**Generadas con IA** sólo donde no hay persona: texturas, fondos, bodegones
de producto sobre superficie, portadas de categoría abstractas.

**Límite explícito:** no se genera ninguna imagen que represente a Diana ni a
una "clienta". Inventarle una cara a una persona real destruye exactamente la
confianza que sostiene una tienda contraentrega. Esos espacios se rediseñan
para no necesitar persona, o esperan fotos reales.

| Espacio | Origen |
|---|---|
| Hero home | Foto oficial lifestyle + tratamiento editorial |
| Bloques de valor | Se rediseñan sin foto: tipografía y filete dorado |
| Portadas de categoría (6) | Packshot oficial de la categoría, encuadre vertical |
| "Entrena con Diana" | **Pendiente de foto real de Diana** |
| Prueba social | Se rediseña sin foto hasta tener material real |

---

## 4. Orden de ejecución

1. **Tags de categoría + colecciones automáticas** — sin esto el resto no
   tiene qué mostrar.
2. **Portadas de categoría** y metafield `collection_content` de cada una.
3. **Home**: hero, bloques de valor, categorías, destacados, cierre.
4. **`/categorias`** y la página de cada categoría.
5. **Catálogo** `/productos`: afinar el diseño de tarjeta y filtros ya hechos.
6. **QA**: build, 375px, contraste, `prefers-reduced-motion`, Lighthouse.

---

## 5. Riesgos

- Cambiar los handles de las 4 categorías existentes rompe enlaces vivos y
  el SEO que ya tengan. Las nuevas se crean; las viejas se conservan o se
  redirigen, no se borran.
- `COLLECTION_HANDLES` en `apps/shop/lib/shopify.ts` está escrito a mano y
  gobierna qué categorías ve la tienda: hay que actualizarlo en el mismo
  cambio.
- Los productos sin foto siguen en borrador; al publicarlos después hay que
  volver a correr la asignación de tags.

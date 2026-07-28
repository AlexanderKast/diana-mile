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

- Cero testimonios, reseñas o conteos de clientas inventados.
- El volumen ("miles de mujeres") se le atribuye a **Nu Skin**, nunca a la
  tienda. La tienda solo reclama lo suyo: contraentrega, cobertura medida,
  acompañamiento.
- Cero urgencia o escasez fabricada. La única urgencia permitida es el corte
  de despacho real.
- Cero afirmaciones de salud sobre suplementos; cero promesas de resultado
  sobre cosmética.
- En lo que ve la clienta la marca es **Milito**, nunca Diana. Los
  identificadores internos (`diana_mile`, `diana-mile`) se quedan como están.

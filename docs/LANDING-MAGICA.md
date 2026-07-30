# Landing mágica

Genera una landing completa como **secciones-imagen publicitarias**: cada
sección es un PNG vertical con el texto ya dibujado dentro, apiladas borde a
borde, con los bloques transaccionales reales (formulario contraentrega,
corte de despacho, botones de pedido) intercalados entre ellas.

El formulario **nunca** es una imagen: la clienta siempre compra con el
checkout real de la tienda.

## El flujo, de punta a punta

1. **Ángulo de venta** (`/dashboard/productos/<handle>/angulos`) — el
   onboarding del producto: a quién le hablamos, qué dolor resuelve, precios
   reales, personajes, logística. Se guarda y se reutiliza: un ángulo por
   enfoque de mensaje, y cada uno produce una landing distinta para probar
   en pauta.
2. **Copy** — Mistral escribe el texto EXACTO de cada sección a partir del
   ángulo. El admin lo revisa y corrige **antes** de gastar imágenes: es la
   defensa principal contra erratas, porque después el texto queda dibujado.
3. **Imagen** — por cada sección, Gemini (Nano Banana Pro) recibe:
   - una **referencia de layout** tomada al azar de la biblioteca,
   - las **fotos reales del producto** (hasta 3),
   - el copy literal entre comillas,
   - la paleta y las reglas de la marca.
4. **Layout** — `landingMagica()` arma el `puckData`: imágenes en ancho
   sangría + transaccionales reales. Se aplica al lienzo del editor y el
   admin guarda cuando está conforme.

## La biblioteca de referencias

`referencias_secciones` + bucket **privado** `referencias-secciones`.

Son capturas de anuncios que sirven de **inspiración de composición**:
retícula, jerarquía, ritmo visual. El prompt lo dice explícito — "inspírate
en su estructura, pero NO la copies; crea un diseño nuevo adaptado a este
producto" — y prohíbe reproducir su marca, textos, fotos, personas o paleta.

Por eso el bucket es privado y se lee con `download()` del SDK en vez de una
URL firmada: no hay enlace que pueda filtrarse, y la allowlist anti-SSRF del
endpoint sigue cerrada a `cdn.shopify.com`. **Las referencias nunca se
muestran en el editor ni se publican en una landing.**

Cargar o recargar la biblioteca (idempotente):

```
npm run referencias:subir -- "F:\Descargas" --dry     # solo cuenta
npm run referencias:subir -- "F:\Descargas"           # sube y registra
npm run referencias:subir -- "F:\Descargas" --solo hero
```

Apagar una referencia que produce malos resultados, sin borrarla:

```sql
update referencias_secciones set apta = false where id = '<uuid>';
```

El `referencia_id` viaja en la respuesta del endpoint solo para esto
(telemetría); no llega al navegador como imagen.

## Los 11 tipos de sección

| tipo | qué hace |
|---|---|
| `hero` | Gancho: dolor + producto protagonista |
| `oferta` | Precios y packs **reales** |
| `beneficios` | 3-4 beneficios concretos |
| `comparativa` | Comprar con Milito vs. un vendedor cualquiera (modelo de compra, no resultados) |
| `autoridad` | Respaldo real de Nu Skin como fabricante |
| `uso` | 3 pasos simples |
| `sensorial` | Textura y ritual, sin promesa de resultado |
| `testimonios` | Citas **reales aprobadas**, transcritas literales |
| `antes_despues` | Fotos **reales** de clientas o material oficial del fabricante |
| `logistica` | Contraentrega, envío y garantía |
| `faq` | Objeciones frecuentes |

## Las dos secciones que exigen datos reales

`testimonios` y `antes_despues` **no se fabrican**. No es una limitación
técnica: un testimonio inventado o un antes/después generado es publicidad
engañosa (Ley 1480), causal de baneo de la cuenta publicitaria, y contradice
las reglas de `AGENTS.md`.

- **`testimonios`** lee de la tabla `testimonios` (solo `estado='aprobado'` y
  `consentimiento=true`). Se llenan con el recolector post-entrega por
  WhatsApp: a los pocos días de entregado se le pregunta a la clienta cómo le
  fue y **se le pide permiso explícito** para publicar su comentario. Un
  humano modera y aprueba en `/dashboard/testimonios`. Sin testimonios
  aprobados, el endpoint responde 400 explicativo.
- **`antes_despues`** usa las fotos reales del metafield
  `diana_mile.resultados_reales` del producto y/o el material oficial de Nu
  Skin que se cargue en el ángulo (`fotos_antes_despues`), con atribución
  visible cuando es del fabricante. El modelo compone con esas fotos; nunca
  las genera ni las retoca.

## Costos y tiempos

Nano Banana Pro a 2K cuesta ~US$0.13-0.15 por imagen. Una landing de 9-11
secciones sale en **US$1.5-2** con los reintentos típicos, y toma 2-4 minutos
(el wizard genera de a 3 en paralelo para no chocar con los límites de la
API).

## Configuración

| Variable | Dónde | Para qué |
|---|---|---|
| `GEMINI_API_KEY` | `apps/admin` | Generación de imágenes (obligatoria) |
| `GEMINI_IMAGE_MODEL` | `apps/admin` | Opcional: cambiar de modelo sin desplegar |
| `MISTRAL_API_KEY` | `apps/admin` | Copy y prellenado del ángulo |

## Archivos clave

- `apps/admin/lib/gemini-imagen.ts` — cliente REST del modelo de imagen
- `apps/admin/lib/prompt-seccion.ts` — dirección de arte por tipo
- `apps/admin/app/api/admin/productos/[handle]/{copy-secciones,generar-seccion,angulos}/`
- `apps/admin/components/admin/editor/{LandingMagica,AngulosVenta}.tsx`
- `packages/shared/src/landing/{angulo.ts,plantillas.ts}` — contrato y layout final
- `scripts/subir-referencias.mjs` — carga de la biblioteca

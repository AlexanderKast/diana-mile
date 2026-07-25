# Agentes de WhatsApp — Milito Life

Ecosistema: **la app de este repo + Botcake (WABA) + Supabase + Shopify**.
Sin n8n ni servicios de automatización externos: todo es código del repo.

Hay dos cosas distintas trabajando sobre el mismo número de WhatsApp:

1. **Agentes transaccionales** — mandan plantillas aprobadas cuando pasa algo
   con un pedido (se creó, no lo confirman, se despachó).
2. **Agente de IA conversacional** — cuando una persona escribe, le responde
   Milito con conocimiento del área que le están preguntando.

```
        pedido nuevo / guía          ┌──────────────────┐   plantilla   ┌─────────┐
 app ──────────────────────────────▶ │ whatsapp_mensajes│ ────────────▶ │         │
                                     │     (outbox)     │ ◀── cron ──   │ Botcake │
                                     └──────────────────┘  reintentos   │  (WABA) │
                                                                        │         │
        ┌──────────────────────────────────────────────────────────┐    └────┬────┘
        │  /api/admin/webhooks/botcake                             │ ◀───────┘
        │  · botón de plantilla → estado en Supabase + Shopify     │  respuesta
        │  · mensaje libre      → agente de IA responde            │  del cliente
        └──────────────────────────────────────────────────────────┘
```

---

## Parte 1 — Agentes transaccionales

| Agente | Se dispara en | Qué manda |
|---|---|---|
| **Confirmación** | `apps/shop/app/api/orders/complete/route.ts` (junto a Meta CAPI/TikTok) | `confirmacion_de_pedido_nuevo` con nombre, dirección, producto y valor. Botones: confirmar / modificar / asesor |
| **Recordatorio** | cron, pedidos `pendiente` de más de 24h | `recordatorio_confirmacion_milito`. Máximo 2 por pedido, nunca si el cliente ya respondió algo |
| **Envío** | `apps/admin/.../pedidos/[id]/envio` | `pedido_enviado_milito` con número de guía y valor a pagar |

### El outbox (`whatsapp_mensajes`)

Nunca se llama a Botcake directo desde el request del usuario. Se inserta una
fila, se intenta enviar de una, y si falla queda en `fallido` para que el cron
reintente (hasta 3 veces). El API de Botcake devuelve 500 con frecuencia, así
que esto no es opcional. Además deja trazabilidad de todo lo enviado.

**Cron**: `apps/shop/app/api/cron/whatsapp/route.ts`, cada 15 minutos
(`apps/shop/vercel.json`), autenticado con `CRON_SECRET`.

---

## Parte 2 — El agente de IA

Vive en `packages/shared/src/botcake/ia/`. Un solo cerebro con varias
especialidades, no varios bots: la persona siempre habla con Milito.

| Archivo | Qué hace |
|---|---|
| `voz.ts` | El ADN de Milito: tono, límites y los tres objetivos (cierre, comunidad, valor). Lo comparten todos los expertos |
| `expertos.ts` | Las 8 especialidades, con sus pistas de detección |
| `conocimiento/` | Las bases de conocimiento por área |
| `router.ts` | Elige el experto: primero por palabras clave (gratis e instantáneo), y solo si hay duda le pregunta a un modelo chico |
| `contexto.ts` | Inyecta datos **reales**: el pedido de esa persona, el catálogo vivo de Shopify (cache 10 min) y el link de comunidad |
| `conversacion.ts` | Memoria (últimos 12 mensajes), ventana de 24h, interruptor de IA por persona |
| `agente.ts` | Orquesta todo y responde |

### Los expertos

| id | Cuándo entra |
|---|---|
| `general` | Saludos y mensajes ambiguos |
| `tienda` | Precios, productos, cómo comprar, envíos |
| `pedido` | Pedido ya hecho, reclamos → **no vende, escala a un humano** |
| `entrenamiento` | Ejercicio, rutinas, bajar de peso, hábitos |
| `nuskin_negocio` | La oportunidad de negocio, ser afiliada |
| `nuskin_productos` | Epoch, ageLOC, Pharmanex, rutinas de piel |
| `contenido` | Crear contenido, UGC, redes, conseguir marcas |
| `agencia` | Marca que busca creadores, o creadora que se postula |

Agregar un experto nuevo = un archivo en `conocimiento/` y una entrada en
`EXPERTOS`. El router lo toma solo.

### Por qué no alucina

Es el riesgo real de poner una IA a hablar con clientes. Tres barreras:

1. **Los datos duros nunca salen del modelo.** Precios, disponibilidad y estado
   de pedidos se inyectan desde Shopify y Supabase en cada mensaje. Si el dato
   no está, el prompt le ordena decir "lo confirmo y te escribo" en vez de
   inventar.
2. **Límites explícitos en la voz**: no promete curar nada, no da consejo
   médico, no promete ganancias, no inventa promociones. Si alguien menciona
   embarazo, medicación o una condición médica, remite al médico.
3. **Escala en vez de improvisar.** Reclamos, "quiero hablar con alguien" o
   cualquier error del sistema → responde una persona, y le llega push al
   equipo. Ante la duda, humano.

### Probar el agente sin gastar un WhatsApp

```bash
npm run wa:probar                       # 8 casos típicos, uno por área
npm run wa:probar -- "tu mensaje aquí"  # un mensaje puntual
```

Usa el router, los expertos y la voz reales, y muestra qué respondería
Milito y qué experto entró. Es la forma de calibrar el entrenamiento: si
una respuesta no suena a Milito, se pasa de larga o inventa algo, se
ajusta `voz.ts` o el conocimiento de esa área y se vuelve a correr.

### Ventana de 24 horas

WhatsApp solo permite texto libre dentro de las 24h siguientes al último
mensaje **del cliente**. Fuera de esa ventana solo van plantillas aprobadas.
`ultimo_entrante_at` guarda el reloj y el panel muestra si está abierta.
Como el cliente abre la ventana al pulsar un botón de la plantilla de
confirmación, en la práctica casi siempre hay ventana con quien compró.

### Apagar la IA para una persona

En `/dashboard/whatsapp`, botón **Apagar IA**. Cuando alguien del equipo entra
a atender a un cliente, el bot se calla en esa conversación y no vuelve a
escribir hasta que lo prendan.

---

## Panel

`/dashboard/whatsapp` (roles superadmin, admin, confirmador): conversaciones
activas con su tema y ventana, mensajes enviados con estado y error, y las
respuestas de los clientes.

---

## Configuración

### Variables de entorno

| Var | Dónde | Para qué |
|---|---|---|
| `BOTCAKE_WABA_PAGE_ID` | shop + admin | `waba_168254866381327` |
| `BOTCAKE_ACCESS_TOKEN` | shop + admin | Token de página (Botcake → Settings → API) |
| `BOTCAKE_WEBHOOK_SECRET` | admin | Secret propio del webhook entrante |
| `CRON_SECRET` | shop | Autentica el cron de Vercel |
| `MISTRAL_API_KEY` | admin | El agente de IA. **Sin esto la IA no responde** y todo escala a humano |
| `MISTRAL_CHAT_MODEL` | admin | Por defecto `mistral-large-latest` |
| `MISTRAL_ROUTER_MODEL` | admin | Por defecto `mistral-small-latest` (clasificar es barato) |
| `SHOPIFY_STORE_DOMAIN` + `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | admin | Catálogo real para el agente |

### ⚠️ waitUntil en los webhooks

El trabajo posterior a la respuesta va dentro de `waitUntil` de
`@vercel/functions`. Una promesa suelta (`void (async () => …)()`) **se corta**
cuando la función serverless devuelve la respuesta: el webhook contesta 200 y
no procesa nada. Si algún día un webhook responde bien pero no deja rastro en
base de datos ni en logs, mirar esto antes que la lógica de negocio.

### Lo que hay que configurar en Botcake (única parte fuera del repo)

En el flow de la página, agregar un bloque de webhook que haga `POST` a
`https://<dominio-admin>/api/admin/webhooks/botcake` con header
`x-webhook-secret: <BOTCAKE_WEBHOOK_SECRET>` y cuerpo:

```json
{ "telefono": "{{psid}}", "evento": "confirmado", "nombre": "{{full_name}}" }
```

- Botones de plantilla → `evento`: `confirmado`, `modificar`, `anulado` o `asesor`.
- Mensaje libre del cliente → `evento`: `mensaje` más `"texto": "{{last_message}}"`.

---

## Plantillas

| Plantilla | Estado | Agente |
|---|---|---|
| `confirmacion_de_pedido_nuevo` | APPROVED | Confirmación (marca va como variable → "Milito Life") |
| `recordatorio_confirmacion_milito` | PENDING | Recordatorio |
| `pedido_enviado_milito` | PENDING | Envío |
| `disculpas` | APPROVED | Manual |

Los `template_id` viven en `packages/shared/src/botcake/ia/../plantillas.ts`.
Si se recrea una plantilla en Botcake, hay que actualizar el id ahí.

**Ojo**: crear plantillas por API no funciona (Botcake devuelve HTTP 500
siempre). Se crean en la UI de Botcake o en WhatsApp Manager.

---

## Validado con pruebas reales (2026-07-25)

- Se puede **iniciar conversación** con cualquier teléfono usando plantilla: el
  psid es determinístico, `wa_` + número sin `+`. No hace falta que el cliente
  escriba primero.
- El envío de **texto libre** funciona dentro de la ventana de 24h.
- El clasificador por palabras clave acierta el área en los mensajes típicos
  sin gastar un solo token.
- El agente responde con la voz correcta en las 8 áreas (`npm run wa:probar`).
  Dos fugas encontradas y cerradas en esa prueba: inventaba anécdotas
  personales de Diana para conectar, y afirmaba que existían productos que
  no están en el catálogo. Vale la pena volver a correr la prueba cada vez
  que se toque `voz.ts` o el conocimiento.

## Pendiente

- Que Meta apruebe las 2 plantillas en PENDING.
- Configurar el flow de webhook en la UI de Botcake.
- Fase 2: agente de carrito abandonado y de recompra (necesitan plantillas
  MARKETING nuevas).

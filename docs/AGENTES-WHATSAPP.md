# Agentes de WhatsApp — Arquitectura Milito Life

Ecosistema: **app (este repo) + Botcake (WABA Sanavi) + Supabase + Shopify militolife**.
Sin n8n ni servicios externos de automatización: todo es código del repo.

## La idea en una frase

Hoy la confirmación de pedidos es un call center manual en `apps/admin/dashboard/confirmacion`.
Los agentes de WhatsApp automatizan ese trabajo: la app envía plantillas por Botcake en cada
evento del pedido, el cliente responde con botones, y Botcake devuelve la respuesta a la app
por webhook para actualizar el estado en Supabase y Shopify.

```
┌─────────────┐  pedido nuevo   ┌──────────────────┐   plantilla    ┌──────────┐
│  apps/shop   │ ──────────────▶ │  Outbox Supabase │ ─────────────▶ │ Botcake  │
│ (checkout)   │                 │ whatsapp_mensajes│    (API)       │  (WABA)  │
└─────────────┘                 └──────────────────┘                └────┬─────┘
      ▲                                  ▲                               │ botones
      │                                  │ cron reintentos               ▼ cliente
┌─────┴────────┐  actualiza estado  ┌────┴─────────────────────────────────────┐
│   Supabase   │ ◀───────────────── │ apps/admin/api/admin/webhooks/botcake    │
│ pedidos etc. │                    │ (webhook entrante desde flows de Botcake)│
└──────────────┘                    └──────────────────────────────────────────┘
```

## Componentes

### 1. Cliente Botcake — `packages/shared/src/botcake/client.ts`

Wrapper del API público (`https://botcake.io/api/public_api/v1/pages/{PAGE_ID}/…`,
header `access-token`, mismo patrón que `scripts/test-botcake.mjs`). Funciones:

- `buscarClientePorTelefono(telefono)` — resuelve el customer de Botcake
- `enviarPlantilla(customerId, plantilla, variables)` — envía template aprobado
- `enviarFlow(customerId, flowId)`
- `etiquetar(customerId, tagId)` / `actualizarCampos(customerId, campos)`

Se exporta desde `@diana-mile/shared` igual que los clientes de Supabase, para que
shop y admin lo usen sin duplicar código.

### 2. Outbox — tabla `whatsapp_mensajes` (migración nueva)

Nunca se llama a Botcake directo desde el request del usuario: se inserta un registro
en la cola y se intenta enviar. Si Botcake falla (su API devuelve 500 con frecuencia),
un cron reintenta. Trazabilidad completa de todo lo enviado.

```sql
whatsapp_mensajes (
  id, pedido_id?, lead_id?, telefono, tipo,        -- confirmacion | recordatorio | envio | remarketing
  plantilla, variables jsonb, estado,               -- pendiente | enviado | fallido | descartado
  intentos, ultimo_error, enviado_at, created_at
)
whatsapp_eventos (
  id, pedido_id?, telefono, evento,                 -- confirmado | modificar | anulado | mensaje
  payload jsonb, created_at
)
```

### 3. Agentes (automatizaciones)

| Agente | Trigger | Acción |
|---|---|---|
| **Confirmación** | `POST /api/orders/complete` (junto a Meta CAPI/TikTok, mismo `Promise.allSettled`) | Envía `confirmacion_de_pedido_nuevo` con datos del pedido. Botones: confirmar / modificar / asesor |
| **Recordatorio** | Vercel Cron (cada 6h) | Pedidos `pendiente` sin respuesta >24h → `recordatorio_confirmacion_milito` (máx. 2) |
| **Envío** | `POST /api/admin/pedidos/[id]/envio` + webhook Shopify `fulfillments/create` | Envía `pedido_enviado_milito` con número de guía y valor COD |
| **Carrito abandonado** (fase 2) | Vercel Cron | Leads `convertido=false` >2h con teléfono → plantilla MARKETING de remarketing |
| **Recompra** (fase 2) | Vercel Cron | Pedidos `entregado` hace 30 días → oferta de recompra |

Cada agente es un módulo en `apps/admin/lib/agentes/` (o `packages/shared`) con una
sola función pública, activable/desactivable por clave en la tabla `config`
(editable desde el admin, igual que `whatsapp_numero`).

### 4. Webhook entrante — `apps/admin/app/api/admin/webhooks/botcake/route.ts`

Calcado del webhook de Shopify (responder 200 inmediato, procesar en async, verificación
por secret `BOTCAKE_WEBHOOK_SECRET`). Los flows de Botcake (bloques de botones) hacen
POST aquí con `{telefono, evento, pedido}`. Efectos:

- `confirmado` → `pedidos.estado`, fila en `confirmaciones`, tag + nota en la orden Shopify (`agregarTagsOrden`/`agregarNotaOrden` ya existen)
- `modificar` / `anulado` → estado + notificación al admin (web push ya existente)
- Todo evento queda en `whatsapp_eventos`

### 5. Configuración en Botcake (única parte fuera del repo)

- Flow "Confirmación Milito": recibe los botones de las plantillas, etiqueta
  (`CONFIRMADO`, `Modificar Datos`, `Anular Pedido` — tags ya existen) y dispara el
  POST al webhook de la app.
- Los tags y custom fields actuales (Nombre, Dirección, Teléfono, Producto…) se reutilizan.

### 6. Visibilidad en admin

Sección `dashboard/whatsapp`: historial de `whatsapp_mensajes` y `whatsapp_eventos`,
toggles de agentes, y botón de reenvío manual.

## Plantillas WhatsApp (estado 2026-07-25)

| Plantilla | Estado | Uso |
|---|---|---|
| `confirmacion_de_pedido_nuevo` | APPROVED | Agente Confirmación (marca es variable → pasar "Milito Life") |
| `recordatorio_confirmacion_milito` | PENDING | Agente Recordatorio |
| `pedido_enviado_milito` | PENDING | Agente Envío |
| `disculpas` | APPROVED | Manual / recuperación |
| (remarketing carrito) | no existe | Fase 2 — crear en UI de Botcake (su API de creación está rota, HTTP 500) |

## Riesgo técnico a validar primero (spike)

El API público de Botcake opera sobre **customers existentes** (gente que ya escribió).
Para pedidos de la tienda el cliente puede no tener conversación previa. Validar con
la API real si se puede iniciar conversación por teléfono con una plantilla; si no,
el fallback es enviar la plantilla vía el flujo interno de Botcake (bloque "enviar
template" disparado por webhook/integración) o pedirle el número al cliente en el
paso post-checkout ("escríbenos al WhatsApp" con deep-link `wa.me` que ya existe en
`CODForm.tsx` — el primer mensaje del cliente crea el customer y de ahí todo es automático).

## Orden de implementación

1. **Spike**: probar envío de plantilla por teléfono contra la API real (1 pedido de prueba).
2. Migración `whatsapp_mensajes` + `whatsapp_eventos` + cliente Botcake en `packages/shared`.
3. Agente Confirmación enganchado a `orders/complete` + outbox + cron de reintentos.
4. Webhook Botcake entrante + flow de botones en Botcake UI → estados en Supabase/Shopify.
5. Agentes Recordatorio y Envío (cuando Meta apruebe las 2 plantillas PENDING).
6. Sección `dashboard/whatsapp` en admin.
7. Fase 2: carrito abandonado + recompra (plantillas MARKETING nuevas).

## Env vars

| Var | Dónde | Estado |
|---|---|---|
| `BOTCAKE_WABA_PAGE_ID` | shop + admin | existe (`waba_168254866381327`) |
| `BOTCAKE_ACCESS_TOKEN` | shop + admin | existe (token de página) |
| `BOTCAKE_WEBHOOK_SECRET` | admin | **crear** (secret propio para el webhook entrante) |

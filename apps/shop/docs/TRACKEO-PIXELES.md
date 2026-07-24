# Cómo activar el trackeo de pixeles (Meta, TikTok, Google)

Esta guía te explica, paso a paso, cómo conseguir cada código/clave y dónde pegarlo. No necesitas saber programar — solo copiar y pegar donde te digo.

**¿Qué es un "pixel"?** Es un código invisible que le avisa a Meta (Facebook/Instagram), TikTok o Google cada vez que alguien ve un producto, empieza a comprar, o confirma un pedido en tu tienda. Sin eso, cuando pautas anuncios, esas plataformas no saben si tus anuncios están generando ventas reales — están "a ciegas".

Ya dejé todo el código listo en la tienda. Falta que tú consigas las claves de cada plataforma y las pegues en un archivo.

---

## 1. Meta Pixel + Conversions API (Facebook / Instagram)

Necesitas 2 cosas: el **Pixel ID** y un **Access Token**.

1. Entra a [Meta Events Manager](https://business.facebook.com/events_manager2) con tu cuenta de Facebook Business.
2. Si no tienes un pixel creado: clic en "Conectar orígenes de datos" → "Web" → sigue el asistente y ponle un nombre (ej. "Milito Life Shop").
3. Cuando el pixel esté creado, vas a ver un número largo (ej. `123456789012345`) — ese es tu **Pixel ID**. Cópialo.
4. Ahora entra a la pestaña **"Configuración"** de ese mismo pixel.
5. Busca la sección **"Conversions API"** → botón **"Generar token de acceso"**.
6. Copia ese token largo — es tu **Access Token**. Solo se muestra una vez, guárdalo bien.

**Guarda estos 2 valores** para el paso 6 de esta guía (dónde pegarlos).

---

## 2. TikTok Pixel + Events API

Necesitas el **Pixel Code** y un **Access Token**.

1. Entra a [TikTok Ads Manager](https://ads.tiktok.com/) → menú **"Activos"** → **"Eventos"**.
2. Si no tienes un pixel: clic en "Administrar" → "Crear" → "Web" → ponle nombre (ej. "Milito Life Shop").
3. Vas a ver un código como `C4XXXXXXXXXXXX` — ese es tu **Pixel Code**. Cópialo.
4. Dentro del mismo pixel, busca **"Generar token de acceso"** (puede estar en "Configuración" o "API de eventos") — genera y copia el **Access Token**.

Si no lo encuentras fácil, dime y seguimos juntos con capturas de pantalla.

---

## 3. Google Analytics 4 (GA4)

Solo necesitas el **Measurement ID**.

1. Entra a [Google Analytics](https://analytics.google.com/).
2. Si no tienes una propiedad para la tienda: crea una nueva (nombre "Milito Life Shop", zona horaria Colombia, moneda COP).
3. Dentro de la propiedad → **"Administrar"** (ícono de engranaje) → **"Flujos de datos"** → clic en tu flujo web (o crea uno con la URL de la tienda).
4. Arriba vas a ver algo como `G-XXXXXXXXXX` — ese es tu **Measurement ID**. Cópialo.

---

## 4. Google Ads (seguimiento de conversiones)

Necesitas el **ID de conversión** y la **etiqueta**.

1. Entra a [Google Ads](https://ads.google.com/) → menú herramientas (ícono de llave) → **"Conversiones"**.
2. Clic en **"+ Nueva acción de conversión"** → **"Sitio web"**.
3. Configúrala como "Compra" (o "Pedido"), valor de conversión = el valor real de cada pedido (ya está conectado en el código).
4. Al terminar, Google te muestra un fragmento de código con dos partes: `AW-XXXXXXXXX` (**ID**) y una etiqueta larga después de una diagonal, ej. `AW-XXXXXXXXX/AbCdEfGhIj` — la parte después de la `/` es la **etiqueta de conversión**.

---

## 5. Dónde pegar todo

Vas a pegar los 8 valores en un archivo de configuración. Hazlo en dos lugares:

**A) Para probar en tu computador (local):**
Abre el archivo `apps/shop/.env.local` (si no existe, cópialo desde `apps/shop/.env.local.example`) y pega cada valor después del `=`, sin espacios ni comillas. Ejemplo:
```
NEXT_PUBLIC_META_PIXEL_ID=123456789012345
```

**B) Para que funcione en la tienda real (producción):**
Estas mismas variables hay que agregarlas en Vercel (donde está publicada la tienda) → Proyecto → **Settings** → **Environment Variables** → agregar cada una con su nombre y valor. Si quieres, te ayudo a hacerlo cuando tengas las claves listas — dime y las agregamos juntos.

---

## 6. Tabla de referencia (para cuando ya tengas todo)

| Variable | De dónde sale |
|---|---|
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta Events Manager → tu pixel |
| `META_CAPI_ACCESS_TOKEN` | Meta Events Manager → Configuración → Conversions API |
| `META_CAPI_TEST_EVENT_CODE` | Opcional — Meta Events Manager → "Probar eventos" (solo mientras verificas que funciona) |
| `NEXT_PUBLIC_TIKTOK_PIXEL_ID` | TikTok Ads Manager → Eventos → tu pixel |
| `TIKTOK_EVENTS_API_ACCESS_TOKEN` | TikTok Ads Manager → tu pixel → token de acceso |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | Google Analytics → Administrar → Flujos de datos |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | Google Ads → Conversiones → tu acción → parte antes de la `/` |
| `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` | Google Ads → Conversiones → tu acción → parte después de la `/` |

## 7. Cómo saber que ya está funcionando

- **Meta**: instala la extensión de Chrome "Meta Pixel Helper", entra a la tienda, debe ponerse verde.
- **TikTok**: extensión "TikTok Pixel Helper", igual.
- **GA4**: en Google Analytics, ve a "Informes" → "Tiempo real" — entra a la tienda desde otro dispositivo y debes verte ahí en segundos.
- **Google Ads**: en la tabla de "Conversiones" de Google Ads, después de un pedido real, la columna "Estado" pasa de "Sin verificar" a "Registrando conversiones" (puede tardar unas horas).

Qué eventos ya están conectados en el código (no necesitas hacer nada más, solo configurar las claves de arriba):
- **Ver producto** → se dispara al entrar a la página de un producto.
- **Empezar pedido** → se dispara cuando alguien abre el formulario de compra.
- **Compra confirmada** → se dispara cuando el cliente confirma su pedido contraentrega. Este evento se envía dos veces (desde el navegador y desde el servidor) para que no se pierda si alguien tiene bloqueador de anuncios — las plataformas lo reconocen como un solo evento, no se cuenta doble.

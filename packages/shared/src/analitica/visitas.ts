import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";

/**
 * Registro de visitas de TODO el ecosistema (tienda, linktree, www, app).
 *
 * La fuente se deriva AQUÍ, en el servidor, y no en el navegador: el
 * cliente manda los datos crudos (utm, click ids, referrer) y la
 * clasificación vive en un solo lugar que se puede corregir sin esperar
 * a que los navegadores recarguen el script.
 *
 * Orden de la derivación — el más confiable primero:
 *
 *   1. Click id del anuncio (fbclid/ttclid/gclid): además de la fuente
 *      dice que fue PAGO, que el referrer no sabe distinguir.
 *   2. utm_source: lo puso quien armó el enlace, a propósito.
 *   3. Referrer: de dónde venía el navegador. Meta lo manda recortado
 *      (solo el dominio), pero el dominio alcanza para clasificar.
 *   4. Sin nada de lo anterior: directo.
 *
 * El cuerpo viaja como text/plain a propósito: www y app no tienen
 * credenciales de Supabase y publican su visita contra la API de la
 * tienda, cruzando dominio. text/plain es una "simple request" y no
 * dispara preflight de CORS — con application/json el navegador pediría
 * un OPTIONS que nadie contesta y la visita se perdería en silencio.
 */

const SITIOS = new Set(["shop", "linktree", "www", "app"]);

const MEDIOS_PAGO = new Set(["cpc", "ppc", "paid", "ads", "paid_social", "cpm"]);

/** utm_source → fuente normalizada. */
const POR_UTM: [RegExp, string][] = [
  [/^(fb|facebook|meta)$/i, "facebook"],
  [/^(ig|instagram)$/i, "instagram"],
  [/^(tt|tiktok)$/i, "tiktok"],
  [/^(wa|whatsapp)$/i, "whatsapp"],
  [/^(google|adwords|youtube)$/i, "google"],
];

/** Dominio del referrer → fuente. Los propios no cuentan como fuente. */
const POR_DOMINIO: [RegExp, string][] = [
  [/facebook\.com|fb\.com|messenger\.com/i, "facebook"],
  [/instagram\.com/i, "instagram"],
  [/tiktok\.com/i, "tiktok"],
  [/whatsapp\.com|wa\.me/i, "whatsapp"],
  [/google\.|youtube\.com/i, "google"],
  [/militolife\.com/i, "interno"],
];

function dominioDe(referrer: string): string | null {
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function derivarFuente(datos: {
  utmSource?: string | null;
  utmMedium?: string | null;
  referrer?: string | null;
  fbclid?: boolean;
  ttclid?: boolean;
  gclid?: boolean;
}): { fuente: string; medio: "organico" | "pago" } {
  const utm = datos.utmSource?.trim().toLowerCase() ?? "";
  const medioUtm = datos.utmMedium?.trim().toLowerCase() ?? "";
  const referrer = datos.referrer?.trim() ?? "";

  const esPago =
    Boolean(datos.fbclid || datos.ttclid || datos.gclid) ||
    MEDIOS_PAGO.has(medioUtm);

  // 1. Click id de anuncio. El fbclid es de Meta: si el referrer dice
  // Instagram fue Instagram; si no, Facebook — Meta no distingue más.
  if (datos.fbclid) {
    const fuente = /instagram/i.test(referrer) ? "instagram" : "facebook";
    return { fuente, medio: "pago" };
  }
  if (datos.ttclid) return { fuente: "tiktok", medio: "pago" };
  if (datos.gclid) return { fuente: "google", medio: "pago" };

  // 2. utm_source explícito.
  if (utm) {
    for (const [patron, fuente] of POR_UTM) {
      if (patron.test(utm)) return { fuente, medio: esPago ? "pago" : "organico" };
    }
    // Un utm_source desconocido igual es información: se guarda tal cual.
    return { fuente: utm.slice(0, 40), medio: esPago ? "pago" : "organico" };
  }

  // 3. Referrer.
  if (referrer) {
    for (const [patron, fuente] of POR_DOMINIO) {
      if (patron.test(referrer)) return { fuente, medio: "organico" };
    }
    const dominio = dominioDe(referrer);
    if (dominio) return { fuente: dominio.slice(0, 40), medio: "organico" };
  }

  // 4. Nada: llegó escribiendo la URL, desde un marcador, o desde una
  // app que no manda referrer (el navegador interno de WhatsApp suele
  // caer aquí — por eso los enlaces del negocio llevan utm).
  return { fuente: "directo", medio: "organico" };
}

/**
 * El handler POST de /api/visitas, compartido por todas las apps.
 *
 * `sitioPorDefecto` es el de la app dueña de la ruta; el cuerpo puede
 * traer otro (www y app publican contra la tienda), validado contra la
 * lista blanca — es un endpoint público y sin lista cualquiera podría
 * inventar sitios.
 */
export function crearRutaVisitas(sitioPorDefecto: string) {
  return async function POST(request: NextRequest) {
    try {
      // text/plain para esquivar el preflight: se parsea a mano.
      const crudo = await request.text();
      const body = JSON.parse(crudo || "{}") as {
        sitio?: string;
        ruta?: string;
        referrer?: string;
        utm_source?: string;
        utm_medium?: string;
        utm_campaign?: string;
        utm_content?: string;
        fbclid?: boolean;
        ttclid?: boolean;
        gclid?: boolean;
      };

      const sitio =
        body.sitio && SITIOS.has(body.sitio) ? body.sitio : sitioPorDefecto;

      const { fuente, medio } = derivarFuente({
        utmSource: body.utm_source,
        utmMedium: body.utm_medium,
        referrer: body.referrer,
        fbclid: body.fbclid,
        ttclid: body.ttclid,
        gclid: body.gclid,
      });

      await createAdminSupabaseClient()
        .from("visitas")
        .insert({
          sitio,
          fuente,
          medio,
          ruta: body.ruta?.slice(0, 300) ?? null,
          referrer: body.referrer?.slice(0, 500) || null,
          utm_source: body.utm_source?.slice(0, 100) || null,
          utm_medium: body.utm_medium?.slice(0, 100) || null,
          utm_campaign: body.utm_campaign?.slice(0, 200) || null,
          utm_content: body.utm_content?.slice(0, 200) || null,
        });
    } catch (err) {
      console.warn("[visitas] no se pudo registrar:", err);
    }

    // Siempre 204: llega por sendBeacon y nadie lee la respuesta. Un
    // error aquí jamás puede afectar la navegación de la clienta.
    return new NextResponse(null, { status: 204 });
  };
}

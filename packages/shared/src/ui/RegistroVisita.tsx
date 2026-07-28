"use client";

import { useEffect } from "react";

/**
 * Registra la visita en nuestra base — una por sesión, no por página.
 *
 * Va en el layout raíz de CADA página del ecosistema (tienda, linktree,
 * www, app): el pixel de Meta cuenta las visitas en Meta; esto las cuenta
 * aquí, con la fuente (facebook, instagram, tiktok, whatsapp, google,
 * directo) para que la pestaña de métricas pueda decir de dónde llega la
 * gente sin depender de una plataforma externa.
 *
 * Se manda una sola vez por sesión del navegador: contar cada página
 * convertiría el número en páginas vistas y dejaría de medir personas.
 *
 * El cuerpo viaja como text/plain a propósito: www y app no tienen
 * credenciales de base de datos y publican contra la API de la tienda,
 * cruzando dominio. text/plain no dispara preflight de CORS; con
 * application/json la visita cross-origin se perdería en silencio.
 */
const LLAVE = "milito_visita_registrada";

export function RegistroVisita({
  sitio,
  endpoint = "/api/visitas",
}: {
  /** Qué página del ecosistema es esta: shop, linktree, www o app. */
  sitio: "shop" | "linktree" | "www" | "app";
  /** A dónde publicar. Las apps sin base de datos apuntan a la tienda. */
  endpoint?: string;
}) {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(LLAVE)) return;
      sessionStorage.setItem(LLAVE, "1");

      const params = new URLSearchParams(window.location.search);
      const cuerpo = JSON.stringify({
        sitio,
        ruta: window.location.pathname,
        referrer: document.referrer || null,
        utm_source: params.get("utm_source"),
        utm_medium: params.get("utm_medium"),
        utm_campaign: params.get("utm_campaign"),
        utm_content: params.get("utm_content"),
        fbclid: params.has("fbclid"),
        ttclid: params.has("ttclid"),
        gclid: params.has("gclid"),
      });

      // sendBeacon sobrevive a que la pestaña se cierre; fetch keepalive
      // es el respaldo donde no exista.
      const blob = new Blob([cuerpo], { type: "text/plain" });
      if (!navigator.sendBeacon?.(endpoint, blob)) {
        void fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "text/plain" },
          body: cuerpo,
          keepalive: true,
          mode: "no-cors",
        });
      }
    } catch {
      // Medir jamás puede romper la navegación.
    }
  }, [sitio, endpoint]);

  return null;
}

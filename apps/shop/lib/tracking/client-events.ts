"use client";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    ttq?: {
      track: (event: string, data?: Record<string, unknown>) => void;
      identify?: (data: Record<string, unknown>) => void;
    };
    gtag?: (...args: unknown[]) => void;
  }
}

type ContentEvent = {
  contentId: string;
  contentName: string;
  value?: number;
  currency?: string;
};

type PurchaseEvent = {
  eventId: string;
  contentId: string;
  contentName: string;
  value: number;
  currency?: string;
};

/**
 * Todas las funciones de este archivo son "mejor esfuerzo": si un pixel no
 * esta cargado (falta el env var, bloqueador de anuncios, etc.) simplemente
 * no hacen nada — nunca deben romper la compra ni el render.
 */

export function trackViewContent({ contentId, contentName, value, currency = "COP" }: ContentEvent) {
  if (typeof window === "undefined") return;

  window.fbq?.("track", "ViewContent", {
    content_ids: [contentId],
    content_name: contentName,
    content_type: "product",
    value,
    currency,
  });

  window.ttq?.track("ViewContent", {
    content_id: contentId,
    content_name: contentName,
    value,
    currency,
  });

  window.gtag?.("event", "view_item", {
    currency,
    value,
    items: [{ item_id: contentId, item_name: contentName }],
  });
}

export function trackInitiateCheckout({ contentId, contentName, value, currency = "COP" }: ContentEvent) {
  if (typeof window === "undefined") return;

  window.fbq?.("track", "InitiateCheckout", {
    content_ids: [contentId],
    content_name: contentName,
    content_type: "product",
    value,
    currency,
  });

  window.ttq?.track("InitiateCheckout", {
    content_id: contentId,
    content_name: contentName,
    value,
    currency,
  });

  window.gtag?.("event", "begin_checkout", {
    currency,
    value,
    items: [{ item_id: contentId, item_name: contentName }],
  });
}

/**
 * Se dispara al confirmar el pedido (COD) — mismo eventId que el envio
 * server-side (Meta CAPI / TikTok Events API) para que las plataformas
 * deduplique el evento cliente+servidor en vez de contarlo doble.
 */
export function trackPurchase({ eventId, contentId, contentName, value, currency = "COP" }: PurchaseEvent) {
  if (typeof window === "undefined") return;

  window.fbq?.("track", "Purchase", {
    content_ids: [contentId],
    content_name: contentName,
    content_type: "product",
    value,
    currency,
    eventID: eventId,
  });

  window.ttq?.track("CompletePayment", {
    content_id: contentId,
    content_name: contentName,
    value,
    currency,
    event_id: eventId,
  });

  window.gtag?.("event", "purchase", {
    transaction_id: eventId,
    currency,
    value,
    items: [{ item_id: contentId, item_name: contentName }],
  });

  const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  const googleAdsLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;
  if (googleAdsId && googleAdsLabel) {
    window.gtag?.("event", "conversion", {
      send_to: `${googleAdsId}/${googleAdsLabel}`,
      value,
      currency,
      transaction_id: eventId,
    });
  }
}

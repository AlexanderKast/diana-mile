import { sha256Hex } from "@/lib/tracking/hash";

type MetaCapiParams = {
  eventName: "Purchase";
  eventId: string;
  eventSourceUrl: string;
  telefonoE164: string;
  value: number;
  currency?: string;
  fbp?: string;
  fbc?: string;
};

/**
 * Envio server-side a Meta Conversions API — complementa (no reemplaza) el
 * pixel del navegador. Mismo eventId en ambos lados para que Meta
 * deduplique en vez de contar la compra doble. Nunca debe romper el
 * checkout: cualquier error se registra y se ignora.
 */
export async function sendMetaCapiEvent({
  eventName,
  eventId,
  eventSourceUrl,
  telefonoE164,
  value,
  currency = "COP",
  fbp,
  fbc,
}: MetaCapiParams): Promise<void> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !accessToken) return;

  const telefonoDigits = telefonoE164.replace(/\D/g, "");

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        event_source_url: eventSourceUrl,
        action_source: "website",
        user_data: {
          ph: [sha256Hex(telefonoDigits)],
          ...(fbp ? { fbp } : {}),
          ...(fbc ? { fbc } : {}),
        },
        custom_data: {
          currency,
          value,
        },
      },
    ],
    ...(process.env.META_CAPI_TEST_EVENT_CODE
      ? { test_event_code: process.env.META_CAPI_TEST_EVENT_CODE }
      : {}),
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    if (!res.ok) {
      console.warn("[meta-capi] respuesta no ok:", await res.text());
    }
  } catch (err) {
    console.warn("[meta-capi] fallo al enviar evento:", err);
  }
}

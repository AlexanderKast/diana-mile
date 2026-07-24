import { sha256Hex } from "@/lib/tracking/hash";

type TikTokEventParams = {
  eventName: "CompletePayment";
  eventId: string;
  eventSourceUrl: string;
  telefonoE164: string;
  value: number;
  currency?: string;
  ttp?: string;
};

/**
 * Envio server-side a TikTok Events API — complementa el pixel del
 * navegador. Mismo eventId en ambos lados para deduplicar. Nunca debe
 * romper el checkout: cualquier error se registra y se ignora.
 */
export async function sendTikTokEvent({
  eventName,
  eventId,
  eventSourceUrl,
  telefonoE164,
  value,
  currency = "COP",
  ttp,
}: TikTokEventParams): Promise<void> {
  const pixelCode = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;
  const accessToken = process.env.TIKTOK_EVENTS_API_ACCESS_TOKEN;
  if (!pixelCode || !accessToken) return;

  const telefonoDigits = telefonoE164.replace(/\D/g, "");

  const payload = {
    event_source: "web",
    event_source_id: pixelCode,
    data: [
      {
        event: eventName,
        event_id: eventId,
        event_time: Math.floor(Date.now() / 1000),
        user: {
          phone_number: sha256Hex(telefonoDigits),
          ...(ttp ? { ttp } : {}),
        },
        page: { url: eventSourceUrl },
        properties: {
          currency,
          value,
        },
      },
    ],
  };

  try {
    const res = await fetch("https://business-api.tiktok.com/open_api/v1.3/event/track/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": accessToken,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.warn("[tiktok-events] respuesta no ok:", await res.text());
    }
  } catch (err) {
    console.warn("[tiktok-events] fallo al enviar evento:", err);
  }
}

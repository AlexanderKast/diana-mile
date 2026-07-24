import { createHmac, timingSafeEqual } from "crypto";

const TTL_MS = 15 * 60 * 1000;

function secret(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY no configurada.");
  return key;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

/**
 * Token de corta duracion que ata un telefono E.164 a la suscripcion push
 * que se crea justo despues de confirmar un pedido, sin que el usuario
 * tenga sesion todavia. Evita que /api/push/suscribir acepte un telefono
 * arbitrario del body (ver apps/shop/app/api/push/suscribir/route.ts).
 */
export function signTelefonoToken(telefono: string): string {
  const payload = JSON.stringify({ telefono, exp: Date.now() + TTL_MS });
  const payloadB64 = Buffer.from(payload, "utf8").toString("base64url");
  return `${payloadB64}.${sign(payloadB64)}`;
}

export function verifyTelefonoToken(token: string): string | null {
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return null;

  const expected = sign(payloadB64);
  const expectedBuf = Buffer.from(expected, "hex");
  const signatureBuf = Buffer.from(signature, "hex");
  if (
    expectedBuf.length !== signatureBuf.length ||
    !timingSafeEqual(expectedBuf, signatureBuf)
  ) {
    return null;
  }

  try {
    const { telefono, exp } = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8"),
    ) as { telefono?: string; exp?: number };
    if (!telefono || !exp || Date.now() > exp) return null;
    return telefono;
  } catch {
    return null;
  }
}

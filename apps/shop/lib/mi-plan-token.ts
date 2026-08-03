import { createHmac, timingSafeEqual } from "crypto";

// 1 año: quien entro una vez desde su celular no vuelve a ver la pantalla
// de acceso en ese dispositivo — el muro de "revisa tu correo" era el punto
// de fuga del funnel (decision de Alexander, 2026-08-03).
const TTL_MS = 365 * 24 * 60 * 60 * 1000;
const NOMBRE_COOKIE = "milito_mi_plan";

function secret(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY no configurada.");
  return key;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

/**
 * Sesion propia y liviana para /mi-plan — NO es Supabase Auth. Se emite en
 * /api/acceso apenas se guarda la fila de usuarios_plan, sin esperar a que
 * la persona confirme el link magico: la confirmacion de email quedo como
 * conveniencia para entrar desde otro dispositivo, no como pared de acceso
 * (la desercion entre "termine el quiz" y "revise mi correo" era el punto
 * de fuga real del funnel — ver conversacion con Alexander 2026-08-02).
 *
 * Firma HMAC igual que lib/push-token.ts (mismo secreto, mismo esquema
 * payload.firma) — nadie puede fabricar un token valido para un usuarioId
 * ajeno sin conocer SUPABASE_SERVICE_ROLE_KEY. El riesgo que cubre es bajo
 * a proposito: esta cookie solo abre contenido gratuito de /mi-plan, nunca
 * un pago ni un dato sensible — mismo nivel de confianza que ya le dabamos
 * a "cualquier sesion de Supabase Auth por link magico alcanza".
 */
export function signMiPlanToken(usuarioId: string): string {
  const payload = JSON.stringify({ usuarioId, exp: Date.now() + TTL_MS });
  const payloadB64 = Buffer.from(payload, "utf8").toString("base64url");
  return `${payloadB64}.${sign(payloadB64)}`;
}

export function verifyMiPlanToken(token: string): string | null {
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
    const { usuarioId, exp } = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8"),
    ) as { usuarioId?: string; exp?: number };
    if (!usuarioId || !exp || Date.now() > exp) return null;
    return usuarioId;
  } catch {
    return null;
  }
}

export const NOMBRE_COOKIE_MI_PLAN = NOMBRE_COOKIE;

export const OPCIONES_COOKIE_MI_PLAN = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: Math.floor(TTL_MS / 1000),
};

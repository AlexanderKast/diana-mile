import { createHash } from "crypto";

/**
 * Meta CAPI y TikTok Events API exigen que los datos personales (telefono,
 * email) viajen hasheados en SHA-256, nunca en texto plano.
 */
export function sha256Hex(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

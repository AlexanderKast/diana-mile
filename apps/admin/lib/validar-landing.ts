import type {
  LandingBenefitIcon,
  LandingPuckData,
  ProductLandingContent,
} from "@diana-mile/shared/types";
import { TIPOS_BLOQUE } from "@diana-mile/shared/landing/puck-contract";

const ICONOS_VALIDOS: LandingBenefitIcon[] = [
  "gota",
  "mineral",
  "hoja",
  "sol",
  "escudo",
  "planeta",
];

/**
 * Tope de guardado. El metafield JSON de Shopify aguanta ~64KB; se corta en
 * 60KB para dejar margen, y se aplica igual a las variantes de Supabase para
 * que un layout no crezca sin control.
 */
export const LANDING_MAX_BYTES = 60_000;

function esBloqueValido(item: unknown): boolean {
  if (!item || typeof item !== "object") return false;
  const bloque = item as Record<string, unknown>;
  if (typeof bloque.type !== "string" || !TIPOS_BLOQUE.includes(bloque.type)) {
    return false;
  }
  return bloque.props === undefined || typeof bloque.props === "object";
}

/** Valida el shape del layout del constructor visual (Data de Puck). */
function validarPuckData(valor: unknown): valor is LandingPuckData {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) return false;
  const data = valor as Record<string, unknown>;
  if (!data.root || typeof data.root !== "object") return false;
  if (!Array.isArray(data.content)) return false;
  if (!data.content.every(esBloqueValido)) return false;
  if (data.zones !== undefined) {
    if (!data.zones || typeof data.zones !== "object") return false;
    for (const zona of Object.values(data.zones as Record<string, unknown>)) {
      if (!Array.isArray(zona) || !zona.every(esBloqueValido)) return false;
    }
  }
  return true;
}

/**
 * Valida el JSON de una landing (metafield de producto o contenido de una
 * variante del rotador) antes de guardarlo. Compartida por
 * /api/admin/productos/[handle] y /api/admin/landings.
 */
export function validarLandingContent(
  body: unknown,
): body is ProductLandingContent {
  if (!body || typeof body !== "object" || Array.isArray(body)) return false;
  const content = body as ProductLandingContent;
  if (content.benefits) {
    if (!Array.isArray(content.benefits)) return false;
    for (const b of content.benefits) {
      if (!ICONOS_VALIDOS.includes(b.icon)) return false;
    }
  }
  if (content.puckData !== undefined && !validarPuckData(content.puckData)) {
    return false;
  }
  return true;
}

/** true si el JSON serializado supera el tope de guardado. */
export function excedeTamanoLanding(body: unknown): boolean {
  try {
    return JSON.stringify(body).length > LANDING_MAX_BYTES;
  } catch {
    return true;
  }
}

import type {
  LandingBenefitIcon,
  ProductLandingContent,
} from "@diana-mile/shared/types";

const ICONOS_VALIDOS: LandingBenefitIcon[] = [
  "gota",
  "mineral",
  "hoja",
  "sol",
  "escudo",
  "planeta",
];

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
  return true;
}

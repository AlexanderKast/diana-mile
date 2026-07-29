import type { NextRequest } from "next/server";

/** Cookie sticky del rotador: la misma visitante ve siempre la misma variante. */
export const COOKIE_VARIANTE = "ml_landing";
/** Cookie de atribucion: UTMs del clic original que trajo a la visitante. */
export const COOKIE_ATRIB = "ml_attrib";

export type AtribucionUtm = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
};

/** Slug de la variante de landing que origino esta sesion, o null. */
export function leerVarianteCookie(request: NextRequest): string | null {
  return request.cookies.get(COOKIE_VARIANTE)?.value?.slice(0, 100) ?? null;
}

/** UTMs guardadas por /go/ al entrar desde pauta. Nunca lanza. */
export function leerAtribCookie(request: NextRequest): AtribucionUtm {
  const crudo = request.cookies.get(COOKIE_ATRIB)?.value;
  if (!crudo) return {};
  try {
    const json = JSON.parse(crudo) as Record<string, unknown>;
    const texto = (v: unknown) =>
      typeof v === "string" && v ? v.slice(0, 200) : undefined;
    return {
      utm_source: texto(json.us),
      utm_medium: texto(json.um),
      utm_campaign: texto(json.uc),
      utm_content: texto(json.uco),
    };
  } catch {
    return {};
  }
}

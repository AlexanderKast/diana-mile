import type { ZonaOferta } from "@diana-mile/shared/types";

export type PaisOpcion = { codigo: string; nombre: string };

/**
 * Lista minima para el paso tipo "pais", comun a las 5 puertas — no es
 * contenido de una puerta especifica, es infraestructura del tipo de paso
 * en si. Colombia primero porque es el mercado principal de la tienda.
 */
export const PAISES: PaisOpcion[] = [
  { codigo: "CO", nombre: "Colombia" },
  { codigo: "MX", nombre: "México" },
  { codigo: "US", nombre: "Estados Unidos" },
  { codigo: "ES", nombre: "España" },
  { codigo: "AR", nombre: "Argentina" },
  { codigo: "CL", nombre: "Chile" },
  { codigo: "PE", nombre: "Perú" },
  { codigo: "EC", nombre: "Ecuador" },
  { codigo: "PA", nombre: "Panamá" },
  { codigo: "CR", nombre: "Costa Rica" },
  { codigo: "VE", nombre: "Venezuela" },
  { codigo: "OTRO", nombre: "Otro país" },
];

/**
 * Deriva la zona de oferta a partir del pais elegido: contraentrega en COP
 * solo tiene sentido logistico en Colombia; cualquier otro pais ve el plan
 * premium en USD. Mismo criterio documentado en el comentario de
 * `quiz_respuestas.zona_oferta` (ver migracion 20260752000000).
 */
export function zonaOfertaDesdePais(codigo: string | undefined): ZonaOferta {
  return codigo === "CO" ? "co_cod" : "usd_premium";
}

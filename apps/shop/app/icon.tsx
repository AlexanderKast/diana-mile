import { ImageResponse } from "next/og";
import { iconoMilito } from "@/lib/logo-milito";

/**
 * Icono de marca para PWA/favicon. Sin datos ni parametros dinamicos, asi
 * que Next lo genera UNA vez en el build y lo sirve como estatico (cacheado)
 * en produccion — no se regenera por visita. Solo en `next dev` se ve
 * lento, porque ahi no hay cache.
 *
 * El 60% de tamano deja margen (safe zone) alrededor de la marca: Android
 * recorta el icono en circulo/squircle segun el launcher, y sin margen la
 * gota queda guillotinada en esas mascaras.
 */
export function generateImageMetadata() {
  return [
    { contentType: "image/png", size: { width: 192, height: 192 }, id: "192" },
    { contentType: "image/png", size: { width: 512, height: 512 }, id: "512" },
  ];
}

export default async function Icon({ id }: { id: Promise<string | number> }) {
  const iconId = await id;
  const size = iconId === "512" ? 512 : 192;

  return new ImageResponse(iconoMilito(size), { width: size, height: size });
}

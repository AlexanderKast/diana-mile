import { ImageResponse } from "next/og";
import { monogramaMilito } from "@/lib/monograma-milito";

/**
 * Icono de marca para PWA/favicon. Sin datos ni parametros dinamicos, asi
 * que Next lo genera UNA vez en el build y lo sirve como estatico (cacheado)
 * en produccion — no se regenera por visita. Solo en `next dev` se ve
 * lento, porque ahi no hay cache.
 *
 * El monograma deja un margen (safe zone) alrededor de la "M": Android
 * recorta el icono en circulo/squircle segun el launcher, y sin margen la
 * letra queda guillotinada en esas mascaras.
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

  return new ImageResponse(monogramaMilito(size), { width: size, height: size });
}

import { ImageResponse } from "next/og";
import { monogramaMilito } from "@/lib/monograma-milito";

/**
 * apple-touch-icon: lo que iOS usa al agregar la tienda a la pantalla de
 * inicio. 180x180 es el tamano estandar de Apple; sin este archivo, iOS cae
 * a una captura de pantalla recortada en vez del icono de marca.
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(monogramaMilito(180), size);
}

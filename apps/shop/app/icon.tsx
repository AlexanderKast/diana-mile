import { ImageResponse } from "next/og";

/**
 * Icono placeholder para PWA/instalabilidad — monograma simple con los
 * colores de marca. Reemplazar por el logo real cuando este disponible
 * (ver Fase C del rediseno bienestar/app-like).
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

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F2EDE6",
        color: "#A8885E",
        fontFamily: "serif",
        fontSize: size * 0.55,
      }}
    >
      M
    </div>,
    { width: size, height: size },
  );
}

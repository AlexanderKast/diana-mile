import { IconoPlay } from "./icons";

/**
 * "Tu video" del panel. `videoId` sale de SEGMENTOS_PIEL[segmento].videoId,
 * que hoy es `null` para los 7 segmentos (ver piel-prescripcion.ts) — nadie
 * grabo los videos todavia. Cuando exista un id real esto pasa a incrustar
 * el reproductor real (ej. iframe de Bunny/Mux); mientras tanto un
 * placeholder digno, nunca una pantalla rota o un <video> sin fuente.
 *
 * aspect-ratio fijo (16/9) tanto en el placeholder como en el futuro
 * reproductor real: cero CLS al cargar, mismo bloque de espacio siempre.
 */
export function VideoSegmento({ videoId }: { videoId: string | null }) {
  if (!videoId) {
    return (
      <div
        className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-2xl border border-arena bg-crema px-6 text-center"
        role="img"
        aria-label="Video todavia no disponible"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blanco text-dorado-oscuro shadow-sm">
          <IconoPlay />
        </span>
        <p className="text-sm text-carbon-suave">Tu video con Milito llega pronto.</p>
      </div>
    );
  }

  // TODO: reemplazar por el reproductor real cuando exista un video grabado
  // (ej. iframe embebido) — no hay uno funcionando hoy, este branch no se
  // ejecuta todavia porque videoId siempre es null.
  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl border border-arena bg-carbon">
      <iframe
        src={videoId}
        title="Tu video con Milito"
        className="h-full w-full"
        allow="autoplay; fullscreen"
        allowFullScreen
      />
    </div>
  );
}

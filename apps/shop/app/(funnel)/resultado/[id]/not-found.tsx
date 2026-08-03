import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diagnostico no encontrado - Milito Life Shop",
};

/**
 * Boundary de `notFound()` para /resultado/[id] — id que no existe en
 * quiz_respuestas, o una fila que existe pero no es un diagnostico
 * mostrable (test a medias, puerta sin contenido real, segmento
 * desconocido). Vive DENTRO de app/(funnel)/, asi que hereda el layout del
 * funnel (logo, sin header/footer de marca) sin necesidad de repetirlo aca.
 */
export default function ResultadoNoEncontrado() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-5 py-16 text-center">
      <h1 className="font-display text-2xl text-carbon">No encontramos ese diagnostico</h1>
      <p className="text-sm text-carbon-suave">
        El link puede haber expirado o el test quedo a medias. Podes rehacerlo, toma solo un par
        de minutos.
      </p>
      <Link
        href="/test/piel"
        className="btn-shine inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-dorado-oscuro px-6 py-3.5 text-base font-semibold tracking-wide text-blanco shadow-[0_4px_14px_rgba(168,136,94,0.35)] transition-all duration-200 hover:bg-dorado active:scale-[0.97]"
      >
        Rehacer el test de piel
      </Link>
    </div>
  );
}

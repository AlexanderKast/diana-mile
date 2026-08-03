import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Semana no encontrada - Milito Life Shop",
};

/**
 * Boundary de `notFound()` para /mi-plan/semana/[n] — n fuera del rango 1-8.
 * Vive DENTRO de app/(funnel)/, asi que hereda el layout del funnel.
 */
export default function SemanaNoEncontrada() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-5 py-16 text-center">
      <h1 className="font-display text-2xl text-carbon">Esa semana no existe</h1>
      <p className="text-sm text-carbon-suave">Tu plan tiene 8 semanas, de la 1 a la 8.</p>
      <Link
        href="/mi-plan"
        className="btn-shine inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-dorado-oscuro px-6 py-3.5 text-base font-semibold tracking-wide text-blanco shadow-[0_4px_14px_rgba(168,136,94,0.35)] transition-all duration-200 hover:bg-dorado active:scale-[0.97]"
      >
        Volver a tu panel
      </Link>
    </div>
  );
}

import Image from "next/image";
import type { LandingStep } from "../../types";

/**
 * Carrusel/grid de pasos de uso. Mismo markup que la seccion "como-usarlo"
 * del arbol fijo de la PDP, extraido para que el constructor visual lo use
 * como bloque.
 */
export function PasosSection({
  heading,
  steps,
}: {
  heading: string;
  steps: LandingStep[];
}) {
  if (steps.length === 0) return null;
  return (
    <section className="bg-blanco text-carbon py-12 px-6 flex flex-col gap-8">
      <h2 className="font-display text-2xl text-center">{heading}</h2>
      <div
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible"
        style={{ scrollbarWidth: "none" }}
      >
        {steps.map((paso) => (
          <div
            key={paso.numero}
            className="shrink-0 w-[80%] md:w-auto snap-center flex flex-col gap-3 rounded-2xl border border-arena bg-blanco overflow-hidden shadow-[0_1px_3px_rgba(26,23,20,0.08)]"
          >
            {paso.imagen ? (
              <div className="relative aspect-[4/5] w-full">
                <Image
                  src={paso.imagen}
                  alt={`Paso ${paso.numero}: ${paso.titulo}`}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 33vw, 80vw"
                />
                <span className="absolute top-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-dorado-oscuro font-display text-base text-blanco">
                  {paso.numero}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3 px-5 pt-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-dorado-oscuro font-display text-base text-blanco">
                  {paso.numero}
                </span>
              </div>
            )}
            <div className="flex flex-col gap-1.5 p-5 pt-2">
              <h3 className="font-display text-xl text-carbon">{paso.titulo}</h3>
              <p className="text-sm text-carbon-suave">{paso.descripcion}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

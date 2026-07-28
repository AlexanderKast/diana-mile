"use client";

import { useOrderSheet } from "@/components/product/OrderSheetContext";
import type { LandingTestimonial } from "@diana-mile/shared/types";

export function TestimonialsSection({
  productName,
  items,
  heading,
  showUsageStats = false,
  vitrinaHref = null,
}: {
  productName: string;
  items: LandingTestimonial[];
  heading?: string | null;
  showUsageStats?: boolean;
  /**
   * Enlace de WhatsApp para productos de vitrina. Cuando viene, el CTA de
   * cierre lleva a hablar con Diana en vez de abrir el formulario
   * contraentrega — que en esos productos no debe abrirse nunca.
   */
  vitrinaHref?: string | null;
}) {
  const { openOrderSheet } = useOrderSheet();

  if (items.length === 0) return null;

  return (
    <section id="testimonios">
      {showUsageStats && (
        <div className="seccion-joya text-carbon py-8 px-6 text-center">
          <p className="font-display text-2xl">
            Un ritual pensado para uso constante
          </p>
          <p className="mt-1 text-[13px] text-carbon-suave">
            Rostro, cuerpo y rutina semanal segun tu tipo de piel
          </p>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <div>
              <p className="font-display text-3xl text-morado-oscuro">COD</p>
              <p className="text-[11px] text-carbon-suave">Pagas al recibir</p>
            </div>
            <div>
              <p className="font-display text-3xl text-morado-oscuro">24-72h</p>
              <p className="text-[11px] text-carbon-suave">Despacho estimado</p>
            </div>
            <div>
              <p className="font-display text-3xl text-morado-oscuro">WA</p>
              <p className="text-[11px] text-carbon-suave">Soporte directo</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blanco py-12 px-6">
        <h2 className="font-display text-2xl text-carbon text-center mb-6">
          {heading ?? `Antes de pedir ${productName}`}
        </h2>

        <div
          className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:grid md:grid-cols-3 md:overflow-visible md:gap-4"
          style={{ scrollbarWidth: "none" }}
        >
          {items.map((item) => (
            <div
              key={item.title}
              className="min-w-[85%] snap-center flex flex-col gap-3 bg-blanco border border-arena rounded-2xl p-5 md:min-w-0"
            >
              {/* Aqui habia cinco estrellas doradas fijas en cada tarjeta.
                  Nadie las puso: son afirmaciones sobre como se compra
                  ("pagas al recibir", "soporte por WhatsApp"), no
                  valoraciones de nadie. Pintar una calificacion que no
                  existe es la version silenciosa de inventar una resena.
                  Cuando haya reseñas reales, la estrella vuelve con su
                  numero al lado. */}
              <div className="linea-dorada w-8" />
              <p className="text-[14px] font-semibold text-carbon">
                {item.title}
              </p>
              <p className="text-[14px] leading-relaxed text-carbon-suave">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blanco py-8 px-6 text-center">
        <p className="font-display text-xl text-carbon mb-4">
          Lista para empezar tu ritual?
        </p>
        {vitrinaHref ? (
          <a
            href={vitrinaHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-shine mx-auto flex min-h-[48px] w-full max-w-sm items-center justify-center rounded-lg bg-morado px-6 text-blanco text-sm font-medium tracking-wide transition-all duration-200 hover:bg-morado-oscuro hover:scale-[1.02] active:scale-[0.97]"
          >
            Hablar con Diana
          </a>
        ) : (
          <button
            type="button"
            onClick={() => openOrderSheet()}
            className="btn-shine mx-auto flex min-h-[44px] w-full max-w-sm items-center justify-center rounded-lg bg-morado px-6 text-blanco text-sm font-medium tracking-wide transition-all duration-200 hover:bg-morado-oscuro hover:scale-[1.02] active:scale-[0.97]"
          >
            Pedir {productName}
          </button>
        )}
      </div>
    </section>
  );
}

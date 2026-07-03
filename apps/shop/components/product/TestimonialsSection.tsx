"use client";

import { useOrderSheet } from "@/components/product/OrderSheetContext";

type Experience = {
  title: string;
  text: string;
};

const EXPERIENCES: Experience[] = [
  {
    title: "Compra sin anticipo",
    text:
      "El pago contraentrega ayuda a probar el producto sin transferencias previas ni tarjeta.",
  },
  {
    title: "Acompanamiento por WhatsApp",
    text:
      "Si tienes dudas sobre uso, entrega o disponibilidad, puedes confirmar antes de comprar.",
  },
  {
    title: "Rutina simple",
    text:
      "La recomendacion es mantener pocos pasos, constancia y elegir el pack segun frecuencia de uso.",
  },
];

function IconStar() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="var(--dorado)" aria-hidden="true">
      <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.9L10 1.5z" />
    </svg>
  );
}

export function TestimonialsSection({
  productName,
  showUsageStats = false,
}: {
  productName: string;
  showUsageStats?: boolean;
}) {
  const { openOrderSheet } = useOrderSheet();

  return (
    <section id="testimonios">
      {showUsageStats && (
        <div className="seccion-joya text-carbon py-8 px-6 text-center">
          <p className="font-display text-2xl">Un ritual pensado para uso constante</p>
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
          Antes de pedir {productName}
        </h2>

        <div
          className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:grid md:grid-cols-3 md:overflow-visible md:gap-4"
          style={{ scrollbarWidth: "none" }}
        >
          {EXPERIENCES.map((item) => (
            <div
              key={item.title}
              className="min-w-[85%] snap-center flex flex-col gap-3 bg-blanco border border-arena rounded-[8px] p-5 md:min-w-0"
            >
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <IconStar key={i} />
                ))}
              </div>
              <p className="text-[14px] font-semibold text-carbon">{item.title}</p>
              <p className="text-[14px] leading-relaxed text-carbon-suave">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blanco py-8 px-6 text-center">
        <p className="font-display text-xl text-carbon mb-4">Lista para empezar tu ritual?</p>
        <button
          type="button"
          onClick={() => openOrderSheet()}
          className="btn-shine mx-auto flex min-h-[44px] w-full max-w-sm items-center justify-center rounded-[2px] bg-morado px-6 text-blanco text-sm font-medium tracking-wide transition-all duration-200 hover:bg-morado-oscuro hover:scale-[1.02] active:scale-[0.97]"
        >
          Pedir {productName}
        </button>
      </div>
    </section>
  );
}

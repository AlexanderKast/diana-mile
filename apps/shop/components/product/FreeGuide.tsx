"use client";

import { useState } from "react";

function GiftIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="3" y="8" width="14" height="9" rx="1" strokeLinejoin="round" />
      <path d="M3 8h14M10 8v9" strokeLinecap="round" />
      <path d="M10 8C10 8 7 8 6 6.5 5.3 5.4 6 4 7.3 4 9 4 10 8 10 8ZM10 8c0 0 3 0 4-1.5.7-1.1 0-2.5-1.3-2.5C11 4 10 8 10 8Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronIcon({ className, open }: { className?: string; open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={className}
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 200ms" }}
    >
      <path d="M5 7.5l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FreeGuide({ productName }: { productName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="px-6 py-8">
      <div className="mx-auto max-w-2xl rounded-2xl border border-dorado/40 bg-crema p-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0 text-dorado-oscuro">
            <GiftIcon />
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-carbon-suave">Con tu pedido te regalamos:</p>
            <h3 className="font-display text-xl text-carbon">Guía del Ritual Milito Life Shop</h3>
            <p className="text-sm text-carbon-suave">
              Cómo maximizar los resultados de tu {productName} según tu tipo de piel.
            </p>
            <p className="text-xs text-morado-oscuro font-medium">
              Te la enviamos apenas nos confirmes que recibiste tu pedido — un motivo más para avisarnos.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dorado-oscuro py-2.5 text-sm font-semibold text-dorado-oscuro transition-colors hover:bg-dorado-oscuro hover:text-blanco"
        >
          {open ? "Ocultar el adelanto" : "Ver un adelanto de la guía"}
          <ChevronIcon open={open} />
        </button>

        {open && (
          <div className="animate-fade-in-up mt-4 flex flex-col gap-4 border-t border-arena pt-4 text-sm text-carbon-suave">
            <div>
              <p className="font-semibold text-carbon">Rutina de mañana</p>
              <p>
                Humedece la piel con agua tibia. Masajea en círculos por 60 segundos. Enjuaga y aplica tu
                protector solar — la piel recién exfoliada absorbe mejor los activos.
              </p>
            </div>
            <div>
              <p className="font-semibold text-carbon">Rutina de noche</p>
              <p>
                Si usaste maquillaje, haz doble limpieza primero. Masajea 60-90 segundos para una exfoliación
                más profunda y sigue con tu sérum o crema mientras la piel sigue húmeda — así se absorbe mejor.
              </p>
            </div>
            <div>
              <p className="font-semibold text-carbon">Cómo combinarlo</p>
              <p>
                Piel sensible: 3-4 veces por semana. Piel que lo tolera bien: a diario. Evita usarlo el mismo
                día que exfoliantes con ácidos (AHA/BHA) para no sobre-exfoliar. Siempre protector solar de día.
              </p>
            </div>
            <p className="text-xs text-ceniza">
              Esto es solo un adelanto — te enviamos la guía completa por WhatsApp cuando confirmes que ya
              recibiste tu pedido.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

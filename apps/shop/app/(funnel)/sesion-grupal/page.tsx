import type { Metadata } from "next";
import { enlaceConTexto } from "@diana-mile/shared/whatsapp/mensajes";

export const metadata: Metadata = {
  title: "Coaching grupal con Milito — COL$399.000/mes",
};

/**
 * Nivel 2 de la escalera de 3 (ver EscaleraOferta.tsx): coaching grupal de
 * entrenamiento en vivo con Milito, 3 clases por semana, suscripcion
 * mensual cobrada por HOTMART (decision de Alexander — reemplazo el flujo
 * anterior de Mercado Pago, que duplicaba la captura de datos: nuestro
 * formulario pedia nombre/email y el checkout de la pasarela los volvia a
 * pedir). Con Hotmart no capturamos nada: un solo CTA al checkout de
 * Hotmart, que pide los datos UNA vez y maneja el cobro recurrente.
 *
 * `NEXT_PUBLIC_HOTMART_CHECKOUT_URL` es el link del producto en Hotmart
 * (pay.hotmart.com/...). Mientras Alexander no lo configure, el CTA cae a
 * WhatsApp — nunca un boton roto.
 *
 * El precio es el real y unico — cero cupos falsos, cero urgencia
 * fabricada (AGENTS.md, "Honestidad del contenido").
 */
export default function SesionGrupalPage() {
  const hotmartUrl = process.env.NEXT_PUBLIC_HOTMART_CHECKOUT_URL;
  const whatsappHref = enlaceConTexto(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMERO,
    "Hola Milito, quiero unirme al coaching grupal de entrenamiento.",
  );
  const ctaHref = hotmartUrl ?? whatsappHref;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 px-5 pb-28 pt-8">
      <div className="flex flex-col gap-2 text-center">
        <span className="text-xs font-semibold uppercase tracking-wide text-dorado-oscuro">
          Coaching grupal
        </span>
        <h1 className="font-display text-2xl text-carbon">
          Entrená en grupo, en vivo, con Milito
        </h1>
        <p className="text-sm text-carbon-suave">
          3 clases en vivo por semana con Milito, entrenadora física y
          personal de salud — no un plan grabado, acompañamiento real cada
          semana.
        </p>
      </div>

      <ul className="flex flex-col gap-2.5">
        {[
          "3 clases en vivo por semana",
          "Con Milito directamente, en grupo",
          "Cancelas cuando quieras",
        ].map((punto) => (
          <li key={punto} className="flex items-center gap-2.5 text-sm text-carbon">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-dorado-oscuro text-blanco">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 6l2.5 2.5L10 3"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            {punto}
          </li>
        ))}
      </ul>

      <div className="flex flex-col items-center gap-1 rounded-2xl border border-dorado bg-crema p-5 text-center">
        <span className="font-display text-3xl text-carbon">COL$399.000</span>
        <span className="text-sm text-carbon-suave">por mes</span>
      </div>

      <p className="text-center text-xs text-ceniza">
        {hotmartUrl
          ? "El pago se hace una sola vez por Hotmart, con tus datos capturados ahí mismo. Después de suscribirte, Milito te contacta para coordinar tu grupo."
          : "Milito te comparte el link de pago y coordina tu grupo por WhatsApp."}
      </p>

      {/* CTA sticky con el precio a la vista — mismo patron de cierre que
          resultado/[id]: la decision siempre visible sin scroll. */}
      {ctaHref && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-arena bg-blanco/95 px-5 pt-2.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] backdrop-blur">
          <div className="mx-auto flex w-full max-w-md flex-col gap-1.5">
            <p className="text-center text-xs text-carbon-suave">
              COL$399.000/mes — 3 clases en vivo por semana
            </p>
            <a
              href={ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-shine flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-dorado-oscuro px-6 py-3.5 text-base font-semibold tracking-wide text-blanco shadow-[0_4px_14px_rgba(168,136,94,0.35)] transition-all duration-200 hover:bg-dorado active:scale-[0.97]"
            >
              {hotmartUrl ? "Suscribirme" : "Hablar con Milito por WhatsApp"}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import type {
  LandingBenefitIcon,
  ProductLandingContent,
} from "@diana-mile/shared/types";

type LandingPreviewProps = {
  productTitle: string;
  productImageUrl: string | null;
  content: ProductLandingContent;
};

// --- Iconos (mismas formas que apps/shop/components/product/ProductBenefits.tsx) ---

function IconGota() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="M10 2.5c2.8 3.6 5 6.7 5 9.4a5 5 0 11-10 0c0-2.7 2.2-5.8 5-9.4z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconMineral() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="M10 2l5 4-1.6 9.5H6.6L5 6l5-4z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 2v14.5M5 6h10M6.6 15.5L10 9l3.4 6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconHoja() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="M17 3C9 3 3 9 3 17c8 0 14-6 14-14z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 3C11 5 6 10 4 16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconSol() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="10" cy="10" r="3.5" />
      <path
        d="M10 1.5v2M10 16.5v2M18.5 10h-2M3.5 10h-2M15.9 4.1l-1.4 1.4M5.5 14.5l-1.4 1.4M15.9 15.9l-1.4-1.4M5.5 5.5L4.1 4.1"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconEscudo() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="M10 2l6.5 2.5v5c0 4.5-2.9 7.4-6.5 8.5-3.6-1.1-6.5-4-6.5-8.5v-5L10 2z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M7 10l2 2 4-4.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconPlaneta() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="10" cy="10" r="6" />
      <ellipse cx="10" cy="10" rx="9" ry="2.8" />
    </svg>
  );
}
const BENEFIT_ICONS: Record<LandingBenefitIcon, () => React.ReactElement> = {
  gota: IconGota,
  mineral: IconMineral,
  hoja: IconHoja,
  sol: IconSol,
  escudo: IconEscudo,
  planeta: IconPlaneta,
};

function IconStar() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 20 20"
      fill="var(--dorado)"
      aria-hidden="true"
    >
      <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.9L10 1.5z" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 10.5l4 4 8-9" />
    </svg>
  );
}
function IconX() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="5" y1="5" x2="15" y2="15" />
      <line x1="15" y1="5" x2="5" y2="15" />
    </svg>
  );
}
function IconGift() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="3" y="8" width="14" height="9" rx="1" strokeLinejoin="round" />
      <path d="M3 8h14M10 8v9" strokeLinecap="round" />
      <path
        d="M10 8C10 8 7 8 6 6.5 5.3 5.4 6 4 7.3 4 9 4 10 8 10 8ZM10 8c0 0 3 0 4-1.5.7-1.1 0-2.5-1.3-2.5C11 4 10 8 10 8Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Seccion({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <section className={className}>{children}</section>;
}

/**
 * Recrea visualmente, con los mismos tokens de color/tipografia que
 * apps/shop, como se vera la landing del producto. No es la pagina real
 * (para eso esta el link "Ver landing real" una vez guardado) — es un
 * preview en vivo que se actualiza mientras se edita el formulario, sin
 * necesitar que apps/shop este corriendo.
 */
export default function LandingPreview({
  productTitle,
  productImageUrl,
  content,
}: LandingPreviewProps) {
  const [faqAbierta, setFaqAbierta] = useState<number | null>(null);
  const [skinSeleccion, setSkinSeleccion] = useState<string | null>(null);
  const [freeGuideOpen, setFreeGuideOpen] = useState(false);
  const [ingredientesOpen, setIngredientesOpen] = useState(false);

  return (
    <div className="bg-blanco font-sans text-carbon">
      {/* Hero */}
      <Seccion className="px-5 pt-5 pb-6">
        {productImageUrl && (
          <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-xl border border-arena bg-crema">
            <Image
              src={productImageUrl}
              alt={productTitle}
              fill
              className="object-cover"
              sizes="380px"
            />
          </div>
        )}
        <p className="text-[10px] uppercase tracking-wide text-ceniza">
          {content.eyebrow || "Eyebrow de la landing"}
        </p>
        <h1 className="font-display text-[24px] leading-tight text-carbon">
          {productTitle}
        </h1>
        <div className="linea-dorada my-2 w-10" />
        <p className="text-sm text-carbon-suave">
          {content.tagline || "Tagline / promesa del producto"}
        </p>
        {content.authenticity && (
          <span className="mt-3 inline-block rounded-full bg-dorado/15 px-3 py-1 text-[10px] font-semibold text-dorado-oscuro">
            100% original
          </span>
        )}

        {content.skinType && content.skinType.options.length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            <p className="text-sm font-medium text-carbon">
              {content.skinType.question}
            </p>
            <div className="flex flex-wrap gap-2">
              {content.skinType.options.map((op) => (
                <button
                  key={op.id}
                  type="button"
                  onClick={() => setSkinSeleccion(op.id)}
                  className={`rounded-full border-[1.5px] px-3 py-1.5 text-xs font-medium transition-colors ${
                    skinSeleccion === op.id
                      ? "border-morado bg-lila-suave text-morado-oscuro"
                      : "border-arena text-carbon-suave"
                  }`}
                >
                  {op.label || "Opción"}
                </button>
              ))}
            </div>
            {content.skinType.options.find((o) => o.id === skinSeleccion)
              ?.message && (
              <p className="rounded-lg border-l-[3px] border-dorado bg-crema px-3 py-2 text-xs text-carbon-suave">
                ✓{" "}
                {
                  content.skinType.options.find((o) => o.id === skinSeleccion)
                    ?.message
                }
              </p>
            )}
          </div>
        )}

        <button
          type="button"
          className="btn-shine mt-5 flex min-h-[44px] w-full items-center justify-center rounded-lg bg-dorado-oscuro text-sm font-semibold text-blanco"
        >
          Pedir {productTitle} · Contraentrega
        </button>
      </Seccion>

      {content.withoutRitual && (
        <Seccion className="bg-blanco px-5 py-8">
          <h2 className="font-display text-xl text-carbon text-center mb-5">
            {content.withoutRitual.title || "Título sin/con ritual"}
          </h2>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2 rounded-2xl border border-arena bg-crema p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ceniza">
                Sin ritual profundo
              </p>
              {content.withoutRitual.sin.length === 0 && (
                <p className="text-xs text-ceniza">(sin líneas)</p>
              )}
              {content.withoutRitual.sin.map((item, i) => (
                <p
                  key={i}
                  className="flex items-start gap-2 text-xs text-carbon-suave"
                >
                  <span className="mt-0.5 shrink-0 font-bold text-error">
                    ✕
                  </span>
                  {item}
                </p>
              ))}
            </div>
            <div className="flex flex-col gap-2 rounded-2xl border-[1.5px] border-morado bg-lila-suave p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-morado-oscuro">
                {content.withoutRitual.conLabel || `Con el ${productTitle}`}
              </p>
              {content.withoutRitual.con.length === 0 && (
                <p className="text-xs text-ceniza">(sin líneas)</p>
              )}
              {content.withoutRitual.con.map((item, i) => (
                <p
                  key={i}
                  className="flex items-start gap-2 text-xs text-carbon-suave"
                >
                  <span className="mt-0.5 shrink-0 font-bold text-verde-ok">
                    ✓
                  </span>
                  {item}
                </p>
              ))}
            </div>
          </div>
        </Seccion>
      )}

      {content.ingredientStory && (
        <Seccion className="bg-lila-suave px-5 py-8 text-center">
          <h2 className="font-display text-xl text-carbon">
            {content.ingredientStory.title || "Título historia del ingrediente"}
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-carbon-suave">
            {content.ingredientStory.body ||
              "Historia del ingrediente estrella..."}
          </p>
        </Seccion>
      )}

      {(content.benefits?.length ?? 0) > 0 && (
        <Seccion className="px-5 py-8">
          <h2 className="font-display text-xl text-carbon text-center mb-5">
            {content.benefitsHeading || "Beneficios"}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {content.benefits!.map((benefit, i) => {
              const Icon = BENEFIT_ICONS[benefit.icon] ?? IconGota;
              return (
                <div key={i} className="flex flex-col gap-1.5">
                  <span className="text-dorado">
                    <Icon />
                  </span>
                  <p className="text-xs font-semibold text-carbon">
                    {benefit.title || "Beneficio"}
                  </p>
                  <p className="text-xs text-carbon-suave">
                    {benefit.description}
                  </p>
                  {benefit.ciencia && (
                    <p className="text-[10px] text-ceniza underline underline-offset-2">
                      ¿Por qué funciona?
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </Seccion>
      )}

      {(content.ugc?.length ?? 0) > 0 && (
        <Seccion className="px-5 py-8">
          <h2 className="font-display text-xl text-carbon text-center">
            {content.ugcHeading || "Contenido UGC"}
          </h2>
          {content.ugcSubheading && (
            <p className="mt-1 text-center text-[11px] text-ceniza">
              {content.ugcSubheading}
            </p>
          )}
          <div className="mt-5 grid grid-cols-2 gap-3">
            {content.ugc!.map((post, i) => (
              <div
                key={i}
                className={`rounded-2xl p-4 ${i % 2 === 0 ? "bg-lila-suave" : "bg-crema"}`}
              >
                <span className="text-2xl">{post.emoji || "🌙"}</span>
                <p className="mt-1.5 text-[11px] font-semibold text-carbon">
                  {post.title}
                </p>
                <p className="mt-0.5 text-[10px] leading-relaxed text-carbon-suave">
                  {post.text}
                </p>
              </div>
            ))}
          </div>
        </Seccion>
      )}

      {(content.usageSteps?.length ?? 0) > 0 && (
        <Seccion className="bg-blanco px-5 py-8">
          <h2 className="font-display text-xl text-center text-carbon mb-5">
            {content.usageHeading || "Cómo usarlo"}
          </h2>
          <div className="flex flex-col gap-3">
            {content.usageSteps!.map((paso, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-2xl border border-arena p-4"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dorado-oscuro font-display text-sm text-blanco">
                  {paso.numero || i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-carbon">
                    {paso.titulo || "Paso"}
                  </p>
                  <p className="text-xs text-carbon-suave">
                    {paso.descripcion}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Seccion>
      )}

      {(content.resultsTimeline?.length ?? 0) > 0 && (
        <Seccion className="bg-crema px-5 py-8">
          <h2 className="font-display text-xl text-carbon text-center mb-6">
            {content.resultsHeading || "Resultados esperados"}
          </h2>
          <div className="flex flex-col gap-5">
            {content.resultsTimeline!.map((etapa, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-dorado-oscuro" />
                  {i < content.resultsTimeline!.length - 1 && (
                    <span className="mt-1 w-0.5 flex-1 bg-dorado/50" />
                  )}
                </div>
                <div className="flex flex-col gap-0.5 pb-4">
                  <span className="font-display text-base text-dorado-oscuro">
                    {etapa.momento || "Momento"}
                  </span>
                  <p className="text-xs font-semibold text-carbon">
                    {etapa.titulo}
                  </p>
                  <p className="text-xs text-carbon-suave">
                    {etapa.descripcion}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Seccion>
      )}

      {(content.testimonials?.length ?? 0) > 0 && (
        <Seccion className="bg-blanco px-5 py-8">
          <h2 className="font-display text-xl text-carbon text-center mb-5">
            {content.testimonialsHeading || `Antes de pedir ${productTitle}`}
          </h2>
          <div className="flex flex-col gap-3">
            {content.testimonials!.map((item, i) => (
              <div
                key={i}
                className="flex flex-col gap-2 rounded-2xl border border-arena p-4"
              >
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <IconStar key={s} />
                  ))}
                </div>
                <p className="text-xs font-semibold text-carbon">
                  {item.title || "Título"}
                </p>
                <p className="text-xs leading-relaxed text-carbon-suave">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </Seccion>
      )}

      {content.comparison && (
        <Seccion className="bg-crema px-5 py-8">
          <h2 className="font-display text-xl text-carbon text-center mb-5">
            {content.comparison.title || "Comparación"}
          </h2>
          <div className="rounded-2xl border border-arena bg-blanco overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2 border-b border-arena bg-crema px-3 py-2">
              <span />
              <span className="w-12 text-center text-[10px] font-semibold text-dorado-oscuro">
                Nosotros
              </span>
              <span className="w-12 text-center text-[10px] font-semibold text-ceniza">
                Otros
              </span>
            </div>
            {content.comparison.rows.length === 0 && (
              <p className="px-3 py-3 text-xs text-ceniza">(sin filas)</p>
            )}
            {content.comparison.rows.map((fila, i) => (
              <div
                key={i}
                className={`grid grid-cols-[1fr_auto_auto] items-center gap-2 px-3 py-2.5 ${
                  i !== content.comparison!.rows.length - 1
                    ? "border-b border-arena"
                    : ""
                }`}
              >
                <span className="text-xs text-carbon-suave">{fila}</span>
                <span className="flex w-12 justify-center text-dorado-oscuro">
                  <IconCheck />
                </span>
                <span className="flex w-12 justify-center text-ceniza/60">
                  <IconX />
                </span>
              </div>
            ))}
          </div>
        </Seccion>
      )}

      {content.freeGuide && (
        <Seccion className="px-5 py-6">
          <div className="rounded-2xl border border-dorado/40 bg-crema p-4">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 shrink-0 text-dorado-oscuro">
                <IconGift />
              </span>
              <div>
                <p className="text-xs text-carbon-suave">
                  Con tu pedido te regalamos:
                </p>
                <h3 className="font-display text-lg text-carbon">
                  {content.freeGuide.title || "Título de la guía"}
                </h3>
                <p className="text-xs text-carbon-suave">
                  {content.freeGuide.description}
                </p>
              </div>
            </div>
            {content.freeGuide.sections.length > 0 && (
              <button
                type="button"
                onClick={() => setFreeGuideOpen((v) => !v)}
                className="mt-3 w-full rounded-lg border border-dorado-oscuro py-2 text-xs font-semibold text-dorado-oscuro"
              >
                {freeGuideOpen ? "Ocultar el adelanto" : "Ver un adelanto"}
              </button>
            )}
            {freeGuideOpen && (
              <div className="mt-3 flex flex-col gap-2 border-t border-arena pt-3 text-xs text-carbon-suave">
                {content.freeGuide.sections.map((s, i) => (
                  <div key={i}>
                    <p className="font-semibold text-carbon">{s.title}</p>
                    <p>{s.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Seccion>
      )}

      {(content.faqs?.length ?? 0) > 0 && (
        <Seccion className="px-5 py-8">
          <h2 className="font-display text-xl text-carbon text-center mb-4">
            Preguntas frecuentes
          </h2>
          {content.faqs!.map((faq, i) => {
            const abierta = faqAbierta === i;
            return (
              <div key={i} className="border-b border-arena py-3">
                <button
                  type="button"
                  onClick={() => setFaqAbierta(abierta ? null : i)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <span className="pr-3 text-xs font-semibold text-carbon">
                    {faq.question || "Pregunta"}
                  </span>
                  <span className="shrink-0 text-lg font-light text-carbon">
                    {abierta ? "−" : "+"}
                  </span>
                </button>
                {abierta && (
                  <p className="pt-2 text-xs leading-relaxed text-carbon-suave">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </Seccion>
      )}

      {content.ingredients && (
        <Seccion className="px-5 py-6">
          <div className="flex flex-col gap-2 border-t border-arena pt-5">
            <button
              type="button"
              onClick={() => setIngredientesOpen((v) => !v)}
              className="text-left text-xs font-medium text-carbon"
            >
              {ingredientesOpen
                ? "Ver ingredientes completos −"
                : "Ver ingredientes completos +"}
            </button>
            {ingredientesOpen && (
              <p className="text-xs leading-relaxed text-carbon-suave">
                {content.ingredients.inci}
              </p>
            )}
            <p className="text-[10px] text-ceniza">
              {content.ingredients.freeFrom}
            </p>
          </div>
        </Seccion>
      )}

      <Seccion className="seccion-joya px-5 py-10 text-center">
        <h2 className="font-display text-[22px] text-carbon">
          {content.closingHeading || "Título del cierre"}
        </h2>
        <p className="mt-2 text-xs text-carbon-suave">
          Envío contraentrega · Pagas al recibir
        </p>
        <button
          type="button"
          className="btn-shine mt-4 w-full rounded-lg bg-morado py-3 text-sm font-medium text-blanco"
        >
          Empezar mi ritual
        </button>
      </Seccion>
    </div>
  );
}

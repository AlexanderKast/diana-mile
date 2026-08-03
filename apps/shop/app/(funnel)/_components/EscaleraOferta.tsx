import Link from "next/link";
import type { QuizPuerta } from "@/lib/quiz/tipos";
import type { FichaSegmentoProducto } from "@/lib/quiz/puertas/ficha-segmento";

/**
 * Kit de inicio Nu Skin recomendado por puerta — nombre, SKU y precio
 * REALES de la lista de precios oficial Nu Skin Colombia (PDF
 * "CO-lista-de-precios-detallada", precio publico con impuesto). La compra
 * es DIRECTA en Nu Skin (decision de Alexander: este nivel no es
 * contraentrega): el CTA apunta a la tienda Nu Skin de Milito
 * (`NEXT_PUBLIC_NUSKIN_TIENDA_URL`, su link de distribuidora — asi la
 * venta le comisiona a ella). Sin ese env var el boton cae al catalogo
 * propio (contraentrega), nunca a un link roto.
 */
const KIT_NUSKIN_POR_PUERTA: Partial<
  Record<QuizPuerta, { nombre: string; sku: string; precio: string }>
> = {
  piel: {
    nombre: "Kit ageLOC® Piel Radiante",
    sku: "50130372",
    precio: "COL$3.087.000",
  },
  energia: {
    nombre: "Kit Esencial Pharmanex",
    sku: "50130552",
    precio: "COL$859.000",
  },
  peso: {
    nombre: "Kit Belleza & Bienestar",
    sku: "50130478",
    precio: "COL$3.087.000",
  },
};

/**
 * Escalera de 3 niveles que cierra el funnel — reemplaza la seccion 7 vieja
 * de /mi-plan (gateada a `usd_premium`, apuntaba a /coach, un placeholder
 * sin producto real detras) y se reusa tambien en el resultado de la puerta
 * "sesion". Los 3 niveles son fijos, decision de Alexander:
 *
 * 1. Kit de inicio Nu Skin del ritual (solo si hay `ficha` de tipo
 *    "producto") — compra directa en Nu Skin, sin contraentrega.
 * 2. Coaching grupal con Milito, COL$399.000/mes — cobrado por Hotmart
 *    (ver /sesion-grupal).
 * 3. Comunidad gratuita — para quien todavia no esta list@ para comprar.
 *
 * Cero cifras o promesas inventadas (AGENTS.md, "Honestidad del
 * contenido"): precios reales, sin cupos falsos ni urgencia.
 */
export function EscaleraOferta({
  ficha,
  puerta,
  comunidadHref,
}: {
  ficha?: FichaSegmentoProducto | null;
  puerta?: QuizPuerta;
  comunidadHref: string;
}) {
  const kit = puerta ? KIT_NUSKIN_POR_PUERTA[puerta] : undefined;
  const nuskinTiendaUrl = process.env.NEXT_PUBLIC_NUSKIN_TIENDA_URL;
  const compraDirecta = Boolean(kit && nuskinTiendaUrl);

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-lg text-carbon">Elegí tu siguiente paso</h2>
      <div className="flex flex-col gap-3">
        {ficha && (
          <div className="flex flex-col gap-3 rounded-2xl border border-arena p-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-dorado-oscuro">
              Tu ritual recomendado
            </span>
            <ul className="flex flex-col gap-2">
              {ficha.ritual.map((paso) => (
                <li
                  key={paso.categoria}
                  className="flex items-center gap-2 text-sm text-carbon"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-dorado-oscuro" />
                  {paso.categoria}
                </li>
              ))}
            </ul>

            {kit && (
              <div className="rounded-xl border border-dorado bg-crema p-3">
                <p className="text-sm font-semibold text-carbon">{kit.nombre}</p>
                <p className="text-xs text-carbon-suave">
                  Kit de inicio oficial Nu Skin — {kit.precio}
                </p>
              </div>
            )}

            {compraDirecta ? (
              <a
                href={nuskinTiendaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-shine flex min-h-[44px] w-full items-center justify-center rounded-lg bg-dorado-oscuro px-6 py-3 text-sm font-semibold text-blanco shadow-[0_4px_14px_rgba(168,136,94,0.35)] transition-all hover:bg-dorado active:scale-[0.97]"
              >
                Comprar directo en Nu Skin
              </a>
            ) : (
              <Link
                href={ficha.hrefCatalogo}
                className="btn-shine flex min-h-[44px] w-full items-center justify-center rounded-lg bg-dorado-oscuro px-6 py-3 text-sm font-semibold text-blanco shadow-[0_4px_14px_rgba(168,136,94,0.35)] transition-all hover:bg-dorado active:scale-[0.97]"
              >
                Ver productos del ritual
              </Link>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2 rounded-2xl border-2 border-dorado bg-crema p-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-dorado-oscuro">
            Recomendado
          </span>
          <p className="text-sm text-carbon">
            Coaching grupal con Milito — 3 clases en vivo por semana.
          </p>
          <p className="font-display text-2xl text-carbon">
            COL$399.000
            <span className="font-sans text-sm font-normal text-carbon-suave"> /mes</span>
          </p>
          <Link
            href="/sesion-grupal"
            className="btn-shine mt-1 flex min-h-[44px] w-full items-center justify-center rounded-lg bg-dorado-oscuro px-6 py-3 text-sm font-semibold text-blanco shadow-[0_4px_14px_rgba(168,136,94,0.35)] transition-all hover:bg-dorado active:scale-[0.97]"
          >
            Conocer el coaching grupal
          </Link>
        </div>

        <div className="flex flex-col gap-2 rounded-2xl border border-arena p-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-ceniza">
            Sin costo
          </span>
          <p className="text-sm text-carbon">
            Si todavía no es momento de comprar, unite a la comunidad gratuita
            de Milito Life por WhatsApp.
          </p>
          <a
            href={comunidadHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 flex min-h-[44px] w-full items-center justify-center rounded-lg border border-arena px-6 py-3 text-sm font-semibold text-carbon transition-colors hover:bg-crema active:scale-[0.97]"
          >
            Unirme a la comunidad
          </a>
        </div>

        {/* Puerta de ingresos — invitacion suave a la oportunidad de
            distribuidora, en TODOS los funnels (decision de Alexander:
            bienestar + posibilidad de mejorar ingresos). El copy respeta
            nuskin-negocio.ts: cero cifras, cero "pasivo", cero promesa —
            solo invita al test que califica con transparencia. */}
        <div className="flex flex-col gap-2 rounded-2xl border border-arena p-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-ceniza">
            ¿Y si además generas ingresos?
          </span>
          <p className="text-sm text-carbon">
            El bienestar también puede ser tu negocio: conoce cómo funciona
            ser distribuidora Nu Skin — un negocio real de venta, sin
            promesas mágicas. Un test corto te dice si es tu momento.
          </p>
          <Link
            href="/test/negocio"
            className="mt-1 flex min-h-[44px] w-full items-center justify-center rounded-lg border border-arena px-6 py-3 text-sm font-semibold text-carbon transition-colors hover:bg-crema active:scale-[0.97]"
          >
            Hacer el test de negocio
          </Link>
        </div>
      </div>
    </section>
  );
}

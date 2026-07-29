"use client";

import type { Config } from "@measured/puck";
import type {
  LandingBenefit,
  LandingFaq,
  LandingFreeGuideSection,
  LandingSkinTypeOption,
  LandingStep,
  LandingTestimonial,
  LandingTimelineStage,
  LandingUGCPost,
} from "@diana-mile/shared/types";
import { BLOQUES, CATEGORIAS } from "@diana-mile/shared/landing/puck-contract";
import { ProductBenefits } from "@diana-mile/shared/landing/blocks/ProductBenefits";
import { UGCSection } from "@diana-mile/shared/landing/blocks/UGCSection";
import { ComparisonSection } from "@diana-mile/shared/landing/blocks/ComparisonSection";
import { WithoutRitualSection } from "@diana-mile/shared/landing/blocks/WithoutRitualSection";
import { ResultsTimeline } from "@diana-mile/shared/landing/blocks/ResultsTimeline";
import { FAQAccordion } from "@diana-mile/shared/landing/blocks/FAQAccordion";
import { IngredientsAccordion } from "@diana-mile/shared/landing/blocks/IngredientsAccordion";
import { FreeGuide } from "@diana-mile/shared/landing/blocks/FreeGuide";
import { PasosSection } from "@diana-mile/shared/landing/blocks/PasosSection";
import {
  BandaBloque,
  ColumnasBloque,
  DivisorBloque,
  EncabezadoBloque,
  EspaciadorBloque,
  ImagenBloque,
  TextoBloque,
  VideoBloque,
} from "@diana-mile/shared/landing/blocks/Primitivos";
import CampoArchivo from "@/components/admin/editor/CampoArchivo";

/**
 * Datos del producto que el editor pasa como metadata para que los previews
 * acoplados (hero, mosaico...) muestren algo real sin depender del shop.
 */
export type EditorMetadata = {
  titulo: string;
  imagenUrl: string | null;
};

type Meta = { metadata: EditorMetadata };

const lineas = (items: unknown): string[] =>
  Array.isArray(items)
    ? items
        .map((i) => (i && typeof i === "object" ? String((i as { linea?: unknown }).linea ?? "") : ""))
        .filter(Boolean)
    : [];

function bloque(nombre: string, render: (props: never) => React.ReactNode) {
  const base = BLOQUES[nombre];
  return {
    label: base.label,
    fields: base.fields as never,
    ...(base.defaultProps ? { defaultProps: base.defaultProps as never } : {}),
    ...(base.protegido
      ? { permissions: { delete: false, duplicate: false } }
      : {}),
    render: render as never,
  };
}

/** Marco punteado para previews de bloques que en la tienda son "de sistema". */
function Sistema({
  titulo,
  children,
}: {
  titulo: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="border border-dashed border-arena rounded-[4px] p-4 mx-4 my-2 bg-crema/40">
      <p className="text-[10px] uppercase tracking-widest text-ceniza mb-2">
        {titulo} — se ve completo en la tienda
      </p>
      {children}
    </div>
  );
}

function BotonFalso({ etiqueta }: { etiqueta: string }) {
  return (
    <span className="inline-flex items-center justify-center min-h-[40px] px-6 rounded-lg bg-dorado-oscuro text-blanco text-sm font-semibold">
      {etiqueta}
    </span>
  );
}

/**
 * Config del EDITOR: mismos type names, fields y defaults que la config real
 * de la tienda (ambas salen de puck-contract); solo cambian los renders de
 * los bloques acoplados al flujo de compra, que aqui son previews estaticos.
 */
export const configEditor: Config = {
  categories: CATEGORIAS as never,
  components: {
    // ─── Previews de bloques acoplados al shop ───────────────────────────
    HeroCompra: bloque(
      "HeroCompra",
      ({
        eyebrow,
        tagline,
        mostrarGaleria,
        mostrarSellos,
        mostrarFormulario,
        puck,
      }: {
        eyebrow: string;
        tagline: string;
        mostrarGaleria: "si" | "no";
        mostrarSellos: "si" | "no";
        mostrarFormulario: "si" | "no";
        puck: Meta;
      }) => (
        <div
          className={`grid grid-cols-1 ${mostrarGaleria !== "no" ? "md:grid-cols-2" : ""} gap-6 px-6 pt-4`}
        >
          {mostrarGaleria !== "no" &&
            (puck.metadata.imagenUrl ? (
              // El editor no optimiza imagenes: preview simple.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={puck.metadata.imagenUrl}
                alt={puck.metadata.titulo}
                className="w-full aspect-square object-cover rounded-2xl"
              />
            ) : (
              <div className="w-full aspect-square rounded-2xl bg-crema" />
            ))}
          <div className="flex flex-col gap-3">
            {mostrarSellos !== "no" && (
              <div className="flex gap-2 text-[10px] text-ceniza uppercase tracking-wide">
                <span className="border border-arena rounded-full px-2 py-0.5">100% original</span>
                <span className="border border-arena rounded-full px-2 py-0.5">Contraentrega</span>
              </div>
            )}
            {eyebrow && (
              <p className="text-[11px] text-ceniza uppercase tracking-wide">{eyebrow}</p>
            )}
            <h1 className="font-display text-[26px] text-carbon leading-tight">
              {puck.metadata.titulo}
            </h1>
            {tagline && <p className="text-sm text-carbon-suave">{tagline}</p>}
            <BotonFalso etiqueta="Pedir ahora · Contraentrega" />
            {mostrarFormulario !== "no" && (
              <div className="border border-dashed border-arena rounded-2xl p-3">
                <p className="text-xs text-ceniza">
                  Formulario de pedido (resumen, packs y datos) — real en la tienda.
                </p>
              </div>
            )}
          </div>
        </div>
      ),
    ),
    ResumenPedido: bloque("ResumenPedido", () => (
      <Sistema titulo="Formulario de pedido">
        <p className="text-sm text-carbon-suave">
          Resumen del pedido, packs y formulario contraentrega. Colocalo UNA
          sola vez; si ningun bloque lo incluye, la tienda lo agrega al final.
        </p>
      </Sistema>
    )),
    DescripcionShopify: bloque("DescripcionShopify", () => (
      <Sistema titulo="Descripcion del producto (Shopify)">
        <p className="text-sm text-carbon-suave">
          Aqui va la descripcion escrita en Shopify Admin.
        </p>
      </Sistema>
    )),
    ResultadosReales: bloque("ResultadosReales", () => (
      <Sistema titulo="Fotos reales de clientas">
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 w-16 rounded-xl bg-arena" />
          ))}
        </div>
      </Sistema>
    )),
    MosaicoFotos: bloque("MosaicoFotos", () => (
      <Sistema titulo="Mosaico de fotos del producto">
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square rounded-xl bg-arena" />
          ))}
        </div>
      </Sistema>
    )),
    Garantia: bloque("Garantia", () => (
      <Sistema titulo="Garantia">
        <p className="text-sm text-carbon-suave">
          Llega malo o no te funciona? Lo reponemos sin costo adicional.
        </p>
      </Sistema>
    )),
    Comunidad: bloque("Comunidad", () => (
      <Sistema titulo="Comunidad">
        <p className="text-sm text-carbon-suave">Seccion de comunidad Milito.</p>
      </Sistema>
    )),
    NuSkin: bloque("NuSkin", () => (
      <Sistema titulo="Respaldo Nu Skin">
        <p className="text-sm text-carbon-suave">
          Bloque institucional del respaldo de Nu Skin.
        </p>
      </Sistema>
    )),
    BandaCTA: bloque(
      "BandaCTA",
      ({ title, buttonLabel }: { title: string; buttonLabel: string }) => (
        <div className="bg-lila-suave flex flex-col items-center gap-3 py-6 px-6 text-center">
          {title && <p className="font-display text-xl text-carbon max-w-sm">{title}</p>}
          <BotonFalso etiqueta={buttonLabel} />
        </div>
      ),
    ),
    Cierre: bloque("Cierre", ({ heading }: { heading: string }) => (
      <section className="seccion-joya text-carbon py-10 px-6 text-center flex flex-col items-center gap-3">
        <h2 className="font-display text-[28px]">{heading}</h2>
        <p className="text-sm text-carbon-suave">Envio contraentrega - Pagas al recibir</p>
        <BotonFalso etiqueta="Empezar mi ritual" />
      </section>
    )),
    BotonCTA: bloque("BotonCTA", ({ etiqueta }: { etiqueta: string }) => (
      <div className="flex justify-center px-6 py-4">
        <BotonFalso etiqueta={etiqueta} />
      </div>
    )),
    Testimonios: bloque(
      "Testimonios",
      ({ heading, testimonials }: { heading: string; testimonials: LandingTestimonial[] }) => (
        <section className="py-10 px-6 flex flex-col gap-4">
          {heading && (
            <h2 className="font-display text-2xl text-carbon text-center">{heading}</h2>
          )}
          <div className="grid md:grid-cols-2 gap-3">
            {(testimonials ?? []).map((t, i) => (
              <div key={i} className="rounded-2xl border border-arena bg-blanco p-4">
                <p className="font-display text-lg text-carbon">{t.title}</p>
                <p className="text-sm text-carbon-suave">{t.text}</p>
              </div>
            ))}
            {(testimonials ?? []).length === 0 && (
              <p className="text-sm text-ceniza">Sin testimonios — agrega en el panel.</p>
            )}
          </div>
        </section>
      ),
    ),
    TipoDePiel: bloque(
      "TipoDePiel",
      ({ question, options }: { question: string; options: LandingSkinTypeOption[] }) => (
        <div className="px-6 py-4 flex flex-col gap-2">
          <p className="text-sm text-carbon font-medium">{question}</p>
          <div className="flex flex-wrap gap-2">
            {(options ?? []).map((o) => (
              <span key={o.id} className="text-xs border border-arena rounded-full px-3 py-1.5 text-carbon-suave">
                {o.label}
              </span>
            ))}
          </div>
        </div>
      ),
    ),

    // ─── Secciones de marca: componentes REALES (compartidos) ────────────
    Beneficios: bloque(
      "Beneficios",
      ({ heading, benefits }: { heading: string; benefits: LandingBenefit[] }) => (
        <section className="py-12 px-6 flex flex-col gap-6">
          <h2 className="font-display text-2xl text-carbon text-center">{heading}</h2>
          <ProductBenefits benefits={benefits ?? []} />
        </section>
      ),
    ),
    SinRitual: bloque(
      "SinRitual",
      ({ title, conLabel, sin, con }: { title: string; conLabel: string; sin: unknown; con: unknown }) => (
        <WithoutRitualSection data={{ title, conLabel, sin: lineas(sin), con: lineas(con) }} />
      ),
    ),
    Pasos: bloque(
      "Pasos",
      ({ heading, steps }: { heading: string; steps: LandingStep[] }) => (
        <PasosSection heading={heading} steps={steps ?? []} />
      ),
    ),
    LineaTiempo: bloque(
      "LineaTiempo",
      ({ heading, stages }: { heading: string; stages: LandingTimelineStage[] }) => (
        <ResultsTimeline heading={heading} stages={stages ?? []} image={undefined} />
      ),
    ),
    Comparacion: bloque(
      "Comparacion",
      ({ title, rows }: { title: string; rows: unknown }) => (
        <ComparisonSection data={{ title, rows: lineas(rows) }} />
      ),
    ),
    Faqs: bloque("Faqs", ({ faqs }: { faqs: LandingFaq[] }) => (
      <section className="px-6 py-12">
        <FAQAccordion faqs={faqs ?? []} />
      </section>
    )),
    Ugc: bloque(
      "Ugc",
      ({ heading, subheading, posts }: { heading: string; subheading: string; posts: LandingUGCPost[] }) => (
        <UGCSection heading={heading} subheading={subheading} posts={posts ?? []} />
      ),
    ),
    GuiaGratis: bloque(
      "GuiaGratis",
      ({ title, description, sections }: { title: string; description: string; sections: LandingFreeGuideSection[] }) => (
        <FreeGuide data={{ title, description, sections: sections ?? [] }} />
      ),
    ),
    Ingredientes: bloque(
      "Ingredientes",
      ({ inci, freeFrom }: { inci: string; freeFrom: string }) => (
        <section className="px-6 pb-4">
          <IngredientsAccordion ingredients={{ inci, freeFrom }} />
        </section>
      ),
    ),
    HistoriaIngrediente: bloque(
      "HistoriaIngrediente",
      ({ title, body }: { title: string; body: string }) => (
        <section className="bg-lila-suave py-12 px-6 flex flex-col items-center gap-6 text-center">
          <h2 className="font-display text-[28px] text-carbon max-w-md">{title}</h2>
          <p className="text-sm text-carbon-suave leading-relaxed max-w-md">{body}</p>
        </section>
      ),
    ),

    // ─── Primitivos (identicos a la tienda) ──────────────────────────────
    Encabezado: bloque(
      "Encabezado",
      (props: React.ComponentProps<typeof EncabezadoBloque>) => (
        <EncabezadoBloque {...props} />
      ),
    ),
    Texto: bloque("Texto", (props: React.ComponentProps<typeof TextoBloque>) => (
      <TextoBloque {...props} />
    )),
    Imagen: {
      ...bloque("Imagen", (props: React.ComponentProps<typeof ImagenBloque>) => (
        <ImagenBloque {...props} />
      )),
      // Al subir/cambiar la imagen se mide su proporcion real (ancho/alto)
      // y se guarda con el bloque: la tienda la muestra completa en su
      // formato original (1:1, 4:5, 9:16...), sin recortes.
      resolveData: (async (
        data: { props: Record<string, unknown> },
        params: { changed: Record<string, boolean | undefined> },
      ) => {
        const url = data.props.url as string | undefined;
        if (!params.changed.url || !url) return { props: data.props };
        const proporcion = await new Promise<number>((resolve) => {
          const imagen = new window.Image();
          imagen.onload = () =>
            resolve(
              imagen.naturalHeight > 0
                ? Number((imagen.naturalWidth / imagen.naturalHeight).toFixed(4))
                : 0,
            );
          imagen.onerror = () => resolve(0);
          imagen.src = url;
        });
        return { props: { ...data.props, proporcion } };
      }) as never,
      // En el editor la URL se llena SUBIENDO el archivo (va directo al CDN
      // de Shopify); la prop sigue siendo un string — mismo shape que la
      // config de la tienda.
      fields: {
        ...BLOQUES.Imagen.fields,
        url: {
          type: "custom",
          label: "Imagen",
          render: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
            <CampoArchivo value={value ?? ""} onChange={onChange} tipo="imagen" />
          ),
        },
      } as never,
    },
    Video: {
      ...bloque("Video", (props: React.ComponentProps<typeof VideoBloque>) => (
        <VideoBloque {...props} />
      )),
      fields: {
        ...BLOQUES.Video.fields,
        url: {
          type: "custom",
          label: "Video",
          render: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
            <CampoArchivo value={value ?? ""} onChange={onChange} tipo="video" />
          ),
        },
        poster: {
          type: "custom",
          label: "Imagen de portada (opcional)",
          render: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
            <CampoArchivo value={value ?? ""} onChange={onChange} tipo="imagen" />
          ),
        },
      } as never,
    },
    Columnas: bloque(
      "Columnas",
      (props: React.ComponentProps<typeof ColumnasBloque>) => (
        <ColumnasBloque {...props} />
      ),
    ),
    Banda: bloque("Banda", (props: React.ComponentProps<typeof BandaBloque>) => (
      <BandaBloque {...props} />
    )),
    Espaciador: bloque(
      "Espaciador",
      (props: React.ComponentProps<typeof EspaciadorBloque>) => (
        <EspaciadorBloque {...props} />
      ),
    ),
    Divisor: bloque("Divisor", () => <DivisorBloque />),
  },
};

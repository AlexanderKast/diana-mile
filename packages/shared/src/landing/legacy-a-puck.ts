import type { LandingPuckData, ProductLandingContent } from "../types";

/**
 * Siembra el canvas del constructor visual desde el contenido clasico de una
 * landing (los 22 campos de ProductLandingContent), en el MISMO orden del
 * arbol fijo de la PDP. Al abrir una landing sin `puckData`, el editor
 * muestra esto prellenado; nada se guarda hasta que se guarde.
 *
 * Tambien lo usa el generador IA: su salida es ProductLandingContent y pasa
 * por aqui para volverse canvas.
 */

const aLineas = (items?: string[]) =>
  (items ?? []).map((linea) => ({ linea }));

export function legacyAPuck(content: ProductLandingContent): LandingPuckData {
  let n = 0;
  const bloque = (
    type: string,
    props: Record<string, unknown> = {},
  ): Record<string, unknown> => ({
    type,
    props: { id: `${type}-${++n}`, ...props },
  });

  const contenido: Array<Record<string, unknown>> = [];

  // Hero siempre: es el bloque protegido con el primer CTA.
  contenido.push(
    bloque("HeroCompra", {
      eyebrow: content.eyebrow ?? "",
      tagline: content.tagline ?? "",
    }),
  );

  if (content.skinType && content.skinType.options.length > 0) {
    contenido.push(bloque("TipoDePiel", content.skinType));
  }

  if (content.withoutRitual) {
    contenido.push(
      bloque("SinRitual", {
        title: content.withoutRitual.title,
        conLabel: content.withoutRitual.conLabel,
        sin: aLineas(content.withoutRitual.sin),
        con: aLineas(content.withoutRitual.con),
      }),
    );
  }

  if (content.benefits && content.benefits.length > 0) {
    contenido.push(
      bloque("Beneficios", {
        heading: content.benefitsHeading ?? "Beneficios",
        benefits: content.benefits,
      }),
    );
  }

  if (content.usageSteps && content.usageSteps.length > 0) {
    contenido.push(
      bloque("Pasos", {
        heading: content.usageHeading ?? "Como usarlo",
        steps: content.usageSteps,
      }),
    );
  }

  if (content.resultsTimeline && content.resultsTimeline.length > 0) {
    contenido.push(
      bloque("LineaTiempo", {
        heading: content.resultsHeading ?? "Resultados que se sienten",
        stages: content.resultsTimeline,
      }),
    );
  }

  contenido.push(bloque("ResultadosReales"));
  contenido.push(bloque("DescripcionShopify"));

  if (content.ingredientStory) {
    contenido.push(bloque("HistoriaIngrediente", content.ingredientStory));
  }

  if (content.ingredients) {
    contenido.push(bloque("Ingredientes", content.ingredients));
  }

  contenido.push(
    bloque("Testimonios", {
      heading: content.testimonialsHeading ?? "",
      testimonials: content.testimonials ?? [],
    }),
  );

  if (content.ugc && content.ugc.length > 0) {
    contenido.push(
      bloque("Ugc", {
        heading: content.ugcHeading ?? "",
        subheading: content.ugcSubheading ?? "",
        posts: content.ugc,
      }),
    );
  }

  contenido.push(bloque("MosaicoFotos"));

  if (content.comparison) {
    contenido.push(
      bloque("Comparacion", {
        title: content.comparison.title,
        rows: aLineas(content.comparison.rows),
      }),
    );
  }

  contenido.push(bloque("Garantia"));
  contenido.push(bloque("Comunidad"));
  contenido.push(bloque("BandaCTA"));

  if (content.faqs && content.faqs.length > 0) {
    contenido.push(bloque("Faqs", { faqs: content.faqs }));
  }

  if (content.freeGuide) {
    contenido.push(bloque("GuiaGratis", content.freeGuide));
  }

  contenido.push(bloque("NuSkin"));
  contenido.push(
    bloque("Cierre", {
      heading: content.closingHeading ?? "Tu ritual te espera",
    }),
  );

  return { root: { props: {} }, content: contenido };
}

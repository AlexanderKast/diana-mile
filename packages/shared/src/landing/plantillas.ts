import type { LandingPuckData } from "../types";

/**
 * Plantillas de layout curadas: puntos de partida probados para armar una
 * landing en minutos. Los textos son genericos a proposito — se editan en
 * el canvas (o se rellenan con el generador IA despues de aplicarla).
 */

type Plantilla = {
  id: string;
  nombre: string;
  descripcion: string;
  construir: () => LandingPuckData;
};

function fabrica(
  bloques: Array<[string, Record<string, unknown>?]>,
): LandingPuckData {
  let n = 0;
  return {
    root: { props: {} },
    content: bloques.map(([type, props]) => ({
      type,
      props: { id: `${type}-p${++n}`, ...(props ?? {}) },
    })),
  };
}

/** Una seccion-imagen generada por "Landing magica". */
export type SeccionImagen = {
  tipo: string;
  url: string;
  width: number;
  height: number;
  titular: string;
};

/** Orden canonico de las secciones-imagen en la landing final. */
const ORDEN_SECCIONES = [
  "hero",
  "oferta",
  "beneficios",
  "comparativa",
  "autoridad",
  "uso",
  "sensorial",
  "logistica",
  "faq",
];

/**
 * Arma el layout de "Landing magica": las secciones-imagen apiladas en
 * sangria (borde a borde) con los bloques transaccionales REALES
 * intercalados — el formulario, el corte de despacho y los botones nunca
 * son imagenes. Los transaccionales se insertan relativos a las secciones
 * presentes, asi que generar solo algunas sigue produciendo una landing
 * completa y comprable.
 */
export function landingMagica(imagenes: SeccionImagen[]): LandingPuckData {
  const porTipo = new Map(imagenes.map((s) => [s.tipo, s]));
  const bloques: Array<[string, Record<string, unknown>?]> = [
    // Hero transaccional compacto: titulo + precio + CTA; el formulario se
    // abre en popup para no competir con la imagen hero generada.
    ["HeroCompra", { mostrarGaleria: "no", mostrarFormulario: "popup" }],
  ];

  const imagen = (s: SeccionImagen): [string, Record<string, unknown>] => [
    "Imagen",
    {
      url: s.url,
      alt: s.titular,
      ancho: "sangria",
      proporcion:
        s.width > 0 && s.height > 0
          ? Number((s.width / s.height).toFixed(4))
          : 0.75,
    },
  ];

  for (const tipo of ORDEN_SECCIONES) {
    const seccion = porTipo.get(tipo);
    if (!seccion) continue;

    // El formulario incrustado va ANTES de la imagen de FAQ (cierre del
    // funnel); si no hay FAQ, se agrega al final del recorrido.
    if (tipo === "faq") {
      bloques.push(["ResumenPedido", { presentacion: "incrustado" }]);
    }

    bloques.push(imagen(seccion));

    if (tipo === "hero") bloques.push(["CorteDespacho"]);
    if (tipo === "oferta" || tipo === "comparativa") {
      bloques.push(["BotonCTA", { etiqueta: "Pedir ahora · Contraentrega" }]);
    }
  }

  if (!porTipo.has("faq")) {
    bloques.push(["ResumenPedido", { presentacion: "incrustado" }]);
  }
  bloques.push(["Cierre"]);

  return fabrica(bloques);
}

export const PLANTILLAS: Plantilla[] = [
  {
    id: "directa",
    nombre: "Directa a compra",
    descripcion:
      "Corta y al grano: hero con formulario, corte de despacho, beneficios y cierre. Para producto conocido o retargeting.",
    construir: () =>
      fabrica([
        ["HeroCompra", { mostrarFormulario: "si" }],
        ["CorteDespacho"],
        ["Beneficios", { heading: "Por qué lo vas a amar" }],
        ["PruebaSocial"],
        ["Comparacion", { title: "Por qué comprarle a Milito" }],
        ["Garantia"],
        ["Faqs"],
        ["NuSkin"],
        ["Cierre"],
      ]),
  },
  {
    id: "historia",
    nombre: "Historia completa",
    descripcion:
      "Educativa y larga: dolor, ingrediente, pasos, resultados y testimonios. Para audiencia fría que no conoce el producto.",
    construir: () =>
      fabrica([
        ["HeroCompra", { mostrarFormulario: "popup" }],
        ["SinRitual"],
        ["HistoriaIngrediente"],
        ["Pasos", { heading: "Así de fácil se usa" }],
        ["LineaTiempo", { heading: "Resultados que se sienten" }],
        ["ResultadosReales"],
        ["Testimonios"],
        ["Ugc"],
        ["CorteDespacho"],
        ["ResumenPedido", { presentacion: "incrustado" }],
        ["Garantia"],
        ["Faqs"],
        ["NuSkin"],
        ["Cierre"],
      ]),
  },
  {
    id: "video",
    nombre: "Video primero",
    descripcion:
      "El video vende: hero compacto, video protagonista, botón y formulario. Para creativos UGC o demostraciones.",
    construir: () =>
      fabrica([
        ["HeroCompra", { mostrarGaleria: "no", mostrarFormulario: "popup" }],
        ["Video", { ancho: "medio" }],
        ["BotonCTA", { etiqueta: "Pedir ahora · Contraentrega" }],
        ["Beneficios", { heading: "Lo que hace por ti" }],
        ["PruebaSocial"],
        ["CorteDespacho"],
        ["ResumenPedido", { presentacion: "incrustado" }],
        ["Faqs"],
        ["Cierre"],
      ]),
  },
];

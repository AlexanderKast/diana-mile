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

import type { QuizPuerta, RespuestasQuiz } from "../tipos";
import { calcularScore } from "../motor";
import { tonoPositivo, tonoNegativo, fraccionEscala10 } from "../habitos";
import type { ContratoResultadoPuerta, DimensionHabito } from "./ficha-segmento";
import { crearPuertaPiel } from "./piel";
import {
  SEGMENTOS_PIEL,
  determinarSegmentoPiel,
  calcularFechaObjetivo as calcularFechaObjetivoPiel,
  ID_PASO_TIPO_PIEL,
  ID_PASO_PREOCUPACION,
  ID_PASO_SOL,
  ID_PASO_SUENO,
  ID_PASO_HIDRATACION,
  ID_PASO_ESTRES,
  type SegmentoPiel,
} from "./piel-prescripcion";
import { crearPuertaEnergia } from "./energia";
import {
  SEGMENTOS_ENERGIA,
  determinarSegmentoEnergia,
  calcularFechaObjetivo as calcularFechaObjetivoEnergia,
  dimensionesHabitoEnergia,
  type SegmentoEnergia,
} from "./energia-prescripcion";
import { crearPuertaPeso } from "./peso";
import {
  SEGMENTOS_PESO,
  determinarSegmentoPeso,
  calcularFechaObjetivo as calcularFechaObjetivoPeso,
  dimensionesHabitoPeso,
  type SegmentoPeso,
} from "./peso-prescripcion";
import { crearPuertaSesion } from "./sesion";
import {
  SEGMENTOS_SESION,
  determinarNivelSesion,
  dimensionesHabitoSesion,
} from "./sesion-calificacion";
import { crearPuertaNegocio } from "./negocio";
import {
  SEGMENTOS_NEGOCIO,
  determinarNivelNegocio,
  dimensionesHabitoNegocio,
} from "./negocio-calificacion";

/**
 * Registro central: un `ContratoResultadoPuerta` por puerta, consumido por
 * `resultado/[id]/page.tsx` en vez de que la pagina conozca los detalles de
 * cada puerta. `piel` tiene su contrato real (envuelve lo que ya vive en
 * `piel-prescripcion.ts`); el resto son placeholders vacios hasta que un
 * agente futuro les escriba su ficha de segmento — ver TODO mas abajo.
 */

// --- piel -------------------------------------------------------------

/**
 * Busca la etiqueta legible de una opcion elegida en el cuestionario de
 * piel, igual que hacia `etiquetaOpcion` local en
 * `resultado/[id]/page.tsx`.
 */
function etiquetaOpcionPiel(pasoId: string, valor: unknown): string | undefined {
  const paso = crearPuertaPiel().pasos.find((p) => p.id === pasoId);
  if (!paso) return undefined;
  if (paso.tipo !== "opcion_unica" && paso.tipo !== "opcion_multiple") return undefined;
  return paso.opciones.find((o) => o.valor === valor)?.etiqueta;
}

/** Mismo mapeo que tenia `resultado/[id]/page.tsx` — que tan seguido usa protector solar. */
function fraccionProtectorSolar(valor?: string): number {
  const mapa: Record<string, number> = {
    nunca: 0.15,
    a_veces: 0.4,
    casi_siempre: 0.75,
    siempre: 1,
  };
  return valor && valor in mapa ? mapa[valor] : 0;
}

/** Mismo techo de referencia (8 horas) que tenia `resultado/[id]/page.tsx`. */
function fraccionHorasSueno(horas?: number): number {
  if (typeof horas !== "number") return 0;
  return Math.min(Math.max(horas / 8, 0), 1);
}

/**
 * Replica EXACTA de las 4 barras (protector solar / horas de sueno /
 * constancia con el agua / nivel de estres) que hoy arma a mano
 * `resultado/[id]/page.tsx` — mismos textos, mismos umbrales, mismo orden.
 */
function dimensionesHabitoPiel(respuestas: RespuestasQuiz): DimensionHabito[] {
  const protectorValor = respuestas[ID_PASO_SOL] as string | undefined;
  const suenoValor = respuestas[ID_PASO_SUENO] as number | undefined;
  const aguaValor = respuestas[ID_PASO_HIDRATACION] as number | undefined;
  const estresValor = respuestas[ID_PASO_ESTRES] as number | undefined;

  return [
    {
      etiqueta: "Protector solar",
      valorMostrado: etiquetaOpcionPiel(ID_PASO_SOL, protectorValor) ?? "Sin dato",
      fraccion: fraccionProtectorSolar(protectorValor),
      tono: tonoPositivo(fraccionProtectorSolar(protectorValor)),
    },
    {
      etiqueta: "Horas de sueno",
      valorMostrado: typeof suenoValor === "number" ? `${suenoValor} h` : "Sin dato",
      fraccion: fraccionHorasSueno(suenoValor),
      tono: tonoPositivo(fraccionHorasSueno(suenoValor)),
    },
    {
      etiqueta: "Constancia con el agua",
      valorMostrado: typeof aguaValor === "number" ? `${aguaValor}/10` : "Sin dato",
      fraccion: fraccionEscala10(aguaValor),
      tono: tonoPositivo(fraccionEscala10(aguaValor)),
    },
    {
      etiqueta: "Nivel de estres",
      valorMostrado: typeof estresValor === "number" ? `${estresValor}/10` : "Sin dato",
      fraccion: fraccionEscala10(estresValor),
      tono: tonoNegativo(fraccionEscala10(estresValor)),
    },
  ];
}

const CONTRATO_PIEL: ContratoResultadoPuerta = {
  segmentos: SEGMENTOS_PIEL,
  determinarSegmento: determinarSegmentoPiel,
  calcularFechaObjetivo: (respuestas, segmento) =>
    calcularFechaObjetivoPiel(respuestas, segmento as SegmentoPiel),
  dimensionesHabito: dimensionesHabitoPiel,
  idPasoEstadoActual: "rutina_actual",
  idPasoObjetivo: "objetivo_principal",
  idsChips: [ID_PASO_TIPO_PIEL, ID_PASO_PREOCUPACION],
};

// --- energia ------------------------------------------------------------

const CONTRATO_ENERGIA: ContratoResultadoPuerta = {
  segmentos: SEGMENTOS_ENERGIA,
  determinarSegmento: determinarSegmentoEnergia,
  calcularFechaObjetivo: (respuestas, segmento) =>
    calcularFechaObjetivoEnergia(respuestas, segmento as SegmentoEnergia),
  dimensionesHabito: dimensionesHabitoEnergia,
  idPasoEstadoActual: "rutina_movimiento",
  idPasoObjetivo: "objetivo_principal",
  idsChips: ["descripcion_energia", "preocupacion_energia"],
};

// --- peso -----------------------------------------------------------------

const CONTRATO_PESO: ContratoResultadoPuerta = {
  segmentos: SEGMENTOS_PESO,
  determinarSegmento: determinarSegmentoPeso,
  calcularFechaObjetivo: (respuestas, segmento) =>
    calcularFechaObjetivoPeso(respuestas, segmento as SegmentoPeso),
  dimensionesHabito: dimensionesHabitoPeso,
  // "peso" bifurca en 3 ramas desde el paso 2 (objetivo_peso) — no hay un
  // unico paso de "rutina actual" que se responda siempre en las 3 ramas
  // salvo la frecuencia de movimiento, que vive despues del punto de
  // convergencia (paso 6, ver peso.ts) y por eso si es universal.
  idPasoEstadoActual: "frecuencia_movimiento",
  idPasoObjetivo: "objetivo_especifico",
  idsChips: ["objetivo_peso", "objetivo_especifico"],
};

// --- sesion (calificacion, sin ritual/fecha) -------------------------------

const CONTRATO_SESION: ContratoResultadoPuerta = {
  segmentos: SEGMENTOS_SESION,
  determinarSegmento: (respuestas) =>
    determinarNivelSesion(calcularScore(crearPuertaSesion(), respuestas)),
  dimensionesHabito: dimensionesHabitoSesion,
  idPasoEstadoActual: null,
  idPasoObjetivo: null,
  idsChips: [],
};

// --- negocio (calificacion, sin ritual/fecha) ------------------------------

const CONTRATO_NEGOCIO: ContratoResultadoPuerta = {
  segmentos: SEGMENTOS_NEGOCIO,
  determinarSegmento: (respuestas) =>
    determinarNivelNegocio(calcularScore(crearPuertaNegocio(), respuestas)),
  dimensionesHabito: dimensionesHabitoNegocio,
  idPasoEstadoActual: null,
  idPasoObjetivo: null,
  idsChips: [],
};

export const CONTRATOS_RESULTADO: Record<QuizPuerta, ContratoResultadoPuerta> = {
  piel: CONTRATO_PIEL,
  energia: CONTRATO_ENERGIA,
  peso: CONTRATO_PESO,
  sesion: CONTRATO_SESION,
  negocio: CONTRATO_NEGOCIO,
};

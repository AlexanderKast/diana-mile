import type { RespuestasQuiz } from "../tipos";
import type { DimensionHabito, FichaSegmentoProducto } from "./ficha-segmento";
import { tonoPositivo, tonoNegativo, fraccionEscala10 } from "../habitos";

/**
 * Motor de prescripcion de la puerta "energia".
 *
 * Espejo estructural de `piel-prescripcion.ts`: vive separado de
 * `energia.ts` (que solo arma los 14 pasos) porque esto es la parte que
 * decide que se le recomienda a cada persona — una tabla de decision
 * explicita, legible de arriba a abajo, en vez de un arbol de if anidados.
 *
 * REGLA DE CUMPLIMIENTO DURA (ver packages/shared/src/botcake/ia/persuasion.ts,
 * regla li-03, y AGENTS.md "Honestidad del contenido"): esta puerta es de
 * ENERGIA/HABITOS, no de salud. Milito es entrenadora fisica y coach de
 * habitos, NO medica ni nutricionista. Toda `descripcionDiagnostico` y toda
 * `categoria` de `ritual` hablan de HABITOS (sueno, movimiento, agua,
 * manejo del estres, constancia de horarios) — nunca se le atribuye a un
 * producto o suplemento un efecto sobre la energia, el sueno o cualquier
 * otro resultado de salud. Un suplemento se describe como algo que
 * "acompana tu rutina", nunca como algo que "te sube la energia".
 */

// --- Ids de paso ------------------------------------------------------

export const ID_PASO_DESCRIPCION_ENERGIA = "descripcion_energia";
export const ID_PASO_PREOCUPACION = "preocupacion_energia";
export const ID_PASO_RUTINA_MOVIMIENTO = "rutina_movimiento";
export const ID_PASO_SUENO = "horas_sueno";
export const ID_PASO_HIDRATACION = "constancia_agua";
export const ID_PASO_ESTRES = "nivel_estres";
export const ID_PASO_FRECUENCIA_MOVIMIENTO = "frecuencia_movimiento";
export const ID_PASO_FECHA_OBJETIVO = "horizonte_resultados";

// --- Vocabulario de respuestas -----------------------------------------

export type DescripcionEnergia =
  | "estable"
  | "baja_tardes"
  | "baja_todo_dia"
  | "picos_bajones"
  | "no_se";

export type PreocupacionEnergia =
  | "cuesta_arrancar"
  | "media_tarde"
  | "duermo_no_descanso"
  | "estres_agota"
  | "mantenerla";

export type RutinaMovimiento =
  | "casi_no_me_muevo"
  | "camino_algo"
  | "ejercicio_1_2_semana"
  | "entreno_regularidad";

export type FrecuenciaMovimientoDia = "nunca" | "a_veces" | "casi_siempre" | "siempre";

/** Los 4 codigos que puede tener la respuesta del paso 12 (horizonte de resultados). `null` = "no tengo fecha en mente". */
export const HORIZONTES_FECHA_RESULTADOS: Record<string, number | null> = {
  dos_semanas: 14,
  un_mes: 30,
  dos_meses: 60,
  sin_fecha_definida: null,
};

// --- Segmentos ----------------------------------------------------------

export type SegmentoEnergia =
  | "energia_baja_sin_causa_clara"
  | "fatiga_por_mal_sueno"
  | "fatiga_por_sedentarismo"
  | "energia_dispersa_por_estres"
  | "altibajos_por_alimentacion_irregular"
  | "mantenimiento_energia";

export type ProductoPrescrito = {
  /** Categoria generica del paso del ritual — NUNCA un nombre comercial ni un efecto de salud. Eso se mapea recien en la ficha de producto, fuera del quiz. */
  categoria: string;
  /** Placeholder explicito: todavia no hay mapeo a un producto real de Shopify (SKU, precio) para esta categoria/segmento. */
  notaProducto: "PENDIENTE: mapear a producto real de Shopify";
};

export type FichaSegmentoEnergia = FichaSegmentoProducto & {
  nombreInterno: SegmentoEnergia;
  /**
   * Minimo de dias, con constancia en los habitos, para que sea razonable
   * esperar un cambio perceptible — se usa para no prometer una
   * fecha_objetivo mas optimista de lo que los habitos (y la logistica)
   * permiten — ver `calcularFechaObjetivo` mas abajo.
   */
  diasResultadoEstimado: number;
};

const PLACEHOLDER_PRODUCTO = "PENDIENTE: mapear a producto real de Shopify" as const;

function producto(categoria: string): ProductoPrescrito {
  return { categoria, notaProducto: PLACEHOLDER_PRODUCTO };
}

export const NOTA_ESTIMACION_ENERGIA =
  "Estimacion basada en tus habitos declarados en el test, no un diagnostico clinico ni una promesa de resultado. Milito acompana con habitos, no reemplaza a un medico.";

export const SEGMENTOS_ENERGIA: Record<SegmentoEnergia, FichaSegmentoEnergia> = {
  energia_baja_sin_causa_clara: {
    nombreInterno: "energia_baja_sin_causa_clara",
    tipo: "producto",
    tituloDiagnostico: "Energia baja sin una causa clara",
    descripcionDiagnostico:
      "Nos contaste que te cuesta arrancar el dia y no hay una sola causa evidente — suele ser una mezcla de sueno, hidratacion y rutina que todavia no terminan de cuadrar. Ahi no se trata de un cambio grande sino de mirar tus habitos de la manana completos y ajustar de a poco lo que mas pesa.",
    notaEstimacion: NOTA_ESTIMACION_ENERGIA,
    ritual: [
      producto("suplemento para acompanar tu rutina diaria"),
      producto("batido o snack para las mananas"),
      producto("botella o recordatorio para sostener el habito del agua"),
    ],
    diasResultadoEstimado: 21,
    videoId: null,
    iconoUrl: "/images/segmentos/energia_baja_sin_causa_clara.png",
    hrefCatalogo: "/categorias/bienestar-por-dentro",
  },
  fatiga_por_mal_sueno: {
    nombreInterno: "fatiga_por_mal_sueno",
    tipo: "producto",
    tituloDiagnostico: "Duermes, pero no descansas",
    descripcionDiagnostico:
      "Duermes, pero sientes que no descansas — y eso casi siempre tiene que ver con el horario y la calidad del sueno, no solo con las horas que duermes. Trabajar una rutina de sueno mas constante (misma hora para acostarte, menos pantalla antes de dormir) suele ser lo que mas cambia como amaneces.",
    notaEstimacion: NOTA_ESTIMACION_ENERGIA,
    ritual: [
      producto("suplemento para tu rutina de las noches"),
      producto("infusion o bebida para tu ritual antes de dormir"),
      producto("recordatorio para sostener un horario de sueno mas constante"),
    ],
    diasResultadoEstimado: 21,
    videoId: null,
    iconoUrl: "/images/segmentos/fatiga_por_mal_sueno.png",
    hrefCatalogo: "/categorias/bienestar-por-dentro",
  },
  fatiga_por_sedentarismo: {
    nombreInterno: "fatiga_por_sedentarismo",
    tipo: "producto",
    tituloDiagnostico: "Poco movimiento, cuerpo cansado",
    descripcionDiagnostico:
      "Nos contaste que casi no te mueves durante el dia, y eso pesa mas de lo que parece en como arrancas la manana. El cuerpo que no se mueve tiende a sentirse mas pesado, no menos — la idea no es entrenar duro de una, es meter movimiento pequeno y constante en tu rutina diaria.",
    notaEstimacion: NOTA_ESTIMACION_ENERGIA,
    ritual: [
      producto("suplemento para acompanar tu rutina de movimiento"),
      producto("batido o snack para antes o despues de moverte"),
      producto("botella para sostener el habito del agua durante el dia"),
    ],
    diasResultadoEstimado: 30,
    videoId: null,
    iconoUrl: "/images/segmentos/fatiga_por_sedentarismo.png",
    hrefCatalogo: "/categorias/bienestar-por-dentro",
  },
  energia_dispersa_por_estres: {
    nombreInterno: "energia_dispersa_por_estres",
    tipo: "producto",
    tituloDiagnostico: "El estres te esta agotando",
    descripcionDiagnostico:
      "El estres es lo que mas te esta agotando estos dias, y es de las cosas que mas rapido se nota en la energia. Ahi el trabajo es de manejo del estres: pausas reales durante el dia, algo de movimiento y un limite mas claro entre el trabajo y el descanso.",
    notaEstimacion: NOTA_ESTIMACION_ENERGIA,
    ritual: [
      producto("suplemento para tu rutina diaria"),
      producto("infusion o bebida para tus pausas de manejo del estres"),
      producto("recordatorio para tus pausas activas durante el dia"),
    ],
    diasResultadoEstimado: 21,
    videoId: null,
    iconoUrl: "/images/segmentos/energia_dispersa_por_estres.png",
    hrefCatalogo: "/categorias/bienestar-por-dentro",
  },
  altibajos_por_alimentacion_irregular: {
    nombreInterno: "altibajos_por_alimentacion_irregular",
    tipo: "producto",
    tituloDiagnostico: "Bajon de energia a media tarde",
    descripcionDiagnostico:
      "Te quedas sin energia a media tarde, y eso suele estar ligado a como comes durante el dia — saltarte comidas o dejar pasar mucho tiempo entre una y otra genera esos bajones. Ordenar un poco los horarios de comida y tener algo a la mano para esas horas largas suele suavizar ese bajon.",
    notaEstimacion: NOTA_ESTIMACION_ENERGIA,
    ritual: [
      producto("snack o batido para tener a mano en las tardes largas"),
      producto("suplemento para acompanar tus comidas"),
      producto("botella o recordatorio para el habito del agua"),
    ],
    diasResultadoEstimado: 14,
    videoId: null,
    iconoUrl: "/images/segmentos/altibajos_por_alimentacion_irregular.png",
    hrefCatalogo: "/categorias/bienestar-por-dentro",
  },
  mantenimiento_energia: {
    nombreInterno: "mantenimiento_energia",
    tipo: "producto",
    tituloDiagnostico: "Mantenimiento y constancia",
    descripcionDiagnostico:
      "Tu energia esta relativamente estable y lo que buscas es mantenerla asi. Ahi el trabajo es sostener lo que ya haces bien: sueno constante, movimiento regular y manejo del estres, sin necesidad de cambios grandes.",
    notaEstimacion: NOTA_ESTIMACION_ENERGIA,
    ritual: [
      producto("suplemento para sostener tu rutina diaria"),
      producto("batido o snack saludable de mantenimiento"),
      producto("botella para sostener el habito del agua"),
    ],
    diasResultadoEstimado: 21,
    videoId: null,
    iconoUrl: "/images/segmentos/mantenimiento_energia.png",
    hrefCatalogo: "/categorias/bienestar-por-dentro",
  },
};

// --- Tabla de decision ---------------------------------------------------

export type ReglaPrescripcionEnergia = {
  id: string;
  /** Explicacion en palabras del criterio — para leer la tabla sin ejecutar codigo. */
  descripcion: string;
  cuandoAplica: (respuestas: RespuestasQuiz) => boolean;
  segmento: SegmentoEnergia;
};

function preocupacion(respuestas: RespuestasQuiz): PreocupacionEnergia | undefined {
  return respuestas[ID_PASO_PREOCUPACION] as PreocupacionEnergia | undefined;
}

function rutinaMovimiento(respuestas: RespuestasQuiz): RutinaMovimiento | undefined {
  return respuestas[ID_PASO_RUTINA_MOVIMIENTO] as RutinaMovimiento | undefined;
}

/**
 * Reglas evaluadas EN ORDEN, la primera que aplica gana (como un switch de
 * arriba hacia abajo). La preocupacion principal (paso 3) es el criterio
 * primario; la rutina de movimiento (paso 4) desempata el unico caso donde
 * la misma preocupacion ("me cuesta arrancar el dia") puede venir de dos
 * causas distintas: sedentarismo puro, o una mezcla de habitos sin una
 * causa unica.
 */
export const TABLA_DECISION_ENERGIA: ReglaPrescripcionEnergia[] = [
  {
    id: "mantener",
    descripcion: "Preocupacion principal = quiere mantener su energia, esta bien",
    cuandoAplica: (r) => preocupacion(r) === "mantenerla",
    segmento: "mantenimiento_energia",
  },
  {
    id: "estres",
    descripcion: "Preocupacion principal = el estres la agota",
    cuandoAplica: (r) => preocupacion(r) === "estres_agota",
    segmento: "energia_dispersa_por_estres",
  },
  {
    id: "sueno_no_descansa",
    descripcion: "Preocupacion principal = duerme pero no descansa",
    cuandoAplica: (r) => preocupacion(r) === "duermo_no_descanso",
    segmento: "fatiga_por_mal_sueno",
  },
  {
    id: "cuesta_arrancar_sedentaria",
    descripcion:
      "Preocupacion principal = le cuesta arrancar el dia Y rutina de movimiento = casi no se mueve",
    cuandoAplica: (r) => {
      const p = preocupacion(r);
      const rutina = rutinaMovimiento(r);
      return p === "cuesta_arrancar" && rutina === "casi_no_me_muevo";
    },
    segmento: "fatiga_por_sedentarismo",
  },
  {
    id: "cuesta_arrancar_sin_causa_clara",
    descripcion:
      "Preocupacion principal = le cuesta arrancar el dia, pero SI tiene algo de movimiento — no hay una causa unica evidente",
    cuandoAplica: (r) => preocupacion(r) === "cuesta_arrancar",
    segmento: "energia_baja_sin_causa_clara",
  },
  {
    id: "bajon_media_tarde",
    descripcion: "Preocupacion principal = se queda sin energia a media tarde",
    cuandoAplica: (r) => preocupacion(r) === "media_tarde",
    segmento: "altibajos_por_alimentacion_irregular",
  },
];

/** Red de seguridad si el paso 3 llegara vacio (no deberia pasar: es opcion_unica obligatoria) — nunca deja a alguien sin diagnostico. */
const SEGMENTO_POR_DEFECTO: SegmentoEnergia = "mantenimiento_energia";

export function determinarSegmentoEnergia(respuestas: RespuestasQuiz): SegmentoEnergia {
  const regla = TABLA_DECISION_ENERGIA.find((r) => r.cuandoAplica(respuestas));
  return regla?.segmento ?? SEGMENTO_POR_DEFECTO;
}

// --- Dimensiones de habito (barras del resultado) ------------------------

/** Mismo techo de referencia (8 horas) que usa la puerta "piel" para horas de sueno. */
function fraccionHorasSueno(horas?: number): number {
  if (typeof horas !== "number") return 0;
  return Math.min(Math.max(horas / 8, 0), 1);
}

const FRACCION_FRECUENCIA_MOVIMIENTO: Record<FrecuenciaMovimientoDia, number> = {
  nunca: 0.1,
  a_veces: 0.45,
  casi_siempre: 0.8,
  siempre: 1,
};

const ETIQUETA_FRECUENCIA_MOVIMIENTO: Record<FrecuenciaMovimientoDia, string> = {
  nunca: "Nunca",
  a_veces: "A veces",
  casi_siempre: "Casi siempre",
  siempre: "Siempre",
};

function fraccionFrecuenciaMovimiento(valor?: string): number {
  return valor && valor in FRACCION_FRECUENCIA_MOVIMIENTO
    ? FRACCION_FRECUENCIA_MOVIMIENTO[valor as FrecuenciaMovimientoDia]
    : 0;
}

/**
 * 4 barras de habito para la pantalla de resultado: sueno, agua, estres y
 * movimiento. Usa los helpers genericos de `lib/quiz/habitos.ts` en vez de
 * reinventar los umbrales de tono — mismo patron que usaria `contratos.ts`
 * para "piel".
 */
export function dimensionesHabitoEnergia(respuestas: RespuestasQuiz): DimensionHabito[] {
  const suenoValor = respuestas[ID_PASO_SUENO] as number | undefined;
  const aguaValor = respuestas[ID_PASO_HIDRATACION] as number | undefined;
  const estresValor = respuestas[ID_PASO_ESTRES] as number | undefined;
  const movimientoValor = respuestas[ID_PASO_FRECUENCIA_MOVIMIENTO] as
    | FrecuenciaMovimientoDia
    | undefined;

  return [
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
    {
      etiqueta: "Movimiento durante el dia",
      valorMostrado: movimientoValor
        ? ETIQUETA_FRECUENCIA_MOVIMIENTO[movimientoValor]
        : "Sin dato",
      fraccion: fraccionFrecuenciaMovimiento(movimientoValor),
      tono: tonoPositivo(fraccionFrecuenciaMovimiento(movimientoValor)),
    },
  ];
}

// --- Fecha objetivo -------------------------------------------------------

/**
 * Dias habiles de entrega a usar mientras `funnel_tiempo_entrega_dias` no
 * exista todavia en la tabla `config` — mismo valor y misma razon que
 * `TIEMPO_ENTREGA_DIAS_DEFECTO` en `piel-prescripcion.ts` (5 dias habiles
 * cubre el escenario real de la mayoria del pais, ver
 * packages/shared/src/logistica/despacho.ts).
 *
 * TODO: cuando exista la key `funnel_tiempo_entrega_dias` en `config`,
 * quien llame a `calcularFechaObjetivo` debe leerla en el servidor y
 * pasarla en `opciones.tiempoEntregaDias` en vez de dejar el default.
 */
export const TIEMPO_ENTREGA_DIAS_DEFECTO = 5;

/**
 * Calcula la fecha objetivo a mostrarle/guardarle a la persona: nunca mas
 * optimista que "hoy + tiempo de entrega + minimo realista para notar un
 * cambio de habitos en su segmento". Si eligio un horizonte mas lejano en
 * el paso 12, se respeta su fecha — la funcion solo pone un piso, nunca
 * reduce lo que la persona pidio. Mismo patron que
 * `calcularFechaObjetivo` en `piel-prescripcion.ts`.
 */
export function calcularFechaObjetivo(
  respuestas: RespuestasQuiz,
  segmento: SegmentoEnergia,
  opciones?: { fechaBase?: Date; tiempoEntregaDias?: number },
): Date {
  const codigoHorizonte = respuestas[ID_PASO_FECHA_OBJETIVO] as string | undefined;
  const horizonteDias =
    codigoHorizonte && codigoHorizonte in HORIZONTES_FECHA_RESULTADOS
      ? HORIZONTES_FECHA_RESULTADOS[codigoHorizonte]
      : null;

  const tiempoEntregaDias = opciones?.tiempoEntregaDias ?? TIEMPO_ENTREGA_DIAS_DEFECTO;
  const diasResultado = SEGMENTOS_ENERGIA[segmento].diasResultadoEstimado;
  const diasMinimosRealistas = tiempoEntregaDias + diasResultado;

  const diasFinal =
    horizonteDias === null ? diasMinimosRealistas : Math.max(horizonteDias, diasMinimosRealistas);

  const fecha = new Date(opciones?.fechaBase ?? new Date());
  fecha.setDate(fecha.getDate() + diasFinal);
  return fecha;
}

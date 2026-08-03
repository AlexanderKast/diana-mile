import type { RespuestasQuiz } from "../tipos";
import { tonoPositivo, tonoNegativo, fraccionEscala10 } from "../habitos";
import type {
  DimensionHabito,
  FichaSegmentoProducto,
  ProductoPrescrito,
} from "./ficha-segmento";

/**
 * Motor de prescripcion de la puerta "peso" — diagnostico de peso/composicion
 * corporal, bifurcado bajar/subir/tonificar. Milito es entrenadora fisica y
 * personal de salud, NO medica ni nutricionista.
 *
 * Mismo patron que `piel-prescripcion.ts`: una tabla de decision explicita,
 * evaluada en orden, legible sin ejecutar nada.
 *
 * RESTRICCION DE CUMPLIMIENTO DURA (ver packages/shared/src/botcake/ia/persuasion.ts,
 * regla li-03, y AGENTS.md "Honestidad del contenido"): PROHIBIDO atribuirle a
 * un suplemento efectos sobre el peso. Todo el copy de este archivo habla
 * SOLO de habitos (movimiento, alimentacion con orden — nunca restriccion,
 * constancia, descanso). Cero cifra de cuanto va a bajar/subir de peso, cero
 * comentario sobre el cuerpo de la persona, cero antes/despues.
 *
 * Los ids de paso se declaran ACA como constantes y `peso.ts` las importa
 * para usarlas como `id` de cada paso — mismo contrato que en piel.
 */

// --- Ids de paso ------------------------------------------------------

/** Paso 2 — bifurca el resto del cuestionario. */
export const ID_PASO_OBJETIVO_PESO = "objetivo_peso";

// Rama "bajar_peso" (pasos 3-4 de esa rama).
export const ID_PASO_RELACION_COMIDA_BAJAR = "relacion_comida_bajar";
export const ID_PASO_CONSTANCIA_HORARIOS_BAJAR = "constancia_horarios_bajar";

// Rama "subir_masa" (pasos 3-4 de esa rama).
export const ID_PASO_INGESTA_SUBIR = "ingesta_subir";
export const ID_PASO_CONSTANCIA_COMIDAS_SUBIR = "constancia_comidas_subir";

// Rama "tonificar_definir" (pasos 3-4 de esa rama).
export const ID_PASO_ENTRENAMIENTO_ACTUAL_TONIFICAR = "entrenamiento_actual_tonificar";
export const ID_PASO_ENFOQUE_TONIFICAR = "enfoque_tonificar";

/** Paso donde convergen las 3 ramas despues de sus preguntas de contexto (payoff 1). */
export const ID_PASO_PAYOFF_HABITOS = "payoff_constancia_habitos";

// Pasos comunes (5 en adelante, misma numeracion para las 3 ramas).
export const ID_PASO_FRECUENCIA_MOVIMIENTO = "frecuencia_movimiento";
export const ID_PASO_SUENO = "horas_sueno";
export const ID_PASO_CONSTANCIA_ALIMENTARIA = "constancia_alimentaria";
export const ID_PASO_ESTRES = "nivel_estres";
export const ID_PASO_OBJETIVO_ESPECIFICO = "objetivo_especifico";
export const ID_PASO_FECHA_OBJETIVO = "horizonte_resultados";

// --- Vocabulario de respuestas -----------------------------------------

export type ObjetivoPeso = "bajar_peso" | "subir_masa" | "tonificar_definir";

/** Los 4 codigos que puede tener la respuesta del paso 12 (horizonte de resultados) — mismo vocabulario que piel. */
export const HORIZONTES_FECHA_RESULTADOS: Record<string, number | null> = {
  dos_semanas: 14,
  un_mes: 30,
  dos_meses: 60,
  sin_fecha_definida: null,
};

// --- Segmentos ----------------------------------------------------------

/**
 * 6 segmentos, 2 por objetivo (bajar/subir/tonificar). `mantenimiento_peso`
 * cumple doble rol: es la 2da variante de la rama "tonificar" (cuando
 * todavia no hay entrenamiento consolidado) Y el fallback transversal de
 * toda la puerta (`SEGMENTO_POR_DEFECTO` mas abajo) — mismo patron que
 * `mantenimiento_preventivo` en piel-prescripcion.ts.
 */
export type SegmentoPeso =
  | "constancia_alimentaria"
  | "movimiento_insuficiente"
  | "ganancia_masa_muscular"
  | "relacion_con_la_comida"
  | "tonificacion_definicion"
  | "mantenimiento_peso";

export type FichaSegmentoPeso = FichaSegmentoProducto & {
  nombreInterno: SegmentoPeso;
};

const PLACEHOLDER_PRODUCTO = "PENDIENTE: mapear a producto real de Shopify" as const;

function producto(categoria: string): ProductoPrescrito {
  return { categoria, notaProducto: PLACEHOLDER_PRODUCTO };
}

export const NOTA_ESTIMACION_PESO =
  "Estimacion basada en tus habitos declarados en el test, no un diagnostico clinico ni una promesa de resultado. Milito es entrenadora fisica, no medica ni nutricionista.";

export const SEGMENTOS_PESO: Record<SegmentoPeso, FichaSegmentoPeso> = {
  constancia_alimentaria: {
    nombreInterno: "constancia_alimentaria",
    tipo: "producto",
    tituloDiagnostico: "Bajar de peso con mas orden en la comida",
    descripcionDiagnostico:
      "Tu meta es bajar de peso y lo que mas se te dificulta es controlar las porciones o los antojos. Ahi el trabajo no es restringir todo de golpe: es ganar orden — comer a horas mas definidas, con porciones conscientes y sin pasar largos ratos sin comer, que es justo lo que despues dispara los antojos fuertes. Vamos a acompanarte con habitos simples de sostener en el dia a dia.",
    notaEstimacion: NOTA_ESTIMACION_PESO,
    ritual: [
      producto("batido nutricional para reemplazar una comida con orden"),
      producto("snack proteico de control de porciones"),
      producto("suplemento de acompanamiento diario"),
    ],
    diasResultadoEstimado: 30,
    videoId: null,
    iconoUrl: "/images/segmentos/constancia_alimentaria.png",
    hrefCatalogo: "/categorias/bienestar-por-dentro",
  },
  movimiento_insuficiente: {
    nombreInterno: "movimiento_insuficiente",
    tipo: "producto",
    tituloDiagnostico: "Bajar de peso sumando movimiento",
    descripcionDiagnostico:
      "Tu meta es bajar de peso y hoy el movimiento es lo que menos aparece en tu dia. No hace falta empezar por entrenamientos largos: caminar mas seguido y moverte un poco cada dia, sostenido en el tiempo, pesa mas que una rutina intensa que dura una semana y se abandona. Ahi es donde vamos a poner el foco contigo.",
    notaEstimacion: NOTA_ESTIMACION_PESO,
    ritual: [
      producto("batido nutricional para acompanar un dia mas activo"),
      producto("suplemento de acompanamiento diario"),
      producto("bebida hidratante para antes o despues de moverte"),
    ],
    diasResultadoEstimado: 45,
    videoId: null,
    iconoUrl: "/images/segmentos/movimiento_insuficiente.png",
    hrefCatalogo: "/categorias/bienestar-por-dentro",
  },
  ganancia_masa_muscular: {
    nombreInterno: "ganancia_masa_muscular",
    tipo: "producto",
    tituloDiagnostico: "Subir masa muscular con constancia",
    descripcionDiagnostico:
      "Tu meta es subir masa muscular y ya tienes una base de alimentacion que puede sostener el proceso. Lo que marca la diferencia de aca en adelante es la constancia: entrenar con regularidad, comer lo suficiente en cada comida y darle al cuerpo el descanso que necesita para recuperarse. Vamos a acompanarte en sostener esos tres frentes.",
    notaEstimacion: NOTA_ESTIMACION_PESO,
    ritual: [
      producto("batido nutricional proteico para completar comidas"),
      producto("suplemento de acompanamiento diario"),
      producto("snack proteico entre comidas"),
    ],
    diasResultadoEstimado: 60,
    videoId: null,
    iconoUrl: "/images/segmentos/ganancia_masa_muscular.png",
    hrefCatalogo: "/categorias/bienestar-por-dentro",
  },
  relacion_con_la_comida: {
    nombreInterno: "relacion_con_la_comida",
    tipo: "producto",
    tituloDiagnostico: "Subir masa muscular comiendo lo suficiente",
    descripcionDiagnostico:
      "Tu meta es subir masa muscular, pero hoy te cuesta comer lo suficiente — se te olvida, se te quita el hambre o no alcanzas a completar las comidas del dia. Ahi el primer paso no es entrenar mas duro: es resolver esa parte de la alimentacion, con comidas mas frecuentes y opciones faciles de sumar cuando el apetito no ayuda.",
    notaEstimacion: NOTA_ESTIMACION_PESO,
    ritual: [
      producto("batido nutricional para sumar una comida mas al dia"),
      producto("snack proteico facil de llevar"),
      producto("suplemento de acompanamiento diario"),
    ],
    diasResultadoEstimado: 45,
    videoId: null,
    iconoUrl: "/images/segmentos/relacion_con_la_comida.png",
    hrefCatalogo: "/categorias/bienestar-por-dentro",
  },
  tonificacion_definicion: {
    nombreInterno: "tonificacion_definicion",
    tipo: "producto",
    tituloDiagnostico: "Tonificar con el entrenamiento que ya tienes",
    descripcionDiagnostico:
      "Tu meta es tonificar y definir sin buscar un cambio grande de peso, y ya tienes una base de entrenamiento sobre la cual construir. Ahi el trabajo es de sostenibilidad: mantener la regularidad, cuidar la alimentacion alrededor del entrenamiento y darle tiempo al proceso — la definicion se construye con constancia, no de un dia para otro.",
    notaEstimacion: NOTA_ESTIMACION_PESO,
    ritual: [
      producto("batido nutricional para acompanar el entrenamiento"),
      producto("snack proteico de control de porciones"),
      producto("suplemento de acompanamiento diario"),
    ],
    diasResultadoEstimado: 45,
    videoId: null,
    iconoUrl: "/images/segmentos/tonificacion_definicion.png",
    hrefCatalogo: "/categorias/bienestar-por-dentro",
  },
  mantenimiento_peso: {
    nombreInterno: "mantenimiento_peso",
    tipo: "producto",
    tituloDiagnostico: "Construir una base de habitos",
    descripcionDiagnostico:
      "Tu meta hoy es tonificar o simplemente sentirte mejor con tus habitos, sin apuntar a un cambio grande de peso. Ahi el punto de partida es simple: sumar movimiento con mas regularidad, ordenar un poco la alimentacion y sostenerlo — la base de cualquier objetivo que quieras ponerte despues.",
    notaEstimacion: NOTA_ESTIMACION_PESO,
    ritual: [
      producto("batido nutricional para ordenar una comida del dia"),
      producto("suplemento de acompanamiento diario"),
      producto("bebida hidratante para tu rutina de movimiento"),
    ],
    diasResultadoEstimado: 30,
    videoId: null,
    iconoUrl: "/images/segmentos/mantenimiento_peso.png",
    hrefCatalogo: "/categorias/bienestar-por-dentro",
  },
};

// --- Tabla de decision ---------------------------------------------------

export type ReglaPrescripcionPeso = {
  id: string;
  /** Explicacion en palabras del criterio — para leer la tabla sin ejecutar codigo. */
  descripcion: string;
  cuandoAplica: (respuestas: RespuestasQuiz) => boolean;
  segmento: SegmentoPeso;
};

function objetivoPeso(respuestas: RespuestasQuiz): ObjetivoPeso | undefined {
  return respuestas[ID_PASO_OBJETIVO_PESO] as ObjetivoPeso | undefined;
}

function frecuenciaMovimiento(respuestas: RespuestasQuiz): string | undefined {
  return respuestas[ID_PASO_FRECUENCIA_MOVIMIENTO] as string | undefined;
}

/**
 * Reglas evaluadas EN ORDEN, la primera que aplica gana. El objetivo elegido
 * en el paso 2 (`objetivo_peso`) es el criterio PRINCIPAL — cada objetivo
 * tiene exactamente 2 reglas: una condicion especifica que desempata segun
 * un habito (movimiento para bajar, ingesta para subir, entrenamiento actual
 * para tonificar — todos pasos ya respondidos en ese punto del cuestionario)
 * y una regla de "resto de casos" dentro del mismo objetivo. Las 6 reglas
 * cubren exhaustivamente los 3 valores posibles de `objetivo_peso`.
 */
export const TABLA_DECISION_PESO: ReglaPrescripcionPeso[] = [
  {
    id: "bajar_movimiento_insuficiente",
    descripcion:
      "Objetivo = bajar de peso Y el movimiento declarado es bajo (casi no se mueve o camina algo, sin constancia)",
    cuandoAplica: (r) => {
      const objetivo = objetivoPeso(r);
      const movimiento = frecuenciaMovimiento(r);
      return (
        objetivo === "bajar_peso" &&
        (movimiento === "casi_no_me_muevo" || movimiento === "camino_algo")
      );
    },
    segmento: "movimiento_insuficiente",
  },
  {
    id: "bajar_constancia_alimentaria",
    descripcion:
      "Objetivo = bajar de peso, resto de casos (el movimiento ya esta presente, el reto principal es el orden alimentario)",
    cuandoAplica: (r) => objetivoPeso(r) === "bajar_peso",
    segmento: "constancia_alimentaria",
  },
  {
    id: "subir_relacion_comida",
    descripcion:
      "Objetivo = subir masa muscular Y la ingesta declarada es baja (se le dificulta comer lo suficiente)",
    cuandoAplica: (r) => {
      const objetivo = objetivoPeso(r);
      const ingesta = r[ID_PASO_INGESTA_SUBIR] as string | undefined;
      return objetivo === "subir_masa" && ingesta === "como_poco";
    },
    segmento: "relacion_con_la_comida",
  },
  {
    id: "subir_ganancia_masa",
    descripcion: "Objetivo = subir masa muscular, resto de casos",
    cuandoAplica: (r) => objetivoPeso(r) === "subir_masa",
    segmento: "ganancia_masa_muscular",
  },
  {
    id: "tonificar_definicion",
    descripcion:
      "Objetivo = tonificar/definir Y ya entrena con pesas o de forma mixta (cardio + pesas)",
    cuandoAplica: (r) => {
      const objetivo = objetivoPeso(r);
      const entrenamiento = r[ID_PASO_ENTRENAMIENTO_ACTUAL_TONIFICAR] as string | undefined;
      return (
        objetivo === "tonificar_definir" &&
        (entrenamiento === "entrena_pesas" || entrenamiento === "entrena_mixto")
      );
    },
    segmento: "tonificacion_definicion",
  },
  {
    id: "tonificar_mantenimiento",
    descripcion:
      "Objetivo = tonificar/definir, resto de casos (sin entrenamiento de fuerza consolidado todavia)",
    cuandoAplica: (r) => objetivoPeso(r) === "tonificar_definir",
    segmento: "mantenimiento_peso",
  },
];

/** Red de seguridad si el paso 2 llegara vacio (no deberia pasar: es opcion_unica obligatoria) — nunca deja a alguien sin ritual. */
const SEGMENTO_POR_DEFECTO: SegmentoPeso = "mantenimiento_peso";

export function determinarSegmentoPeso(respuestas: RespuestasQuiz): SegmentoPeso {
  const regla = TABLA_DECISION_PESO.find((r) => r.cuandoAplica(respuestas));
  return regla?.segmento ?? SEGMENTO_POR_DEFECTO;
}

// --- Dimensiones de habito (barras de la pantalla de resultado) ---------

const ETIQUETAS_FRECUENCIA_MOVIMIENTO: Record<string, string> = {
  casi_no_me_muevo: "Casi no se mueve",
  camino_algo: "Camina algo",
  entreno_1_2_veces: "Entrena 1-2 veces/semana",
  entreno_regularidad: "Entrena con regularidad",
};

const FRACCION_FRECUENCIA_MOVIMIENTO: Record<string, number> = {
  casi_no_me_muevo: 0.1,
  camino_algo: 0.4,
  entreno_1_2_veces: 0.7,
  entreno_regularidad: 1,
};

function fraccionMovimiento(valor?: string): number {
  return valor && valor in FRACCION_FRECUENCIA_MOVIMIENTO
    ? FRACCION_FRECUENCIA_MOVIMIENTO[valor]
    : 0;
}

/** Mismo techo de referencia (8 horas) que usa piel-prescripcion.ts / contratos.ts para horas de sueno. */
function fraccionHorasSueno(horas?: number): number {
  if (typeof horas !== "number") return 0;
  return Math.min(Math.max(horas / 8, 0), 1);
}

/**
 * 4 barras: frecuencia de movimiento, horas de sueno, constancia alimentaria
 * y nivel de estres — mismo criterio de umbral (`tonoPositivo`/`tonoNegativo`
 * de `lib/quiz/habitos.ts`) que usa piel para sus 4 barras.
 */
export function dimensionesHabitoPeso(respuestas: RespuestasQuiz): DimensionHabito[] {
  const movimientoValor = respuestas[ID_PASO_FRECUENCIA_MOVIMIENTO] as string | undefined;
  const suenoValor = respuestas[ID_PASO_SUENO] as number | undefined;
  const constanciaValor = respuestas[ID_PASO_CONSTANCIA_ALIMENTARIA] as number | undefined;
  const estresValor = respuestas[ID_PASO_ESTRES] as number | undefined;

  return [
    {
      etiqueta: "Movimiento",
      valorMostrado: ETIQUETAS_FRECUENCIA_MOVIMIENTO[movimientoValor ?? ""] ?? "Sin dato",
      fraccion: fraccionMovimiento(movimientoValor),
      tono: tonoPositivo(fraccionMovimiento(movimientoValor)),
    },
    {
      etiqueta: "Horas de sueno",
      valorMostrado: typeof suenoValor === "number" ? `${suenoValor} h` : "Sin dato",
      fraccion: fraccionHorasSueno(suenoValor),
      tono: tonoPositivo(fraccionHorasSueno(suenoValor)),
    },
    {
      etiqueta: "Constancia alimentaria",
      valorMostrado: typeof constanciaValor === "number" ? `${constanciaValor}/10` : "Sin dato",
      fraccion: fraccionEscala10(constanciaValor),
      tono: tonoPositivo(fraccionEscala10(constanciaValor)),
    },
    {
      etiqueta: "Nivel de estres",
      valorMostrado: typeof estresValor === "number" ? `${estresValor}/10` : "Sin dato",
      fraccion: fraccionEscala10(estresValor),
      tono: tonoNegativo(fraccionEscala10(estresValor)),
    },
  ];
}

// --- Fecha objetivo -------------------------------------------------------

/**
 * Dias habiles de entrega a usar mientras `funnel_tiempo_entrega_dias` no
 * exista todavia en la tabla `config` — mismo default y misma nota que
 * `piel-prescripcion.ts` (ver packages/shared/src/logistica/despacho.ts).
 *
 * TODO: cuando exista la key `funnel_tiempo_entrega_dias` en `config`, quien
 * llame a `calcularFechaObjetivo` debe leerla en el servidor y pasarla en
 * `opciones.tiempoEntregaDias` en vez de dejar el default.
 */
export const TIEMPO_ENTREGA_DIAS_DEFECTO = 5;

/**
 * Calcula la fecha objetivo a mostrarle/guardarle a la persona: nunca mas
 * optimista que "hoy + tiempo de entrega + minimo realista para ver cambios
 * en su segmento". Si eligio un horizonte mas lejano en el paso 12, se
 * respeta su fecha — la funcion solo pone un piso, nunca reduce lo que la
 * persona pidio. Puro, mismo patron que `calcularFechaObjetivo` de piel.
 */
export function calcularFechaObjetivo(
  respuestas: RespuestasQuiz,
  segmento: SegmentoPeso,
  opciones?: { fechaBase?: Date; tiempoEntregaDias?: number },
): Date {
  const codigoHorizonte = respuestas[ID_PASO_FECHA_OBJETIVO] as string | undefined;
  const horizonteDias =
    codigoHorizonte && codigoHorizonte in HORIZONTES_FECHA_RESULTADOS
      ? HORIZONTES_FECHA_RESULTADOS[codigoHorizonte]
      : null;

  const tiempoEntregaDias = opciones?.tiempoEntregaDias ?? TIEMPO_ENTREGA_DIAS_DEFECTO;
  const diasResultado = SEGMENTOS_PESO[segmento].diasResultadoEstimado;
  const diasMinimosRealistas = tiempoEntregaDias + diasResultado;

  const diasFinal =
    horizonteDias === null ? diasMinimosRealistas : Math.max(horizonteDias, diasMinimosRealistas);

  const fecha = new Date(opciones?.fechaBase ?? new Date());
  fecha.setDate(fecha.getDate() + diasFinal);
  return fecha;
}

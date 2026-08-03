import type { RespuestasQuiz } from "../tipos";
import type { FichaSegmentoProducto } from "./ficha-segmento";

/**
 * Motor de prescripcion de la puerta "piel".
 *
 * Vive separado de `piel.ts` (que solo arma los 14 pasos) porque esto es
 * la parte que de verdad decide que se le recomienda a cada persona: una
 * tabla de decision explicita, legible de arriba a abajo, en vez de un
 * arbol de if anidados que solo se entiende leyendo el codigo linea por
 * linea. Cualquiera (Alexander, o quien lo revise despues) tiene que poder
 * leer `TABLA_DECISION_PIEL` como una tabla y entender el criterio sin
 * ejecutar nada.
 *
 * Los ids de paso que este archivo necesita leer (tipo de piel,
 * preocupacion principal, habitos, horizonte de resultados) se declaran
 * ACA como constantes y `piel.ts` las importa para usarlas como `id` de
 * cada paso. Es el contrato entre el cuestionario y la tabla de decision:
 * si alguien cambia un id sin actualizar el otro lado, TypeScript no lo
 * va a atrapar (son strings), pero al menos hay un solo lugar de verdad
 * en vez de dos strings sueltos que se pueden desincronizar en silencio.
 */

// --- Ids de paso ------------------------------------------------------

export const ID_PASO_TIPO_PIEL = "tipo_piel";
export const ID_PASO_PREOCUPACION = "preocupacion_principal";
export const ID_PASO_SOL = "uso_protector_solar";
export const ID_PASO_SUENO = "horas_sueno";
export const ID_PASO_HIDRATACION = "constancia_agua";
export const ID_PASO_ESTRES = "nivel_estres";
export const ID_PASO_FECHA_OBJETIVO = "horizonte_resultados";

// --- Vocabulario de respuestas -----------------------------------------

export type TipoPiel = "grasa" | "mixta" | "seca" | "normal" | "sensible";

export type PreocupacionPiel =
  | "manchas_tono_desigual"
  | "arrugas_perdida_firmeza"
  | "acne_brotes_frecuentes"
  | "poros_dilatados_brillo"
  | "resequedad_sensibilidad"
  | "sin_preocupacion_puntual";

/** Los 4 codigos que puede tener la respuesta del paso 12 (horizonte de resultados). `null` = "no tengo fecha en mente". */
export const HORIZONTES_FECHA_RESULTADOS: Record<string, number | null> = {
  dos_semanas: 14,
  un_mes: 30,
  dos_meses: 60,
  sin_fecha_definida: null,
};

// --- Segmentos ----------------------------------------------------------

export type SegmentoPiel =
  | "luminosidad_antimanchas"
  | "firmeza_antiedad"
  | "control_grasa_acne"
  | "control_poros_textura"
  | "equilibrio_piel_reactiva"
  | "hidratacion_profunda"
  | "mantenimiento_preventivo";

export type ProductoPrescrito = {
  /** Categoria generica del paso del ritual — NUNCA un nombre comercial. Eso se mapea recien en la ficha de producto, fuera del quiz. */
  categoria: string;
  /** Placeholder explicito: todavia no hay mapeo a un producto real de Shopify (SKU, precio) para esta categoria/segmento. */
  notaProducto: "PENDIENTE: mapear a producto real de Shopify";
};

export type FichaSegmentoPiel = FichaSegmentoProducto & {
  nombreInterno: SegmentoPiel;
  /**
   * Minimo de dias, con uso constante, para que sea razonable esperar un
   * cambio visible — varia por tipo de preocupacion (hidratacion se nota
   * rapido, firmeza y manchas tardan meses). Se usa para no prometer una
   * fecha_objetivo mas optimista de lo que la piel (y la logistica)
   * permiten — ver `calcularFechaObjetivo` mas abajo.
   */
  diasResultadoEstimado: number;
};

const PLACEHOLDER_PRODUCTO = "PENDIENTE: mapear a producto real de Shopify" as const;

function producto(categoria: string): ProductoPrescrito {
  return { categoria, notaProducto: PLACEHOLDER_PRODUCTO };
}

export const NOTA_ESTIMACION_PIE =
  "Estimacion basada en tus habitos declarados en el test, no un diagnostico clinico ni una promesa de resultado.";

export const SEGMENTOS_PIEL: Record<SegmentoPiel, FichaSegmentoPiel> = {
  luminosidad_antimanchas: {
    nombreInterno: "luminosidad_antimanchas",
    tipo: "producto",
    tituloDiagnostico: "Manchas y tono desigual",
    descripcionDiagnostico:
      "Tu piel viene marcando manchas y un tono que no es parejo — algo muy comun en piel que recibe sol todo el año. La idea no es una crema milagrosa: es un paso de limpieza, un activo iluminador constante y proteccion solar todos los dias, que es lo que sostiene cualquier avance en el tiempo.",
    notaEstimacion: NOTA_ESTIMACION_PIE,
    ritual: [
      producto("limpiador facial suave"),
      producto("serum iluminador (vitamina C u otro activo antimanchas)"),
      producto("crema con activo despigmentante de uso nocturno"),
      producto("protector solar diario"),
    ],
    diasResultadoEstimado: 60,
    videoId: null,
    iconoUrl: "/images/segmentos/luminosidad_antimanchas.png",
    hrefCatalogo: "/categorias/ritual-de-rostro",
  },
  firmeza_antiedad: {
    nombreInterno: "firmeza_antiedad",
    tipo: "producto",
    tituloDiagnostico: "Firmeza y primeras arrugas",
    descripcionDiagnostico:
      "Notas que la piel perdio algo de firmeza o que ya aparecen primeras arrugas. Ahi el trabajo es de fondo: un activo de firmeza usado con constancia, proteccion solar diaria (el sol sin protector es lo que mas acelera este proceso) y paciencia, porque la piel construye firmeza en semanas, no en dias.",
    notaEstimacion: NOTA_ESTIMACION_PIE,
    ritual: [
      producto("limpiador facial"),
      producto("serum de firmeza"),
      producto("crema para contorno de ojos"),
      producto("protector solar diario"),
    ],
    diasResultadoEstimado: 84,
    videoId: null,
    iconoUrl: "/images/segmentos/firmeza_antiedad.png",
    hrefCatalogo: "/categorias/ritual-de-rostro",
  },
  control_grasa_acne: {
    nombreInterno: "control_grasa_acne",
    tipo: "producto",
    tituloDiagnostico: "Grasa y brotes frecuentes",
    descripcionDiagnostico:
      "Tu piel tiende a producir grasa de mas y eso se te esta traduciendo en brotes. Vamos por un ritual que limpie a fondo sin resecar de mas (resecar tambien dispara mas grasa como respuesta) y que mantenga los poros despejados dia a dia.",
    notaEstimacion: NOTA_ESTIMACION_PIE,
    ritual: [
      producto("limpiador facial para piel grasa"),
      producto("exfoliante o tonico con acido salicilico"),
      producto("serum matificante"),
      producto("protector solar libre de aceite"),
    ],
    diasResultadoEstimado: 30,
    videoId: null,
    iconoUrl: "/images/segmentos/control_grasa_acne.png",
    hrefCatalogo: "/categorias/ritual-de-rostro",
  },
  control_poros_textura: {
    nombreInterno: "control_poros_textura",
    tipo: "producto",
    tituloDiagnostico: "Poros y textura irregular",
    descripcionDiagnostico:
      "Lo que mas te molesta hoy son los poros dilatados y el brillo en ciertas zonas. Ahi trabajamos limpieza profunda, un exfoliante suave que despeje poco a poco y un activo que empareje la textura sin agredir la piel.",
    notaEstimacion: NOTA_ESTIMACION_PIE,
    ritual: [
      producto("limpiador facial"),
      producto("exfoliante suave de uso regular"),
      producto("serum con niacinamida (poros y textura)"),
      producto("protector solar libre de aceite"),
    ],
    diasResultadoEstimado: 30,
    videoId: null,
    iconoUrl: "/images/segmentos/control_poros_textura.png",
    hrefCatalogo: "/categorias/ritual-de-rostro",
  },
  equilibrio_piel_reactiva: {
    nombreInterno: "equilibrio_piel_reactiva",
    tipo: "producto",
    tituloDiagnostico: "Piel sensible o reactiva",
    descripcionDiagnostico:
      "Tu piel se enrojece o se irrita con facilidad, asi que antes de pensar en resultados hay que pensar en calmarla. Un ritual simple, sin fragancia, que reconstruya la barrera de la piel — eso es lo que la deja menos reactiva con el tiempo.",
    notaEstimacion: NOTA_ESTIMACION_PIE,
    ritual: [
      producto("limpiador facial suave sin fragancia"),
      producto("serum calmante"),
      producto("crema reparadora de barrera cutanea"),
      producto("protector solar mineral"),
    ],
    diasResultadoEstimado: 21,
    videoId: null,
    iconoUrl: "/images/segmentos/equilibrio_piel_reactiva.png",
    hrefCatalogo: "/categorias/ritual-de-rostro",
  },
  hidratacion_profunda: {
    nombreInterno: "hidratacion_profunda",
    tipo: "producto",
    tituloDiagnostico: "Resequedad e hidratacion",
    descripcionDiagnostico:
      "Tu piel esta pidiendo hidratacion: se siente tirante o aspera buena parte del dia. Es de las cosas que mas rapido se nota cuando se corrige — un buen limpiador que no reseque, un activo humectante y una crema que selle esa hidratacion.",
    notaEstimacion: NOTA_ESTIMACION_PIE,
    ritual: [
      producto("limpiador facial hidratante"),
      producto("serum de acido hialuronico"),
      producto("crema hidratante profunda"),
      producto("protector solar hidratante"),
    ],
    diasResultadoEstimado: 14,
    videoId: null,
    iconoUrl: "/images/segmentos/hidratacion_profunda.png",
    hrefCatalogo: "/categorias/ritual-de-rostro",
  },
  mantenimiento_preventivo: {
    nombreInterno: "mantenimiento_preventivo",
    tipo: "producto",
    tituloDiagnostico: "Mantenimiento y prevencion",
    descripcionDiagnostico:
      "Tu piel esta relativamente bien y lo que buscas es mantenerla asi. Ahi el enfoque cambia: no se trata de corregir sino de prevenir, con un ritual simple, constante, y proteccion solar todos los dias — la base de cualquier piel sana con el paso del tiempo.",
    notaEstimacion: NOTA_ESTIMACION_PIE,
    ritual: [
      producto("limpiador facial"),
      producto("serum antioxidante"),
      producto("crema hidratante ligera"),
      producto("protector solar diario"),
    ],
    diasResultadoEstimado: 21,
    videoId: null,
    iconoUrl: "/images/segmentos/mantenimiento_preventivo.png",
    hrefCatalogo: "/categorias/ritual-de-rostro",
  },
};

// --- Tabla de decision ---------------------------------------------------

export type ReglaPrescripcionPiel = {
  id: string;
  /** Explicacion en palabras del criterio — para leer la tabla sin ejecutar codigo. */
  descripcion: string;
  cuandoAplica: (respuestas: RespuestasQuiz) => boolean;
  segmento: SegmentoPiel;
};

function tipoPiel(respuestas: RespuestasQuiz): TipoPiel | undefined {
  return respuestas[ID_PASO_TIPO_PIEL] as TipoPiel | undefined;
}

function preocupacion(respuestas: RespuestasQuiz): PreocupacionPiel | undefined {
  return respuestas[ID_PASO_PREOCUPACION] as PreocupacionPiel | undefined;
}

/**
 * Reglas evaluadas EN ORDEN, la primera que aplica gana (como un switch de
 * arriba hacia abajo). La preocupacion principal (paso 3) es el criterio
 * primario; el tipo de piel (paso 2) desempata los casos donde el mismo
 * "que te molesta" pide un ritual distinto segun si la piel es grasa o
 * sensible (acne graso no se trata igual que un brote sobre piel
 * reactiva; resequedad en piel sensible no se trata igual que en piel
 * seca comun).
 */
export const TABLA_DECISION_PIEL: ReglaPrescripcionPiel[] = [
  {
    id: "manchas",
    descripcion: "Preocupacion principal = manchas o tono desigual",
    cuandoAplica: (r) => preocupacion(r) === "manchas_tono_desigual",
    segmento: "luminosidad_antimanchas",
  },
  {
    id: "firmeza",
    descripcion: "Preocupacion principal = arrugas o perdida de firmeza",
    cuandoAplica: (r) => preocupacion(r) === "arrugas_perdida_firmeza",
    segmento: "firmeza_antiedad",
  },
  {
    id: "acne_piel_grasa_o_mixta",
    descripcion:
      "Preocupacion principal = acne/brotes Y tipo de piel = grasa o mixta",
    cuandoAplica: (r) => {
      const p = preocupacion(r);
      const t = tipoPiel(r);
      return p === "acne_brotes_frecuentes" && (t === "grasa" || t === "mixta");
    },
    segmento: "control_grasa_acne",
  },
  {
    id: "acne_piel_no_grasa",
    descripcion:
      "Preocupacion principal = acne/brotes, pero tipo de piel NO es grasa/mixta (seca, normal o sensible) — el brote no viene de exceso de grasa, se trata como reactividad",
    cuandoAplica: (r) => preocupacion(r) === "acne_brotes_frecuentes",
    segmento: "equilibrio_piel_reactiva",
  },
  {
    id: "poros_y_brillo",
    descripcion: "Preocupacion principal = poros dilatados y brillo",
    cuandoAplica: (r) => preocupacion(r) === "poros_dilatados_brillo",
    segmento: "control_poros_textura",
  },
  {
    id: "resequedad_piel_sensible",
    descripcion:
      "Preocupacion principal = resequedad/sensibilidad Y tipo de piel = sensible — se prioriza calmar sobre hidratar",
    cuandoAplica: (r) => {
      const p = preocupacion(r);
      const t = tipoPiel(r);
      return p === "resequedad_sensibilidad" && t === "sensible";
    },
    segmento: "equilibrio_piel_reactiva",
  },
  {
    id: "resequedad_piel_no_sensible",
    descripcion:
      "Preocupacion principal = resequedad/sensibilidad, tipo de piel NO sensible — hidratacion directa",
    cuandoAplica: (r) => preocupacion(r) === "resequedad_sensibilidad",
    segmento: "hidratacion_profunda",
  },
  {
    id: "sin_preocupacion",
    descripcion: "Preocupacion principal = ninguna en particular, quiere mantener",
    cuandoAplica: (r) => preocupacion(r) === "sin_preocupacion_puntual",
    segmento: "mantenimiento_preventivo",
  },
];

/** Red de seguridad si el paso 3 llegara vacio (no deberia pasar: es opcion_unica obligatoria) — nunca deja a alguien sin ritual. */
const SEGMENTO_POR_DEFECTO: SegmentoPiel = "mantenimiento_preventivo";

export function determinarSegmentoPiel(respuestas: RespuestasQuiz): SegmentoPiel {
  const regla = TABLA_DECISION_PIEL.find((r) => r.cuandoAplica(respuestas));
  return regla?.segmento ?? SEGMENTO_POR_DEFECTO;
}

// --- Notas de habitos (pasos 6-9) ----------------------------------------

/**
 * Observaciones puntuales sobre sol/sueno/agua/estres, para complementar
 * el diagnostico del segmento sin inflar la tabla de decision con mas
 * combinaciones. Cada una es honesta sobre ser una estimacion, nunca un
 * hallazgo clinico.
 */
export function generarNotasHabitosPiel(respuestas: RespuestasQuiz): string[] {
  const notas: string[] = [];

  const protector = respuestas[ID_PASO_SOL] as string | undefined;
  if (protector === "nunca" || protector === "a_veces") {
    notas.push(
      "Nos contaste que casi no usas protector solar — es el habito que mas rapido acelera manchas y perdida de firmeza, mas que cualquier crema que le falte a tu rutina.",
    );
  }

  const horasSueno = respuestas[ID_PASO_SUENO] as number | undefined;
  if (typeof horasSueno === "number" && horasSueno < 6) {
    notas.push(
      "Dormir menos de 6 horas le resta a la piel su ventana principal de reparacion nocturna.",
    );
  }

  const constanciaAgua = respuestas[ID_PASO_HIDRATACION] as number | undefined;
  if (typeof constanciaAgua === "number" && constanciaAgua <= 4) {
    notas.push(
      "Tu constancia tomando agua esta baja — la hidratacion de adentro hacia afuera tambien se nota en la piel.",
    );
  }

  const estres = respuestas[ID_PASO_ESTRES] as number | undefined;
  if (typeof estres === "number" && estres >= 7) {
    notas.push(
      "Nos contaste que tus ultimos dias han sido de bastante estres — eso suele mostrarse en la piel como brotes o perdida de luminosidad.",
    );
  }

  return notas;
}

// --- Fecha objetivo -------------------------------------------------------

/**
 * Dias habiles de entrega a usar mientras `funnel_tiempo_entrega_dias` no
 * exista todavia en la tabla `config`. 5 dias habiles cubre el escenario
 * real de la mayoria del pais (ver packages/shared/src/logistica/despacho.ts:
 * 1-2 dias solo en Medellin y su area metropolitana, 3-5 en el resto,
 * incluida Bogota) sin prometer el caso mas rapido.
 *
 * TODO: cuando exista la key `funnel_tiempo_entrega_dias` en `config`,
 * quien llame a `calcularFechaObjetivo` debe leerla en el servidor
 * (mismo patron que `lib/community.ts` -> `getComunidadWhatsappLink`) y
 * pasarla en `opciones.tiempoEntregaDias` en vez de dejar el default.
 */
export const TIEMPO_ENTREGA_DIAS_DEFECTO = 5;

/**
 * Calcula la fecha objetivo a mostrarle/guardarle a la persona: nunca mas
 * optimista que "hoy + tiempo de entrega + minimo realista para ver
 * cambios en su segmento". Si eligio un horizonte mas lejano en el paso
 * 12 (por ejemplo "2 meses" para un segmento que se nota en 2 semanas),
 * se respeta su fecha — la funcion solo pone un piso, nunca reduce lo que
 * la persona pidio.
 *
 * Puro (no toca Supabase ni el reloj salvo por `fechaBase`, que por
 * defecto es "ahora") para poder llamarse tanto en cliente como servidor.
 */
export function calcularFechaObjetivo(
  respuestas: RespuestasQuiz,
  segmento: SegmentoPiel,
  opciones?: { fechaBase?: Date; tiempoEntregaDias?: number },
): Date {
  const codigoHorizonte = respuestas[ID_PASO_FECHA_OBJETIVO] as string | undefined;
  const horizonteDias =
    codigoHorizonte && codigoHorizonte in HORIZONTES_FECHA_RESULTADOS
      ? HORIZONTES_FECHA_RESULTADOS[codigoHorizonte]
      : null;

  const tiempoEntregaDias = opciones?.tiempoEntregaDias ?? TIEMPO_ENTREGA_DIAS_DEFECTO;
  const diasResultado = SEGMENTOS_PIEL[segmento].diasResultadoEstimado;
  const diasMinimosRealistas = tiempoEntregaDias + diasResultado;

  const diasFinal =
    horizonteDias === null ? diasMinimosRealistas : Math.max(horizonteDias, diasMinimosRealistas);

  const fecha = new Date(opciones?.fechaBase ?? new Date());
  fecha.setDate(fecha.getDate() + diasFinal);
  return fecha;
}

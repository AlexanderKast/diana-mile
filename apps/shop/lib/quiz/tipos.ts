import type { QuizPuerta, ZonaOferta } from "@diana-mile/shared/types";

// Re-exportados desde shared: son los mismos valores que la columna
// `puerta`/`zona_oferta` de la tabla `quiz_respuestas` (ver migracion
// 20260752000000_funnel_quiz_plan.sql) — un solo lugar de verdad para el
// enum, no uno local que se puede desincronizar.
export type { QuizPuerta, ZonaOferta };

/**
 * Tipos de paso que el motor sabe renderizar. Cada puerta (piel / energia /
 * peso / sesion / negocio) arma su cuestionario combinando estos, nunca con
 * JSX hardcodeado — ver lib/quiz/puertas/.
 */
export type TipoPaso =
  | "opcion_unica"
  | "opcion_multiple"
  | "escala"
  | "numero"
  | "payoff"
  | "pais"
  | "cargando"
  | "resumen_parcial";

export type Opcion = {
  valor: string;
  etiqueta: string;
  descripcion?: string;
  /** Puntos que suma esta opcion al score de la puerta cuando se elige. */
  puntaje?: number;
  /** Clave del icono a mostrar junto al texto — ver ClaveIcono en _components/quiz/pasos/IconoOpcion.tsx. Opcional: una opcion sin icono simplemente no lo pinta. */
  icono?: string;
  /**
   * Foto ilustrativa de la opcion (persona/ambiente generada, estilo
   * muscle-booster) — vive en public/images/quiz/. Cuando TODAS las
   * opciones de un paso la traen, PasoOpcionUnica cambia a layout de
   * tarjetas con imagen; si alguna no la trae, se ignora en todo el paso.
   */
  imagenUrl?: string;
};

type PasoBase = {
  id: string;
  titulo: string;
  descripcion?: string;
  /**
   * Etapa nombrada a la que pertenece el paso (ej. "Sobre ti", "Tus
   * habitos") — alimenta la barra de progreso segmentada y los logros por
   * seccion completada. Los pasos contiguos con la misma `seccion` forman
   * un tramo; un paso sin seccion hereda visualmente el tramo anterior.
   */
  seccion?: string;
  /**
   * ID del siguiente paso. Si se omite, el motor avanza al siguiente paso
   * en el arreglo `pasos` de la puerta (orden lineal por defecto). Puede
   * ser una funcion para saltos condicionales segun las respuestas
   * acumuladas hasta ese punto (ej. saltar la pregunta de "peso objetivo"
   * si la persona ya dijo que no le interesa bajar de peso).
   */
  siguiente?: string | ((respuestas: RespuestasQuiz) => string | undefined);
};

export type PasoOpcionUnica = PasoBase & {
  tipo: "opcion_unica";
  opciones: Opcion[];
};

export type PasoOpcionMultiple = PasoBase & {
  tipo: "opcion_multiple";
  opciones: Opcion[];
  /** Minimo de opciones que hay que marcar para poder continuar. Por defecto 1. */
  minimo?: number;
  /** Maximo de opciones marcables. Sin tope si se omite. */
  maximo?: number;
};

export type PasoEscala = PasoBase & {
  tipo: "escala";
  min: number;
  max: number;
  etiquetaMin?: string;
  etiquetaMax?: string;
  paso?: number;
  valorInicial?: number;
};

export type PasoNumero = PasoBase & {
  tipo: "numero";
  unidad?: string;
  min?: number;
  max?: number;
  placeholder?: string;
};

/** Pantalla que solo entrega valor (un dato, una micro-educacion) — no pregunta nada, solo tiene boton de continuar. */
export type PasoPayoff = PasoBase & {
  tipo: "payoff";
  contenido: string[];
  textoContinuar?: string;
  /** Imagen ambiente opcional arriba del contenido (public/images/quiz/). */
  imagenUrl?: string;
};

/** Captura de pais — decide en el servidor si la persona ve oferta contraentrega (CO) o plan premium en USD. Ver lib/quiz/paises.ts. */
export type PasoPais = PasoBase & {
  tipo: "pais";
};

/** Pantalla de carga con progreso: avanza sola despues de `duracionMs`, no requiere interaccion. */
export type PasoCargando = PasoBase & {
  tipo: "cargando";
  duracionMs?: number;
  mensajes?: string[];
  /** Imagen ambiente opcional (public/images/quiz/) — reemplaza el fondo generico. */
  imagenUrl?: string;
};

/**
 * Dashboard intermedio (estilo muscle-booster): a mitad del quiz muestra
 * las barras de habito calculadas con lo respondido hasta ahi
 * (`dimensionesHabito` del contrato de la puerta). No pregunta nada, solo
 * boton de continuar. Solo tiene sentido en puertas con dimensiones
 * (piel/energia/peso).
 */
export type PasoResumenParcial = PasoBase & {
  tipo: "resumen_parcial";
  textoContinuar?: string;
};

export type PasoQuiz =
  | PasoOpcionUnica
  | PasoOpcionMultiple
  | PasoEscala
  | PasoNumero
  | PasoPayoff
  | PasoPais
  | PasoCargando
  | PasoResumenParcial;

/**
 * Respuestas acumuladas, indexadas por id de paso. Sin tipar el valor: cada
 * tipo de paso guarda algo distinto (string, string[], number) y el motor
 * es agnostico a eso — quien lee un valor puntual (un `siguiente`
 * condicional, un `calcularResultado`) sabe que tipo de paso escribio ahi.
 */
export type RespuestasQuiz = Record<string, unknown>;

export type Resultado = {
  segmento: string;
  score: number;
  zonaOferta: ZonaOferta;
};

export type Puerta = {
  id: QuizPuerta;
  titulo: string;
  descripcion?: string;
  pasos: PasoQuiz[];
  /** Calcula el resultado final a partir de las respuestas acumuladas y la zona de oferta ya derivada del pais. */
  calcularResultado: (
    respuestas: RespuestasQuiz,
    zonaOferta: ZonaOferta,
  ) => Resultado;
};

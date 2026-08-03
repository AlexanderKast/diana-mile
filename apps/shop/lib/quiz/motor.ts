import type { Puerta, PasoQuiz, RespuestasQuiz } from "./tipos";

const PREFIJO_STORAGE = "milito_quiz_";

export type EstadoQuiz = {
  puertaId: string;
  pasoActualId: string;
  /** Pila de ids de pasos visitados, en orden — permite "volver" sin perder lo respondido en cada uno. */
  historial: string[];
  respuestas: RespuestasQuiz;
  completado: boolean;
};

function claveStorage(puertaId: string): string {
  return `${PREFIJO_STORAGE}${puertaId}`;
}

export function crearEstadoInicial(
  puerta: Puerta,
  respuestasPrevias?: RespuestasQuiz,
): EstadoQuiz {
  return {
    puertaId: puerta.id,
    pasoActualId: puerta.pasos[0]?.id ?? "",
    historial: [],
    respuestas: { ...respuestasPrevias },
    completado: false,
  };
}

/**
 * Salta en cadena los pasos-PREGUNTA que ya tienen respuesta (sembrada de
 * otro test via `respuestasPrevias`) hasta parar en el primer paso
 * pendiente. Los payoff y `cargando` NUNCA se saltan (no son preguntas,
 * son parte de la experiencia), y respeta los `siguiente` condicionales.
 * Cada paso saltado entra al historial — el contador de puntos y la barra
 * reflejan ese avance "regalado" y la persona puede volver atras a
 * cambiarlo si quiere.
 */
export function avanzarHastaPendiente(puerta: Puerta, estado: EstadoQuiz): EstadoQuiz {
  let actual = estado;

  // Tope defensivo: nunca mas iteraciones que pasos tiene la puerta.
  for (let i = 0; i < puerta.pasos.length; i++) {
    const paso = obtenerPaso(puerta, actual.pasoActualId);
    if (!paso) break;
    if (paso.tipo === "payoff" || paso.tipo === "cargando") break;
    if (actual.respuestas[paso.id] === undefined) break;

    const siguienteId = siguientePasoId(puerta, actual.pasoActualId, actual.respuestas);
    if (!siguienteId) break; // no saltar el cierre del quiz

    actual = {
      ...actual,
      historial: [...actual.historial, actual.pasoActualId],
      pasoActualId: siguienteId,
    };
  }

  return actual;
}

/** Autoguardado — se llama en cada avance/retroceso, nunca revienta el flujo si localStorage no esta disponible (SSR, modo privado, cuota llena). */
export function guardarEstado(estado: EstadoQuiz): void {
  try {
    localStorage.setItem(claveStorage(estado.puertaId), JSON.stringify(estado));
  } catch {
    // Best-effort: sin autoguardado la persona simplemente no puede retomar si se sale.
  }
}

/** Retoma un test a medias. Si el paso guardado ya no existe en la config actual de la puerta (cambio de contenido entre visitas), se descarta en vez de dejar al motor en un estado imposible. */
export function cargarEstado(puerta: Puerta): EstadoQuiz | null {
  try {
    const raw = localStorage.getItem(claveStorage(puerta.id));
    if (!raw) return null;

    const estado = JSON.parse(raw) as EstadoQuiz;
    if (!puerta.pasos.some((paso) => paso.id === estado.pasoActualId)) {
      return null;
    }
    return estado;
  } catch {
    return null;
  }
}

export function limpiarEstado(puertaId: string): void {
  try {
    localStorage.removeItem(claveStorage(puertaId));
  } catch {
    // No-op: si no se pudo limpiar, la proxima visita simplemente lo sobreescribe.
  }
}

export function obtenerPaso(puerta: Puerta, id: string): PasoQuiz | undefined {
  return puerta.pasos.find((paso) => paso.id === id);
}

export function indicePaso(puerta: Puerta, id: string): number {
  return puerta.pasos.findIndex((paso) => paso.id === id);
}

/** Progreso 0..1 para la barra visible siempre. Ultimo paso cuenta como completo. */
export function calcularProgreso(puerta: Puerta, estado: EstadoQuiz): number {
  if (estado.completado) return 1;
  const total = puerta.pasos.length;
  if (total <= 1) return 0;
  const indice = indicePaso(puerta, estado.pasoActualId);
  if (indice === -1) return 0;
  return indice / (total - 1);
}

/**
 * Etapas nombradas de la puerta, en orden de aparicion — alimenta la barra
 * segmentada y los logros por seccion. Un paso sin `seccion` hereda la del
 * paso anterior (los tramos son contiguos por diseño).
 */
export function seccionesDePuerta(puerta: Puerta): string[] {
  const vistas: string[] = [];
  for (const paso of puerta.pasos) {
    if (paso.seccion && !vistas.includes(paso.seccion)) {
      vistas.push(paso.seccion);
    }
  }
  return vistas;
}

/** Seccion a la que pertenece un paso (heredando hacia atras si el paso no la declara). `null` si la puerta no usa secciones. */
export function seccionActual(puerta: Puerta, pasoId: string): string | null {
  let actual: string | null = null;
  for (const paso of puerta.pasos) {
    if (paso.seccion) actual = paso.seccion;
    if (paso.id === pasoId) return actual;
  }
  return null;
}

/** Valida si una respuesta cumple lo minimo del paso para poder continuar. Los pasos que se auto-avanzan (opcion_unica, payoff, cargando) no pasan por aca — se validan al elegir. */
export function esRespuestaValida(paso: PasoQuiz, valor: unknown): boolean {
  switch (paso.tipo) {
    case "opcion_multiple": {
      const seleccion = Array.isArray(valor) ? valor : [];
      const minimo = paso.minimo ?? 1;
      const maximo = paso.maximo;
      if (seleccion.length < minimo) return false;
      if (maximo !== undefined && seleccion.length > maximo) return false;
      return true;
    }
    case "escala":
      return typeof valor === "number" && valor >= paso.min && valor <= paso.max;
    case "numero": {
      if (typeof valor !== "number" || Number.isNaN(valor)) return false;
      if (paso.min !== undefined && valor < paso.min) return false;
      if (paso.max !== undefined && valor > paso.max) return false;
      return true;
    }
    case "pais":
      return typeof valor === "string" && valor.length > 0;
    case "opcion_unica":
      return typeof valor === "string" && valor.length > 0;
    default:
      return true;
  }
}

/** Resuelve el siguiente id de paso: salto condicional del paso actual, o el siguiente en el arreglo si no define uno. `undefined` significa "no hay mas pasos, el quiz termino". */
export function siguientePasoId(
  puerta: Puerta,
  pasoActualId: string,
  respuestas: RespuestasQuiz,
): string | undefined {
  const paso = obtenerPaso(puerta, pasoActualId);
  if (!paso) return undefined;

  if (paso.siguiente) {
    return typeof paso.siguiente === "function"
      ? paso.siguiente(respuestas)
      : paso.siguiente;
  }

  const indice = indicePaso(puerta, pasoActualId);
  return puerta.pasos[indice + 1]?.id;
}

/**
 * Avanza un paso. `valor` es la respuesta del paso que se esta dejando
 * atras (se omite en pasos que no producen respuesta, ej. payoff/cargando).
 * Persiste automaticamente en localStorage.
 */
export function avanzar(
  puerta: Puerta,
  estado: EstadoQuiz,
  valor?: unknown,
): EstadoQuiz {
  const respuestas =
    valor === undefined
      ? estado.respuestas
      : { ...estado.respuestas, [estado.pasoActualId]: valor };

  const siguienteId = siguientePasoId(puerta, estado.pasoActualId, respuestas);

  const nuevoEstado: EstadoQuiz = {
    ...estado,
    respuestas,
    historial: [...estado.historial, estado.pasoActualId],
    pasoActualId: siguienteId ?? estado.pasoActualId,
    completado: siguienteId === undefined,
  };

  guardarEstado(nuevoEstado);
  return nuevoEstado;
}

/** Vuelve al paso anterior visitado (no al anterior en el arreglo — respeta saltos condicionales). No pierde ninguna respuesta ya dada. */
export function retroceder(estado: EstadoQuiz): EstadoQuiz {
  if (estado.historial.length === 0) return estado;

  const historial = estado.historial.slice(0, -1);
  const pasoActualId = estado.historial[estado.historial.length - 1];

  const nuevoEstado: EstadoQuiz = {
    ...estado,
    historial,
    pasoActualId,
    completado: false,
  };

  guardarEstado(nuevoEstado);
  return nuevoEstado;
}

/** Suma los puntajes de las opciones elegidas en pasos de opcion unica/multiple. Los demas tipos de paso no aportan score por diseño — lo calcula `calcularResultado` de cada puerta si lo necesita. */
export function calcularScore(puerta: Puerta, respuestas: RespuestasQuiz): number {
  let score = 0;

  for (const paso of puerta.pasos) {
    if (paso.tipo !== "opcion_unica" && paso.tipo !== "opcion_multiple") continue;

    const valor = respuestas[paso.id];
    if (valor === undefined) continue;

    const valores = Array.isArray(valor) ? valor : [valor];
    for (const v of valores) {
      const opcion = paso.opciones.find((o) => o.valor === v);
      if (opcion?.puntaje) score += opcion.puntaje;
    }
  }

  return score;
}

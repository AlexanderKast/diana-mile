/**
 * Lead scoring explicable.
 *
 * NO es un modelo entrenado y no pretende serlo. Con decenas de pedidos no hay
 * volumen para entrenar nada, y un numero que sale de una caja negra sin datos
 * detras es peor que no tener numero: se ve preciso y no lo es.
 *
 * Aca cada punto tiene nombre. El panel puede mostrar POR QUE un lead esta
 * caliente, y cuando el negocio crezca se recalibran los pesos mirando que
 * senales de verdad predijeron la venta.
 *
 * Vive en `shared` a proposito: lo usan igual el agente de WhatsApp (para
 * decidir si toca calificar o cerrar) y el panel (para pintar el tablero). Si
 * cada uno tuviera su formula, la tarjeta diria una cosa y el agente actuaria
 * segun otra.
 */

export type EtapaLead =
  | "nuevo"
  | "calificado"
  | "negociacion"
  | "cerrado"
  | "perdido";

export type TemperaturaLead = "frio" | "tibio" | "caliente";

export const ETAPAS: EtapaLead[] = [
  "nuevo",
  "calificado",
  "negociacion",
  "cerrado",
  "perdido",
];

export const ETIQUETA_ETAPA: Record<EtapaLead, string> = {
  nuevo: "Nuevo lead",
  calificado: "Calificado",
  negociacion: "En negociación",
  cerrado: "Cerrado",
  perdido: "Perdido",
};

/**
 * Las senales que se pueden observar hoy con los datos que ya existen. Si una
 * no se sabe, se deja `undefined` y simplemente no suma: no se penaliza por
 * falta de informacion, que es lo que hace que un scoring castigue a los leads
 * nuevos por el solo hecho de ser nuevos.
 */
export type SenalesLead = {
  // — Intencion declarada (lo que dijo con todas las letras)
  pidioPrecio?: boolean;
  preguntoEnvioASuCiudad?: boolean;
  pidioFotoOInfo?: boolean;
  dijoQueLoQuiere?: boolean;

  // — Comportamiento (lo que hizo)
  mensajesEnviados?: number;
  respondioEnMenosDeUnaHora?: boolean;
  volvioOtroDia?: boolean;
  abrioLinkDeProducto?: boolean;
  llegoAlCheckout?: boolean;

  // — Encaje (que tan comprable es para ESTA tienda)
  ciudadConRecaudo?: boolean;
  productoContraentrega?: boolean;
  ticketDentroDelTope?: boolean;

  // — Recencia
  diasDesdeUltimaInteraccion?: number;

  // — Friccion (lo que resta)
  objecionSinResolver?: boolean;
  pidioCancelar?: boolean;
  vecesQueNoContesto?: number;
};

export type DetalleScore = {
  senal: string;
  puntos: number;
};

export type ResultadoScore = {
  score: number;
  temperatura: TemperaturaLead;
  detalle: DetalleScore[];
};

const TOPE_INTENCION = 30;
const TOPE_COMPORTAMIENTO = 30;
const TOPE_ENCAJE = 20;
const TOPE_RECENCIA = 15;
const TOPE_FRICCION = -30;

/**
 * Techo duro para quien pidio cancelar.
 *
 * Sin esto, alguien que hizo todo bien y al final dijo "cancelame el pedido"
 * salia CALIENTE, porque los positivos acumulados pesaban mas que la resta. Y
 * un tablero que pone a esa persona arriba del todo hace que la llames a
 * venderle justo cuando lo que queria era irse. Restar no basta: hay senales
 * que tapan a las demas.
 */
const TECHO_TRAS_CANCELAR = 55;

/** Suma sin pasarse del tope del bloque, y va anotando de donde salio cada punto. */
function bloque(
  detalle: DetalleScore[],
  tope: number,
  items: [string, boolean | undefined, number][],
): number {
  let suma = 0;
  for (const [senal, activa, puntos] of items) {
    if (!activa) continue;
    const cabe = Math.max(0, tope - suma);
    const aplicados = Math.min(puntos, cabe);
    if (aplicados === 0) continue;
    suma += aplicados;
    detalle.push({ senal, puntos: aplicados });
  }
  return suma;
}

/**
 * Cuanto pesa que la persona escribio hace poco.
 *
 * Un lead de hace dos meses que nunca volvio no es caliente aunque en su dia
 * preguntara precio. La recencia es lo que evita que el tablero se llene de
 * fantasmas con score alto.
 */
function puntosPorRecencia(dias: number | undefined): number {
  if (dias === undefined) return 0;
  if (dias <= 1) return TOPE_RECENCIA;
  if (dias <= 3) return 12;
  if (dias <= 7) return 8;
  if (dias <= 14) return 4;
  if (dias <= 30) return 1;
  return 0;
}

export function calcularScore(senales: SenalesLead): ResultadoScore {
  const detalle: DetalleScore[] = [];

  // Llegar al checkout cuenta en los dos bloques a proposito: dar nombre,
  // telefono y producto y frenarse en la direccion es a la vez una intencion
  // declarada y un comportamiento. Es la senal mas predictiva que existe en
  // contraentrega, y contarla una sola vez la dejaba corta.
  const intencion = bloque(detalle, TOPE_INTENCION, [
    ["Dijo que lo quiere", senales.dijoQueLoQuiere, 14],
    ["Llegó al checkout (intención)", senales.llegoAlCheckout, 8],
    ["Preguntó envío a su ciudad", senales.preguntoEnvioASuCiudad, 8],
    ["Pidió precio", senales.pidioPrecio, 6],
    ["Pidió foto o información", senales.pidioFotoOInfo, 4],
  ]);

  const comportamiento = bloque(detalle, TOPE_COMPORTAMIENTO, [
    ["Llegó al checkout", senales.llegoAlCheckout, 25],
    ["Volvió otro día", senales.volvioOtroDia, 6],
    ["Respondió en menos de una hora", senales.respondioEnMenosDeUnaHora, 4],
    ["Abrió el link del producto", senales.abrioLinkDeProducto, 4],
    ["Conversación sostenida (4+ mensajes)", (senales.mensajesEnviados ?? 0) >= 4, 4],
  ]);

  const encaje = bloque(detalle, TOPE_ENCAJE, [
    ["Su ciudad admite contraentrega", senales.ciudadConRecaudo, 10],
    ["El producto es contraentrega", senales.productoContraentrega, 6],
    ["El ticket cabe en el tope COD", senales.ticketDentroDelTope, 4],
  ]);

  const recencia = puntosPorRecencia(senales.diasDesdeUltimaInteraccion);
  if (recencia > 0) {
    detalle.push({ senal: "Interacción reciente", puntos: recencia });
  }

  // La friccion se resta y tiene su propio tope, para que un solo tropiezo no
  // mande a cero a alguien que por lo demas esta listo para comprar.
  let friccion = 0;
  const restar = (senal: string, activa: boolean | undefined, puntos: number) => {
    if (!activa) return;
    const cabe = Math.max(0, TOPE_FRICCION - friccion);
    const aplicados = Math.max(-puntos, cabe);
    if (aplicados === 0) return;
    friccion += aplicados;
    detalle.push({ senal, puntos: aplicados });
  };
  restar("Pidió cancelar", senales.pidioCancelar, 20);
  restar("Objeción sin resolver", senales.objecionSinResolver, 8);
  restar("No contesta (2+ veces)", (senales.vecesQueNoContesto ?? 0) >= 2, 8);

  const bruto = intencion + comportamiento + encaje + recencia + friccion;
  let score = Math.max(0, Math.min(100, Math.round(bruto)));

  if (senales.pidioCancelar && score > TECHO_TRAS_CANCELAR) {
    detalle.push({
      senal: `Techo por cancelación (${TECHO_TRAS_CANCELAR})`,
      puntos: TECHO_TRAS_CANCELAR - score,
    });
    score = TECHO_TRAS_CANCELAR;
  }

  return { score, temperatura: temperaturaDe(score), detalle };
}

export function temperaturaDe(score: number): TemperaturaLead {
  if (score >= 70) return "caliente";
  if (score >= 40) return "tibio";
  return "frio";
}

/**
 * Probabilidad de cierre por etapa x temperatura.
 *
 * Estos numeros son un PUNTO DE PARTIDA conservador, no una medicion: la
 * tienda todavia no tiene volumen para calcular tasas reales. Se dejan aca,
 * visibles y en un solo sitio, para que el dia que haya datos se reemplacen
 * mirando la conversion observada — no para que alguien los lea como si
 * salieran de un estudio.
 */
const PROBABILIDAD_BASE: Record<EtapaLead, Record<TemperaturaLead, number>> = {
  nuevo: { frio: 2, tibio: 8, caliente: 15 },
  calificado: { frio: 6, tibio: 18, caliente: 32 },
  negociacion: { frio: 15, tibio: 35, caliente: 60 },
  cerrado: { frio: 100, tibio: 100, caliente: 100 },
  perdido: { frio: 0, tibio: 0, caliente: 0 },
};

export function probabilidadDeCierre(
  etapa: EtapaLead,
  temperatura: TemperaturaLead,
): number {
  return PROBABILIDAD_BASE[etapa][temperatura];
}

/**
 * La fase del agente sale del MISMO score que pinta el tablero.
 *
 * Asi el agente no puede estar pidiendo direccion a alguien que la tarjeta
 * muestra como frio, ni volver a calificar a quien ya esta listo para cerrar.
 */
export type FaseAgente = "descubrimiento" | "propuesta" | "cierre";

export function faseDelAgente(score: number): FaseAgente {
  if (score >= 70) return "cierre";
  if (score >= 40) return "propuesta";
  return "descubrimiento";
}

/** Todo junto, que es como lo consumen el agente y el panel. */
export function evaluarLead(
  senales: SenalesLead,
  etapa: EtapaLead = "nuevo",
): ResultadoScore & { probabilidad: number; fase: FaseAgente } {
  const resultado = calcularScore(senales);
  return {
    ...resultado,
    probabilidad: probabilidadDeCierre(etapa, resultado.temperatura),
    fase: faseDelAgente(resultado.score),
  };
}

/**
 * Ventana horaria de envio (hora de Colombia).
 *
 * Aplica solo a lo que la marca inicia: recordatorios, seguimientos,
 * remarketing, mensaje diario. Un WhatsApp a las 3 de la manana molesta,
 * hace que bloqueen el numero y le baja la calificacion a la linea.
 *
 * NO aplica a las respuestas del agente: si alguien escribe de madrugada
 * se le contesta de madrugada, porque ahi la conversacion la abrio ella.
 * Tampoco a la confirmacion de un pedido recien hecho — es la respuesta
 * inmediata a algo que la persona acaba de hacer, y en contraentrega
 * confirmar rapido es lo que sostiene la venta.
 */

/** Colombia es UTC-5 todo el ano: no tiene horario de verano. */
const OFFSET_COLOMBIA_MIN = -5 * 60;

export const HORA_INICIO = 7;
export const HORA_FIN = 22;

/** La hora de Colombia en este momento (0-23). */
export function horaColombiana(ahora: Date = new Date()): number {
  const utc = ahora.getTime() + ahora.getTimezoneOffset() * 60_000;
  return new Date(utc + OFFSET_COLOMBIA_MIN * 60_000).getHours();
}

/** ¿Estamos dentro de la franja en la que se puede escribir primero? */
export function enHorarioDeEnvio(ahora: Date = new Date()): boolean {
  const hora = horaColombiana(ahora);
  return hora >= HORA_INICIO && hora < HORA_FIN;
}

/**
 * El proximo momento habil para enviar. Si ya estamos dentro de la franja
 * devuelve ahora mismo; si no, las 7 de la manana siguiente en Colombia.
 */
export function proximaVentana(ahora: Date = new Date()): Date {
  if (enHorarioDeEnvio(ahora)) return ahora;

  const hora = horaColombiana(ahora);
  const destino = new Date(ahora);

  // Despues de las 10pm hay que saltar al dia siguiente; antes de las 7am
  // basta con esperar unas horas del mismo dia.
  const horasFaltantes =
    hora >= HORA_FIN ? 24 - hora + HORA_INICIO : HORA_INICIO - hora;

  destino.setTime(ahora.getTime() + horasFaltantes * 3600_000);
  // Se deja en punto para que los envios diferidos no salgan todos en el
  // mismo segundo con la hora exacta en que se encolaron.
  destino.setMinutes(0, 0, 0);
  return destino;
}

/** Tipos de mensaje que salen a cualquier hora. */
const SIEMPRE: readonly string[] = ["confirmacion", "escalamiento", "manual"];

/**
 * ¿Este tipo de mensaje respeta la franja?
 *
 * La confirmacion de pedido y los avisos internos salen siempre: el
 * primero porque responde a algo que la clienta acaba de hacer, el
 * segundo porque va dirigido al equipo, no a un cliente.
 */
export function puedeEnviarseAhora(
  tipo: string,
  ahora: Date = new Date(),
): boolean {
  if (SIEMPRE.includes(tipo)) return true;
  return enHorarioDeEnvio(ahora);
}

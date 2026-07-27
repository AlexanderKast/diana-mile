/**
 * Aplica las reglas duras de formato sobre lo que responde el modelo.
 *
 * El prompt las pide, pero un modelo las incumple cada tantas respuestas.
 * Las reglas que se pueden arreglar sin cambiar el sentido (markdown,
 * emojis de mas) se corrigen aqui; las que dependen del contenido
 * (varias preguntas, mensaje muy largo) se detectan para pedir una
 * reescritura, porque recortarlas a ciegas dejaria frases mutiladas.
 */

const RE_EMOJI = /\p{Extended_Pictographic}/gu;

export type OpcionesFormato = {
  /** Conversacion de soporte: ahi no va ningun emoji. */
  soporte?: boolean;
  /** La persona se esta despidiendo: no debe cerrar con pregunta. */
  despedida?: boolean;
};

const MAX_LINEAS = 3;

/** Correcciones seguras, que no cambian lo que dice el mensaje. */
export function limpiarFormato(texto: string, opciones: OpcionesFormato = {}): string {
  let limpio = texto.trim();

  // WhatsApp no entiende markdown: **negrita** se ve con los asteriscos.
  limpio = limpio.replace(/\*\*(.+?)\*\*/g, "*$1*");
  // Encabezados y vinetas de lista, que el prompt prohibe pero se cuelan.
  limpio = limpio.replace(/^#{1,6}\s*/gm, "");
  limpio = limpio.replace(/^\s*[-•]\s+/gm, "");
  // Links en formato markdown → link pelado.
  limpio = limpio.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, "$2");

  const maxEmojis = opciones.soporte ? 0 : 2;
  let vistos = 0;
  limpio = limpio.replace(RE_EMOJI, (emoji) => {
    vistos++;
    return vistos <= maxEmojis ? emoji : "";
  });

  // Los emojis quitados pueden dejar espacios dobles o espacios antes de
  // signos de puntuacion.
  limpio = limpio
    .replace(/[ \t]{2,}/g, " ")
    .replace(/ +([.,;!?])/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((l) => l.trimEnd())
    .join("\n")
    .trim();

  return limpio;
}

/**
 * Devuelve los problemas que quedan y que solo el modelo puede arreglar.
 * Vacio = el mensaje esta listo para enviar.
 */
export function problemasDeFormato(
  texto: string,
  opciones: OpcionesFormato = {},
): string[] {
  const problemas: string[] = [];

  const lineas = texto.split("\n").filter((l) => l.trim()).length;
  // Se tolera una linea de mas si el mensaje es corto: pedir una
  // reescritura cuesta varios segundos de espera para la persona, y por
  // cuatro lineas breves no vale la pena hacerla esperar.
  const largoRazonable = texto.length <= 300;
  if (lineas > MAX_LINEAS && !(lineas === MAX_LINEAS + 1 && largoRazonable)) {
    problemas.push(
      `tiene ${lineas} lineas y el maximo son ${MAX_LINEAS}: dejalo mas corto`,
    );
  }

  const preguntas = (texto.match(/\?/g) ?? []).length;
  if (opciones.despedida && preguntas > 0) {
    problemas.push(
      "la persona se esta despidiendo: no le hagas ninguna pregunta, solo despidete corto y calido",
    );
  } else if (preguntas > 1) {
    problemas.push(
      `tiene ${preguntas} preguntas y debe tener UNA sola: unelas en una o deja solo la mas util`,
    );
  }

  return problemas;
}

/** Detecta si la persona se esta despidiendo o cerrando la conversacion. */
export function pareceDespedida(mensaje: string): boolean {
  const t = mensaje
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  return /\b(gracias|chao|chau|adios|hasta luego|nos hablamos|despues te escribo|despues miro|luego te escribo|ahorita miro|listo gracias|ok gracias|dale gracias)\b/.test(
    t,
  );
}

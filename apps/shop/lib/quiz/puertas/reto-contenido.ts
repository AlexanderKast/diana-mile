/**
 * Contenido de los 7 dias del reto — el periodo de venta del funnel.
 *
 * Data-driven a proposito: ni `mi-plan/reto/page.tsx` ni los endpoints de
 * `/api/reto/**` (que n8n consulta para armar el mensaje de WhatsApp del
 * dia) tienen copy escrito adentro. Los dos leen de aca, asi el texto de
 * cada dia es identico se viva desde el panel web o desde WhatsApp.
 *
 * VOZ: siempre Milito (nunca "Diana" — ver AGENTS.md). Cero testimonios
 * inventados, cero antes/despues, cero urgencia fabricada (la unica
 * urgencia real es el corte de despacho, ver
 * `packages/shared/src/logistica/despacho.ts`), cero promesa de resultado.
 *
 * DIA 7 es el unico que se bifurca por `zona_oferta`: para `usd_premium`
 * cierra invitando al coaching 1 a 1 (`/coach`); para `co_cod` cierra
 * invitando a la comunidad y a completar la compra si no lo hizo todavia,
 * sin mencionar coaching — por eso `obtenerContenidoReto` recibe la zona
 * en vez de que el dia 7 sea una sola fila fija.
 */

export type ZonaOferta = "co_cod" | "usd_premium";

/**
 * Que tanto empuja a comprar el mensaje de ese dia:
 *   - "ninguna": puro valor, sin CTA de compra.
 *   - "suave": menciona el ritual o la compra de pasada, sin presionar.
 *   - "fuerte": oferta explicita con CTA de compra.
 *   - "coaching": invita al coaching 1 a 1 (solo aplica al dia 7, usd_premium).
 */
export type TipoVentaReto = "ninguna" | "suave" | "fuerte" | "coaching";

export type ContenidoDiaReto = {
  dia: number;
  titulo: string;
  contenido: string;
  tipoVenta: TipoVentaReto;
};

export const TOTAL_DIAS_RETO = 7;

const DIA_1: ContenidoDiaReto = {
  dia: 1,
  titulo: "Tu primer paso",
  contenido:
    "Hola, soy Milito. Arrancamos el reto de 7 dias con lo mas facil de todo tu plan: un solo paso, el que menos tiempo te quita hoy. No hace falta que hagas la rutina completa todavia — solo ese paso, bien hecho, es tu tarea de hoy. Cuando lo hagas, marcalo como completado aca mismo.",
  tipoVenta: "ninguna",
};

const DIA_2: ContenidoDiaReto = {
  dia: 2,
  titulo: "El error mas comun",
  contenido:
    "Segundo dia. Te cuento el error #1 que veo repetirse mas en perfiles como el tuyo — normalmente no es falta de producto, es un habito que sin querer le resta al resultado. Identificalo hoy y ya vas adelante de la mayoria. Nada que comprar, solo ajustar como lo estas haciendo.",
  tipoVenta: "ninguna",
};

const DIA_3: ContenidoDiaReto = {
  dia: 3,
  titulo: "Como se acelera",
  contenido:
    "Dia 3. Con el paso de ayer y el de hoy ya vas construyendo el habito. Te cuento algo que acelera el proceso sin complicarlo: seguir el ritual completo que te recomendamos en tu diagnostico, en el orden correcto, es lo que mas marca la diferencia con el tiempo — no hay afan, es simplemente lo que mas rinde cuando ya llevas unos dias de constancia.",
  tipoVenta: "suave",
};

const DIA_4: ContenidoDiaReto = {
  dia: 4,
  titulo: "Un caso como el tuyo",
  contenido:
    "Dia 4. Asi suele verse un caso con este mismo diagnostico: al principio cuesta acordarse del paso nuevo, y hacia la primera o segunda semana ya empieza a sentirse mas natural, parte de la rutina sin pensarlo. No es una promesa de resultado — cada piel y cada cuerpo responden distinto — pero si es lo que mas veo repetirse en la constancia.",
  tipoVenta: "ninguna",
};

const DIA_5: ContenidoDiaReto = {
  dia: 5,
  titulo: "Tu ritual, explicado",
  contenido:
    "Dia 5. Te explico por que el ritual que te recomendamos esta armado asi: cada paso cumple una funcion puntual, y quitar uno le resta a los demas. Si todavia no lo tienes completo, este es el momento de completarlo — no hay descuento inventado ni cuenta regresiva falsa, la unica fecha real es el corte de despacho del dia.",
  tipoVenta: "fuerte",
};

const DIA_6: ContenidoDiaReto = {
  dia: 6,
  titulo: "Tus dudas, resueltas",
  contenido:
    "Dia 6, casi terminamos. Las preguntas que mas me hacen en esta etapa: si se puede usar con otros productos que ya tenes (por lo general si, pero preguntame tu caso puntual), cuanto se demora en notarse (varia por persona, no hay una fecha unica) y que hacer si algun paso no te esta cayendo bien (se ajusta, no se abandona). Si tenes otra duda, escribime.",
  tipoVenta: "ninguna",
};

/** Dia 7 para zona_oferta = usd_premium: cierra invitando al coaching 1 a 1. */
const DIA_7_COACHING: ContenidoDiaReto = {
  dia: 7,
  titulo: "Que sigue",
  contenido:
    "Llegaste al dia 7. En esta semana armaste el habito — lo dificil ya lo hiciste. Si queres acompañamiento mas cercano para sostenerlo y ajustarlo a tu ritmo, el coaching 1 a 1 conmigo es el siguiente paso. Nada obligatorio: tu plan sigue funcionando igual sin el.",
  tipoVenta: "coaching",
};

/**
 * Dia 7 para zona_oferta = co_cod: cierra invitando a la comunidad y a
 * completar la compra si no lo hizo, SIN mencionar coaching (esa oferta no
 * existe para esta zona).
 */
const DIA_7_COMUNIDAD: ContenidoDiaReto = {
  dia: 7,
  titulo: "Que sigue",
  contenido:
    "Llegaste al dia 7. En esta semana armaste el habito — lo dificil ya lo hiciste. Si todavia no completaste tu pedido, este es un buen momento para hacerlo y no perder la constancia que ya llevas. Y si queres seguir acompañada, te espero en la comunidad: ahi seguimos con tips y espacio para tus preguntas.",
  tipoVenta: "suave",
};

/**
 * Puertas con reto propio. `sesion`/`negocio` no entran a /mi-plan (su
 * funnel cierra en WhatsApp) — si una cuenta llega con esas puertas,
 * `resolverPuertaUsuario` de lib/reto.ts ya cae a "piel".
 */
export type PuertaReto = "piel" | "energia" | "peso";

export function esPuertaReto(valor: unknown): valor is PuertaReto {
  return valor === "piel" || valor === "energia" || valor === "peso";
}

/**
 * Dias 1-6 de ENERGIA — misma cadencia de venta que piel (3 suave, 5
 * fuerte). Compliance dura (persuasion.ts, regla li-03): PROHIBIDO
 * atribuirle a un suplemento efectos sobre energia/sueño — todo el copy
 * habla de HABITOS (horario de sueño, movimiento, agua, constancia) y la
 * venta habla de "completar tu ritual de bienestar", nunca de que un
 * producto de energia.
 */
const DIAS_ENERGIA: Record<number, ContenidoDiaReto> = {
  1: {
    dia: 1,
    titulo: "Tu primer paso",
    contenido:
      "Hola, soy Milito. Arrancamos el reto de 7 dias por lo mas facil de tu plan de energia: hoy solo elegi UNA hora fija para acostarte y cumplila. Nada mas. El horario de sueño es la base de todo lo demas — cuando lo hagas, marcalo como completado aca mismo.",
    tipoVenta: "ninguna",
  },
  2: {
    dia: 2,
    titulo: "El error mas comun",
    contenido:
      "Segundo dia. El error #1 que veo en perfiles como el tuyo: esperar a 'tener energia' para moverse. Funciona al reves — moverse un poco es lo que despierta el cuerpo. Hoy tu tarea es una caminata corta o unos estiramientos de 5 minutos, a la hora que sea. Nada que comprar, solo empezar.",
    tipoVenta: "ninguna",
  },
  3: {
    dia: 3,
    titulo: "Como se acelera",
    contenido:
      "Dia 3. Ya llevas dos habitos andando. Lo que mas acelera el proceso es la constancia del ritual completo que te recomendamos en tu diagnostico — sueño, movimiento, hidratacion y tu rutina de bienestar, en conjunto. No hay afan: es simplemente lo que mas rinde cuando los habitos se sostienen juntos.",
    tipoVenta: "suave",
  },
  4: {
    dia: 4,
    titulo: "Un caso como el tuyo",
    contenido:
      "Dia 4. Asi suele verse un caso con este mismo diagnostico: la primera semana cuesta sostener el horario y el movimiento, y hacia la segunda ya se siente mas natural arrancar el dia. No es una promesa — cada cuerpo responde distinto — pero si es lo que mas se repite cuando hay constancia.",
    tipoVenta: "ninguna",
  },
  5: {
    dia: 5,
    titulo: "Tu ritual, explicado",
    contenido:
      "Dia 5. Tu ritual de bienestar esta armado para acompañar los habitos que ya estas construyendo — cada pieza cumple una funcion dentro de tu rutina diaria. Si todavia no lo tienes completo, este es buen momento para completarlo: sin descuento inventado ni cuenta regresiva falsa, la unica fecha real es el corte de despacho del dia.",
    tipoVenta: "fuerte",
  },
  6: {
    dia: 6,
    titulo: "Tus dudas, resueltas",
    contenido:
      "Dia 6, casi terminamos. Lo que mas me preguntan en esta etapa: si el ritual se puede combinar con lo que ya tomas o usas (por lo general si, pero preguntame tu caso puntual), cuanto tarda en sentirse el cambio de habitos (varia por persona) y que hacer un dia que no cumplas el horario (retomar al dia siguiente, sin culpa). ¿Otra duda? Escribime.",
    tipoVenta: "ninguna",
  },
};

/**
 * Dias 1-6 de PESO — misma cadencia. Compliance: cero cifras de peso,
 * cero promesa de bajar/subir, cero comentario del cuerpo; todo es
 * movimiento, alimentacion con orden y descanso.
 */
const DIAS_PESO: Record<number, ContenidoDiaReto> = {
  1: {
    dia: 1,
    titulo: "Tu primer paso",
    contenido:
      "Hola, soy Milito. Arrancamos el reto de 7 dias por lo mas simple de tu plan: hoy solo vas a fijar los HORARIOS de tus comidas de mañana — a que hora desayunas, almuerzas y cenas. No cambiamos que comes todavia, solo cuando. El orden va primero. Cuando lo tengas, marcalo como completado.",
    tipoVenta: "ninguna",
  },
  2: {
    dia: 2,
    titulo: "El error mas comun",
    contenido:
      "Segundo dia. El error #1 que veo en perfiles como el tuyo: empezar con restricciones fuertes que se abandonan en una semana. La constancia moderada le gana a la perfeccion corta, siempre. Hoy tu tarea: cumplir los horarios de ayer y sumar una caminata corta. Nada de prohibirte cosas todavia.",
    tipoVenta: "ninguna",
  },
  3: {
    dia: 3,
    titulo: "Como se acelera",
    contenido:
      "Dia 3. Ya llevas orden y movimiento. Lo que mas ayuda a sostener el proceso es el ritual completo que te recomendamos en tu diagnostico — es el companero de los habitos que estas construyendo, no un reemplazo de ellos. Sin afan: cuando quieras completarlo, ahi esta.",
    tipoVenta: "suave",
  },
  4: {
    dia: 4,
    titulo: "Un caso como el tuyo",
    contenido:
      "Dia 4. Asi suele verse un caso con este mismo diagnostico: la primera semana cuesta sostener horarios y movimiento a la vez, y despues el cuerpo empieza a pedir la rutina solo. No te prometo un numero ni una fecha — cada cuerpo responde distinto — pero la constancia es lo que mas se repite en quienes avanzan.",
    tipoVenta: "ninguna",
  },
  5: {
    dia: 5,
    titulo: "Tu ritual, explicado",
    contenido:
      "Dia 5. Tu ritual esta armado para acompañar el orden que ya estas construyendo: cada pieza tiene su lugar dentro de tu dia. Si todavia no lo tienes completo, este es buen momento — sin descuento inventado ni cuenta regresiva falsa, la unica fecha real es el corte de despacho del dia.",
    tipoVenta: "fuerte",
  },
  6: {
    dia: 6,
    titulo: "Tus dudas, resueltas",
    contenido:
      "Dia 6, casi terminamos. Lo que mas me preguntan: si hay que dejar de comer algo por completo (no — orden y porciones antes que prohibiciones), que pasa si un dia se rompe la rutina (se retoma al siguiente, sin castigo) y como combinar el ritual con las comidas (preguntame tu caso puntual). ¿Otra duda? Escribime.",
    tipoVenta: "ninguna",
  },
};

const DIAS_PIEL: Record<number, ContenidoDiaReto> = {
  1: DIA_1,
  2: DIA_2,
  3: DIA_3,
  4: DIA_4,
  5: DIA_5,
  6: DIA_6,
};

/** Cada funnel con su propio plan de 7 dias (decision de Alexander 2026-08-03). */
const CONTENIDO_POR_PUERTA: Record<PuertaReto, Record<number, ContenidoDiaReto>> = {
  piel: DIAS_PIEL,
  energia: DIAS_ENERGIA,
  peso: DIAS_PESO,
};

/**
 * Punto de entrada unico para leer el contenido de un dia del reto.
 * `zonaOferta` solo importa para el dia 7 (ver arriba). `puerta` decide el
 * set de dias 1-6 — default "piel" para no romper llamadas anteriores.
 * Devuelve `null` si `dia` esta fuera de 1-7.
 */
export function obtenerContenidoReto(
  dia: number,
  zonaOferta: ZonaOferta | null,
  puerta: PuertaReto = "piel",
): ContenidoDiaReto | null {
  if (!Number.isInteger(dia) || dia < 1 || dia > TOTAL_DIAS_RETO) return null;

  if (dia === 7) {
    return zonaOferta === "usd_premium" ? DIA_7_COACHING : DIA_7_COMUNIDAD;
  }

  return CONTENIDO_POR_PUERTA[puerta][dia] ?? null;
}

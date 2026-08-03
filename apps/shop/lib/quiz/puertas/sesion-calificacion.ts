import type { DimensionHabito, FichaSegmentoCalificacion } from "./ficha-segmento";
import { enlaceConTexto } from "@diana-mile/shared/whatsapp/mensajes";

/**
 * Ficha de calificacion de la puerta "sesion" — que tan buen momento es
 * para que la persona entrene 1:1, en remoto (sin restriccion de ciudad),
 * con Milito. No termina en un ritual de producto: termina en un mensaje
 * de WhatsApp pre-armado para el siguiente paso (agendar, o resolver
 * dudas antes de agendar si el nivel es bajo).
 *
 * Reglas de copy (ver AGENTS.md, "Honestidad del contenido"):
 * - Milito es "entrenadora fisica y personal de salud", nada mas — sin
 *   certificaciones ni especialidades que no esten confirmadas.
 * - Cero promesa de resultado fisico especifico en ningun nivel (nunca
 *   "vas a bajar X kg", siempre algo como "armamos un plan que se
 *   adapte a tu semana").
 * - Cero urgencia fabricada: el nivel "bajo" invita a resolver dudas,
 *   nunca presiona a agendar.
 */

export type NivelSesion = "alto" | "medio" | "bajo";

export type FichaSegmentoSesion = FichaSegmentoCalificacion & {
  nombreInterno: NivelSesion;
};

const NOTA_ESTIMACION_SESION =
  "Esto es una orientación inicial según lo que contaste, no un plan de entrenamiento cerrado.";

const ICONO_SESION = "/images/segmentos/sesion_entrenamiento.png";

/**
 * Igual que `WHATSAPP_ENTRENAMIENTO_HREF` en `app/page.tsx`: arma el link
 * de WhatsApp con texto prellenado a partir del numero de la tienda. Si el
 * numero no esta configurado (`enlaceConTexto` devuelve `null`), cae a
 * cadena vacia — `mensajeWhatsapp` en el contrato es `string`, no
 * `string | null`, y `resultado/[id]/page.tsx` ya usa este campo
 * directamente como `href` sin chequeo de null (ver linea ~269).
 */
function mensajeSesion(texto: string): string {
  return enlaceConTexto(process.env.NEXT_PUBLIC_WHATSAPP_NUMERO, texto) ?? "";
}

export const SEGMENTOS_SESION: Record<NivelSesion, FichaSegmentoSesion> = {
  alto: {
    nombreInterno: "alto",
    tipo: "calificacion",
    nivel: "alto",
    tituloDiagnostico: "Lista para entrenar 1:1",
    descripcionDiagnostico:
      "Tienes un objetivo claro, tiempo real en tu semana y ganas de arrancar — es justo el momento para entrenar 1:1 con Milito, tu entrenadora física y personal de salud. Armamos juntas un plan que se adapte a tu semana, no al revés.",
    notaEstimacion: NOTA_ESTIMACION_SESION,
    iconoUrl: ICONO_SESION,
    videoId: null,
    mensajeWhatsapp: mensajeSesion(
      "Hola Milito, hice tu test de entrenamiento y quiero agendar mi primera sesión contigo.",
    ),
  },
  medio: {
    nombreInterno: "medio",
    tipo: "calificacion",
    nivel: "medio",
    tituloDiagnostico: "Cerca de tu primera sesión",
    descripcionDiagnostico:
      "Tienes disposición para entrenar, solo hay que acomodar algunos detalles de tiempo o rutina antes de arrancar. En una sesión 1:1 con Milito armamos un plan que se adapte a tu semana real, paso a paso.",
    notaEstimacion: NOTA_ESTIMACION_SESION,
    iconoUrl: ICONO_SESION,
    videoId: null,
    mensajeWhatsapp: mensajeSesion(
      "Hola Milito, hice tu test de entrenamiento y quiero que me ayudes a armar un plan que se ajuste a mi semana.",
    ),
  },
  bajo: {
    nombreInterno: "bajo",
    tipo: "calificacion",
    nivel: "bajo",
    tituloDiagnostico: "Resolvamos tus dudas primero",
    descripcionDiagnostico:
      "Por ahora el tiempo o las dudas están frenando el arranque, y eso es totalmente normal. Antes de agendar, hablemos por WhatsApp con Milito para resolver esas dudas y ver cómo empezar sin que se sienta imposible.",
    notaEstimacion: NOTA_ESTIMACION_SESION,
    iconoUrl: ICONO_SESION,
    videoId: null,
    mensajeWhatsapp: mensajeSesion(
      "Hola Milito, hice tu test de entrenamiento y tengo dudas antes de animarme a agendar. ¿Me ayudas?",
    ),
  },
};

/**
 * Umbrales de score -> nivel de calificación.
 *
 * Rango posible del score (ver `sesion.ts`: `calcularScore` suma los 4
 * pasos de tipo `opcion_unica` con `puntaje` — `objetivo_entrenamiento`,
 * `experiencia_previa`, `tiempo_disponible_semana`, `objecion_principal`;
 * `modalidad_preferida` no puntúa, es logística):
 *   mínimo = 2 (objetivo) + 2 (experiencia) + 1 (tiempo) + 1 (objeción) = 6
 *   máximo = 3 (objetivo) + 3 (experiencia) + 4 (tiempo) + 3 (objeción) = 13
 *
 * `tiempo_disponible_semana` es el único paso que llega a 4 puntos — pesa
 * más que los demás a propósito, porque el tiempo real disponible es lo
 * que más define si es buen momento para empezar 1:1: alguien con el
 * mejor objetivo y ninguna objeción pero sin tiempo real no es todavía
 * buen candidato para arrancar ya.
 *
 * Con el rango 6-13, la división en tres queda:
 *   bajo:  6-7   (2 valores)
 *   medio: 8-10  (3 valores)
 *   alto:  11-13 (3 valores)
 */
const UMBRAL_ALTO = 11;
const UMBRAL_MEDIO = 8;

export function determinarNivelSesion(score: number): NivelSesion {
  if (score >= UMBRAL_ALTO) return "alto";
  if (score >= UMBRAL_MEDIO) return "medio";
  return "bajo";
}

/** La puerta "sesion" es de calificación, no de ritual de producto — no tiene barras de hábito que mostrar. */
export function dimensionesHabitoSesion(): DimensionHabito[] {
  return [];
}

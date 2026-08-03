import { enlaceConTexto } from "@diana-mile/shared/whatsapp/mensajes";
import type { DimensionHabito, FichaSegmentoCalificacion } from "./ficha-segmento";

/**
 * Fichas de calificacion de la puerta "negocio" (oportunidad de
 * distribuidora Nu Skin). A diferencia de `piel-prescripcion.ts` esto NO
 * termina en un ritual de producto: termina en un `nivel` de interes/aptitud
 * (alto/medio/bajo) que decide que tan directo es el siguiente contacto por
 * WhatsApp — ver `FichaSegmentoCalificacion` en `./ficha-segmento.ts`.
 *
 * Reglas duras de copy (AGENTS.md, "Honestidad del contenido"):
 * - Cero cifras de ingreso, cero "ingreso pasivo", cero promesa de resultado.
 * - Marca siempre "Milito", nunca "Diana".
 * - Cero testimonios ni urgencia fabricada.
 * - Nivel "bajo" NUNCA corta el contacto: invita a resolver dudas o conocer
 *   el producto, sin ofrecer el negocio.
 */

export const NOTA_ESTIMACION_NEGOCIO =
  "Esto es una calificacion de interes, no una evaluacion financiera ni una promesa de ingreso.";

/** Mismo icono para los 3 niveles: no hay ritual de producto que diferenciar visualmente, la diferencia esta en el texto y el CTA. Se genera despues. */
const ICONO_NEGOCIO = "/images/segmentos/negocio_nuskin.png";

export type NivelNegocio = "alto" | "medio" | "bajo";

/**
 * Umbrales de score, documentados aca porque no hay tabla de decision como
 * en piel — la puerta "negocio" solo usa `calcularScore` (suma de puntajes
 * de opcion_unica, ver `../motor.ts`).
 *
 * Puntaje maximo posible en `./negocio.ts` (6 preguntas con puntaje, el
 * payoff y pais no puntuan):
 *   interes_inicial_negocio      max 2
 *   uso_previo_producto_negocio  max 2
 *   tiempo_disponible_negocio    max 3
 *   motivacion_negocio           max 2
 *   comodidad_mostrarse_negocio  max 2
 *   experiencia_venta_negocio    max 2
 *   ------------------------------------
 *   TOTAL                        max 13
 *
 * Corte:
 * - alto: score >= 8  (tiempo real + ya conoce/usa el producto + comoda
 *   mostrandose, el perfil que describe "A QUIEN LE SIRVE DE VERDAD" en
 *   nuskin-negocio.ts)
 * - medio: 4 <= score < 8 (interes real pero con piezas flojas — tiempo
 *   limitado, poca experiencia vendiendo, o le cuesta mostrarse)
 * - bajo: score < 4 (poco tiempo, no conoce el producto, no le gusta
 *   mostrarse — no es momento para el negocio, si para el producto)
 */
export const UMBRAL_NIVEL_ALTO = 8;
export const UMBRAL_NIVEL_MEDIO = 4;

export function determinarNivelNegocio(score: number): NivelNegocio {
  if (score >= UMBRAL_NIVEL_ALTO) return "alto";
  if (score >= UMBRAL_NIVEL_MEDIO) return "medio";
  return "bajo";
}

/**
 * La puerta "negocio" no muestra barras de habito (protector solar, sueño,
 * agua...): eso solo aplica a puertas de tipo "producto". Existe para que
 * quien cablee el `ContratoResultadoPuerta` final tenga una funcion con la
 * firma correcta sin tener que escribir un `() => []` inline.
 */
export function dimensionesHabitoNegocio(): DimensionHabito[] {
  return [];
}

const NUMERO_WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMERO;

/**
 * `enlaceConTexto` devuelve `string | null` cuando el numero no esta
 * configurado o es el placeholder de desarrollo (ver `numeroUtilizable` en
 * `@diana-mile/shared/whatsapp/mensajes`). `FichaSegmentoCalificacion`
 * exige `mensajeWhatsapp: string` (mismo contrato para las 5 puertas), asi
 * que ese caso cae a cadena vacia — quien renderice el CTA final debe
 * tratar "" igual que null (no pintar boton), mismo criterio que ya usa
 * `apps/shop/app/page.tsx` con `WHATSAPP_ENTRENAMIENTO_HREF`.
 */
function enlaceNegocio(texto: string): string {
  return enlaceConTexto(NUMERO_WHATSAPP, texto) ?? "";
}

export const SEGMENTOS_NEGOCIO: Record<NivelNegocio, FichaSegmentoCalificacion> = {
  alto: {
    nombreInterno: "alto",
    tipo: "calificacion",
    nivel: "alto",
    tituloDiagnostico: "Tienes el perfil para dar el siguiente paso",
    descripcionDiagnostico:
      "Por lo que nos contaste, tienes tiempo real para dedicarle, ya conoces o usas el producto, y te sientes comoda hablando con la gente y mostrandote. Eso es justo lo que hace que este negocio funcione: no es una formula magica ni plata facil, es constancia y ganas de aprender a vender. Hablemos para explicarte como funciona de verdad, sin compromiso.",
    notaEstimacion: NOTA_ESTIMACION_NEGOCIO,
    iconoUrl: ICONO_NEGOCIO,
    videoId: null,
    mensajeWhatsapp: enlaceNegocio(
      "Hola Milito, hice el test de la oportunidad de negocio y quiero que coordinemos los siguientes pasos.",
    ),
  },
  medio: {
    nombreInterno: "medio",
    tipo: "calificacion",
    nivel: "medio",
    tituloDiagnostico: "Vale la pena que hablemos con calma",
    descripcionDiagnostico:
      "Tienes interes real, pero todavia hay piezas por acomodar — el tiempo disponible, la experiencia vendiendo o que tan comoda te sientes mostrandote. Nada de eso es un obstaculo, es lo normal en cualquier persona que esta empezando a mirar esto. Una conversacion corta te puede aclarar si este es tu momento o si conviene esperar un poco.",
    notaEstimacion: NOTA_ESTIMACION_NEGOCIO,
    iconoUrl: ICONO_NEGOCIO,
    videoId: null,
    mensajeWhatsapp: enlaceNegocio(
      "Hola Milito, hice el test de la oportunidad de negocio y quiero que hablemos con calma para resolver mis dudas.",
    ),
  },
  bajo: {
    nombreInterno: "bajo",
    tipo: "calificacion",
    nivel: "bajo",
    tituloDiagnostico: "Por ahora, conozcamos el producto primero",
    descripcionDiagnostico:
      "Por tus respuestas, ahora mismo no pareces tener el tiempo o la disposicion para meterle en serio a un negocio de venta directa — y esta bien, no es para todo el mundo ni tiene que ser ahora. Lo que si te podemos ofrecer es conocer el producto de cerca y resolver tus dudas. Si mas adelante cambia tu situacion, retomamos la conversacion del negocio con calma.",
    notaEstimacion: NOTA_ESTIMACION_NEGOCIO,
    iconoUrl: ICONO_NEGOCIO,
    videoId: null,
    // Sin oferta de negocio: invita solo a resolver dudas o conocer producto.
    mensajeWhatsapp: enlaceNegocio(
      "Hola Milito, hice el test de la oportunidad de negocio y quiero conocer mas sobre el producto y resolver algunas dudas.",
    ),
  },
};

import type { Puerta } from "../tipos";
import { calcularScore } from "../motor";
import { determinarNivelSesion } from "./sesion-calificacion";

/**
 * Puerta "sesion": 8 pasos cortos que califican interés en entrenar 1:1
 * con Milito — en remoto, sin restricción de ciudad (no hay pregunta de
 * ubicación mas alla del país que ya captura toda puerta).
 *
 * A diferencia de "piel" (que termina en un ritual de productos), esta
 * puerta termina en una calificación (`FichaSegmentoCalificacion`, ver
 * `./sesion-calificacion.ts`) — no arma una tabla de decisión con reglas
 * por combinación de respuestas, solo suma `Opcion.puntaje` vía
 * `calcularScore` y mapea el total a un nivel con `determinarNivelSesion`.
 *
 * Reglas de copy (ver AGENTS.md, "Honestidad del contenido"):
 * - Cero promesa de resultado físico específico en ningún paso.
 * - Milito es "entrenadora física y personal de salud" — nada más, sin
 *   certificaciones ni especialidades inventadas.
 * - El paso 3 es PAYOFF: entrega un dato de la voz de Milito (adherencia
 *   > perfección — ver packages/shared/src/botcake/ia/conocimiento/
 *   entrenamiento.ts), no pide nada.
 */
export function crearPuertaSesion(): Puerta {
  const pasos: Puerta["pasos"] = [
    // 1. Objetivo principal
    {
      id: "objetivo_entrenamiento",
      tipo: "opcion_unica",
      seccion: "Tu objetivo",
      titulo: "¿Qué te gustaría lograr entrenando?",
      opciones: [
        {
          valor: "bajar_de_peso",
          etiqueta: "Bajar de peso",
          puntaje: 2,
          icono: "balanza",
          imagenUrl: "/images/quiz/sesion_bajar_peso.jpg",
        },
        {
          valor: "ganar_fuerza_tonificar",
          etiqueta: "Ganar fuerza y tonificar",
          puntaje: 2,
          icono: "pesas",
          imagenUrl: "/images/quiz/sesion_fuerza.jpg",
        },
        {
          valor: "mas_energia",
          etiqueta: "Sentirme con más energía",
          puntaje: 2,
          icono: "rayo",
          imagenUrl: "/images/quiz/sesion_energia.jpg",
        },
        {
          valor: "no_se_orientacion",
          etiqueta: "No sé bien, quiero orientación",
          puntaje: 3,
          icono: "interrogacion",
          imagenUrl: "/images/quiz/sesion_orientacion.jpg",
        },
      ],
    },

    // 2. Experiencia previa — puntajes distintos entre "nunca" y "con
    // experiencia" no significan mejor/peor, solo calibran el nivel de
    // acompañamiento que necesita.
    {
      id: "experiencia_previa",
      tipo: "opcion_unica",
      titulo: "¿Cuánta experiencia tienes entrenando?",
      opciones: [
        {
          valor: "nunca_he_entrenado",
          etiqueta: "Nunca he entrenado",
          puntaje: 3,
          icono: "interrogacion",
        },
        {
          valor: "entrene_antes_lo_deje",
          etiqueta: "Entrené antes, pero lo dejé",
          puntaje: 2,
          icono: "relojArena",
        },
        {
          valor: "entreno_de_vez_en_cuando",
          etiqueta: "Entreno de vez en cuando, sin mucho orden",
          puntaje: 2,
          icono: "caminar",
        },
        {
          valor: "entreno_con_regularidad",
          etiqueta: "Ya entreno con cierta regularidad",
          puntaje: 3,
          icono: "pesas",
        },
      ],
    },

    // 3. PAYOFF — entrega un dato, no pregunta nada
    {
      id: "payoff_adherencia",
      tipo: "payoff",
      seccion: "Tu semana",
      titulo: "Antes de seguir, un dato de Milito",
      contenido: [
        "El mejor plan no es el más intenso: es el que de verdad haces. 3 días sostenidos 6 meses le ganan a 6 días perfectos que se abandonan en 3 semanas.",
        "Por eso en una sesión 1:1 no se empieza preguntando cuánto peso quieres levantar, sino cuánto tiempo real tienes en tu semana.",
      ],
      textoContinuar: "Seguir",
    },

    // 4. Tiempo disponible por semana — el que más pesa en el score (ver
    // umbrales en sesion-calificacion.ts): define si es buen momento.
    {
      id: "tiempo_disponible_semana",
      tipo: "opcion_unica",
      titulo: "¿Cuánto tiempo real tienes a la semana para entrenar?",
      opciones: [
        { valor: "menos_1h", etiqueta: "Menos de 1 hora en total", puntaje: 1, icono: "reloj" },
        { valor: "1_2h", etiqueta: "Entre 1 y 2 horas", puntaje: 2, icono: "reloj" },
        { valor: "2_4h", etiqueta: "Entre 2 y 4 horas", puntaje: 3, icono: "reloj" },
        { valor: "mas_4h", etiqueta: "Más de 4 horas", puntaje: 4, icono: "reloj" },
      ],
    },

    // 5. Objeción principal
    {
      id: "objecion_principal",
      tipo: "opcion_unica",
      titulo: "¿Qué es lo que más te frena hoy para empezar?",
      opciones: [
        { valor: "no_tengo_tiempo", etiqueta: "No tengo tiempo", puntaje: 1, icono: "relojArena" },
        { valor: "me_da_pena", etiqueta: "Me da pena", puntaje: 2, icono: "burbuja" },
        {
          valor: "no_se_por_donde_empezar",
          etiqueta: "No sé por dónde empezar",
          puntaje: 2,
          icono: "interrogacion",
        },
        {
          valor: "ninguna_solo_quiero_arrancar",
          etiqueta: "Ninguna, solo quiero arrancar",
          puntaje: 3,
          icono: "check",
        },
      ],
    },

    // 6. Modalidad preferida — logística, no calificación (sin puntaje).
    {
      id: "modalidad_preferida",
      tipo: "opcion_unica",
      seccion: "Tu sesion",
      titulo: "¿En qué horario prefieres entrenar?",
      opciones: [
        { valor: "manana", etiqueta: "En la mañana", icono: "sol" },
        { valor: "tarde", etiqueta: "En la tarde", icono: "reloj" },
        { valor: "noche", etiqueta: "En la noche", icono: "luna" },
      ],
    },

    // 7. País — deriva zona_oferta en el motor.
    {
      id: "pais",
      tipo: "pais",
      titulo: "¿Desde dónde nos escribes?",
    },

    // 8. Cargando
    {
      id: "procesando",
      tipo: "cargando",
      titulo: "Revisando tu momento para entrenar",
      duracionMs: 1800,
      mensajes: [
        "Revisando tus respuestas...",
        "Viendo si es un buen momento para empezar 1:1...",
      ],
    },
  ];

  const puerta: Puerta = {
    id: "sesion",
    titulo: "¿Es buen momento para entrenar 1:1?",
    descripcion:
      "8 preguntas para calificar tu interés en entrenar 1:1, en remoto, con Milito.",
    pasos,
    calcularResultado: (respuestas, zonaOferta) => {
      const score = calcularScore(puerta, respuestas);
      const segmento = determinarNivelSesion(score);

      return {
        segmento,
        score,
        zonaOferta,
      };
    },
  };

  return puerta;
}

import type { Puerta } from "../tipos";
import { calcularScore } from "../motor";
import {
  ID_PASO_OBJETIVO_PESO,
  ID_PASO_RELACION_COMIDA_BAJAR,
  ID_PASO_CONSTANCIA_HORARIOS_BAJAR,
  ID_PASO_INGESTA_SUBIR,
  ID_PASO_CONSTANCIA_COMIDAS_SUBIR,
  ID_PASO_ENTRENAMIENTO_ACTUAL_TONIFICAR,
  ID_PASO_ENFOQUE_TONIFICAR,
  ID_PASO_PAYOFF_HABITOS,
  ID_PASO_FRECUENCIA_MOVIMIENTO,
  ID_PASO_SUENO,
  ID_PASO_CONSTANCIA_ALIMENTARIA,
  ID_PASO_ESTRES,
  ID_PASO_FECHA_OBJETIVO,
  determinarSegmentoPeso,
} from "./peso-prescripcion";

/**
 * Puerta "peso": diagnostico de peso/composicion corporal, bifurcado
 * bajar/subir/tonificar — Milito es entrenadora fisica y personal de salud,
 * NO medica ni nutricionista. 14 pasos LOGICOS (cada persona atraviesa
 * exactamente 14), aunque el arreglo tiene mas nodos porque los pasos 3-4
 * tienen una variante distinta por rama.
 *
 * Bifurcacion (paso 2, `objetivo_peso`): usa `siguiente` como funcion para
 * saltar a la pregunta de contexto de la rama elegida. Las 3 ramas
 * convergen de nuevo en el payoff 1 (`payoff_constancia_habitos`), desde
 * donde el cuestionario vuelve a ser lineal (pasos 6-14 comunes a las 3
 * ramas). Se documenta la decision de NO volver a bifurcar el arbol
 * completo en el paso 11 (objetivo especifico): en vez de triplicar ese
 * paso, se dejo una pregunta generica que cubre las 3 metas — el criterio
 * PRINCIPAL de la tabla de decision sigue siendo la respuesta del paso 2,
 * no el paso 11 (ver `TABLA_DECISION_PESO` en `./peso-prescripcion.ts`).
 *
 * Reglas de copy (ver instrucciones de la tarea y AGENTS.md "Honestidad del
 * contenido"):
 * - PROHIBIDO decir que un producto hace bajar/subir de peso — el copy
 *   SOLO habla de habitos (movimiento, alimentacion con orden, constancia).
 * - Cero nombres comerciales de producto en cualquier paso.
 * - Cero comentario sobre el cuerpo de la persona, cero cifra de cuanto va
 *   a bajar/subir, cero antes/despues.
 * - Quien habla es Milito — voz calida, paisa, directa.
 * - El paso 5 (payoff_constancia_habitos) y el paso 9 (payoff_sueno_estres)
 *   son PAYOFF: entregan un dato de valor, no piden nada — cero urgencia
 *   fabricada.
 */
export function crearPuertaPeso(): Puerta {
  const pasos: Puerta["pasos"] = [
    // 1. Edad
    {
      id: "edad",
      tipo: "opcion_unica",
      seccion: "Sobre ti",
      titulo: "Para empezar, ¿en que rango de edad estas?",
      opciones: [
        { valor: "menor_25", etiqueta: "Menos de 25", icono: "calendario", imagenUrl: "/images/quiz/edad_menor_25.jpg" },
        { valor: "25_34", etiqueta: "Entre 25 y 34", icono: "calendario", imagenUrl: "/images/quiz/edad_25_34.jpg" },
        { valor: "35_44", etiqueta: "Entre 35 y 44", icono: "calendario", imagenUrl: "/images/quiz/edad_35_44.jpg" },
        { valor: "45_54", etiqueta: "Entre 45 y 54", icono: "calendario", imagenUrl: "/images/quiz/edad_45_54.jpg" },
        { valor: "55_mas", etiqueta: "55 o mas", icono: "calendario", imagenUrl: "/images/quiz/edad_55_mas.jpg" },
      ],
    },

    // 2. Objetivo de peso — bifurca el resto del cuestionario.
    {
      id: ID_PASO_OBJETIVO_PESO,
      tipo: "opcion_unica",
      titulo: "¿Cual es tu objetivo principal hoy?",
      opciones: [
        { valor: "bajar_peso", etiqueta: "Bajar de peso", icono: "balanza" },
        { valor: "subir_masa", etiqueta: "Subir masa muscular", icono: "musculo" },
        {
          valor: "tonificar_definir",
          etiqueta: "Tonificar / definir, sin cambiar mucho el peso",
          icono: "pesas",
        },
      ],
      siguiente: (respuestas) => {
        const objetivo = respuestas[ID_PASO_OBJETIVO_PESO];
        if (objetivo === "subir_masa") return ID_PASO_INGESTA_SUBIR;
        if (objetivo === "tonificar_definir") return ID_PASO_ENTRENAMIENTO_ACTUAL_TONIFICAR;
        return ID_PASO_RELACION_COMIDA_BAJAR; // rama "bajar_peso" y fallback
      },
    },

    // --- Rama "bajar_peso": pasos 3-4 --------------------------------
    {
      id: ID_PASO_RELACION_COMIDA_BAJAR,
      tipo: "opcion_unica",
      titulo: "¿Que tanto se te dificulta controlar las porciones o los antojos?",
      opciones: [
        { valor: "nunca_dificil", etiqueta: "Casi nunca, como con orden", icono: "check" },
        { valor: "a_veces_dificil", etiqueta: "A veces, pero lo manejo", icono: "plato" },
        { valor: "seguido_dificil", etiqueta: "Seguido, me cuesta parar", icono: "manzana" },
        {
          valor: "casi_siempre_dificil",
          etiqueta: "Casi siempre, siento que pierdo el control",
          icono: "cerebro",
        },
      ],
      // Sin `siguiente`: avanza al siguiente nodo del arreglo (constancia_horarios_bajar).
    },
    {
      id: ID_PASO_CONSTANCIA_HORARIOS_BAJAR,
      tipo: "opcion_unica",
      titulo: "¿Que tan seguido comes a horarios mas o menos definidos?",
      opciones: [
        { valor: "casi_nunca", etiqueta: "Casi nunca, como cuando puedo", icono: "reloj" },
        { valor: "a_veces", etiqueta: "A veces", icono: "reloj" },
        { valor: "casi_siempre", etiqueta: "Casi siempre", icono: "reloj" },
        { valor: "siempre", etiqueta: "Todos los dias a las mismas horas", icono: "reloj" },
      ],
      siguiente: ID_PASO_PAYOFF_HABITOS,
    },

    // --- Rama "subir_masa": pasos 3-4 ---------------------------------
    {
      id: ID_PASO_INGESTA_SUBIR,
      tipo: "opcion_unica",
      titulo: "¿Como describirias la cantidad que comes en el dia?",
      opciones: [
        {
          valor: "como_poco",
          etiqueta: "Como poco, se me olvida o se me quita el hambre",
          icono: "plato",
        },
        { valor: "como_lo_normal", etiqueta: "Como lo normal, ni mucho ni poco", icono: "check" },
        { valor: "como_bastante", etiqueta: "Como bastante pero no veo cambios", icono: "manzana" },
        { valor: "no_estoy_segura", etiqueta: "La verdad no lo tengo muy claro", icono: "interrogacion" },
      ],
      // Sin `siguiente`: avanza al siguiente nodo del arreglo (constancia_comidas_subir).
    },
    {
      id: ID_PASO_CONSTANCIA_COMIDAS_SUBIR,
      tipo: "opcion_unica",
      titulo: "¿Cuantas comidas completas haces al dia, en promedio?",
      opciones: [
        { valor: "una_o_dos", etiqueta: "1 a 2 comidas", icono: "plato" },
        { valor: "tres", etiqueta: "3 comidas", icono: "plato" },
        { valor: "cuatro_o_mas", etiqueta: "4 o mas comidas", icono: "plato" },
      ],
      siguiente: ID_PASO_PAYOFF_HABITOS,
    },

    // --- Rama "tonificar_definir": pasos 3-4 --------------------------
    {
      id: ID_PASO_ENTRENAMIENTO_ACTUAL_TONIFICAR,
      tipo: "opcion_unica",
      titulo: "Hoy en dia, ¿como es tu entrenamiento?",
      opciones: [
        { valor: "no_entreno", etiqueta: "No entreno todavia", icono: "sofa" },
        { valor: "solo_cardio", etiqueta: "Solo cardio (caminar, trotar, bici)", icono: "correr" },
        { valor: "entrena_pesas", etiqueta: "Entreno con pesas o resistencia", icono: "pesas" },
        { valor: "entrena_mixto", etiqueta: "Combino cardio y pesas", icono: "musculo" },
      ],
      // Sin `siguiente`: avanza al siguiente nodo del arreglo (enfoque_tonificar).
    },
    {
      id: ID_PASO_ENFOQUE_TONIFICAR,
      tipo: "opcion_unica",
      titulo: "¿Que zona te gustaria notar mas definida primero?",
      opciones: [
        { valor: "abdomen_core", etiqueta: "Abdomen y core", icono: "cuerpo" },
        { valor: "piernas_gluteos", etiqueta: "Piernas y gluteos", icono: "correr" },
        { valor: "brazos_espalda", etiqueta: "Brazos y espalda", icono: "musculo" },
        { valor: "cuerpo_completo", etiqueta: "Todo el cuerpo por igual", icono: "check" },
      ],
      siguiente: ID_PASO_PAYOFF_HABITOS,
    },

    // 5. PAYOFF 1 — punto donde convergen las 3 ramas. Entrega un dato, no pregunta nada.
    {
      id: ID_PASO_PAYOFF_HABITOS,
      tipo: "payoff",
      seccion: "Tus habitos",
      titulo: "Antes de seguir, un dato",
      contenido: [
        "El peso y la composicion corporal responden mas a la constancia del dia a dia — movimiento regular, alimentacion con orden, buen descanso — que a cualquier cambio aislado.",
        "No se trata de un plan perfecto: se trata de sostener unos pocos habitos casi todos los dias.",
      ],
      textoContinuar: "Seguir",
      // Sin `siguiente`: avanza al siguiente nodo del arreglo (frecuencia_movimiento) — a partir de aca el cuestionario vuelve a ser lineal para las 3 ramas.
    },

    // 6. Frecuencia de movimiento/entrenamiento actual
    {
      id: ID_PASO_FRECUENCIA_MOVIMIENTO,
      tipo: "opcion_unica",
      titulo: "¿Que tan seguido te mueves o entrenas hoy en dia?",
      opciones: [
        { valor: "casi_no_me_muevo", etiqueta: "Casi no me muevo", icono: "sofa" },
        { valor: "camino_algo", etiqueta: "Camino algo", icono: "caminar" },
        { valor: "entreno_1_2_veces", etiqueta: "Entreno 1-2 veces por semana", icono: "correr" },
        { valor: "entreno_regularidad", etiqueta: "Entreno con regularidad", icono: "pesas" },
      ],
    },

    // 7. Sueno
    {
      id: ID_PASO_SUENO,
      tipo: "numero",
      titulo: "En promedio, ¿cuantas horas duermes por noche?",
      unidad: "horas",
      min: 3,
      max: 12,
      placeholder: "Ej. 7",
    },

    // 8. Relacion con la comida / constancia alimentaria
    {
      id: ID_PASO_CONSTANCIA_ALIMENTARIA,
      tipo: "escala",
      titulo: "Del 1 al 10, ¿que tan constante eres comiendo con orden?",
      min: 1,
      max: 10,
      etiquetaMin: "Como muy desordenado",
      etiquetaMax: "Como con orden la mayoria de los dias",
    },

    // 9. PAYOFF 2 — entrega otro dato, no pregunta nada.
    {
      id: "payoff_sueno_estres",
      tipo: "payoff",
      titulo: "Otro dato antes de seguir",
      contenido: [
        "Dormir poco y el estres sostenido cambian el apetito y las ganas de moverse — no son un tema aparte, son parte de la ecuacion.",
        "Por eso un buen ritual de habitos no se queda solo en la comida: tambien cuida el descanso y baja la exigencia contigo misma.",
      ],
      textoContinuar: "Seguir",
    },

    // 10. Estres
    {
      id: ID_PASO_ESTRES,
      tipo: "escala",
      titulo: "Del 1 al 10, ¿que tan estresados han sido tus ultimos dias?",
      min: 1,
      max: 10,
      etiquetaMin: "Tranquila",
      etiquetaMax: "Muy estresada",
    },

    // 11. Objetivo especifico — pregunta generica, cubre las 3 ramas (ver
    // nota de diseno arriba del archivo: no se triplico este paso porque
    // el criterio principal de la tabla de decision ya quedo fijado en el
    // paso 2).
    {
      id: "objetivo_especifico",
      tipo: "opcion_unica",
      seccion: "Tu objetivo",
      titulo: "¿Que te gustaria notar primero?",
      opciones: [
        { valor: "perder_grasa", etiqueta: "Perder grasa corporal", icono: "balanza" },
        { valor: "ganar_musculo", etiqueta: "Ganar musculo y fuerza", icono: "musculo" },
        { valor: "verme_mas_definida", etiqueta: "Verme mas definida / tonificada", icono: "pesas" },
        {
          valor: "mejores_habitos",
          etiqueta: "Simplemente sentirme mejor con mis habitos",
          icono: "check",
        },
      ],
    },

    // 12. Horizonte de resultados — mismo patron que piel: opciones en vez
    // de un selector de fecha real (mas honesto que prometer una fecha
    // exacta que el habito, y la logistica, no pueden garantizar).
    {
      id: ID_PASO_FECHA_OBJETIVO,
      tipo: "opcion_unica",
      titulo: "¿Para cuando te gustaria empezar a notar cambios?",
      opciones: [
        { valor: "dos_semanas", etiqueta: "En 2 semanas", icono: "reloj" },
        { valor: "un_mes", etiqueta: "En 1 mes", icono: "calendario" },
        { valor: "dos_meses", etiqueta: "En 2 meses", icono: "calendario" },
        { valor: "sin_fecha_definida", etiqueta: "No tengo una fecha en mente", icono: "interrogacion" },
      ],
    },

    // 13. Pais — deriva zona_oferta en el motor.
    {
      id: "pais",
      tipo: "pais",
      seccion: "Tu plan",
      titulo: "¿Desde donde nos escribes?",
    },

    // 14. Cargando
    {
      id: "procesando",
      tipo: "cargando",
      titulo: "Armando tu plan de habitos",
      duracionMs: 2200,
      mensajes: [
        "Revisando tus respuestas...",
        "Cruzando tu objetivo con tus habitos...",
        "Casi listo...",
      ],
    },
  ];

  const puerta: Puerta = {
    id: "peso",
    titulo: "Diagnostico de peso",
    descripcion:
      "14 preguntas sobre tu objetivo de peso y tus habitos para armar un plan recomendado — Milito es entrenadora fisica, no reemplaza una consulta medica ni nutricional.",
    pasos,
    calcularResultado: (respuestas, zonaOferta) => {
      const score = calcularScore(puerta, respuestas);
      const segmento = determinarSegmentoPeso(respuestas);

      return {
        segmento,
        score,
        zonaOferta,
      };
    },
  };

  return puerta;
}

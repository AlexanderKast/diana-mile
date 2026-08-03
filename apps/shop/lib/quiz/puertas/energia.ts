import type { Puerta } from "../tipos";
import { calcularScore } from "../motor";
import {
  ID_PASO_DESCRIPCION_ENERGIA,
  ID_PASO_PREOCUPACION,
  ID_PASO_RUTINA_MOVIMIENTO,
  ID_PASO_SUENO,
  ID_PASO_HIDRATACION,
  ID_PASO_ESTRES,
  ID_PASO_FRECUENCIA_MOVIMIENTO,
  ID_PASO_FECHA_OBJETIVO,
  determinarSegmentoEnergia,
} from "./energia-prescripcion";

/**
 * Puerta "energia": 14 pasos que terminan en un diagnostico de
 * habitos/energia prescrito por `./energia-prescripcion.ts`.
 *
 * Reglas de copy (ver instrucciones de la tarea y AGENTS.md "Honestidad
 * del contenido"):
 * - Milito es entrenadora fisica y coach de habitos de salud — NO es
 *   medica ni nutricionista. Cero diagnostico clinico, cero consejo
 *   medico.
 * - PROHIBIDO atribuirle a un suplemento o producto un efecto sobre la
 *   energia, el sueno, las defensas o el peso (ver
 *   packages/shared/src/botcake/ia/persuasion.ts, regla li-03). Todo el
 *   copy de esta puerta habla de HABITOS: horario de sueno, movimiento,
 *   hidratacion, manejo de estres, constancia — nunca de que un producto
 *   "sube la energia" o "mejora el sueno".
 * - Cero nombres comerciales de producto en cualquier paso — se habla de
 *   "pasos del ritual"/"categorias", nunca de una marca.
 * - Quien habla es Milito (coach de la marca) — voz calida, paisa,
 *   directa. Cero "tu mejor version" ni frases genericas de coaching,
 *   cero antes/despues.
 * - Los pasos 5 y 10 son PAYOFF: entregan un dato de valor, no piden
 *   nada — cero urgencia fabricada.
 */
export function crearPuertaEnergia(): Puerta {
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

    // 2. Como describirias tu energia
    {
      id: ID_PASO_DESCRIPCION_ENERGIA,
      tipo: "opcion_unica",
      titulo: "¿Como describirias tu energia la mayoria de los dias?",
      opciones: [
        {
          valor: "estable",
          etiqueta: "Estable",
          descripcion: "Se mantiene mas o menos igual todo el dia",
          icono: "check",
        },
        { valor: "baja_tardes", etiqueta: "Baja por las tardes", icono: "sofa" },
        { valor: "baja_todo_dia", etiqueta: "Baja todo el dia", icono: "luna" },
        { valor: "picos_bajones", etiqueta: "Con picos y bajones fuertes", icono: "rayo" },
        { valor: "no_se", etiqueta: "No lo se, no le presto atencion", icono: "interrogacion" },
      ],
    },

    // 3. Preocupacion principal
    {
      id: ID_PASO_PREOCUPACION,
      tipo: "opcion_unica",
      titulo: "¿Cual es tu principal preocupacion con tu energia?",
      opciones: [
        { valor: "cuesta_arrancar", etiqueta: "Me cuesta arrancar el dia", icono: "relojArena" },
        { valor: "media_tarde", etiqueta: "Me quedo sin energia a media tarde", icono: "sofa" },
        { valor: "duermo_no_descanso", etiqueta: "Duermo, pero no descanso", icono: "luna" },
        { valor: "estres_agota", etiqueta: "El estres me agota", icono: "cerebro" },
        { valor: "mantenerla", etiqueta: "Quiero mantenerla, estoy bien", icono: "check" },
      ],
    },

    // 4. Rutina actual de movimiento
    {
      id: ID_PASO_RUTINA_MOVIMIENTO,
      tipo: "opcion_unica",
      titulo: "¿Como es hoy tu rutina de movimiento o actividad fisica?",
      opciones: [
        { valor: "casi_no_me_muevo", etiqueta: "Casi no me muevo", icono: "sofa" },
        { valor: "camino_algo", etiqueta: "Camino algo", icono: "caminar" },
        { valor: "ejercicio_1_2_semana", etiqueta: "Hago ejercicio 1-2 veces por semana", icono: "correr" },
        { valor: "entreno_regularidad", etiqueta: "Entreno con regularidad", icono: "pesas" },
      ],
    },

    // 5. PAYOFF 1 — entrega un dato, no pregunta nada
    {
      id: "payoff_sueno_movimiento",
      tipo: "payoff",
      seccion: "Tus habitos",
      titulo: "Antes de seguir, un dato",
      contenido: [
        "La energia que sientes en el dia tiene mucho que ver con como dormiste la noche anterior — mas que con fuerza de voluntad.",
        "Moverte un poco, aunque sea caminar, suele despertar mas el cuerpo que quedarte quieta esperando a que se te pase el cansancio.",
      ],
      textoContinuar: "Seguir",
    },

    // 6. Horas de sueno
    {
      id: ID_PASO_SUENO,
      tipo: "numero",
      titulo: "En promedio, ¿cuantas horas duermes por noche?",
      unidad: "horas",
      min: 3,
      max: 12,
      placeholder: "Ej. 7",
    },

    // 7. Hidratacion (agua)
    {
      id: ID_PASO_HIDRATACION,
      tipo: "escala",
      titulo: "Del 1 al 10, ¿que tan constante eres tomando agua durante el dia?",
      min: 1,
      max: 10,
      etiquetaMin: "Casi nunca tomo",
      etiquetaMax: "Tomo agua todo el dia",
    },

    // 8. Estres
    {
      id: ID_PASO_ESTRES,
      tipo: "escala",
      titulo: "Del 1 al 10, ¿que tan estresados han sido tus ultimos dias?",
      min: 1,
      max: 10,
      etiquetaMin: "Tranquila",
      etiquetaMax: "Muy estresada",
    },

    // 9. Frecuencia de movimiento/pausas activas durante el dia
    {
      id: ID_PASO_FRECUENCIA_MOVIMIENTO,
      tipo: "opcion_unica",
      titulo: "¿Que tan seguido te mueves o haces pausas activas durante el dia?",
      opciones: [
        { valor: "nunca", etiqueta: "Nunca", icono: "sofa" },
        { valor: "a_veces", etiqueta: "A veces", icono: "caminar" },
        { valor: "casi_siempre", etiqueta: "Casi siempre", icono: "correr" },
        { valor: "siempre", etiqueta: "Siempre", icono: "rayo" },
      ],
    },

    // 10. PAYOFF 2 — entrega otro dato, no pregunta nada
    {
      id: "payoff_movimiento_estres",
      tipo: "payoff",
      titulo: "Otro dato antes de seguir",
      contenido: [
        "El cuerpo que se mueve poco tiende a sentirse mas cansado, no menos — el sedentarismo entrena al cuerpo para gastar poca energia.",
        "El estres sostenido consume energia igual que un esfuerzo fisico, aunque no te muevas de la silla.",
      ],
      textoContinuar: "Seguir",
    },

    // 10b. Dashboard intermedio — espejo de los habitos respondidos hasta
    // aca, estilo muscle-booster. No pregunta nada.
    {
      id: "resumen_habitos",
      tipo: "resumen_parcial",
      titulo: "Asi van tus habitos",
      descripcion: "Lo que nos contaste hasta ahora, en un vistazo.",
      textoContinuar: "Ver mi objetivo",
    },

    // 11. Objetivo
    {
      id: "objetivo_principal",
      tipo: "opcion_unica",
      seccion: "Tu objetivo",
      titulo: "¿Que te gustaria notar primero?",
      opciones: [
        { valor: "energia_manana", etiqueta: "Tener mas energia en las mananas", icono: "sol" },
        { valor: "aguantar_tarde", etiqueta: "Aguantar la tarde sin bajon", icono: "rayo" },
        { valor: "dormir_mejor", etiqueta: "Dormir mejor", icono: "luna" },
        { valor: "manejar_estres", etiqueta: "Manejar mejor el estres", icono: "cerebro" },
        { valor: "solo_mantenerla", etiqueta: "Solo mantenerla", icono: "check" },
      ],
    },

    // 12. Fecha objetivo — de aca sale ID_PASO_FECHA_OBJETIVO que usa
    // calcularFechaObjetivo en energia-prescripcion.ts. Sin selector de
    // fecha real: opciones de horizonte, mas honesto que pedir una fecha
    // exacta que los habitos (y la logistica) no pueden prometer.
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
      titulo: "Armando tu diagnostico de energia",
      duracionMs: 2200,
      mensajes: [
        "Revisando tus respuestas...",
        "Cruzando tus habitos de sueno y movimiento...",
        "Casi listo...",
      ],
    },
  ];

  const puerta: Puerta = {
    id: "energia",
    titulo: "Diagnostico de energia",
    descripcion:
      "14 preguntas sobre tu energia y tus habitos para armar un plan recomendado — no reemplaza una consulta medica ni nutricional.",
    pasos,
    calcularResultado: (respuestas, zonaOferta) => {
      const score = calcularScore(puerta, respuestas);
      const segmento = determinarSegmentoEnergia(respuestas);

      return {
        segmento,
        score,
        zonaOferta,
      };
    },
  };

  return puerta;
}

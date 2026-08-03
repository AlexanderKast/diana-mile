import type { Puerta } from "../tipos";
import { calcularScore } from "../motor";
import {
  ID_PASO_TIPO_PIEL,
  ID_PASO_PREOCUPACION,
  ID_PASO_SOL,
  ID_PASO_SUENO,
  ID_PASO_HIDRATACION,
  ID_PASO_ESTRES,
  ID_PASO_FECHA_OBJETIVO,
  determinarSegmentoPiel,
} from "./piel-prescripcion";

/**
 * Puerta "piel": 14 pasos que terminan en un ritual de productos
 * prescrito por `./piel-prescripcion.ts`.
 *
 * Reglas de copy (ver instrucciones de la tarea):
 * - Cero nombres comerciales de producto en cualquier paso — se habla de
 *   "pasos del ritual", nunca de una marca. El nombre comercial recien
 *   aparece en la ficha de producto, fuera del quiz.
 * - Quien habla es Milito (coach de la marca) — voz calida, paisa,
 *   directa. Cero "tu mejor version" ni frases genericas de coaching,
 *   cero antes/despues.
 * - Los pasos 5 y 10 son PAYOFF: entregan un dato de valor, no piden
 *   nada — ver AGENTS.md, cero urgencia fabricada.
 */
export function crearPuertaPiel(): Puerta {
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

    // 2. Tipo de piel
    {
      id: ID_PASO_TIPO_PIEL,
      tipo: "opcion_unica",
      titulo: "¿Como describirias tu piel la mayoria de los dias?",
      opciones: [
        {
          valor: "grasa",
          etiqueta: "Grasa",
          descripcion: "Brilla rapido, sobre todo en frente, nariz y menton",
          icono: "brillo",
        },
        {
          valor: "mixta",
          etiqueta: "Mixta",
          descripcion: "Grasa al centro de la cara, normal o seca en las mejillas",
          icono: "cara",
        },
        {
          valor: "seca",
          etiqueta: "Seca",
          descripcion: "Se siente tirante o aspera casi todo el dia",
          icono: "sol",
        },
        {
          valor: "normal",
          etiqueta: "Normal",
          descripcion: "Ni muy grasa ni muy seca",
          icono: "check",
        },
        {
          valor: "sensible",
          etiqueta: "Sensible",
          descripcion: "Se enrojece o pica con facilidad",
          icono: "mancha",
        },
      ],
    },

    // 3. Preocupacion principal
    {
      id: ID_PASO_PREOCUPACION,
      tipo: "opcion_unica",
      titulo: "Si pudieras cambiar una sola cosa de tu piel, ¿cual seria?",
      opciones: [
        { valor: "manchas_tono_desigual", etiqueta: "Manchas o tono desigual", icono: "mancha" },
        { valor: "arrugas_perdida_firmeza", etiqueta: "Arrugas o perdida de firmeza", icono: "arruga" },
        { valor: "acne_brotes_frecuentes", etiqueta: "Acne o brotes frecuentes", icono: "brillo" },
        { valor: "poros_dilatados_brillo", etiqueta: "Poros dilatados y brillo", icono: "cara" },
        { valor: "resequedad_sensibilidad", etiqueta: "Resequedad o sensibilidad", icono: "gota" },
        {
          valor: "sin_preocupacion_puntual",
          etiqueta: "Nada puntual, quiero mantenerla sana",
          icono: "check",
        },
      ],
    },

    // 4. Rutina actual
    {
      id: "rutina_actual",
      tipo: "opcion_unica",
      titulo: "Hoy en dia, ¿como es tu rutina de piel?",
      opciones: [
        { valor: "ninguna", etiqueta: "Casi no tengo rutina", icono: "interrogacion" },
        { valor: "solo_jabon", etiqueta: "Me lavo la cara con jabon normal", icono: "gota" },
        { valor: "limpieza_hidratacion", etiqueta: "Limpiador + hidratante", icono: "frasco" },
        {
          valor: "rutina_completa",
          etiqueta: "Rutina completa",
          descripcion: "Limpiador, serum, hidratante y protector solar",
          icono: "check",
        },
      ],
    },

    // 5. PAYOFF 1 — entrega un dato, no pregunta nada
    {
      id: "payoff_renovacion_nocturna",
      tipo: "payoff",
      seccion: "Tus habitos",
      titulo: "Antes de seguir, un dato",
      contenido: [
        "La piel se renueva mas mientras duermes — por eso lo que usas antes de acostarte pesa mas de lo que parece.",
        "No hace falta una rutina de diez pasos: tres bien elegidos, usados todos los dias, cambian mas que diez usados a medias.",
      ],
      textoContinuar: "Seguir",
    },

    // 6. Sol
    {
      id: ID_PASO_SOL,
      tipo: "opcion_unica",
      titulo: "¿Que tan seguido usas protector solar?",
      opciones: [
        { valor: "nunca", etiqueta: "Casi nunca", icono: "sol" },
        { valor: "a_veces", etiqueta: "A veces, si me acuerdo", icono: "sol" },
        { valor: "casi_siempre", etiqueta: "Casi todos los dias", icono: "sol" },
        { valor: "siempre", etiqueta: "Todos los dias, sin falta", icono: "sol" },
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

    // 8. Hidratacion (agua)
    {
      id: ID_PASO_HIDRATACION,
      tipo: "escala",
      titulo: "Del 1 al 10, ¿que tan constante eres tomando agua durante el dia?",
      min: 1,
      max: 10,
      etiquetaMin: "Casi nunca tomo",
      etiquetaMax: "Tomo agua todo el dia",
    },

    // 9. Estres
    {
      id: ID_PASO_ESTRES,
      tipo: "escala",
      titulo: "Del 1 al 10, ¿que tan estresados han sido tus ultimos dias?",
      min: 1,
      max: 10,
      etiquetaMin: "Tranquila",
      etiquetaMax: "Muy estresada",
    },

    // 10. PAYOFF 2 — entrega otro dato, no pregunta nada
    {
      id: "payoff_sol_estres",
      tipo: "payoff",
      titulo: "Otro dato antes de seguir",
      contenido: [
        "El sol sin protector es la causa numero uno de manchas y de piel que envejece antes de tiempo — mas que cualquier crema que le falte a tu rutina.",
        "El sueno y el estres tampoco son un detalle aparte: son buena parte de lo que la piel termina mostrando.",
      ],
      textoContinuar: "Seguir",
    },

    // 11. Objetivo
    {
      id: "objetivo_principal",
      tipo: "opcion_unica",
      seccion: "Tu objetivo",
      titulo: "¿Que te gustaria notar primero?",
      opciones: [
        { valor: "piel_mas_luminosa", etiqueta: "Piel mas luminosa y pareja", icono: "brillo" },
        { valor: "piel_mas_firme", etiqueta: "Piel mas firme", icono: "arruga" },
        { valor: "menos_brillo_brotes", etiqueta: "Menos brillo y brotes", icono: "mancha" },
        { valor: "poros_menos_visibles", etiqueta: "Poros menos visibles", icono: "cara" },
        { valor: "piel_mas_hidratada", etiqueta: "Piel mas hidratada y calmada", icono: "gota" },
        { valor: "solo_mantenerla", etiqueta: "Solo mantenerla sana", icono: "check" },
      ],
    },

    // 12. Fecha objetivo — de aca sale ID_PASO_FECHA_OBJETIVO que usa
    // calcularFechaObjetivo en piel-prescripcion.ts. Sin selector de
    // fecha real: opciones de horizonte, mas honesto que pedir una fecha
    // exacta que la piel (y la logistica) no pueden prometer.
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
      titulo: "Armando tu ritual de piel",
      duracionMs: 2200,
      mensajes: [
        "Revisando tus respuestas...",
        "Cruzando tu tipo de piel con tus habitos...",
        "Casi listo...",
      ],
    },
  ];

  const puerta: Puerta = {
    id: "piel",
    titulo: "Diagnostico de piel",
    descripcion:
      "14 preguntas sobre tu piel y tus habitos para armar un ritual recomendado — no reemplaza una consulta dermatologica.",
    pasos,
    calcularResultado: (respuestas, zonaOferta) => {
      const score = calcularScore(puerta, respuestas);
      const segmento = determinarSegmentoPiel(respuestas);

      return {
        segmento,
        score,
        zonaOferta,
      };
    },
  };

  return puerta;
}

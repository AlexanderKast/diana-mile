import type { Puerta, QuizPuerta } from "../tipos";
import { calcularScore } from "../motor";

/**
 * Config de ejemplo, GENERICA — no es el contenido real de ninguna de las 5
 * puertas (eso es el siguiente paso). Existe solo para poder probar el
 * motor de punta a punta: recorre los 7 tipos de paso soportados, incluido
 * un salto condicional real (la pregunta de "objetivo numerico" se salta
 * si la persona respondio que no le interesa un numero puntual).
 *
 * Cuando se implemente el contenido real de una puerta, esta funcion deja
 * de usarse para esa puerta en el registro de abajo — el resto sigue
 * apuntando aca hasta que se escriban las otras.
 */
export function crearPuertaEjemplo(id: QuizPuerta): Puerta {
  const pasos: Puerta["pasos"] = [
    {
        id: "bienvenida",
        tipo: "payoff",
        titulo: "Antes de empezar",
        contenido: [
          "Son unas pocas preguntas cortas.",
          "Al final te mostramos un diagnostico segun tus respuestas.",
        ],
        textoContinuar: "Empezar",
      },
      {
        id: "interes_numero",
        tipo: "opcion_unica",
        titulo: "¿Quieres ponerte una meta numerica?",
        opciones: [
          { valor: "si", etiqueta: "Si, quiero una meta", puntaje: 1 },
          { valor: "no", etiqueta: "No, prefiero seguir sin eso", puntaje: 0 },
        ],
        // Salto condicional: si dice que no, se salta la pregunta numerica
        // y va directo a la de opcion multiple.
        siguiente: (respuestas) =>
          respuestas["interes_numero"] === "si" ? "meta_numero" : "prioridades",
      },
      {
        id: "meta_numero",
        tipo: "numero",
        titulo: "¿Cual es tu meta?",
        unidad: "unidades",
        min: 1,
        max: 100,
        placeholder: "Ej. 10",
      },
      {
        id: "prioridades",
        tipo: "opcion_multiple",
        titulo: "¿Que te importa mas hoy?",
        minimo: 1,
        maximo: 3,
        opciones: [
          { valor: "tiempo", etiqueta: "Ahorrar tiempo", puntaje: 1 },
          { valor: "dinero", etiqueta: "Cuidar el bolsillo", puntaje: 1 },
          { valor: "acompanamiento", etiqueta: "Sentirme acompañada", puntaje: 1 },
          { valor: "resultados", etiqueta: "Ver resultados rapido", puntaje: 1 },
        ],
      },
      {
        id: "nivel_actual",
        tipo: "escala",
        titulo: "Del 1 al 10, ¿como te sientes hoy con esto?",
        min: 1,
        max: 10,
        etiquetaMin: "Nada bien",
        etiquetaMax: "Muy bien",
      },
      {
        id: "pais",
        tipo: "pais",
        titulo: "¿Desde donde nos escribes?",
      },
    {
      id: "procesando",
      tipo: "cargando",
      titulo: "Armando tu diagnostico",
      duracionMs: 1800,
      mensajes: ["Revisando tus respuestas...", "Casi listo..."],
    },
  ];

  const puerta: Puerta = {
    id,
    titulo: "Test de ejemplo",
    descripcion: "Datos minimos para probar el motor — no es contenido final.",
    pasos,
    calcularResultado: (respuestas, zonaOferta) => {
      const score = calcularScore(puerta, respuestas);

      return {
        segmento: score >= 3 ? "alto_interes" : "explorando",
        score,
        zonaOferta,
      };
    },
  };

  return puerta;
}

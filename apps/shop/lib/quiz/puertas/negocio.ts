import type { Puerta } from "../tipos";
import { calcularScore } from "../motor";
import { determinarNivelNegocio } from "./negocio-calificacion";

/**
 * Puerta "negocio": 9 pasos que califican el interes en la oportunidad de
 * distribuidora Nu Skin, sin prescribir producto — termina en una ficha de
 * `FichaSegmentoCalificacion` (ver `./negocio-calificacion.ts`), no en un
 * ritual.
 *
 * Fuente de contenido: `packages/shared/src/botcake/ia/conocimiento/nuskin-negocio.ts`
 * (preguntas calificadoras y reglas de cumplimiento). Reglas duras de copy
 * (ver AGENTS.md, "Honestidad del contenido"):
 * - Cero cifras de ingreso, cero "ingreso pasivo", cero promesa de resultado.
 * - Marca siempre "Milito", nunca "Diana".
 * - Cero testimonios ni urgencia fabricada.
 * - Cero nombres comerciales de producto en cualquier paso.
 *
 * El paso 3 es un PAYOFF de transparencia: no suma puntaje, no pide nada,
 * solo deja clara la naturaleza real del negocio antes de seguir
 * calificando — mismo patron que los payoff de `./piel.ts`.
 */
export function crearPuertaNegocio(): Puerta {
  const pasos: Puerta["pasos"] = [
    // 1. Interes inicial
    {
      id: "interes_inicial_negocio",
      tipo: "opcion_unica",
      seccion: "Tu interes",
      titulo: "¿Que te llamo la atencion de la oportunidad de negocio?",
      opciones: [
        { valor: "ingreso_extra", etiqueta: "Un ingreso extra", puntaje: 2, icono: "billete" },
        {
          valor: "ser_propia_jefa",
          etiqueta: "Ser mi propia jefa y manejar mi tiempo",
          puntaje: 2,
          icono: "maletin",
        },
        {
          valor: "me_gusta_producto",
          etiqueta: "Me gusta el producto y quiero conocer mas",
          puntaje: 1,
          icono: "corazon",
        },
        {
          valor: "sin_saber_bien",
          etiqueta: "No se bien, quiero informacion",
          puntaje: 0,
          icono: "interrogacion",
        },
      ],
    },

    // 2. Uso previo de producto
    {
      id: "uso_previo_producto_negocio",
      tipo: "opcion_unica",
      titulo: "¿Ya has usado producto o apenas lo estas conociendo?",
      opciones: [
        {
          valor: "los_uso_hace_tiempo",
          etiqueta: "Ya lo uso y me gusta",
          puntaje: 2,
          icono: "check",
        },
        {
          valor: "los_probe_alguna_vez",
          etiqueta: "Lo he probado alguna vez",
          puntaje: 1,
          icono: "frasco",
        },
        {
          valor: "no_los_conozco",
          etiqueta: "Todavia no lo conozco",
          puntaje: 0,
          icono: "interrogacion",
        },
      ],
    },

    // 3. PAYOFF de transparencia — sin puntaje, no pregunta nada.
    {
      id: "payoff_transparencia_negocio",
      tipo: "payoff",
      seccion: "Tu tiempo",
      titulo: "Antes de seguir, quiero ser clara con vos",
      contenido: [
        "Esto no es ingreso pasivo ni plata facil: es un negocio real. Se gana vendiendo producto de verdad y, si quieres, construyendo con el tiempo un equipo que tambien venda.",
        "Lo que ganes depende de cuanto le dediques y de cuanto vendas — no hay una cifra que te podamos prometer, y nadie serio te la va a dar.",
      ],
      textoContinuar: "Entiendo, seguir",
    },

    // 4. Tiempo disponible por semana
    {
      id: "tiempo_disponible_negocio",
      tipo: "opcion_unica",
      titulo: "¿Cuanto tiempo a la semana le podrias dedicar de verdad?",
      opciones: [
        { valor: "menos_3h", etiqueta: "Menos de 3 horas", puntaje: 0, icono: "reloj" },
        { valor: "3_a_6h", etiqueta: "Entre 3 y 6 horas", puntaje: 1, icono: "reloj" },
        { valor: "7_a_10h", etiqueta: "Entre 7 y 10 horas", puntaje: 2, icono: "reloj" },
        { valor: "mas_10h", etiqueta: "Mas de 10 horas", puntaje: 3, icono: "reloj" },
      ],
    },

    // 5. Motivacion / que le gustaria que cambiara
    {
      id: "motivacion_negocio",
      tipo: "opcion_unica",
      titulo: "¿Que te gustaria que cambiara en tu dia a dia si esto funciona?",
      opciones: [
        {
          valor: "ingreso_extra_mes",
          etiqueta: "Tener un ingreso extra cada mes",
          puntaje: 2,
          icono: "billete",
        },
        {
          valor: "mas_libertad_horario",
          etiqueta: "Tener mas libertad de horario",
          puntaje: 1,
          icono: "reloj",
        },
        {
          valor: "aprender_algo_nuevo",
          etiqueta: "Aprender algo nuevo y crecer",
          puntaje: 1,
          icono: "bombilla",
        },
        {
          valor: "no_tengo_claro",
          etiqueta: "No tengo claro todavia",
          puntaje: 0,
          icono: "interrogacion",
        },
      ],
    },

    // 6. Comodidad hablando con gente / mostrandose
    {
      id: "comodidad_mostrarse_negocio",
      tipo: "opcion_unica",
      seccion: "Tu perfil",
      titulo: "¿Que tan comoda te sientes hablando con gente o mostrandote en redes?",
      opciones: [
        {
          valor: "me_siento_comoda",
          etiqueta: "Me siento comoda, ya lo hago",
          puntaje: 2,
          icono: "check",
        },
        {
          valor: "me_cuesta_un_poco",
          etiqueta: "Me cuesta un poco, pero le entro",
          puntaje: 1,
          icono: "burbuja",
        },
        {
          valor: "no_me_gusta_nada",
          etiqueta: "No me gusta nada mostrarme",
          puntaje: 0,
          icono: "cara",
        },
      ],
    },

    // 7. Experiencia previa vendiendo
    {
      id: "experiencia_venta_negocio",
      tipo: "opcion_unica",
      titulo: "¿Has vendido algo antes, aunque sea por tu cuenta?",
      opciones: [
        {
          valor: "he_vendido_antes",
          etiqueta: "Si, ya he vendido algo (redes, catalogo, negocio propio)",
          puntaje: 2,
          icono: "check",
        },
        {
          valor: "nunca_he_vendido",
          etiqueta: "Nunca he vendido, pero quiero aprender",
          puntaje: 1,
          icono: "bombilla",
        },
        {
          valor: "no_me_veo_vendiendo",
          etiqueta: "No me veo vendiendo",
          puntaje: 0,
          icono: "interrogacion",
        },
      ],
    },

    // 8. Pais — deriva zona_oferta en el motor.
    {
      id: "pais",
      tipo: "pais",
      titulo: "¿Desde donde nos escribes?",
    },

    // 9. Cargando
    {
      id: "procesando",
      tipo: "cargando",
      titulo: "Revisando tu perfil",
      duracionMs: 2000,
      mensajes: [
        "Revisando tus respuestas...",
        "Viendo que tan lista estas para arrancar...",
        "Casi listo...",
      ],
    },
  ];

  const puerta: Puerta = {
    id: "negocio",
    titulo: "Oportunidad de negocio",
    descripcion:
      "9 preguntas para conocerte y ver si la oportunidad de distribuidora Nu Skin te queda a la medida ahora mismo.",
    pasos,
    calcularResultado: (respuestas, zonaOferta) => {
      const score = calcularScore(puerta, respuestas);
      const segmento = determinarNivelNegocio(score);

      return {
        segmento,
        score,
        zonaOferta,
      };
    },
  };

  return puerta;
}

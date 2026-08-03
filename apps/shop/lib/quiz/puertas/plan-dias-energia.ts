import type { DiaPlanContenido } from "./plan-contenido";

/**
 * Contenido diario del plan de ENERGIA (Fase 22) — 56 dias (8 semanas x 7
 * dias) que desarrollan en la practica cada leccion semanal de
 * plan-contenido.ts, sin repetirla. Voz Milito, PROHIBIDO atribuir efectos a
 * suplementos (regla li-03) — todo el contenido habla de habitos (horario,
 * movimiento, agua, estres), cero cifras, cero urgencia fabricada.
 */
export const DIAS_ENERGIA: Record<number, DiaPlanContenido[]> = {
  // SEMANA 1 — Fundamentos
  1: [
    {
      dia: 1,
      titulo: "Elegís tu hora fija",
      contenido: [
        "Hoy no te voy a pedir que duermas más, te voy a pedir que duermas igual. Elegí una hora de acostarte y una de levantarte, y anotalas donde las veas todos los días. No importa si son las 10 o las 11 de la noche, importa que sean siempre las mismas.",
      ],
      accion: "Elegí tu hora de dormir y tu hora de levantarte, y escribilas donde las veas.",
    },
    {
      dia: 2,
      titulo: "Una hora que sí podés cumplir",
      contenido: [
        "Si ayer elegiste la hora \"ideal\" y ya sabés que no la vas a cumplir, hoy cambiala por una real. Mejor una hora modesta que cumplís todos los días, que una perfecta que dura dos noches. La regularidad le gana a la hora exacta.",
      ],
      accion: "Ajustá tu hora de dormir a una que sí puedas sostener 5 de 7 días.",
    },
    {
      dia: 3,
      titulo: "El cuerpo aprende por costumbre",
      contenido: [
        "Tu cuerpo no sabe qué hora es, aprende por repetición. Si duermes distinto cada noche, nunca termina de aprender el horario. Hoy es apenas el tercer día, así que si todavía no sentís sueño justo a esa hora, es normal, seguí cumpliendo igual.",
      ],
      accion: "Cumplí tu horario hoy, aunque el cuerpo todavía no te avise sueño a esa hora.",
    },
    {
      dia: 4,
      titulo: "El fin de semana no rompe la regla",
      contenido: [
        "El viernes y el sábado son los días donde más se desarma un horario. La regla es sencilla: podés moverte hasta una hora, ni un minuto más. Si trasnochás cuatro horas el sábado, el lunes empezás desde cero otra vez.",
      ],
      accion: "Este fin de semana no te desviés más de una hora de tu horario.",
    },
    {
      dia: 5,
      titulo: "Media hora antes, sin pantalla",
      contenido: [
        "Treinta minutos antes de tu hora de dormir, guardá el celular. No hace falta un ritual complicado, con bajar la luz y dejar de mirar pantalla alcanza. Es el tiempo que le das a tu cuerpo para que entienda que ya se viene la hora.",
      ],
      accion: "Apagá el celular 30 minutos antes de tu hora de dormir.",
    },
    {
      dia: 6,
      titulo: "Anotá cómo amaneciste",
      contenido: [
        "Cada mañana, antes de que se te olvide, ponele un número del 1 al 5 a cómo amaneciste. No es para presionarte, es para tener un dato real más adelante, cuando quieras mirar hacia atrás y ver si algo cambió de verdad.",
      ],
      accion: "Escribí en una nota del 1 al 5 cómo amaneciste hoy.",
    },
    {
      dia: 7,
      titulo: "Primer corte de la semana",
      contenido: [
        "Siete días cumpliendo, o intentando cumplir, tu horario. Hoy no sumes nada nuevo, solo mirá para atrás: contá cuántos días cumpliste la hora de acostarte y la de levantarte. Ese número es tu punto de partida real, no el que te gustaría tener.",
      ],
      accion: "Revisá tus notas de la semana y contá cuántos días cumpliste el horario completo.",
    },
  ],

  // SEMANA 2 — Constancia
  2: [
    {
      dia: 1,
      titulo: "Le sumamos movimiento",
      contenido: [
        "Esta semana no te voy a mandar a entrenar, te voy a pedir que camines. Diez minutos, a la misma hora todos los días, alcanzan. No es sobre sudar, es sobre sacar al cuerpo de la quietud en la que pasa la mayor parte del día.",
      ],
      accion: "Elegí la hora del día en la que vas a caminar 10 minutos, todos los días.",
    },
    {
      dia: 2,
      titulo: "Repartido, no todo junto",
      contenido: [
        "Cinco caminatas de diez minutos valen más que una hora completa el domingo. Repartir el movimiento en el día le hace bien a tu circulación de forma constante, no de golpe. Hoy, caminá tus diez minutos aunque ya te hayas movido antes en el día por otra razón.",
      ],
      accion: "Hoy caminá tus 10 minutos aunque ya hayas caminado antes en el día.",
    },
    {
      dia: 3,
      titulo: "Pegalo a algo que ya hacés",
      contenido: [
        "El hábito que sobrevive es el que se engancha a otro que ya tenés armado. Después del café, antes de bañarte, camino al bus: elegí un momento que ya existe en tu día y ponele la caminata justo ahí, sin pensarlo cada vez.",
      ],
      accion: "Enganchá la caminata a algo que ya hacés todos los días.",
    },
    {
      dia: 4,
      titulo: "La alarma que te para",
      contenido: [
        "Si tu trabajo te tiene sentada horas seguidas, ponete una alarma cada hora y media. Cuando suene, parate dos minutos, aunque sea para estirar las piernas al lado del escritorio. No es un descanso largo, es cortar la quietud antes de que se acumule.",
      ],
      accion: "Poné una alarma cada hora y media y parate 2 minutos cuando suene.",
    },
    {
      dia: 5,
      titulo: "Quieta también cansa",
      contenido: [
        "Mucha gente cree que solo el esfuerzo cansa, pero estar quieta mucho tiempo también pasa factura: la circulación se pone perezosa y la cabeza se siente más lenta. Hoy fijate cuántas veces te paraste en el día sin que te lo recordara la alarma.",
      ],
      accion: "Contá hoy cuántas veces te paraste durante el día y anotalo.",
    },
    {
      dia: 6,
      titulo: "El horario sigue en pie",
      contenido: [
        "El movimiento no reemplaza lo que armaste la semana pasada, se le suma. Revisá si sigues cumpliendo tu hora de acostarte y levantarte al menos cinco de los siete días. Los hábitos no compiten entre sí, se sostienen juntos.",
      ],
      accion: "Revisá si cumpliste el horario de sueño al menos 5 de los 7 días de esta semana.",
    },
    {
      dia: 7,
      titulo: "Cierre de la semana 2",
      contenido: [
        "Dos semanas, dos hábitos en marcha. Hoy juntá las dos notas: la de cómo amaneciste y la de si te moviste. Empezá a sumarlas en el mismo lugar, para que la próxima revisión sea mirar un solo registro, no dos sueltos.",
      ],
      accion: "Sumá en tu nota diaria si te moviste hoy, sí o no, y cerrá la semana con las dos cosas juntas.",
    },
  ],

  // SEMANA 3 — Ajuste fino
  3: [
    {
      dia: 1,
      titulo: "Entra el agua al plan",
      contenido: [
        "El cuerpo avisa que le falta agua antes de que sientas sed: boca seca, dolor de cabeza, mente lenta. No te voy a dar un número mágico de litros, te voy a pedir algo más simple: que el agua esté a la vista, para que no se te olvide.",
      ],
      accion: "Dejá una botella de agua llena y a la vista desde ya.",
    },
    {
      dia: 2,
      titulo: "Tres momentos fijos",
      contenido: [
        "En vez de acordarte de tomar agua todo el día, anclala a tres momentos que ya existen: al levantarte, con el almuerzo, al llegar a casa. Así no depende de la memoria, depende de la rutina que ya tenés armada.",
      ],
      accion: "Tomá un vaso de agua al levantarte, uno con el almuerzo y uno al llegar a casa.",
    },
    {
      dia: 3,
      titulo: "Ajustes de quince minutos",
      contenido: [
        "Si algo de lo que armaste estas tres semanas no te está funcionando, no lo cambies de golpe una hora entera. Movelo solo quince minutos y observá. Los ajustes pequeños son los que se sostienen, los grandes son los que se abandonan a la semana.",
      ],
      accion: "Si tu hora de dormir no te está funcionando, movela solo 15 minutos, no más.",
    },
    {
      dia: 4,
      titulo: "Cambiá la hora si toca",
      contenido: [
        "Lo mismo aplica para la caminata: si te está cayendo justo en tu peor momento del día, con sol fuerte o con el afán de una entrega, cambiala de hora. No hay una hora correcta para todas, hay la que a vos te funciona.",
      ],
      accion: "Si la caminata te cae en el peor momento del día, cambiala de hora hoy mismo.",
    },
    {
      dia: 5,
      titulo: "Antes de sentir sed",
      contenido: [
        "Para cuando sentís sed, el cuerpo ya llevaba un rato avisando de otras formas: boca seca, cabeza pesada, orina oscura. Hoy no esperes esa señal, tomate el vaso de agua que te corresponde según tus tres momentos fijos, aunque no tengas sed todavía.",
      ],
      accion: "Tomá el vaso de agua que te toca según tus 3 momentos, aunque no sientas sed.",
    },
    {
      dia: 6,
      titulo: "Lo médico es del médico",
      contenido: [
        "Te lo digo claro: si hay algo en tu sueño o tu energía que estos hábitos no explican, eso no se resuelve con una nota ni con un vaso de agua más. Se consulta con un médico. Los hábitos ayudan a la base, no reemplazan una consulta cuando algo no cuadra.",
      ],
      accion: "Si algo te preocupa que los hábitos no expliquen, agendá cita con tu médico esta semana.",
    },
    {
      dia: 7,
      titulo: "Tres semanas, tres hábitos",
      contenido: [
        "Horario, movimiento y agua ya llevan tres semanas construyéndose juntos. Hoy revisá tu nota diaria completa y marcá qué tan seguido cumpliste cada uno. No hace falta que sea perfecto, solo que veas el patrón real de estas tres semanas.",
      ],
      accion: "Revisá tu nota y marcá qué tan seguido cumpliste horario, movimiento y agua esta semana.",
    },
  ],

  // SEMANA 4 — Primer chequeo
  4: [
    {
      dia: 1,
      titulo: "Hoy no sumamos nada nuevo",
      contenido: [
        "Esta semana es distinta: no vamos a agregar un hábito más, vamos a mirar hacia atrás. Sacá tus notas de la semana 1 y de la semana 3, y comparalas. No es para juzgarte, es para tener un dato real de qué se movió en un mes.",
      ],
      accion: "Sacá el promedio de tus notas de la semana 1 y comparalo con el de la semana 3.",
    },
    {
      dia: 2,
      titulo: "La memoria engaña, las notas no",
      contenido: [
        "La memoria es mala consejera: si tuviste un mal día ayer, sentís que todo el mes fue malo. Por eso escribiste. Hoy buscá en tus notas la tendencia general, no el salto de un solo día bueno o malo.",
      ],
      accion: "Buscá en tus notas la tendencia general, no un salto de un solo día.",
    },
    {
      dia: 3,
      titulo: "Tus tres mejores días",
      contenido: [
        "De todo lo que llevás anotado, marcá los tres días donde amaneciste mejor. Después mirá qué tuvieron en común: ¿dormiste a la misma hora?, ¿caminaste?, ¿tomaste agua completa? Ahí hay una pista de lo que sí te está funcionando.",
      ],
      accion: "Marcá tus 3 mejores días y escribí qué tuvieron en común.",
    },
    {
      dia: 4,
      titulo: "El hábito que más se cae",
      contenido: [
        "De los tres hábitos, seguro hay uno que se te cayó más veces que los otros. Identificalo hoy sin drama, es información, no una falla tuya. Ese es el que vamos a revisar mañana.",
      ],
      accion: "Identificá cuál de los tres hábitos se te cayó más veces esta semana.",
    },
    {
      dia: 5,
      titulo: "No es falta de disciplina",
      contenido: [
        "Si un hábito se te cae seguido, no es que seas indisciplinada, es que quedó mal puesto en tu día: a una hora que no te sirve, pegado a algo que no funciona. Hoy escribí en qué momento se te cae más ese hábito.",
      ],
      accion: "Escribí en qué momento del día se te cae ese hábito con más frecuencia.",
    },
    {
      dia: 6,
      titulo: "Arreglá solo uno",
      contenido: [
        "Con lo que anotaste ayer, hacé un solo cambio: encogé ese hábito o cambialo de hora. No le sumes nada más esta semana, la idea es arreglar lo que está flojo, no construir algo nuevo encima de lo que todavía no cuadra.",
      ],
      accion: "Hacé más pequeño o cambiá de hora el hábito que identificaste, sin agregar nada más.",
    },
    {
      dia: 7,
      titulo: "Cierre del primer mes",
      contenido: [
        "Un mes completo revisando y ajustando. Hoy guardá el resultado de esta semana de chequeo: qué comparaste, qué hábito ajustaste y por qué. Esa nota te va a servir en la próxima revisión.",
      ],
      accion: "Guardá el resultado de esta revisión: qué ajustaste y por qué.",
    },
  ],

  // SEMANA 5 — Profundización
  5: [
    {
      dia: 1,
      titulo: "El que se lleva la energía sin que lo veas",
      contenido: [
        "No hablo del estrés de una crisis puntual, hablo del de todos los días: el tráfico, los mensajes, las mil decisiones chiquitas. Ese es el que se acumula y cansa sin que lo notes. Esta semana le vamos a poner nombre y horario.",
      ],
      accion: "Anotá tu nivel de estrés de hoy, del 1 al 5, junto a tu nota diaria.",
    },
    {
      dia: 2,
      titulo: "El cuerpo se queda en alerta",
      contenido: [
        "Cuando algo te estresa, el cuerpo no se relaja apenas termina la situación, se queda un rato en alerta. Por eso una pausa real, sin celular, ayuda a que baje esa alerta antes de que se te acumule para el día siguiente.",
      ],
      accion: "Agendá en tu celular dos pausas reales de 5 minutos sin pantalla para hoy.",
    },
    {
      dia: 3,
      titulo: "Decidir también cansa",
      contenido: [
        "Qué comer, qué ponerte, en qué orden hacer las tareas: cada decisión chiquita del día suma cansancio, aunque no lo sientas como esfuerzo. Hoy quitale una decisión al día de mañana, dejándola resuelta desde ahora.",
      ],
      accion: "Simplificá una decisión pequeña de mañana (qué comer, qué ponerte) dejándola resuelta hoy.",
    },
    {
      dia: 4,
      titulo: "Un gesto que cierra el día",
      contenido: [
        "Sin una hora de cierre, la jornada se estira sin fin. Elegí un gesto físico sencillo, cerrar el computador, cambiarte de ropa, lo que sea, y usalo siempre a la misma hora para marcarle a tu cuerpo que el día laboral terminó.",
      ],
      accion: "Definí un gesto físico que marque el cierre de tu jornada, y hacelo hoy.",
    },
    {
      dia: 5,
      titulo: "Dos minutos de respirar",
      contenido: [
        "Antes de dormir, dos minutos de respiración lenta ayudan a bajar el cuerpo de la alerta del día. Si te queda cómodo hacerlo acompañada, en el ritual del grupo también se practica de forma sencilla; es solo compañía para sostener el hábito, no lo que hace el efecto.",
      ],
      accion: "Antes de dormir, respirá lento 2 minutos.",
    },
    {
      dia: 6,
      titulo: "Todo junto, sin soltar lo anterior",
      contenido: [
        "Las pausas y la respiración se suman a lo que ya venías sosteniendo, no lo reemplazan. Hoy repasá que sigas cumpliendo horario, movimiento y agua, además de lo nuevo de esta semana. Un hábito no le quita espacio al otro.",
      ],
      accion: "Repasá que sigas cumpliendo horario, movimiento y agua, además de las pausas nuevas.",
    },
    {
      dia: 7,
      titulo: "Cierre de la semana del estrés",
      contenido: [
        "Siete días anotando tu nivel de estrés del 1 al 5. Hoy revisá esa columna completa y marcá qué día bajó más. No busques que todos los días sean un 1, busca ver si la tendencia general se movió.",
      ],
      accion: "Revisá tu nivel de estrés de los 7 días y marcá qué día bajó más.",
    },
  ],

  // SEMANA 6 — Sostenimiento
  6: [
    {
      dia: 1,
      titulo: "El día que no te sale también cuenta",
      contenido: [
        "El problema nunca es el día que se te complica, sino la culpa que viene después y que te hace soltar todo lo demás. Esta semana escribimos un plan B para cada hábito, así el mal día no se lleva la semana completa.",
      ],
      accion: "Escribí, para cada hábito, qué harías el día que de verdad no te alcance el tiempo.",
    },
    {
      dia: 2,
      titulo: "Versión mínima del sueño",
      contenido: [
        "Si hoy no vas a cumplir tu hora exacta de dormir, la versión mínima es simple: acostarte máximo una hora más tarde de lo normal. No es la meta, es el piso que no se cruza.",
      ],
      accion: "Si hoy no puedes cumplir tu hora, acostate máximo una hora más tarde y ya.",
    },
    {
      dia: 3,
      titulo: "Versión mínima del movimiento",
      contenido: [
        "Un día sin tiempo para los diez minutos completos no es un día sin movimiento. La versión mínima son tres vueltas a la casa o al bloque, y eso también cuenta como cumplido, sin culpa.",
      ],
      accion: "Si no tenés los 10 minutos completos, dá 3 vueltas a la casa y contalo como cumplido.",
    },
    {
      dia: 4,
      titulo: "Versión mínima del agua y la pausa",
      contenido: [
        "En un día apretado, no necesitás los tres vasos completos ni las dos pausas largas. La versión mínima es un vaso de agua al levantarte y treinta segundos mirando por la ventana. Eso ya cuenta.",
      ],
      accion: "En un día apretado, tomate el vaso al levantarte y una pausa de 30 segundos por la ventana.",
    },
    {
      dia: 5,
      titulo: "Nunca dos días seguidos",
      contenido: [
        "La única regla dura de esta semana: si ayer no cumpliste nada, hoy sí cumplís, aunque sea en su versión mínima. Un día flojo se recupera fácil, dos seguidos ya empiezan a desarmar el hábito.",
      ],
      accion: "Si ayer no cumpliste ningún hábito, hoy cumplí aunque sea la versión mínima de todos.",
    },
    {
      dia: 6,
      titulo: "Usala a propósito",
      contenido: [
        "Hoy, aunque tengas tiempo de sobra para la versión completa, elegí un hábito y hacelo en su versión mínima a propósito. Es para que la conozcas bien y no la tengas que improvisar el día que de verdad la necesites.",
      ],
      accion: "Elegí hoy un hábito y cumplilo a propósito en su versión mínima.",
    },
    {
      dia: 7,
      titulo: "Cierre: la rutina no se rompe fácil",
      contenido: [
        "Con las versiones mínimas ya probadas, la rutina se vuelve más difícil de tumbar. Hoy contá cuántos días de la semana cumpliste cada hábito, aunque haya sido en su versión chiquita. Ese número también vale.",
      ],
      accion: "Contá cuántos días cumpliste cada hábito, aunque sea en versión mínima.",
    },
  ],

  // SEMANA 7 — Afinación
  7: [
    {
      dia: 1,
      titulo: "Tu curva no es la de todo el mundo",
      contenido: [
        "No todas rendimos igual a la misma hora. Hoy revisá tus notas de la semana pasada y marcá en qué momentos del día te sentiste más despierta y en cuáles más lenta. Esa es tu curva real, no la que crees que deberías tener.",
      ],
      accion: "Revisá tus notas y marcá en qué horas te sentiste más despierta la semana pasada.",
    },
    {
      dia: 2,
      titulo: "Lo que exige cabeza, en tu hora alta",
      contenido: [
        "Ya que conocés tus horas altas, ponele ahí la tarea que más te exige pensar: el reporte, la conversación difícil, lo que necesita concentración. No pelees contra tu curva, acomodate a ella.",
      ],
      accion: "Programá la tarea que más te exige pensar para tu hora alta de mañana.",
    },
    {
      dia: 3,
      titulo: "Luz del día apenas te levantás",
      contenido: [
        "Salir a luz natural en la primera hora después de levantarte es una señal fuerte para tu reloj interno. No hace falta salir a caminar largo, con cinco minutos en el balcón o la ventana abierta alcanza.",
      ],
      accion: "Salí a luz del día en la primera hora después de levantarte, aunque sean 5 minutos.",
    },
    {
      dia: 4,
      titulo: "Lo mecánico va en la hora baja",
      contenido: [
        "Para tus horas bajas, guardá lo que no exige tanta cabeza: organizar, responder mensajes simples, ordenar cosas. Así no gastás tu mejor momento del día en tareas que podés hacer con la mente a media marcha.",
      ],
      accion: "Guardá una tarea mecánica para tu hora baja de hoy.",
    },
    {
      dia: 5,
      titulo: "Si el movimiento quedó muy tarde",
      contenido: [
        "Si tu caminata terminó quedando muy cerca de tu hora de dormir, revisala hoy y adelantala. La idea es que el movimiento te acompañe el día, no que se te cruce con la hora de bajar revoluciones antes de dormir.",
      ],
      accion: "Si tu caminata quedó muy cerca de tu hora de dormir, adelantala hoy.",
    },
    {
      dia: 6,
      titulo: "Cinco días seguidos",
      contenido: [
        "Repetí hoy la tarea exigente en tu hora alta, ya van varios días seguidos haciéndolo así. La constancia es la que te va a confirmar si de verdad esa hora te rinde mejor, no un solo día.",
      ],
      accion: "Repetí hoy la tarea exigente en tu hora alta.",
    },
    {
      dia: 7,
      titulo: "Cierre: ya conocés tu horario",
      contenido: [
        "Después de una semana observando, ya tenés un mapa propio del día. Escribí tus tres horas altas y tus dos horas bajas confirmadas, para que la próxima vez no tengas que adivinar, solo consultar tu propia nota.",
      ],
      accion: "Escribí tus 3 horas altas y 2 horas bajas ya confirmadas de esta semana.",
    },
  ],

  // SEMANA 8 — Nuevo hábito
  8: [
    {
      dia: 1,
      titulo: "Dejaste de discutirlo con vos misma",
      contenido: [
        "Un hábito queda instalado no cuando te sale perfecto, sino cuando dejás de pelear internamente para cumplirlo. Hoy fijate si alguno de los cinco (horario, movimiento, agua, pausas, curva de energía) ya no te cuesta tanto decidir hacerlo.",
      ],
      accion: "Notá hoy si alguno de los hábitos ya no te genera pelea interna para cumplirlo.",
    },
    {
      dia: 2,
      titulo: "Tu rutina en cinco líneas",
      contenido: [
        "Todo lo que armaste en estas ocho semanas cabe en una tarjeta chiquita. Escribí tu rutina completa en máximo cinco líneas: hora de dormir, movimiento, agua, pausas y tu hora alta. Así la tenés a mano el día que se te olvide.",
      ],
      accion: "Escribí tu rutina completa en una tarjeta de máximo 5 líneas.",
    },
    {
      dia: 3,
      titulo: "Una revisión ya agendada",
      contenido: [
        "No dejes la próxima revisión al azar. Agendala ya en tu calendario, dentro de un mes, y hacé el mismo ejercicio de la semana 4: comparar notas, ver tendencia, ajustar solo lo que se cayó.",
      ],
      accion: "Agendá en tu calendario una revisión de tus notas dentro de un mes.",
    },
    {
      dia: 4,
      titulo: "Uno para profundizar",
      contenido: [
        "De los cinco hábitos, elegí uno solo para llevarlo más lejos en los próximos treinta días. No se trata de agregar más cosas, se trata de profundizar en el que más te está sirviendo a vos.",
      ],
      accion: "Elegí un solo hábito de los cinco para profundizar en los próximos 30 días.",
    },
    {
      dia: 5,
      titulo: "Guardá lo que construiste",
      contenido: [
        "Ocho semanas de notas son un registro valioso, no lo dejes disperso. Guardalas en un solo lugar donde las puedas volver a consultar. Si te sirvió tener el acompañamiento del grupo del ritual en el camino, seguí ahí como apoyo, sin que reemplace tus propios hábitos.",
      ],
      accion: "Guardá las notas de las 8 semanas en un solo lugar donde las puedas volver a ver.",
    },
    {
      dia: 6,
      titulo: "Cuando la vida cambie",
      contenido: [
        "Un viaje, un trabajo nuevo, una mudanza: la vida se va a mover y tu rutina con ella. Cuando eso pase, no empieces de cero, reanclá cada hábito a los nuevos momentos de tu día. La estructura ya la tenés, solo cambia el reloj.",
      ],
      accion: "Pensá en tu próximo cambio y a qué momento del nuevo día vas a anclar cada hábito.",
    },
    {
      dia: 7,
      titulo: "Cierre de las 8 semanas",
      contenido: [
        "Ocho semanas atrás ni tenías un horario fijo para dormir. Hoy leé completa tu tarjeta de rutina y confirmá que sigue siendo la que necesitás. Lo que armaste no fue un reto de un mes, es la base con la que seguís de acá en adelante.",
      ],
      accion: "Leé completa tu tarjeta de rutina y confirmá que sigue siendo la que necesitás hoy.",
    },
  ],
};

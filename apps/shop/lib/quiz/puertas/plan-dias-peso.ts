import type { DiaPlanContenido } from "./plan-contenido";

/**
 * Contenido diario del plan de PESO (Fase 22) — 56 dias (8 semanas x 7
 * dias) que desarrollan en la practica cada leccion semanal de
 * plan-contenido.ts, sin repetirla. Voz Milito (voseo), cero cifras de
 * peso/medidas, cero comentario del cuerpo, cero promesa de resultado, cero
 * urgencia fabricada.
 */
export const DIAS_PESO: Record<number, DiaPlanContenido[]> = {
  1: [
    {
      dia: 1,
      titulo: "Arrancamos por los horarios",
      contenido: [
        "Esta semana no tocamos qué comés, vos seguí comiendo lo de siempre. Lo primero es ponerle hora fija a desayuno, almuerzo y cena — más o menos la misma hora todos los días. Parece poquito, pero es la base de todo lo que viene después. Sin horario ordenado, cualquier otro cambio se cae.",
      ],
      accion: "Escribí hoy mismo las 3 horas fijas de tus comidas.",
    },
    {
      dia: 2,
      titulo: "Elegí tus horas reales",
      contenido: [
        "No copiés un horario de otra persona ni de una app: elegí las horas que de verdad podés sostener con tu rutina de trabajo y de casa. Si el almuerzo te toca a la 1pm entre semana, esa es tu hora, no la 12 que dice cualquier plan genérico. Lo que sirve es lo que se repite, no lo ideal.",
      ],
      accion: "Confirmá tus 3 horarios y ponelos de alarma en el celular.",
    },
    {
      dia: 3,
      titulo: "Decidir sin hambre encima",
      contenido: [
        "Cuando el hambre ya te tiene con afán, cualquier decisión sobre comida sale apurada y casi nunca es la que vos de verdad querías. Por eso el horario fijo importa tanto: te adelantás al hambre en vez de reaccionar a ella. Hoy fijate si alguna comida se te corrió por estar ocupada y qué pasó con esa decisión.",
      ],
      accion: "Comé en tu horario de hoy aunque no tengas mucha hambre todavía.",
    },
    {
      dia: 4,
      titulo: "Sumamos caminata corta",
      contenido: [
        "Aparte de los horarios, esta semana sumás una caminata de 10 a 15 minutos cada día. No importa el ritmo ni la distancia, importa que la hagas. La frecuencia le gana a la intensidad cuando estás empezando: mejor 10 minutos todos los días que 40 minutos un solo día y después nada.",
      ],
      accion: "Caminá 10 minutos hoy, a la hora que más te acomode.",
    },
    {
      dia: 5,
      titulo: "El movimiento sirve para todo",
      contenido: [
        "Esta caminata diaria no es solo para un objetivo en particular: le sirve igual a quien quiere subir masa, a quien quiere definir o a quien quiere sentirse más liviana. Es una base de movimiento que acompaña cualquier meta, así que no la pienses como un medio para un fin — es un hábito con valor propio.",
      ],
      accion: "Sumá tu caminata de hoy y notá cómo te sentís al terminarla.",
    },
    {
      dia: 6,
      titulo: "Anotá sin juzgarte",
      contenido: [
        "Llevá un registro corto de tus horarios cumplidos y de cómo te sentiste cada día — no para calificarte, sino para ver el patrón real de tu semana. Un día que se te corrió el horario no arruina nada, es información. Lo que buscamos es data honesta, no una nota perfecta.",
      ],
      accion: "Anotá en una libreta o el celular tus horarios y una palabra de cómo te sentiste.",
    },
    {
      dia: 7,
      titulo: "Cerramos la semana 1",
      contenido: [
        "Llegaste al final de la primera semana: horarios más ordenados y una caminata diaria que ya empieza a sentirse costumbre. No hace falta que haya salido perfecto, con que la mayoría de los días hayas cumplido ya vamos bien. La próxima semana repetimos esto mismo, sin agregar nada nuevo todavía.",
      ],
      accion: "Revisá tus notas de la semana y marcá cuántos días cumpliste horarios.",
    },
  ],
  2: [
    {
      dia: 1,
      titulo: "Repetimos, no sumamos",
      contenido: [
        "Esta semana no hay nada nuevo que aprender: la tarea es sostener los horarios y la caminata que ya empezaste. La constancia moderada — sostenida semana tras semana — le gana por mucho a la restricción corta que dura tres días y se rompe. Vos ya sabés qué hacer, ahora se trata de repetirlo.",
      ],
      accion: "Cumplí tus 3 horarios de comida hoy, igual que la semana pasada.",
    },
    {
      dia: 2,
      titulo: "Plan que sí se sostiene",
      contenido: [
        "Un plan estricto de todo o nada se rompe apenas la vida real se atraviesa: una reunión larga, una salida, un mal día. Un plan moderado, que tolera que algún día no salga perfecto, es el que dura las 8 semanas completas. Preferimos que vos sigas mañana, no que hoy salga impecable.",
      ],
      accion: "Si hoy se te corre un horario, seguí con el siguiente sin culpa.",
    },
    {
      dia: 3,
      titulo: "Subimos la caminata",
      contenido: [
        "Esta semana la caminata sube de 10-15 a 20 minutos diarios. Si un solo bloque de 20 se te complica, dividilo en dos caminatas de 10: el cuerpo no distingue si fue de una vez o repartida, lo que cuenta es que se haya movido. Andá a tu ritmo, sin apurarte.",
      ],
      accion: "Caminá 20 minutos hoy, de una vez o en dos partes de 10.",
    },
    {
      dia: 4,
      titulo: "Nunca dos seguidas",
      contenido: [
        "Esta semana entra una regla simple: si un día se te descuadra el horario o te saltás la caminata, el día siguiente sí o sí lo retomás. Lo que rompe el proceso no es fallar un día, es dejar que un día suelto se convierta en una semana entera perdida.",
      ],
      accion: "Si ayer fallaste algo, hoy retomalo sin falta.",
    },
    {
      dia: 5,
      titulo: "Encontrá tu obstáculo",
      contenido: [
        "Toda semana tiene un momento donde más se te descuadra la rutina: la hora del almuerzo en el trabajo, el cansancio de las 6pm, el fin de semana sin horario fijo. Identificarlo no es para castigarte, es para poder ponerle una solución concreta la próxima vez que aparezca.",
      ],
      accion: "Escribí cuál es el momento donde más se te complica sostener el plan.",
    },
    {
      dia: 6,
      titulo: "Seguí anotando los días malos",
      contenido: [
        "Los días donde no cumpliste también se anotan, y de hecho son los más útiles: ahí está la información de qué te está costando de verdad. No se trata de tener una libreta perfecta, se trata de tener una libreta honesta que te sirva para ajustar.",
      ],
      accion: "Anotá hoy tu día, sea bueno o flojo, tal como fue.",
    },
    {
      dia: 7,
      titulo: "Cerramos la semana 2",
      contenido: [
        "Dos semanas seguidas sosteniendo horarios y movimiento ya es una base sólida — eso es lo que decide si esto te va a durar. No buscamos que hayan sido perfectas, buscamos que la mayoría de los días hayan cumplido. La próxima semana por fin entramos al plato.",
      ],
      accion: "Contá cuántos de los 7 días cumpliste tus horarios esta semana.",
    },
  ],
  3: [
    {
      dia: 1,
      titulo: "Ahora sí, el plato",
      contenido: [
        "Con los horarios ya estables, esta semana entramos al plato — pero acá no se prohíbe nada. La idea es que tus 3 comidas principales tengan proteína, una porción de verdura o fruta, y un carbohidrato. Ningún alimento queda por fuera, se trata de armar el plato completo, no de restringir.",
      ],
      accion: "Armá tu almuerzo de hoy con proteína, verdura o fruta, y carbohidrato.",
    },
    {
      dia: 2,
      titulo: "Los tres grupos en cada comida",
      contenido: [
        "No hace falta pesar ni medir nada: mirá el plato y preguntate si tiene los tres grupos — proteína, verdura o fruta, carbohidrato. Si falta uno, lo completás con lo que tengas a mano en casa. Es un chequeo visual simple, no una fórmula complicada.",
      ],
      accion: "Revisá tus 3 comidas de hoy y completá el grupo que les falte.",
    },
    {
      dia: 3,
      titulo: "Comer sin pantalla",
      contenido: [
        "Elegí al menos una comida del día para hacerla sentada, sin celular ni televisión encendida. Comer distraída hace que el cuerpo no registre bien la comida, y eso después se traduce en más hambre de la que realmente había. Es un cambio chiquito con efecto grande.",
      ],
      accion: "Comé una comida hoy sentada, sin pantalla de por medio.",
    },
    {
      dia: 4,
      titulo: "La pausa a mitad del plato",
      contenido: [
        "A la mitad de esa comida, parate un segundo y preguntate si seguís con hambre o si ya vas llegando. No es para dejar de comer, es para que la decisión de seguir o parar sea consciente y no automática. Con la práctica esa pausa se vuelve costumbre.",
      ],
      accion: "Hacé la pausa a mitad de tu almuerzo de hoy.",
    },
    {
      dia: 5,
      titulo: "Ajustá según tu meta",
      contenido: [
        "Si tu meta es sumar masa, tu plato puede llevar una porción más generosa o una comida completa extra en el día. Si tu meta es definir o bajar composición, mantené la misma estructura de los tres grupos y ajustá el tamaño del carbohidrato, sin sacarlo del plato.",
      ],
      accion: "Ajustá el tamaño de tu plato según tu meta, sin quitar ningún grupo.",
    },
    {
      dia: 6,
      titulo: "Todo junto, sin soltar nada",
      contenido: [
        "Esta semana suma el plato completo, pero eso no reemplaza los horarios ni la caminata — se acumulan. Es normal sentir que ahora hay más cosas para sostener; por eso vamos de a una capa por semana. Si algo se te complica, priorizá los horarios y la caminata primero.",
      ],
      accion: "Cumplí hoy horario, caminata y plato completo, los tres juntos.",
    },
    {
      dia: 7,
      titulo: "Cerramos la semana 3",
      contenido: [
        "Ya llevás tres semanas construyendo hábito sobre hábito: horarios, movimiento y ahora un plato con intención. La próxima semana no sumamos nada nuevo, hacemos una pausa para revisar juntas cómo te fue en este primer tramo, sin báscula de por medio.",
      ],
      accion: "Revisá tus notas de la semana y quedate tranquila con lo que cumpliste.",
    },
  ],
  4: [
    {
      dia: 1,
      titulo: "Esta semana revisamos",
      contenido: [
        "No hay hábito nuevo esta semana: nos detenemos a mirar las tres primeras semanas completas. La báscula no entra en esta revisión — se mueve por agua, por sal, por el ciclo, y no sirve para decidir nada. Lo que sí sirve es lo que vos anotaste día a día.",
      ],
      accion: "Sacá tus notas de las 3 semanas y tenelas a mano hoy.",
    },
    {
      dia: 2,
      titulo: "La báscula no es la métrica",
      contenido: [
        "Si algún día pesarte te generó ansiedad o confusión, hoy es un buen momento para soltar esa costumbre. El número del día no cuenta la historia completa de tres semanas de trabajo. Las métricas que sí importan son otras: constancia, sensación, energía. De eso hablamos esta semana.",
      ],
      accion: "Guardá la báscula esta semana y confiá en tus notas.",
    },
    {
      dia: 3,
      titulo: "Contamos los tres números",
      contenido: [
        "De los 21 días que llevás, contá cuántos cumpliste horarios, cuántos hiciste tu caminata, y cuántos armaste el plato completo. Guardá esos 3 números en un lugar seguro, porque en la semana 8 los vamos a comparar con los nuevos y ahí vas a ver el avance real.",
      ],
      accion: "Contá y anotá tus 3 números: horarios, movimiento y plato cumplidos.",
    },
    {
      dia: 4,
      titulo: "Cómo te sentís hoy",
      contenido: [
        "Más allá de los números, preguntate cómo llegás a la tarde comparado con el día 1, si te pica menos entre comidas, cómo estás durmiendo. Esas sensaciones dicen mucho de cómo va el proceso, aunque no se puedan medir en una tabla.",
      ],
      accion: "Escribí 2 o 3 frases de cómo te sentís hoy versus el día 1.",
    },
    {
      dia: 5,
      titulo: "El hábito que más te costó",
      contenido: [
        "De los tres — horario, caminata, plato — identificá cuál fue el que menos cumpliste. No es para regañarte, es información valiosa: ese hábito necesita un ajuste, no fuerza de voluntad extra. La próxima semana seguís con los otros dos mientras trabajás en ese.",
      ],
      accion: "Identificá cuál de los 3 hábitos fue el que menos sostuviste.",
    },
    {
      dia: 6,
      titulo: "Cambiale la hora, no lo sueltes",
      contenido: [
        "Si un hábito no está funcionando, antes de abandonarlo probá cambiarle la hora o el lugar. Si la caminata de la mañana no te cuadra, probala después del almuerzo. Si el plato completo se te complica en la cena, reforzalo en el almuerzo. Es el mismo hábito, con otro empaque.",
      ],
      accion: "Movele la hora o el lugar al hábito que más se te dificulta.",
    },
    {
      dia: 7,
      titulo: "Cerramos el primer chequeo",
      contenido: [
        "Guardá esta revisión completa — los 3 números, las sensaciones, el ajuste que hiciste. Es tu punto de comparación para la semana 8. Si en algún momento sentís que necesitás sostenerlo entre varias, el acompañamiento del grupo siempre está ahí, pero el ritmo lo marcás vos.",
      ],
      accion: "Guardá tu revisión completa en un lugar donde la vuelvas a encontrar en 4 semanas.",
    },
  ],
  5: [
    {
      dia: 1,
      titulo: "Entra la fuerza básica",
      contenido: [
        "Esta semana sumamos entrenamiento de fuerza, que le sirve por igual a quien quiere subir masa, a quien quiere definir o a quien busca su propia versión de bienestar — no es solo para un objetivo. Empezamos con el peso del propio cuerpo, sin necesidad de gimnasio ni equipo.",
      ],
      accion: "Elegí el momento del día en que vas a hacer tus sesiones de fuerza.",
    },
    {
      dia: 2,
      titulo: "Movimientos sin gimnasio",
      contenido: [
        "La sesión se arma con 4 o 5 movimientos simples: sentadilla, flexión apoyada en la pared o el piso, puente de glúteo, plancha y remo casero con lo que tengas en casa. No hace falta más que eso para empezar a construir fuerza real.",
      ],
      accion: "Anotá los 5 movimientos que vas a incluir en tu sesión.",
    },
    {
      dia: 3,
      titulo: "Primera sesión, técnica primero",
      contenido: [
        "Hoy hacés tu primera sesión de la semana. La prioridad es la técnica, no la cantidad: mejor 8 sentadillas bien hechas que 20 apuradas. Andá despacio, sentí el movimiento, y si algo no te sale con buena forma, hacé menos repeticiones pero mejor ejecutadas.",
      ],
      accion: "Hacé tu primera sesión de fuerza priorizando la forma sobre la cantidad.",
    },
    {
      dia: 4,
      titulo: "Un día de descanso entre medio",
      contenido: [
        "Entre tus dos sesiones de fuerza de la semana dejá al menos un día de descanso — el cuerpo necesita ese tiempo para adaptarse al esfuerzo nuevo. Hoy, si te toca descanso de fuerza, seguí con tu caminata como siempre.",
      ],
      accion: "Cumplí tu caminata de hoy como día sin fuerza.",
    },
    {
      dia: 5,
      titulo: "Segunda sesión de la semana",
      contenido: [
        "Llegó la segunda sesión. Vas a notar que hoy se siente distinto a la primera, quizás algo más cómoda o quizás con más cansancio acumulado — ambas cosas son normales cuando el cuerpo se está adaptando a un estímulo nuevo.",
      ],
      accion: "Hacé tu segunda sesión de fuerza de la semana.",
    },
    {
      dia: 6,
      titulo: "La caminata no se suelta",
      contenido: [
        "Aunque ahora hay fuerza en el plan, la caminata diaria en los días sin sesión se mantiene igual que en las semanas anteriores. Son hábitos distintos que se complementan, no que se reemplazan uno al otro.",
      ],
      accion: "Sumá tu caminata en cualquier día sin sesión de fuerza.",
    },
    {
      dia: 7,
      titulo: "Cerramos la semana 5",
      contenido: [
        "Cerraste tu primera semana con fuerza incluida. Antes de terminar, pensá qué podrías ajustar la próxima semana para sumar una repetición más en alguno de los movimientos — no se trata de hacer más sesiones, sino de ir un poquito más allá en la misma.",
      ],
      accion: "Anotá en qué movimiento te gustaría sumar una repetición la próxima semana.",
    },
  ],
  6: [
    {
      dia: 1,
      titulo: "El descanso también trabaja",
      contenido: [
        "Esta semana hablamos de sueño y estrés, porque son la base que sostiene todo lo demás. Dormir poco desordena el hambre — aparece más temprano y con más ganas de dulce — y también baja las ganas de moverse. El descanso no es un premio, es parte del trabajo.",
      ],
      accion: "Fijate a qué hora te acostaste anoche y anotalo.",
    },
    {
      dia: 2,
      titulo: "Hora fija para dormir",
      contenido: [
        "Igual que le pusiste hora fija a las comidas en la semana 1, ahora le ponés hora fija a acostarte. Apagá las pantallas 30 minutos antes de esa hora: la luz y el estímulo de la pantalla le cuestan al cuerpo entrar en modo descanso.",
      ],
      accion: "Fijá tu hora de acostarte y apagá pantallas 30 minutos antes.",
    },
    {
      dia: 3,
      titulo: "La pausa antes de comer por estrés",
      contenido: [
        "Cuando el impulso de comer viene del estrés y no del hambre real, probá una pausa de 10 minutos antes: tomá agua, caminá una cuadra, respirá hondo unas cuantas veces. Si después de eso seguís con hambre, comé tranquila; si era estrés, ya se te pasó.",
      ],
      accion: "Usá la pausa de 10 minutos la próxima vez que sientas ganas de comer por estrés.",
    },
    {
      dia: 4,
      titulo: "Tu versión mínima",
      contenido: [
        "Va a haber semanas difíciles donde no vas a poder sostener todo el plan completo, y está bien. Armá desde ya una versión mínima: horarios, una caminata corta y dormir a la hora — eso solo ya sostiene el proceso hasta que la semana se acomode de nuevo.",
      ],
      accion: "Escribí tu versión mínima para una semana complicada.",
    },
    {
      dia: 5,
      titulo: "Sostenemos la fuerza",
      contenido: [
        "Aunque esta semana el foco esté en sueño y estrés, tus 2 sesiones de fuerza se mantienen. Si podés, sumá la repetición extra que anotaste la semana pasada — pequeño paso, mismo movimiento.",
      ],
      accion: "Hacé tus 2 sesiones de fuerza sumando una repetición si podés.",
    },
    {
      dia: 6,
      titulo: "Cómo dormiste esta semana",
      contenido: [
        "Revisá cómo te fue con la hora de acostarte y con las pantallas apagadas antes. Si te está costando, no es falta de disciplina, es un hábito nuevo que también necesita tiempo — igual que le pasó a los horarios de comida al principio.",
      ],
      accion: "Anotá cómo te sentiste esta semana con tu hora de dormir.",
    },
    {
      dia: 7,
      titulo: "Cerramos la semana 6",
      contenido: [
        "El sueño y el manejo del estrés no se ven en una libreta de comidas, pero sostienen todo lo demás por debajo. Con esta base más firme, la próxima semana trabajamos algo que a todas nos pasa: los paseos, los eventos y los días fuera de rutina.",
      ],
      accion: "Revisá tu versión mínima y guardala para cuando la necesites.",
    },
  ],
  7: [
    {
      dia: 1,
      titulo: "Ninguna comida es mala",
      contenido: [
        "Esta semana trabajamos algo distinto: cómo manejar paseos y eventos sin culpa. Ninguna comida es buena ni mala en sí misma; ponerle culpa es lo que lleva a compensar de más — saltarse la comida siguiente, entrenar de más, o soltar todo el fin de semana.",
      ],
      accion: "Notá si alguna vez sentís culpa por una comida y solo observalo, sin actuar.",
    },
    {
      dia: 2,
      titulo: "Elegí disfrutar sin plan",
      contenido: [
        "Elegí una comida de esta semana para disfrutarla sin plan y sin pensar en compensar después. Puede ser algo con amigas, en familia, donde sea que te haga sentido. La idea es vivirla tranquila, sin cargarla de peso que no le corresponde.",
      ],
      accion: "Elegí cuál comida de esta semana vas a disfrutar sin plan.",
    },
    {
      dia: 3,
      titulo: "La comida siguiente, normal",
      contenido: [
        "Después de esa comida libre, la siguiente comida es completamente normal, en su horario de siempre, sin castigo ni compensación. No hay que saltarse nada ni entrenar de más para 'pagarla'. Retomar el horario normal es la única acción que corresponde.",
      ],
      accion: "Retomá tu horario normal en la comida siguiente a la que disfrutaste.",
    },
    {
      dia: 4,
      titulo: "Antes de salir a un evento",
      contenido: [
        "Para un paseo o un evento, la clave está en no llegar con hambre acumulada: comé algo completo antes de salir. Llegar con mucha hambre es lo que hace que cualquier decisión ahí se sienta más difícil de manejar.",
      ],
      accion: "Si tenés un evento esta semana, comé algo completo antes de salir.",
    },
    {
      dia: 5,
      titulo: "En el evento: servir una vez",
      contenido: [
        "Ya en el evento, servite el plato una sola vez en vez de repetir varias, y tomá agua entre bebida y bebida. Son dos gestos simples que te ayudan a disfrutar sin perder de vista tu propio ritmo.",
      ],
      accion: "Servite una sola vez y tomá agua entre bebidas si estás en un evento.",
    },
    {
      dia: 6,
      titulo: "Hambre real o ansiedad",
      contenido: [
        "Usá la pausa de 10 minutos que aprendiste en la semana 6 para distinguir si las ganas de comer vienen de hambre real o de aburrimiento y ansiedad. Con la práctica, esa distinción se vuelve cada vez más clara.",
      ],
      accion: "Usá la pausa de 10 minutos ante cualquier antojo fuera de horario hoy.",
    },
    {
      dia: 7,
      titulo: "Cerramos la semana 7",
      contenido: [
        "Ya sabés manejar los días fuera de rutina sin que te descarrilen la semana entera. Sostuviste fuerza y caminatas de fondo mientras trabajabas esto. La próxima semana es la última: armamos tu propia versión del plan para seguir sin depender de que alguien más te diga qué hacer.",
      ],
      accion: "Revisá cómo te fue esta semana con paseos o eventos, sin juzgarte.",
    },
  ],
  8: [
    {
      dia: 1,
      titulo: "Comparamos los números",
      contenido: [
        "Sacá los 3 números que guardaste en la semana 4 y compáralos con cómo te fue en estas 8 semanas completas. No es un examen, es simplemente mirar el camino recorrido con datos tuyos, reales, sin báscula de por medio.",
      ],
      accion: "Compará tus números de la semana 4 con los de esta semana 8.",
    },
    {
      dia: 2,
      titulo: "Lo que encajó y lo que costó",
      contenido: [
        "Escribí los 3 hábitos que mejor se acomodaron a tu vida y los que más te costaron sostener. Que algo te haya costado no es un fallo tuyo, es que esa versión particular no encajaba en esta etapa — hay que ajustarla, no descartarla.",
      ],
      accion: "Escribí 3 hábitos que te encajaron bien y 3 que te costaron.",
    },
    {
      dia: 3,
      titulo: "Tu plan en una hoja",
      contenido: [
        "Con todo lo que ya probaste, armá tu propio plan en una hoja: tus horarios, tus días de fuerza, tu caminata, tu hora de dormir. Ya no es un plan genérico, es el tuyo, hecho a la medida de lo que funcionó en tu vida real.",
      ],
      accion: "Armá tu plan completo en una hoja, con todos sus horarios.",
    },
    {
      dia: 4,
      titulo: "Tu versión mínima al lado",
      contenido: [
        "Al lado de tu plan completo, dejá escrita tu versión mínima — la que armaste en la semana 6 — para esas semanas donde la vida se complica. Tener las dos versiones a mano te evita el todo o nada.",
      ],
      accion: "Escribí tu versión mínima al lado de tu plan completo.",
    },
    {
      dia: 5,
      titulo: "Un solo objetivo",
      contenido: [
        "Para las próximas 8 semanas, elegí un solo objetivo de progresión — no varios a la vez. Puede ser sumar una repetición más, estirar la caminata, o sostener mejor la hora de dormir. Uno solo, bien elegido, avanza más que cinco a medias.",
      ],
      accion: "Elegí un único objetivo de progresión para tus próximas 8 semanas.",
    },
    {
      dia: 6,
      titulo: "Repasá todo tu plan",
      contenido: [
        "Antes de cerrar, leé completo el plan que armaste: horarios, fuerza, caminatas, sueño, tu versión mínima y tu objetivo elegido. Este repaso es lo que te va a permitir seguir sola, sin depender de que alguien más te diga cada paso.",
      ],
      accion: "Leé tu plan completo de principio a fin hoy.",
    },
    {
      dia: 7,
      titulo: "Arrancás tu propio ciclo",
      contenido: [
        "Cerramos las 8 semanas con un plan que ya es tuyo, construido con tus propios datos y tu propia experiencia. De acá en adelante seguís vos, con tu hoja, tu versión mínima y tu objetivo claro. Este fue el punto de partida, no el final.",
      ],
      accion: "Guardá tu plan en un lugar visible y empezá tu nuevo ciclo mañana.",
    },
  ],
};

import { esPuertaReto, type PuertaReto } from "./reto-contenido";

/**
 * Contenido REAL del plan de 8 semanas, POR PUERTA (piel/energia/peso) —
 * reemplaza el placeholder de una-frase-por-semana de plan-semanas.ts
 * (que sigue siendo la fuente de titulos/resumenes para las listas).
 *
 * Cada semana: leccion didactica en voz de Milito (3-4 parrafos) +
 * acciones concretas de la semana (checklist/rutina) + espacio de video
 * (null hasta que Milito grabe). Escrito por 3 redactores en paralelo con
 * las reglas duras por puerta:
 *   - piel: cero promesa clinica, cero antes/despues.
 *   - energia: PROHIBIDO atribuir efectos de suplementos (regla li-03).
 *   - peso: cero cifras, cero promesa, cero comentario del cuerpo.
 * Todas: voz Milito, cero testimonios, cero urgencia; cada leccion cierra
 * con puente suave al coaching grupal.
 *
 * GATE DE COMPRA (decision de Alexander 2026-08-03): semanas 1-2 gratis;
 * 3-8 se abren con compra (ver usuarioTieneCompra en lib/mi-plan.ts).
 */

export type SemanaPlanContenido = {
  numero: number;
  titulo: string;
  resumen: string;
  /** 3-4 parrafos en voz de Milito. */
  leccion: string[];
  /** 3-5 acciones concretas y medibles de la semana. */
  acciones: string[];
  /** Video de Milito para la semana — null hasta que exista. */
  videoId: string | null;
};

/** Ultima semana gratuita — de la siguiente en adelante exige compra. */
export const SEMANA_GRATIS_HASTA = 2;

export { esPuertaReto, type PuertaReto };

const PLAN_PIEL: SemanaPlanContenido[] = [
  {
    numero: 1,
    titulo: "Fundamentos",
    resumen: "Arrancas tu ritual y aprendes el orden correcto de cada paso.",
    leccion: [
      "Hola, soy Milito. Arrancamos por lo que más rinde y menos te cuesta: el orden. Tu ritual no es una lista de productos, es una secuencia, y cuando la secuencia está desordenada buena parte de lo que te aplicas no alcanza a hacer su trabajo. La regla que quiero que te aprendas esta semana es de textura: primero limpias, después va lo más líquido, después lo más denso, y el protector solar siempre de último en la mañana. Esa sola regla te ordena el 80% del ritual, tengas los productos que tengas.",
      "La limpieza va primero por algo muy simple: durante el día tu piel acumula sebo, sudor, residuo de maquillaje y todo lo que hay en el aire. Eso arma una capa encima. Si aplicas hidratación sobre esa capa, se la estás poniendo al residuo, no a la piel. Ahora, limpiar no significa tallar ni dejar la cara chillando: agua tibia (nunca caliente), tu limpiador, movimientos suaves y secar con toquecitos, sin frotar la toalla. Si a los diez minutos de lavarte sientes la cara tirante, esa limpieza fue demasiado fuerte para ti y lo vamos a ajustar más adelante.",
      "Y el protector solar va de último por una razón física, no por capricho: se queda arriba formando una película pareja que necesita quedar completa. Si le pones algo encima, la mueves, la diluyes y le abres huecos. Por eso es el cierre de la mañana y por eso va los siete días, aunque estés en casa todo el día: la luz entra por las ventanas y un día nublado no apaga la radiación. Es el paso que más se salta la gente y el que menos discusión tiene.",
      "Esta semana no cambiamos nada más. No sumes productos, no salgas a buscar uno nuevo, no te compliques. Solo el orden, mañana y noche, y una línea escrita cada día de cómo sentiste la piel. Cada piel responde a su ritmo, así que lo que estamos armando ahora es la base sobre la que después vamos a poder ajustar con datos tuyos y no con recomendaciones generales. Este orden lo repasamos en vivo en las clases del coaching grupal, si quieres que lo veamos juntas paso a paso.",
    ],
    acciones: [
      "Escribe los pasos de tu ritual en orden en una nota del celular y déjala a mano.",
      "Limpia tu rostro mañana y noche los 7 días, con agua tibia y sin frotar.",
      "Usa tu protector solar los 7 días en la mañana, incluso si no sales de la casa.",
      "Anota una línea diaria: cómo sentiste la piel (cómoda, tirante, con brillo, con ardor).",
    ],
    videoId: null,
  },
  {
    numero: 2,
    titulo: "Constancia",
    resumen: "La semana en la que el habito se empieza a sostener solo.",
    leccion: [
      "Segunda semana. Ya sabes el orden, así que la dificultad se corrió de lugar: ahora no es aprender el ritual, es acordarse de hacerlo un martes a las once de la noche cuando estás muerta del cansancio. Y eso no se resuelve con fuerza de voluntad, se resuelve con logística. El truco que mejor funciona es pegar el hábito nuevo a uno que ya haces sin pensar: si te lavas los dientes todas las noches, tu limpiador vive al lado del cepillo. La decisión deja de existir porque el producto ya está ahí, en tu camino.",
      "¿Por qué insisto tanto con la constancia antes que con cualquier otra cosa? Porque la piel trabaja de forma continua, no por eventos. Se renueva, produce sebo, pierde agua y se repara todos los días, y responde al estímulo repetido, no al día perfecto. Un domingo dedicándole una hora entera no compensa cinco días saltados; cinco minutos bien hechos todos los días sí construyen algo. Por eso prefiero mil veces un ritual corto que sostienes a uno completo que abandonas en quince días.",
      "Ahora, vas a fallar algún día. Todas fallamos. Lo importante es qué haces al día siguiente, y ahí es donde se pierde la mayoría: no por saltarse un día, sino por la culpa que viene después y que termina en el clásico \"ya rompí la racha, arranco el mes que viene\". Para eso existe el ritual mínimo: dos pasos que puedes hacer con sueño, con gripa o llegando a la una de la mañana. Limpiar en la noche y protector en la mañana. Ese es tu piso, y cumplir el piso también cuenta como cumplir.",
      "Esta semana la meta no es hacerlo perfecto, es no dejar ningún hueco de dos días seguidos. Marca cada día en tu nota, incluso los días en que solo alcanzaste el mínimo. Ver la racha escrita hace más por la constancia que cualquier intención. Si te cuesta sostenerlo, esta es justo la conversación que tenemos en las clases en vivo del coaching grupal.",
    ],
    acciones: [
      "Deja tu limpiador físicamente al lado del cepillo de dientes, no guardado en un cajón.",
      "Escribe tu ritual mínimo de 2 pasos y tenlo definido antes de necesitarlo.",
      "Marca los 7 días en una nota o calendario, incluyendo los días de ritual mínimo.",
      "Pon una alarma a la hora en que quieres hacer el ritual de la noche.",
      "Sigue anotando la línea diaria de cómo sentiste la piel.",
    ],
    videoId: null,
  },
  {
    numero: 3,
    titulo: "Ajuste fino",
    resumen: "Afinamos cantidades y frecuencia segun como responde tu piel.",
    leccion: [
      "Semana 3. Con el hábito andando ya podemos afinar, y lo primero es la cantidad. Aquí hay una idea muy metida que hace daño: que más producto rinde más. No funciona así. La piel toma hasta cierto punto y el resto se queda arriba, te deja sensación pegajosa y te acaba el producto en la mitad del tiempo. Como referencia: tu limpiador, del tamaño de una arveja; tu hidratante, como una avellana. Después ajustas según cómo te quede, pero arranca por ahí antes de echarte medio pote.",
      "La excepción es el protector solar, y es al revés: casi todas nos quedamos cortas. La medida que se usa como guía son dos dedos, del índice y el del medio, desde la base hasta la punta, para cara y cuello. Cuando lo mides la primera vez parece muchísimo. Esa es justamente la señal de que venías usando menos de lo que creías, y un protector aplicado a medias protege a medias.",
      "Lo segundo que quiero que aprendas esta semana es a leer tu piel, porque te está hablando todo el tiempo. Tirantez a los diez minutos de lavarte: la limpieza está siendo muy agresiva o falta hidratación después. Brillo a media mañana: no siempre es exceso de grasa, a veces es la piel deshidratada compensando. Ardor, escozor o rojo que no baja en un rato: eso no es \"que está haciendo efecto\", eso es una señal de parar ese paso y contarme. Nada bueno se construye sobre una piel irritada.",
      "Y una regla que te va a servir todo el resto del plan: un solo cambio a la vez. Si ajustas la cantidad del limpiador, cambias la crema y sumas algo nuevo la misma semana, después no vas a tener forma de saber qué te cayó bien y qué no. Cambias una cosa, la observas unos días, anotas, y sigues. En el coaching grupal dedicamos una clase entera a leer estas señales, por si quieres profundizar.",
    ],
    acciones: [
      "Mide una vez las cantidades reales: arveja para el limpiador, avellana para el hidratante.",
      "Aplica el protector solar con la medida de dos dedos, cara y cuello, los 7 días.",
      "Haz un solo cambio esta semana y anótalo, para saber a qué atribuir lo que pase.",
      "En tu nota diaria registra tirantez, brillo o molestia, no solo si cumpliste.",
      "Si algún paso te arde o te deja rojo, suspéndelo y escríbeme tu caso puntual.",
    ],
    videoId: null,
  },
  {
    numero: 4,
    titulo: "Primer chequeo",
    resumen: "Revisamos juntas que tanto avanzaste desde el diagnostico.",
    leccion: [
      "Llegamos al primer chequeo, y quiero que lo hagamos bien: esto no es pararse frente al espejo a buscar cambios. Es revisar el proceso, que es lo único que a esta altura te da información útil. Abre tus notas de las tres semanas anteriores y ten a mano tu diagnóstico. Vamos con tres preguntas concretas: cuántos días de los veintiuno cumpliste, cuál es el paso que más se te cae, y qué palabra escribiste más veces en tus notas (tirantez, brillo, comodidad, molestia).",
      "La primera pregunta te dice si el problema es de plan o de ejecución. Si cumpliste la mayoría de los días, vamos bien y lo que sigue es ajustar. La segunda es la más valiosa de todas: cuando un paso se cae siempre, casi nunca es falta de disciplina, es un problema logístico. El producto quedó en otro baño, el paso es incómodo a esa hora, la textura no te gusta. Cambia la logística y el paso deja de fallar solo. La tercera te da el patrón de tu piel, y ese patrón lo comparas con lo que te salió en el diagnóstico: puede que siga vigente tal cual, o puede que ya no te esté pasando lo mismo que al principio.",
      "Sobre lo que ves en el espejo, te hablo claro. Lo primero que suele notarse es la sensación: piel más cómoda, menos tirante después de lavar, menos ganas de estarse retocando. Eso llega antes que cualquier otra cosa. Y cada piel responde distinto y a su propio tiempo, así que no compares tu semana 4 con la de nadie más. Si todavía no notas nada, no significa que no esté pasando nada; significa que llevas cuatro semanas, y para una piel eso es poco tiempo.",
      "Cierra el chequeo escribiendo tres líneas de cómo sientes tu piel hoy y guárdalas, porque en la semana 8 las vamos a volver a leer y ahí sí vas a tener con qué comparar. Si quieres que revisemos tu chequeo con otros ojos, en las clases en vivo del coaching grupal las hacemos juntas.",
    ],
    acciones: [
      "Relee tus notas de las semanas 1 a 3 y cuenta cuántos días cumpliste de 21.",
      "Escribe cuál es el paso que más se te cae y una solución logística concreta para él.",
      "Relee tu diagnóstico y marca qué sigue vigente y qué ya cambió.",
      "Escribe 3 líneas de cómo sientes tu piel hoy y guárdalas para la semana 8.",
      "Anota la duda más grande que te quedó y tráela a la clase o escríbeme.",
    ],
    videoId: null,
  },
  {
    numero: 5,
    titulo: "Profundizacion",
    resumen: "Sumamos el paso que faltaba para tu segmento especifico.",
    leccion: [
      "Semana 5 y por fin sumamos. Con la base sostenida cuatro semanas, ahora sí tiene sentido agregar el paso que tu diagnóstico dejó pendiente: el serum de tu ritual o el paso de tratamiento que te corresponde. Va después de limpiar y antes de lo más denso, porque su textura es más ligera y necesita contacto directo con la piel. Si lo pones encima de la crema, queda flotando sobre una capa que no lo deja llegar. Y va uno solo, no dos ni tres, aunque tengas más productos esperando en el cajón.",
      "Introdúcelo despacio: los primeros días en días alternos, y de ahí en adelante a diario si tu piel lo recibió bien. La razón es la misma regla de la semana pasada, un cambio a la vez, pero también es prudencia: si algo no te va a caer bien, prefiero que te enteres con tres aplicaciones y no con catorce. Anota cada día que lo uses. Si aparece ardor sostenido o enrojecimiento que no baja, se suspende ese paso y me cuentas; el resto del ritual sigue igual.",
      "Y ahora la parte que casi nadie quiere oír, pero que se nota más que cualquier producto: el sueño y el estrés. Mientras duermes, tu cuerpo está haciendo su trabajo de reparación y el riego de sangre hacia la piel cambia; dormir mal de forma sostenida se ve en cara cansada y piel más apagada. El estrés crónico, por su lado, mantiene el cortisol arriba, y el cortisol influye en cuánto sebo produces y en qué tan reactiva está tu piel. No es misticismo, es fisiología básica, y ningún ritual compensa dormir cuatro horas durante semanas.",
      "No te voy a pedir que duermas ocho horas por arte de magia, porque sé cómo es la vida real. Te pido algo más chiquito: que la hora de acostarte sea una decisión y no un accidente, cinco de los siete días. Eso solo ya mueve cosas. Todo esto lo desarmamos con calma en el coaching grupal, por si te queda con ganas de más.",
    ],
    acciones: [
      "Suma un solo paso nuevo, en días alternos la primera mitad de la semana.",
      "Aplícalo después de limpiar y antes de tu crema, nunca encima de ella.",
      "Fija una hora de acostarte y cúmplela al menos 5 de los 7 días.",
      "Apaga las pantallas 20 minutos antes de esa hora.",
      "Agrega a tu nota diaria cómo dormiste, junto a cómo sentiste la piel.",
    ],
    videoId: null,
  },
  {
    numero: 6,
    titulo: "Sostenimiento",
    resumen: "Mantener lo logrado, sin retroceder por descuido.",
    leccion: [
      "Semana 6. A esta altura el riesgo ya no es aburrirte del ritual, es la vida: un viaje, una mudanza, una semana de trabajo imposible, una gripa, visita en la casa. Ahí es donde el ritual se cae, y ahí es donde se decide de verdad si vuelve o no. Por eso esta semana no vamos a sumar nada, vamos a blindar lo que ya tienes.",
      "Tu herramienta principal es el ritual mínimo que escribiste en la semana 2, y quiero que lo tomes en serio: limpiar en la noche y protector en la mañana. No es el ideal, es el piso, y tener un piso definido por escrito es lo que evita el pensamiento que más daño hace, ese de \"si no puedo hacerlo completo, entonces no hago nada\". Dos pasos sostenidos en una semana caótica valen muchísimo más que un ritual completo que reapareció quince días después.",
      "Lo segundo es el descuido más común y el más fácil de evitar: quedarte sin producto. Se te acaba el protector solar un miércoles, decides que lo compras el sábado en el mercado, y de un momento a otro llevas cinco días sin usarlo y sin darte cuenta. Revisa hoy cuánto te queda de cada cosa y calcula la fecha aproximada en que se acaba. Si viajas, arma un kit pequeño con lo esencial y déjalo listo desde antes, no la noche anterior a las once, que es cuando uno olvida justo lo que más usa.",
      "Y si esta semana ya venía difícil, no la pelees: cumple el mínimo, márcalo igual como cumplido y sigue. Sostener no es hacerlo perfecto, es no soltar. Los planes B para semanas difíciles los armamos entre todas en el coaching grupal, si te sirve la idea.",
    ],
    acciones: [
      "Ten tu ritual mínimo de 2 pasos escrito y visible, no solo en la cabeza.",
      "Arma un kit de viaje con lo esencial y déjalo listo desde ya.",
      "Revisa cuánto producto te queda y anota la fecha estimada en que se acaba.",
      "Cumple los 7 días, aunque en algunos solo alcances el mínimo.",
      "Marca como cumplido también los días de ritual mínimo: cuentan igual.",
    ],
    videoId: null,
  },
  {
    numero: 7,
    titulo: "Afinacion",
    resumen: "Ultimos ajustes antes del cierre del programa.",
    leccion: [
      "Semana 7, la de afinar. Con seis semanas de notas tienes algo que ninguna recomendación general de internet te puede dar: datos de tu piel, escritos por ti, en tu clima, con tu rutina. Eso vale más que cualquier lista de \"los 10 pasos que toda mujer necesita\". Así que abre las notas y busca lo que se repite, no lo que pasó un día suelto.",
      "Hay tres cosas que quiero que revises. Primera: los pasos que nunca sentiste que aportaran nada. Segunda: las sensaciones que aparecen una y otra vez, porque un patrón que se repite seis semanas es información real. Tercera, y esta es la que más se ignora, la textura: si una crema se te hace pesada o un producto te deja incómoda, lo vas a abandonar tarde o temprano, por bueno que sea. El ritual que sí usas siempre le gana al ritual perfecto que no usas. Antes de descartar algo, prueba bajando la cantidad; muchas veces el problema no era el producto sino que te estabas echando el triple.",
      "También quiero que sepas esto: un ritual no es fijo para toda la vida. Cambia con el clima, con la ciudad, con estar todo el día en aire acondicionado, con las temporadas de lluvia. Lo que en enero te funcionaba puede quedarse corto en otro momento del año, y no significa que hiciste algo mal, significa que tu piel está pidiendo otra cosa. Ajustar no es empezar de cero, es leer bien.",
      "Ahora, ajusta una sola cosa esta semana, no cinco. Y después dale tiempo antes de juzgarla: entre tres y cuatro semanas es lo razonable para saber si un cambio te sirvió, porque la piel no responde en dos días. Estas decisiones son las que más preguntas levantan en las clases en vivo del coaching grupal, por si quieres traer la tuya.",
    ],
    acciones: [
      "Relee las 6 semanas de notas y subraya todo lo que se repite.",
      "Elige un solo ajuste para esta semana y anótalo con fecha.",
      "Si algo se siente pesado o incómodo, baja la cantidad antes de descartarlo.",
      "Escribe la versión final de tu ritual, en orden, mañana y noche.",
      "Lleva a la clase (o escríbeme) la duda que te quedó de esta revisión.",
    ],
    videoId: null,
  },
  {
    numero: 8,
    titulo: "Nuevo habito",
    resumen: "Tu ritual queda instalado como parte de tu rutina diaria.",
    leccion: [
      "Ocho semanas. Y lo que más cambió no está en la cara: está en que ya no tienes que decidir cada noche si lo haces o no. Eso es un hábito instalado, y es lo más difícil de conseguir de todo este plan. La señal de que quedó: lo haces sin recordatorio cinco o seis días de siete, y cuando te lo saltas lo notas.",
      "Saca las tres líneas que escribiste en la semana 4 y léelas al lado de cómo sientes tu piel hoy. No busques un antes y un después de foto, busca lo concreto: qué palabras usabas entonces y cuáles usas ahora, si la tirantez sigue apareciendo, si dejaste de pensar en tu piel a media tarde. Ahí está tu avance real, y es tuyo, medido con tus propias notas.",
      "De aquí en adelante te cambio el ritmo: revisión cada tres meses, no cada semana. Un ritual que ya funciona se toca poco, y estar cambiando cosas cada rato es la mejor forma de no saber nunca qué te sirve. Pon la revisión en el calendario ahora mismo, con tres preguntas: ¿lo sigo cumpliendo?, ¿cambió algo en mi piel o en mi clima?, ¿me queda producto? Y una cosa importante que quiero decirte de frente: si aparece algo que cambia de forma, de color o de tamaño, algo que no cede, o cualquier duda que se sienta médica, eso es de dermatólogo. No es terreno de un ritual ni mío, y llegar a tiempo con el profesional correcto es parte de cuidarse bien.",
      "Gracias por sostener estas ocho semanas. Cada piel responde distinto y a su ritmo, así que lo que sigue es simple: mantener lo que armaste y ajustarlo cuando la vida cambie. Y si quieres seguir acompañada después del plan, el coaching grupal sigue ahí, sin apuro y cuando tú digas.",
    ],
    acciones: [
      "Compara tus 3 líneas de la semana 4 con cómo sientes tu piel hoy.",
      "Escribe tu ritual definitivo y déjalo visible donde lo haces.",
      "Agenda una revisión dentro de 3 meses en el calendario del celular.",
      "Revisa tu stock y anota cuándo tienes que reponer cada producto.",
      "Escríbeme para contarme cómo te fue en estas 8 semanas.",
    ],
    videoId: null,
  },
];
const PLAN_ENERGIA: SemanaPlanContenido[] = [
  {
    numero: 1,
    titulo: "Fundamentos",
    resumen: "Fijas tu hora de dormir y entiendes por qué la regularidad manda sobre las horas.",
    leccion: [
      "Hola, soy Milito. Arrancamos por donde de verdad empieza tu energía del día: la noche anterior. Antes de hablar de moverte, de agua o de estrés, vamos a acomodar una sola cosa, la hora a la que te acuestas y la hora a la que te levantas. Es lo más aburrido de todo el plan y también lo que más sostiene lo demás. Si esta semana solo logras esto, ya hiciste la parte pesada.",
      "Te explico por qué insisto con el horario y no con las horas. Tu cuerpo funciona por costumbre: aprende a qué hora tiene que apagarse y a qué hora tiene que encenderse, y lo aprende repitiendo. Si un día te acuestas a las diez, otro a la una y el sábado a las tres, nunca termina de aprenderlo, y ahí aparece esa sensación de amanecer molida aunque hayas dormido harto. Siete horas todos los días a la misma hora suelen rendir más que nueve un día y cinco al otro.",
      "Cómo se hace sin volverlo un problema: elige una hora realista, no la que te gustaría tener. Si hoy te acuestas a la una, no pongas las diez, pon las doce y media. Fija también la hora de levantarte, y ojo con el fin de semana, que es donde se desarma todo: máximo una hora de diferencia con tus días normales. Y date treinta minutos de bajada antes de acostarte, con menos pantalla y menos luz, para que el cuerpo alcance a entender que ya es hora.",
      "Una aclaración que hago siempre: tu ritual de bienestar acompaña esta rutina, es una parte más de tu día. Lo que estás construyendo acá son hábitos, y el horario es el primero de todos. En las clases en vivo del grupo arrancamos justo por acá, así que si te queda alguna duda con tu horario, ahí la resolvemos con calma.",
    ],
    acciones: [
      "Elige una hora fija para acostarte y otra para levantarte, y anótalas donde las veas todos los días.",
      "Cúmplelas al menos 5 de los 7 días, incluido un día del fin de semana.",
      "Apaga pantallas 30 minutos antes de tu hora de dormir.",
      "Cada mañana escribe una sola línea: cómo amaneciste, del 1 al 5. Esas notas las vamos a necesitar después.",
    ],
    videoId: null,
  },
  {
    numero: 2,
    titulo: "Constancia",
    resumen: "Le sumas movimiento corto y repartido, porque el cuerpo quieto es el que más cansa.",
    leccion: [
      "Segunda semana. El horario sigue, esa parte ya no se toca, y encima le sumamos movimiento. Y antes de que pienses \"no tengo energía para entrenar\", te tranquilizo: no vamos a entrenar. Vamos a movernos, que es otra cosa y pide mucho menos de lo que crees.",
      "El cansancio de estar quieta no se paga durmiendo. Cuando pasas ocho o diez horas sentada, el cuerpo se agarrota, la circulación se vuelve perezosa y la cabeza se pone lenta, y eso se siente igualito que un cansancio de esfuerzo aunque no hayas hecho nada. Por eso te levantas del escritorio más agotada que después de una caminata. Como entrenadora lo veo todos los días: quien menos se mueve suele ser quien más cansada llega.",
      "La clave está en repartir, no en acumular. Cinco caminatas de diez minutos en la semana le rinden más a tu día que una hora heroica el domingo, porque la corta sí la haces y la heroica la terminas cancelando. Para que no se te olvide, pégala a algo que ya haces sin pensar: apenas termines de almorzar, apenas cuelgues la última llamada, apenas dejes a los niños. El hábito nuevo se agarra mejor cuando se monta encima de uno viejo.",
      "Súmale las pausas durante la jornada. Cada hora y media de estar sentada, párate dos minutos, camina hasta la cocina, estira lo que tengas tieso. Dos minutos, ni uno más, ahí no hay excusa de tiempo que valga. Esto mismo lo trabajamos en las clases en vivo, y da gusto ver cómo cada una termina encontrando su propio momento del día.",
    ],
    acciones: [
      "Mantén el horario de la semana 1 al menos 5 días. Esa base no se negocia.",
      "Camina 10 minutos diarios, siempre a la misma hora y pegados a algo que ya haces.",
      "Pon una alarma cada hora y media de jornada sentada y párate 2 minutos.",
      "Sigue la nota diaria del 1 al 5 y agrégale si te moviste o no.",
    ],
    videoId: null,
  },
  {
    numero: 3,
    titulo: "Ajuste fino",
    resumen: "Entra la hidratación y afinamos lo que ya traes, de a quince minutos.",
    leccion: [
      "Semana tres. Ya tienes horario y movimiento andando, así que entra el tercero: el agua. Es el hábito que más gente subestima y el que más rápido se siente cuando falta.",
      "El cuerpo avisa que le falta agua bastante antes de que te dé sed fuerte. Boca seca, dolor de cabeza al final de la tarde, la orina más oscura de lo normal, esa sensación de estar lenta para pensar. La sed es de las últimas señales en llegar, no la primera, así que esperar a tener sed para tomar agua es ir siempre un paso atrás. Y una advertencia honesta: si ves algo que te preocupa de verdad, eso lo mira un médico. Yo te acompaño con hábitos, no diagnostico nada.",
      "No te voy a dar un número mágico de litros, porque depende de tu clima, de tu tamaño y de cuánto te mueves. Te doy algo más útil: botella a la vista, siempre. Lo que no ves, no te lo tomas. Y ancla vasos a momentos que ya son fijos, uno apenas te levantas, uno con cada comida, uno cuando llegas a la casa. Así no tienes que acordarte de nada, solo seguir tu día normal.",
      "Como esta es la semana de afinar, revisa también lo que ya traes. Si te está costando dormirte a la hora que fijaste, muévela quince minutos, no una hora: los ajustes grandes se caen, los de quince minutos se sostienen. Y si tu caminata cae justo cuando ya estás muerta, cámbiala de hora y anota si algo cambia. En los encuentros del grupo revisamos estos ajustes caso por caso, por si quieres traer el tuyo.",
    ],
    acciones: [
      "Deja una botella llena a la vista en el lugar donde pasas más horas del día.",
      "Ancla un vaso de agua a 3 momentos fijos: al levantarte, con el almuerzo y al llegar a casa.",
      "Si la hora de dormir no te está funcionando, muévela solo 15 minutos y sostenla toda la semana.",
      "Cambia tu caminata al momento del día donde más se te cae la energía y anota qué pasó.",
      "Sigue con la nota diaria: cómo amaneciste, si te moviste, si tomaste agua.",
    ],
    videoId: null,
  },
  {
    numero: 4,
    titulo: "Primer chequeo",
    resumen: "Lees tus propias notas de las tres primeras semanas y ves qué movió de verdad.",
    leccion: [
      "Semana cuatro y esta vez no traigo nada nuevo. Esta semana miramos para atrás. Saca las notas que vienes escribiendo desde el primer día, esas de una sola línea, y vamos a leerlas juntas.",
      "La memoria es mala consejera con esto. Si ayer amaneciste mal, vas a jurar que no ha servido de nada; si hoy amaneciste bien, vas a jurar que ya está resuelto. Las dos cosas son el último día hablando, no las tres semanas completas. Por eso escribimos: el papel no se acuerda mal.",
      "Saca el promedio de cómo amaneciste en la semana 1 y compáralo con el de la semana 3. No busques un salto grande, busca la tendencia, para dónde va la línea. Después marca tus tres mejores días y mira qué tuvieron en común: a qué hora te acostaste la noche anterior, si te moviste, si tomaste agua. La respuesta casi siempre está ahí, escrita por ti misma.",
      "Y ahora la pregunta más útil de todas: ¿cuál de los tres hábitos se te cayó más veces? Ojo con la conclusión fácil de \"me falta disciplina\". Por lo general el que se cae es el que quedó mal puesto, a mala hora o en un lugar donde no lo ves. Ese es el que vas a arreglar esta semana, y no vas a agregar nada más encima. En el grupo hacemos este chequeo juntas y decirlo en voz alta ayuda harto, aunque si prefieres hacerlo sola te funciona igual.",
    ],
    acciones: [
      "Saca el promedio de tus notas de la semana 1 y el de la semana 3, y compáralos.",
      "Marca tus 3 mejores días y escribe qué tuvieron en común.",
      "Identifica cuál hábito se te cayó más veces y en qué momento o lugar se cayó.",
      "Arregla solo ese: hazlo más pequeño o cámbialo de hora. Esta semana no agregas nada nuevo.",
    ],
    videoId: null,
  },
  {
    numero: 5,
    titulo: "Profundizacion",
    resumen: "Le ponemos nombre al que más energía se lleva sin que lo veas: el estrés.",
    leccion: [
      "Semana cinco. Con las bases andando entramos al tema que más energía se lleva sin que lo notes, que es el estrés. Y no hablo del estrés de una crisis, hablo del de todos los días, el que va sumando bajito.",
      "Un día tenso no te cansa solo mientras pasa. El cuerpo se queda en alerta, con los hombros arriba y la mandíbula apretada, y esa alerta sigue prendida cuando ya te acostaste. Por eso hay noches en que duermes tus horas completas y amaneces como si no hubieras dormido nada. Hay algo más que se ve poco: decidir también cansa. Un día lleno de decisiones pequeñas te deja sin batería aunque no te hayas movido de la silla.",
      "La pausa que sirve tiene una condición, que sea de verdad. Cinco minutos de celular no son una pausa, es cambiar una pantalla por otra mientras tu cabeza sigue trabajando. Pausa real es levantarte, mirar lejos, respirar, salir un momento al aire. Con dos al día basta, y las agendas como si fueran una reunión, porque lo que no se agenda no pasa.",
      "Ponle también un final claro al día de trabajo: una hora y un gesto que la marque, cerrar el computador, cambiarte de ropa, lavarte la cara. El cuerpo entiende de señales, no de intenciones. Y antes de dormir, dos minutos de respiración lenta soltando el aire más despacio de lo que lo tomas. Las pausas son de los temas que más salen en las clases en vivo, así que si te sirve escuchar cómo lo resolvieron otras, ahí nos vemos.",
    ],
    acciones: [
      "Agenda 2 pausas reales de 5 minutos al día, sin celular ni pantalla.",
      "Define una hora de cierre de jornada y un gesto físico que la marque.",
      "Haz 2 minutos de respiración lenta antes de dormir, exhalando más largo que inhalando.",
      "Sostén juntos horario, movimiento y agua: ya son tres, y esta semana van completos.",
      "Agrega a tu nota diaria tu nivel de estrés del 1 al 5.",
    ],
    videoId: null,
  },
  {
    numero: 6,
    titulo: "Sostenimiento",
    resumen: "Aprendes a sostener la rutina el día que no te sale, con versiones mínimas.",
    leccion: [
      "Semana seis. Hasta aquí hablamos de cómo cumplir. Hoy toca lo otro, que es lo que de verdad decide si esta rutina dura: qué haces el día que no cumples.",
      "Va a haber un día de viaje, uno de trasnocho por trabajo, uno en que te enfermas o simplemente uno en que no quieres. Eso no es que fallaste, es que tienes vida. El problema nunca es el día perdido, es lo que viene detrás: la culpa, el \"ya lo dañé\", el volver a empezar el lunes. Los planes se abandonan ahí, no en el día malo.",
      "Por eso hoy vamos a escribir, con calma, la versión mínima de cada hábito. La caminata de diez minutos se vuelve dar tres vueltas a la casa. El horario se vuelve acostarse máximo una hora más tarde de lo fijado. El agua se vuelve un vaso apenas te levantas. La pausa se vuelve treinta segundos de pie mirando por la ventana. Son versiones ridículas a propósito, porque la gracia es que no se puedan fallar ni en el peor día.",
      "Y una sola regla para sostener todo esto: nunca dos días seguidos sin cumplir. Uno pasa y se olvida, dos ya es la costumbre nueva. Tu ritual de bienestar juega igual acá, como una parte de tu día que sigue ahí aunque la semana esté rara. En el grupo hablamos harto de esto porque a todas nos pasa, y te lo digo de una: nadie llega con la semana perfecta.",
    ],
    acciones: [
      "Escribe la versión mínima de cada uno de tus hábitos: sueño, movimiento, agua y pausas.",
      "Adopta la regla de no fallar dos días seguidos y anótala junto a tus notas.",
      "Decide desde ya qué haces el día que se te dañe la rutina, antes de que llegue.",
      "Usa la versión mínima al menos una vez esta semana, a propósito, para comprobar que funciona.",
    ],
    videoId: null,
  },
  {
    numero: 7,
    titulo: "Afinacion",
    resumen: "Acomodas tus tareas a tu curva real de energía en vez de pelear con ella.",
    leccion: [
      "Semana siete. Ya tienes los hábitos puestos, así que ahora los acomodamos a tu ritmo y no al de un plan genérico. Esta es la semana en que el plan deja de ser mío y pasa a ser tuyo.",
      "No todas rendimos a la misma hora. Hay gente que a las siete de la mañana está lúcida y a las cuatro de la tarde no es capaz de contestar un correo, y hay gente exactamente al revés. Eso no se elige ni se corrige a punta de fuerza de voluntad, pero sí se puede aprovechar. Vuelve a tus notas: ya llevas semanas de datos sobre a qué horas estás arriba y a qué horas estás abajo.",
      "Con ese mapa la idea es sencilla. Lo que exige cabeza va en tus horas altas; lo mecánico, lo repetitivo, las vueltas y los mandados van en las bajas. La mayoría hace justo lo contrario, deja lo difícil para el final del día y termina peleando contra su propio cuerpo a las seis de la tarde.",
      "Dos afinaciones más para cerrar la semana. La primera: sal a la luz del día dentro de la primera hora después de levantarte, aunque sean cinco minutos en la ventana o en el balcón. La luz de la mañana es de las señales más fuertes que tiene tu reloj interno para saber que el día arrancó. La segunda: si tu movimiento quedó muy pegado a la hora de dormir y te está costando bajar, adelántalo un par de horas y observa. Si quieres afinar esto con más detalle, en las sesiones grupales lo miramos con calma.",
    ],
    acciones: [
      "Marca en tus notas tus 3 horas más altas y tus 2 horas más bajas de la semana pasada.",
      "Reubica una tarea exigente a una de tus horas altas durante 5 días seguidos.",
      "Sal a la luz del día en la primera hora después de levantarte, aunque sean 5 minutos.",
      "Si tu movimiento está muy cerca de la hora de dormir, adelántalo y anota si cambia tu descanso.",
    ],
    videoId: null,
  },
  {
    numero: 8,
    titulo: "Nuevo habito",
    resumen: "Tu rutina queda puesta y con un plan para cuando la vida cambie.",
    leccion: [
      "Última semana. Quiero que veas dónde quedaste parada: horario fijo, movimiento repartido, agua a la vista, pausas de verdad y una versión mínima lista para los días difíciles. Eso ya dejó de ser un plan de ocho semanas y se volvió tu manera de organizar el día.",
      "La señal de que un hábito quedó puesto no es que te salga perfecto todos los días, es que dejaste de discutirlo contigo misma. Ya no te preguntas si vas a caminar hoy, caminas mientras piensas en otra cosa. Ese era todo el objetivo de estas ocho semanas: que la rutina te pese menos, no que la cumplas más.",
      "Para cerrar, escribe tu rutina completa en una sola tarjeta, máximo cinco líneas, y déjala donde la veas. Sirve más de lo que parece el día que amanezcas desanimada. Y agenda una revisión de tus notas una vez al mes: el mismo ejercicio de la semana cuatro, quince minutos, promedio y patrones. Con eso solo ya te mantienes en el camino sin necesitar otro reto.",
      "Una última cosa, porque va a pasar: cuando cambie tu vida, un trabajo nuevo, una mudanza, un viaje largo, no vas a tener que empezar de cero. Vas a reanclar, o sea, buscar a qué cosa nueva de tu día le pegas cada hábito. La rutina se muda contigo. Y si quieres seguir acompañada en esa etapa, en las clases en vivo seguimos, sin apuro y cuando te sirva.",
    ],
    acciones: [
      "Escribe tu rutina final en una tarjeta de máximo 5 líneas y déjala a la vista.",
      "Agenda en tu calendario una revisión de tus notas dentro de un mes.",
      "Elige un solo hábito para profundizar en los próximos 30 días, no cuatro.",
      "Guarda las notas de estas 8 semanas: son tu punto de partida para lo que sigue.",
    ],
    videoId: null,
  },
];
const PLAN_PESO: SemanaPlanContenido[] = [
  {
    numero: 1,
    titulo: "Fundamentos",
    resumen:
      "Ordenamos los horarios de tus comidas y sumamos movimiento diario, sin tocar todavía qué comés.",
    leccion: [
      "Hola, soy Milito. Arrancamos ocho semanas de trabajo sobre hábitos y quiero dejarte clara una cosa desde el primer día: acá no vamos a hacer dieta. No te voy a prohibir alimentos, no te voy a poner a contar nada y no te voy a pedir que aguantes hambre. Vamos a construir una estructura que puedas sostener cuando se acabe el entusiasmo del comienzo, porque se acaba siempre, y es justo ahí donde la mayoría abandona. Sea cual sea tu objetivo, el piso es el mismo: horarios, movimiento y descanso. Sobre esa base después se ajusta todo lo demás.",
      "Empezamos por los horarios porque es lo que más veo desordenado y lo que menos esfuerzo cuesta arreglar. Un día que arranca sin desayuno, sigue con un almuerzo a deshoras y termina con una comida enorme en la noche no es un problema de fuerza de voluntad: es un problema de estructura. Cuando comés a horas parecidas todos los días, el cuerpo aprende a pedirte comida en momentos previsibles y dejás de decidir con hambre encima. Y las decisiones que uno toma con hambre casi nunca son las que quería tomar. Esta semana no cambiamos el contenido del plato, solo el cuándo.",
      "Al mismo tiempo sumamos movimiento en su versión más simple: caminatas cortas, de diez o quince minutos, a la hora que te sirva. No busco rendimiento, busco frecuencia. Caminar todos los días vale más que una rutina intensa que dura cuatro días y se abandona. Y esto le sirve a cualquier meta: si tu objetivo es subir masa, la caminata no te resta nada y te ordena el día; si tu objetivo es definir, tampoco conviene arrancar por lo más exigente, porque el cuerpo necesita una base antes de que le pidamos más.",
      "Última tarea de la semana, y es la que más se subestima: anotá. Una libreta o las notas del celular alcanzan. A qué hora comiste, si te moviste, cómo te sentiste ese día. Esas notas las vamos a usar en la semana 4 para revisar tu proceso con datos tuyos y no con impresiones. Tu ritual, si lo tenés, acompaña estos hábitos: es el compañero de la rutina, no un reemplazo del trabajo que estás haciendo. Y si querés hacer esta primera semana acompañada, en el coaching grupal arrancamos justo por acá, sin afán.",
    ],
    acciones: [
      "Definí una hora fija para desayuno, almuerzo y cena, y escribilas donde las veas todos los días.",
      "Cumplí esos horarios al menos 5 de los 7 días de la semana.",
      "Sumá una caminata de 10 minutos diarios, a la hora que mejor te quede.",
      "Anotá cada día tus horarios de comida y cómo te sentiste, en una libreta o en el celular.",
    ],
    videoId: null,
  },
  {
    numero: 2,
    titulo: "Constancia",
    resumen:
      "Repetimos lo de la semana pasada sin buscar perfección: la constancia moderada le gana a la restricción corta.",
    leccion: [
      "Segunda semana y no vamos a agregar casi nada nuevo. Eso te puede parecer poco, pero es a propósito: la semana 2 es donde se decide si esto va a durar. Repetir algo que ya sabés hacer es mucho menos emocionante que empezar algo nuevo, y por eso mismo es la prueba real. Lo único que sube esta semana es la caminata, que pasa a veinte minutos.",
      "Te quiero explicar por qué insisto tanto con la constancia moderada en vez de un plan estricto. Un plan estricto funciona mientras la vida coopera, y la vida no coopera: hay reuniones, hay viajes, hay días en que se te fue la mañana. Cuando tu plan solo tiene dos estados, perfecto o roto, cualquier tropiezo lo manda al segundo. Ahí aparece el famoso 'ya lo dañé, arranco el lunes', y esa frase le ha costado a la gente más semanas perdidas que cualquier antojo. Un plan moderado que sostenés ocho semanas produce un cambio real; uno estricto que sostenés nueve días produce frustración y la sensación de que no servís para esto. Y sí servís, lo que no sirve es el plan.",
      "Entonces te propongo una regla que aplico con todas: nunca dos seguidas. Si un día te saltaste el horario, el movimiento o la comida que tenías pensada, no pasa nada; lo que no puede pasar es que el día siguiente sea igual. Un día flojo es ruido. Dos días flojos seguidos empiezan a ser el hábito nuevo. Y una aclaración importante: no te pido que compenses. Nada de saltarte comidas al otro día ni de castigarte con doble caminata. Retomás donde ibas y ya.",
      "Esta semana también quiero que le pongás nombre a tu obstáculo. No al genérico, al tuyo: la hora del almuerzo en el trabajo, el cansancio de las seis de la tarde, el fin de semana que descuadra todo. Anotalo, porque en la semana 4 vamos a revisar si el problema era el hábito o el horario en que lo pusiste. En el coaching grupal esta es la semana que más comentamos, así que si te sirve escuchar cómo la resuelven otras, ahí tenés la puerta abierta.",
    ],
    acciones: [
      "Sostené los mismos horarios de comida de la semana 1, apuntando a 6 de 7 días.",
      "Subí la caminata a 20 minutos diarios, o dividila en dos de 10 si te queda mejor.",
      "Aplicá la regla de nunca dos seguidas: si un día se cae, al siguiente retomás sin compensar nada.",
      "Escribí cuál es el momento del día o de la semana donde más se te descuadra la rutina.",
      "Seguí anotando cada día, aunque el día haya salido mal — sobre todo si salió mal.",
    ],
    videoId: null,
  },
  {
    numero: 3,
    titulo: "Ajuste fino",
    resumen:
      "Ahora sí tocamos el plato: porciones conscientes y comidas más completas, sin prohibir nada.",
    leccion: [
      "Llevás dos semanas con horarios y movimiento andando, así que ya tenemos sobre qué construir. Recién ahora entramos al plato, y en este orden porque cambiar la comida sin tener horarios estables es como pintar una pared que todavía se está moviendo. Y arranco repitiendo lo de siempre: no vamos a prohibir alimentos. Ningún alimento se elimina de tu vida en este plan.",
      "Lo que sí vamos a hacer es armar el plato con intención. La idea es simple: en cada comida principal debería haber una fuente de proteína, verduras o fruta, y un carbohidrato. Las tres cosas, no una sola. Cuando una comida es solo carbohidrato, te llena por un rato corto y a las dos horas volvés a la cocina; cuando tiene proteína y fibra, te sostiene hasta la comida siguiente y eso solo ya te ordena el resto del día. Acá es donde tu objetivo cambia un detalle: si tu meta es subir masa, sumá una comida completa más al día o hacé las porciones un poco más generosas en cada una; si tu meta es definir o bajar, mantené la estructura del plato y ajustá la porción del carbohidrato, sin sacarlo.",
      "El otro trabajo de esta semana es más incómodo que el del plato: comer despacio. Suena a consejo de abuela y es de las cosas que más diferencia hace. La señal de que ya comiste suficiente tarda un rato en llegar, y si terminaste el plato en siete minutos frente a la pantalla, esa señal te llega cuando ya te serviste otra vez. Sentate, dejá el celular a un lado, masticá. A mitad del plato hacé una pausa de treinta segundos y preguntate si todavía tenés hambre o si ya estás comiendo por inercia. No hay respuesta correcta; lo importante es que te la hagas.",
      "Nada de esto exige que peses la comida ni que lleves una cuenta. La porción consciente se entrena mirando el plato y prestando atención, no con una balanza. Las dudas de porciones son de las que más salen en los encuentros del coaching grupal, por si preferís resolverlas hablando en vez de leyendo.",
    ],
    acciones: [
      "Armá tus tres comidas principales con proteína, verdura o fruta, y carbohidrato.",
      "Comé sentada y sin pantalla al menos una comida al día.",
      "Hacé una pausa a mitad del plato y preguntate si seguís con hambre.",
      "Ajustá la porción según tu objetivo: una comida completa más si buscás masa, porción de carbohidrato más medida si buscás definir.",
      "Mantené los horarios y las caminatas de las semanas anteriores.",
    ],
    videoId: null,
  },
  {
    numero: 4,
    titulo: "Primer chequeo",
    resumen:
      "Revisamos juntas tus notas de las tres primeras semanas: qué cumpliste y cómo te sentiste, sin báscula de por medio.",
    leccion: [
      "Mitad de camino. Esta semana no sumamos nada: nos sentamos a revisar. Y te lo digo de una para que no te agarre desprevenida: la báscula no es la métrica de este chequeo. No porque esté prohibida, sino porque para lo que estamos midiendo hoy sirve poco. El número de un día cualquiera se mueve por agua, por sal, por el momento del ciclo, por lo que comiste anoche y por si fuiste al baño o no. Un dato que se mueve tanto por razones que no tienen que ver con tus hábitos no te sirve para decidir qué ajustar.",
      "Lo que sí sirve son tus notas. Sacalas y contá, literalmente. De los veintiún días que llevamos, ¿en cuántos cumpliste los horarios? ¿En cuántos te moviste? ¿Cuántos días armaste el plato completo desde que arrancamos la semana 3? No busques que dé perfecto: si te dio quince de veintiún días, eso es un proceso real y sostenido. Escribí los tres números, porque en la semana 8 los vamos a comparar.",
      "Después de los números vienen las sensaciones, que también las tenés anotadas. ¿Cómo llegás a la tarde comparado con hace tres semanas? ¿Estás picando entre comidas más o menos que antes? ¿La caminata te cuesta lo mismo que el primer día? ¿Dormís parecido? Esas respuestas te dicen más sobre tu proceso que cualquier número, porque son justamente las que cambian primero cuando los hábitos empiezan a acomodarse.",
      "Y ahora lo importante: el ajuste. Mirá el hábito que menos cumpliste y no lo cambies por otro, cambiale las condiciones. Si la caminata no salió, probablemente el problema es la hora en que la pusiste, no la caminata. Si el desayuno se saltó tres veces, quizá el horario que elegiste no le queda a tu mañana real. Un solo ajuste, el del hábito más flojo, y seguimos. Si tu chequeo te dejó con más preguntas que respuestas, en el coaching grupal lo revisamos juntas y vos decidís si te sumás.",
    ],
    acciones: [
      "Contá en tus notas cuántos días cumpliste horarios, movimiento y plato completo, y escribí los tres números.",
      "Anotá en dos o tres frases cómo te sentís hoy comparado con el día 1, usando lo que registraste.",
      "Identificá el hábito que menos cumpliste en estas tres semanas.",
      "Cambiale la hora o el lugar a ese hábito, en vez de reemplazarlo por otro.",
      "Guardá esta revisión: la vamos a comparar en la semana 8.",
    ],
    videoId: null,
  },
  {
    numero: 5,
    titulo: "Profundizacion",
    resumen:
      "Entramos a la fuerza básica, el trabajo que le sirve por igual a las tres metas.",
    leccion: [
      "Semana 5 y llegó el momento de la fuerza. Si tu meta era bajar de peso, quizá esperabas más cardio; si era tonificar, capaz esperabas esto desde el primer día. A las dos les digo lo mismo: el entrenamiento de fuerza es la pieza que le sirve a cualquier objetivo de composición corporal, y es la que más gente se salta.",
      "Te explico por qué. El músculo es tejido activo: sostenerlo y construirlo le da al cuerpo una estructura distinta, y esa estructura es la que hace que el trabajo se sostenga en el tiempo en vez de depender de moverte muchísimo todos los días. Si tu meta es subir masa, esto es evidente y es el corazón de tu plan. Si tu meta es definir, la fuerza es exactamente lo que le da forma a lo que ya tenés. Y si tu meta es bajar, la fuerza es lo que hace que ese proceso sea de composición y no solo de número. Tres metas distintas, la misma herramienta.",
      "Empezamos con el propio peso corporal, sin gimnasio y sin equipo. Sentadillas, flexiones apoyando las rodillas o contra la pared, puente de glúteo, plancha y remo con lo que tengas en casa. Dos sesiones a la semana, con un día de descanso entre una y otra, veinte o veinticinco minutos cada una. La técnica va primero que la cantidad: es mejor hacer ocho sentadillas bien hechas y controladas que veinte apuradas, siempre. Si algún movimiento te genera dolor, no lo empujes, se ajusta o se cambia por otro; molestia de esfuerzo y dolor no son lo mismo, y con la práctica vas a aprender a distinguirlos.",
      "La progresión también es parte del plan: la próxima semana no hacés lo mismo, hacés una repetición más por serie o aguantás un poco más la plancha. Poquito, pero hacia arriba. Y las caminatas no se van: quedan los días que no entrenás fuerza. En el coaching grupal mostramos estos movimientos paso a paso, por si querés ver la técnica antes de arrancar sola en casa.",
    ],
    acciones: [
      "Hacé 2 sesiones de fuerza con tu propio peso esta semana, con un día de descanso entre ellas.",
      "Armá cada sesión con 4 o 5 movimientos: sentadilla, empuje, puente de glúteo, plancha y remo.",
      "Priorizá la técnica: menos repeticiones bien hechas antes que muchas apuradas.",
      "Mantené las caminatas en los días que no entrenés fuerza.",
      "Anotá qué hiciste en cada sesión, para poder subir una repetición la semana que viene.",
    ],
    videoId: null,
  },
  {
    numero: 6,
    titulo: "Sostenimiento",
    resumen:
      "Sueño y estrés: lo que sostiene todo lo demás cuando la semana se te complica.",
    leccion: [
      "Semana 6, y vamos a hablar de lo que menos se trabaja y más peso tiene: el descanso. Podés tener los horarios impecables y las dos sesiones de fuerza hechas, que si estás durmiendo cinco horas y con la cabeza revuelta, todo el resto se vuelve cuesta arriba. No es falta de disciplina, es que le estás pidiendo al cuerpo que rinda sin darle con qué.",
      "Lo del sueño lo vas a reconocer apenas te lo diga. Cuando dormís poco, al día siguiente el hambre aparece más desordenada, más temprano y con más ganas de cosas rápidas y dulces. Y encima aparecen menos ganas de moverte, así que la caminata y el entrenamiento son los primeros en caerse. Una mala noche no arruina nada, pero varias seguidas te van desarmando en silencio los hábitos que te costó semanas armar. Por eso el descanso no es el premio por haber cumplido: es parte del trabajo.",
      "Esta semana entonces le ponés hora al sueño como se la pusiste a las comidas. Una hora fija para acostarte, cumplida al menos cinco días. Y media hora antes, bajás luces y soltás el celular, aunque sea a regañadientes las primeras noches. El estrés va por el mismo lado: cuando el día viene apretado, el pico de ansiedad se resuelve muy seguido en la cocina, y no porque tengas hambre. Antes de comer fuera de horario, probá una pausa de diez minutos: agua, salir a caminar una cuadra o respirar despacio un rato. Si a los diez minutos seguís con ganas, comés y ya está, no pasó nada. Muchas veces no vas a seguir con ganas.",
      "Y armá desde ya tu versión mínima del plan, la de las semanas feas: horarios de comida, una caminata corta y dormir a la hora. Nada más. Esa versión es la que evita que una semana difícil se convierta en un mes fuera de rutina. El sueño y el estrés son tema fijo en el coaching grupal, porque a casi todas nos aprieta por el mismo lado.",
    ],
    acciones: [
      "Fijá una hora para acostarte y cumplila al menos 5 noches de la semana.",
      "Apagá pantallas 30 minutos antes de esa hora.",
      "Usá la pausa de 10 minutos antes de comer fuera de horario cuando el impulso venga del estrés.",
      "Escribí tu versión mínima del plan para las semanas complicadas.",
      "Sostené las 2 sesiones de fuerza y sumá una repetición a lo que hiciste la semana pasada.",
    ],
    videoId: null,
  },
  {
    numero: 7,
    titulo: "Afinacion",
    resumen:
      "Aprendemos a manejar paseos, eventos y días fuera de rutina sin culpa y sin descarrilar.",
    leccion: [
      "Semana 7. A esta altura los hábitos ya están andando, así que vamos con lo que los rompe en la vida real: el paseo del domingo, el cumpleaños, la comida de la oficina, el día que simplemente te provocó. Ninguna de esas cosas va a desaparecer de tu vida, y un plan que solo funciona cuando no pasa nada no es un plan, es una pausa.",
      "Empecemos por lo de fondo: la comida no es buena ni mala, y vos no sos mejor ni peor persona por lo que comiste. Cuando le ponemos moral al plato, cada comida por fuera de la rutina viene con una factura de culpa, y la culpa casi nunca lleva a un buen lugar: lleva a compensar. A saltarse la comida siguiente, a castigarse con entrenamiento de más, o a lo contrario, a decir 'ya qué' y seguir de largo todo el fin de semana. El problema nunca fue el postre; fue lo que hiciste después del postre.",
      "Entonces trabajemos el después. Comiste algo por fuera de lo planeado: la comida siguiente es normal, en su horario, con su plato completo. No hay compensación, no hay ayuno de castigo, no hay doble sesión. Volvés a la línea y listo. Para los eventos, un par de cosas que funcionan sin que tengas que estar contando: no llegues con hambre acumulada, comé algo decente antes de salir; serví una vez y sentate a comer en vez de picar de pie durante horas; y tomá agua entre bebida y bebida. Con eso ya resolvés casi todo, sin que nadie en la mesa se dé cuenta de que estás cuidando algo.",
      "Cerramos con el hambre que no es hambre. Si te da a media tarde y en el fondo es aburrimiento, cansancio o ansiedad, aplicá la pausa que aprendimos la semana pasada. Y si vas a comer, comelo tranquila, sentada y disfrutándolo, no de pie y a escondidas: cuando uno come con culpa, come más y disfruta menos. Si la culpa después de comer es tu tema, en el coaching grupal se habla de eso con calma y sin juicio.",
    ],
    acciones: [
      "Elegí una comida de la semana para disfrutar sin plan y sin compensar después.",
      "Después de esa comida, retomá el horario siguiente como si nada hubiera pasado.",
      "Si tenés un evento, comé algo completo antes de salir y serví el plato una sola vez.",
      "Cuando aparezca el antojo por ansiedad, usá la pausa de 10 minutos antes de decidir.",
      "Sostené las 2 sesiones de fuerza y las caminatas de las semanas anteriores.",
    ],
    videoId: null,
  },
  {
    numero: 8,
    titulo: "Nuevo habito",
    resumen:
      "Armás tu propia versión sostenible del plan para seguir sin depender de que alguien te diga qué hacer.",
    leccion: [
      "Llegaste a la semana 8. Antes de cualquier otra cosa: sacá la revisión que hiciste en la semana 4 y volvé a contar, ahora con las ocho semanas completas. Días con horarios cumplidos, días con movimiento, sesiones de fuerza hechas, noches con hora de dormir respetada. Compará los números con los de la mitad del camino y leé lo que escribiste sobre cómo te sentías entonces. Ese contraste es tu resultado real, y es tuyo, no de un plan ni de un producto.",
      "Ahora el trabajo de esta semana, que es el más importante de todos: quedarte con lo que te sirve. De todo lo que hicimos, hay tres o cuatro cosas que en tu vida encajaron sin pelear y otras que te costaron cada día. Escribí cuáles fueron cuáles. Los hábitos que te encajaron son tu base permanente, esos no se negocian. Los que te costaron no significan que fallaste: significan que en esta etapa de tu vida esa versión no era la adecuada, y se ajustan. Un plan que sobrevive es un plan hecho a la medida de tu semana real, no de la semana ideal que ninguna de las dos tiene.",
      "Con eso armá tu plan propio en una hoja: tus horarios, tus días de fuerza, tus caminatas, tu hora de dormir. Al lado, la versión mínima que armaste en la semana 6, la de los meses complicados. Ese par de cosas escritas valen más que cualquier programa nuevo, porque las escribiste vos después de probarlas ocho semanas en tu vida y no en la de nadie más.",
      "Y para lo que viene, elegí un solo objetivo de progresión, no cinco. Si tu meta es subir masa, la progresión va por la fuerza y por sostener las comidas completas; si es definir, por mantener la constancia del entrenamiento; si es bajar, por sostener el orden que ya construiste. Uno solo, ocho semanas más. Ya sabés que sos capaz de sostener algo ocho semanas, porque acabás de hacerlo. Y si querés que el próximo ciclo sea con compañía, el coaching grupal está ahí, sin apuro y sin que sea obligatorio.",
    ],
    acciones: [
      "Compará tus números de la semana 8 con los que anotaste en la semana 4.",
      "Escribí los 3 hábitos que mejor encajaron en tu vida y los que más te costaron.",
      "Armá en una hoja tu plan propio: horarios, días de fuerza, caminatas y hora de dormir.",
      "Dejá escrita al lado tu versión mínima para las semanas difíciles.",
      "Elegí un solo objetivo de progresión para las próximas 8 semanas.",
    ],
    videoId: null,
  },
];

export const PLAN_POR_PUERTA: Record<PuertaReto, SemanaPlanContenido[]> = {
  piel: PLAN_PIEL,
  energia: PLAN_ENERGIA,
  peso: PLAN_PESO,
};

/** Semana `numero` (1-8) del plan de la puerta. `null` fuera de rango. */
export function obtenerSemanaPlan(
  puerta: PuertaReto,
  numero: number,
): SemanaPlanContenido | null {
  return PLAN_POR_PUERTA[puerta].find((s) => s.numero === numero) ?? null;
}

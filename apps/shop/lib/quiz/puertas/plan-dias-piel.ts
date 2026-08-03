import type { DiaPlanContenido } from "./plan-contenido";

/**
 * Contenido diario del plan de PIEL (Fase 22) — 56 dias (8 semanas x 7 dias)
 * que desarrollan en la practica cada leccion semanal de plan-contenido.ts,
 * sin repetirla. Voz Milito, cero promesa clinica, cero antes/despues, cero
 * urgencia fabricada.
 */
export const DIAS_PIEL: Record<number, DiaPlanContenido[]> = {
  1: [
    {
      dia: 1,
      titulo: "El orden antes que todo",
      contenido: [
        "Hoy arrancamos por lo más simple y también lo más importante: el orden. Tu ritual no es una lista de productos sueltos, es una secuencia — primero limpias, después lo más líquido, después lo más denso, y el protector solar siempre de último en la mañana. Con memorizar solo esa regla ya organizaste el ritual completo, tengas los productos que tengas hoy. No compliques nada más esta semana.",
      ],
      accion: "Escribe los pasos de tu ritual en orden, en una nota del celular, antes de aplicarte nada hoy.",
    },
    {
      dia: 2,
      titulo: "Por qué limpiar va primero",
      contenido: [
        "La limpieza abre el ritual por una razón simple: durante el día se te acumula sebo, sudor y residuo encima de la piel. Si pones hidratante sobre esa capa, se lo estás dando al residuo, no a tu piel. Por eso hoy, antes de aplicar cualquier otra cosa, dedica el minuto completo a limpiar bien, con calma, sin apurarte por llegar al siguiente paso.",
      ],
      accion: "Limpia mañana y noche con agua tibia, sin frotar, y sécate con toquecitos.",
    },
    {
      dia: 3,
      titulo: "Cómo limpiar sin pasarte",
      contenido: [
        "Limpiar bien no significa tallar ni dejar la piel chillando de limpia. Agua tibia, nunca caliente, movimientos suaves en círculo y secado con toquecitos de toalla, sin arrastrar. Si a los diez minutos de terminar sientes la cara tirante, esa limpieza fue más fuerte de lo que tu piel necesitaba hoy — anótalo, más adelante lo ajustamos con calma.",
      ],
      accion: "Cronometra tu limpieza de esta noche: no debería tomarte más de un minuto por lado.",
    },
    {
      dia: 4,
      titulo: "El protector va de último",
      contenido: [
        "El protector solar cierra tu ritual de la mañana, nunca va en el medio. Se queda arriba formando una película pareja, y si le pones algo encima la mueves, la diluyes y le abres huecos. Por eso es literalmente el último paso antes de salir de la casa, o antes de sentarte a trabajar, aunque no vayas a salir hoy.",
      ],
      accion: "Aplica tu protector solar de último paso esta mañana, después de todo lo demás.",
    },
    {
      dia: 5,
      titulo: "Nublado no es excusa",
      contenido: [
        "Un día nublado en casa no apaga la radiación: la luz sigue entrando por las ventanas. Este es el paso que más se salta la gente, y por eso te lo repito hoy — el protector solar va los siete días de la semana, estés donde estés, salgas o no salgas. No es un capricho, es el paso con menos discusión de todo el ritual.",
      ],
      accion: "Ponte protector solar hoy aunque no tengas planeado salir de la casa.",
    },
    {
      dia: 6,
      titulo: "Nada nuevo esta semana",
      contenido: [
        "Sé que la tentación existe: ver algo nuevo y querer sumarlo ya. Pero esta semana no cambiamos nada más, solo el orden, mañana y noche. Sumar productos ahora, sin haber sostenido siquiera el ritual base unos días, te va a dejar sin forma de saber qué te está cayendo bien y qué no. La paciencia de esta semana rinde después.",
      ],
      accion: "Si te dan ganas de comprar o probar algo nuevo hoy, anótalo para después y sigue con lo de siempre.",
    },
    {
      dia: 7,
      titulo: "Cierre: revisa tu semana",
      contenido: [
        "Siete días de orden cumplidos. Antes de pasar a la semana 2, relee las líneas que fuiste anotando cada día: ¿el orden ya te sale sin pensarlo, o todavía tienes que revisar la nota? No hay respuesta mala, solo información. Lo que armaste esta semana es la base sobre la que vamos a seguir trabajando.",
      ],
      accion: "Relee tus 7 notas de la semana y marca si el orden ya te quedó claro o si necesitas repasarlo.",
    },
  ],
  2: [
    {
      dia: 1,
      titulo: "Pega el hábito al cepillo",
      contenido: [
        "Ya sabes el orden, así que ahora el reto es acordarte de hacerlo un martes cansada a las once de la noche. Eso no se resuelve con fuerza de voluntad, se resuelve con logística: pega tu limpiador al lado del cepillo de dientes. Si te lavas los dientes todas las noches sin pensarlo, tu ritual se sube gratis a ese hábito.",
      ],
      accion: "Mueve tu limpiador hoy mismo y déjalo al lado del cepillo de dientes.",
    },
    {
      dia: 2,
      titulo: "Tu piel no toma vacaciones",
      contenido: [
        "Tu piel se renueva, produce sebo y se repara todos los días, no solo los días que le prestas atención. Por eso un domingo dedicándole una hora entera no compensa cinco días saltados, mientras que cinco minutos bien hechos todos los días sí construyen algo real. Prefiere siempre lo corto y sostenido antes que lo completo y ocasional.",
      ],
      accion: "Hoy no le agregues nada extra al ritual, solo cumple los pasos de siempre, sin falta.",
    },
    {
      dia: 3,
      titulo: "Tu ritual mínimo, hoy",
      contenido: [
        "Vamos a definir tu piso: dos pasos que puedas hacer con sueño, con gripa o llegando tarde. Limpiar en la noche y protector solar en la mañana. Ese es tu mínimo, y cumplir el mínimo también cuenta como cumplir. Tenerlo escrito de antemano te evita decidir a las once de la noche si vale la pena o no.",
      ],
      accion: "Escribe tu ritual mínimo de 2 pasos y guárdalo donde lo veas fácil.",
    },
    {
      dia: 4,
      titulo: "Una alarma que te avise",
      contenido: [
        "La memoria falla más de lo que creemos, sobre todo en la noche. Una alarma sencilla a la hora en que sueles hacer tu ritual quita la decisión de en medio: no tienes que acordarte, solo responder cuando suene. Es un truco pequeño, pero de los que más sostienen un hábito nuevo en sus primeras semanas.",
      ],
      accion: "Pon una alarma hoy a la hora en la que sueles hacer tu ritual de la noche.",
    },
    {
      dia: 5,
      titulo: "Si fallas un día, tranquila",
      contenido: [
        "Vas a fallar algún día, todas fallamos. Un martes te vas a quedar dormida antes de terminar, o vas a llegar tan tarde que solo alcances a lavarte la cara. Eso no rompe nada por sí solo. Lo que importa no es el día que se cae, es lo que decides hacer al día siguiente.",
      ],
      accion: "Si hoy no alcanzas el ritual completo, haz al menos tu mínimo de 2 pasos y ya.",
    },
    {
      dia: 6,
      titulo: "El día después no se compensa",
      contenido: [
        "Si ayer se te cayó el ritual, hoy no hay que compensar nada: nada de doblar pasos ni de castigarte. Simplemente retomas donde ibas, como si nada. La trampa más común es la culpa que lleva a pensar 'ya rompí la racha, arranco la próxima semana', y ahí sí se pierden semanas enteras, no por un día saltado.",
      ],
      accion: "Hoy retoma tu ritual normal, sin agregar nada de más por lo de ayer.",
    },
    {
      dia: 7,
      titulo: "Cierre: mira tu racha",
      contenido: [
        "Revisa cómo quedó marcada tu semana en la nota o el calendario. La meta no era la perfección, era no dejar ningún hueco de dos días seguidos. Si lo lograste, aunque algunos días solo fuera con el mínimo, ya tienes algo sólido sobre lo cual seguir construyendo la próxima semana.",
      ],
      accion: "Cuenta cuántos días de los 7 cumpliste, aunque haya sido con el ritual mínimo.",
    },
  ],
  3: [
    {
      dia: 1,
      titulo: "La cantidad justa de limpiador",
      contenido: [
        "Hay una idea muy metida que hace daño: que más producto rinde más. No es así. Tu piel toma hasta cierto punto y el resto se queda arriba, pegajoso, y te acaba el frasco antes de tiempo. La referencia es simple: tamaño de una arveja para el limpiador. Empieza por ahí y ajusta después según cómo te quede la piel.",
      ],
      accion: "Mide hoy tu limpiador del tamaño de una arveja, ni más ni menos.",
    },
    {
      dia: 2,
      titulo: "La cantidad justa de hidratante",
      contenido: [
        "Mismo principio con el hidratante: el tamaño de referencia es una avellana. Si sientes que tu crema tarda en absorberse o te deja sensación pesada, probablemente te estás echando de más. La piel no necesita una capa gruesa para hidratarse bien, necesita la cantidad correcta aplicada con calma.",
      ],
      accion: "Mide tu hidratante del tamaño de una avellana antes de aplicártelo hoy.",
    },
    {
      dia: 3,
      titulo: "Protector solar: dos dedos",
      contenido: [
        "El protector solar es la excepción a todo lo anterior: casi todas nos quedamos cortas. La medida guía son dos dedos, del índice y el medio, de largo completo, para cara y cuello. La primera vez que lo midas te va a parecer muchísimo — esa es justo la señal de que venías usando menos de lo que creías.",
      ],
      accion: "Aplica hoy tu protector solar con la medida de dos dedos, cara y cuello.",
    },
    {
      dia: 4,
      titulo: "Aprende a leer la tirantez",
      contenido: [
        "Tu piel te habla todo el tiempo, solo hay que aprender a escucharla. Tirantez a los diez minutos de lavarte puede significar que la limpieza fue agresiva para hoy, o que te falta hidratación después. No es una alarma, es una pista: anótala en tu nota diaria y sigue observando los próximos días.",
      ],
      accion: "Si sientes tirantez hoy, anota en tu nota a qué hora apareció y después de qué paso.",
    },
    {
      dia: 5,
      titulo: "El brillo no siempre es grasa",
      contenido: [
        "El brillo a media mañana no siempre significa exceso de grasa: a veces es la piel deshidratada compensando por su cuenta. Antes de sacar conclusiones, mira el patrón de varios días juntos, no uno solo. Esta semana se trata justamente de eso, de aprender a leer sin apurarte a decidir qué significa cada señal.",
      ],
      accion: "Anota hoy si tuviste brillo y a qué hora del día apareció.",
    },
    {
      dia: 6,
      titulo: "Si arde, se para y avisas",
      contenido: [
        "Hay una señal que no es para observar, es para actuar: ardor, escozor o rojo que no baja en un rato. Eso no es 'que está haciendo efecto', es una señal de parar ese paso y contarme tu caso puntual. Nada bueno se construye sobre una piel irritada, así que ante la duda, siempre se prioriza parar.",
      ],
      accion: "Si algún paso te arde o te deja roja, suspéndelo hoy mismo y escríbeme.",
    },
    {
      dia: 7,
      titulo: "Cierre: revisa tu cambio",
      contenido: [
        "Esta semana el objetivo era hacer un solo cambio y observarlo con calma, sin mezclar variables. Relee lo que anotaste: ¿qué cambiaste, y qué notaste después? Si no estás segura todavía, está bien, algunos ajustes necesitan más de una semana para mostrarse. Lo importante es que ya sabes observar tu piel con más detalle que al empezar.",
      ],
      accion: "Relee tus notas de la semana y escribe una línea con lo que aprendiste de tu piel.",
    },
  ],
  4: [
    {
      dia: 1,
      titulo: "Cuenta tus días cumplidos",
      contenido: [
        "Llegamos al primer chequeo, y empieza con un número simple: de los 21 días que llevas, ¿cuántos cumpliste tu ritual, completo o en su versión mínima? No busques que dé perfecto. Este número no es para juzgarte, es para saber de dónde partimos antes de seguir ajustando las próximas semanas.",
      ],
      accion: "Relee tus notas de las semanas 1 a 3 y cuenta cuántos días de 21 cumpliste.",
    },
    {
      dia: 2,
      titulo: "El paso que más se te cae",
      contenido: [
        "Cuando un paso se cae siempre, casi nunca es falta de disciplina, es un problema logístico. El producto quedó en otro baño, el paso es incómodo a esa hora, la textura no te convence. Identifica cuál es tu paso débil y piensa en la solución práctica, no en prometerte más fuerza de voluntad.",
      ],
      accion: "Escribe cuál es el paso que más se te cae y una solución logística concreta para él.",
    },
    {
      dia: 3,
      titulo: "Vuelve a tu diagnóstico",
      contenido: [
        "Saca tu diagnóstico original y léelo con ojos de tres semanas después. Marca qué sigue vigente tal cual y qué ya no te está pasando igual que al principio. La piel cambia con el tiempo y con el cuidado, así que este repaso te sirve para saber si el rumbo sigue siendo el correcto.",
      ],
      accion: "Relee tu diagnóstico y marca con un color lo que sigue vigente y con otro lo que ya cambió.",
    },
    {
      dia: 4,
      titulo: "Tres líneas para comparar después",
      contenido: [
        "Escribe hoy tres líneas de cómo sientes tu piel en este momento, no cómo se ve, cómo se siente. Las vamos a guardar para comparar en la semana 8. Si en algún momento quieres revisar tu chequeo acompañada, las clases en vivo del coaching grupal existen para eso, sin ninguna presión, solo si te sirve.",
      ],
      accion: "Escribe hoy tus 3 líneas de cómo sientes la piel y guárdalas en un lugar fijo.",
    },
    {
      dia: 5,
      titulo: "La sensación llega primero",
      contenido: [
        "Si todavía no notas nada distinto al mirarte al espejo, no significa que no esté pasando nada. Lo primero que suele notarse es la sensación, piel más cómoda, menos tirante después de lavar, antes que cualquier otra cosa. Cada piel responde a su propio ritmo, así que no compares tu semana 4 con la de nadie más.",
      ],
      accion: "Hoy presta atención solo a cómo se siente tu piel, no a cómo se ve.",
    },
    {
      dia: 6,
      titulo: "Anota tu duda más grande",
      contenido: [
        "Después de tres semanas seguro te quedó alguna pregunta rondando: sobre un producto, sobre una sensación, sobre si vas por buen camino. Escríbela hoy, tal cual la piensas, sin filtrarla. Tener la duda por escrito es el primer paso para resolverla, aunque sea la próxima semana.",
      ],
      accion: "Escribe la duda más grande que tienes sobre tu ritual en este momento.",
    },
    {
      dia: 7,
      titulo: "Cierre: mitad de camino",
      contenido: [
        "Llegaste a la mitad del plan. Revisa todo lo que trabajaste esta semana: tus días cumplidos, tu paso débil con su solución, tu diagnóstico repasado y tus tres líneas guardadas. No hace falta que todo esté resuelto, lo que importa es que ya tienes información real tuya para seguir ajustando.",
      ],
      accion: "Guarda en un solo lugar los 4 apuntes de esta semana: días cumplidos, paso débil, diagnóstico y tus 3 líneas.",
    },
  ],
  5: [
    {
      dia: 1,
      titulo: "Sumamos el paso pendiente",
      contenido: [
        "Con la base sostenida cuatro semanas, hoy sumamos el paso que tu diagnóstico dejó pendiente: el que te corresponde según tu segmento. Va después de limpiar y antes de lo más denso, porque su textura es más ligera y necesita contacto directo con la piel. Uno solo, aunque tengas más productos esperando.",
      ],
      accion: "Aplica hoy tu paso nuevo justo después de limpiar y antes de tu crema.",
    },
    {
      dia: 2,
      titulo: "Despacio, en días alternos",
      contenido: [
        "Este paso nuevo se introduce despacio: los primeros días en días alternos, no todos seguidos. No es solo prudencia con la piel, es la misma regla de siempre, un cambio a la vez, observado con calma. Si algo no te va a caer bien, prefiero que te enteres con tres aplicaciones y no con catorce.",
      ],
      accion: "Usa tu paso nuevo hoy solo si ayer no lo usaste, mantén el día de por medio.",
    },
    {
      dia: 3,
      titulo: "¿Lista para todos los días?",
      contenido: [
        "Revisa cómo te fue con el paso nuevo en días alternos: sin ardor, sin enrojecimiento que no baje, sin molestia sostenida. Si la piel lo recibió bien, esta es la señal para pasarlo a diario. Si todavía sientes algo raro, sigue en días alternos una semana más, no hay apuro.",
      ],
      accion: "Si tu piel respondió bien, usa hoy el paso nuevo aunque ayer también lo hayas usado.",
    },
    {
      dia: 4,
      titulo: "Fija tu hora de dormir",
      contenido: [
        "Mientras duermes, tu piel está haciendo su trabajo de reparación. Dormir mal de forma sostenida se nota en la cara, así que hoy fijamos algo que no tiene que ver con productos: una hora de acostarte, cumplida al menos cinco de siete días. Ningún ritual compensa dormir poco de forma constante.",
      ],
      accion: "Define tu hora de acostarte para esta semana y cúmplela hoy.",
    },
    {
      dia: 5,
      titulo: "Veinte minutos sin pantalla",
      contenido: [
        "Apaga las pantallas veinte minutos antes de tu hora de dormir. No es solo por la luz, es darle a tu cuerpo una señal clara de que el día está terminando, en vez de pasar de la pantalla brillante a la almohada de un salto. Es un cambio chiquito con más efecto del que parece.",
      ],
      accion: "Apaga el celular hoy 20 minutos antes de tu hora de dormir.",
    },
    {
      dia: 6,
      titulo: "Suma el sueño a tu nota",
      contenido: [
        "Desde hoy, agrega a tu nota diaria cómo dormiste, junto a cómo sentiste la piel. No hace falta un detalle largo, con una palabra o dos alcanza: bien, cortado, poco. Con el tiempo esos datos te van a mostrar si hay relación entre cómo descansas y cómo amanece tu piel.",
      ],
      accion: "Anota hoy en tu nota cómo dormiste anoche, además de cómo sientes la piel.",
    },
    {
      dia: 7,
      titulo: "Cierre: revisa el paso nuevo",
      contenido: [
        "Una semana con el paso nuevo sumado y con la hora de dormir en la mira. Relee tus notas: ¿cómo respondió la piel al producto nuevo? ¿Sostuviste la hora de acostarte al menos cinco días? Con esa información decides si sigues igual la próxima semana o si necesitas ajustar algo puntual.",
      ],
      accion: "Relee tu semana y anota una conclusión sobre cómo respondió tu piel al paso nuevo.",
    },
  ],
  6: [
    {
      dia: 1,
      titulo: "El riesgo ahora es la vida real",
      contenido: [
        "Ya no es el aburrimiento lo que amenaza tu ritual, es la vida real: un viaje, una semana de trabajo pesada, una gripa. Ahí es donde se decide de verdad si el hábito se sostiene. Esta semana no sumamos nada nuevo, vamos a blindar lo que ya construiste.",
      ],
      accion: "Piensa qué situación de tu semana podría hacer que se te caiga el ritual, y anticípala.",
    },
    {
      dia: 2,
      titulo: "Tu mínimo es tu herramienta",
      contenido: [
        "El ritual mínimo que armaste en la semana 2 es tu herramienta más importante ahora: limpiar en la noche y protector en la mañana. No es el ideal, es el piso, y dos pasos sostenidos en una semana caótica valen más que un ritual completo que abandonas quince días.",
      ],
      accion: "Ten tu ritual mínimo a mano hoy, por si el día se te complica.",
    },
    {
      dia: 3,
      titulo: "Revisa cuánto te queda",
      contenido: [
        "El descuido más común y más fácil de evitar es quedarte sin producto. Se te acaba el protector un miércoles, lo dejas para el fin de semana, y de un momento a otro llevas días sin usarlo sin darte cuenta. Hoy toca revisar y calcular con calma cuándo se te va a acabar cada cosa.",
      ],
      accion: "Revisa hoy cuánto producto te queda y anota la fecha aproximada en que se acaba.",
    },
    {
      dia: 4,
      titulo: "Arma tu kit de viaje",
      contenido: [
        "Si tienes un viaje o una salida larga cerca, arma el kit desde ya: los productos esenciales de tu ritual, en frascos pequeños o en su versión de viaje, listos en un solo lugar. Dejarlo para la noche anterior a las once es justo cuando uno olvida lo que más usa.",
      ],
      accion: "Arma hoy un kit pequeño con lo esencial de tu ritual, aunque no tengas viaje próximo.",
    },
    {
      dia: 5,
      titulo: "Si la semana viene difícil",
      contenido: [
        "Si esta semana viene pesada, no la pelees: cumple el mínimo y ya. Sostener no es hacerlo perfecto, es no soltar del todo. Un ritual mínimo cumplido siete días vale más que un ritual completo que solo aparece cuando tienes tiempo de sobra.",
      ],
      accion: "Si hoy no alcanzas el ritual completo, cumple solo el mínimo y márcalo igual.",
    },
    {
      dia: 6,
      titulo: "El mínimo también cuenta",
      contenido: [
        "Revisa cómo estás marcando tus días: si un día solo hiciste el mínimo, márcalo igual como cumplido, no como falla. Ver la racha completa, aunque tenga días de mínimo mezclados, es lo que sostiene la motivación mejor que perseguir la perfección todos los días.",
      ],
      accion: "Revisa tu marcador de la semana y asegúrate de contar los días de mínimo como cumplidos.",
    },
    {
      dia: 7,
      titulo: "Cierre: sin culpa, sin drama",
      contenido: [
        "Cierra la semana revisando cómo te fue, sin buscar culpables. ¿Hubo días de ritual completo y días de mínimo? Perfecto, eso es justamente lo que esta semana buscaba enseñarte: que sostener no significa ser perfecta, significa no soltar cuando la vida se complica.",
      ],
      accion: "Cuenta cuántos días cumpliste esta semana, sumando ritual completo y ritual mínimo.",
    },
  ],
  7: [
    {
      dia: 1,
      titulo: "Tus propias seis semanas de datos",
      contenido: [
        "Con seis semanas de notas tienes algo que ninguna lista genérica de internet te puede dar: datos reales de tu piel, escritos por ti. Hoy toca releer todo y subrayar lo que se repite una y otra vez, no lo que pasó un día suelto. Ese patrón repetido es la información que más vale.",
      ],
      accion: "Relee tus notas de las 6 semanas y subraya lo que se repite más seguido.",
    },
    {
      dia: 2,
      titulo: "Lo que no sentiste que aportara",
      contenido: [
        "Revisa si hay algún paso de tu ritual que nunca sentiste que hiciera diferencia. No hace falta descartarlo hoy mismo, solo identificarlo y anotarlo. Saber qué no te está aportando es tan valioso como saber qué sí, porque te ayuda a simplificar el ritual sin perder lo que funciona.",
      ],
      accion: "Escribe si hay algún paso que sientas que no te aporta nada.",
    },
    {
      dia: 3,
      titulo: "Las sensaciones que se repiten",
      contenido: [
        "Además de los pasos, revisa las sensaciones que aparecen una y otra vez en tus notas: comodidad, tirantez, brillo, lo que sea que se repita. Un patrón que se sostiene seis semanas es información real sobre tu piel, mucho más confiable que lo que sentiste un solo día.",
      ],
      accion: "Anota la sensación que más se repite en tus notas de las últimas 6 semanas.",
    },
    {
      dia: 4,
      titulo: "Si algo pesa, baja la cantidad",
      contenido: [
        "Si una crema se siente pesada o incómoda, tarde o temprano la vas a abandonar, por buena que sea. Antes de descartarla del todo, prueba bajando la cantidad, muchas veces el problema no es el producto, es que te lo estás aplicando de más. El ritual que sí usas siempre le gana al perfecto que dejaste de usar.",
      ],
      accion: "Si algún producto se siente pesado, aplica hoy la mitad de la cantidad que usas normalmente.",
    },
    {
      dia: 5,
      titulo: "Tu ritual cambia con el clima",
      contenido: [
        "Un ritual no es fijo para siempre. Cambia con el clima, con la temporada, con estar más tiempo en aire acondicionado o bajo el sol. Lo que en otro momento del año te funcionaba puede quedarse corto ahora, y eso no significa que hiciste algo mal, significa que tu piel está pidiendo otra cosa.",
      ],
      accion: "Piensa si algo del clima o la temporada cambió desde que empezaste, y anótalo.",
    },
    {
      dia: 6,
      titulo: "Un solo ajuste, con fecha",
      contenido: [
        "De todo lo que revisaste esta semana, elige un solo ajuste para hacer, no cinco a la vez. Anótalo con la fecha de hoy, porque vas a necesitar entre tres y cuatro semanas antes de poder juzgar si te sirvió, la piel no responde de un día para otro.",
      ],
      accion: "Elige un solo ajuste para tu ritual y anótalo con la fecha de hoy.",
    },
    {
      dia: 7,
      titulo: "Cierre: tu ritual casi final",
      contenido: [
        "Con todo lo que revisaste esta semana, escribe la versión del ritual que vas a sostener de ahora en adelante, en orden, mañana y noche. No tiene que ser perfecta ni definitiva para siempre, es la mejor versión que tienes hoy, con seis semanas de datos propios detrás.",
      ],
      accion: "Escribe tu ritual en orden, mañana y noche, con el ajuste que elegiste esta semana.",
    },
  ],
  8: [
    {
      dia: 1,
      titulo: "La señal de hábito instalado",
      contenido: [
        "La señal de que un hábito quedó instalado es hacerlo sin recordatorio, cinco o seis de los siete días de la semana. Ya no lo decides cada noche, simplemente lo haces mientras piensas en otra cosa. Revisa hoy si ya llegaste ahí con tu ritual, o si todavía necesitas la alarma o la nota.",
      ],
      accion: "Hoy intenta hacer tu ritual sin mirar la nota ni la alarma, y observa qué tanto lo recuerdas sola.",
    },
    {
      dia: 2,
      titulo: "Compara tus tres líneas",
      contenido: [
        "Saca las tres líneas que escribiste en la semana 4 sobre cómo sentías tu piel entonces. Léelas al lado de cómo la sientes hoy. No busques un cambio dramático, busca lo concreto: qué palabras usabas antes y cuáles usas ahora, si la tirantez sigue apareciendo igual o menos.",
      ],
      accion: "Busca tus 3 líneas de la semana 4 y compáralas con cómo sientes tu piel hoy.",
    },
    {
      dia: 3,
      titulo: "Lo concreto, no una foto",
      contenido: [
        "No busques un antes y un después de foto, eso no es lo que estamos midiendo en este plan. Busca lo concreto: si dejaste de pensar en tu piel a media tarde, si el ritual ya no te pesa, si la sensación cambió aunque lo visual no sea lo primero que notes. Ese avance es tuyo, medido con tus propias palabras.",
      ],
      accion: "Escribe hoy en una frase lo concreto que cambió, sin usar comparaciones de foto.",
    },
    {
      dia: 4,
      titulo: "De aquí en más, cada 3 meses",
      contenido: [
        "Un ritual que ya funciona se toca poco. De ahora en adelante, la revisión pasa a ser cada tres meses, no cada semana. Cambiar cosas todo el tiempo es la mejor forma de no saber nunca qué te está sirviendo de verdad. Agenda esa próxima revisión desde hoy.",
      ],
      accion: "Agenda en el calendario del celular una revisión de tu ritual dentro de 3 meses.",
    },
    {
      dia: 5,
      titulo: "Esto sí es de dermatólogo",
      contenido: [
        "Una cosa importante para cerrar: si en algún momento aparece algo que cambia de forma, de color o de tamaño, algo que no cede o cualquier duda que se sienta médica, eso es terreno de dermatólogo, no del ritual ni mío. Llegar a tiempo con el profesional correcto es parte de cuidarte bien.",
      ],
      accion: "Si tienes alguna duda médica pendiente sobre tu piel, agenda hoy la cita con tu dermatólogo.",
    },
    {
      dia: 6,
      titulo: "Revisa qué toca reponer",
      contenido: [
        "Antes de cerrar el plan, revisa tu stock una vez más: qué producto está por acabarse y cuándo tienes que reponerlo. Es el mismo cuidado logístico de la semana 6, ahora convertido en costumbre. Un ritual instalado también depende de que nunca te falte lo básico.",
      ],
      accion: "Revisa hoy tu stock y anota qué producto necesitas reponer primero.",
    },
    {
      dia: 7,
      titulo: "Cierre: gracias por sostenerlo",
      contenido: [
        "Ocho semanas sostenidas. Gracias por el trabajo silencioso de cada día. Escribe tu ritual definitivo y déjalo visible donde lo haces. Y si en algún momento quieres seguir acompañada, el coaching grupal sigue ahí, sin apuro y solo si te sirve. Por ahora, cuéntame cómo te fue.",
      ],
      accion: "Escríbeme para contarme cómo te fue en estas 8 semanas.",
    },
  ],
};

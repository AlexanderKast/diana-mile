import type { AnguloVenta } from "@diana-mile/shared/landing/angulo";

/**
 * Prompt de dirección de arte para las secciones-imagen de "Landing magica".
 *
 * El copy se le pasa al modelo ENTRE COMILLAS y con la orden de copiarlo
 * caracter por caracter: los modelos de imagen tienden a reescribir y a
 * quitar tildes, y aca la ortografia del espanol no es negociable. Todo lo
 * que no este entrecomillado esta prohibido — asi se evita que el modelo
 * invente sellos, cifras o contadores de urgencia (ver AGENTS.md).
 *
 * La imagen de referencia es INSPIRACION DE COMPOSICION, nunca de
 * contenido: una referencia que muestre un antes/despues o una resena con
 * estrellas no autoriza dibujar una.
 */

/**
 * Zonas del cuerpo que el angulo puede nombrar. Buscarlas por palabra clave
 * en vez de confiar en que el modelo las infiera del enfoque en prosa: un
 * angulo de "acne en el rostro" generando una espalda (visto en produccion)
 * es exactamente lo que esto existe para evitar. La zona detectada se le da
 * al modelo como un HECHO aparte, no enterrada en el contexto general.
 */
const ZONAS_CUERPO: Record<string, string[]> = {
  rostro: ["rostro", "cara", "facial", "mejilla", "frente", "menton", "mentón"],
  espalda: ["espalda"],
  axilas: ["axila", "axilas"],
  piernas: ["pierna", "piernas", "muslo", "muslos"],
  brazos: ["brazo", "brazos"],
  manos: ["mano", "manos"],
  pies: ["pie", "pies", "talon", "talón"],
  codos: ["codo", "codos"],
  rodillas: ["rodilla", "rodillas"],
  cuello: ["cuello", "escote"],
  abdomen: ["abdomen", "vientre", "barriga"],
  gluteos: ["gluteo", "glúteo", "gluteos", "glúteos"],
};

/**
 * Detecta la zona del cuerpo de la que habla el angulo, buscando en su
 * nombre y en los campos de estrategia (donde vive el lenguaje real de la
 * clienta). Null si el angulo no menciona ninguna zona concreta — la
 * mayoria de productos no la necesitan (ej. un shampoo, un suplemento).
 */
function detectarZonaCuerpo(angulo: AnguloVenta | null | undefined): string | null {
  if (!angulo) return null;
  const texto = [
    angulo.nombre,
    angulo.angulo_venta,
    angulo.problema,
    angulo.avatar,
    angulo.resultado_deseado,
  ]
    .filter((v): v is string => typeof v === "string")
    .join(" ")
    .toLowerCase();
  if (!texto.trim()) return null;

  for (const [zona, palabras] of Object.entries(ZONAS_CUERPO)) {
    if (palabras.some((p) => texto.includes(p))) return zona;
  }
  return null;
}

export type CopySeccion = {
  titular: string;
  subtitular?: string;
  bullets?: string[];
  cta?: string;
  precio_texto?: string;
  notas_visuales?: string;
};

/** Layout de respaldo cuando NO hay imagen de referencia para el tipo. */
const LAYOUTS: Record<string, string> = {
  hero: "titular en el 25% superior, el producto como protagonista al centro, CTA abajo.",
  oferta: "precio grande centrado, los packs alrededor con su ahorro, CTA abajo.",
  beneficios: "lista vertical de beneficios, cada uno con un icono simple a la izquierda.",
  comparativa: "tabla de dos columnas enfrentadas, encabezado arriba.",
  autoridad: "sello del fabricante arriba, cifras de respaldo y texto debajo.",
  uso: "3 pasos numerados apilados en vertical, uno por fila.",
  sensorial: "macro de la textura ocupando casi todo el cuadro, frase corta sobrepuesta.",
  testimonios: "tarjetas apiladas, cada una con la cita y quien la dijo debajo.",
  antes_despues: "dos fotos enfrentadas con una divisoria clara y su etiqueta.",
  logistica: "grilla de iconos (envio, pago, garantia) con una linea de texto cada uno.",
  faq: "lista de preguntas en negrita con su respuesta corta debajo.",
};

/**
 * Direccion de arte especifica por tipo. Es lo que separa una seccion
 * generica de una que vende: cada una tiene su trabajo emocional.
 */
const DIRECCION_TIPO: Record<string, string> = {
  hero:
    "Composición de gancho: el titular carga el mayor peso tipográfico de toda la landing y ocupa el tercio superior; el producto es el héroe óptico al centro, iluminado; el fondo sugiere el contexto de la clienta descrita. La emoción es el ALIVIO del problema, no el problema.",
  oferta:
    "Tabla de packs: 1, 2 y 3 unidades en tarjetas. La destacada es la de MAYOR cantidad, que es la de mejor precio por unidad; las otras dos quedan apagadas. Cada tarjeta dibuja tantas unidades reales del producto como dice su cantidad. Cada precio con su comparativo tachado SOLO si te lo dieron. Todas las cifras en pesos colombianos con separador de miles ($89.700). Prohibido calcular, redondear o inventar cifras.",
  beneficios:
    "Lista escaneable: 3 o 4 beneficios, cada uno con un ícono de línea fina propio y coherente con los demás. El texto manda sobre la decoración; el producto aparece pequeño y discreto.",
  comparativa:
    "Retícula de dos columnas enfrentadas: la propia destacada con acento dorado, la alternativa apagada en gris. Se compara el MODELO DE COMPRA (contraentrega, producto original, asesoría por WhatsApp, reposición), nunca resultados sobre el cuerpo.",
  autoridad:
    "Bloque institucional sobrio: sello o emblema del fabricante, cifras de trayectoria y respaldo. Transmite solidez, no emoción. El volumen y los años son del fabricante Nu Skin, jamás de la tienda.",
  uso:
    "Instructivo de 3 pasos: número grande en círculo, título corto y una línea de descripción; línea fina conectando los pasos. Debe leerse como algo fácil de hacer en la ducha o el baño.",
  sensorial:
    "Macro editorial de la textura del producto con luz natural suave, estilo revista de belleza. Frase corta sobrepuesta. Se describe la EXPERIENCIA (textura, aroma, ritual); prohibido sugerir transformación o resultado.",
  testimonios:
    "Tarjetas con las citas entregadas: cada una con el texto entre comillas tipográficas, y debajo el nombre y ciudad SOLO si te los dieron. Diseño limpio, sin estrellas de calificación inventadas ni capturas simuladas de chat.",
  antes_despues:
    "Composición de dos fotos enfrentadas con divisoria clara y etiquetas legibles. Usa TAL CUAL las fotos reales adjuntas: no las retoques, no exageres diferencias, no generes fotos nuevas de piel.",
  logistica:
    "Grilla de 3 o 4 tarjetas con íconos de línea: pago contraentrega, envío a todo el país, garantía de reposición, cobertura. Estética de confianza, iconografía consistente.",
  faq: "Lista serena de 4 preguntas: pregunta en negrita precedida de un signo, respuesta de una línea debajo, separadores finos. Mucho aire entre bloques.",
};

/** Que campos del angulo aportan contexto util a cada tipo de seccion. */
const CAMPOS_POR_TIPO: Record<string, (keyof AnguloVenta)[]> = {
  hero: ["problema", "avatar", "angulo_venta", "resultado_deseado"],
  oferta: ["angulo_venta"],
  beneficios: ["solucion_ideal", "mecanismo_unico", "resultado_deseado"],
  comparativa: ["mecanismo_unico", "solucion_ideal"],
  autoridad: ["detalles_producto", "mecanismo_unico"],
  uso: ["detalles_producto", "mecanismo_unico"],
  sensorial: ["detalles_producto", "avatar"],
  testimonios: ["avatar", "resultado_deseado"],
  antes_despues: ["detalles_producto"],
  logistica: ["pais_logistica", "pais_venta"],
  faq: ["problema", "avatar"],
};

const ETIQUETAS: Partial<Record<keyof AnguloVenta, string>> = {
  problema: "Problema que vive la clienta",
  avatar: "A quién le hablamos",
  angulo_venta: "Ángulo de venta",
  resultado_deseado: "Lo que la clienta desea lograr",
  solucion_ideal: "Por qué este producto es la solución",
  mecanismo_unico: "Mecanismo único",
  detalles_producto: "Detalles del producto",
  pais_logistica: "País de la logística",
  pais_venta: "País donde se vende",
};

/** Prohibiciones extra por tipo, encima de las globales. */
const PROHIBICIONES_TIPO: Record<string, string> = {
  oferta:
    "Sin porcentajes de descuento, cupones ni cifras que no estén entre comillas.",
  sensorial:
    "Prohibido sugerir resultado, transformación o comparación antes/después.",
  testimonios:
    "Prohibido inventar, alterar o completar una cita, un nombre o una ciudad: transcribe exactamente los textos entregados. Sin estrellas de calificación, sin capturas de chat simuladas. Si dibujas una persona es ilustración ambiental: nunca la presentes como la autora de la cita.",
  antes_despues:
    "Prohibido generar, retocar o simular un antes/después: usa únicamente las fotos reales adjuntas. No exageres diferencias ni agregues texto que prometa un resultado.",
  autoridad:
    "Las cifras de trayectoria y respaldo son del fabricante; no le atribuyas volumen ni años a la tienda.",
};

/**
 * Hechos VERIFICABLES del negocio, para los espacios sobrantes de la maqueta.
 *
 * Las maquetas de referencia son ricas: traen filas de iconos, pies de
 * confianza y badges que el copy de una seccion no alcanza a llenar. Borrar
 * esos bloques empobrece el diseno; dejarlos vacios hace que el modelo los
 * rellene con mentiras ("Formula dermatologicamente probada", "Resultados
 * visibles"). La salida es darle una lista blanca: si sobra espacio, se
 * llena con esto, que es cierto y esta verificado.
 *
 * Para agregar una linea aqui tiene que ser un hecho comprobable de la
 * operacion. Nada de beneficios del producto: eso va en el copy.
 */
const HECHOS_CONFIANZA = [
  "Pago contraentrega",
  // Decia "Envío 24-72 horas" y era falso fuera de Medellin: ver
  // `shared/logistica/despacho`. En un badge no cabe el matiz por ciudad,
  // asi que aqui no se promete plazo.
  "Envío a todo el país",
  "Producto original Nu Skin",
  "Asesoría por WhatsApp",
  "Cobertura nacional",
  "Si llega en mal estado, se repone",
];

/**
 * Una persona en la composicion se permite en CUALQUIER seccion: prohibirla
 * en oferta, comparativa o logistica solo hacia el diseno mas frio, y una
 * modelo generica no afirma nada por si sola. Lo que no cambia es que sea
 * generica — sin nombre, sin cita, sin estrellas —, porque eso si seria un
 * testimonio inventado.
 */
const PERMITE_PERSONAS = new Set([
  "hero",
  "sensorial",
  "uso",
  "beneficios",
  "testimonios",
  "antes_despues",
  "oferta",
  "comparativa",
  "autoridad",
  "logistica",
  "faq",
]);

export function construirPromptSeccion(args: {
  tipo: string;
  copy: CopySeccion;
  productoTitulo: string;
  /** Hay imagen de referencia adjunta (biblioteca o plantilla). */
  hayReferencia: boolean;
  angulo?: AnguloVenta | null;
  /** Cuántas fotos reales de clientas/fabricante se adjuntaron. */
  fotosReales?: number;
}): string {
  const { tipo, copy, productoTitulo, hayReferencia, angulo, fotosReales } = args;
  const bloques: string[] = [];

  // 1 · Rol
  bloques.push(
    `Eres director de arte senior de e-commerce premium. Diseña UNA sección publicitaria vertical de una landing de venta para el producto «${productoTitulo}».`,
  );

  // 1b · Zona del cuerpo (si el angulo la nombra) — HECHO aparte, no
  // enterrado en el contexto de abajo, y ANTES de las reglas de fidelidad
  // del producto para que no pierda contra ellas.
  const zonaCuerpo = detectarZonaCuerpo(angulo);
  if (zonaCuerpo) {
    bloques.push(
      `ZONA DEL CUERPO DE ESTA LANDING: ${zonaCuerpo.toUpperCase()}. Toda piel, escena o situación que dibujes en esta sección tiene que mostrar o hablar de ESA zona, nunca otra — aunque el uso habitual del producto sea en otra parte del cuerpo, la escena se ajusta al enfoque que se pidió, no al uso genérico. PROHIBIDO mostrar una zona distinta (si la zona es "${zonaCuerpo}", nunca dibujes otra).`,
    );
  }

  // 2 · Uso de la referencia
  // El producto gana a la maqueta: con la maqueta pesando tanto, el modelo
  // dibujaba una caja generica con el estilo de la referencia en vez del
  // empaque real. La fidelidad del envase no se negocia.
  const productoReal =
    "reprodúcelo IDÉNTICO (envase, etiqueta, colores del empaque, tipografía impresa, proporciones); no lo rediseñes, no lo estilices y no lo adaptes al estilo de la maqueta. Si la maqueta y la foto del producto se contradicen, MANDA LA FOTO DEL PRODUCTO.";
  if (hayReferencia) {
    // La referencia es el PLANO, no un humor. Decir solo "inspirate" hacia
    // que el modelo la mirara por encima y devolviera su layout de siempre;
    // hay que pedirle la retícula calcada y prohibirle unicamente el
    // contenido, que es lo que de verdad no se puede tomar prestado.
    bloques.push(
      [
        "La PRIMERA imagen adjunta es la MAQUETA que debes seguir. Analízala y REPLICA SU ESTRUCTURA con fidelidad:",
        "- El mismo número de bloques y el mismo orden de arriba abajo.",
        "- La misma retícula: cuántas columnas, dónde va la foto y dónde el texto, qué queda a la izquierda y qué a la derecha.",
        "- Las mismas proporciones: qué porcentaje del alto ocupa cada bloque, cuánto aire hay entre ellos, dónde están los márgenes.",
        "- La misma jerarquía tipográfica: qué texto es el más grande, cuál va en serif y cuál en sans, dónde hay una caja o un botón y de qué forma.",
        "- Los mismos recursos de composición: recortes, formas, divisorias, superposiciones, viñetas, badges — si la maqueta los tiene, van.",
        "Si al terminar tu diseño no se puede superponer sobre la maqueta y hacer coincidir los bloques, está mal hecho.",
        "",
        "Lo ÚNICO que cambia es el contenido: PROHIBIDO reproducir su marca, sus textos, sus fotos, sus personas, sus iconos o su paleta. Cada hueco de esa estructura se llena con este producto, esta paleta y el copy de abajo.",
        // Sin esta regla el modelo trata la maqueta como un formulario a
        // completar: si trae un badge de rating, se inventa "4.9/5 · 500
        // reseñas"; si trae una tarjeta de testimonio, redacta una cita y la
        // firma con un nombre. Visto en produccion las dos veces.
        "LA ESTRUCTURA SE COPIA, LOS DATOS NO SE INVENTAN. La maqueta manda sobre el layout, jamás sobre el contenido. Si un bloque de la maqueta pide un dato que no está en el copy de abajo — estrellas de calificación, número de reseñas, conteo de clientes, una cita firmada con un nombre, un porcentaje de resultados, un sello de garantía, un antes/después —, ese bloque NO se rellena: se ELIMINA y su espacio se reparte entre los bloques que sí tienen contenido. Un bloque vacío es correcto; un bloque inventado invalida toda la imagen.",
        `Las demás imágenes adjuntas son el PRODUCTO REAL: ${productoReal}`,
      ].join("\n"),
    );
  } else {
    const layout = LAYOUTS[tipo] ?? "composición vertical limpia con el producto al centro.";
    bloques.push(
      `Las imágenes adjuntas son el PRODUCTO REAL: ${productoReal}\nLayout de esta sección («${tipo}»): ${layout}`,
    );
  }

  if (fotosReales && fotosReales > 0) {
    bloques.push(
      `Las últimas ${fotosReales} imágenes adjuntas son FOTOS REALES (de clientas o material oficial del fabricante): úsalas TAL CUAL en la composición. No las regeneres, no las retoques, no las sustituyas por fotos inventadas.`,
    );
  }

  // 3 · Contexto del angulo (no es texto a dibujar)
  if (angulo) {
    const campos = CAMPOS_POR_TIPO[tipo] ?? [];
    // El enfoque va primero en el contexto: la imagen tiene que hablar del
    // angulo que se pidio, no del producto en abstracto.
    const enfoque = angulo.nombre?.trim()
      ? [`- Enfoque de esta landing: ${angulo.nombre.trim()}`]
      : [];
    const lineas = campos
      .map((campo) => {
        const valor = angulo[campo];
        if (typeof valor !== "string" || !valor.trim()) return null;
        return `- ${ETIQUETAS[campo] ?? campo}: ${valor.trim()}`;
      })
      .filter(Boolean);
    const contexto = [...enfoque, ...lineas];
    if (contexto.length > 0) {
      bloques.push(
        `CONTEXTO para decidir la imagen (NO es texto a dibujar):\n${contexto.join("\n")}`,
      );
      // Sin esto la escena sale generica (una mujer lavandose los hombros
      // en una landing sobre codos, por ejemplo): el texto habla del angulo
      // y la foto de otra cosa, y la seccion deja de vender.
      bloques.push(
        "La ESCENA debe mostrar la zona del cuerpo o la situación de la que habla el enfoque: si el enfoque es una zona concreta, encuádrala a ella (con tratamiento editorial y discreto, nunca sugerente), no una escena genérica de baño. Texto e imagen tienen que hablar de lo mismo.",
      );
    }
  }

  // 4 · Direccion especifica del tipo
  const direccion = DIRECCION_TIPO[tipo];
  if (direccion) bloques.push(`Dirección de esta sección: ${direccion}`);

  // 4b · Energia de respuesta directa
  //
  // Sin esto sale un editorial de revista: bonito, silencioso y que no
  // vende. La agresividad aqui es TIPOGRAFICA Y DE CONTRASTE, no de
  // contenido — las reglas de honestidad del bloque 8 no se tocan.
  bloques.push(
    [
      "ENERGÍA: esto es publicidad de respuesta directa, no un editorial de revista. Sube el volumen visual:",
      "- El titular ocupa de verdad su espacio: tipografía pesada y grande, que se lea de un vistazo con el celular a un brazo de distancia.",
      "- Contraste alto entre bloques: usa bloques de color plenos, fondos oscuros o de acento donde la maqueta los tenga, no todo crema sobre crema.",
      "- Palabras clave del titular resaltadas (peso, color de acento o subrayado), como en los anuncios que convierten.",
      "- El botón se ve como un BOTÓN: relleno sólido de color, bordes definidos, texto en alto contraste. Nunca un botón fantasma perdido en el fondo.",
      "- Cada bloque de texto tiene su soporte visual: tarjeta, píldora, ícono o fondo propio. Nada de texto suelto flotando.",
      "Alto impacto y alta legibilidad a la vez: sigue siendo premium, pero grita.",
    ].join("\n"),
  );

  // 5 · Paleta
  //
  // Los codigos hex son INSTRUCCION DE COLOR, no contenido: sin decirlo, el
  // modelo los dibuja como si fueran una etiqueta mas de la composicion.
  let paleta =
    "Paleta de la marca Milito (los códigos de color son instrucciones para ti, JAMÁS se escriben ni se dibujan dentro de la imagen): fondo crema #F2EDE6 o blanco cálido #FAFAF8, texto principal carbón #1A1714, acento dorado elegante #C4A882, acento secundario morado #6B4E8C. Titulares en serif editorial elegante; cuerpo en sans-serif limpia. Estética premium de skincare, luz suave, minimalista.";
  if (angulo?.color_predominante) {
    paleta += ` Acento adicional permitido: ${angulo.color_predominante}, subordinado a la paleta (tampoco se dibuja).`;
  }
  bloques.push(paleta);

  // 6 · Copy literal
  // Los textos van en lineas propias SIN comillas ni corchetes. Probado:
  // con «» el modelo dibuja las comillas dentro de la imagen, y sigue
  // haciendolo aunque el prompt le diga que no. La unica via fiable es no
  // darle ningun delimitador que pueda confundir con contenido.
  const textos: string[] = [
    "Renderiza EXACTAMENTE los textos de la lista de abajo, carácter por carácter, respetando tildes y eñes, sin traducir ni corregir. Cada línea es un texto; la etiqueta en mayúsculas dice qué papel cumple y NO se dibuja.",
    "",
    `TITULAR:`,
    copy.titular,
  ];
  if (copy.subtitular) textos.push("", "SUBTITULAR:", copy.subtitular);
  if (copy.bullets?.length) {
    textos.push("", "BULLETS (uno por línea):");
    for (const b of copy.bullets) textos.push(b);
  }
  if (copy.cta) textos.push("", "BOTÓN:", copy.cta);
  if (copy.precio_texto) textos.push("", "PRECIO:", copy.precio_texto);

  // LA LISTA ES CERRADA, y hay que decirlo contando.
  //
  // Prohibir por categorias no sirve: se le prohibieron estrellas y
  // testimonios, y en la siguiente pasada invento "Formula
  // dermatologicamente probada" y "Resultados visibles con el uso
  // constante" en unos iconos que la maqueta traia vacios. Mientras quede
  // un hueco de la maqueta sin llenar, el modelo lo llena. La unica regla
  // que cierra el agujero es una cuenta exacta y un repaso final.
  const totalTextos =
    1 +
    (copy.subtitular ? 1 : 0) +
    (copy.bullets?.length ?? 0) +
    (copy.cta ? 1 : 0) +
    (copy.precio_texto ? 1 : 0);
  textos.push(
    "",
    "SI LA MAQUETA TIENE MÁS ESPACIOS DE TEXTO QUE LOS DE ARRIBA (filas de íconos, pies de confianza, badges), no los borres: llénalos ÚNICAMENTE con frases de esta lista de hechos verificados, tal cual están escritas y sin repetir ninguna:",
    ...HECHOS_CONFIANZA.map((h) => `- ${h}`),
    "",
    `Fuera de los ${totalTextos} textos de arriba y de esa lista de hechos, NO existe ni un texto más. Prohibido redactar beneficios, propiedades, sellos o frases de relleno por tu cuenta, aunque suenen razonables y aunque la maqueta parezca pedirlos.`,
    "Antes de dar la imagen por terminada, lee cada texto que dibujaste y comprueba que está literalmente en una de las dos listas. El que no esté, se borra.",
  );
  bloques.push(textos.join("\n"));

  if (copy.notas_visuales) {
    bloques.push(`Notas visuales del director: ${copy.notas_visuales}`);
  }

  // 7 · Personajes
  if (PERMITE_PERSONAS.has(tipo) && angulo?.personajes) {
    const p = angulo.personajes;
    bloques.push(
      `Si la composición lleva una persona: ${p.sexo === "mixto" ? "hombre o mujer" : p.sexo}, ${p.nacionalidad}, entre ${p.edad_min} y ${p.edad_max} años, luz natural, apariencia real y cercana. Es un MODELO GENÉRICO: sin nombre, sin cita atribuida, sin estrellas de reseña.`,
    );
  } else {
    bloques.push("Sin rostros ni personas en esta sección.");
  }

  // 8 · Prohibiciones
  const prohibiciones = [
    "PROHIBIDO: dibujar cualquier texto que no esté en la lista de arriba. Nada de esta instrucción se dibuja: ni los códigos de color, ni las etiquetas en mayúsculas (TITULAR, BULLETS, BOTÓN, PRECIO), ni comillas de ningún tipo alrededor de los textos, ni el nombre del tipo de sección. Tampoco logotipos o marcas ajenas, marcas de agua, cifras, sellos o certificaciones no indicados, contadores de stock, cuentas regresivas ni urgencia inventada.",
    // Cada elemento de esta lista se dibujo de verdad en una prueba real.
    "PROHIBIDO EN PARTICULAR, aunque la maqueta los tenga: estrellas o puntuaciones de calificación, número de reseñas, conteos de clientes (\"más de 10.000 clientas\"), citas de testimonio con o sin nombre, sellos de \"garantía de satisfacción\" o de devolución del dinero, promesas de envío gratis o umbrales de compra, e ingredientes o propiedades que no estén escritos arriba. Nada de eso existe si no te lo entregaron en el copy.",
  ];
  if (PROHIBICIONES_TIPO[tipo]) prohibiciones.push(PROHIBICIONES_TIPO[tipo]);
  if (zonaCuerpo) {
    prohibiciones.push(
      `RECORDATORIO FINAL DE ZONA: esta sección es sobre "${zonaCuerpo}". Antes de terminar, revisa que cualquier piel, escena o situación dibujada muestre esa zona y ninguna otra.`,
    );
  }
  bloques.push(prohibiciones.join(" "));

  // 9 · Formato
  const proporcion = angulo?.proporcion ?? "9:16";
  bloques.push(
    `Salida: imagen publicitaria vertical ${proporcion}, fotorrealista con tipografía editorial nítida y legible, español de Colombia.`,
  );

  return bloques.join("\n\n");
}

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
    "Tabla de packs: 1, 2 y 3 unidades en tarjetas, la de mejor valor destacada. Cada precio con su comparativo tachado SOLO si te lo dieron entre comillas. Todas las cifras en pesos colombianos con separador de miles ($89.700). Prohibido calcular, redondear o inventar cifras.",
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
    "Grilla de 3 o 4 tarjetas con íconos de línea: pago contraentrega, envío 24-72h, garantía de reposición, cobertura. Estética de confianza, iconografía consistente.",
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

/** Tipos donde una persona en la composicion aporta y no afirma nada. */
const PERMITE_PERSONAS = new Set([
  "hero",
  "sensorial",
  "uso",
  "beneficios",
  "testimonios",
  "antes_despues",
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

  // 2 · Uso de la referencia
  const productoReal =
    "reprodúcelo IDÉNTICO (envase, etiqueta, tapa, proporciones, tipografía del empaque); no lo rediseñes ni lo estilices.";
  if (hayReferencia) {
    bloques.push(
      `La PRIMERA imagen adjunta es SOLO REFERENCIA DE ESTILO Y COMPOSICIÓN: inspírate en su estructura, jerarquía visual y ritmo, pero NO la copies — crea un diseño NUEVO adaptado a este producto, con la paleta de esta marca y el copy indicado abajo. Está PROHIBIDO reproducir su marca, sus textos, sus fotos, sus personas o su paleta. Si la referencia muestra contenido que aquí no aplica (un antes/después, una reseña con estrellas, cifras de resultados), IGNÓRALO: de ella se toma únicamente la retícula y la jerarquía.\nLas demás imágenes adjuntas son el PRODUCTO REAL: ${productoReal}`,
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
    }
  }

  // 4 · Direccion especifica del tipo
  const direccion = DIRECCION_TIPO[tipo];
  if (direccion) bloques.push(`Dirección de esta sección: ${direccion}`);

  // 5 · Paleta
  let paleta =
    "Paleta de la marca Milito: fondo crema #F2EDE6 o blanco cálido #FAFAF8, texto principal carbón #1A1714, acento dorado elegante #C4A882, acento secundario morado #6B4E8C. Titulares en serif editorial elegante; cuerpo en sans-serif limpia. Estética premium de skincare, luz suave, minimalista.";
  if (angulo?.color_predominante) {
    paleta += ` Acento adicional permitido: ${angulo.color_predominante}, subordinado a la paleta.`;
  }
  bloques.push(paleta);

  // 6 · Copy literal
  const textos: string[] = [
    "Renderiza EXACTAMENTE los siguientes textos, carácter por carácter, respetando tildes y eñes, sin traducir ni corregir:",
    `TITULAR: «${copy.titular}»`,
  ];
  if (copy.subtitular) textos.push(`SUBTITULAR: «${copy.subtitular}»`);
  if (copy.bullets?.length) {
    textos.push("BULLETS:");
    for (const b of copy.bullets) textos.push(`- «${b}»`);
  }
  if (copy.cta) textos.push(`CTA: «${copy.cta}»`);
  if (copy.precio_texto) textos.push(`PRECIO: «${copy.precio_texto}»`);
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
    "PROHIBIDO: agregar cualquier texto que no esté entre comillas arriba, logotipos o marcas ajenas, marcas de agua, cifras/sellos/certificaciones no indicados, contadores de stock, cuentas regresivas o cualquier urgencia inventada.",
  ];
  if (PROHIBICIONES_TIPO[tipo]) prohibiciones.push(PROHIBICIONES_TIPO[tipo]);
  bloques.push(prohibiciones.join(" "));

  // 9 · Formato
  const proporcion = angulo?.proporcion ?? "3:4";
  bloques.push(
    `Salida: imagen publicitaria vertical ${proporcion}, fotorrealista con tipografía editorial nítida y legible, español de Colombia.`,
  );

  return bloques.join("\n\n");
}

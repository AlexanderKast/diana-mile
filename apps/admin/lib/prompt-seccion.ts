/**
 * Prompt de dirección de arte para las secciones-imagen de "Landing magica".
 *
 * El copy se le pasa al modelo ENTRE COMILLAS y con la orden de copiarlo
 * caracter por caracter: los modelos de imagen tienden a reescribir y a
 * quitar tildes, y aca la ortografia del espanol no es negociable. Todo lo
 * que no este entrecomillado esta prohibido — asi se evita que el modelo
 * invente sellos, cifras o contadores de urgencia (ver AGENTS.md).
 */

/** Layout de respaldo cuando NO hay plantilla de referencia para el tipo. */
const LAYOUTS: Record<string, string> = {
  hero: "titular en el 25% superior, el producto como protagonista al centro, CTA abajo.",
  oferta: "precio grande centrado, los packs alrededor con su ahorro, CTA abajo.",
  beneficios: "lista vertical de beneficios, cada uno con un icono simple a la izquierda.",
  comparativa: "tabla de dos columnas enfrentadas, encabezado arriba.",
  autoridad: "sello o edificio del fabricante arriba, texto de respaldo debajo.",
  uso: "3 pasos numerados apilados en vertical, uno por fila.",
  sensorial: "macro de la textura ocupando casi todo el cuadro, frase corta sobrepuesta.",
  logistica: "grilla de iconos (envio, pago, garantia) con una linea de texto cada uno.",
  faq: "lista de preguntas en negrita con su respuesta corta debajo.",
};

export function construirPromptSeccion(args: {
  tipo: string;
  copy: {
    titular: string;
    subtitular?: string;
    bullets?: string[];
    cta?: string;
    precio_texto?: string;
    notas_visuales?: string;
  };
  productoTitulo: string;
  hayPlantilla: boolean;
}): string {
  const { tipo, copy, productoTitulo, hayPlantilla } = args;

  const bloques: string[] = [];

  bloques.push(
    `Eres director de arte senior de e-commerce premium. Diseña UNA sección publicitaria vertical (relación 3:4) de una landing de venta para el producto «${productoTitulo}».`,
  );

  const productoReal =
    "reprodúcelo IDÉNTICO (envase, etiqueta, tapa, proporciones, tipografía del empaque); no lo rediseñes ni lo estilices.";
  if (hayPlantilla) {
    bloques.push(
      `La PRIMERA imagen adjunta es la PLANTILLA de layout: copia su composición, jerarquía visual y zonas de texto; IGNORA por completo su marca, colores y textos. Las demás imágenes adjuntas son el PRODUCTO REAL: ${productoReal}`,
    );
  } else {
    const layout = LAYOUTS[tipo] ?? "composición vertical limpia con el producto al centro.";
    bloques.push(
      `Las imágenes adjuntas son el PRODUCTO REAL: ${productoReal}\nLayout de esta sección («${tipo}»): ${layout}`,
    );
  }

  bloques.push(
    "Paleta de la marca Milito: fondo crema #F2EDE6 o blanco cálido #FAFAF8, texto principal carbón #1A1714, acento dorado elegante #C4A882, acento secundario morado #6B4E8C. Titulares en serif editorial elegante; cuerpo en sans-serif limpia. Estética premium de skincare, luz suave, minimalista.",
  );

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

  bloques.push(
    "PROHIBIDO: agregar cualquier texto que no esté entre comillas arriba, logotipos o marcas ajenas, marcas de agua, rostros de personas, cifras/sellos/certificaciones no indicados, contadores de stock o urgencia.",
  );

  bloques.push(
    "Salida: imagen publicitaria vertical 3:4, fotorrealista con tipografía editorial nítida y legible, español de Colombia.",
  );

  return bloques.join("\n\n");
}

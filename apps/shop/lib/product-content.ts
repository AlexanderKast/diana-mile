import type {
  LandingBenefit,
  LandingComparison,
  LandingFaq,
  LandingFreeGuide,
  LandingIngredients,
  LandingIngredientStory,
  LandingSkinType,
  LandingStep,
  LandingTestimonial,
  LandingTimelineStage,
  LandingUGCPost,
  LandingWithoutRitual,
  Product,
  ProductLandingContent,
} from "@diana-mile/shared/types";

/**
 * Contenido de la landing ya RESUELTO: cada bloque tiene su valor final
 * (metafield del producto > preset Epoch si aplica > fallback neutral). Los
 * bloques que pueden ocultarse son `null`; la page decide si renderiza la
 * seccion segun eso. Un producto sin metafield sigue teniendo una landing
 * coherente, solo que mas sobria.
 */
export type ResolvedLanding = {
  eyebrow: string;
  tagline: string;
  benefitsHeading: string;
  benefits: LandingBenefit[];
  ingredientStory: LandingIngredientStory | null;
  ingredients: LandingIngredients | null;
  skinType: LandingSkinType | null;
  usageHeading: string;
  usageSteps: LandingStep[];
  withoutRitual: LandingWithoutRitual | null;
  resultsHeading: string;
  resultsTimeline: LandingTimelineStage[] | null;
  testimonialsHeading: string | null;
  testimonials: LandingTestimonial[];
  comparison: LandingComparison | null;
  faqs: LandingFaq[];
  ugcHeading: string;
  ugcSubheading: string;
  ugc: LandingUGCPost[] | null;
  freeGuide: LandingFreeGuide | null;
  closingHeading: string;
  authenticity: boolean;
};

export function isEpochProduct(product: Product): boolean {
  return /epoch|polishing bar/i.test(product.title);
}

/**
 * Filas de la tabla comparativa y experiencias/testimonios: hablan del
 * MODELO DE COMPRA (contraentrega, original, WhatsApp), no del producto, asi
 * que sirven igual para todos. Por eso son defaults compartidos.
 */
const COMPARISON_DEFAULT: LandingComparison = {
  title: "Por qué comprarle a Milito Life Shop",
  rows: [
    "Producto 100% original",
    "Pagas al recibir, revisas antes de pagar",
    "Envío a toda Colombia en 24-72h",
    "Atención real por WhatsApp",
    "Garantía de reposición si llega mal",
  ],
};

const TESTIMONIALS_DEFAULT: LandingTestimonial[] = [
  {
    title: "Compra sin anticipo",
    text: "El pago contraentrega ayuda a probar el producto sin transferencias previas ni tarjeta.",
  },
  {
    title: "Acompanamiento por WhatsApp",
    text: "Si tienes dudas sobre uso, entrega o disponibilidad, puedes confirmar antes de comprar.",
  },
  {
    title: "Rutina simple",
    text: "La recomendacion es mantener pocos pasos, constancia y elegir el pack segun frecuencia de uso.",
  },
];

/** FAQs logisticas: aplican a cualquier producto vendido contraentrega. */
const FAQS_LOGISTICA: LandingFaq[] = [
  {
    question: "¿Cómo funciona el pago contraentrega?",
    answer:
      "Recibes el producto en la puerta de tu casa y pagas en efectivo al mensajero. No necesitas tarjeta de crédito ni hacer transferencias por adelantado.",
  },
  {
    question: "¿Es un pedido real? ¿Cómo sé que va a llegar?",
    answer:
      "Apenas confirmas tu pedido te contactamos por WhatsApp para coordinar la entrega, así que tienes a alguien real respondiendo tus preguntas antes de pagar un peso. No pagas nada hasta tener el producto en tus manos.",
  },
  {
    question: "¿Cuánto demora el envío?",
    answer:
      "Entre 24 y 72 horas hábiles según tu ciudad. Ciudades principales (Bogotá, Medellín, Cali, Barranquilla) generalmente en 24-48 horas.",
  },
];

const FREE_GUIDE_DEFAULT: LandingFreeGuide = {
  title: "Guía de tu ritual Milito Life Shop",
  description: "Cómo sacarle el máximo a tu producto según tu tipo de piel.",
  sections: [
    {
      title: "Cómo empezar",
      body: "Integra el producto a tu rutina diaria de forma constante. La constancia es lo que produce resultados visibles.",
    },
    {
      title: "Cómo combinarlo",
      body: "Aplica en orden de textura más ligera a más densa y termina siempre con protector solar de día.",
    },
  ],
};

/**
 * Landing neutral y sobria para cualquier producto sin contenido propio.
 * NO inventa afirmaciones especificas (ingredientes, resultados por semana):
 * esas secciones quedan ocultas hasta que el metafield / la IA las llene.
 */
function neutralLanding(product: Product): ResolvedLanding {
  return {
    eyebrow: "Ritual Milito Life Shop",
    tagline:
      product.description || "Un ritual de cuidado elegido para tu piel.",
    benefitsHeading: "Lo que este producto hace por ti",
    benefits: [
      {
        icon: "gota",
        title: "Ritual facil de usar",
        description:
          "Integra este producto a tu rutina diaria sin pasos complicados.",
      },
      {
        icon: "sol",
        title: "Cuidado visible",
        description:
          "Pensado para acompañar una piel mas luminosa y con mejor textura.",
      },
      {
        icon: "escudo",
        title: "Compra contraentrega",
        description: "Pide desde Colombia y paga cuando recibas el producto.",
      },
    ],
    ingredientStory: null,
    ingredients: null,
    skinType: null,
    usageHeading: "Cómo usarlo",
    usageSteps: [
      {
        numero: "1",
        titulo: "Aplica",
        descripcion:
          "Usa el producto sobre la piel limpia siguiendo su indicación.",
      },
      {
        numero: "2",
        titulo: "Masajea",
        descripcion: "Distribuye con movimientos suaves hasta absorber.",
      },
      {
        numero: "3",
        titulo: "Constancia",
        descripcion:
          "Repite a diario. Los resultados llegan con el uso continuo.",
      },
    ],
    withoutRitual: null,
    resultsHeading: "Qué esperar",
    resultsTimeline: null,
    testimonialsHeading: null,
    testimonials: TESTIMONIALS_DEFAULT,
    comparison: COMPARISON_DEFAULT,
    faqs: FAQS_LOGISTICA,
    ugcHeading: "Así lo están usando",
    ugcSubheading: "Mujeres reales · Resultados reales",
    ugc: null,
    freeGuide: FREE_GUIDE_DEFAULT,
    closingHeading: "Tu piel te lo va a agradecer",
    authenticity: false,
  };
}

/**
 * Preset del Epoch® Polishing Bar: es el copy que ya estaba hardcodeado en
 * la landing. Se conserva intacto para que el producto estrella no cambie
 * mientras no tenga su propio metafield. Cuando el metafield exista, lo
 * sobreescribe.
 */
function epochLanding(product: Product): ResolvedLanding {
  return {
    ...neutralLanding(product),
    eyebrow: "Coleccion Epoch® · Nu Skin",
    tagline: "La piel que se ve bien de cerca — sin maquillaje encima.",
    benefitsHeading: "Lo que vas a dejar de esconder",
    benefits: [
      {
        icon: "gota",
        title: "Limpieza profunda sin jabon",
        description: "Sin jabon que reseque. Piel suave desde el primer uso.",
        ciencia:
          "El intercambio ionico entre los minerales de la arcilla y las impurezas de la piel es el mismo mecanismo que usan los tratamientos dermatologicos de limpieza.",
      },
      {
        icon: "mineral",
        title: "Mas de 50 minerales marinos",
        description:
          "Zinc, Cobre, Magnesio y Plata: cada uso nutre mientras limpia.",
        ciencia:
          "El Zinc regula el sebo, el Cobre estimula el colageno, el Magnesio reduce la inflamacion. Tres activos que cuestan miles en suplementos, en tu barra de limpieza diaria.",
      },
      {
        icon: "hoja",
        title: "Exfoliacion suave natural",
        description: "Polvo de corteza Tsuga Heterophylla exfolia sin irritar.",
        ciencia:
          "La exfoliacion fisica de particula fina remueve celulas muertas sin los microdesgarros que causan los exfoliantes de grano grueso.",
      },
      {
        icon: "sol",
        title: "Piel radiante desde el primer uso",
        description:
          "Textura visiblemente mas suave despues de la primera aplicacion.",
      },
      {
        icon: "escudo",
        title: "Probado dermatologicamente",
        description: "Seguro para piel sensible. Uso diario recomendado.",
      },
      {
        icon: "planeta",
        title: "Empaque 100% reciclado",
        description:
          "Caja de papel reciclado. Compromiso con la tierra y contigo.",
      },
    ],
    ingredientStory: {
      title: "El secreto que la naturaleza guardo por siglos",
      body: "La leyenda cuenta que los pueblos indigenas del Noroeste del Pacifico intentaron fabricar ceramica con la arcilla marina glacial de la Columbia Britanica y, al retirarla de sus manos, descubrieron algo inesperado: su piel quedaba extraordinariamente suave e hidratada. Ese descubrimiento ancestral es el corazon de cada Epoch® Polishing Bar.",
    },
    ingredients: {
      inci: "Sodium Cocoyl Isethionate, Stearic Acid, Aqua, Sodium Isethionate, Parfum, Sea Clay Extract, Sodium Chloride, Titanium Dioxide, Tsuga Heterophylla Bark Powder, Iron Oxides, Ascorbyl Palmitate, Tocopherol, Allantoin.",
      freeFrom:
        "Sin parabenos · Sin sulfatos · Sin jabón · Sin aceites minerales",
    },
    skinType: {
      question: "¿Cuál es tu tipo de piel?",
      options: [
        {
          id: "normal",
          label: "Piel normal/mixta",
          message:
            "Perfecto. El Epoch® controla brillos y refina poros sin resecar.",
        },
        {
          id: "grasa",
          label: "Piel grasa",
          message:
            "Ideal para ti. La arcilla marina absorbe el exceso de sebo sin dañar la barrera.",
        },
        {
          id: "seca",
          label: "Piel seca/sensible",
          message:
            "Sin jabón y sin sulfatos — suave y nutritivo incluso para piel delicada.",
        },
      ],
    },
    usageHeading: "Tu ritual en 3 pasos",
    usageSteps: [
      {
        numero: "1",
        titulo: "Humedece",
        descripcion: "Aplica agua tibia sobre la piel",
        imagen: "/images/ritual-paso-1-humedece.jpg",
      },
      {
        numero: "2",
        titulo: "Masajea",
        descripcion: "Movimientos circulares suaves por 60 segundos",
        imagen: "/images/ritual-paso-2-masajea.jpg",
      },
      {
        numero: "3",
        titulo: "Enjuaga",
        descripcion: "Agua tibia. Siente la diferencia inmediata.",
        imagen: "/images/ritual-paso-3-enjuaga.jpg",
      },
    ],
    withoutRitual: {
      title: "Por qué la limpieza profunda importa más que cualquier crema",
      conLabel: `Con el ${product.title}`,
      sin: [
        "Los activos de tu sérum no penetran bien",
        "Las células muertas acumuladas opacan la piel",
        "Los poros se congestionan sin que lo notes",
        "Resultado: la piel parece cansada aunque uses buenos productos",
      ],
      con: [
        "Base limpia = máxima absorción de activos",
        "Mineralización que prepara y nutre simultáneamente",
        "Exfoliación suave que renueva sin irritar",
        "Resultado: el resto de tu rutina funciona el doble",
      ],
    },
    resultsHeading: "Qué esperar de tu ritual",
    resultsTimeline: [
      {
        momento: "Día 1",
        titulo: "Primera aplicación",
        descripcion:
          "Sientes la piel limpia diferente — sin esa sensación de tirante del jabón.",
      },
      {
        momento: "Semana 1-2",
        titulo: "Primeros cambios visibles",
        descripcion:
          "Poros más finos. Piel más pareja. La gente de tu entorno lo nota antes que tú.",
      },
      {
        momento: "Semana 3-4",
        titulo: "Tu nueva piel",
        descripcion:
          "Textura transformada. La firmeza que buscabas no viene de cremas — viene de la limpieza profunda diaria.",
      },
      {
        momento: "Día 90+",
        titulo: "Tu ritual, para siempre",
        descripcion:
          "No querrás volver a limpiar tu piel de ninguna otra manera.",
      },
    ],
    comparison: {
      title: "Lo que las cremas no pueden hacer",
      rows: COMPARISON_DEFAULT.rows,
    },
    faqs: [
      ...FAQS_LOGISTICA,
      {
        question: "¿Para qué tipo de piel funciona?",
        answer:
          "Para todo tipo de piel. Es especialmente efectivo para piel mixta a grasa. Sin jabón, no reseca. Si tienes piel muy sensible, recomendamos usarlo 2-3 veces por semana al inicio.",
      },
      {
        question: "¿Se puede usar en el rostro?",
        answer:
          "Sí. Muchas de nuestras clientas lo usan tanto en rostro como en cuerpo. La exfoliación es suave y no irrita. Consulta con tu dermatólogo si tienes condiciones de piel activas.",
      },
      {
        question: "¿Qué pasa si no quedo satisfecha?",
        answer:
          "Escríbenos por WhatsApp. Si el producto llega en mal estado o hay algún inconveniente con tu pedido, lo solucionamos sin complicaciones.",
      },
    ],
    ugc: [
      {
        emoji: "💆‍♀️",
        title: "Para la cara + el cuerpo",
        text: "Muchas clientas lo usan en rostro (piel grasa/mixta) y en cuerpo el mismo día. Un solo producto, doble uso.",
      },
      {
        emoji: "🌙",
        title: "Como ritual de noche",
        text: "5 minutos antes de tu sérum. La exfoliación suave prepara la piel para absorber mejor los activos nocturnos.",
      },
      {
        emoji: "☀️",
        title: "Rutina de mañana",
        text: "Al despertar, activa la circulación y deja la piel lista para el maquillaje. Poros visiblemente más finos.",
      },
      {
        emoji: "🎁",
        title: "El regalo perfecto",
        text: "El empaque de papel reciclado con diseño botánico es un regalo que se ve lujoso sin envolver.",
      },
    ],
    freeGuide: {
      title: "Guía del Ritual Milito Life Shop",
      description: `Cómo maximizar los resultados de tu ${product.title} según tu tipo de piel.`,
      sections: [
        {
          title: "Rutina de mañana",
          body: "Humedece la piel con agua tibia. Masajea en círculos por 60 segundos. Enjuaga y aplica tu protector solar — la piel recién exfoliada absorbe mejor los activos.",
        },
        {
          title: "Rutina de noche",
          body: "Si usaste maquillaje, haz doble limpieza primero. Masajea 60-90 segundos para una exfoliación más profunda y sigue con tu sérum o crema mientras la piel sigue húmeda.",
        },
        {
          title: "Cómo combinarlo",
          body: "Piel sensible: 3-4 veces por semana. Piel que lo tolera bien: a diario. Evita usarlo el mismo día que exfoliantes con ácidos (AHA/BHA). Siempre protector solar de día.",
        },
      ],
    },
    authenticity: true,
  };
}

/**
 * Aplica sobre `base` solo los campos DEFINIDOS del metafield. Cada bloque
 * es reemplazo completo (no merge profundo): si el metafield trae `benefits`,
 * reemplaza toda la lista. Los campos ausentes conservan el fallback.
 */
function applyOverrides(
  base: ResolvedLanding,
  content: ProductLandingContent,
): ResolvedLanding {
  const merged = { ...base };
  if (content.eyebrow !== undefined) merged.eyebrow = content.eyebrow;
  if (content.tagline !== undefined) merged.tagline = content.tagline;
  if (content.benefitsHeading !== undefined)
    merged.benefitsHeading = content.benefitsHeading;
  if (content.benefits !== undefined) merged.benefits = content.benefits;
  if (content.ingredientStory !== undefined)
    merged.ingredientStory = content.ingredientStory;
  if (content.ingredients !== undefined)
    merged.ingredients = content.ingredients;
  if (content.skinType !== undefined) merged.skinType = content.skinType;
  if (content.usageHeading !== undefined)
    merged.usageHeading = content.usageHeading;
  if (content.usageSteps !== undefined) merged.usageSteps = content.usageSteps;
  if (content.withoutRitual !== undefined)
    merged.withoutRitual = content.withoutRitual;
  if (content.resultsHeading !== undefined)
    merged.resultsHeading = content.resultsHeading;
  if (content.resultsTimeline !== undefined)
    merged.resultsTimeline = content.resultsTimeline;
  if (content.testimonialsHeading !== undefined)
    merged.testimonialsHeading = content.testimonialsHeading;
  if (content.testimonials !== undefined)
    merged.testimonials = content.testimonials;
  if (content.comparison !== undefined) merged.comparison = content.comparison;
  if (content.faqs !== undefined) merged.faqs = content.faqs;
  if (content.ugcHeading !== undefined) merged.ugcHeading = content.ugcHeading;
  if (content.ugcSubheading !== undefined)
    merged.ugcSubheading = content.ugcSubheading;
  if (content.ugc !== undefined) merged.ugc = content.ugc;
  if (content.freeGuide !== undefined) merged.freeGuide = content.freeGuide;
  if (content.closingHeading !== undefined)
    merged.closingHeading = content.closingHeading;
  if (content.authenticity !== undefined)
    merged.authenticity = content.authenticity;
  return merged;
}

/**
 * Devuelve el contenido final de la landing de un producto.
 *
 * Precedencia (de menor a mayor):
 *   1. Fallback neutral (siempre).
 *   2. Preset Epoch, si el producto es un Epoch Polishing Bar.
 *   3. Metafield `diana_mile.landing_content`, si existe (lo llena la IA).
 *
 * Asi: los productos con metafield tienen su landing propia y unica; el
 * Epoch conserva su landing actual aunque aun no tenga metafield; y cualquier
 * otro producto nuevo cae en una landing neutral coherente (nunca la del
 * Epoch).
 */
export function resolveLanding(product: Product): ResolvedLanding {
  const base = isEpochProduct(product)
    ? epochLanding(product)
    : neutralLanding(product);

  const content = product.metafields.landingContent;
  return content ? applyOverrides(base, content) : base;
}

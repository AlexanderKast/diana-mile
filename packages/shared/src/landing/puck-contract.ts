/**
 * Contrato del constructor visual: la UNICA fuente de verdad de los bloques
 * de Puck. Aqui viven los type names, los `fields` y los `defaultProps` de
 * cada bloque como data plana; las dos configs (editor en admin, render real
 * en shop) importan esto y solo aportan la funcion `render`. Asi es
 * imposible que diverjan en shape.
 *
 * Shared NO depende de @measured/puck: los fields se tipan laxos y cada app
 * los castea. Regla de estilos: las props de estilo son enums de tokens de
 * marca que el componente traduce a clases estaticas; los valores libres
 * (altos, anchos) van a `style` inline. Nunca interpolar clases Tailwind
 * desde estas props — el scanner v4 no ve el JSON.
 */

/** Un field de Puck, tipado laxo (se castea a `Field` en cada app). */
export type CampoPuck = Record<string, unknown>;

export type BloquePuck = {
  /** Etiqueta visible en la barra de componentes del editor. */
  label: string;
  fields: Record<string, CampoPuck>;
  defaultProps?: Record<string, unknown>;
  /** Bloques que no se pueden borrar desde el editor (ej. HeroCompra). */
  protegido?: boolean;
};

const texto = (label: string): CampoPuck => ({ type: "text", label });
const parrafo = (label: string): CampoPuck => ({ type: "textarea", label });
const lista = (
  label: string,
  arrayFields: Record<string, CampoPuck>,
  itemLabelKey?: string,
): CampoPuck => ({
  type: "array",
  label,
  arrayFields,
  ...(itemLabelKey ? { getItemSummary: undefined, itemLabelKey } : {}),
});

/** Tokens de fondo permitidos en bloques con color. */
export const FONDOS = ["blanco", "crema", "lila-suave", "joya"] as const;
export type FondoBloque = (typeof FONDOS)[number];

export const ICONOS_BENEFICIO = [
  "gota",
  "mineral",
  "hoja",
  "sol",
  "escudo",
  "planeta",
] as const;

/**
 * Catalogo completo. Grupos:
 * - Marca: secciones existentes de la landing (portables o acopladas al shop).
 * - Producto: bloques que leen datos reales del producto (sin props propias).
 * - Primitivos: piezas libres estilo Elementor.
 */
export const BLOQUES: Record<string, BloquePuck> = {
  // ─── Producto / transaccionales ────────────────────────────────────────
  HeroCompra: {
    label: "Hero + boton de pedido",
    fields: {
      eyebrow: texto("Texto pequeno sobre el titulo"),
      tagline: parrafo("Promesa bajo el titulo"),
      mostrarGaleria: {
        type: "radio",
        label: "Galeria de fotos",
        options: [
          { label: "Mostrar", value: "si" },
          { label: "Ocultar", value: "no" },
        ],
      },
      mostrarSellos: {
        type: "radio",
        label: "Sellos de confianza",
        options: [
          { label: "Mostrar", value: "si" },
          { label: "Ocultar", value: "no" },
        ],
      },
      mostrarFormulario: {
        type: "radio",
        label: "Formulario de pedido",
        options: [
          { label: "Mostrar", value: "si" },
          { label: "Ocultar", value: "no" },
        ],
      },
    },
    defaultProps: {
      eyebrow: "",
      tagline: "",
      mostrarGaleria: "si",
      mostrarSellos: "si",
      mostrarFormulario: "si",
    },
  },
  ResumenPedido: {
    label: "Formulario de pedido",
    fields: {},
  },
  DescripcionShopify: {
    label: "Descripcion del producto (Shopify)",
    fields: {},
  },
  ResultadosReales: {
    label: "Fotos reales de clientas",
    fields: {},
  },
  MosaicoFotos: {
    label: "Mosaico de fotos del producto",
    fields: {},
  },
  Garantia: { label: "Garantia", fields: {} },
  Comunidad: { label: "Comunidad", fields: {} },
  NuSkin: { label: "Respaldo Nu Skin", fields: {} },
  BandaCTA: {
    label: "Banda con boton de pedido",
    fields: {
      title: texto("Titulo de la banda"),
      buttonLabel: texto("Texto del boton"),
    },
    defaultProps: {
      title: "Lista para transformar tu ritual de cuidado?",
      buttonLabel: "Reservar el mío · Contraentrega",
    },
  },
  Cierre: {
    label: "Cierre final",
    fields: { heading: texto("Encabezado del cierre") },
    defaultProps: { heading: "Tu ritual te espera" },
  },

  // ─── Marca (secciones editoriales) ─────────────────────────────────────
  Beneficios: {
    label: "Beneficios",
    fields: {
      heading: texto("Encabezado"),
      benefits: lista("Beneficios", {
        icon: {
          type: "select",
          label: "Icono",
          options: ICONOS_BENEFICIO.map((i) => ({ label: i, value: i })),
        },
        title: texto("Titulo"),
        description: parrafo("Descripcion"),
        ciencia: parrafo("Por que funciona (opcional)"),
      }),
    },
    defaultProps: { heading: "Beneficios", benefits: [] },
  },
  SinRitual: {
    label: "Sin el ritual / con el ritual",
    fields: {
      title: texto("Titulo"),
      conLabel: texto("Etiqueta de la columna positiva"),
      sin: lista("Sin el producto", { linea: texto("Linea") }),
      con: lista("Con el producto", { linea: texto("Linea") }),
    },
    defaultProps: { title: "", conLabel: "", sin: [], con: [] },
  },
  Pasos: {
    label: "Pasos de uso",
    fields: {
      heading: texto("Encabezado"),
      steps: lista("Pasos", {
        numero: texto("Numero"),
        titulo: texto("Titulo"),
        descripcion: parrafo("Descripcion"),
        imagen: texto("URL de imagen (opcional)"),
      }),
    },
    defaultProps: { heading: "Como usarlo", steps: [] },
  },
  LineaTiempo: {
    label: "Resultados en el tiempo",
    fields: {
      heading: texto("Encabezado"),
      stages: lista("Etapas", {
        momento: texto("Momento (ej. Semana 1)"),
        titulo: texto("Titulo"),
        descripcion: parrafo("Descripcion"),
      }),
    },
    defaultProps: { heading: "Resultados que se sienten", stages: [] },
  },
  Testimonios: {
    label: "Testimonios",
    fields: {
      heading: texto("Encabezado"),
      testimonials: lista("Testimonios", {
        title: texto("Titulo"),
        text: parrafo("Texto"),
      }),
    },
    defaultProps: { heading: "", testimonials: [] },
  },
  Comparacion: {
    label: "Comparacion",
    fields: {
      title: texto("Titulo"),
      rows: lista("Filas", { linea: texto("Fila") }),
    },
    defaultProps: { title: "", rows: [] },
  },
  Faqs: {
    label: "Preguntas frecuentes",
    fields: {
      faqs: lista("Preguntas", {
        question: texto("Pregunta"),
        answer: parrafo("Respuesta"),
      }),
    },
    defaultProps: { faqs: [] },
  },
  Ugc: {
    label: "Contenido de la comunidad (UGC)",
    fields: {
      heading: texto("Encabezado"),
      subheading: texto("Subtitulo"),
      posts: lista("Posts", {
        emoji: texto("Emoji"),
        title: texto("Titulo"),
        text: parrafo("Texto"),
      }),
    },
    defaultProps: { heading: "", subheading: "", posts: [] },
  },
  GuiaGratis: {
    label: "Guia gratis",
    fields: {
      title: texto("Titulo"),
      description: parrafo("Descripcion"),
      sections: lista("Secciones", {
        title: texto("Titulo"),
        body: parrafo("Contenido"),
      }),
    },
    defaultProps: { title: "", description: "", sections: [] },
  },
  Ingredientes: {
    label: "Ingredientes (INCI)",
    fields: {
      inci: parrafo("Lista INCI"),
      freeFrom: texto("Libre de (ej. Sin parabenos · Sin sulfatos)"),
    },
    defaultProps: { inci: "", freeFrom: "" },
  },
  HistoriaIngrediente: {
    label: "Historia del ingrediente",
    fields: { title: texto("Titulo"), body: parrafo("Historia") },
    defaultProps: { title: "", body: "" },
  },
  TipoDePiel: {
    label: "Selector de tipo de piel",
    fields: {
      question: texto("Pregunta"),
      options: lista("Opciones", {
        id: texto("Id (sin espacios)"),
        label: texto("Etiqueta"),
        message: parrafo("Mensaje personalizado"),
      }),
    },
    defaultProps: { question: "", options: [] },
  },

  // ─── Primitivos estilo Elementor ───────────────────────────────────────
  Encabezado: {
    label: "Encabezado",
    fields: {
      texto: texto("Texto"),
      nivel: {
        type: "radio",
        label: "Tamano",
        options: [
          { label: "Grande", value: "grande" },
          { label: "Mediano", value: "mediano" },
        ],
      },
      alineacion: {
        type: "radio",
        label: "Alineacion",
        options: [
          { label: "Izquierda", value: "izquierda" },
          { label: "Centro", value: "centro" },
        ],
      },
    },
    defaultProps: { texto: "Encabezado", nivel: "grande", alineacion: "centro" },
  },
  Texto: {
    label: "Texto",
    fields: {
      texto: parrafo("Contenido"),
      alineacion: {
        type: "radio",
        label: "Alineacion",
        options: [
          { label: "Izquierda", value: "izquierda" },
          { label: "Centro", value: "centro" },
        ],
      },
    },
    defaultProps: { texto: "", alineacion: "izquierda" },
  },
  Imagen: {
    label: "Imagen",
    fields: {
      url: texto("URL de la imagen"),
      alt: texto("Texto alternativo"),
      ancho: {
        type: "radio",
        label: "Ancho",
        options: [
          { label: "Completo", value: "completo" },
          { label: "Medio", value: "medio" },
        ],
      },
    },
    defaultProps: { url: "", alt: "", ancho: "completo" },
  },
  Video: {
    label: "Video",
    fields: {
      url: texto("URL del video (MP4)"),
      poster: texto("Imagen de portada (opcional)"),
      ancho: {
        type: "radio",
        label: "Ancho",
        options: [
          { label: "Completo", value: "completo" },
          { label: "Medio", value: "medio" },
        ],
      },
    },
    defaultProps: { url: "", poster: "", ancho: "medio" },
  },
  Columnas: {
    label: "Columnas",
    fields: {
      contenido: { type: "slot" },
      porFila: {
        type: "radio",
        label: "Columnas en escritorio",
        options: [
          { label: "2", value: 2 },
          { label: "3", value: 3 },
          { label: "4", value: 4 },
        ],
      },
    },
    defaultProps: { contenido: [], porFila: 2 },
  },
  Banda: {
    label: "Banda de color",
    fields: {
      fondo: {
        type: "select",
        label: "Fondo",
        options: FONDOS.map((f) => ({ label: f, value: f })),
      },
      contenido: { type: "slot" },
    },
    defaultProps: { fondo: "crema", contenido: [] },
  },
  Espaciador: {
    label: "Espaciador",
    fields: {
      alto: {
        type: "select",
        label: "Alto",
        options: [
          { label: "Pequeno", value: "pequeno" },
          { label: "Mediano", value: "mediano" },
          { label: "Grande", value: "grande" },
        ],
      },
    },
    defaultProps: { alto: "mediano" },
  },
  Divisor: { label: "Divisor dorado", fields: {} },
  BotonCTA: {
    label: "Boton de pedido",
    fields: { etiqueta: texto("Texto del boton") },
    defaultProps: { etiqueta: "Pedir ahora · Contraentrega" },
  },
};

/** Type names validos — para validar `puckData` al guardar. */
export const TIPOS_BLOQUE = Object.keys(BLOQUES);

/**
 * Red de seguridad del layout: true si en algun lugar del arbol (incluidos
 * slots anidados) hay un bloque que monte el formulario de pedido — un
 * ResumenPedido, o un HeroCompra con el formulario visible. Si no lo hay,
 * la tienda monta el formulario al final de la pagina por su cuenta: borrar
 * bloques en el editor nunca puede dejar una landing sin forma de comprar.
 */
export function layoutTieneFormulario(nodo: unknown): boolean {
  if (Array.isArray(nodo)) return nodo.some(layoutTieneFormulario);
  if (!nodo || typeof nodo !== "object") return false;
  const objeto = nodo as Record<string, unknown>;
  if (objeto.type === "ResumenPedido") return true;
  if (objeto.type === "HeroCompra") {
    const props = objeto.props as Record<string, unknown> | undefined;
    if (props?.mostrarFormulario !== "no") return true;
  }
  return Object.values(objeto).some(layoutTieneFormulario);
}

/**
 * Categorias de la barra lateral del editor, en orden. Los bloques que no
 * aparezcan aqui no se muestran (pero siguen siendo validos al renderizar).
 */
export const CATEGORIAS: Record<string, { title: string; components: string[] }> = {
  producto: {
    title: "Producto",
    components: [
      "HeroCompra",
      "ResumenPedido",
      "DescripcionShopify",
      "ResultadosReales",
      "MosaicoFotos",
      "BandaCTA",
      "BotonCTA",
      "Cierre",
    ],
  },
  secciones: {
    title: "Secciones",
    components: [
      "Beneficios",
      "SinRitual",
      "Pasos",
      "LineaTiempo",
      "Testimonios",
      "Comparacion",
      "Faqs",
      "Ugc",
      "GuiaGratis",
      "Ingredientes",
      "HistoriaIngrediente",
      "TipoDePiel",
      "Garantia",
      "Comunidad",
      "NuSkin",
    ],
  },
  primitivos: {
    title: "Diseno libre",
    components: [
      "Encabezado",
      "Texto",
      "Imagen",
      "Video",
      "Columnas",
      "Banda",
      "Espaciador",
      "Divisor",
    ],
  },
};

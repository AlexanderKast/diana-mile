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

// contentEditable: los textos se editan tocandolos directo en el canvas
// (ademas del panel derecho) — la curva de aprendizaje mas baja posible.
const texto = (label: string): CampoPuck => ({
  type: "text",
  label,
  contentEditable: true,
});
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

/** Paleta de texto de la marca (props → clases estaticas en el componente). */
export const COLORES_TEXTO = [
  "carbon",
  "carbon-suave",
  "ceniza",
  "dorado-oscuro",
  "morado",
  "blanco",
] as const;
export type ColorTexto = (typeof COLORES_TEXTO)[number];

const campoColorTexto: CampoPuck = {
  type: "select",
  label: "Color del texto",
  options: [
    { label: "Carbon (principal)", value: "carbon" },
    { label: "Carbon suave", value: "carbon-suave" },
    { label: "Ceniza", value: "ceniza" },
    { label: "Dorado oscuro", value: "dorado-oscuro" },
    { label: "Morado", value: "morado" },
    { label: "Blanco (sobre fondos oscuros)", value: "blanco" },
  ],
};

const campoFuente: CampoPuck = {
  type: "radio",
  label: "Tipografia",
  options: [
    { label: "Elegante (Cormorant)", value: "display" },
    { label: "Moderna (Inter)", value: "sans" },
  ],
};

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
          // "si" = incrustado (compat con disenos ya guardados).
          { label: "Incrustado", value: "si" },
          { label: "Popup", value: "popup" },
          { label: "Oculto", value: "no" },
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
    fields: {
      presentacion: {
        type: "radio",
        label: "Presentacion",
        options: [
          { label: "Incrustado en la pagina", value: "incrustado" },
          { label: "Popup (se abre con los botones)", value: "popup" },
        ],
      },
    },
    defaultProps: { presentacion: "incrustado" },
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
  CorteDespacho: {
    label: "Corte de despacho (countdown real)",
    fields: {},
  },
  BotonWhatsApp: {
    label: "Boton de WhatsApp",
    fields: { etiqueta: texto("Texto del boton") },
    defaultProps: { etiqueta: "Preguntar por WhatsApp" },
  },
  PruebaSocial: {
    label: "Pedidos entregados (dato real)",
    fields: {},
  },
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
      tamano: {
        type: "select",
        label: "Tamano",
        options: [
          { label: "Gigante", value: "gigante" },
          { label: "Grande", value: "grande" },
          { label: "Mediano", value: "mediano" },
          { label: "Pequeno", value: "pequeno" },
        ],
      },
      fuente: campoFuente,
      color: campoColorTexto,
      alineacion: {
        type: "radio",
        label: "Alineacion",
        options: [
          { label: "Izquierda", value: "izquierda" },
          { label: "Centro", value: "centro" },
        ],
      },
    },
    defaultProps: {
      texto: "Encabezado",
      tamano: "grande",
      fuente: "display",
      color: "carbon",
      alineacion: "centro",
    },
  },
  Texto: {
    label: "Texto",
    fields: {
      texto: parrafo("Contenido"),
      tamano: {
        type: "select",
        label: "Tamano",
        options: [
          { label: "Grande", value: "grande" },
          { label: "Normal", value: "normal" },
          { label: "Pequeno", value: "pequeno" },
        ],
      },
      fuente: campoFuente,
      color: campoColorTexto,
      alineacion: {
        type: "radio",
        label: "Alineacion",
        options: [
          { label: "Izquierda", value: "izquierda" },
          { label: "Centro", value: "centro" },
        ],
      },
    },
    defaultProps: {
      texto: "",
      tamano: "normal",
      fuente: "sans",
      color: "carbon-suave",
      alineacion: "izquierda",
    },
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
    // `proporcion` (ancho/alto) no tiene field: la calcula el editor al
    // subir/cambiar la imagen y la tienda la usa para reservar el espacio
    // exacto — la imagen se muestra COMPLETA en su formato original
    // (1:1, 4:5, 9:16...), nunca recortada.
    defaultProps: { url: "", alt: "", ancho: "completo", proporcion: 0 },
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
    fields: {
      etiqueta: texto("Texto del boton"),
      color: {
        type: "select",
        label: "Color",
        options: [
          { label: "Dorado", value: "dorado" },
          { label: "Morado", value: "morado" },
          { label: "Carbon", value: "carbon" },
        ],
      },
      estilo: {
        type: "radio",
        label: "Estilo",
        options: [
          { label: "Solido", value: "solido" },
          { label: "Con borde", value: "borde" },
        ],
      },
      efecto: {
        type: "select",
        label: "Efecto",
        options: [
          { label: "Brillo", value: "brillo" },
          { label: "Pulso", value: "pulso" },
          { label: "Brillo + pulso", value: "brillo-pulso" },
          { label: "Ninguno", value: "ninguno" },
        ],
      },
      tamano: {
        type: "radio",
        label: "Tamano",
        options: [
          { label: "Normal", value: "normal" },
          { label: "Grande", value: "grande" },
        ],
      },
      anchoBoton: {
        type: "radio",
        label: "Ancho",
        options: [
          { label: "Al contenido", value: "auto" },
          { label: "Completo", value: "completo" },
        ],
      },
      fuente: campoFuente,
    },
    defaultProps: {
      etiqueta: "Pedir ahora · Contraentrega",
      color: "dorado",
      estilo: "solido",
      efecto: "brillo-pulso",
      tamano: "normal",
      anchoBoton: "auto",
      fuente: "sans",
    },
  },
};

/** Personalizacion del BotonCTA (props → clases estaticas en el componente). */
export type EstiloBotonCta = {
  color: "dorado" | "morado" | "carbon";
  estilo: "solido" | "borde";
  efecto: "brillo" | "pulso" | "brillo-pulso" | "ninguno";
  tamano: "normal" | "grande";
  anchoBoton: "auto" | "completo";
  fuente?: "display" | "sans";
};

/**
 * Opciones de pagina del constructor (root de Puck): controlan el marco del
 * sitio alrededor de la landing. Solo aplican cuando la landing usa diseno
 * visual; sin puckData el sitio se muestra completo como siempre.
 */
export const CAMPOS_ROOT: Record<string, CampoPuck> = {
  mostrarHeader: {
    type: "radio",
    label: "Menu del sitio (header y barra movil)",
    options: [
      { label: "Mostrar", value: "si" },
      { label: "Ocultar", value: "no" },
    ],
  },
  mostrarFooter: {
    type: "radio",
    label: "Footer del sitio",
    options: [
      { label: "Mostrar", value: "si" },
      { label: "Ocultar", value: "no" },
    ],
  },
  mostrarStickyCta: {
    type: "radio",
    label: "Barra fija de compra (abajo)",
    options: [
      { label: "Mostrar", value: "si" },
      { label: "Ocultar", value: "no" },
    ],
  },
};

export const DEFAULTS_ROOT = {
  mostrarHeader: "si",
  mostrarFooter: "si",
  mostrarStickyCta: "si",
};

/** Lee las opciones de pagina de un layout guardado (defaults: mostrar todo). */
export function opcionesRootLanding(puckData: unknown): {
  mostrarHeader: boolean;
  mostrarFooter: boolean;
  mostrarStickyCta: boolean;
} {
  const props =
    puckData && typeof puckData === "object"
      ? ((puckData as { root?: { props?: Record<string, unknown> } }).root
          ?.props ?? {})
      : {};
  return {
    mostrarHeader: props.mostrarHeader !== "no",
    mostrarFooter: props.mostrarFooter !== "no",
    mostrarStickyCta: props.mostrarStickyCta !== "no",
  };
}

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
      "CorteDespacho",
      "BotonWhatsApp",
      "PruebaSocial",
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

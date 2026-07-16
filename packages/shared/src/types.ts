export type ProductVariant = {
  id: string;
  title: string;
  price: string;
  compareAtPrice: string | null;
};

export type ProductMetafields = {
  nuskinDirectUrl: string | null;
  nuskinDirectPrecio: string | null;
  ahorroPack2: string | null;
  ahorroPack3: string | null;
  /**
   * Contenido de la landing por producto (metafield JSON
   * `diana_mile.landing_content`). Es parcial: cada bloque ausente se
   * completa con un fallback neutral en el resolver del app shop
   * (`lib/product-content.ts`). Poblado automaticamente por el script de
   * generacion con IA (`scripts/generate-landing.mjs`).
   */
  landingContent: ProductLandingContent | null;
};

/** Iconos disponibles para las tarjetas de beneficio. */
export type LandingBenefitIcon =
  | "gota"
  | "mineral"
  | "hoja"
  | "sol"
  | "escudo"
  | "planeta";

export type LandingBenefit = {
  icon: LandingBenefitIcon;
  title: string;
  description: string;
  /** Explicacion opcional "por que funciona" (se despliega bajo el beneficio). */
  ciencia?: string;
};

export type LandingStep = {
  numero: string;
  titulo: string;
  descripcion: string;
  /** Ruta de imagen opcional; si falta, la tarjeta se muestra sin foto. */
  imagen?: string;
};

export type LandingFaq = { question: string; answer: string };

export type LandingTimelineStage = {
  momento: string;
  titulo: string;
  descripcion: string;
};

export type LandingTestimonial = { title: string; text: string };

export type LandingComparison = { title: string; rows: string[] };

export type LandingWithoutRitual = {
  title: string;
  /** Etiqueta de la columna positiva, ej. "Con el Serum Luminoso". */
  conLabel: string;
  sin: string[];
  con: string[];
};

export type LandingIngredientStory = { title: string; body: string };

export type LandingIngredients = {
  /** Lista INCI completa. */
  inci: string;
  /** Linea de "libre de", ej. "Sin parabenos · Sin sulfatos". */
  freeFrom: string;
};

export type LandingSkinTypeOption = {
  id: string;
  label: string;
  message: string;
};

export type LandingSkinType = {
  question: string;
  options: LandingSkinTypeOption[];
};

export type LandingUGCPost = {
  emoji: string;
  title: string;
  text: string;
};

export type LandingFreeGuideSection = { title: string; body: string };

export type LandingFreeGuide = {
  title: string;
  description: string;
  sections: LandingFreeGuideSection[];
};

/**
 * Contenido editorial de la landing de un producto. TODO es opcional: el
 * resolver (`resolveLanding` en el app shop) completa cada bloque ausente
 * con un fallback neutral derivado del titulo/descripcion del producto, de
 * modo que un producto sin este metafield sigue teniendo una landing
 * coherente (aunque generica). El objetivo es que el script de IA lo llene
 * completo para que cada producto tenga una landing unica y "ganadora".
 */
export type ProductLandingContent = {
  /** Texto pequeno sobre el titulo, ej. "Coleccion Epoch® · Nu Skin". */
  eyebrow?: string;
  /** Promesa/subtitulo bajo el titulo del producto. */
  tagline?: string;
  /** Encabezado de la seccion de beneficios. */
  benefitsHeading?: string;
  benefits?: LandingBenefit[];
  ingredientStory?: LandingIngredientStory;
  ingredients?: LandingIngredients;
  skinType?: LandingSkinType;
  /** Encabezado de la seccion de pasos de uso. */
  usageHeading?: string;
  usageSteps?: LandingStep[];
  withoutRitual?: LandingWithoutRitual;
  resultsHeading?: string;
  resultsTimeline?: LandingTimelineStage[];
  testimonialsHeading?: string;
  testimonials?: LandingTestimonial[];
  comparison?: LandingComparison;
  faqs?: LandingFaq[];
  ugcHeading?: string;
  ugcSubheading?: string;
  ugc?: LandingUGCPost[];
  freeGuide?: LandingFreeGuide;
  /** Encabezado del cierre final antes del ultimo CTA. */
  closingHeading?: string;
  /** Muestra el badge "100% original" y stats de uso (marcas revendidas). */
  authenticity?: boolean;
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  description: string;
  price: string;
  currencyCode: string;
  images: { url: string; altText: string | null }[];
  variantId: string;
  variants: ProductVariant[];
  metafields: ProductMetafields;
};

/**
 * Contenido editorial del hero de una categoria (metafield JSON
 * `diana_mile.collection_content`). Igual que `ProductLandingContent`, todo
 * es opcional: sin metafield, la pagina de categoria cae a un fallback
 * neutral derivado del titulo/descripcion de la collection.
 */
export type CollectionLandingContent = {
  /** Texto pequeno sobre el titulo, ej. "Linea Epoch® · Nu Skin". */
  eyebrow?: string;
  /** Promesa/subtitulo bajo el titulo de la categoria. */
  tagline?: string;
  /** Encabezado del bloque de storytelling. */
  storyHeading?: string;
  storyBody?: string;
};

export type Collection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: { url: string; altText: string | null } | null;
  landingContent: CollectionLandingContent | null;
  products: Product[];
};

export type LinktreeLinkSection =
  | "hero"
  | "store"
  | "collab_diana"
  | "agency"
  | "social";

export type LinktreeLink = {
  id: string;
  label: string;
  url: string;
  icon: "bag" | "whatsapp" | "instagram" | "tiktok";
  variant: "primary" | "secondary";
  active: boolean;
  section?: LinktreeLinkSection;
  subtitle?: string;
  badge?: string;
};

export type Lead = {
  id: string;
  nombre: string;
  telefono: string;
  email: string | null;
  ciudad: string | null;
  producto_interes: string | null;
  fuente: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  convertido: boolean;
  shopify_draft_order_id: string | null;
  created_at: string;
};

export type EstadoPedido =
  | "pendiente"
  | "confirmado"
  | "en_preparacion"
  | "enviado"
  | "entregado"
  | "devuelto"
  | "cancelado"
  | "fraude";

export type Pedido = {
  id: string;
  shopify_order_id: string | null;
  shopify_order_number: string | null;
  nombre: string;
  telefono: string;
  direccion: string;
  barrio: string | null;
  ciudad: string;
  departamento: string | null;
  latitud: number | null;
  longitud: number | null;
  producto_nombre: string;
  producto_sku: string | null;
  variante_nombre: string | null;
  variant_id: string | null;
  cantidad: number;
  precio_venta: number | null;
  costo_producto: number | null;
  precio_total: number | null;
  estado: EstadoPedido;
  canal_adquisicion: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  intentos_llamada: number;
  confirmado_por: string | null;
  fecha_confirmacion: string | null;
  transportadora: string | null;
  numero_guia: string | null;
  fecha_envio: string | null;
  fecha_entrega_estimada: string | null;
  fecha_entrega_real: string | null;
  costo_envio: number | null;
  valor_recaudado: number | null;
  devolucion_motivo: string | null;
  shopify_fulfillment_id: string | null;
  prioridad: "normal" | "urgente" | "prioritario";
  tags: string[] | null;
  asignado_a: string | null;
  notas: string | null;
  created_at: string;
  updated_at: string;
};

export type RolUsuario =
  | "superadmin"
  | "admin"
  | "confirmador"
  | "logistica"
  | "financiero"
  | "readonly";

export type UsuarioAdmin = {
  id: string;
  user_id: string;
  email: string;
  nombre: string;
  rol: RolUsuario;
  activo: boolean;
  ultimo_acceso: string | null;
  creado_por: string | null;
  created_at: string;
  updated_at: string;
};

export type ResultadoConfirmacion =
  | "confirmado"
  | "rechazado"
  | "no_contesta"
  | "numero_invalido"
  | "rellamar"
  | "duplicado"
  | "fraude";

export type Confirmacion = {
  id: string;
  pedido_id: string;
  usuario_id: string;
  usuario_nombre: string | null;
  intento: number;
  resultado: ResultadoConfirmacion;
  notas: string | null;
  duracion_segundos: number | null;
  created_at: string;
};

export type Gasto = {
  id: string;
  tipo: string;
  descripcion: string;
  monto: number;
  moneda: string;
  tasa_cambio: number;
  monto_cop: number | null;
  fecha: string;
  periodo: string | null;
  pedido_id: string | null;
  comprobante_url: string | null;
  plataforma: string | null;
  campana: string | null;
  registrado_por: string | null;
  notas: string | null;
  created_at: string;
};

export type Transportadora = {
  id: string;
  nombre: string;
  slug: string;
  activa: boolean;
  url_tracking: string | null;
  contacto: string | null;
  notas: string | null;
  created_at: string;
};

export type MetricasFinancieras = {
  periodo: string;
  total_pedidos: number;
  pedidos_confirmados: number;
  pedidos_entregados: number;
  pedidos_devueltos: number;
  pedidos_cancelados: number;
  tasa_confirmacion: number;
  tasa_entrega: number;
  tasa_devolucion: number;
  ingresos_brutos: number;
  ingresos_recaudados: number;
  costo_productos: number;
  costo_envios: number;
  gasto_publicidad: number;
  otros_gastos: number;
  utilidad_bruta: number;
  utilidad_neta: number;
  margen_neto: number;
  ticket_promedio: number;
  costo_por_pedido: number;
  roas: number | null;
};

export type RendimientoTransportadora = {
  transportadora: string;
  total_envios: number;
  entregados: number;
  devueltos: number;
  en_transito: number;
  tasa_entrega: number;
  costo_promedio: number;
  dias_promedio_entrega: number | null;
};

export type FiltrosPedidos = {
  estado?: EstadoPedido[];
  fecha_desde?: string;
  fecha_hasta?: string;
  ciudad?: string;
  transportadora?: string;
  canal_adquisicion?: string;
  busqueda?: string;
  asignado_a?: string;
  prioridad?: string;
  page?: number;
  per_page?: number;
};

export type ConfigRow = {
  id: string;
  clave: string;
  valor: string | null;
  tipo: "texto" | "json" | "booleano" | "imagen";
  descripcion: string | null;
  updated_at: string;
};

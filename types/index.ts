export type Product = {
  id: string;
  handle: string;
  title: string;
  description: string;
  price: string;
  currencyCode: string;
  images: { url: string; altText: string | null }[];
  variantId: string;
};

export type LinktreeLink = {
  label: string;
  url: string;
  icon: "bag" | "whatsapp" | "instagram" | "tiktok";
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
  created_at: string;
};

export type EstadoPedido =
  | "pendiente"
  | "confirmado"
  | "enviado"
  | "entregado"
  | "devuelto";

export type Pedido = {
  id: string;
  shopify_order_id: string | null;
  nombre: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  departamento: string | null;
  producto_nombre: string;
  producto_sku: string | null;
  variant_id: string | null;
  cantidad: number;
  precio_total: number | null;
  estado: EstadoPedido;
  notas: string | null;
  created_at: string;
  updated_at: string;
};

export type ConfigRow = {
  id: string;
  clave: string;
  valor: string | null;
  tipo: "texto" | "json" | "booleano" | "imagen";
  descripcion: string | null;
  updated_at: string;
};

export type CODFormData = {
  nombre: string;
  telefono: string;
  ciudad: string;
  direccion: string;
  notas: string;
  productSlug: string;
};

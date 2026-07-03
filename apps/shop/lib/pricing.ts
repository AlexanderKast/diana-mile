// Valores fijos del lado del servidor para el popup de descuento y el
// upsell de envio — nunca se confia en montos que mande el cliente.
export const DISCOUNT_PERCENT = 10;
export const ENVIO_PRIORITARIO_PRECIO = "12000";
export const ENVIO_PRIORITARIO_LABEL = "Envío Prioritario + Seguro Adicional";
// Producto real en Shopify (draft, oculto de la tienda) — se agrega como
// line_item con variant_id real en vez de un line_item custom.
export const ENVIO_PRIORITARIO_VARIANT_ID = "44281739968555";

import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import {
  DISCOUNT_PERCENT,
  ENVIO_ESTANDAR_PRECIO,
  ENVIO_GRATIS_DESDE,
  ENVIO_PRIORITARIO_LABEL,
  ENVIO_PRIORITARIO_PRECIO,
} from "@/lib/pricing";

export type PricingConfig = {
  discountPercent: number;
  discountPopupActivo: boolean;
  envioPrioritarioPrecio: string;
  envioPrioritarioLabel: string;
  /** Cargo de envio estandar cuando el pedido no alcanza envioGratisDesde. */
  envioEstandarPrecio: string;
  /** Subtotal minimo (con descuento ya aplicado) para envio gratis. */
  envioGratisDesde: number;
  pwaBannerActivo: boolean;
  /**
   * Tope de valor que el mensajero puede recibir en efectivo por un pedido
   * contraentrega.
   *
   * El estado COD lo sigue decidiendo `cod_disponible` a nivel de PRODUCTO,
   * no este numero. Esto es una segunda barrera para el caso que el
   * metafield no ve: un producto barato y apto para contraentrega al que se
   * le agrega una variante de pack. Un tubo de AP 24 son $75.600 y es COD
   * sin problema; el pack de 25 son $1.417.500 en efectivo en la puerta, y
   * eso no lo sostiene nadie aunque el producto siga marcado como apto.
   *
   * Se lee de la tabla `config` (clave `cod_tope_pedido`) para poder subirlo
   * o bajarlo desde el admin sin desplegar.
   */
  codTopePedido: number;
};

const DEFAULTS: PricingConfig = {
  discountPercent: DISCOUNT_PERCENT,
  discountPopupActivo: true,
  envioPrioritarioPrecio: ENVIO_PRIORITARIO_PRECIO,
  envioPrioritarioLabel: ENVIO_PRIORITARIO_LABEL,
  envioEstandarPrecio: ENVIO_ESTANDAR_PRECIO,
  envioGratisDesde: Number(ENVIO_GRATIS_DESDE),
  pwaBannerActivo: true,
  codTopePedido: 400000,
};

const CLAVES = [
  "descuento_popup_porcentaje",
  "descuento_popup_activo",
  "envio_prioritario_precio",
  "envio_prioritario_label",
  "envio_estandar_precio",
  "envio_gratis_desde",
  "pwa_banner_activo",
  "cod_tope_pedido",
] as const;

/**
 * Un tope mal escrito en el admin (vacio, texto, 0) no puede convertirse en
 * "ningun pedido pasa" ni en "todos pasan": se cae al default.
 */
function topeValido(valor: string | null | undefined): number {
  const n = Number(valor);
  return Number.isFinite(n) && n > 0 ? n : DEFAULTS.codTopePedido;
}

/** Mismo resguardo que topeValido: un umbral mal escrito cae al default. */
function umbralValido(valor: string | null | undefined): number {
  const n = Number(valor);
  return Number.isFinite(n) && n >= 0 ? n : DEFAULTS.envioGratisDesde;
}

/**
 * Lee la configuracion de precios/promos desde la tabla `config` de
 * Supabase (editable en el admin), con fallback a los montos fijos de
 * lib/pricing.ts si falta la fila o la lectura falla — el checkout nunca
 * debe romperse por esto. Server-only: usa el cliente con service role, no
 * debe importarse desde componentes "use client".
 */
export async function getPricingConfig(): Promise<PricingConfig> {
  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("config")
      .select("clave, valor")
      .in("clave", CLAVES);

    if (error || !data) return DEFAULTS;

    const valores = new Map(data.map((fila) => [fila.clave, fila.valor]));

    const porcentajeRaw = valores.get("descuento_popup_porcentaje");
    const porcentaje = porcentajeRaw ? Number(porcentajeRaw) : NaN;

    return {
      discountPercent: Number.isFinite(porcentaje)
        ? porcentaje
        : DEFAULTS.discountPercent,
      discountPopupActivo: valores.has("descuento_popup_activo")
        ? valores.get("descuento_popup_activo") !== "false"
        : DEFAULTS.discountPopupActivo,
      envioPrioritarioPrecio:
        valores.get("envio_prioritario_precio") ||
        DEFAULTS.envioPrioritarioPrecio,
      envioPrioritarioLabel:
        valores.get("envio_prioritario_label") ||
        DEFAULTS.envioPrioritarioLabel,
      envioEstandarPrecio:
        valores.get("envio_estandar_precio") || DEFAULTS.envioEstandarPrecio,
      envioGratisDesde: umbralValido(valores.get("envio_gratis_desde")),
      pwaBannerActivo: valores.has("pwa_banner_activo")
        ? valores.get("pwa_banner_activo") !== "false"
        : DEFAULTS.pwaBannerActivo,
      codTopePedido: topeValido(valores.get("cod_tope_pedido")),
    };
  } catch {
    return DEFAULTS;
  }
}

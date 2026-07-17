import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import {
  DISCOUNT_PERCENT,
  ENVIO_PRIORITARIO_LABEL,
  ENVIO_PRIORITARIO_PRECIO,
} from "@/lib/pricing";

export type PricingConfig = {
  discountPercent: number;
  discountPopupActivo: boolean;
  envioPrioritarioPrecio: string;
  envioPrioritarioLabel: string;
  pwaBannerActivo: boolean;
};

const DEFAULTS: PricingConfig = {
  discountPercent: DISCOUNT_PERCENT,
  discountPopupActivo: true,
  envioPrioritarioPrecio: ENVIO_PRIORITARIO_PRECIO,
  envioPrioritarioLabel: ENVIO_PRIORITARIO_LABEL,
  pwaBannerActivo: true,
};

const CLAVES = [
  "descuento_popup_porcentaje",
  "descuento_popup_activo",
  "envio_prioritario_precio",
  "envio_prioritario_label",
  "pwa_banner_activo",
] as const;

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
      pwaBannerActivo: valores.has("pwa_banner_activo")
        ? valores.get("pwa_banner_activo") !== "false"
        : DEFAULTS.pwaBannerActivo,
    };
  } catch {
    return DEFAULTS;
  }
}

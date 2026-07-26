"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Product, ProductVariant } from "@diana-mile/shared/types";
import {
  DISCOUNT_PERCENT,
  ENVIO_PRIORITARIO_LABEL,
  ENVIO_PRIORITARIO_PRECIO,
} from "@/lib/pricing";
import { trackInitiateCheckout } from "@/lib/tracking/client-events";

export { DISCOUNT_PERCENT };
const DISCOUNT_DURATION_MS = 5 * 60 * 1000;
const DISCOUNT_STORAGE_KEY = "milito_descuento_expira";

export type OrderSheetPricing = {
  discountPercent: number;
  discountPopupActivo: boolean;
  envioPrioritarioPrecio: string;
  envioPrioritarioLabel: string;
};

const PRICING_DEFAULT: OrderSheetPricing = {
  discountPercent: DISCOUNT_PERCENT,
  discountPopupActivo: true,
  envioPrioritarioPrecio: ENVIO_PRIORITARIO_PRECIO,
  envioPrioritarioLabel: ENVIO_PRIORITARIO_LABEL,
};

type OrderSheetContextValue = {
  product: Product;
  pricing: OrderSheetPricing;
  isOpen: boolean;
  selectedVariantId: string;
  selectedIsNuskin: boolean;
  selectedVariant: ProductVariant | undefined;
  discountApplied: boolean;
  applyDiscount: () => void;
  openOrderSheet: (variantId?: string) => void;
  closeOrderSheet: () => void;
  selectVariant: (variantId: string) => void;
  selectNuskin: () => void;
  orderCompleted: boolean;
  markOrderCompleted: () => void;
  /** Id de la opcion elegida en "¿Cual es tu tipo de piel?" (ej. "grasa").
   * Compartido para que cualquier seccion de la pagina pueda personalizarse
   * segun la respuesta. Null si todavia no elige. */
  selectedSkinTypeId: string | null;
  selectSkinType: (id: string) => void;
};

const OrderSheetContext = createContext<OrderSheetContextValue | null>(null);

export function OrderSheetProvider({
  product,
  pricing = PRICING_DEFAULT,
  children,
}: {
  product: Product;
  pricing?: OrderSheetPricing;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants[0]?.id ?? "",
  );
  const [selectedIsNuskin, setSelectedIsNuskin] = useState(false);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [selectedSkinTypeId, setSelectedSkinTypeId] = useState<string | null>(null);

  const selectSkinType = useCallback((id: string) => {
    setSelectedSkinTypeId(id);
    // Deja ver el mensaje de confirmacion un momento antes de bajar a la
    // tarjeta personalizada de Beneficios — asi se siente que la pagina
    // reacciona a la respuesta, no un salto brusco.
    setTimeout(() => {
      document
        .getElementById("beneficio-personalizado")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 700);
  }, []);
  const discountTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restaura el descuento del popup exit-intent si la persona sigue dentro
  // de la ventana de 5 minutos tras un refresh/navegacion en la misma sesion.
  useEffect(() => {
    const expiresAtRaw = sessionStorage.getItem(DISCOUNT_STORAGE_KEY);
    if (!expiresAtRaw) return;

    const remaining = Number(expiresAtRaw) - Date.now();
    if (remaining > 0) {
      setDiscountApplied(true);
      discountTimeoutRef.current = setTimeout(
        () => setDiscountApplied(false),
        remaining,
      );
    } else {
      sessionStorage.removeItem(DISCOUNT_STORAGE_KEY);
    }

    return () => {
      if (discountTimeoutRef.current) clearTimeout(discountTimeoutRef.current);
    };
  }, []);

  const applyDiscount = useCallback(() => {
    const expiresAt = Date.now() + DISCOUNT_DURATION_MS;
    sessionStorage.setItem(DISCOUNT_STORAGE_KEY, String(expiresAt));
    setDiscountApplied(true);

    if (discountTimeoutRef.current) clearTimeout(discountTimeoutRef.current);
    discountTimeoutRef.current = setTimeout(
      () => setDiscountApplied(false),
      DISCOUNT_DURATION_MS,
    );
  }, []);

  // Descuento por link (?d=1): lo usa la asesora de WhatsApp cuando se lo
  // ofrece a alguien en el chat. Sin esto, el descuento solo existe en el
  // popup de salida y la promesa hecha por WhatsApp no se podria cumplir.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("d") === "1") applyDiscount();
  }, [applyDiscount]);

  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) ??
    product.variants[0];

  const selectVariant = useCallback((variantId: string) => {
    setSelectedVariantId(variantId);
    setSelectedIsNuskin(false);
  }, []);

  const selectNuskin = useCallback(() => {
    setSelectedIsNuskin(true);
  }, []);

  const openOrderSheet = useCallback(
    (variantId?: string) => {
      if (variantId) selectVariant(variantId);
      setIsOpen(true);

      const targetVariant =
        product.variants.find((v) => v.id === (variantId ?? selectedVariantId)) ??
        product.variants[0];
      trackInitiateCheckout({
        contentId: product.handle,
        contentName: product.title,
        value: targetVariant ? parseFloat(targetVariant.price) : undefined,
      });

      if (typeof window !== "undefined" && window.innerWidth >= 768) {
        document.getElementById("order-form-desktop")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    },
    [selectVariant, product, selectedVariantId],
  );

  const closeOrderSheet = useCallback(() => {
    setIsOpen(false);
  }, []);

  const markOrderCompleted = useCallback(() => {
    setOrderCompleted(true);
  }, []);

  const value = useMemo<OrderSheetContextValue>(
    () => ({
      product,
      pricing,
      isOpen,
      selectedVariantId,
      selectedIsNuskin,
      selectedVariant,
      discountApplied,
      applyDiscount,
      openOrderSheet,
      closeOrderSheet,
      selectVariant,
      selectNuskin,
      orderCompleted,
      markOrderCompleted,
      selectedSkinTypeId,
      selectSkinType,
    }),
    [
      product,
      pricing,
      isOpen,
      selectedVariantId,
      selectedIsNuskin,
      selectedVariant,
      discountApplied,
      applyDiscount,
      openOrderSheet,
      closeOrderSheet,
      selectVariant,
      selectNuskin,
      orderCompleted,
      markOrderCompleted,
      selectedSkinTypeId,
      selectSkinType,
    ],
  );

  return (
    <OrderSheetContext.Provider value={value}>
      {children}
    </OrderSheetContext.Provider>
  );
}

export function useOrderSheet(): OrderSheetContextValue {
  const ctx = useContext(OrderSheetContext);
  if (!ctx) {
    throw new Error("useOrderSheet debe usarse dentro de OrderSheetProvider");
  }
  return ctx;
}

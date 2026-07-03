"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Product, ProductVariant } from "@diana-mile/shared/types";
import { DISCOUNT_PERCENT } from "@/lib/pricing";

export { DISCOUNT_PERCENT };
const DISCOUNT_DURATION_MS = 5 * 60 * 1000;
const DISCOUNT_STORAGE_KEY = "milito_descuento_expira";

type OrderSheetContextValue = {
  product: Product;
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
};

const OrderSheetContext = createContext<OrderSheetContextValue | null>(null);

export function OrderSheetProvider({
  product,
  children,
}: {
  product: Product;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id ?? "");
  const [selectedIsNuskin, setSelectedIsNuskin] = useState(false);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const discountTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restaura el descuento del popup exit-intent si la persona sigue dentro
  // de la ventana de 5 minutos tras un refresh/navegacion en la misma sesion.
  useEffect(() => {
    const expiresAtRaw = sessionStorage.getItem(DISCOUNT_STORAGE_KEY);
    if (!expiresAtRaw) return;

    const remaining = Number(expiresAtRaw) - Date.now();
    if (remaining > 0) {
      setDiscountApplied(true);
      discountTimeoutRef.current = setTimeout(() => setDiscountApplied(false), remaining);
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
    discountTimeoutRef.current = setTimeout(() => setDiscountApplied(false), DISCOUNT_DURATION_MS);
  }, []);

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0];

  const selectVariant = useCallback((variantId: string) => {
    setSelectedVariantId(variantId);
    setSelectedIsNuskin(false);
  }, []);

  const selectNuskin = useCallback(() => {
    setSelectedIsNuskin(true);
  }, []);

  const openOrderSheet = useCallback((variantId?: string) => {
    if (variantId) selectVariant(variantId);
    setIsOpen(true);

    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      document.getElementById("order-form-desktop")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [selectVariant]);

  const closeOrderSheet = useCallback(() => {
    setIsOpen(false);
  }, []);

  const markOrderCompleted = useCallback(() => {
    setOrderCompleted(true);
  }, []);

  const value = useMemo<OrderSheetContextValue>(
    () => ({
      product,
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
    }),
    [
      product,
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
    ]
  );

  return <OrderSheetContext.Provider value={value}>{children}</OrderSheetContext.Provider>;
}

export function useOrderSheet(): OrderSheetContextValue {
  const ctx = useContext(OrderSheetContext);
  if (!ctx) {
    throw new Error("useOrderSheet debe usarse dentro de OrderSheetProvider");
  }
  return ctx;
}

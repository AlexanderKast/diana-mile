"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Product, ProductVariant } from "@diana-mile/shared/types";

type OrderSheetContextValue = {
  product: Product;
  isOpen: boolean;
  selectedVariantId: string;
  selectedIsNuskin: boolean;
  selectedVariant: ProductVariant | undefined;
  openOrderSheet: (variantId?: string) => void;
  closeOrderSheet: () => void;
  selectVariant: (variantId: string) => void;
  selectNuskin: () => void;
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

  const value = useMemo<OrderSheetContextValue>(
    () => ({
      product,
      isOpen,
      selectedVariantId,
      selectedIsNuskin,
      selectedVariant,
      openOrderSheet,
      closeOrderSheet,
      selectVariant,
      selectNuskin,
    }),
    [
      product,
      isOpen,
      selectedVariantId,
      selectedIsNuskin,
      selectedVariant,
      openOrderSheet,
      closeOrderSheet,
      selectVariant,
      selectNuskin,
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

"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@diana-mile/shared/ui/Button";
import { useOrderSheet } from "@/components/product/OrderSheetContext";

const POPUP_SHOWN_KEY = "milito_popup_descuento_mostrado";
const COUNTDOWN_SECONDS = 5 * 60;
const INACTIVITY_MS = 35000;

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={className}
    >
      <line x1="4" y1="4" x2="16" y2="16" strokeLinecap="round" />
      <line x1="16" y1="4" x2="4" y2="16" strokeLinecap="round" />
    </svg>
  );
}

export function ExitIntentPopup() {
  const {
    isOpen: sheetOpen,
    orderCompleted,
    applyDiscount,
    openOrderSheet,
    pricing,
  } = useOrderSheet();
  const discountPercent = pricing.discountPercent;
  const [visible, setVisible] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const triggeredRef = useRef(false);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sheetOpenRef = useRef(sheetOpen);
  const wasSheetOpenRef = useRef(sheetOpen);

  const show = useRef(() => {
    if (triggeredRef.current) return;
    if (sessionStorage.getItem(POPUP_SHOWN_KEY)) return;
    if (sheetOpenRef.current) return;
    triggeredRef.current = true;
    sessionStorage.setItem(POPUP_SHOWN_KEY, "1");
    setVisible(true);
  }).current;

  useEffect(() => {
    sheetOpenRef.current = sheetOpen;

    // El formulario se cerro sin completar el pedido: es la senal de
    // abandono mas directa que tenemos, mas confiable que el mouseout.
    if (wasSheetOpenRef.current && !sheetOpen && !orderCompleted) {
      show();
    }
    wasSheetOpenRef.current = sheetOpen;
  }, [sheetOpen, orderCompleted, show]);

  useEffect(() => {
    function handleMouseOut(e: MouseEvent) {
      if (e.clientY <= 0) show();
    }

    function resetInactivity() {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = setTimeout(show, INACTIVITY_MS);
    }

    document.addEventListener("mouseout", handleMouseOut);
    window.addEventListener("touchstart", resetInactivity, { passive: true });
    window.addEventListener("scroll", resetInactivity, { passive: true });
    resetInactivity();

    return () => {
      document.removeEventListener("mouseout", handleMouseOut);
      window.removeEventListener("touchstart", resetInactivity);
      window.removeEventListener("scroll", resetInactivity);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [show]);

  useEffect(() => {
    if (!visible) return;
    setSecondsLeft(COUNTDOWN_SECONDS);
    const interval = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [visible]);

  function handleAccept() {
    applyDiscount();
    setVisible(false);
    openOrderSheet();
  }

  function handleDecline() {
    setVisible(false);
  }

  if (!visible) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-carbon/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Oferta especial de descuento"
    >
      <div className="animate-fade-in-up relative w-full max-w-sm rounded-2xl bg-blanco p-6 flex flex-col items-center gap-4 text-center">
        <button
          type="button"
          onClick={handleDecline}
          aria-label="Cerrar"
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center text-ceniza"
        >
          <CloseIcon />
        </button>

        <h2 className="font-display text-2xl text-carbon leading-snug pt-2">
          ¡Espera! Solo por los próximos {minutes}:
          {String(seconds).padStart(2, "0")} minutos
        </h2>
        <p className="text-sm text-carbon-suave">
          Tenemos una oferta exclusiva para ti
        </p>

        <div className="flex flex-col items-center gap-2 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-carbon-suave">
            Obtén un descuento extra en tu pedido
          </p>
          <span className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-dorado bg-lila-suave font-display text-3xl text-morado-oscuro">
            {discountPercent}%
          </span>
        </div>

        <p className="text-sm font-medium text-error">
          Este descuento solo aplica por los próximos {minutes}:
          {String(seconds).padStart(2, "0")} minutos
        </p>

        <Button
          variant="primary"
          type="button"
          onClick={handleAccept}
          className="cta-pulse w-full"
        >
          Completa tu pedido con {discountPercent}% de descuento
        </Button>
        <button
          type="button"
          onClick={handleDecline}
          className="text-sm text-carbon-suave underline underline-offset-2"
        >
          No gracias, deseo perder el descuento
        </button>
      </div>
    </div>
  );
}

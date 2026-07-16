"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const DISMISS_KEY = "milito_install_banner_dismissed_hasta";
const DISMISS_DIAS = 14;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function estaDismisseado(): boolean {
  if (typeof window === "undefined") return true;
  const hasta = window.localStorage.getItem(DISMISS_KEY);
  return hasta !== null && Date.now() < Number(hasta);
}

function dismissear() {
  const hasta = Date.now() + DISMISS_DIAS * 24 * 60 * 60 * 1000;
  window.localStorage.setItem(DISMISS_KEY, String(hasta));
}

function esStandalone(): boolean {
  if (typeof window === "undefined") return true;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // @ts-expect-error -- navigator.standalone es especifico de iOS Safari
    window.navigator.standalone === true
  );
}

function esIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/**
 * Empuja la instalacion de la PWA. No se muestra en la pagina de producto
 * ni en el checkout (no competir con la conversion), ni si ya esta
 * instalada, ni si el usuario ya la cerro en los ultimos 14 dias.
 */
export function InstallBanner() {
  const pathname = usePathname();
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [mostrarIOS, setMostrarIOS] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (esStandalone() || estaDismisseado()) return;

    if (esIOS()) {
      setMostrarIOS(true);
      setVisible(true);
      return;
    }

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
      setVisible(true);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () =>
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  const isProductoDetalle =
    pathname.startsWith("/productos/") && pathname !== "/productos";
  const isCheckout = pathname.startsWith("/pedido/");

  if (!visible || isProductoDetalle || isCheckout) return null;

  async function instalar() {
    if (!promptEvent) return;
    await promptEvent.prompt();
    await promptEvent.userChoice;
    setVisible(false);
    dismissear();
  }

  function cerrar() {
    setVisible(false);
    dismissear();
  }

  return (
    <div className="sticky top-[60px] z-30 flex items-center justify-between gap-3 border-b border-arena bg-crema px-4 py-2.5 text-sm">
      {mostrarIOS ? (
        <p className="text-carbon-suave">
          Instala Milito Life Shop: toca{" "}
          <span className="font-semibold text-carbon">Compartir</span> →{" "}
          <span className="font-semibold text-carbon">
            Añadir a pantalla de inicio
          </span>
          .
        </p>
      ) : (
        <p className="text-carbon-suave">
          Instala la app de Milito Life Shop para acceso rápido.
        </p>
      )}
      <div className="flex shrink-0 items-center gap-3">
        {!mostrarIOS && (
          <button
            type="button"
            onClick={instalar}
            className="rounded-lg bg-dorado-oscuro px-3 py-1.5 text-xs font-semibold text-blanco"
          >
            Instalar
          </button>
        )}
        <button
          type="button"
          onClick={cerrar}
          aria-label="Cerrar"
          className="text-ceniza"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

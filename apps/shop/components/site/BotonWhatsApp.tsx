"use client";

import { usePathname } from "next/navigation";
import { BotonWhatsAppFlotante } from "@diana-mile/shared/ui/WhatsAppFlotante";

const NUMERO = process.env.NEXT_PUBLIC_WHATSAPP_NUMERO;

/**
 * Coloca el boton sin pelearse con lo que ya vive abajo de la pantalla.
 *
 * En movil la tienda ya tiene barra inferior con su pestana de WhatsApp,
 * asi que ahi el flotante sobra y solo taparia contenido. Donde esa barra
 * se esconde —producto y checkout— si aparece, pero por encima del boton
 * de compra: son justo las dos paginas donde a la gente le da por
 * preguntar antes de pagar.
 */
export function BotonWhatsApp() {
  const pathname = usePathname() ?? "/";

  const enProducto =
    pathname.startsWith("/productos/") && pathname !== "/productos";
  const enCheckout = pathname.startsWith("/pedido/");
  const hayBarraInferior = !enProducto && !enCheckout;

  return (
    <BotonWhatsAppFlotante
      numero={NUMERO}
      origen="shop"
      className={
        hayBarraInferior
          ? "hidden md:flex md:bottom-6 md:right-6"
          : // El CTA fijo mide 4rem; el boton se sienta justo encima.
            "bottom-[calc(4rem+0.75rem+env(safe-area-inset-bottom))] right-4 md:bottom-6 md:right-6"
      }
    />
  );
}

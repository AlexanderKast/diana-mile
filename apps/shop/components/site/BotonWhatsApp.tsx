"use client";

import { BotonWhatsAppFlotante } from "@diana-mile/shared/ui/WhatsAppFlotante";


/**
 * Coloca el boton sin pelearse con lo que ya vive abajo de la pantalla.
 *
 * En movil siempre aparece, ademas de la pestana de WhatsApp que ya trae la
 * barra inferior: la pestana es navegacion (queda enterrada entre las
 * otras), el flotante es el atajo de siempre-a-mano. Tanto la barra
 * inferior como el CTA fijo de producto/checkout miden 4rem, asi que el
 * mismo offset lo levanta por encima de cualquiera de los dos.
 */
export function BotonWhatsApp() {
  return (
    <BotonWhatsAppFlotante
      origen="shop"
      className="bottom-[calc(4rem+0.75rem+env(safe-area-inset-bottom))] right-4 md:bottom-6 md:right-6"
    />
  );
}

"use client";

import { useEnlaceWhatsApp } from "@diana-mile/shared/ui/WhatsAppFlotante";

/**
 * Boton de WhatsApp colocable del constructor visual. Usa el enlace
 * contextual del sitio (mensaje con el nombre del producto) y registra el
 * clic en whatsapp_clics — el rotador lo atribuye a la variante igual que
 * el boton flotante.
 */
export function BotonWhatsAppBloque({ etiqueta }: { etiqueta: string }) {
  const { href, alHacerClic } = useEnlaceWhatsApp();
  if (!href) return null;

  return (
    <div className="flex justify-center px-6 py-4">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        onClick={alHacerClic}
        className="inline-flex items-center justify-center gap-2 min-h-[44px] px-8 rounded-lg bg-[#25D366] text-blanco text-base font-semibold tracking-wide shadow-[0_4px_14px_rgba(37,211,102,0.35)] transition-all duration-200 hover:brightness-105 hover:scale-[1.03] active:scale-[0.97]"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.76.46 3.48 1.34 5L2 22l5.14-1.35a10 10 0 0 0 4.9 1.25h.01c5.52 0 10-4.48 10-10s-4.48-9.9-10.01-9.9Zm0 18.1h-.01a8.3 8.3 0 0 1-4.23-1.16l-.3-.18-3.05.8.82-2.97-.2-.3a8.26 8.26 0 0 1-1.27-4.4c0-4.58 3.73-8.3 8.31-8.3 2.22 0 4.3.87 5.87 2.44a8.24 8.24 0 0 1 2.43 5.87c0 4.58-3.73 8.3-8.3 8.3Zm4.55-6.22c-.25-.13-1.47-.72-1.7-.8-.23-.08-.4-.13-.56.13-.17.25-.65.8-.8.97-.14.17-.29.19-.54.06-.25-.13-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.38-.43.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.23.89 2.42 1.02 2.58.13.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.29Z" />
        </svg>
        {etiqueta}
      </a>
    </div>
  );
}

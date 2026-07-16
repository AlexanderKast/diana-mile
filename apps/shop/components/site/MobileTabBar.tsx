"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@diana-mile/shared/utils";

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 11.5L12 4l8 7.5" />
      <path d="M6 9.5V20h12V9.5" />
    </svg>
  );
}

function CategoriasIcon({ className }: { className?: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function ProductosIcon({ className }: { className?: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path
        d="M6.5 8h11l.9 11.5a1.8 1.8 0 0 1-1.8 1.9H7.4a1.8 1.8 0 0 1-1.8-1.9L6.5 8z"
        strokeLinejoin="round"
      />
      <path d="M8.7 8V6a3.3 3.3 0 0 1 6.6 0v2" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="none"
      className={className}
    >
      <path
        fill="currentColor"
        d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.76.46 3.48 1.34 5L2 22l5.14-1.35a10 10 0 0 0 4.9 1.25h.01c5.52 0 10-4.48 10-10s-4.48-9.9-10.01-9.9Zm0 18.1h-.01a8.3 8.3 0 0 1-4.23-1.16l-.3-.18-3.05.8.82-2.97-.2-.3a8.26 8.26 0 0 1-1.27-4.4c0-4.58 3.73-8.3 8.31-8.3 2.22 0 4.3.87 5.87 2.44a8.24 8.24 0 0 1 2.43 5.87c0 4.58-3.73 8.3-8.3 8.3Zm4.55-6.22c-.25-.13-1.47-.72-1.7-.8-.23-.08-.4-.13-.56.13-.17.25-.65.8-.8.97-.14.17-.29.19-.54.06-.25-.13-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.38-.43.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.23.89 2.42 1.02 2.58.13.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.29Z"
      />
    </svg>
  );
}

const WHATSAPP_NUMERO = process.env.NEXT_PUBLIC_WHATSAPP_NUMERO;
const whatsappHref = WHATSAPP_NUMERO
  ? `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent("Hola, quiero conocer los productos Milito Life Shop")}`
  : null;

/**
 * Bottom tab bar movil (patron "app nativa" tipo Shein/Instagram). Se
 * oculta por completo en la pagina de producto y en el checkout, donde
 * ya existe un CTA fijo de compra/pedido en la misma zona de pantalla —
 * nunca deben convivir dos elementos fijos inferiores a la vez.
 */
export function MobileTabBar() {
  const pathname = usePathname();

  const isProductoDetalle =
    pathname.startsWith("/productos/") && pathname !== "/productos";
  const isCheckout = pathname.startsWith("/pedido/");

  if (isProductoDetalle || isCheckout) return null;

  const tabs = [
    { href: "/", label: "Inicio", Icon: HomeIcon, active: pathname === "/" },
    {
      href: "/categorias",
      label: "Categorías",
      Icon: CategoriasIcon,
      active: pathname.startsWith("/categorias"),
    },
    {
      href: "/productos",
      label: "Productos",
      Icon: ProductosIcon,
      active: pathname.startsWith("/productos"),
    },
  ];

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch border-t border-arena bg-blanco/95 backdrop-blur"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Navegación principal"
      >
        {tabs.map(({ href, label, Icon, active }) => (
          <Link
            key={href}
            href={href}
            className={cx(
              "flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px]",
              active ? "text-dorado-oscuro" : "text-ceniza",
            )}
          >
            <Icon />
            {label}
          </Link>
        ))}
        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] text-[#25D366]"
          >
            <WhatsAppIcon />
            WhatsApp
          </a>
        )}
      </nav>
      <div className="h-16 md:hidden" />
    </>
  );
}

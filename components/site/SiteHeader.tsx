import Link from "next/link";

const WHATSAPP_NUMERO = process.env.NEXT_PUBLIC_WHATSAPP_NUMERO;
const whatsappHref = WHATSAPP_NUMERO
  ? `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent("Hola, quiero conocer los productos Milito Life Shop")}`
  : null;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-arena/80 bg-blanco/95 backdrop-blur">
      <div className="mx-auto flex min-h-[60px] max-w-6xl items-center justify-between gap-4 px-5 md:px-6">
        <Link href="/" className="font-display text-2xl text-carbon" aria-label="Milito Life Shop inicio">
          Milito Life Shop
        </Link>

        <nav className="flex items-center gap-1 text-sm text-carbon-suave">
          <Link href="/productos" className="rounded-[2px] px-3 py-2 transition-colors hover:bg-crema hover:text-carbon">
            Productos
          </Link>
          <Link href="/link" className="hidden rounded-[2px] px-3 py-2 transition-colors hover:bg-crema hover:text-carbon sm:inline-flex">
            Redes
          </Link>
          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-[2px] bg-carbon px-3 py-2 text-blanco transition-colors hover:bg-carbon-suave"
            >
              WhatsApp
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}

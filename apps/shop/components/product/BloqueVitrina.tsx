import type { MotivoNoCod, Product } from "@diana-mile/shared/types";
import { formatCOP } from "@diana-mile/shared/utils";
import { enlaceConTexto } from "@diana-mile/shared/whatsapp/mensajes";

/**
 * Bloque de compra de un producto de VITRINA: los que no se pueden pedir
 * contraentrega (kits de ticket alto, productos de solo suscripcion,
 * accesorios que viajan con su equipo).
 *
 * Es un componente de servidor a proposito. No monta el CODForm ni abre el
 * OrderSheet por ningun camino: en estas paginas ese codigo directamente no
 * llega al navegador.
 *
 * Tono: informa, no asusta. Fondo crema y borde dorado, sin rojo ni signos
 * de advertencia — la estetica Milito es serena y esto no es un error de la
 * clienta, es la forma normal de comprar estos productos.
 */

const EXPLICACION: Record<MotivoNoCod, string> = {
  ticket_alto: "Por su valor, coordinamos la entrega contigo",
  solo_suscripcion: "Disponible en modalidad de suscripción",
  accesorio: "Se envía junto con tu equipo",
};

function EscudoIcon({ className }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M10 2.5 4.5 4.8v4.4c0 3.3 2.3 6.4 5.5 7.3 3.2-.9 5.5-4 5.5-7.3V4.8L10 2.5Z"
        strokeLinejoin="round"
      />
      <path d="m7.6 9.9 1.7 1.7 3.1-3.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.76.46 3.48 1.34 5L2 22l5.14-1.35a10 10 0 0 0 4.9 1.25h.01c5.52 0 10-4.48 10-10s-4.48-9.9-10.01-9.9Zm0 18.1h-.01a8.3 8.3 0 0 1-4.23-1.16l-.3-.18-3.05.8.82-2.97-.2-.3a8.26 8.26 0 0 1-1.27-4.4c0-4.58 3.73-8.3 8.31-8.3 2.22 0 4.3.87 5.87 2.44a8.24 8.24 0 0 1 2.43 5.87c0 4.58-3.73 8.3-8.3 8.3Zm4.55-6.22c-.25-.13-1.47-.72-1.7-.8-.23-.08-.4-.13-.56.13-.17.25-.65.8-.8.97-.14.17-.29.19-.54.06-.25-.13-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.38-.43.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.23.89 2.42 1.02 2.58.13.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.29Z" />
    </svg>
  );
}

function ExternoIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={className}
      aria-hidden="true"
    >
      <path d="M8 4.5H5.5A1.5 1.5 0 0 0 4 6v8.5A1.5 1.5 0 0 0 5.5 16H14a1.5 1.5 0 0 0 1.5-1.5V12" strokeLinecap="round" />
      <path d="M11.5 4h4.5v4.5M16 4l-6.5 6.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Mensaje con el que llega a WhatsApp. Nombra el producto y lleva el codigo
 * oficial: con eso Diana ya sabe exactamente cual es sin volver a preguntar.
 */
export function mensajeVitrina(product: Product): string {
  const sku = product.skuOficial ? ` (código ${product.skuOficial})` : "";
  return `Hola Milito, me interesa el ${product.title}${sku} y quiero saber cómo lo puedo adquirir.`;
}

/** El enlace de WhatsApp del producto, o null si no hay un numero utilizable. */
export function hrefVitrina(
  product: Product,
  numeroWhatsapp: string | null,
): string | null {
  return enlaceConTexto(numeroWhatsapp, mensajeVitrina(product));
}

export function BloqueVitrina({
  product,
  numeroWhatsapp,
}: {
  product: Product;
  numeroWhatsapp: string | null;
}) {
  const precio = product.variants[0]?.price ?? product.price;
  const explicacion = product.motivoNoCod
    ? EXPLICACION[product.motivoNoCod]
    : "Escríbele a Milito y coordinan juntas la entrega";
  const hrefWhatsapp = hrefVitrina(product, numeroWhatsapp);
  const urlOficial = product.metafields.nuskinDirectUrl;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-1.5 md:items-start">
        <span className="font-display text-[38px] font-black leading-none text-carbon">
          {formatCOP(precio)}
        </span>
        <div className="linea-dorada w-14" />
      </div>

      <div className="flex gap-3 rounded-2xl border border-dorado/50 bg-crema px-5 py-4">
        <EscudoIcon className="mt-0.5 shrink-0 text-dorado-oscuro" />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-carbon">
            Este producto se gestiona de forma personalizada
          </p>
          <p className="text-sm text-carbon-suave">{explicacion}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {hrefWhatsapp && (
          <a
            href={hrefWhatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-morado px-6 text-base font-bold tracking-wide text-blanco shadow-[0_6px_20px_rgba(107,78,140,0.35)] transition-all duration-200 hover:bg-morado-oscuro hover:scale-[1.02] active:scale-[0.97]"
          >
            <WhatsAppIcon />
            Hablar con Milito
          </a>
        )}

        {urlOficial && (
          <a
            href={urlOficial}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg border border-dorado-oscuro px-6 text-sm font-semibold tracking-wide text-dorado-oscuro transition-colors duration-200 hover:bg-crema"
          >
            Ver en el canal oficial
            <ExternoIcon />
          </a>
        )}
      </div>

      {product.skuOficial && (
        <p className="text-center text-[11px] text-ceniza md:text-left">
          Código oficial Nu Skin: {product.skuOficial}
        </p>
      )}
    </div>
  );
}

/**
 * Equivalente de ProductPurchaseFlow para vitrina: la barra fija de movil.
 * Es un enlace, no un boton — no hay estado que abrir, y asi la pagina de un
 * producto de vitrina no necesita nada del OrderSheet.
 */
export function BarraVitrinaMovil({
  product,
  numeroWhatsapp,
}: {
  product: Product;
  numeroWhatsapp: string | null;
}) {
  const href = hrefVitrina(product, numeroWhatsapp);
  if (!href) return null;

  return (
    <>
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-center bg-morado text-blanco shadow-[0_-6px_24px_rgba(107,78,140,0.35)] md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-full w-full items-center justify-center gap-2 text-lg font-bold tracking-wide"
        >
          <WhatsAppIcon />
          Hablar con Milito
        </a>
      </div>
      <div className="h-16 md:hidden" />
    </>
  );
}

/** Banda de cierre para vitrina — reemplaza al SocialCTABand de contraentrega. */
export function BandaVitrina({
  product,
  numeroWhatsapp,
  title,
}: {
  product: Product;
  numeroWhatsapp: string | null;
  title?: string;
}) {
  const href = hrefVitrina(product, numeroWhatsapp);
  if (!href) return null;

  return (
    <div className="flex flex-col items-center gap-4 bg-lila-suave px-6 py-6 text-center">
      {title && (
        <p className="max-w-sm font-display text-xl text-carbon">{title}</p>
      )}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-[48px] w-full max-w-sm items-center justify-center gap-2 rounded-lg bg-morado px-6 text-base font-semibold tracking-wide text-blanco transition-all duration-200 hover:bg-morado-oscuro hover:scale-[1.02] active:scale-[0.97]"
      >
        <WhatsAppIcon />
        Hablar con Milito
      </a>
    </div>
  );
}

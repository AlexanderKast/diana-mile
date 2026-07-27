"use client";

import { useEnlaceWhatsApp } from "@diana-mile/shared/ui/WhatsAppFlotante";

const NUMERO = process.env.NEXT_PUBLIC_WHATSAPP_NUMERO;

/**
 * El acceso a WhatsApp del header y de la barra movil.
 *
 * Es cliente y no server component porque el mensaje depende de la pagina
 * en que esta la persona, y eso solo se sabe en el navegador. Antes los dos
 * mandaban el mismo "hola, quiero conocer los productos" desde cualquier
 * parte, asi que una consulta desde la ficha de un producto llegaba igual
 * de vacia que una desde el inicio.
 */
export function EnlaceWhatsApp({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { href, mensaje, alHacerClic } = useEnlaceWhatsApp(NUMERO, "shop");
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={alHacerClic}
      aria-label={`Escribir por WhatsApp: ${mensaje}`}
      className={className}
    >
      {children}
    </a>
  );
}

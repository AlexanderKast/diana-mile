import Link from "next/link";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

export type Miga = { label: string; href?: string };

/**
 * Ruta de navegacion ("migas de pan").
 *
 * La tienda no tenia ninguna: desde una categoria abierta en movil, la unica
 * via de vuelta al catalogo era el boton atras del navegador o la barra
 * inferior, y quien llega de Google o de un anuncio cae en la categoria sin
 * saber que hay un nivel arriba.
 *
 * Emite tambien el `BreadcrumbList` de schema.org, que es lo que Google usa
 * para mostrar la ruta en el resultado de busqueda en vez de la URL cruda.
 * Sin `NEXT_PUBLIC_SITE_URL` no se emite: un BreadcrumbList con URLs
 * relativas es dato invalido, y es peor que no tenerlo.
 */
export function Migas({ items }: { items: Miga[] }) {
  const jsonLd = SITE_URL
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.label,
          ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
        })),
      }
    : null;

  return (
    <>
      <nav aria-label="Ruta" className="text-[11.5px] text-carbon-suave">
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
          {items.map((item, i) => (
            <li key={item.label} className="flex items-center gap-1.5">
              {item.href ? (
                <Link
                  href={item.href}
                  className="transition-colors hover:text-dorado-oscuro"
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" className="text-carbon">
                  {item.label}
                </span>
              )}
              {i < items.length - 1 ? (
                <span aria-hidden className="text-ceniza">
                  ›
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </nav>

      {jsonLd ? (
        <script
          type="application/ld+json"
          // Los nombres salen de los titulos de las collections de Shopify, y
          // dentro de un <script> el navegador corta en el primer "</script>"
          // literal: JSON.stringify escapa comillas pero no "<". Escapando "<"
          // como < el JSON sigue siendo valido y no hay forma de salir de
          // la etiqueta desde el Admin de Shopify.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      ) : null}
    </>
  );
}

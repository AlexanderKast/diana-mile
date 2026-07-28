import Image from "next/image";
import Link from "next/link";
import type { Collection, Product } from "@diana-mile/shared/types";
import { formatCOP, cx } from "@diana-mile/shared/utils";

/**
 * Tarjeta de categoria con datos, para la pagina /categorias.
 *
 * `CategoryCard` —la del home— es solo foto con el titulo encima. Sirve para
 * un bloque de "explora por categoria" en medio de otra pagina, pero como
 * unidad de una pagina que ES el catalogo se queda corta: seis fotos con seis
 * titulos y seis "Explorar →" no dicen que hay dentro, cuantos productos son,
 * ni desde cuanto. Y los titulos sobre foto clara ("Kits de inicio",
 * "Bienestar por dentro") quedaban al limite de contraste.
 *
 * Aca el texto vive en un panel blanco debajo de la foto: contraste
 * garantizado, y espacio para la promesa de la categoria y los datos que de
 * verdad ayudan a elegir.
 *
 * Los numeros salen de `collection.products`, que `getCollections()` ya trae
 * hidratado — no hay una consulta extra por esto.
 */

/** Piso de precio de un producto, igual que en `ProductCard`. */
function precioDesde(product: Product): number {
  if (product.variants.length === 0) return parseFloat(product.price);
  return product.variants.reduce(
    (min, variant) => Math.min(min, parseFloat(variant.price)),
    parseFloat(product.variants[0].price),
  );
}

export function CategoryPanelCard({
  collection,
  destacada = false,
  prioridad = false,
}: {
  collection: Collection;
  /** Ocupa el ancho completo con foto apaisada. Para la primera de la lista. */
  destacada?: boolean;
  /** `priority` de la imagen. Solo para la que entra sobre el pliegue. */
  prioridad?: boolean;
}) {
  const productos = collection.products.length;

  const precios = collection.products
    .map(precioDesde)
    .filter((n) => Number.isFinite(n) && n > 0);
  const desde = precios.length > 0 ? Math.min(...precios) : null;

  // Una categoria mezcla contraentrega y vitrina, asi que el sello dice que
  // "hay" productos contraentrega, no que todos lo sean. Prometer pago al
  // recibir en "Kits de inicio" seria mentira en la mayoria de sus productos.
  const cod = collection.products.filter((p) => p.codDisponible).length;

  const promesa = collection.landingContent?.tagline || collection.description;

  return (
    <Link
      href={`/categorias/${collection.handle}`}
      className={cx(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-arena bg-blanco",
        "shadow-[0_1px_3px_rgba(26,23,20,0.06)] transition-shadow duration-300",
        "hover:shadow-[0_10px_28px_rgba(26,23,20,0.10)]",
      )}
    >
      <div
        className={cx(
          "relative w-full overflow-hidden bg-arena",
          destacada ? "aspect-[16/10] sm:aspect-[21/9]" : "aspect-[4/5]",
        )}
      >
        {collection.image ? (
          <Image
            src={collection.image.url}
            alt={collection.image.altText ?? collection.title}
            fill
            priority={prioridad}
            className="object-cover transition-transform duration-[450ms] group-hover:scale-[1.04]"
            sizes={
              destacada
                ? "(max-width: 1024px) 100vw, 66vw"
                : "(max-width: 640px) 50vw, 33vw"
            }
          />
        ) : null}

        {cod > 0 ? (
          <span className="absolute left-2.5 top-2.5 rounded-md bg-lila-suave/95 px-2 py-0.5 text-[9.5px] font-semibold text-morado-oscuro backdrop-blur-sm">
            {cod === productos ? "Todo contraentrega" : "Con contraentrega"}
          </span>
        ) : null}
      </div>

      <div
        className={cx(
          "flex flex-1 flex-col gap-1.5 p-3.5 sm:p-4",
          destacada && "sm:gap-2 sm:p-6",
        )}
      >
        <h3
          className={cx(
            "font-display leading-tight text-carbon",
            destacada
              ? "text-[20px] sm:text-[26px]"
              : "text-[16px] sm:text-[19px]",
          )}
        >
          {collection.title}
        </h3>

        {promesa ? (
          <p
            className={cx(
              "leading-relaxed text-carbon-suave",
              destacada
                ? "text-[13px] sm:max-w-xl sm:text-[14.5px]"
                : "line-clamp-2 text-[12.5px] sm:text-[13px]",
            )}
          >
            {promesa}
          </p>
        ) : null}

        {/* Cada dato en su propio span y sin separador de texto: con
            "N productos · desde $X" dentro de una sola cadena, en una tarjeta
            de ~170px el precio se iba a la linea siguiente y el "·" quedaba
            colgando al final de la primera. `justify-between` los separa
            cuando caben en la fila y los apila limpio cuando no.

            El "Ver →" solo va en la destacada: la tarjeta entera es el enlace,
            asi que repetirlo seis veces era decoracion que competia con el
            dato de precio por el poco ancho que hay. */}
        <div className="mt-auto flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 border-t border-arena/70 pt-2.5 text-[11.5px] text-carbon-suave sm:text-[12.5px]">
          <span className="whitespace-nowrap">
            {productos} {productos === 1 ? "producto" : "productos"}
          </span>

          {desde !== null ? (
            <span className="whitespace-nowrap">
              desde{" "}
              <span className="font-semibold text-dorado-oscuro">
                {formatCOP(desde)}
              </span>
            </span>
          ) : null}

          {destacada ? (
            <span className="shrink-0 font-medium text-carbon transition-colors group-hover:text-dorado-oscuro sm:text-[13px]">
              Ver la categoría →
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

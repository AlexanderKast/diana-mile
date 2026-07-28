import Image from "next/image";
import Link from "next/link";
import { Product } from "@diana-mile/shared/types";
import { formatCOP, cx } from "@diana-mile/shared/utils";

/**
 * Tarjeta de producto.
 *
 * Ya no lleva un falso boton "Ver producto" dentro. La tarjeta entera es el
 * enlace, asi que ese bloque de 44px de alto no agregaba un destino nuevo:
 * en movil, dentro de una tarjeta de ~170px de ancho, le robaba a la foto —
 * lo unico que de verdad vende— casi un tercio del alto. En su lugar el
 * precio y el "Ver →" comparten una sola fila.
 *
 * `h-full` + `mt-auto` para que en carrusel y en reja todas las tarjetas
 * midan igual aunque los titulos ocupen una o dos lineas.
 */
export function ProductCard({ product }: { product: Product }) {
  const image = product.images[0];

  const minPrice =
    product.variants.length > 0
      ? product.variants.reduce(
          (min, variant) => Math.min(min, parseFloat(variant.price)),
          parseFloat(product.variants[0].price),
        )
      : parseFloat(product.price);

  const badgeLabel = product.title.includes("Epoch") ? "Epoch®" : null;

  return (
    <Link
      href={`/productos/${product.handle}`}
      className={cx(
        "group flex h-full flex-col gap-2.5 rounded-2xl border border-arena bg-blanco p-2.5",
        "shadow-[0_1px_3px_rgba(26,23,20,0.06)] transition-shadow duration-300",
        "hover:shadow-[0_8px_24px_rgba(26,23,20,0.10)] sm:gap-3 sm:p-3",
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-arena">
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? product.title}
            fill
            className="object-cover transition-transform duration-[450ms] group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 72vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : null}

        {badgeLabel ? (
          <span className="absolute left-2 top-2 rounded-md bg-blanco/90 px-1.5 py-0.5 text-[9.5px] font-semibold text-carbon backdrop-blur-sm">
            {badgeLabel}
          </span>
        ) : null}

        {/* Como se compra este producto, visible antes de entrar. Discreto a
            proposito: informa, no compite con la foto. */}
        <span
          className={cx(
            "absolute right-2 top-2 rounded-md px-1.5 py-0.5 text-[9.5px] font-semibold backdrop-blur-sm",
            product.codDisponible
              ? "bg-lila-suave/95 text-morado-oscuro"
              : "bg-crema/95 text-dorado-oscuro",
          )}
        >
          {product.codDisponible ? "Contraentrega" : "Bajo pedido"}
        </span>
      </div>

      <h3 className="line-clamp-2 font-display text-[15px] leading-snug text-carbon sm:text-[17px]">
        {product.title}
      </h3>

      <div className="mt-auto flex items-baseline justify-between gap-2 border-t border-arena/70 pt-2.5">
        <span className="font-display text-[17px] font-semibold leading-none text-dorado-oscuro sm:text-[19px]">
          {/* "Desde" solo cuando hay varias presentaciones y el precio de
              verdad es un piso; con una sola variante era una imprecision. */}
          {product.variants.length > 1 ? (
            <span className="mr-1 font-sans text-[11px] font-normal text-carbon-suave">
              Desde
            </span>
          ) : null}
          {formatCOP(minPrice)}
        </span>
        <span className="text-[12px] font-medium text-carbon transition-colors group-hover:text-dorado-oscuro sm:text-[13px]">
          Ver →
        </span>
      </div>
    </Link>
  );
}

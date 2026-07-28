import Image from "next/image";
import Link from "next/link";
import { Collection } from "@diana-mile/shared/types";

/**
 * Tarjeta de categoria.
 *
 * El degradado era `from-carbon/70 via-carbon/10` — arrancaba a subir muy
 * abajo, asi que un titulo de dos lineas (frecuente en movil, donde la
 * tarjeta mide ~170px) quedaba con la segunda linea sobre foto clara y sin
 * contraste. Ahora el negro llega al 85% y sube antes; la `sombra-texto`
 * cubre el caso de una foto casi blanca justo detras del titulo.
 *
 * `aspect-[4/5]` en movil y `[3/4]` desde `sm`: mas ancho por tarjeta donde
 * hay sitio, sin estirar el alto de la reja.
 */
export function CategoryCard({ collection }: { collection: Collection }) {
  return (
    <Link
      href={`/categorias/${collection.handle}`}
      className="group relative flex aspect-[4/5] w-full overflow-hidden rounded-2xl bg-arena sm:aspect-[3/4]"
    >
      {collection.image ? (
        <Image
          src={collection.image.url}
          alt={collection.image.altText ?? collection.title}
          fill
          className="object-cover transition-transform duration-[450ms] group-hover:scale-[1.04]"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      ) : null}

      <div className="absolute inset-0 bg-gradient-to-t from-carbon/85 via-carbon/35 to-carbon/0" />

      <div className="relative mt-auto p-3.5 sm:p-5">
        <h3 className="sombra-texto font-display text-[17px] leading-tight text-blanco sm:text-[20px] lg:text-[22px]">
          {collection.title}
        </h3>
        <span className="mt-1 inline-block text-[11px] text-blanco/85 transition-colors group-hover:text-dorado sm:text-xs">
          Explorar →
        </span>
      </div>
    </Link>
  );
}

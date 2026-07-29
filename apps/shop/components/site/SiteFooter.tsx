import Link from "next/link";
import { getCollections } from "@/lib/shopify";
import { EnlaceWhatsApp } from "@/components/site/EnlaceWhatsApp";

const LINKTREE_URL = process.env.NEXT_PUBLIC_LINKTREE_URL || "/";

/**
 * Pie del sitio.
 *
 * Antes era una linea de marca y, al lado, los nueve enlaces sueltos —
 * Productos, las seis categorias, Mi cuenta y Redes— en un solo `flex-wrap`.
 * En movil eso se partia en tres renglones de texto gris del mismo tamaño,
 * sin titulos ni orden: no se distinguia una categoria de un enlace de
 * cuenta, y el pie parecia el sobrante de la pagina en vez de su cierre.
 *
 * Ahora son columnas con encabezado, y una banda inferior con lo legal. Los
 * enlaces van en `carbon-suave`: en `ceniza` (#9a928a sobre blanco) el
 * contraste es 2.9:1 y a 14px no pasa WCAG AA.
 *
 * No se inventan enlaces: la tienda no tiene paginas de terminos ni de
 * privacidad todavia, asi que el pie no finge tenerlas. Cuando existan, van
 * en la banda inferior.
 */
export async function SiteFooter() {
  const collections = await getCollections();
  const año = new Date().getFullYear();

  return (
    <footer id="sitio-footer" className="border-t border-arena bg-blanco px-5 pb-10 pt-12 sm:px-6 sm:pt-14">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-x-6 gap-y-9 sm:gap-x-10 lg:grid-cols-4">
          {/* Marca: ocupa el ancho completo en movil para que el nombre no
              compita con las listas de enlaces. */}
          <div className="col-span-2">
            <p className="font-display text-[22px] leading-none text-carbon sm:text-[26px]">
              Milito Life Shop
            </p>
            <div className="linea-dorada mt-4 w-12" />
            <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-carbon-suave">
              Bienestar, piel y cuidado personal. Nu Skin y otras marcas
              seleccionadas por Milito, siempre producto original.
            </p>
          </div>

          <nav aria-labelledby="pie-categorias">
            <h2
              id="pie-categorias"
              className="text-[10px] font-semibold uppercase tracking-[0.16em] text-carbon"
            >
              Categorías
            </h2>
            <ul className="mt-4 flex flex-col gap-2.5">
              {collections.map((collection) => (
                <li key={collection.id}>
                  <Link
                    href={`/categorias/${collection.handle}`}
                    className="text-[13.5px] text-carbon-suave transition-colors hover:text-dorado-oscuro"
                  >
                    {collection.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="pie-tienda">
            <h2
              id="pie-tienda"
              className="text-[10px] font-semibold uppercase tracking-[0.16em] text-carbon"
            >
              La tienda
            </h2>
            <ul className="mt-4 flex flex-col gap-2.5 text-[13.5px] text-carbon-suave">
              <li>
                <Link
                  href="/productos"
                  className="transition-colors hover:text-dorado-oscuro"
                >
                  Todos los productos
                </Link>
              </li>
              <li>
                <Link
                  href="/categorias"
                  className="transition-colors hover:text-dorado-oscuro"
                >
                  Explorar por categoría
                </Link>
              </li>
              <li>
                <Link
                  href="/cuenta"
                  className="transition-colors hover:text-dorado-oscuro"
                >
                  Mi cuenta
                </Link>
              </li>
              <li>
                <Link
                  href="/cuenta/pedidos"
                  className="transition-colors hover:text-dorado-oscuro"
                >
                  Mis pedidos
                </Link>
              </li>
              <li>
                <Link
                  href={LINKTREE_URL}
                  className="transition-colors hover:text-dorado-oscuro"
                >
                  Redes de Milito
                </Link>
              </li>
              <li>
                <EnlaceWhatsApp className="transition-colors hover:text-dorado-oscuro">
                  Escribir por WhatsApp
                </EnlaceWhatsApp>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-arena pt-6 text-[11.5px] leading-relaxed text-carbon-suave sm:mt-12 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
          <p>© {año} Milito Life Shop</p>
          <p className="max-w-lg sm:text-right">
            Negocio independiente. Nu Skin® y las marcas de sus productos
            pertenecen a Nu Skin Enterprises, Inc.; las demás marcas, a sus
            respectivos titulares.
          </p>
        </div>
      </div>
    </footer>
  );
}

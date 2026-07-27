"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Product } from "@diana-mile/shared/types";
import { cx } from "@diana-mile/shared/utils";
import { ProductCard } from "@/components/product/ProductCard";

/**
 * Catalogo con filtros. Todo el filtrado ocurre en cliente sobre el arreglo
 * que ya trajo el servidor — no hay llamadas nuevas a la API.
 *
 * El filtro elegido viaja en la URL (?compra=cod&linea=Pharmanex) para que
 * Diana pueda mandar por WhatsApp "mira los de contraentrega" con un enlace
 * que abre exactamente esa vista.
 */

type FiltroCompra = "todos" | "cod" | "vitrina";

const FILTROS_COMPRA: { valor: FiltroCompra; etiqueta: string }[] = [
  { valor: "todos", etiqueta: "Todos" },
  { valor: "cod", etiqueta: "Contraentrega" },
  { valor: "vitrina", etiqueta: "Bajo pedido" },
];

function precioMinimo(product: Product): number {
  if (product.variants.length === 0) return parseFloat(product.price);
  return product.variants.reduce(
    (min, v) => Math.min(min, parseFloat(v.price)),
    parseFloat(product.variants[0].price),
  );
}

/**
 * Orden por defecto: primero lo que se puede pedir contraentrega —que es lo
 * que la mayoria viene buscando— y dentro de cada grupo de menor a mayor
 * precio, para que la entrada al catalogo no sea un kit de seis millones.
 */
function ordenarCatalogo(productos: Product[]): Product[] {
  return [...productos].sort((a, b) => {
    if (a.codDisponible !== b.codDisponible) return a.codDisponible ? -1 : 1;
    return precioMinimo(a) - precioMinimo(b);
  });
}

export function CatalogoFiltrado({ productos }: { productos: Product[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const compraParam = searchParams.get("compra");
  const compra: FiltroCompra = FILTROS_COMPRA.some(
    (f) => f.valor === compraParam,
  )
    ? (compraParam as FiltroCompra)
    : "todos";
  const lineaParam = searchParams.get("linea");

  // Las lineas salen de los datos, no de una lista escrita a mano: si Diana
  // agrega una linea nueva en Shopify, aparece aqui sola.
  const lineas = useMemo(() => {
    const unicas = new Set<string>();
    for (const p of productos) {
      if (p.linea) unicas.add(p.linea);
    }
    return Array.from(unicas).sort((a, b) => a.localeCompare(b, "es"));
  }, [productos]);

  const linea = lineaParam && lineas.includes(lineaParam) ? lineaParam : null;

  const ordenados = useMemo(() => ordenarCatalogo(productos), [productos]);

  const visibles = useMemo(
    () =>
      ordenados.filter((p) => {
        if (compra === "cod" && !p.codDisponible) return false;
        if (compra === "vitrina" && p.codDisponible) return false;
        if (linea && p.linea !== linea) return false;
        return true;
      }),
    [ordenados, compra, linea],
  );

  const actualizarFiltro = useCallback(
    (clave: "compra" | "linea", valor: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (valor === null) {
        params.delete(clave);
      } else {
        params.set(clave, valor);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  const limpiarFiltros = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  const hayFiltros = compra !== "todos" || linea !== null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <FilaFiltros aria-label="Filtrar por forma de compra">
          {FILTROS_COMPRA.map((f) => (
            <Chip
              key={f.valor}
              activo={compra === f.valor}
              onClick={() =>
                actualizarFiltro("compra", f.valor === "todos" ? null : f.valor)
              }
            >
              {f.etiqueta}
            </Chip>
          ))}
        </FilaFiltros>

        {lineas.length > 0 && (
          <FilaFiltros aria-label="Filtrar por línea">
            <Chip activo={linea === null} onClick={() => actualizarFiltro("linea", null)}>
              Todas las líneas
            </Chip>
            {lineas.map((l) => (
              <Chip
                key={l}
                activo={linea === l}
                onClick={() => actualizarFiltro("linea", l)}
              >
                {l}
              </Chip>
            ))}
          </FilaFiltros>
        )}
      </div>

      <p className="px-6 text-xs text-ceniza">
        {visibles.length}{" "}
        {visibles.length === 1 ? "producto" : "productos"}
      </p>

      {visibles.length === 0 ? (
        <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
          <p className="font-display text-xl text-carbon">
            Nada por aquí con ese filtro
          </p>
          <p className="max-w-xs text-sm text-carbon-suave">
            Prueba con otra línea o mira el catálogo completo.
          </p>
          <button
            type="button"
            onClick={limpiarFiltros}
            className="flex min-h-[48px] items-center justify-center rounded-lg border border-carbon px-6 text-sm font-medium tracking-wide text-carbon transition-colors duration-200 hover:bg-crema"
          >
            Ver todo el catálogo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 px-6 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {visibles.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {hayFiltros && visibles.length > 0 && (
        <div className="flex justify-center px-6">
          <button
            type="button"
            onClick={limpiarFiltros}
            className="flex min-h-[48px] items-center justify-center px-6 text-sm text-ceniza underline transition-colors hover:text-carbon"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}

function FilaFiltros({
  children,
  ...props
}: {
  children: React.ReactNode;
  "aria-label": string;
}) {
  return (
    <div
      role="group"
      className="flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      {...props}
    >
      {children}
    </div>
  );
}

function Chip({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={cx(
        "flex min-h-[44px] shrink-0 items-center whitespace-nowrap rounded-full border px-4 text-sm transition-colors duration-200",
        activo
          ? "border-morado bg-morado text-blanco"
          : "border-arena bg-blanco text-carbon-suave hover:bg-crema",
      )}
    >
      {children}
    </button>
  );
}

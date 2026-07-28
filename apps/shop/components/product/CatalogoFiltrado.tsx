"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Product } from "@diana-mile/shared/types";
import { cx } from "@diana-mile/shared/utils";
import { ProductCard } from "@/components/product/ProductCard";

/**
 * Catalogo con busqueda, orden y filtros. Todo ocurre en cliente sobre el
 * arreglo que ya trajo el servidor — no hay llamadas nuevas a la API.
 *
 * Lo que se elige viaja en la URL (?q=lumispa&compra=cod&orden=precio-asc)
 * para que Milito pueda mandar por WhatsApp "mira los de contraentrega" con un
 * enlace que abre exactamente esa vista.
 *
 * POR QUE HAY BUSCADOR
 * El catalogo pasó de un puñado de productos a casi cuarenta publicados, y
 * mas de la mitad son variaciones de nombre larguisimo de la misma linea
 * ("ageLOC Tru Face Line Corrector", "...Essence Ultra", "...Uplifting Rich
 * Cream", y los repuestos de cada uno). Sin un campo de busqueda, encontrar
 * uno concreto era bajar por veinte tarjetas leyendo titulos que empiezan
 * igual. Es el hueco mas grande que tenia esta pagina.
 */

type FiltroCompra = "todos" | "cod" | "vitrina";
type Orden = "curado" | "precio-asc" | "precio-desc";

const FILTROS_COMPRA: { valor: FiltroCompra; etiqueta: string }[] = [
  { valor: "todos", etiqueta: "Todos" },
  { valor: "cod", etiqueta: "Contraentrega" },
  { valor: "vitrina", etiqueta: "Bajo pedido" },
];

const ORDENES: { valor: Orden; etiqueta: string }[] = [
  { valor: "curado", etiqueta: "Recomendado" },
  { valor: "precio-asc", etiqueta: "Precio: de menor a mayor" },
  { valor: "precio-desc", etiqueta: "Precio: de mayor a menor" },
];

/** Cuantas tarjetas se montan por tanda. */
const POR_LOTE = 12;

function precioMinimo(product: Product): number {
  if (product.variants.length === 0) return parseFloat(product.price);
  return product.variants.reduce(
    (min, v) => Math.min(min, parseFloat(v.price)),
    parseFloat(product.variants[0].price),
  );
}

/**
 * Para buscar sin que importen tildes ni mayusculas: quien escribe "ageloc"
 * en el teclado del celular tiene que encontrar "ageLOC", y quien escribe
 * "nutricion" tiene que encontrar "Nutrición".
 */
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    // `\p{Diacritic}` en vez del rango de combinantes escrito a mano: esos
    // caracteres son invisibles en el editor y cualquiera los borra sin
    // enterarse. Necesita la bandera `u`.
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/**
 * Orden por defecto: primero lo que se puede pedir contraentrega —que es lo
 * que la mayoria viene buscando— y dentro de cada grupo de menor a mayor
 * precio, para que la entrada al catalogo no sea un kit de seis millones.
 */
function ordenarCatalogo(productos: Product[], orden: Orden): Product[] {
  const copia = [...productos];

  if (orden === "precio-asc") {
    return copia.sort((a, b) => precioMinimo(a) - precioMinimo(b));
  }
  if (orden === "precio-desc") {
    return copia.sort((a, b) => precioMinimo(b) - precioMinimo(a));
  }

  return copia.sort((a, b) => {
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

  const ordenParam = searchParams.get("orden");
  const orden: Orden = ORDENES.some((o) => o.valor === ordenParam)
    ? (ordenParam as Orden)
    : "curado";

  const consulta = searchParams.get("q") ?? "";

  // Las lineas salen de los datos, no de una lista escrita a mano: si Milito
  // agrega una linea nueva en Shopify, aparece aqui sola.
  const lineas = useMemo(() => {
    const unicas = new Set<string>();
    for (const p of productos) {
      if (p.linea) unicas.add(p.linea);
    }
    return Array.from(unicas).sort((a, b) => a.localeCompare(b, "es"));
  }, [productos]);

  const linea = lineaParam && lineas.includes(lineaParam) ? lineaParam : null;

  const actualizarFiltro = useCallback(
    (clave: "compra" | "linea" | "orden" | "q", valor: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (valor === null || valor === "") {
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

  // El input se maneja local y baja a la URL con retardo: escribir en la URL
  // en cada tecla dispara un `router.replace` por letra.
  const [texto, setTexto] = useState(consulta);

  // `actualizarFiltro` depende de `searchParams`, que se recrea en cuanto la
  // URL cambia. Teniendola en las dependencias, el efecto se rearmaba y su
  // limpieza cancelaba el temporizador antes de los 300ms — el parametro `q`
  // podia no llegar nunca a la URL. Con la referencia, el unico disparador es
  // el texto.
  const sincronizarUrl = useRef(actualizarFiltro);
  useEffect(() => {
    sincronizarUrl.current = actualizarFiltro;
  }, [actualizarFiltro]);

  const yaMonto = useRef(false);
  useEffect(() => {
    // Al montar no se reescribe la URL: llegar con ?q=lumispa y que el propio
    // componente lo reemplace por lo mismo es una entrada de historial gratis.
    if (!yaMonto.current) {
      yaMonto.current = true;
      return;
    }
    const id = setTimeout(
      () => sincronizarUrl.current("q", texto.trim() || null),
      300,
    );
    return () => clearTimeout(id);
  }, [texto]);

  // El filtro corre sobre el TEXTO LOCAL, no sobre el parametro de la URL.
  // Filtrando por la URL la reja no se movia hasta que el retardo de 300ms
  // escribia el parametro y el router volvia a renderizar: se escribia media
  // palabra mirando cuarenta tarjetas quietas. La URL sigue sincronizandose
  // para poder compartir la busqueda, pero va detras, no delante.
  const busqueda = normalizar(texto);

  // La busqueda se aplica primero: los contadores de cada chip tienen que
  // contar sobre lo que la busqueda dejo, o dirian "8" en un filtro que al
  // pulsarlo muestra 2.
  const porBusqueda = useMemo(() => {
    if (!busqueda) return productos;
    const terminos = busqueda.split(/\s+/).filter(Boolean);
    return productos.filter((p) => {
      const heno = normalizar(`${p.title} ${p.linea ?? ""}`);
      return terminos.every((t) => heno.includes(t));
    });
  }, [productos, busqueda]);

  const cumpleCompra = useCallback(
    (p: Product, valor: FiltroCompra) =>
      valor === "todos" ||
      (valor === "cod" ? p.codDisponible : !p.codDisponible),
    [],
  );

  const visibles = useMemo(
    () =>
      ordenarCatalogo(
        porBusqueda.filter(
          (p) =>
            cumpleCompra(p, compra) && (linea === null || p.linea === linea),
        ),
        orden,
      ),
    [porBusqueda, compra, linea, orden, cumpleCompra],
  );

  const hayFiltros = compra !== "todos" || linea !== null || busqueda !== "";

  // Paginado por tandas: montar cuarenta tarjetas de golpe son cuarenta
  // imagenes y cuarenta bloques de DOM en un celular de gama media.
  // El contador se reinicia cuando cambia la vista, ajustando estado durante
  // el render en vez de en un efecto (que causaria un render extra).
  const clave = `${busqueda}|${compra}|${linea}|${orden}`;
  const [claveAnterior, setClaveAnterior] = useState(clave);
  const [mostrados, setMostrados] = useState(POR_LOTE);

  if (clave !== claveAnterior) {
    setClaveAnterior(clave);
    setMostrados(POR_LOTE);
  }

  const enPantalla = visibles.slice(0, mostrados);
  const restantes = visibles.length - enPantalla.length;

  const limpiarFiltros = useCallback(() => {
    setTexto("");
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  return (
    <div className="flex flex-col gap-5">
      {/* Buscador y orden, fijos bajo el encabezado del sitio: en un catalogo
          de cuarenta productos, tener que volver arriba para cambiar de
          filtro es la mitad del recorrido. */}
      <div className="sticky top-[var(--alto-header)] z-30 border-b border-arena bg-blanco/95 px-5 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
          <div className="relative flex-1">
            <span
              aria-hidden
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ceniza"
            >
              <LupaIcon />
            </span>
            <input
              type="search"
              inputMode="search"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Buscar por nombre o línea"
              aria-label="Buscar en el catálogo"
              className={cx(
                "min-h-[44px] w-full rounded-full border border-arena bg-blanco pl-10 pr-10 text-[14px] text-carbon",
                "placeholder:text-ceniza focus:border-dorado focus:outline-none focus:ring-2 focus:ring-dorado/30",
                "[&::-webkit-search-cancel-button]:hidden",
              )}
            />
            {texto ? (
              <button
                type="button"
                onClick={() => setTexto("")}
                aria-label="Borrar la búsqueda"
                className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-ceniza transition-colors hover:bg-crema hover:text-carbon"
              >
                ✕
              </button>
            ) : null}
          </div>

          <label className="flex shrink-0 items-center gap-2 text-[12.5px] text-carbon-suave">
            <span className="sr-only sm:not-sr-only">Ordenar</span>
            <select
              value={orden}
              onChange={(e) => actualizarFiltro("orden", e.target.value)}
              aria-label="Ordenar el catálogo"
              className="min-h-[44px] rounded-full border border-arena bg-blanco px-3.5 text-[13px] text-carbon focus:border-dorado focus:outline-none focus:ring-2 focus:ring-dorado/30"
            >
              {ORDENES.map((o) => (
                <option key={o.valor} value={o.valor}>
                  {o.etiqueta}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <FilaFiltros aria-label="Filtrar por forma de compra">
          {FILTROS_COMPRA.map((f) => {
            const cuantos = porBusqueda.filter(
              (p) =>
                cumpleCompra(p, f.valor) &&
                (linea === null || p.linea === linea),
            ).length;

            return (
              <Chip
                key={f.valor}
                activo={compra === f.valor}
                cuantos={cuantos}
                onClick={() =>
                  actualizarFiltro(
                    "compra",
                    f.valor === "todos" ? null : f.valor,
                  )
                }
              >
                {f.etiqueta}
              </Chip>
            );
          })}
        </FilaFiltros>

        {lineas.length > 0 && (
          <FilaFiltros aria-label="Filtrar por línea">
            <Chip
              activo={linea === null}
              onClick={() => actualizarFiltro("linea", null)}
            >
              Todas las líneas
            </Chip>
            {lineas.map((l) => {
              const cuantos = porBusqueda.filter(
                (p) => p.linea === l && cumpleCompra(p, compra),
              ).length;

              // Una linea que la busqueda o el filtro de compra dejaron en
              // cero no se muestra: un chip que lleva a "nada por aqui" es
              // ruido, no una opcion.
              if (cuantos === 0 && linea !== l) return null;

              return (
                <Chip
                  key={l}
                  activo={linea === l}
                  cuantos={cuantos}
                  onClick={() => actualizarFiltro("linea", l)}
                >
                  {l}
                </Chip>
              );
            })}
          </FilaFiltros>
        )}
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 sm:px-6">
        {/* `ceniza` sobre blanco da 2.9:1 y a 12px no pasa WCAG AA. */}
        <p className="text-xs text-carbon-suave">
          {visibles.length}{" "}
          {visibles.length === 1 ? "producto" : "productos"}
          {busqueda ? (
            <>
              {" para "}
              <span className="text-carbon">“{texto.trim()}”</span>
            </>
          ) : null}
        </p>

        {hayFiltros ? (
          <button
            type="button"
            onClick={limpiarFiltros}
            className="text-xs text-carbon underline decoration-dorado decoration-1 underline-offset-4 transition-colors hover:text-dorado-oscuro"
          >
            Limpiar
          </button>
        ) : null}
      </div>

      {visibles.length === 0 ? (
        <div className="flex flex-col items-center gap-4 px-5 py-14 text-center sm:px-6">
          <p className="font-display text-[22px] text-carbon">
            {busqueda ? "Nada con ese nombre" : "Nada por aquí con ese filtro"}
          </p>
          <p className="max-w-xs text-[14px] leading-relaxed text-carbon-suave">
            {busqueda
              ? "Prueba con una palabra más corta, o mira el catálogo completo."
              : "Prueba con otra línea o mira el catálogo completo."}
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
        <>
          <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-3 px-5 sm:gap-5 sm:px-6 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {enPantalla.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {restantes > 0 ? (
            <div className="flex justify-center px-5 pt-2 sm:px-6">
              <button
                type="button"
                onClick={() => setMostrados((n) => n + POR_LOTE)}
                className="flex min-h-[48px] items-center justify-center rounded-lg border border-carbon px-6 text-sm font-medium tracking-wide text-carbon transition-colors duration-200 hover:bg-crema"
              >
                Ver {Math.min(restantes, POR_LOTE)} más
                <span className="ml-2 text-carbon-suave">
                  ({restantes} por ver)
                </span>
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function LupaIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5L21 21" />
    </svg>
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
      className="mx-auto flex w-full max-w-6xl gap-2 overflow-x-auto px-5 pb-1 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      {...props}
    >
      {children}
    </div>
  );
}

function Chip({
  activo,
  cuantos,
  onClick,
  children,
}: {
  activo: boolean;
  /** Cuantos productos quedarian al pulsarlo. Sin esto un filtro es una apuesta. */
  cuantos?: number;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={cx(
        "flex min-h-[44px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-sm transition-colors duration-200",
        activo
          ? "border-morado bg-morado text-blanco"
          : "border-arena bg-blanco text-carbon-suave hover:bg-crema",
      )}
    >
      {children}
      {cuantos !== undefined ? (
        <span
          className={cx(
            "text-[11px]",
            activo ? "text-blanco/70" : "text-ceniza",
          )}
        >
          {cuantos}
        </span>
      ) : null}
    </button>
  );
}

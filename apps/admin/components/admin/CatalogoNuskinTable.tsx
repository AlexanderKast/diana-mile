"use client";

import { useMemo, useState } from "react";
import { cx, formatCOP } from "@diana-mile/shared/utils";
import type { ProductoCatalogoNuskin } from "@/lib/shopify-catalogo";

/**
 * Tabla del catalogo Nu Skin con el interruptor de contraentrega por fila.
 *
 * El interruptor escribe el metafield `diana_mile.cod_disponible` a traves
 * de /api/admin/catalogo — el token de Shopify nunca sale al navegador.
 *
 * La actualizacion es optimista: la fila cambia al instante y se revierte
 * si la peticion falla, con un aviso de que no se guardo. Sin la reversion,
 * Diana creeria que apago la contraentrega de un kit de seis millones
 * cuando en realidad sigue encendida.
 */

const MOTIVOS: Record<string, string> = {
  ticket_alto: "Ticket alto",
  solo_suscripcion: "Solo suscripción",
  accesorio: "Accesorio",
};

export default function CatalogoNuskinTable({
  productos: iniciales,
}: {
  productos: ProductoCatalogoNuskin[];
}) {
  const [productos, setProductos] = useState(iniciales);
  const [busqueda, setBusqueda] = useState("");
  const [guardando, setGuardando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return productos;
    return productos.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.skuOficial ?? "").toLowerCase().includes(q),
    );
  }, [productos, busqueda]);

  const totalCod = productos.filter((p) => p.codDisponible).length;

  function aplicar(id: string, valor: boolean) {
    setProductos((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, codDisponible: valor, motivoNoCod: valor ? null : p.motivoNoCod }
          : p,
      ),
    );
  }

  async function alternar(producto: ProductoCatalogoNuskin) {
    const anterior = producto.codDisponible;
    const nuevo = !anterior;

    setError(null);
    setGuardando(producto.id);
    aplicar(producto.id, nuevo);

    try {
      const res = await fetch("/api/admin/catalogo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: producto.id, codDisponible: nuevo }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error ?? `Error ${res.status}`);
      }
    } catch (err) {
      aplicar(producto.id, anterior);
      setError(
        `No se pudo cambiar "${producto.title}": ${
          err instanceof Error ? err.message : String(err)
        }. Quedó como estaba.`,
      );
    } finally {
      setGuardando(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o SKU..."
          className="w-full rounded-[4px] border border-arena bg-blanco px-3 py-2 text-sm text-carbon sm:max-w-xs"
        />
        <p className="text-xs text-ceniza">
          {totalCod} contraentrega · {productos.length - totalCod} vitrina ·{" "}
          {productos.length} en total
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-[4px] border border-error/40 bg-error/10 px-3 py-2 text-sm text-error"
        >
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-[4px] border border-arena bg-blanco">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-arena text-xs uppercase text-ceniza">
              <th className="px-4 py-3 text-left">Producto</th>
              <th className="px-4 py-3 text-left">SKU oficial</th>
              <th className="px-4 py-3 text-left">Línea</th>
              <th className="px-4 py-3 text-right">Precio</th>
              <th className="px-4 py-3 text-left">Contraentrega</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((producto) => (
              <tr key={producto.id} className="border-b border-arena/60 last:border-0">
                <td className="px-4 py-3">
                  <p className="text-carbon">{producto.title}</p>
                  <p className="text-xs text-ceniza">
                    {producto.handle}
                    {producto.status !== "ACTIVE" && ` · ${producto.status.toLowerCase()}`}
                  </p>
                </td>
                <td className="px-4 py-3 text-carbon-suave">
                  {producto.skuOficial ?? "—"}
                </td>
                <td className="px-4 py-3 text-carbon-suave">
                  {producto.linea ?? "—"}
                </td>
                <td className="px-4 py-3 text-right text-carbon-suave">
                  {producto.precio !== null ? formatCOP(producto.precio) : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={producto.codDisponible}
                      aria-label={`Contraentrega de ${producto.title}`}
                      disabled={guardando === producto.id}
                      onClick={() => alternar(producto)}
                      className={cx(
                        "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 disabled:opacity-50",
                        producto.codDisponible ? "bg-morado" : "bg-arena",
                      )}
                    >
                      <span
                        className={cx(
                          "absolute top-0.5 h-5 w-5 rounded-full bg-blanco shadow transition-all duration-200",
                          producto.codDisponible ? "left-[22px]" : "left-0.5",
                        )}
                      />
                    </button>
                    <span className="text-xs text-ceniza">
                      {producto.codDisponible
                        ? "Contraentrega"
                        : `Vitrina${
                            producto.motivoNoCod
                              ? ` · ${MOTIVOS[producto.motivoNoCod] ?? producto.motivoNoCod}`
                              : ""
                          }`}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {visibles.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-ceniza">
            Ningún producto coincide con “{busqueda}”.
          </p>
        )}
      </div>
    </div>
  );
}

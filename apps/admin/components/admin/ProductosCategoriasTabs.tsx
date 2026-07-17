"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cx } from "@diana-mile/shared/utils";
import type { CategoriaResumen, ProductoResumen } from "@/lib/shopify-catalogo";

type ProductosCategoriasTabsProps = {
  productos: ProductoResumen[];
  categorias: CategoriaResumen[];
};

function EstadoBadge({ configurado }: { configurado: boolean }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        configurado
          ? "bg-dorado/15 text-dorado-oscuro"
          : "bg-arena/60 text-ceniza",
      )}
    >
      {configurado ? "Landing configurada" : "Sin configurar"}
    </span>
  );
}

export default function ProductosCategoriasTabs({
  productos,
  categorias,
}: ProductosCategoriasTabsProps) {
  const [tab, setTab] = useState<"productos" | "categorias">("productos");

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setTab("productos")}
          className={cx(
            "px-4 py-2 text-sm font-medium rounded-[4px] border",
            tab === "productos"
              ? "bg-carbon text-blanco border-carbon"
              : "bg-blanco text-carbon border-arena",
          )}
        >
          Productos ({productos.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("categorias")}
          className={cx(
            "px-4 py-2 text-sm font-medium rounded-[4px] border",
            tab === "categorias"
              ? "bg-carbon text-blanco border-carbon"
              : "bg-blanco text-carbon border-arena",
          )}
        >
          Categorías ({categorias.length})
        </button>
      </div>

      {tab === "productos" ? (
        <div className="overflow-x-auto bg-blanco border border-arena rounded-[4px]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-arena text-ceniza text-xs uppercase">
                <th className="text-left px-4 py-3">Producto</th>
                <th className="text-left px-4 py-3">Estado Shopify</th>
                <th className="text-left px-4 py-3">Landing</th>
                <th className="text-right px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-ceniza">
                    No hay productos en el catalogo de Shopify.
                  </td>
                </tr>
              )}
              {productos.map((producto) => (
                <tr key={producto.id} className="border-b border-arena/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {producto.imagenUrl ? (
                        <Image
                          src={producto.imagenUrl}
                          alt=""
                          width={40}
                          height={40}
                          className="rounded-[4px] object-cover w-10 h-10 border border-arena"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-[4px] bg-crema border border-arena" />
                      )}
                      <span className="text-carbon font-medium">
                        {producto.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-carbon-suave">
                    {producto.status}
                  </td>
                  <td className="px-4 py-3">
                    <EstadoBadge configurado={producto.configurado} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/productos/${producto.handle}`}
                      className="text-sm font-medium text-dorado-oscuro hover:underline"
                    >
                      Abrir constructor
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto bg-blanco border border-arena rounded-[4px]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-arena text-ceniza text-xs uppercase">
                <th className="text-left px-4 py-3">Categoría</th>
                <th className="text-left px-4 py-3">Productos</th>
                <th className="text-left px-4 py-3">Landing</th>
                <th className="text-right px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categorias.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-ceniza">
                    No hay categorías en el catalogo de Shopify.
                  </td>
                </tr>
              )}
              {categorias.map((categoria) => (
                <tr key={categoria.id} className="border-b border-arena/50">
                  <td className="px-4 py-3 text-carbon font-medium">
                    {categoria.title}
                  </td>
                  <td className="px-4 py-3 text-carbon-suave">
                    {categoria.productosCount}
                  </td>
                  <td className="px-4 py-3">
                    <EstadoBadge configurado={categoria.configurado} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/productos/categorias/${categoria.handle}`}
                      className="text-sm font-medium text-dorado-oscuro hover:underline"
                    >
                      Abrir constructor
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

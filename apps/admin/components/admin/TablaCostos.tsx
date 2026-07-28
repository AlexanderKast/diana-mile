"use client";

import { useMemo, useState } from "react";
import { formatCOP, cx } from "@diana-mile/shared/utils";
import {
  ETIQUETA_SALUD,
  type SaludCosteo,
} from "@diana-mile/shared/finanzas/costeo";
import type { FilaCosteo } from "@/lib/costeo";

/**
 * Tabla de costeo del catalogo, editable en linea.
 *
 * Se edita fila por fila y se guarda una por una a proposito: son ~90
 * variantes y el costo se carga a mano mirando la lista de precios de Nu
 * Skin. Un formulario que exija terminarlas todas antes de guardar hace
 * que no se cargue ninguna.
 *
 * El estado optimista es local: al guardar se pinta el resultado sin
 * recargar la pagina para que se pueda ir bajando por la lista sin
 * perder el hilo.
 */

const COLOR_SALUD: Record<SaludCosteo, string> = {
  sin_costo: "bg-error/10 text-error",
  perdida: "bg-error/10 text-error",
  bajo_objetivo: "bg-dorado/15 text-dorado-oscuro",
  sano: "bg-morado/10 text-morado",
};

const FILTROS: { valor: SaludCosteo | "todos"; label: string }[] = [
  { valor: "todos", label: "Todos" },
  { valor: "sin_costo", label: "Sin costo" },
  { valor: "perdida", label: "Pierden plata" },
  { valor: "bajo_objetivo", label: "Bajo objetivo" },
  { valor: "sano", label: "Sanos" },
];

type EstadoFila = {
  costoUnitario: string;
  guardando: boolean;
  error: string | null;
  guardado: boolean;
};

export function TablaCostos({
  filas,
  filtroInicial,
}: {
  filas: FilaCosteo[];
  filtroInicial: SaludCosteo | null;
}) {
  const [filtro, setFiltro] = useState<SaludCosteo | "todos">(
    filtroInicial ?? "todos",
  );
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState<Record<string, EstadoFila>>({});
  // Costos ya guardados en esta sesion, para repintar sin recargar.
  const [guardados, setGuardados] = useState<Record<string, number>>({});

  const visibles = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    return filas.filter((fila) => {
      // Una fila recien guardada deja de ser "sin costo" aunque el filtro
      // activo sea ese; se mantiene visible para que se vea el resultado
      // en vez de desaparecer de golpe al terminar de escribir.
      const yaGuardada = fila.variantId in guardados;
      if (filtro !== "todos" && fila.salud !== filtro && !yaGuardada) return false;
      if (!termino) return true;
      return (
        fila.productoTitulo.toLowerCase().includes(termino) ||
        fila.varianteTitulo.toLowerCase().includes(termino)
      );
    });
  }, [filas, filtro, busqueda, guardados]);

  function estadoDe(variantId: string, fila: FilaCosteo): EstadoFila {
    return (
      estado[variantId] ?? {
        costoUnitario:
          fila.costoUnitario !== null ? String(Math.round(fila.costoUnitario)) : "",
        guardando: false,
        error: null,
        guardado: false,
      }
    );
  }

  function actualizar(variantId: string, cambios: Partial<EstadoFila>, fila: FilaCosteo) {
    setEstado((previo) => ({
      ...previo,
      [variantId]: { ...estadoDe(variantId, fila), ...cambios },
    }));
  }

  async function guardar(fila: FilaCosteo) {
    const actual = estadoDe(fila.variantId, fila);
    const texto = actual.costoUnitario.trim();

    // Vacio = borrar el costo. Es distinto de 0, que significa "no me
    // cuesta nada", y esa diferencia es la que hace que la alerta de
    // "sin costo" sirva para algo.
    const costo = texto === "" ? null : Number(texto.replace(/[^\d.-]/g, ""));

    if (costo !== null && (!Number.isFinite(costo) || costo < 0)) {
      actualizar(fila.variantId, { error: "Escribe un número válido." }, fila);
      return;
    }

    actualizar(fila.variantId, { guardando: true, error: null, guardado: false }, fila);

    try {
      const res = await fetch("/api/admin/costos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId: fila.variantId,
          productoId: fila.productoId,
          productoTitulo: fila.productoTitulo,
          varianteTitulo: fila.varianteTitulo,
          costoUnitario: costo,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "No se pudo guardar.");

      actualizar(fila.variantId, { guardando: false, guardado: true }, fila);
      setGuardados((previo) => {
        if (costo === null) {
          const copia = { ...previo };
          delete copia[fila.variantId];
          return copia;
        }
        return { ...previo, [fila.variantId]: costo };
      });
    } catch (e) {
      actualizar(
        fila.variantId,
        {
          guardando: false,
          error: e instanceof Error ? e.message : "No se pudo guardar.",
        },
        fila,
      );
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {FILTROS.map((f) => (
          <button
            key={f.valor}
            onClick={() => setFiltro(f.valor)}
            className={cx(
              "px-3 py-1.5 text-xs rounded-[4px] border transition-colors",
              filtro === f.valor
                ? "bg-carbon text-blanco border-carbon"
                : "bg-blanco text-carbon-suave border-arena hover:border-carbon-suave",
            )}
          >
            {f.label}
          </button>
        ))}
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar producto..."
          className="ml-auto px-3 py-1.5 text-xs bg-blanco border border-arena rounded-[4px] w-48 focus:outline-none focus:border-carbon-suave"
        />
      </div>

      <p className="text-xs text-ceniza">
        {visibles.length} de {filas.length} variantes
      </p>

      <div className="overflow-x-auto bg-blanco border border-arena rounded-[4px]">
        <table className="w-full text-sm min-w-[880px]">
          <thead>
            <tr className="border-b border-arena text-left">
              <th className="p-3 text-xs uppercase tracking-wide text-ceniza font-normal">
                Producto
              </th>
              <th className="p-3 text-xs uppercase tracking-wide text-ceniza font-normal text-right">
                Precio
              </th>
              <th className="p-3 text-xs uppercase tracking-wide text-ceniza font-normal text-right">
                Costo
              </th>
              <th className="p-3 text-xs uppercase tracking-wide text-ceniza font-normal text-right">
                Margen
              </th>
              <th className="p-3 text-xs uppercase tracking-wide text-ceniza font-normal text-right">
                Utilidad
              </th>
              <th className="p-3 text-xs uppercase tracking-wide text-ceniza font-normal text-right">
                Sugerido
              </th>
              <th className="p-3 text-xs uppercase tracking-wide text-ceniza font-normal">
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((fila) => {
              const st = estadoDe(fila.variantId, fila);
              const costoVivo = guardados[fila.variantId];
              const tieneCostoVivo =
                costoVivo !== undefined || fila.costoUnitario !== null;

              // Se recalcula en el cliente con el costo recien guardado
              // para no obligar a recargar. Misma aritmetica que el
              // servidor; el servidor sigue siendo la autoridad al
              // refrescar.
              const costo = costoVivo ?? fila.costoUnitario ?? 0;
              const costoTotal = costo + fila.costoPlataforma + fila.costoLogistico;
              const precio = fila.costeo.precioVenta;
              const margen = precio > 0 ? (precio - costoTotal) / precio : 0;
              const utilidad =
                precio - costoTotal - fila.costeo.publicidad - fila.costeo.admin;

              const salud: SaludCosteo = !tieneCostoVivo
                ? "sin_costo"
                : utilidad < 0
                  ? "perdida"
                  : margen < fila.costeo.margenObjetivo
                    ? "bajo_objetivo"
                    : "sano";

              return (
                <tr
                  key={fila.variantId}
                  className="border-b border-arena/60 last:border-0 hover:bg-crema/40"
                >
                  <td className="p-3">
                    <p className="text-carbon leading-snug">{fila.productoTitulo}</p>
                    <p className="text-xs text-ceniza mt-0.5">
                      {fila.varianteTitulo !== "Default Title"
                        ? fila.varianteTitulo
                        : "Presentación única"}
                      {fila.estado === "DRAFT" && " · borrador"}
                      {!fila.codDisponible && " · vitrina"}
                    </p>
                  </td>

                  <td className="p-3 text-right whitespace-nowrap text-carbon">
                    {formatCOP(precio)}
                  </td>

                  <td className="p-3 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <input
                        value={st.costoUnitario}
                        onChange={(e) =>
                          actualizar(
                            fila.variantId,
                            { costoUnitario: e.target.value, guardado: false, error: null },
                            fila,
                          )
                        }
                        onBlur={() => {
                          const original =
                            fila.costoUnitario !== null
                              ? String(Math.round(fila.costoUnitario))
                              : "";
                          if (st.costoUnitario.trim() !== original.trim()) {
                            void guardar(fila);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") e.currentTarget.blur();
                        }}
                        inputMode="numeric"
                        placeholder="—"
                        disabled={st.guardando}
                        className={cx(
                          "w-28 px-2 py-1 text-right text-sm bg-blanco border rounded-[4px] focus:outline-none",
                          st.error
                            ? "border-error"
                            : !tieneCostoVivo
                              ? "border-error/40 bg-error/5"
                              : "border-arena focus:border-carbon-suave",
                        )}
                      />
                      {st.guardando && (
                        <span className="text-[10px] text-ceniza">guardando…</span>
                      )}
                      {st.guardado && !st.guardando && (
                        <span className="text-[10px] text-morado">guardado</span>
                      )}
                      {st.error && (
                        <span className="text-[10px] text-error max-w-[8rem] text-right">
                          {st.error}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="p-3 text-right whitespace-nowrap">
                    {tieneCostoVivo ? (
                      <span className="text-carbon">{(margen * 100).toFixed(0)}%</span>
                    ) : (
                      <span className="text-ceniza">—</span>
                    )}
                  </td>

                  <td className="p-3 text-right whitespace-nowrap">
                    {tieneCostoVivo ? (
                      <span className={utilidad < 0 ? "text-error" : "text-carbon"}>
                        {formatCOP(utilidad)}
                      </span>
                    ) : (
                      <span className="text-ceniza">—</span>
                    )}
                  </td>

                  <td className="p-3 text-right whitespace-nowrap">
                    {tieneCostoVivo ? (
                      <span className="text-carbon-suave">
                        {formatCOP(costoTotal / (1 - fila.costeo.margenObjetivo))}
                      </span>
                    ) : (
                      <span className="text-ceniza">—</span>
                    )}
                  </td>

                  <td className="p-3">
                    <span
                      className={cx(
                        "inline-block px-2 py-0.5 rounded-[3px] text-[11px] whitespace-nowrap",
                        COLOR_SALUD[salud],
                      )}
                    >
                      {ETIQUETA_SALUD[salud]}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {visibles.length === 0 && (
          <p className="p-6 text-center text-sm text-ceniza">
            Nada que mostrar con este filtro.
          </p>
        )}
      </div>
    </div>
  );
}

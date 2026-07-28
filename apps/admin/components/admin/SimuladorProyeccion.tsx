"use client";

import { useMemo, useState } from "react";
import { formatCOP, cx } from "@diana-mile/shared/utils";
import {
  proyectar,
  abanico,
  repartirPorEstrategia,
  repartirReinversion,
  ESTRATEGIAS_BASE,
  type SupuestosProyeccion,
} from "@diana-mile/shared/finanzas/proyeccion";
import type { SupuestosSugeridos, Supuesto } from "@/lib/proyeccion-datos";

/**
 * Simulador de proyeccion mensual.
 *
 * Todo se recalcula en el navegador con el mismo motor que corre en el
 * servidor: mover un supuesto tiene que responder al instante, porque la
 * gracia de esto es probar diez escenarios seguidos.
 *
 * Cada supuesto viene marcado con su origen — medido o estimado — y con
 * cuantos pedidos se midio. Un numero que sale de 400 pedidos y otro que
 * sale de un default no pueden verse igual en pantalla.
 */

function Etiqueta({ supuesto }: { supuesto: Supuesto }) {
  return (
    <span
      title={supuesto.nota}
      className={cx(
        "text-[10px] px-1.5 py-0.5 rounded-[3px] whitespace-nowrap cursor-help",
        supuesto.origen === "medido"
          ? "bg-morado/10 text-morado"
          : "bg-dorado/15 text-dorado-oscuro",
      )}
    >
      {supuesto.origen === "medido" ? `medido · ${supuesto.muestra}` : "estimado"}
    </span>
  );
}

function Campo({
  label,
  valor,
  onChange,
  sufijo,
  supuesto,
  paso = 1,
}: {
  label: string;
  valor: number;
  onChange: (n: number) => void;
  sufijo?: string;
  supuesto?: Supuesto;
  paso?: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <label className="text-xs text-carbon-suave">{label}</label>
        {supuesto && <Etiqueta supuesto={supuesto} />}
      </div>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={Math.round(valor * 100) / 100}
          step={paso}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (Number.isFinite(n)) onChange(n);
          }}
          className="px-3 py-2 text-sm bg-blanco border border-arena rounded-[4px] w-full focus:outline-none focus:border-carbon-suave"
        />
        {sufijo && <span className="text-xs text-ceniza shrink-0">{sufijo}</span>}
      </div>
    </div>
  );
}

export function SimuladorProyeccion({
  sugeridos,
}: {
  sugeridos: SupuestosSugeridos;
}) {
  const [inversion, setInversion] = useState(sugeridos.inversionPublicidadSugerida);
  const [part, setPart] = useState(15);
  const [ticket, setTicket] = useState(Math.round(sugeridos.ticketPromedio.valor));
  const [margen, setMargen] = useState(
    Math.round(sugeridos.margenBruto.valor * 100),
  );
  const [despacho, setDespacho] = useState(
    Math.round(sugeridos.tasaDespacho.valor * 100),
  );
  const [entrega, setEntrega] = useState(
    Math.round(sugeridos.tasaEntrega.valor * 100),
  );
  const [fijos, setFijos] = useState(sugeridos.costosFijosMes.valor);

  const supuestos: SupuestosProyeccion = useMemo(
    () => ({
      inversionPublicidad: inversion,
      partPublicidad: part / 100,
      ticketPromedio: ticket,
      margenBruto: margen / 100,
      tasaDespacho: despacho / 100,
      tasaEntrega: entrega / 100,
      costosFijosMes: fijos,
    }),
    [inversion, part, ticket, margen, despacho, entrega, fijos],
  );

  const resultado = useMemo(() => proyectar(supuestos), [supuestos]);
  const escenarios = useMemo(() => abanico(supuestos, 0.1, 0.25, 0.01), [supuestos]);
  const estrategias = useMemo(
    () => repartirPorEstrategia(inversion, resultado.cppObjetivo, ESTRATEGIAS_BASE),
    [inversion, resultado.cppObjetivo],
  );
  const reinversion = useMemo(
    () => repartirReinversion(resultado.utilidadNeta),
    [resultado.utilidadNeta],
  );

  const enVerde = resultado.utilidadNeta > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Supuestos ── */}
      <div className="bg-blanco border border-arena rounded-[4px] p-5">
        <p className="text-xs text-ceniza uppercase tracking-wide mb-4">Supuestos</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Campo
            label="Inversión en pauta"
            valor={inversion}
            onChange={setInversion}
            sufijo="COP"
            paso={100000}
          />
          <Campo
            label="Pauta sobre la venta"
            valor={part}
            onChange={setPart}
            sufijo="%"
          />
          <Campo
            label="Ticket promedio"
            valor={ticket}
            onChange={setTicket}
            sufijo="COP"
            paso={1000}
            supuesto={sugeridos.ticketPromedio}
          />
          <Campo
            label="Margen bruto"
            valor={margen}
            onChange={setMargen}
            sufijo="%"
            supuesto={sugeridos.margenBruto}
          />
          <Campo
            label="Tasa de despacho"
            valor={despacho}
            onChange={setDespacho}
            sufijo="%"
            supuesto={sugeridos.tasaDespacho}
          />
          <Campo
            label="Tasa de entrega"
            valor={entrega}
            onChange={setEntrega}
            sufijo="%"
            supuesto={sugeridos.tasaEntrega}
          />
          <Campo
            label="Costos fijos del mes"
            valor={fijos}
            onChange={setFijos}
            sufijo="COP"
            paso={100000}
            supuesto={sugeridos.costosFijosMes}
          />
        </div>

        {sugeridos.margenBruto.origen === "estimado" && (
          <p className="text-xs text-dorado-oscuro mt-4">
            {sugeridos.margenBruto.nota}
          </p>
        )}
      </div>

      {/* ── La cascada ── */}
      <div className="bg-blanco border border-arena rounded-[4px] p-5">
        <p className="text-xs text-ceniza uppercase tracking-wide mb-1">
          De lo que se factura a lo que queda
        </p>
        <p className="text-xs text-carbon-suave mb-4">
          Cada escalón es plata que se pierde por el camino. La caída de
          facturación a recaudo es la que casi nadie mide.
        </p>

        <div className="flex flex-col gap-2">
          {[
            { label: "Facturación", valor: resultado.facturacion, ref: resultado.facturacion },
            { label: "Despachado", valor: resultado.despachado, ref: resultado.facturacion },
            { label: "Recaudado", valor: resultado.recaudo, ref: resultado.facturacion },
            { label: "Ingreso bruto", valor: resultado.ingresoBruto, ref: resultado.facturacion },
          ].map((fila) => (
            <div key={fila.label} className="flex items-center gap-3">
              <span className="text-sm text-carbon w-32 shrink-0">{fila.label}</span>
              <div className="flex-1 h-3 bg-crema rounded-full overflow-hidden">
                <div
                  className="h-full bg-morado transition-all duration-300"
                  style={{
                    width: `${fila.ref > 0 ? Math.max(0, (fila.valor / fila.ref) * 100) : 0}%`,
                  }}
                />
              </div>
              <span className="text-sm text-carbon w-36 text-right shrink-0 whitespace-nowrap">
                {formatCOP(fila.valor)}
              </span>
            </div>
          ))}

          <div className="border-t border-arena mt-2 pt-3 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-carbon-suave">− Pauta</span>
              <span className="text-carbon-suave">
                −{formatCOP(resultado.inversionPublicidad)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-carbon-suave">− Costos fijos</span>
              <span className="text-carbon-suave">
                −{formatCOP(resultado.costosFijosMes)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-arena">
              <span className="font-display text-lg text-carbon">Utilidad neta</span>
              <span
                className={cx(
                  "font-display text-2xl",
                  enVerde ? "text-carbon" : "text-error",
                )}
              >
                {formatCOP(resultado.utilidadNeta)}
              </span>
            </div>
            <p
              className={cx(
                "text-xs text-right",
                enVerde ? "text-carbon-suave" : "text-error",
              )}
            >
              {(resultado.margenNeto * 100).toFixed(1)}% de la facturación
            </p>
          </div>
        </div>
      </div>

      {/* ── Metas ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Ventas al mes",
            valor: Math.ceil(resultado.ventasMes).toLocaleString("es-CO"),
            pie: `${Math.ceil(resultado.ventasDiarias)} al día`,
          },
          {
            label: "Punto de equilibrio",
            valor: Math.ceil(resultado.puntoEquilibrio).toLocaleString("es-CO"),
            pie: "entregas para no perder",
          },
          {
            label: "Costo por pedido máximo",
            valor: formatCOP(resultado.cppObjetivo),
            pie: "por encima, se pierde",
          },
          {
            label: "Facturación diaria",
            valor: formatCOP(resultado.facturacionDiaria),
            pie: "meta por día",
          },
        ].map((m) => (
          <div key={m.label} className="bg-blanco border border-arena rounded-[4px] p-5">
            <p className="text-xs text-ceniza uppercase tracking-wide">{m.label}</p>
            <p className="font-display text-2xl text-carbon mt-1">{m.valor}</p>
            <p className="text-xs text-ceniza mt-1">{m.pie}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[4px] border border-morado/25 bg-lila-suave px-5 py-4">
        <p className="text-sm text-carbon">
          Con estos supuestos hay que <strong>entregar</strong>{" "}
          {Math.ceil(resultado.puntoEquilibrio).toLocaleString("es-CO")} pedidos para
          no perder plata. La proyección dice que se entregarían{" "}
          {Math.floor(
            resultado.ventasMes * (despacho / 100) * (entrega / 100),
          ).toLocaleString("es-CO")}
          .
        </p>
      </div>

      {/* ── Abanico ── */}
      <div className="bg-blanco border border-arena rounded-[4px] p-5">
        <p className="text-xs text-ceniza uppercase tracking-wide mb-1">
          Si la pauta rinde mejor o peor
        </p>
        <p className="text-xs text-carbon-suave mb-4">
          El mismo presupuesto según qué porcentaje de la venta se lleve la pauta.
          Entre menos se lleve, más sostiene el mismo dinero.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-arena text-left">
                <th className="p-2 text-xs uppercase tracking-wide text-ceniza font-normal">
                  Pauta
                </th>
                <th className="p-2 text-xs uppercase tracking-wide text-ceniza font-normal text-right">
                  Facturación
                </th>
                <th className="p-2 text-xs uppercase tracking-wide text-ceniza font-normal text-right">
                  Recaudo
                </th>
                <th className="p-2 text-xs uppercase tracking-wide text-ceniza font-normal text-right">
                  Utilidad
                </th>
                <th className="p-2 text-xs uppercase tracking-wide text-ceniza font-normal text-right">
                  Ventas
                </th>
                <th className="p-2 text-xs uppercase tracking-wide text-ceniza font-normal text-right">
                  CPP máx.
                </th>
              </tr>
            </thead>
            <tbody>
              {escenarios.map((e) => {
                const actual = Math.abs(e.partPublicidad * 100 - part) < 0.5;
                return (
                  <tr
                    key={e.partPublicidad}
                    className={cx(
                      "border-b border-arena/60 last:border-0",
                      actual && "bg-lila-suave",
                    )}
                  >
                    <td className="p-2 text-carbon whitespace-nowrap">
                      {(e.partPublicidad * 100).toFixed(0)}%
                      {actual && (
                        <span className="ml-2 text-[10px] text-morado">actual</span>
                      )}
                    </td>
                    <td className="p-2 text-right text-carbon-suave whitespace-nowrap">
                      {formatCOP(e.facturacion)}
                    </td>
                    <td className="p-2 text-right text-carbon-suave whitespace-nowrap">
                      {formatCOP(e.recaudo)}
                    </td>
                    <td
                      className={cx(
                        "p-2 text-right whitespace-nowrap",
                        e.utilidadNeta < 0 ? "text-error" : "text-carbon",
                      )}
                    >
                      {formatCOP(e.utilidadNeta)}
                    </td>
                    <td className="p-2 text-right text-carbon-suave">
                      {Math.ceil(e.ventasMes).toLocaleString("es-CO")}
                    </td>
                    <td className="p-2 text-right text-carbon-suave whitespace-nowrap">
                      {formatCOP(e.cppObjetivo)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Reparto de pauta ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blanco border border-arena rounded-[4px] p-5">
          <p className="text-xs text-ceniza uppercase tracking-wide mb-4">
            Cómo repartir la pauta
          </p>
          <div className="flex flex-col gap-3">
            {estrategias.map((e) => (
              <div
                key={e.nombre}
                className="flex items-center justify-between gap-3 pb-3 border-b border-arena/60 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="text-sm text-carbon">{e.nombre}</p>
                  <p className="text-xs text-ceniza">
                    {formatCOP(e.presupuestoDiario)}/día · {e.diasInversion} días
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm text-carbon whitespace-nowrap">
                    {formatCOP(e.presupuesto)}
                  </p>
                  <p className="text-xs text-ceniza">
                    {Math.ceil(e.ventasRequeridas)} ventas
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blanco border border-arena rounded-[4px] p-5">
          <p className="text-xs text-ceniza uppercase tracking-wide mb-1">
            Si se reinvierte la utilidad
          </p>
          <p className="text-xs text-carbon-suave mb-4">
            {enVerde
              ? "Reparto sugerido de lo que deja el mes."
              : "Con pérdida no hay nada que reinvertir."}
          </p>
          <div className="flex flex-col gap-2">
            {reinversion.map((r) => (
              <div key={r.nombre} className="flex items-center gap-3">
                <span className="text-sm text-carbon w-32 shrink-0">{r.nombre}</span>
                <div className="flex-1 h-2 bg-crema rounded-full overflow-hidden">
                  <div
                    className="h-full bg-dorado"
                    style={{ width: `${r.fraccion * 100}%` }}
                  />
                </div>
                <span className="text-sm text-carbon-suave w-32 text-right shrink-0 whitespace-nowrap">
                  {formatCOP(r.monto)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

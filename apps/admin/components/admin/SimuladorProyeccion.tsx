"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatCOP, cx } from "@diana-mile/shared/utils";
import { Button } from "@diana-mile/shared/ui/Button";
import {
  proyectar,
  abanico,
  repartirPorEstrategia,
  repartirReinversion,
  ESTRATEGIAS_BASE,
  type SupuestosProyeccion,
} from "@diana-mile/shared/finanzas/proyeccion";
import {
  margenDesdeCostos,
  comisionRecaudo,
} from "@diana-mile/shared/finanzas/costos-venta";
import type { SupuestosSugeridos, Supuesto } from "@/lib/proyeccion-datos";
import type { EscenarioGuardado } from "@/app/dashboard/financiero/proyeccion/page";

/**
 * Simulador de proyeccion mensual.
 *
 * Todo se recalcula en el navegador con el mismo motor que corre en el
 * servidor: mover un supuesto tiene que responder al instante, porque la
 * gracia de esto es probar diez escenarios seguidos.
 *
 * El MARGEN NO SE ESCRIBE: se deriva de los costos de abajo, con las
 * mismas lineas que usa el panel para lo real (mercancia, envio,
 * plataforma, fulfillment, recaudo). Un margen tecleado se queda viejo el
 * dia que sube el flete y nadie se entera.
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
      <div className="flex items-center gap-2 flex-wrap">
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
  guardados,
}: {
  sugeridos: SupuestosSugeridos;
  guardados: EscenarioGuardado[];
}) {
  const router = useRouter();

  const [inversion, setInversion] = useState(sugeridos.inversionPublicidadSugerida);
  const [part, setPart] = useState(15);
  const [ticket, setTicket] = useState(Math.round(sugeridos.ticketPromedio.valor));
  const [despacho, setDespacho] = useState(
    Math.round(sugeridos.tasaDespacho.valor * 100),
  );
  const [entrega, setEntrega] = useState(
    Math.round(sugeridos.tasaEntrega.valor * 100),
  );
  const [fijos, setFijos] = useState(sugeridos.costosFijosMes.valor);

  // Costos por pedido — de aqui sale el margen.
  const [mercancia, setMercancia] = useState(
    Math.round(sugeridos.costoMercancia.valor),
  );
  const [envio, setEnvio] = useState(sugeridos.parametrosCosto.costoLogistico);
  const [plataforma, setPlataforma] = useState(
    sugeridos.parametrosCosto.costoPlataforma,
  );
  const [fulfillment, setFulfillment] = useState(
    sugeridos.parametrosCosto.costoFulfillment,
  );
  const [pctRecaudo, setPctRecaudo] = useState(
    sugeridos.parametrosCosto.pctRecaudo * 100,
  );

  const [nombre, setNombre] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [cargado, setCargado] = useState<string | null>(null);
  const [sucio, setSucio] = useState(false);

  const parametrosCosto = useMemo(
    () => ({
      costoPlataforma: plataforma,
      costoFulfillment: fulfillment,
      costoLogistico: envio,
      pctRecaudo: pctRecaudo / 100,
    }),
    [plataforma, fulfillment, envio, pctRecaudo],
  );

  const margen = useMemo(
    () => margenDesdeCostos(ticket, mercancia, parametrosCosto),
    [ticket, mercancia, parametrosCosto],
  );

  const supuestos: SupuestosProyeccion = useMemo(
    () => ({
      inversionPublicidad: inversion,
      partPublicidad: part / 100,
      ticketPromedio: ticket,
      margenBruto: Math.max(0, margen),
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

  // Cualquier cambio marca el escenario como no guardado, para que no
  // quede la duda de si lo que se ve en pantalla es lo que esta en la base.
  useEffect(() => {
    setSucio(true);
  }, [
    inversion, part, ticket, despacho, entrega, fijos,
    mercancia, envio, plataforma, fulfillment, pctRecaudo,
  ]);

  const enVerde = resultado.utilidadNeta > 0;
  const costoRecaudoPorPedido = comisionRecaudo(ticket, pctRecaudo / 100);
  const costoTotalPorPedido =
    mercancia + envio + plataforma + fulfillment + costoRecaudoPorPedido;

  function cargar(escenario: EscenarioGuardado) {
    setInversion(escenario.inversion_publicidad);
    setPart(Math.round(escenario.part_publicidad * 100));
    setTicket(Math.round(escenario.ticket_promedio));
    setDespacho(Math.round(escenario.tasa_despacho * 100));
    setEntrega(Math.round(escenario.tasa_entrega * 100));
    setFijos(escenario.costos_fijos_mes);
    setMercancia(Math.round(escenario.costo_mercancia));
    setEnvio(escenario.costo_logistico);
    setPlataforma(escenario.costo_plataforma);
    setFulfillment(escenario.costo_fulfillment);
    setPctRecaudo(escenario.pct_recaudo * 100);
    setNombre(escenario.nombre);
    setCargado(escenario.id);
    setAviso(null);
    // El efecto de arriba corre al cambiar los valores y marcaria sucio;
    // se limpia despues para que un escenario recien cargado no aparezca
    // como si tuviera cambios sin guardar.
    setTimeout(() => setSucio(false), 0);
  }

  async function guardar() {
    setAviso(null);
    const titulo = nombre.trim();
    if (!titulo) {
      setAviso("Ponle un nombre al escenario para poder guardarlo.");
      return;
    }

    setGuardando(true);
    try {
      const res = await fetch("/api/admin/proyecciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: cargado,
          nombre: titulo,
          inversionPublicidad: inversion,
          partPublicidad: part / 100,
          ticketPromedio: ticket,
          tasaDespacho: despacho / 100,
          tasaEntrega: entrega / 100,
          costosFijosMes: fijos,
          costoMercancia: mercancia,
          costoLogistico: envio,
          costoPlataforma: plataforma,
          costoFulfillment: fulfillment,
          pctRecaudo: pctRecaudo / 100,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "No se pudo guardar.");

      setCargado(json.id ?? cargado);
      setSucio(false);
      setAviso("Escenario guardado.");
      router.refresh();
    } catch (e) {
      setAviso(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  }

  async function borrar(id: string) {
    try {
      await fetch(`/api/admin/proyecciones?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (cargado === id) {
        setCargado(null);
        setNombre("");
      }
      router.refresh();
    } catch {
      setAviso("No se pudo borrar el escenario.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Guardar / cargar ── */}
      <div className="bg-blanco border border-arena rounded-[4px] p-5">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
            <label className="text-xs text-carbon-suave">Nombre del escenario</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Agosto conservador, Agosto agresivo…"
              className="px-3 py-2 text-sm bg-blanco border border-arena rounded-[4px] focus:outline-none focus:border-carbon-suave"
            />
          </div>
          <Button disabled={guardando} onClick={() => void guardar()}>
            {guardando
              ? "Guardando…"
              : cargado
                ? "Guardar cambios"
                : "Guardar escenario"}
          </Button>
          {cargado && (
            <button
              onClick={() => {
                setCargado(null);
                setNombre("");
                setAviso(null);
              }}
              className="text-xs text-ceniza hover:text-carbon transition-colors py-2"
            >
              Guardar como nuevo
            </button>
          )}
          {sucio && cargado && (
            <span className="text-xs text-dorado-oscuro py-2">sin guardar</span>
          )}
        </div>

        {aviso && (
          <p
            className={cx(
              "text-xs mt-3",
              aviso === "Escenario guardado." ? "text-morado" : "text-error",
            )}
          >
            {aviso}
          </p>
        )}

        {guardados.length > 0 && (
          <div className="mt-4 pt-4 border-t border-arena/60">
            <p className="text-xs text-ceniza uppercase tracking-wide mb-2">
              Escenarios guardados
            </p>
            <div className="flex flex-wrap gap-2">
              {guardados.map((g) => (
                <div
                  key={g.id}
                  className={cx(
                    "flex items-center gap-2 border rounded-[4px] pl-3 pr-2 py-1.5",
                    cargado === g.id
                      ? "border-morado bg-lila-suave"
                      : "border-arena hover:border-carbon-suave",
                  )}
                >
                  <button
                    onClick={() => cargar(g)}
                    className="text-sm text-carbon"
                  >
                    {g.nombre}
                  </button>
                  <button
                    onClick={() => void borrar(g.id)}
                    aria-label={`Borrar ${g.nombre}`}
                    className="text-ceniza hover:text-error transition-colors text-sm leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Supuestos ── */}
      <div className="bg-blanco border border-arena rounded-[4px] p-5">
        <p className="text-xs text-ceniza uppercase tracking-wide mb-4">
          Volumen y operación
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
      </div>

      {/* ── Costos por pedido ── */}
      <div className="bg-blanco border border-arena rounded-[4px] p-5">
        <p className="text-xs text-ceniza uppercase tracking-wide mb-1">
          Lo que cuesta cada venta
        </p>
        <p className="text-xs text-carbon-suave mb-4">
          Son las mismas líneas que el panel resta en lo real. El margen no se
          escribe: sale de aquí.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Campo
            label="Mercancía"
            valor={mercancia}
            onChange={setMercancia}
            sufijo="COP"
            paso={1000}
            supuesto={sugeridos.costoMercancia}
          />
          <Campo
            label="Envío"
            valor={envio}
            onChange={setEnvio}
            sufijo="COP"
            paso={500}
          />
          <Campo
            label="Plataforma"
            valor={plataforma}
            onChange={setPlataforma}
            sufijo="COP"
            paso={500}
          />
          <Campo
            label="Fulfillment"
            valor={fulfillment}
            onChange={setFulfillment}
            sufijo="COP"
            paso={500}
          />
          <Campo
            label="Comisión recaudo"
            valor={pctRecaudo}
            onChange={setPctRecaudo}
            sufijo="%"
            paso={0.5}
          />
        </div>

        <div className="mt-4 pt-4 border-t border-arena/60 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-carbon-suave">
            Costo por pedido{" "}
            <strong className="text-carbon">{formatCOP(costoTotalPorPedido)}</strong>{" "}
            de un ticket de {formatCOP(ticket)}
            <span className="text-ceniza">
              {" "}
              · recaudo {formatCOP(costoRecaudoPorPedido)}
            </span>
          </div>
          <div
            className={cx(
              "px-3 py-1.5 rounded-[4px] text-sm",
              margen <= 0
                ? "bg-error/10 text-error"
                : margen < 0.3
                  ? "bg-dorado/15 text-dorado-oscuro"
                  : "bg-morado/10 text-morado",
            )}
          >
            Margen bruto {(margen * 100).toFixed(1)}%
          </div>
        </div>

        {margen <= 0 && (
          <p className="text-xs text-error mt-3">
            Con estos costos cada venta deja saldo en contra. No hay volumen de
            pauta que arregle eso: hay que subir el precio o bajar el costo.
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
            { label: "Facturación", valor: resultado.facturacion },
            { label: "Despachado", valor: resultado.despachado },
            { label: "Recaudado", valor: resultado.recaudo },
            { label: "Ingreso bruto", valor: resultado.ingresoBruto },
          ].map((fila) => (
            <div key={fila.label} className="flex items-center gap-3">
              <span className="text-sm text-carbon w-32 shrink-0">{fila.label}</span>
              <div className="flex-1 h-3 bg-crema rounded-full overflow-hidden">
                <div
                  className="h-full bg-morado transition-all duration-300"
                  style={{
                    width: `${
                      resultado.facturacion > 0
                        ? Math.max(0, (fila.valor / resultado.facturacion) * 100)
                        : 0
                    }%`,
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

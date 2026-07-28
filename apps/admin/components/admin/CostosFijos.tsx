"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatCOP, cx } from "@diana-mile/shared/utils";
import { Button } from "@diana-mile/shared/ui/Button";
import { costoPorDia, costoAdminPorVenta } from "@diana-mile/shared/finanzas/costeo";
import type { CostoFijo } from "@/app/dashboard/financiero/costos-fijos/page";

const CATEGORIAS = [
  { valor: "personal", label: "Personal" },
  { valor: "plataformas", label: "Plataformas" },
  { valor: "administrativo", label: "Administrativo" },
] as const;

const ETIQUETA: Record<string, string> = {
  personal: "Personal",
  plataformas: "Plataformas",
  administrativo: "Administrativo",
};

/** De dónde salió el valor en pesos de una fila. */
const ORIGEN: Record<CostoFijo["origen_cop"], { label: string; clase: string }> = {
  pesos: { label: "", clase: "" },
  real: { label: "extracto", clase: "bg-morado/10 text-morado" },
  trm: { label: "TRM", clase: "bg-dorado/15 text-dorado-oscuro" },
  ultimo_conocido: { label: "sin TRM", clase: "bg-error/10 text-error" },
};

/** La tabla de reparto de la hoja original: cuánto pesa el fijo según el volumen. */
const ESCALONES = [50, 100, 200, 300, 500, 800, 1200];

export function CostosFijos({
  filasIniciales,
  vigentes,
  trmHoy,
  periodo,
}: {
  filasIniciales: CostoFijo[];
  vigentes: CostoFijo[];
  trmHoy: number | null;
  periodo: string;
}) {
  const router = useRouter();
  const [concepto, setConcepto] = useState("");
  const [categoria, setCategoria] =
    useState<(typeof CATEGORIAS)[number]["valor"]>("personal");
  const [moneda, setMoneda] = useState<"COP" | "USD">("COP");
  const [monto, setMonto] = useState("");
  const [diaCobro, setDiaCobro] = useState("1");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Se suma `cop_mes`, que ya trae la conversión con la TRM del día de
  // cobro de este mes. Sumar `monto_cop` dejaría los costos en dólares
  // con el valor de la última vez que se guardaron.
  const totalMes = useMemo(
    () => vigentes.reduce((acc, f) => acc + f.cop_mes, 0),
    [vigentes],
  );

  const enDolares = useMemo(
    () => vigentes.filter((f) => f.moneda === "USD"),
    [vigentes],
  );
  const sinTasa = useMemo(
    () => vigentes.filter((f) => f.origen_cop === "ultimo_conocido"),
    [vigentes],
  );

  const porCategoria = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const fila of vigentes) {
      mapa.set(fila.categoria, (mapa.get(fila.categoria) ?? 0) + fila.cop_mes);
    }
    return Array.from(mapa.entries()).sort((a, b) => b[1] - a[1]);
  }, [vigentes]);

  async function agregar() {
    setError(null);
    const valor = Number(monto.replace(/[^\d.-]/g, ""));

    if (!concepto.trim()) {
      setError("Ponle un nombre al costo.");
      return;
    }
    if (!Number.isFinite(valor) || valor < 0) {
      setError("El monto tiene que ser un número mayor o igual a cero.");
      return;
    }

    const dia = Number(diaCobro);
    if (moneda === "USD" && (!Number.isFinite(dia) || dia < 1 || dia > 28)) {
      setError("El día de cobro va entre 1 y 28.");
      return;
    }

    setGuardando(true);
    try {
      const res = await fetch("/api/admin/costos-fijos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concepto: concepto.trim(),
          categoria,
          moneda,
          montoOrigen: valor,
          diaCobro: moneda === "USD" ? dia : null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "No se pudo guardar.");

      setConcepto("");
      setMonto("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  }

  async function darDeBaja(id: string) {
    setError(null);
    try {
      const res = await fetch("/api/admin/costos-fijos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, darDeBaja: true }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "No se pudo dar de baja.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo dar de baja.");
    }
  }

  /** Lo que el banco cobró de verdad. Manda sobre la conversión por TRM. */
  async function guardarReal(id: string, texto: string) {
    const limpio = texto.trim();
    const valor = limpio === "" ? null : Number(limpio.replace(/[^\d.-]/g, ""));
    if (valor !== null && (!Number.isFinite(valor) || valor < 0)) {
      setError("El monto del extracto tiene que ser un número.");
      return;
    }
    try {
      await fetch("/api/admin/costos-fijos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, montoCopReal: valor }),
      });
      router.refresh();
    } catch {
      setError("No se pudo guardar el monto real.");
    }
  }

  const hoy = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blanco border border-arena rounded-[4px] p-5">
          <p className="text-xs text-ceniza uppercase tracking-wide">Total al mes</p>
          <p className="font-display text-3xl text-carbon mt-1">{formatCOP(totalMes)}</p>
        </div>
        <div className="bg-blanco border border-arena rounded-[4px] p-5">
          <p className="text-xs text-ceniza uppercase tracking-wide">Por día</p>
          <p className="font-display text-3xl text-carbon mt-1">
            {formatCOP(costoPorDia(totalMes))}
          </p>
        </div>
        <div className="bg-blanco border border-arena rounded-[4px] p-5">
          <p className="text-xs text-ceniza uppercase tracking-wide">Dólar de hoy</p>
          <p className="font-display text-3xl text-carbon mt-1">
            {trmHoy ? formatCOP(trmHoy) : "—"}
          </p>
          <p className="text-xs text-ceniza mt-1">
            {trmHoy ? "TRM oficial" : "no se pudo consultar"}
          </p>
        </div>
      </div>

      {enDolares.length > 0 && (
        <div className="rounded-[4px] border border-dorado/40 bg-dorado/5 px-5 py-4">
          <p className="text-sm text-carbon">
            {enDolares.length}{" "}
            {enDolares.length === 1 ? "costo se paga" : "costos se pagan"} en
            dólares. Se convierten con la TRM del día de cobro de cada mes, no con
            la de hoy: así la utilidad de un mes ya cerrado no cambia cuando se
            mueve el dólar.
          </p>
          <p className="text-xs text-carbon-suave mt-2">
            La TRM no es lo que cobra la tarjeta — el banco suma su propio margen y
            el 4x1000. Cuando te llegue el extracto, escribe el valor real en la
            columna <strong>Extracto</strong> y ese manda.
          </p>
        </div>
      )}

      {sinTasa.length > 0 && (
        <div className="rounded-[4px] border border-error/30 bg-error/5 px-5 py-4">
          <p className="text-sm text-error">
            No se pudo consultar la TRM para {sinTasa.length}{" "}
            {sinTasa.length === 1 ? "costo" : "costos"}. Se está mostrando el último
            valor convertido, que puede estar viejo.
          </p>
        </div>
      )}

      {porCategoria.length > 0 && (
        <div className="bg-blanco border border-arena rounded-[4px] p-5">
          <p className="text-xs text-ceniza uppercase tracking-wide mb-3">
            Reparto por categoría
          </p>
          <div className="flex flex-col gap-2">
            {porCategoria.map(([cat, monto_]) => (
              <div key={cat} className="flex items-center gap-3">
                <span className="text-sm text-carbon w-32 shrink-0">
                  {ETIQUETA[cat] ?? cat}
                </span>
                <div className="flex-1 h-2 bg-crema rounded-full overflow-hidden">
                  <div
                    className="h-full bg-morado"
                    style={{ width: `${totalMes > 0 ? (monto_ / totalMes) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm text-carbon-suave w-28 text-right shrink-0">
                  {formatCOP(monto_)}
                </span>
                <span className="text-xs text-ceniza w-10 text-right shrink-0">
                  {totalMes > 0 ? Math.round((monto_ / totalMes) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalMes > 0 && (
        <div className="bg-blanco border border-arena rounded-[4px] p-5">
          <p className="text-xs text-ceniza uppercase tracking-wide mb-1">
            Cuánto le toca a cada venta
          </p>
          <p className="text-xs text-carbon-suave mb-3">
            Se reparte entre las ventas <strong>entregadas</strong>, no entre las
            facturadas: un pedido devuelto consumió operación igual y no dejó un peso.
          </p>
          <div className="flex flex-wrap gap-2">
            {ESCALONES.map((ventas) => (
              <div
                key={ventas}
                className="border border-arena rounded-[4px] px-3 py-2 min-w-[92px]"
              >
                <p className="text-[10px] text-ceniza">{ventas} entregas</p>
                <p className="text-sm text-carbon">
                  {formatCOP(costoAdminPorVenta(totalMes, ventas))}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blanco border border-arena rounded-[4px] p-5">
        <p className="text-xs text-ceniza uppercase tracking-wide mb-3">
          Agregar un costo fijo
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1 flex-1 min-w-[170px]">
            <label className="text-xs text-carbon-suave">Concepto</label>
            <input
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              placeholder="Confirmadora, Shopify, arriendo…"
              className="px-3 py-2 text-sm bg-blanco border border-arena rounded-[4px] focus:outline-none focus:border-carbon-suave"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-carbon-suave">Categoría</label>
            <select
              value={categoria}
              onChange={(e) =>
                setCategoria(e.target.value as (typeof CATEGORIAS)[number]["valor"])
              }
              className="px-3 py-2 text-sm bg-blanco border border-arena rounded-[4px] focus:outline-none focus:border-carbon-suave"
            >
              {CATEGORIAS.map((c) => (
                <option key={c.valor} value={c.valor}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-carbon-suave">Moneda</label>
            <select
              value={moneda}
              onChange={(e) => setMoneda(e.target.value as "COP" | "USD")}
              className="px-3 py-2 text-sm bg-blanco border border-arena rounded-[4px] focus:outline-none focus:border-carbon-suave"
            >
              <option value="COP">Pesos</option>
              <option value="USD">Dólares</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-carbon-suave">
              Monto al mes ({moneda === "USD" ? "USD" : "COP"})
            </label>
            <input
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              inputMode="numeric"
              placeholder={moneda === "USD" ? "39" : "1200000"}
              className="px-3 py-2 text-sm bg-blanco border border-arena rounded-[4px] w-36 focus:outline-none focus:border-carbon-suave"
            />
          </div>
          {moneda === "USD" && (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-carbon-suave">Día de cobro</label>
              <input
                value={diaCobro}
                onChange={(e) => setDiaCobro(e.target.value)}
                inputMode="numeric"
                className="px-3 py-2 text-sm bg-blanco border border-arena rounded-[4px] w-20 focus:outline-none focus:border-carbon-suave"
              />
            </div>
          )}
          <Button disabled={guardando} onClick={() => void agregar()}>
            {guardando ? "Guardando…" : "Agregar"}
          </Button>
        </div>

        {moneda === "USD" && trmHoy && monto && (
          <p className="text-xs text-carbon-suave mt-3">
            A la TRM de hoy serían{" "}
            {formatCOP(Number(monto.replace(/[^\d.-]/g, "")) * trmHoy)}. Cada mes se
            recalcula con la TRM del día {diaCobro}.
          </p>
        )}

        {error && <p className="text-xs text-error mt-3">{error}</p>}
      </div>

      <div className="overflow-x-auto bg-blanco border border-arena rounded-[4px]">
        <table className="w-full text-sm min-w-[820px]">
          <thead>
            <tr className="border-b border-arena text-left">
              <th className="p-3 text-xs uppercase tracking-wide text-ceniza font-normal">
                Concepto
              </th>
              <th className="p-3 text-xs uppercase tracking-wide text-ceniza font-normal">
                Categoría
              </th>
              <th className="p-3 text-xs uppercase tracking-wide text-ceniza font-normal text-right">
                Monto
              </th>
              <th className="p-3 text-xs uppercase tracking-wide text-ceniza font-normal text-right">
                En pesos ({periodo})
              </th>
              <th className="p-3 text-xs uppercase tracking-wide text-ceniza font-normal text-right">
                Extracto
              </th>
              <th className="p-3 text-xs uppercase tracking-wide text-ceniza font-normal">
                Estado
              </th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {filasIniciales.map((fila) => {
              const activo =
                fila.vigente_desde <= hoy &&
                (fila.vigente_hasta === null || fila.vigente_hasta >= hoy);
              const origen = ORIGEN[fila.origen_cop];

              return (
                <tr
                  key={fila.id}
                  className={cx(
                    "border-b border-arena/60 last:border-0",
                    !activo && "opacity-50",
                  )}
                >
                  <td className="p-3 text-carbon">
                    {fila.concepto}
                    {fila.moneda === "USD" && fila.dia_cobro && (
                      <span className="block text-xs text-ceniza mt-0.5">
                        cobra el {fila.dia_cobro} de cada mes
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-carbon-suave">
                    {ETIQUETA[fila.categoria] ?? fila.categoria}
                  </td>
                  <td className="p-3 text-right text-carbon whitespace-nowrap">
                    {fila.moneda === "USD"
                      ? `US$ ${fila.monto_origen.toLocaleString("es-CO")}`
                      : formatCOP(fila.monto_origen)}
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <span className="text-carbon">{formatCOP(fila.cop_mes)}</span>
                    {origen.label && (
                      <span
                        title={fila.nota_cop}
                        className={cx(
                          "ml-2 text-[10px] px-1.5 py-0.5 rounded-[3px] cursor-help",
                          origen.clase,
                        )}
                      >
                        {origen.label}
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    {fila.moneda === "USD" ? (
                      <input
                        defaultValue={
                          fila.monto_cop_real !== null
                            ? String(Math.round(fila.monto_cop_real))
                            : ""
                        }
                        onBlur={(e) => void guardarReal(fila.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") e.currentTarget.blur();
                        }}
                        inputMode="numeric"
                        placeholder="—"
                        title="Lo que cobró la tarjeta. Manda sobre la TRM."
                        className="w-28 px-2 py-1 text-right text-sm bg-blanco border border-arena rounded-[4px] focus:outline-none focus:border-carbon-suave"
                      />
                    ) : (
                      <span className="text-ceniza">—</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span
                      className={cx(
                        "inline-block px-2 py-0.5 rounded-[3px] text-[11px]",
                        activo ? "bg-morado/10 text-morado" : "bg-crema text-ceniza",
                      )}
                    >
                      {activo ? "Activo" : `De baja ${fila.vigente_hasta ?? ""}`}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {activo && (
                      <button
                        onClick={() => void darDeBaja(fila.id)}
                        className="text-xs text-ceniza hover:text-error transition-colors"
                      >
                        Dar de baja
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filasIniciales.length === 0 && (
          <p className="p-6 text-center text-sm text-ceniza">
            Todavía no hay costos fijos. Sin ellos, la proyección calcula utilidad
            como si operar no costara nada.
          </p>
        )}
      </div>
    </div>
  );
}

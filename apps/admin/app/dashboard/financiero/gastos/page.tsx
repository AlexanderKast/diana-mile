"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@diana-mile/shared/ui/Button";
import { Spinner } from "@diana-mile/shared/ui/Spinner";
import { formatCOP } from "@diana-mile/shared/utils";
import type { Gasto } from "@diana-mile/shared/types";

const TIPOS: { value: string; label: string }[] = [
  { value: "publicidad_meta", label: "Publicidad Meta" },
  { value: "publicidad_tiktok", label: "Publicidad TikTok" },
  { value: "publicidad_google", label: "Publicidad Google" },
  { value: "publicidad_otro", label: "Publicidad otro" },
  { value: "plataformas", label: "Plataformas" },
  { value: "logistica", label: "Logistica" },
  { value: "producto", label: "Producto" },
  { value: "nomina", label: "Nomina" },
  { value: "operativo", label: "Operativo" },
  { value: "otro", label: "Otro" },
];

function periodoActual(): string {
  const ahora = new Date();
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  return `${anio}-${mes}`;
}

function fechaHoy(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO");
}

const inputClass =
  "min-h-[44px] rounded-[2px] border border-arena bg-blanco px-3 py-2 text-sm text-carbon focus:outline-none focus:border-dorado";

export default function GastosPage() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroPeriodo, setFiltroPeriodo] = useState(periodoActual());

  const [tipo, setTipo] = useState(TIPOS[0].value);
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [moneda, setMoneda] = useState<"COP" | "USD">("COP");
  const [tasaCambio, setTasaCambio] = useState("1");
  const [fecha, setFecha] = useState(fechaHoy());
  const [plataforma, setPlataforma] = useState("");
  const [campana, setCampana] = useState("");
  const [notas, setNotas] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const cargarGastos = async () => {
    setCargando(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (filtroTipo) query.set("tipo", filtroTipo);
      if (filtroPeriodo) query.set("periodo", filtroPeriodo);
      const res = await fetch(`/api/admin/gastos?${query.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "No se pudieron cargar los gastos.");
      setGastos(json.gastos ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar los gastos.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarGastos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroTipo, filtroPeriodo]);

  const totalPeriodo = useMemo(
    () => gastos.reduce((acc, g) => acc + (g.monto_cop ?? 0), 0),
    [gastos]
  );

  const registrarGasto = async () => {
    if (!descripcion.trim() || !monto || !fecha) {
      setErrorForm("Descripcion, monto y fecha son obligatorios.");
      return;
    }
    setEnviando(true);
    setErrorForm(null);
    try {
      const res = await fetch("/api/admin/gastos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          descripcion: descripcion.trim(),
          monto: Number(monto),
          moneda,
          tasa_cambio: moneda === "USD" ? Number(tasaCambio) || 1 : 1,
          fecha,
          plataforma: plataforma.trim() || undefined,
          campana: campana.trim() || undefined,
          notas: notas.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "No se pudo registrar el gasto.");

      setDescripcion("");
      setMonto("");
      setPlataforma("");
      setCampana("");
      setNotas("");
      setTasaCambio("1");
      setMoneda("COP");
      setFecha(fechaHoy());

      await cargarGastos();
    } catch (err) {
      setErrorForm(err instanceof Error ? err.message : "No se pudo registrar el gasto.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="font-display text-2xl text-carbon">Gastos</h1>
        <Link href="/dashboard/financiero">
          <Button variant="secondary">Volver a Financiero</Button>
        </Link>
      </div>

      <div className="bg-blanco border border-arena rounded-[4px] p-5 mb-6">
        <h2 className="font-display text-xl text-carbon mb-4">Registrar gasto nuevo</h2>

        {errorForm && (
          <div className="mb-4 rounded-[2px] border border-error/30 bg-error/5 px-4 py-2 text-sm text-error">
            {errorForm}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-ceniza font-medium">Tipo</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={inputClass}>
              {TIPOS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs text-ceniza font-medium">Descripcion</label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-ceniza font-medium">Monto</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-ceniza font-medium">Moneda</label>
            <select
              value={moneda}
              onChange={(e) => setMoneda(e.target.value as "COP" | "USD")}
              className={inputClass}
            >
              <option value="COP">COP</option>
              <option value="USD">USD</option>
            </select>
          </div>

          {moneda === "USD" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-ceniza font-medium">Tasa de cambio (COP)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={tasaCambio}
                onChange={(e) => setTasaCambio(e.target.value)}
                className={inputClass}
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-ceniza font-medium">Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-ceniza font-medium">Plataforma</label>
            <input
              type="text"
              value={plataforma}
              onChange={(e) => setPlataforma(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-ceniza font-medium">Campana</label>
            <input
              type="text"
              value={campana}
              onChange={(e) => setCampana(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-3">
            <label className="text-xs text-ceniza font-medium">Notas</label>
            <input
              type="text"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <Button onClick={registrarGasto} disabled={enviando}>
          {enviando ? <Spinner /> : "Registrar gasto"}
        </Button>
      </div>

      <div className="bg-blanco border border-arena rounded-[4px] p-5">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h2 className="font-display text-xl text-carbon">Gastos registrados</h2>
          <span className="text-sm text-carbon-suave">
            Total del periodo visible: {formatCOP(totalPeriodo)}
          </span>
        </div>

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-ceniza font-medium">Filtrar por tipo</label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className={inputClass}
            >
              <option value="">Todos</option>
              {TIPOS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-ceniza font-medium">Filtrar por mes</label>
            <input
              type="month"
              value={filtroPeriodo}
              onChange={(e) => setFiltroPeriodo(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-[2px] border border-error/30 bg-error/5 px-4 py-2 text-sm text-error">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-arena text-ceniza text-xs uppercase">
                <th className="text-left py-2 pr-2">Fecha</th>
                <th className="text-left py-2 pr-2">Tipo</th>
                <th className="text-left py-2 pr-2">Descripcion</th>
                <th className="text-left py-2 pr-2">Plataforma</th>
                <th className="text-right py-2 pr-2">Monto</th>
                <th className="text-right py-2">Monto COP</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-ceniza">
                    <Spinner className="mr-2" /> Cargando gastos...
                  </td>
                </tr>
              ) : gastos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-ceniza">
                    Sin gastos para este filtro.
                  </td>
                </tr>
              ) : (
                gastos.map((gasto) => (
                  <tr key={gasto.id} className="border-b border-arena/50">
                    <td className="py-2 pr-2 text-carbon-suave whitespace-nowrap">
                      {formatFecha(gasto.fecha)}
                    </td>
                    <td className="py-2 pr-2 text-carbon">
                      {TIPOS.find((t) => t.value === gasto.tipo)?.label ?? gasto.tipo}
                    </td>
                    <td className="py-2 pr-2 text-carbon-suave">{gasto.descripcion}</td>
                    <td className="py-2 pr-2 text-carbon-suave">{gasto.plataforma ?? "-"}</td>
                    <td className="py-2 pr-2 text-right text-carbon-suave whitespace-nowrap">
                      {gasto.moneda === "USD" ? `US$ ${gasto.monto}` : formatCOP(gasto.monto)}
                    </td>
                    <td className="py-2 text-right text-carbon whitespace-nowrap">
                      {formatCOP(gasto.monto_cop ?? 0)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

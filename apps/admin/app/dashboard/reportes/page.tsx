"use client";

import { useMemo, useState } from "react";
import { Button } from "@diana-mile/shared/ui/Button";
import { Spinner } from "@diana-mile/shared/ui/Spinner";

type TipoReporte = "pedidos" | "financiero" | "leads" | "transportadoras";
type FormatoReporte = "csv" | "json";

const TIPOS: { value: TipoReporte; label: string }[] = [
  { value: "pedidos", label: "Pedidos" },
  { value: "financiero", label: "Financiero" },
  { value: "leads", label: "Leads" },
  { value: "transportadoras", label: "Transportadoras" },
];

const FORMATOS: { value: FormatoReporte; label: string }[] = [
  { value: "csv", label: "CSV" },
  { value: "json", label: "JSON" },
];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function toYMD(fecha: Date): string {
  return `${fecha.getFullYear()}-${pad2(fecha.getMonth() + 1)}-${pad2(fecha.getDate())}`;
}

function inicioSemana(referencia: Date): Date {
  const copia = new Date(referencia);
  const dia = copia.getDay();
  const diferencia = dia === 0 ? 6 : dia - 1; // Semana inicia lunes
  copia.setDate(copia.getDate() - diferencia);
  return copia;
}

function formatCelda(valor: unknown): string {
  if (valor === null || valor === undefined || valor === "") return "-";
  if (typeof valor === "object") return JSON.stringify(valor);
  return String(valor);
}

export default function ReportesPage() {
  const [tipo, setTipo] = useState<TipoReporte>("pedidos");
  const [formato, setFormato] = useState<FormatoReporte>("csv");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const [previewFilas, setPreviewFilas] = useState<Record<string, unknown>[] | null>(null);
  const [totalFilas, setTotalFilas] = useState(0);
  const [generando, setGenerando] = useState(false);
  const [descargando, setDescargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const columnas = useMemo(() => {
    if (!previewFilas || previewFilas.length === 0) return [];
    return Object.keys(previewFilas[0]);
  }, [previewFilas]);

  const aplicarEstaSemana = () => {
    const hoy = new Date();
    setFechaDesde(toYMD(inicioSemana(hoy)));
    setFechaHasta(toYMD(hoy));
  };

  const aplicarEsteMes = () => {
    const hoy = new Date();
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    setFechaDesde(toYMD(inicio));
    setFechaHasta(toYMD(hoy));
  };

  const construirQuery = (formatoElegido: FormatoReporte) => {
    const params = new URLSearchParams({ tipo, formato: formatoElegido });
    if (fechaDesde) params.set("fecha_desde", fechaDesde);
    if (fechaHasta) params.set("fecha_hasta", fechaHasta);
    return params.toString();
  };

  const handleGenerar = async () => {
    setGenerando(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reportes?${construirQuery("json")}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "No se pudo generar el reporte.");

      const datos = (json.datos ?? []) as Record<string, unknown>[];
      setTotalFilas(datos.length);
      setPreviewFilas(datos.slice(0, 10));
    } catch (e) {
      setPreviewFilas(null);
      setTotalFilas(0);
      setError(e instanceof Error ? e.message : "No se pudo generar el reporte.");
    } finally {
      setGenerando(false);
    }
  };

  const handleDescargar = async () => {
    setDescargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reportes?${construirQuery(formato)}`);
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error ?? "No se pudo generar el reporte.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      const fecha = new Date().toISOString().slice(0, 10);
      const extension = formato === "csv" ? "csv" : "json";
      enlace.href = url;
      enlace.download = `reporte-${tipo}-${fecha}.${extension}`;
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo generar el reporte.");
    } finally {
      setDescargando(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl text-carbon mb-6">Reportes</h1>

      <div className="bg-blanco border border-arena rounded-[4px] p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-ceniza font-medium">Tipo de reporte</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoReporte)}
              className="min-h-[44px] rounded-[2px] border border-arena bg-blanco px-3 py-2 text-sm text-carbon focus:outline-none focus:border-dorado"
            >
              {TIPOS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-ceniza font-medium">Desde</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="min-h-[44px] rounded-[2px] border border-arena bg-blanco px-3 py-2 text-sm text-carbon focus:outline-none focus:border-dorado"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-ceniza font-medium">Hasta</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="min-h-[44px] rounded-[2px] border border-arena bg-blanco px-3 py-2 text-sm text-carbon focus:outline-none focus:border-dorado"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-ceniza font-medium">Formato de descarga</label>
            <select
              value={formato}
              onChange={(e) => setFormato(e.target.value as FormatoReporte)}
              className="min-h-[44px] rounded-[2px] border border-arena bg-blanco px-3 py-2 text-sm text-carbon focus:outline-none focus:border-dorado"
            >
              {FORMATOS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={aplicarEstaSemana}
              className="text-xs text-morado hover:text-morado-oscuro underline underline-offset-2"
            >
              Esta semana
            </button>
            <span className="text-xs text-ceniza">·</span>
            <button
              type="button"
              onClick={aplicarEsteMes}
              className="text-xs text-morado hover:text-morado-oscuro underline underline-offset-2"
            >
              Este mes
            </button>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" disabled={generando} onClick={handleGenerar}>
              {generando ? <Spinner /> : "Generar reporte"}
            </Button>
            <Button disabled={descargando} onClick={handleDescargar}>
              {descargando ? <Spinner /> : "Descargar completo"}
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-[2px] border border-error/30 bg-error/5 px-4 py-2 text-sm text-error">
          {error}
        </div>
      )}

      {previewFilas && (
        <div>
          <p className="text-xs text-ceniza mb-2">
            Mostrando {previewFilas.length} de {totalFilas} fila{totalFilas === 1 ? "" : "s"}
          </p>
          <div className="overflow-x-auto bg-blanco border border-arena rounded-[4px]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-arena text-ceniza text-xs uppercase">
                  {columnas.map((col) => (
                    <th key={col} className="text-left py-3 px-4 whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewFilas.length === 0 ? (
                  <tr>
                    <td colSpan={Math.max(columnas.length, 1)} className="py-6 text-center text-ceniza">
                      Sin datos para el rango seleccionado.
                    </td>
                  </tr>
                ) : (
                  previewFilas.map((fila, idx) => (
                    <tr key={idx} className="border-b border-arena/50">
                      {columnas.map((col) => (
                        <td key={col} className="py-3 px-4 text-carbon-suave whitespace-nowrap">
                          {formatCelda(fila[col])}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

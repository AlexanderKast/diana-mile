"use client";

import { useMemo, useState } from "react";
import { Button } from "@diana-mile/shared/ui/Button";
import { cx } from "@diana-mile/shared/utils";
import type { Lead } from "@diana-mile/shared/types";

type LeadsTableProps = {
  leads: Lead[];
};

const FUENTE_LABELS: Record<string, string> = {
  checkout_abandonado: "Carrito abandonado",
  linktree: "Linktree",
  home: "Home",
};

function fuenteLabel(fuente: string | null): string {
  if (!fuente) return "-";
  return FUENTE_LABELS[fuente] ?? fuente;
}

function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO");
}

function csvEscape(value: string | null | undefined): string {
  let texto = value ?? "";
  if (/^[=+\-@\t\r]/.test(texto)) {
    texto = `'${texto}`;
  }
  if (/[",\n\r]/.test(texto)) {
    return `"${texto.replace(/"/g, '""')}"`;
  }
  return texto;
}

function exportarCSV(leads: Lead[]) {
  const encabezados = [
    "Fecha",
    "Nombre",
    "Telefono",
    "Ciudad",
    "Producto de interes",
    "Fuente",
    "Convertido",
  ];
  const filas = leads.map((lead) =>
    [
      formatFecha(lead.created_at),
      lead.nombre,
      lead.telefono,
      lead.ciudad ?? "",
      lead.producto_interes ?? "",
      fuenteLabel(lead.fuente),
      lead.convertido ? "Si" : "No",
    ]
      .map(csvEscape)
      .join(",")
  );
  const csv = [encabezados.join(","), ...filas].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  const fecha = new Date().toISOString().slice(0, 10);
  enlace.href = url;
  enlace.download = `leads-milito-life-shop-${fecha}.csv`;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}

export default function LeadsTable({ leads }: LeadsTableProps) {
  const [soloCarritosPendientes, setSoloCarritosPendientes] = useState(false);

  const leadsFiltrados = useMemo(() => {
    if (!soloCarritosPendientes) return leads;
    return leads.filter((lead) => lead.fuente === "checkout_abandonado" && !lead.convertido);
  }, [leads, soloCarritosPendientes]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <label className="flex items-center gap-2 text-sm text-carbon-suave">
          <input
            type="checkbox"
            checked={soloCarritosPendientes}
            onChange={(e) => setSoloCarritosPendientes(e.target.checked)}
            className="h-4 w-4 accent-morado"
          />
          Solo carritos abandonados sin convertir
        </label>
        <div className="flex items-center gap-3">
          <span className="text-xs text-ceniza">
            {leadsFiltrados.length} lead{leadsFiltrados.length === 1 ? "" : "s"}
          </span>
          <Button variant="secondary" onClick={() => exportarCSV(leadsFiltrados)}>
            Exportar CSV
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto bg-blanco border border-arena rounded-[4px]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-arena text-ceniza text-xs uppercase">
              <th className="text-left py-3 px-4">Fecha</th>
              <th className="text-left py-3 px-4">Nombre</th>
              <th className="text-left py-3 px-4">Telefono</th>
              <th className="text-left py-3 px-4">Ciudad</th>
              <th className="text-left py-3 px-4">Producto de interes</th>
              <th className="text-left py-3 px-4">Fuente</th>
              <th className="text-left py-3 px-4">Estado</th>
            </tr>
          </thead>
          <tbody>
            {leadsFiltrados.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-ceniza">
                  Sin leads todavia.
                </td>
              </tr>
            ) : (
              leadsFiltrados.map((lead) => (
                <tr key={lead.id} className="border-b border-arena/50">
                  <td className="py-3 px-4 text-carbon-suave whitespace-nowrap">
                    {formatFecha(lead.created_at)}
                  </td>
                  <td className="py-3 px-4 text-carbon">{lead.nombre}</td>
                  <td className="py-3 px-4 text-carbon-suave">{lead.telefono}</td>
                  <td className="py-3 px-4 text-carbon-suave">{lead.ciudad ?? "-"}</td>
                  <td className="py-3 px-4 text-carbon-suave">
                    {lead.producto_interes ?? "-"}
                  </td>
                  <td className="py-3 px-4 text-carbon-suave">{fuenteLabel(lead.fuente)}</td>
                  <td className="py-3 px-4">
                    {lead.fuente === "checkout_abandonado" ? (
                      <span
                        className={cx(
                          "inline-block px-2.5 py-1 rounded-[2px] text-xs font-medium",
                          lead.convertido ? "bg-dorado/20 text-dorado-oscuro" : "bg-morado/15 text-morado"
                        )}
                      >
                        {lead.convertido ? "Convertido" : "Pendiente"}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

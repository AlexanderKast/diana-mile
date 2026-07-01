"use client";

import { Button } from "@/components/ui/Button";
import type { Lead } from "@/types";

type LeadsTableProps = {
  leads: Lead[];
};

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
  const encabezados = ["Fecha", "Nombre", "Telefono", "Ciudad", "Producto de interes", "Fuente"];
  const filas = leads.map((lead) =>
    [
      formatFecha(lead.created_at),
      lead.nombre,
      lead.telefono,
      lead.ciudad ?? "",
      lead.producto_interes ?? "",
      lead.fuente ?? "",
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
  enlace.download = `leads-diana-mile-${fecha}.csv`;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}

export default function LeadsTable({ leads }: LeadsTableProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3">
        <span className="text-xs text-ceniza">
          {leads.length} lead{leads.length === 1 ? "" : "s"}
        </span>
        <Button variant="secondary" onClick={() => exportarCSV(leads)}>
          Exportar CSV
        </Button>
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
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-ceniza">
                  Sin leads todavia.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
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
                  <td className="py-3 px-4 text-carbon-suave">{lead.fuente ?? "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

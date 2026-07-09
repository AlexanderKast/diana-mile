"use client";

import { Fragment, useMemo, useState } from "react";
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
  const [leadsLocal, setLeadsLocal] = useState<Lead[]>(leads);
  const [filaAbierta, setFilaAbierta] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [errorConfirmar, setErrorConfirmar] = useState<string | null>(null);

  const [direccion, setDireccion] = useState("");
  const [barrio, setBarrio] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [ciudadForm, setCiudadForm] = useState("");
  const [productoForm, setProductoForm] = useState("");
  const [cantidadForm, setCantidadForm] = useState("1");
  const [precioForm, setPrecioForm] = useState("");
  const [notasForm, setNotasForm] = useState("");

  const leadsFiltrados = useMemo(() => {
    if (!soloCarritosPendientes) return leadsLocal;
    return leadsLocal.filter((lead) => lead.fuente === "checkout_abandonado" && !lead.convertido);
  }, [leadsLocal, soloCarritosPendientes]);

  const abrirConfirmacion = (lead: Lead) => {
    if (filaAbierta === lead.id) {
      setFilaAbierta(null);
      return;
    }
    setFilaAbierta(lead.id);
    setErrorConfirmar(null);
    setDireccion("");
    setBarrio("");
    setDepartamento("");
    setCiudadForm(lead.ciudad ?? "");
    setProductoForm(lead.producto_interes ?? "");
    setCantidadForm("1");
    setPrecioForm("");
    setNotasForm("");
  };

  const handleConfirmarLead = async (leadId: string) => {
    if (!direccion.trim() || !ciudadForm.trim() || !productoForm.trim() || !precioForm) {
      setErrorConfirmar("Dirección, ciudad, producto y precio son obligatorios.");
      return;
    }
    setEnviando(true);
    setErrorConfirmar(null);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/confirmar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          direccion: direccion.trim(),
          barrio: barrio.trim() || undefined,
          departamento: departamento.trim() || undefined,
          ciudad: ciudadForm.trim(),
          producto_nombre: productoForm.trim(),
          cantidad: Number(cantidadForm) || 1,
          precio_total: Number(precioForm),
          notas: notasForm.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "No se pudo confirmar el lead.");

      setLeadsLocal((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, convertido: true } : l))
      );
      setFilaAbierta(null);
    } catch (e) {
      setErrorConfirmar(e instanceof Error ? e.message : "No se pudo confirmar el lead.");
    } finally {
      setEnviando(false);
    }
  };

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

      {errorConfirmar && (
        <div className="mb-4 rounded-[2px] border border-error/30 bg-error/5 px-4 py-2 text-sm text-error">
          {errorConfirmar}
        </div>
      )}

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
              <th className="text-left py-3 px-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {leadsFiltrados.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-6 text-center text-ceniza">
                  Sin leads todavia.
                </td>
              </tr>
            ) : (
              leadsFiltrados.map((lead) => (
                <Fragment key={lead.id}>
                  <tr className="border-b border-arena/50">
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
                    <td className="py-3 px-4">
                      {!lead.convertido && (
                        <Button
                          variant="secondary"
                          className="!min-h-0 !py-1.5 !px-3 text-xs"
                          onClick={() => abrirConfirmacion(lead)}
                        >
                          Confirmar → Pedido
                        </Button>
                      )}
                    </td>
                  </tr>
                  {filaAbierta === lead.id && (
                    <tr className="border-b border-arena/50 bg-crema">
                      <td colSpan={8} className="py-4 px-4">
                        <p className="text-xs text-ceniza uppercase mb-3">
                          Completar datos de envío para crear el pedido
                          {lead.shopify_draft_order_id
                            ? " (se completará el draft order de Shopify)"
                            : " (se creará una orden nueva en Shopify)"}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                          <input
                            type="text"
                            placeholder="Dirección"
                            value={direccion}
                            onChange={(e) => setDireccion(e.target.value)}
                            className="min-h-[44px] rounded-[2px] border border-arena bg-blanco px-3 py-2 text-sm text-carbon focus:outline-none focus:border-dorado"
                          />
                          <input
                            type="text"
                            placeholder="Barrio"
                            value={barrio}
                            onChange={(e) => setBarrio(e.target.value)}
                            className="min-h-[44px] rounded-[2px] border border-arena bg-blanco px-3 py-2 text-sm text-carbon focus:outline-none focus:border-dorado"
                          />
                          <input
                            type="text"
                            placeholder="Departamento"
                            value={departamento}
                            onChange={(e) => setDepartamento(e.target.value)}
                            className="min-h-[44px] rounded-[2px] border border-arena bg-blanco px-3 py-2 text-sm text-carbon focus:outline-none focus:border-dorado"
                          />
                          <input
                            type="text"
                            placeholder="Ciudad"
                            value={ciudadForm}
                            onChange={(e) => setCiudadForm(e.target.value)}
                            className="min-h-[44px] rounded-[2px] border border-arena bg-blanco px-3 py-2 text-sm text-carbon focus:outline-none focus:border-dorado"
                          />
                          <input
                            type="text"
                            placeholder="Producto"
                            value={productoForm}
                            onChange={(e) => setProductoForm(e.target.value)}
                            className="min-h-[44px] rounded-[2px] border border-arena bg-blanco px-3 py-2 text-sm text-carbon focus:outline-none focus:border-dorado"
                          />
                          <input
                            type="number"
                            min={1}
                            placeholder="Cantidad"
                            value={cantidadForm}
                            onChange={(e) => setCantidadForm(e.target.value)}
                            className="min-h-[44px] rounded-[2px] border border-arena bg-blanco px-3 py-2 text-sm text-carbon focus:outline-none focus:border-dorado"
                          />
                          <input
                            type="number"
                            placeholder="Precio total (COP)"
                            value={precioForm}
                            onChange={(e) => setPrecioForm(e.target.value)}
                            className="min-h-[44px] rounded-[2px] border border-arena bg-blanco px-3 py-2 text-sm text-carbon focus:outline-none focus:border-dorado"
                          />
                          <input
                            type="text"
                            placeholder="Notas"
                            value={notasForm}
                            onChange={(e) => setNotasForm(e.target.value)}
                            className="min-h-[44px] rounded-[2px] border border-arena bg-blanco px-3 py-2 text-sm text-carbon focus:outline-none focus:border-dorado md:col-span-2"
                          />
                        </div>
                        <Button disabled={enviando} onClick={() => handleConfirmarLead(lead.id)}>
                          Crear pedido
                        </Button>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

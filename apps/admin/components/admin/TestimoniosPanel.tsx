"use client";

import { useMemo, useState } from "react";
import { Button } from "@diana-mile/shared/ui/Button";
import { cx } from "@diana-mile/shared/utils";
import type { Testimonio } from "@diana-mile/shared/types";

type Filtro = "todos" | Testimonio["estado"];

const FILTROS: { valor: Filtro; label: string }[] = [
  { valor: "pendiente", label: "Pendientes" },
  { valor: "aprobado", label: "Aprobados" },
  { valor: "rechazado", label: "Rechazados" },
  { valor: "todos", label: "Todos" },
];

const ESTADO_ESTILO: Record<Testimonio["estado"], string> = {
  pendiente: "bg-morado/15 text-morado",
  aprobado: "bg-dorado/20 text-dorado-oscuro",
  rechazado: "bg-error/10 text-error",
};

const ESTADO_LABEL: Record<Testimonio["estado"], string> = {
  pendiente: "Pendiente",
  aprobado: "Publicable",
  rechazado: "Rechazado",
};

const ORDEN: Record<Testimonio["estado"], number> = {
  pendiente: 0,
  aprobado: 1,
  rechazado: 2,
};

function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO");
}

const campoClase =
  "min-h-[44px] w-full rounded-[2px] border border-arena bg-blanco px-3 py-2 text-sm text-carbon focus:outline-none focus:border-dorado";

export default function TestimoniosPanel({
  testimonios,
}: {
  testimonios: Testimonio[];
}) {
  const [lista, setLista] = useState<Testimonio[]>(testimonios);
  const [filtro, setFiltro] = useState<Filtro>("pendiente");
  const [guardando, setGuardando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const visibles = useMemo(() => {
    const filtrados =
      filtro === "todos" ? lista : lista.filter((t) => t.estado === filtro);
    return [...filtrados].sort((a, b) => ORDEN[a.estado] - ORDEN[b.estado]);
  }, [lista, filtro]);

  const aplicar = (id: string, cambios: Partial<Testimonio>) => {
    setLista((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...cambios } : t)),
    );
  };

  /**
   * Guarda contra el servidor. Los campos de texto ya se editaron en local
   * mientras se escribia; esto es lo que persiste.
   */
  const guardar = async (id: string, cambios: Partial<Testimonio>) => {
    setGuardando(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/testimonios/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cambios),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "No se pudo guardar.");
      aplicar(id, json.testimonio as Testimonio);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setGuardando(null);
    }
  };

  const borrar = async (id: string) => {
    setGuardando(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/testimonios/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "No se pudo borrar.");
      }
      setLista((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo borrar.");
    } finally {
      setGuardando(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {FILTROS.map((f) => (
            <button
              key={f.valor}
              type="button"
              onClick={() => setFiltro(f.valor)}
              className={cx(
                "px-3 py-1.5 rounded-[2px] text-sm border transition-colors",
                filtro === f.valor
                  ? "border-morado bg-morado/10 text-morado"
                  : "border-arena text-carbon-suave hover:border-ceniza",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-ceniza">
          {visibles.length} testimonio{visibles.length === 1 ? "" : "s"}
        </span>
      </div>

      {error && (
        <div className="mb-4 rounded-[2px] border border-error/30 bg-error/5 px-4 py-2 text-sm text-error">
          {error}
        </div>
      )}

      {visibles.length === 0 ? (
        <p className="rounded-[4px] border border-arena bg-blanco px-4 py-6 text-center text-sm text-ceniza">
          Nada por aquí todavía. Los testimonios entran solos cuando una
          clienta responde a la pregunta que se le manda unos días después de
          la entrega.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {visibles.map((t) => {
            const ocupado = guardando === t.id;
            return (
              <article
                key={t.id}
                className="rounded-[4px] border border-arena bg-blanco p-4"
              >
                <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                  <span
                    className={cx(
                      "px-2.5 py-1 rounded-[2px] text-xs font-medium",
                      ESTADO_ESTILO[t.estado],
                    )}
                  >
                    {ESTADO_LABEL[t.estado]}
                  </span>
                  <span className="text-xs text-ceniza">
                    {formatFecha(t.created_at)}
                    {t.producto_handle ? ` · ${t.producto_handle}` : ""}
                    {t.telefono ? ` · ${t.telefono}` : ""}
                  </span>
                </div>

                <textarea
                  value={t.texto}
                  rows={3}
                  disabled={ocupado}
                  onChange={(e) => aplicar(t.id, { texto: e.target.value })}
                  onBlur={(e) => {
                    // Vacio no se guarda: el servidor lo rechaza y ademas
                    // borrar el texto no es una correccion, es perderlo.
                    const texto = e.target.value.trim();
                    if (texto) guardar(t.id, { texto });
                  }}
                  className={cx(campoClase, "mb-3 resize-y")}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={t.nombre ?? ""}
                    disabled={ocupado}
                    onChange={(e) => aplicar(t.id, { nombre: e.target.value })}
                    onBlur={(e) => guardar(t.id, { nombre: e.target.value })}
                    className={campoClase}
                  />
                  <input
                    type="text"
                    placeholder="Ciudad"
                    value={t.ciudad ?? ""}
                    disabled={ocupado}
                    onChange={(e) => aplicar(t.id, { ciudad: e.target.value })}
                    onBlur={(e) => guardar(t.id, { ciudad: e.target.value })}
                    className={campoClase}
                  />
                </div>

                <label className="flex items-start gap-2 text-sm text-carbon-suave mb-3">
                  <input
                    type="checkbox"
                    checked={t.consentimiento}
                    disabled={ocupado}
                    onChange={(e) =>
                      guardar(t.id, { consentimiento: e.target.checked })
                    }
                    className="mt-0.5 h-4 w-4 accent-morado"
                  />
                  <span>
                    La clienta autorizó publicarlo
                    <span className="block text-xs text-ceniza">
                      Márcalo solo si lo dijo. Sin esto no se puede aprobar.
                    </span>
                  </span>
                </label>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    disabled={ocupado || !t.consentimiento || t.estado === "aprobado"}
                    onClick={() => guardar(t.id, { estado: "aprobado" })}
                  >
                    Aprobar
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={ocupado || t.estado === "rechazado"}
                    onClick={() => guardar(t.id, { estado: "rechazado" })}
                  >
                    Rechazar
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={ocupado}
                    onClick={() => borrar(t.id)}
                  >
                    Borrar
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

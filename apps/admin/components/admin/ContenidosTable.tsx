"use client";

import { useState } from "react";
import { cx } from "@diana-mile/shared/utils";
import { Button } from "@diana-mile/shared/ui/Button";
import { Input, Textarea } from "@diana-mile/shared/ui/Input";
import type { Contenido, TipoContenido } from "@diana-mile/shared/types";

type ContenidosTableProps = {
  contenidos: Contenido[];
};

const TIPOS: { value: TipoContenido; label: string }[] = [
  { value: "rutina", label: "Rutina" },
  { value: "guia", label: "Guía" },
  { value: "plan_alimentacion", label: "Plan de alimentación" },
];

const TIPO_LABELS: Record<TipoContenido, string> = {
  rutina: "Rutina",
  guia: "Guía",
  plan_alimentacion: "Plan de alimentación",
};

type FormState = {
  titulo: string;
  tipo: TipoContenido;
  descripcion: string;
  cuerpo: string;
  orden: string;
  publicado: boolean;
};

const FORM_VACIO: FormState = {
  titulo: "",
  tipo: "rutina",
  descripcion: "",
  cuerpo: "",
  orden: "0",
  publicado: false,
};

export default function ContenidosTable({ contenidos }: ContenidosTableProps) {
  const [items, setItems] = useState<Contenido[]>(contenidos);
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(FORM_VACIO);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [actualizandoId, setActualizandoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function abrirCrear() {
    setEditandoId(null);
    setForm(FORM_VACIO);
    setArchivo(null);
    setError(null);
    setPanelAbierto(true);
  }

  function abrirEditar(item: Contenido) {
    setEditandoId(item.id);
    setForm({
      titulo: item.titulo,
      tipo: item.tipo,
      descripcion: item.descripcion ?? "",
      cuerpo: item.cuerpo ?? "",
      orden: String(item.orden),
      publicado: item.publicado,
    });
    setArchivo(null);
    setError(null);
    setPanelAbierto(true);
  }

  async function handleGuardar() {
    setError(null);
    if (!form.titulo.trim()) {
      setError("El título es obligatorio.");
      return;
    }

    setGuardando(true);
    try {
      if (editandoId) {
        const res = await fetch(`/api/admin/contenidos/${editandoId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            titulo: form.titulo.trim(),
            tipo: form.tipo,
            descripcion: form.descripcion.trim() || null,
            cuerpo: form.cuerpo.trim() || null,
            orden: Number(form.orden) || 0,
            publicado: form.publicado,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Error");
        setItems((prev) =>
          prev.map((c) =>
            c.id === editandoId ? (json.contenido as Contenido) : c,
          ),
        );
      } else {
        const fd = new FormData();
        fd.set("titulo", form.titulo.trim());
        fd.set("tipo", form.tipo);
        fd.set("descripcion", form.descripcion.trim());
        fd.set("cuerpo", form.cuerpo.trim());
        fd.set("orden", form.orden);
        fd.set("publicado", String(form.publicado));
        if (archivo) fd.set("archivo", archivo);

        const res = await fetch("/api/admin/contenidos", {
          method: "POST",
          body: fd,
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Error");
        setItems((prev) => [...prev, json.contenido as Contenido]);
      }

      setPanelAbierto(false);
      setForm(FORM_VACIO);
      setArchivo(null);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudo guardar el contenido.",
      );
    } finally {
      setGuardando(false);
    }
  }

  async function handleTogglePublicado(item: Contenido) {
    setActualizandoId(item.id);
    try {
      const res = await fetch(`/api/admin/contenidos/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicado: !item.publicado }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error");
      setItems((prev) =>
        prev.map((c) => (c.id === item.id ? (json.contenido as Contenido) : c)),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo actualizar.");
    } finally {
      setActualizandoId(null);
    }
  }

  async function handleEliminar(id: string) {
    setActualizandoId(id);
    try {
      const res = await fetch(`/api/admin/contenidos/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error");
      setItems((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo eliminar.");
    } finally {
      setActualizandoId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-ceniza">
          {items.length} contenido{items.length === 1 ? "" : "s"}
        </span>
        <Button
          variant="secondary"
          className="!min-h-0 !py-2 !px-4 text-sm"
          onClick={() => (panelAbierto ? setPanelAbierto(false) : abrirCrear())}
        >
          {panelAbierto ? "Cancelar" : "+ Nuevo contenido"}
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-[2px] border border-error/30 bg-error/5 px-4 py-2 text-sm text-error">
          {error}
        </div>
      )}

      {panelAbierto && (
        <div className="mb-4 bg-blanco border border-arena rounded-[4px] p-4 flex flex-col gap-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label="Título"
              value={form.titulo}
              onChange={(e) =>
                setForm((f) => ({ ...f, titulo: e.target.value }))
              }
            />
            <label className="text-sm">
              <span className="block text-xs text-ceniza font-medium mb-1.5">
                Tipo
              </span>
              <select
                value={form.tipo}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    tipo: e.target.value as TipoContenido,
                  }))
                }
                className="min-h-[44px] w-full rounded-[2px] border border-arena bg-blanco px-3 py-2 text-sm text-carbon focus:outline-none focus:border-dorado"
              >
                {TIPOS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <Input
            label="Descripción corta"
            value={form.descripcion}
            onChange={(e) =>
              setForm((f) => ({ ...f, descripcion: e.target.value }))
            }
          />
          <Textarea
            label="Cuerpo (texto)"
            rows={6}
            value={form.cuerpo}
            onChange={(e) => setForm((f) => ({ ...f, cuerpo: e.target.value }))}
          />
          <div className="grid gap-3 md:grid-cols-[auto_auto_1fr] items-end">
            <Input
              label="Orden"
              type="number"
              value={form.orden}
              onChange={(e) =>
                setForm((f) => ({ ...f, orden: e.target.value }))
              }
              className="w-24"
            />
            <label className="flex items-center gap-2 text-sm text-carbon pb-2.5">
              <input
                type="checkbox"
                checked={form.publicado}
                onChange={(e) =>
                  setForm((f) => ({ ...f, publicado: e.target.checked }))
                }
              />
              Publicado
            </label>
            {!editandoId && (
              <label className="text-sm">
                <span className="block text-xs text-ceniza font-medium mb-1.5">
                  Archivo (opcional)
                </span>
                <input
                  type="file"
                  onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
                  className="text-sm"
                />
              </label>
            )}
          </div>
          <Button
            disabled={guardando}
            onClick={handleGuardar}
            className="w-fit"
          >
            {guardando
              ? "Guardando..."
              : editandoId
                ? "Guardar cambios"
                : "Crear contenido"}
          </Button>
        </div>
      )}

      <div className="overflow-x-auto bg-blanco border border-arena rounded-[4px]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-arena text-ceniza text-xs uppercase">
              <th className="text-left py-3 px-4">Título</th>
              <th className="text-left py-3 px-4">Tipo</th>
              <th className="text-left py-3 px-4">Archivo</th>
              <th className="text-left py-3 px-4">Publicado</th>
              <th className="text-left py-3 px-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-ceniza">
                  No hay contenidos todavía.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const actualizando = actualizandoId === item.id;
                return (
                  <tr
                    key={item.id}
                    className="border-b border-arena/50 hover:bg-crema transition-colors"
                  >
                    <td className="py-3 px-4 text-carbon">{item.titulo}</td>
                    <td className="py-3 px-4 text-carbon-suave">
                      {TIPO_LABELS[item.tipo]}
                    </td>
                    <td className="py-3 px-4 text-carbon-suave">
                      {item.archivo_path ? "Sí" : "—"}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        disabled={actualizando}
                        onClick={() => handleTogglePublicado(item)}
                        aria-pressed={item.publicado}
                        className={cx(
                          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50",
                          item.publicado ? "bg-dorado" : "bg-arena",
                        )}
                      >
                        <span
                          className={cx(
                            "inline-block h-4 w-4 transform rounded-full bg-blanco transition-transform",
                            item.publicado ? "translate-x-6" : "translate-x-1",
                          )}
                        />
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => abrirEditar(item)}
                          className="text-xs text-dorado-oscuro underline"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          disabled={actualizando}
                          onClick={() => handleEliminar(item.id)}
                          className="text-xs text-error underline disabled:opacity-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

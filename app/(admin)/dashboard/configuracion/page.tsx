"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import type { ConfigRow, LinktreeLink } from "@/types";

const ICONOS: LinktreeLink["icon"][] = ["bag", "whatsapp", "instagram", "tiktok"];

function linkVacio(): LinktreeLink {
  return { label: "", url: "", icon: "bag" };
}

export default function ConfiguracionPage() {
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [whatsappNumero, setWhatsappNumero] = useState("");
  const [linktreeSubtitulo, setLinktreeSubtitulo] = useState("");
  const [links, setLinks] = useState<LinktreeLink[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const res = await fetch("/api/admin/config");
        if (!res.ok) throw new Error("No se pudo cargar la configuracion.");
        const data = await res.json();
        const filas: ConfigRow[] = data.config ?? [];

        if (!activo) return;

        const numero = filas.find((fila) => fila.clave === "whatsapp_numero");
        const subtitulo = filas.find((fila) => fila.clave === "linktree_subtitulo");
        const linksRaw = filas.find((fila) => fila.clave === "linktree_links");

        setWhatsappNumero(numero?.valor ?? "");
        setLinktreeSubtitulo(subtitulo?.valor ?? "");

        if (linksRaw?.valor) {
          try {
            const parsed = JSON.parse(linksRaw.valor);
            setLinks(Array.isArray(parsed) ? parsed : []);
          } catch {
            setLinks([]);
          }
        } else {
          setLinks([]);
        }
      } catch (err) {
        if (activo) {
          setError(err instanceof Error ? err.message : "Error al cargar la configuracion.");
        }
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, []);

  const actualizarLink = (index: number, cambios: Partial<LinktreeLink>) => {
    setLinks((prev) =>
      prev.map((link, i) => (i === index ? { ...link, ...cambios } : link))
    );
  };

  const agregarLink = () => {
    setLinks((prev) => [...prev, linkVacio()]);
  };

  const quitarLink = (index: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const moverLink = (index: number, direccion: -1 | 1) => {
    setLinks((prev) => {
      const destino = index + direccion;
      if (destino < 0 || destino >= prev.length) return prev;
      const copia = [...prev];
      [copia[index], copia[destino]] = [copia[destino], copia[index]];
      return copia;
    });
  };

  const guardarCambios = async () => {
    setGuardando(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([
          { clave: "whatsapp_numero", valor: whatsappNumero },
          { clave: "linktree_subtitulo", valor: linktreeSubtitulo },
          { clave: "linktree_links", valor: JSON.stringify(links) },
        ]),
      });
      if (!res.ok) throw new Error("No se pudo guardar la configuracion.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la configuracion.");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center gap-2 text-carbon-suave">
        <Spinner /> Cargando configuracion...
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-carbon mb-6">Configuracion</h1>

      {error && (
        <div className="mb-6 border border-error/30 bg-error/5 text-error text-sm px-4 py-3 rounded-[2px]">
          {error}
        </div>
      )}

      <div className="bg-blanco border border-arena rounded-[4px] p-5 mb-6 flex flex-col gap-4 max-w-xl">
        <h2 className="font-display text-xl text-carbon">General</h2>
        <Input
          label="Numero de WhatsApp"
          value={whatsappNumero}
          onChange={(e) => setWhatsappNumero(e.target.value)}
          placeholder="57XXXXXXXXXX"
        />
        <Input
          label="Subtitulo del Linktree"
          value={linktreeSubtitulo}
          onChange={(e) => setLinktreeSubtitulo(e.target.value)}
        />
      </div>

      <div className="bg-blanco border border-arena rounded-[4px] p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-carbon">Links del Linktree</h2>
          <Button variant="secondary" onClick={agregarLink}>
            + Agregar link
          </Button>
        </div>

        {links.length === 0 ? (
          <p className="text-ceniza text-sm">Sin links todavia.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {links.map((link, index) => (
              <div
                key={index}
                className="border border-arena rounded-[4px] p-4 grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] gap-3 items-end"
              >
                <Input
                  label="Etiqueta"
                  value={link.label}
                  onChange={(e) => actualizarLink(index, { label: e.target.value })}
                />
                <Input
                  label="URL"
                  value={link.url}
                  onChange={(e) => actualizarLink(index, { url: e.target.value })}
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-ceniza font-medium">Icono</label>
                  <select
                    value={link.icon}
                    onChange={(e) =>
                      actualizarLink(index, {
                        icon: e.target.value as LinktreeLink["icon"],
                      })
                    }
                    className="min-h-[44px] rounded-[2px] border border-arena bg-blanco px-3 py-2.5 text-base text-carbon focus:outline-none focus:border-dorado"
                  >
                    {ICONOS.map((icono) => (
                      <option key={icono} value={icono}>
                        {icono}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => moverLink(index, -1)}
                    disabled={index === 0}
                    aria-label="Subir link"
                    className="h-11 w-11 flex items-center justify-center border border-arena rounded-[2px] text-carbon disabled:opacity-30 disabled:cursor-not-allowed hover:bg-crema transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M10 15V5M10 5L5 10M10 5l5 5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => moverLink(index, 1)}
                    disabled={index === links.length - 1}
                    aria-label="Bajar link"
                    className="h-11 w-11 flex items-center justify-center border border-arena rounded-[2px] text-carbon disabled:opacity-30 disabled:cursor-not-allowed hover:bg-crema transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M10 5v10M10 15l-5-5M10 15l5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => quitarLink(index)}
                    aria-label="Quitar link"
                    className="h-11 w-11 flex items-center justify-center border border-arena rounded-[2px] text-error hover:bg-error/10 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <line x1="4" y1="4" x2="16" y2="16" strokeLinecap="round" />
                      <line x1="16" y1="4" x2="4" y2="16" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button onClick={guardarCambios} disabled={guardando}>
        {guardando ? <Spinner /> : "Guardar cambios"}
      </Button>

      {showToast && (
        <div className="fixed bottom-6 right-6 bg-carbon text-blanco px-4 py-3 rounded-[2px] shadow-[0_1px_3px_rgba(26,23,20,0.08)] animate-fade-in-up">
          Cambios guardados
        </div>
      )}
    </div>
  );
}

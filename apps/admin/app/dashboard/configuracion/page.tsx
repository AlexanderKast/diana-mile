"use client";

import { useEffect, useState } from "react";
import { Button } from "@diana-mile/shared/ui/Button";
import { Input } from "@diana-mile/shared/ui/Input";
import { Spinner } from "@diana-mile/shared/ui/Spinner";
import type {
  ConfigRow,
  LinktreeLink,
  LinktreeLinkSection,
} from "@diana-mile/shared/types";

const ICONOS: LinktreeLink["icon"][] = [
  "bag",
  "whatsapp",
  "instagram",
  "tiktok",
];
const VARIANTES: LinktreeLink["variant"][] = ["primary", "secondary"];

const SECCIONES: { value: LinktreeLinkSection | ""; label: string }[] = [
  { value: "", label: "Sin sección" },
  { value: "hero", label: "Hero (destacado)" },
  { value: "store", label: "Tienda" },
  { value: "collab_diana", label: "Colabora conmigo" },
  { value: "agency", label: "Agencia" },
  { value: "social", label: "Redes" },
];

function linkVacio(): LinktreeLink {
  return {
    id: crypto.randomUUID(),
    label: "",
    url: "",
    icon: "bag",
    variant: "secondary",
    active: true,
  };
}

export default function ConfiguracionPage() {
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [whatsappNumero, setWhatsappNumero] = useState("");
  const [linktreeTitulo, setLinktreeTitulo] = useState("");
  const [linktreeSubtitulo, setLinktreeSubtitulo] = useState("");
  const [linktreeFotoUrl, setLinktreeFotoUrl] = useState("");
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
        const titulo = filas.find((fila) => fila.clave === "linktree_titulo");
        const subtitulo = filas.find(
          (fila) => fila.clave === "linktree_subtitulo",
        );
        const fotoUrl = filas.find(
          (fila) => fila.clave === "linktree_foto_url",
        );
        const linksRaw = filas.find((fila) => fila.clave === "linktree_links");

        setWhatsappNumero(numero?.valor ?? "");
        setLinktreeTitulo(titulo?.valor ?? "");
        setLinktreeSubtitulo(subtitulo?.valor ?? "");
        setLinktreeFotoUrl(fotoUrl?.valor ?? "");

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
          setError(
            err instanceof Error
              ? err.message
              : "Error al cargar la configuracion.",
          );
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
      prev.map((link, i) => (i === index ? { ...link, ...cambios } : link)),
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
          { clave: "linktree_titulo", valor: linktreeTitulo },
          { clave: "linktree_subtitulo", valor: linktreeSubtitulo },
          { clave: "linktree_foto_url", valor: linktreeFotoUrl },
          { clave: "linktree_links", valor: JSON.stringify(links) },
        ]),
      });
      if (!res.ok) throw new Error("No se pudo guardar la configuracion.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al guardar la configuracion.",
      );
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
          label="Titulo del Linktree"
          value={linktreeTitulo}
          onChange={(e) => setLinktreeTitulo(e.target.value)}
          placeholder="Diana Mile"
        />
        <Input
          label="Subtitulo del Linktree"
          value={linktreeSubtitulo}
          onChange={(e) => setLinktreeSubtitulo(e.target.value)}
        />
        <Input
          label="URL de la foto de perfil"
          value={linktreeFotoUrl}
          onChange={(e) => setLinktreeFotoUrl(e.target.value)}
          placeholder="https://... (vacio = usa la foto por defecto)"
        />
        {linktreeFotoUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- vista previa de una URL arbitraria, no vale la pena registrar el dominio en next/image
          <img
            src={linktreeFotoUrl}
            alt="Vista previa de la foto de perfil"
            className="h-16 w-16 rounded-full object-cover border border-arena"
          />
        )}
      </div>

      <div className="bg-blanco border border-arena rounded-[4px] p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-carbon">
            Links del Linktree
          </h2>
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
                key={link.id}
                className="border border-arena rounded-[4px] p-4 flex flex-col gap-3"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    label="Etiqueta"
                    value={link.label}
                    onChange={(e) =>
                      actualizarLink(index, { label: e.target.value })
                    }
                  />
                  <Input
                    label="URL"
                    value={link.url}
                    onChange={(e) =>
                      actualizarLink(index, { url: e.target.value })
                    }
                  />
                </div>

                <Input
                  label="Subtitulo (opcional)"
                  value={link.subtitle ?? ""}
                  onChange={(e) =>
                    actualizarLink(index, { subtitle: e.target.value })
                  }
                  placeholder="Texto pequeño debajo de la etiqueta"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    label="Badge (opcional)"
                    value={link.badge ?? ""}
                    onChange={(e) =>
                      actualizarLink(index, { badge: e.target.value })
                    }
                    placeholder='Ej: "Programa 1:1"'
                  />

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-ceniza font-medium">
                      Sección del linktree
                    </label>
                    <select
                      value={link.section ?? ""}
                      onChange={(e) =>
                        actualizarLink(index, {
                          section:
                            (e.target.value as LinktreeLinkSection) ||
                            undefined,
                        })
                      }
                      className="min-h-[44px] rounded-[2px] border border-arena bg-blanco px-3 py-2.5 text-base text-carbon focus:outline-none focus:border-dorado"
                    >
                      {SECCIONES.map((seccion) => (
                        <option key={seccion.value} value={seccion.value}>
                          {seccion.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <p className="text-xs text-ceniza">
                  El estilo premium (hero, tienda, colaboraciones) solo aplica a
                  los links originales de cada sección. Un link nuevo se ve con
                  el estilo estándar aunque elijas su sección.
                </p>

                <div className="flex flex-wrap items-end gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-ceniza font-medium">
                      Icono
                    </label>
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

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-ceniza font-medium">
                      Estilo
                    </label>
                    <select
                      value={link.variant}
                      onChange={(e) =>
                        actualizarLink(index, {
                          variant: e.target.value as LinktreeLink["variant"],
                        })
                      }
                      className="min-h-[44px] rounded-[2px] border border-arena bg-blanco px-3 py-2.5 text-base text-carbon focus:outline-none focus:border-dorado"
                    >
                      {VARIANTES.map((variante) => (
                        <option key={variante} value={variante}>
                          {variante === "primary" ? "Destacado" : "Normal"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <label className="flex min-h-[44px] items-center gap-2 text-sm text-carbon">
                    <input
                      type="checkbox"
                      checked={link.active}
                      onChange={(e) =>
                        actualizarLink(index, { active: e.target.checked })
                      }
                      className="h-4 w-4 accent-dorado"
                    />
                    Visible
                  </label>

                  <div className="ml-auto flex gap-2">
                    <button
                      type="button"
                      onClick={() => moverLink(index, -1)}
                      disabled={index === 0}
                      aria-label="Subir link"
                      className="h-11 w-11 flex items-center justify-center border border-arena rounded-[2px] text-carbon disabled:opacity-30 disabled:cursor-not-allowed hover:bg-crema transition-colors"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path
                          d="M10 15V5M10 5L5 10M10 5l5 5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => moverLink(index, 1)}
                      disabled={index === links.length - 1}
                      aria-label="Bajar link"
                      className="h-11 w-11 flex items-center justify-center border border-arena rounded-[2px] text-carbon disabled:opacity-30 disabled:cursor-not-allowed hover:bg-crema transition-colors"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path
                          d="M10 5v10M10 15l-5-5M10 15l5-5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => quitarLink(index)}
                      aria-label="Quitar link"
                      className="h-11 w-11 flex items-center justify-center border border-arena rounded-[2px] text-error hover:bg-error/10 transition-colors"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <line
                          x1="4"
                          y1="4"
                          x2="16"
                          y2="16"
                          strokeLinecap="round"
                        />
                        <line
                          x1="16"
                          y1="4"
                          x2="4"
                          y2="16"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
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

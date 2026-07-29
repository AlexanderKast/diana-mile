"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@diana-mile/shared/ui/Button";
import { Input } from "@diana-mile/shared/ui/Input";
import { formatCOP } from "@diana-mile/shared/utils";
import type { LandingVariante } from "@diana-mile/shared/types";

export type MetricasVariante = {
  visitas: number;
  clicsWhatsapp: number;
  pedidos: number;
  /** Facturacion de pedidos creados (contraentrega: facturar no es recaudar). */
  facturado: number;
};

type LandingsRotadorProps = {
  variantes: LandingVariante[];
  metricas: Record<string, MetricasVariante>;
  shopUrl: string;
  periodoLabel: string;
};

const SIN_METRICAS: MetricasVariante = {
  visitas: 0,
  clicsWhatsapp: 0,
  pedidos: 0,
  facturado: 0,
};

function porcentaje(parte: number, total: number): string {
  if (!total) return "—";
  return `${Math.round((parte / total) * 100)}%`;
}

function slugDesdeNombre(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export default function LandingsRotador({
  variantes,
  metricas,
  shopUrl,
  periodoLabel,
}: LandingsRotadorProps) {
  const router = useRouter();
  const [creandoPara, setCreandoPara] = useState<string | null>(null);
  const [nombreNueva, setNombreNueva] = useState("");
  const [handleNuevo, setHandleNuevo] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);

  const porProducto = new Map<string, LandingVariante[]>();
  for (const v of variantes) {
    const lista = porProducto.get(v.producto_handle) ?? [];
    lista.push(v);
    porProducto.set(v.producto_handle, lista);
  }

  async function copiarLink(texto: string) {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(texto);
      setTimeout(() => setCopiado(null), 2000);
    } catch {
      // El navegador puede negar el clipboard: el link queda visible igual.
    }
  }

  async function crearVariante(productoHandle: string) {
    const nombre = nombreNueva.trim();
    if (!nombre) return;
    setOcupado(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/landings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          producto_handle: productoHandle,
          slug: `${productoHandle.slice(0, 30)}-${slugDesdeNombre(nombre)}`.slice(0, 60),
          nombre,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo crear.");
      setCreandoPara(null);
      setNombreNueva("");
      setHandleNuevo("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear.");
    } finally {
      setOcupado(false);
    }
  }

  async function cambiarEstado(v: LandingVariante) {
    setOcupado(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/landings/${v.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estado: v.estado === "activa" ? "pausada" : "activa",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No se pudo cambiar el estado.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cambiar estado.");
    } finally {
      setOcupado(false);
    }
  }

  async function borrarVariante(v: LandingVariante) {
    const seguro = window.confirm(
      `¿Borrar la variante "${v.nombre}"? Si hay anuncios apuntando a /l/${v.slug}, esa URL quedará en 404. Para sacarla de la rotación sin romper nada, mejor pausarla.`,
    );
    if (!seguro) return;
    setOcupado(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/landings/${v.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No se pudo borrar.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al borrar.");
    } finally {
      setOcupado(false);
    }
  }

  const formularioNueva = (productoHandle: string) => (
    <div className="flex flex-wrap items-end gap-3 border-t border-arena pt-3 mt-3">
      <div className="w-56">
        <Input
          label="Nombre interno de la variante"
          value={nombreNueva}
          onChange={(e) => setNombreNueva(e.target.value)}
          placeholder="ej. Ángulo brillo natural"
        />
      </div>
      <Button
        type="button"
        onClick={() => crearVariante(productoHandle)}
        disabled={ocupado || !nombreNueva.trim()}
      >
        {ocupado ? "Creando..." : "Crear"}
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={() => {
          setCreandoPara(null);
          setNombreNueva("");
        }}
      >
        Cancelar
      </Button>
      <p className="w-full text-xs text-ceniza">
        Nace idéntica a la landing pública del producto; después editas los
        bloques que quieras cambiar. Recuerda: cero urgencia fabricada, cero
        testimonios inventados — el volumen es de Nu Skin, la marca es Milito.
      </p>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {error && <p className="text-sm text-error">{error}</p>}

      {porProducto.size === 0 && creandoPara === null && (
        <div className="rounded-[4px] border border-arena bg-blanco p-5">
          <p className="text-sm text-carbon-suave">
            Todavía no hay variantes. Crea la primera con el handle del
            producto de Shopify (el mismo de la URL /productos/...).
          </p>
        </div>
      )}

      {[...porProducto.entries()].map(([handle, lista]) => {
        const activas = lista.filter((v) => v.estado === "activa").length;
        const linkRotador = `${shopUrl}/go/${handle}`;
        return (
          <section
            key={handle}
            className="rounded-[4px] border border-arena bg-blanco p-5"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-lg text-carbon">{handle}</h2>
              <span className="text-xs text-ceniza">
                {activas} activa{activas === 1 ? "" : "s"} de {lista.length} ·
                métricas de {periodoLabel}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <code className="text-xs bg-crema border border-arena rounded-[4px] px-2 py-1 text-carbon">
                {linkRotador}
              </code>
              <button
                type="button"
                onClick={() => copiarLink(linkRotador)}
                className="text-xs text-dorado-oscuro hover:underline"
              >
                {copiado === linkRotador ? "Copiado ✓" : "Copiar link para pauta"}
              </button>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-arena text-left text-xs text-ceniza">
                    <th className="py-2 pr-3 font-medium">Variante</th>
                    <th className="py-2 pr-3 font-medium">Estado</th>
                    <th className="py-2 pr-3 font-medium">Visitas</th>
                    <th className="py-2 pr-3 font-medium">Clics WhatsApp</th>
                    <th className="py-2 pr-3 font-medium">Pedidos</th>
                    <th className="py-2 pr-3 font-medium">Pedidos/visita</th>
                    <th className="py-2 pr-3 font-medium">Facturado</th>
                    <th className="py-2 pr-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map((v) => {
                    const m = metricas[v.slug] ?? SIN_METRICAS;
                    return (
                      <tr
                        key={v.id}
                        className="border-b border-arena/60 last:border-0"
                      >
                        <td className="py-2 pr-3">
                          <Link
                            href={`/dashboard/landings/${v.id}`}
                            className="text-carbon hover:text-dorado-oscuro font-medium"
                          >
                            {v.nombre}
                          </Link>
                          <a
                            href={`${shopUrl}/l/${v.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="block text-xs text-ceniza hover:text-dorado-oscuro"
                          >
                            /l/{v.slug} ↗
                          </a>
                        </td>
                        <td className="py-2 pr-3">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              v.estado === "activa"
                                ? "bg-dorado/20 text-dorado-oscuro"
                                : "bg-arena text-ceniza"
                            }`}
                          >
                            {v.estado}
                          </span>
                        </td>
                        <td className="py-2 pr-3 text-carbon">{m.visitas}</td>
                        <td className="py-2 pr-3 text-carbon">
                          {m.clicsWhatsapp}
                          <span className="text-xs text-ceniza ml-1">
                            {porcentaje(m.clicsWhatsapp, m.visitas)}
                          </span>
                        </td>
                        <td className="py-2 pr-3 text-carbon">{m.pedidos}</td>
                        <td className="py-2 pr-3 text-carbon">
                          {porcentaje(m.pedidos, m.visitas)}
                        </td>
                        <td className="py-2 pr-3 text-carbon whitespace-nowrap">
                          {formatCOP(m.facturado)}
                        </td>
                        <td className="py-2 pr-3 whitespace-nowrap text-right">
                          <button
                            type="button"
                            onClick={() => cambiarEstado(v)}
                            disabled={ocupado}
                            className="text-xs text-carbon-suave hover:text-carbon mr-3"
                          >
                            {v.estado === "activa" ? "Pausar" : "Activar"}
                          </button>
                          <button
                            type="button"
                            onClick={() => borrarVariante(v)}
                            disabled={ocupado}
                            className="text-xs text-error/80 hover:text-error"
                          >
                            Borrar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {creandoPara === handle ? (
              formularioNueva(handle)
            ) : (
              <div className="mt-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setCreandoPara(handle);
                    setNombreNueva("");
                  }}
                >
                  + Nueva variante
                </Button>
              </div>
            )}
          </section>
        );
      })}

      <section className="rounded-[4px] border border-dashed border-arena bg-blanco p-5">
        <h2 className="font-display text-lg text-carbon mb-2">
          Rotador para otro producto
        </h2>
        {creandoPara === "__nuevo__" ? (
          <div className="flex flex-col gap-3">
            <div className="w-72">
              <Input
                label="Handle del producto (Shopify)"
                value={handleNuevo}
                onChange={(e) => setHandleNuevo(e.target.value.trim())}
                placeholder="ej. epoch-polishing-bar"
              />
            </div>
            {handleNuevo && formularioNueva(handleNuevo)}
          </div>
        ) : (
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setCreandoPara("__nuevo__");
              setNombreNueva("");
              setHandleNuevo("");
            }}
          >
            + Empezar con un producto
          </Button>
        )}
      </section>
    </div>
  );
}

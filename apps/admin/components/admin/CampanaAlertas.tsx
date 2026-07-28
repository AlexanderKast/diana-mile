"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@diana-mile/shared/utils";

/**
 * Campana de alertas de la barra lateral.
 *
 * Solo trae el CONTEO, no las alertas. Calcularlas toca Shopify y varias
 * tablas; hacerlo en cada pintado de la barra pondria esa consulta en
 * todas las paginas del panel.
 *
 * Se refresca al cambiar de pagina y cada dos minutos. No hay realtime a
 * proposito: una alerta que aparece dos minutos tarde no cambia ninguna
 * decision, y un socket abierto de mas si cuesta.
 */

const REFRESCO_MS = 2 * 60 * 1000;

export function CampanaAlertas() {
  const pathname = usePathname();
  const [total, setTotal] = useState<number | null>(null);
  const [criticas, setCriticas] = useState(0);

  useEffect(() => {
    let vivo = true;

    async function cargar() {
      try {
        const res = await fetch("/api/admin/alertas", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        if (!vivo) return;
        setTotal(Number(json.total) || 0);
        setCriticas(Number(json.criticas) || 0);
      } catch {
        // Sin conteo se muestra la campana sin punto. Un error de red no
        // puede tumbar la barra de navegacion entera.
      }
    }

    void cargar();
    const intervalo = setInterval(() => void cargar(), REFRESCO_MS);
    return () => {
      vivo = false;
      clearInterval(intervalo);
    };
  }, [pathname]);

  const hay = (total ?? 0) > 0;
  const activo = pathname.startsWith("/dashboard/notificaciones");

  return (
    <Link
      href="/dashboard/notificaciones"
      aria-label={
        hay
          ? `Alertas: ${total} pendiente${total === 1 ? "" : "s"}`
          : "Alertas: ninguna pendiente"
      }
      className={cx(
        "relative flex items-center gap-2 px-4 py-3 min-h-[44px] text-sm tracking-wide border-l-2 transition-colors",
        activo
          ? "border-dorado bg-carbon-suave text-blanco"
          : "border-transparent text-ceniza hover:text-blanco hover:bg-carbon-suave",
      )}
    >
      <span className="relative flex items-center">
        <svg
          width="17"
          height="17"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path
            d="M10 2.5a4.5 4.5 0 0 0-4.5 4.5v3L4 13h12l-1.5-3V7A4.5 4.5 0 0 0 10 2.5Z"
            strokeLinejoin="round"
          />
          <path d="M8 15.5a2 2 0 0 0 4 0" strokeLinecap="round" />
        </svg>
        {hay && (
          <span
            className={cx(
              "absolute -top-1 -right-1.5 h-2 w-2 rounded-full ring-2 ring-carbon",
              criticas > 0 ? "bg-error" : "bg-dorado",
            )}
          />
        )}
      </span>
      Alertas
      {hay && (
        <span
          className={cx(
            "ml-auto text-[11px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center",
            criticas > 0 ? "bg-error text-blanco" : "bg-dorado text-carbon",
          )}
        >
          {total}
        </span>
      )}
    </Link>
  );
}

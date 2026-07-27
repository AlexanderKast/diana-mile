"use client";

import { useEffect, useRef, useState } from "react";
import { formatCOP } from "@diana-mile/shared/utils";
import type { Pedido } from "@diana-mile/shared/types";

/**
 * Avisa cuando entra un pedido, sin que haya que estar mirando la pantalla.
 *
 * En contraentrega los primeros minutos deciden la venta: cuanto antes se
 * llame a confirmar, menos se cae el pedido. Un panel que solo se actualiza
 * en silencio no sirve para eso — hay que enterarse aunque se este en otra
 * pestana.
 *
 * Tres avisos a la vez, cada uno cubre lo que fallan los otros:
 *  · el cartel, para quien esta mirando;
 *  · el sonido, para quien esta en el escritorio pero en otra cosa;
 *  · la notificacion del sistema y el titulo de la pestana, para quien
 *    tiene el navegador de fondo.
 */

/**
 * Un tono corto sintetizado. Se genera en el momento en vez de cargar un
 * archivo: un sonido de aviso son dos notas, y no vale la pena un fichero
 * mas que descargar ni un 404 silencioso si se borra.
 */
function sonar() {
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;

    const ctx = new Ctx();
    const ahora = ctx.currentTime;

    // Dos notas ascendentes: se distingue de cualquier notificacion del
    // sistema y no suena a error.
    [880, 1174].forEach((hz, i) => {
      const osc = ctx.createOscillator();
      const vol = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = hz;
      vol.gain.setValueAtTime(0.0001, ahora + i * 0.14);
      vol.gain.exponentialRampToValueAtTime(0.25, ahora + i * 0.14 + 0.02);
      vol.gain.exponentialRampToValueAtTime(0.0001, ahora + i * 0.14 + 0.13);
      osc.connect(vol).connect(ctx.destination);
      osc.start(ahora + i * 0.14);
      osc.stop(ahora + i * 0.14 + 0.14);
    });

    setTimeout(() => void ctx.close(), 800);
  } catch {
    // Sin audio (permisos, pestana sin interaccion) el resto sigue.
  }
}

function notificarEnSistema(pedido: Pedido) {
  if (typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;

  new Notification("Pedido nuevo en Milito Life", {
    body: `${pedido.nombre ?? "Sin nombre"} — ${pedido.ciudad ?? ""}\n${pedido.producto_nombre ?? ""}`,
    tag: `pedido-${pedido.id}`,
    icon: "/icon-192.png",
  });
}

export function AvisoPedidoNuevo({
  pedido,
  onCerrar,
}: {
  pedido: Pedido | null;
  onCerrar: () => void;
}) {
  const [permiso, setPermiso] = useState<NotificationPermission | "no-soportado">(
    "default",
  );
  const tituloOriginal = useRef<string>("");

  useEffect(() => {
    tituloOriginal.current = document.title;
    setPermiso(
      typeof Notification === "undefined" ? "no-soportado" : Notification.permission,
    );
  }, []);

  useEffect(() => {
    if (!pedido) return;

    sonar();
    notificarEnSistema(pedido);

    // El titulo es lo unico que se ve con la pestana de fondo y sin
    // permiso de notificaciones.
    document.title = `(1) Pedido nuevo — ${tituloOriginal.current}`;

    // Se quita solo: un cartel que no se va tapa la fila que vino a
    // anunciar.
    const t = setTimeout(onCerrar, 12000);
    return () => clearTimeout(t);
  }, [pedido, onCerrar]);

  useEffect(() => {
    if (pedido) return;
    if (tituloOriginal.current) document.title = tituloOriginal.current;
  }, [pedido]);

  const pedirPermiso = async () => {
    if (typeof Notification === "undefined") return;
    setPermiso(await Notification.requestPermission());
  };

  return (
    <>
      {/* Se ofrece activar las notificaciones del sistema una sola vez, y
          solo si el navegador las admite y no estan ya decididas. */}
      {permiso === "default" && (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-[2px] border border-arena bg-crema px-3 py-2 text-xs text-carbon-suave">
          <span>
            Activa las notificaciones para enterarte de un pedido nuevo aunque
            tengas esta pestaña de fondo.
          </span>
          <button
            type="button"
            onClick={pedirPermiso}
            className="min-h-[32px] rounded-[2px] border border-dorado px-3 text-dorado-oscuro transition-colors hover:bg-dorado/10"
          >
            Activar
          </button>
        </div>
      )}

      {pedido && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 right-4 z-50 w-[min(22rem,calc(100vw-2rem))] animate-fade-in-up rounded-[2px] border border-dorado bg-blanco p-4 shadow-lg shadow-black/10"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-dorado-oscuro">
                Pedido nuevo
              </p>
              <p className="mt-1 truncate text-sm font-medium text-carbon">
                {pedido.nombre ?? "Sin nombre"}
              </p>
              <p className="truncate text-xs text-carbon-suave">
                {pedido.producto_nombre ?? "—"}
              </p>
              <p className="mt-1 text-xs text-carbon-suave">
                {pedido.ciudad ?? "—"} ·{" "}
                <span className="text-carbon">
                  {formatCOP(Number(pedido.precio_total ?? 0))}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={onCerrar}
              aria-label="Cerrar aviso"
              className="min-h-[32px] min-w-[32px] shrink-0 text-lg leading-none text-ceniza transition-colors hover:text-carbon"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}

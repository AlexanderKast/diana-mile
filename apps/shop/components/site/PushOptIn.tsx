"use client";

import { useEffect, useState } from "react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

type PushOptInProps = {
  /** Telefono E.164 a vincular con la suscripcion, si se conoce (ej. justo tras completar un pedido). */
  telefono?: string;
  titulo?: string;
  descripcion?: string;
};

/**
 * Botón de opt-in a notificaciones push. Nunca pide permiso de forma
 * automatica al cargar la pagina — solo cuando el usuario toca el boton.
 */
export function PushOptIn({
  telefono,
  titulo = "Recibe el estado de tu pedido",
  descripcion = "Te avisamos por notificacion cuando tu pedido cambie de estado.",
}: PushOptInProps) {
  const [estado, setEstado] = useState<
    | "idle"
    | "suscribiendo"
    | "suscrito"
    | "no-soportado"
    | "rechazado"
    | "error"
  >("idle");

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !VAPID_PUBLIC_KEY
    ) {
      setEstado("no-soportado");
      return;
    }
    if (Notification.permission === "granted") {
      setEstado("suscrito");
    }
  }, []);

  async function suscribir() {
    if (!VAPID_PUBLIC_KEY) return;
    setEstado("suscribiendo");

    try {
      const permiso = await Notification.requestPermission();
      if (permiso !== "granted") {
        setEstado("rechazado");
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          VAPID_PUBLIC_KEY,
        ) as BufferSource,
      });

      const res = await fetch("/api/push/suscribir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: subscription.toJSON(), telefono }),
      });

      if (!res.ok) throw new Error("No se pudo registrar la suscripcion.");
      setEstado("suscrito");
    } catch {
      setEstado("error");
    }
  }

  if (estado === "no-soportado" || estado === "suscrito") return null;

  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-arena bg-crema p-4 text-center">
      <p className="text-sm font-semibold text-carbon">{titulo}</p>
      <p className="text-xs text-carbon-suave">{descripcion}</p>
      <button
        type="button"
        onClick={suscribir}
        disabled={estado === "suscribiendo"}
        className="mt-1 rounded-lg bg-dorado-oscuro px-4 py-2 text-xs font-semibold text-blanco disabled:opacity-50"
      >
        {estado === "suscribiendo" ? "Activando..." : "Activar notificaciones"}
      </button>
      {estado === "rechazado" && (
        <p className="text-xs text-error">
          Bloqueaste las notificaciones. Puedes activarlas desde los ajustes del
          navegador.
        </p>
      )}
      {estado === "error" && (
        <p className="text-xs text-error">
          No se pudo activar. Intenta de nuevo.
        </p>
      )}
    </div>
  );
}

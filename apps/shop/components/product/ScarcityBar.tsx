"use client";

import { useEffect, useState } from "react";
import {
  CIUDAD_DESPACHO,
  ENTREGA_DETALLE_CORTO,
  HORA_CORTE_DESPACHO,
} from "@diana-mile/shared/logistica/despacho";

const DESPACHO_HORA = HORA_CORTE_DESPACHO;

// Construye un Date "naive" cuyos campos locales (hora, dia de semana) son
// los de Colombia, sin importar en que zona horaria corre el navegador.
function getColombiaNow(): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return new Date(
    `${map.year}-${map.month}-${map.day}T${map.hour === "24" ? "00" : map.hour}:${map.minute}:${map.second}`
  );
}

function getDespachoInfo(): { modo: "countdown"; ms: number } | { modo: "manana" } | { modo: "lunes" } {
  const now = getColombiaNow();
  const day = now.getDay(); // 0 domingo ... 6 sabado
  const hour = now.getHours();

  if (day === 0 || day === 6 || (day === 5 && hour >= DESPACHO_HORA)) {
    return { modo: "lunes" };
  }

  if (hour >= DESPACHO_HORA) {
    return { modo: "manana" };
  }

  const target = new Date(now);
  target.setHours(DESPACHO_HORA, 0, 0, 0);
  return { modo: "countdown", ms: target.getTime() - now.getTime() };
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function ScarcityBar() {
  const [despacho, setDespacho] = useState<ReturnType<typeof getDespachoInfo> | null>(null);

  useEffect(() => {
    setDespacho(getDespachoInfo());
    const interval = setInterval(() => setDespacho(getDespachoInfo()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!despacho) return null;

  return (
    <div className="rounded-2xl border border-arena bg-crema p-3 text-sm text-carbon">
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {despacho.modo === "countdown" && (
          <>
            <span className="rounded bg-rojo-alerta px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blanco">
              Hoy
            </span>
            Pide antes de las {DESPACHO_HORA}:00 AM (faltan{" "}
            <span className="font-mono font-semibold">{formatCountdown(despacho.ms)}</span>) y sale hoy
            mismo desde {CIUDAD_DESPACHO}
          </>
        )}
        {despacho.modo === "manana" && `Pide hoy y sale mañana antes de las ${DESPACHO_HORA}:00 AM`}
        {despacho.modo === "lunes" && "Pide hoy y sale el lunes"}
      </p>
      {/* Decia "24-72h en ciudades principales" y era falso: de las grandes,
          solo Medellin entrega en ese rango; Bogota, Cali, Barranquilla,
          Cartagena y Bucaramanga son 3-5 dias habiles. A diez centimetros
          del boton de pedir, ese es justo el dato que despues se convierte
          en un rechazo en la puerta. El rango exacto por municipio vive en
          `cobertura_entrega` y se lo damos cuando ya sabemos su ciudad. */}
      <p className="mt-1 text-xs text-carbon-suave">{ENTREGA_DETALLE_CORTO}</p>
    </div>
  );
}

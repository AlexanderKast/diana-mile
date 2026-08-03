"use client";

import { useRef, useState } from "react";
import { Textarea } from "@diana-mile/shared/ui/Input";

/**
 * Notas personales de la semana — persisten en `plan_progreso.notas` via
 * POST /api/mi-plan/progreso (mismo endpoint del check-in; `notas` es un
 * campo opcional que no altera `completada`). Guardado al perder foco,
 * con debounce implicito (solo si cambio el texto).
 */
export function NotasSemana({
  semana,
  completadaInicial,
  notasIniciales,
}: {
  semana: number;
  completadaInicial: boolean;
  notasIniciales: string | null;
}) {
  const [notas, setNotas] = useState(notasIniciales ?? "");
  const [estado, setEstado] = useState<"idle" | "guardando" | "guardado" | "error">("idle");
  const ultimoGuardadoRef = useRef(notasIniciales ?? "");

  async function guardar() {
    const texto = notas.trim().slice(0, 2000);
    if (texto === ultimoGuardadoRef.current.trim()) return;

    setEstado("guardando");
    try {
      const res = await fetch("/api/mi-plan/progreso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // `completada` viaja con su valor actual para no des-marcar el
        // check-in al guardar una nota.
        body: JSON.stringify({ semana, completada: completadaInicial, notas: texto }),
      });
      if (!res.ok) throw new Error();
      ultimoGuardadoRef.current = texto;
      setEstado("guardado");
    } catch {
      setEstado("error");
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Textarea
        label="Tus notas de la semana"
        placeholder="Como te fue, que se te dificulto, que quieres recordar..."
        value={notas}
        onChange={(e) => {
          setNotas(e.target.value);
          if (estado !== "idle") setEstado("idle");
        }}
        onBlur={guardar}
        rows={4}
        maxLength={2000}
      />
      <p className="text-right text-xs text-ceniza" aria-live="polite">
        {estado === "guardando" && "Guardando..."}
        {estado === "guardado" && "Guardado ✓"}
        {estado === "error" && "No se pudo guardar — revisa tu internet."}
        {estado === "idle" && "Se guarda solo al salir del campo."}
      </p>
    </div>
  );
}

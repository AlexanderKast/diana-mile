"use client";

import { useState } from "react";
import { IconoCandado, IconoCheck, IconoChevron } from "./icons";
import { BotonCompletarDia } from "./BotonCompletarDia";

export type DiaSemanaVista = {
  dia: number;
  titulo: string;
  contenido: string[];
  accion: string;
  completadoInicial: boolean;
  /** false si el dia todavia no desbloquea por fecha (24h desde el dia anterior). */
  desbloqueado: boolean;
  /** "9 de agosto" — solo si `desbloqueado` es false y ya tiene fecha. */
  fechaDesbloqueo: string | null;
};

/**
 * Los 7 dias de una semana del plan (Fase 22), como acordeon: cada dia
 * desarrolla la leccion semanal en la practica. Solo los dias desbloqueados
 * por fecha se pueden abrir — mismo patron de FilaDiaReto (reto de 7 dias),
 * pero contra plan_progreso.dias_completados en vez de reto_progreso.
 */
export function DiasSemana({ semana, dias }: { semana: number; dias: DiaSemanaVista[] }) {
  const completados = dias.filter((d) => d.completadoInicial).length;

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-display text-lg text-carbon">Dia a dia</h2>
        <span className="text-xs text-carbon-suave">
          {completados}/{dias.length} dias
        </span>
      </div>
      <ol className="flex flex-col gap-2">
        {dias.map((d) => (
          <FilaDiaSemana key={d.dia} semana={semana} dia={d} />
        ))}
      </ol>
    </section>
  );
}

function FilaDiaSemana({ semana, dia }: { semana: number; dia: DiaSemanaVista }) {
  const [abierto, setAbierto] = useState(false);

  if (!dia.desbloqueado) {
    return (
      <li
        className="flex min-h-[44px] items-center gap-3 rounded-xl border border-arena/70 bg-crema/40 px-4 py-3"
        aria-disabled="true"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-crema text-sm font-semibold text-carbon-suave">
          {dia.dia}
        </span>
        <span className="flex-1 text-sm text-carbon-suave">Dia {dia.dia}</span>
        <span className="flex shrink-0 items-center gap-1.5 text-xs text-ceniza">
          <IconoCandado />
          {dia.fechaDesbloqueo ?? "Pronto"}
        </span>
      </li>
    );
  }

  return (
    <li className="rounded-xl border border-arena">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        className="flex min-h-[44px] w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
            dia.completadoInicial
              ? "bg-verde-ok/15 text-verde-ok"
              : "bg-dorado/20 text-dorado-oscuro"
          }`}
        >
          {dia.completadoInicial ? <IconoCheck /> : dia.dia}
        </span>
        <span className="flex-1 text-sm text-carbon">
          Dia {dia.dia} — {dia.titulo}
        </span>
        <IconoChevron
          className={`shrink-0 text-ceniza transition-transform ${abierto ? "rotate-180" : ""}`}
        />
      </button>

      {abierto && (
        <div className="flex flex-col gap-3 px-4 pb-4">
          {dia.contenido.map((parrafo) => (
            <p key={parrafo} className="text-sm leading-relaxed text-carbon-suave">
              {parrafo}
            </p>
          ))}
          <p className="rounded-lg bg-crema px-3 py-2 text-sm font-medium text-carbon">
            {dia.accion}
          </p>
          <BotonCompletarDia
            semana={semana}
            dia={dia.dia}
            completadoInicial={dia.completadoInicial}
          />
        </div>
      )}
    </li>
  );
}

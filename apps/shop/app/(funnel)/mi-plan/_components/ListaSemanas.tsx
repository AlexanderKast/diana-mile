import Link from "next/link";
import { SEMANAS_PLAN } from "@/lib/quiz/puertas/plan-semanas";
import {
  formatearFechaDesbloqueo,
  semanaDesbloqueada,
  type FilaPlanProgreso,
} from "@/lib/mi-plan";
import { IconoCandado, IconoCheck } from "./icons";

/**
 * Las 8 semanas del plan, con desbloqueo progresivo real: solo la semana
 * con `desbloqueada_en <= ahora` es clickeable. Las futuras se muestran con
 * candado y su fecha de apertura, a proposito NO como links — es una cita
 * semanal, no una lista para adelantarse.
 */
export function ListaSemanas({ progreso }: { progreso: FilaPlanProgreso[] }) {
  return (
    <ol className="flex flex-col gap-2">
      {SEMANAS_PLAN.map((etapa) => {
        const fila = progreso.find((p) => p.semana === etapa.numero);
        const desbloqueada = fila ? semanaDesbloqueada(fila) : false;
        const completada = fila?.completada ?? false;

        const contenido = (
          <>
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                completada
                  ? "bg-verde-ok/15 text-verde-ok"
                  : desbloqueada
                    ? "bg-dorado/20 text-dorado-oscuro"
                    : "bg-crema text-carbon-suave"
              }`}
            >
              {completada ? <IconoCheck /> : etapa.numero}
            </span>
            <span className="flex-1">
              <span className={`block text-sm ${desbloqueada ? "text-carbon" : "text-carbon-suave"}`}>
                Semana {etapa.numero} — {etapa.titulo}
              </span>
              {!desbloqueada && fila?.desbloqueada_en && (
                <span className="block text-xs text-ceniza">
                  Se abre el {formatearFechaDesbloqueo(fila.desbloqueada_en)}
                </span>
              )}
            </span>
            {desbloqueada ? (
              completada && (
                <span className="shrink-0 text-xs font-medium text-verde-ok">Completada</span>
              )
            ) : (
              <IconoCandado />
            )}
          </>
        );

        if (desbloqueada) {
          return (
            <li key={etapa.numero}>
              <Link
                href={`/mi-plan/semana/${etapa.numero}`}
                className="flex min-h-[44px] items-center gap-3 rounded-xl border border-arena px-4 py-3 transition-colors hover:bg-crema active:scale-[0.99]"
              >
                {contenido}
              </Link>
            </li>
          );
        }

        return (
          <li
            key={etapa.numero}
            className="flex min-h-[44px] items-center gap-3 rounded-xl border border-arena/70 bg-crema/40 px-4 py-3"
            aria-disabled="true"
          >
            {contenido}
          </li>
        );
      })}
    </ol>
  );
}

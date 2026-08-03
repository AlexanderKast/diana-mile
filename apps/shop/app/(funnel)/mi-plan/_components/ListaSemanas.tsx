import Link from "next/link";
import { SEMANAS_PLAN } from "@/lib/quiz/puertas/plan-semanas";
import { SEMANA_GRATIS_HASTA } from "@/lib/quiz/puertas/plan-contenido";
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
 *
 * Segundo candado (semanas 3-8): sin compra (`tieneCompra` false) esas
 * semanas se marcan "Se abre con tu ritual o el coaching" y SI son links —
 * llevan a la pagina de la semana, que explica que las desbloquea.
 */
export function ListaSemanas({
  progreso,
  tieneCompra,
}: {
  progreso: FilaPlanProgreso[];
  tieneCompra: boolean;
}) {
  return (
    <ol className="flex flex-col gap-2">
      {SEMANAS_PLAN.map((etapa) => {
        const fila = progreso.find((p) => p.semana === etapa.numero);
        const abiertaPorFecha = fila ? semanaDesbloqueada(fila) : false;
        const bloqueadaPorCompra =
          etapa.numero > SEMANA_GRATIS_HASTA && !tieneCompra;
        const desbloqueada = abiertaPorFecha && !bloqueadaPorCompra;
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
              {bloqueadaPorCompra ? (
                <span className="block text-xs text-dorado-oscuro">
                  Se abre con tu ritual o el coaching
                </span>
              ) : (
                !desbloqueada &&
                fila?.desbloqueada_en && (
                  <span className="block text-xs text-ceniza">
                    Se abre el {formatearFechaDesbloqueo(fila.desbloqueada_en)}
                  </span>
                )
              )}
            </span>
            {desbloqueada ? (
              completada && (
                <span className="shrink-0 text-xs font-medium text-verde-ok">Completada</span>
              )
            ) : (
              <span className={bloqueadaPorCompra ? "text-dorado-oscuro" : undefined}>
                <IconoCandado />
              </span>
            )}
          </>
        );

        // Bloqueada por compra: link a la pagina de la semana, que muestra
        // que la desbloquea (el pitch honesto del ritual/coaching).
        if (desbloqueada || bloqueadaPorCompra) {
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

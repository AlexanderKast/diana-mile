import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SEMANAS_PLAN } from "@/lib/quiz/puertas/plan-semanas";
import { SEMANA_GRATIS_HASTA } from "@/lib/quiz/puertas/plan-contenido";
import {
  formatearFechaDesbloqueo,
  obtenerContextoMiPlan,
  semanaDesbloqueada,
  usuarioTieneCompra,
} from "@/lib/mi-plan";
import { CheckInFila } from "../_components/CheckInFila";
import { IconoCandado } from "../_components/icons";

export const metadata: Metadata = {
  title: "Tu progreso - Milito Life Shop",
};

/**
 * Check-in simple: las 8 semanas de un vistazo, marcables solo si ya estan
 * desbloqueadas. Las bloqueadas se ven pero no se pueden tocar — mismo
 * candado que en /mi-plan, para que el bloqueo se lea igual en toda la app.
 */
export default async function ProgresoPage() {
  const contexto = await obtenerContextoMiPlan();
  if (!contexto) redirect("/acceso");

  const { progreso } = contexto;
  const totalCompletadas = progreso.filter((p) => p.completada).length;
  const tieneCompra = await usuarioTieneCompra(contexto.usuario);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-5 pb-16 pt-4">
      <Link href="/mi-plan" className="text-sm text-carbon-suave hover:text-carbon">
        ← Volver a tu panel
      </Link>

      <section className="flex flex-col gap-1">
        <h1 className="font-display text-2xl text-carbon">Tu progreso</h1>
        <p className="text-sm text-carbon-suave">
          {totalCompletadas} de 8 semanas completadas.
        </p>
      </section>

      <ul className="flex flex-col gap-2">
        {SEMANAS_PLAN.map((etapa) => {
          const fila = progreso.find((p) => p.semana === etapa.numero);
          const bloqueadaPorCompra =
            etapa.numero > SEMANA_GRATIS_HASTA && !tieneCompra;
          const desbloqueada =
            !bloqueadaPorCompra && (fila ? semanaDesbloqueada(fila) : false);

          if (desbloqueada && fila) {
            return (
              <CheckInFila
                key={etapa.numero}
                semana={etapa.numero}
                titulo={etapa.titulo}
                completadaInicial={fila.completada}
              />
            );
          }

          return (
            <li
              key={etapa.numero}
              className="flex min-h-[44px] items-center gap-3 rounded-xl border border-arena/70 bg-crema/40 px-4 py-3"
              aria-disabled="true"
            >
              <IconoCandado />
              <span className="flex-1 text-sm text-carbon-suave">
                Semana {etapa.numero} — {etapa.titulo}
              </span>
              {bloqueadaPorCompra ? (
                <span className="shrink-0 text-xs text-dorado-oscuro">
                  Con tu ritual
                </span>
              ) : (
                fila?.desbloqueada_en && (
                  <span className="shrink-0 text-xs text-ceniza">
                    {formatearFechaDesbloqueo(fila.desbloqueada_en)}
                  </span>
                )
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

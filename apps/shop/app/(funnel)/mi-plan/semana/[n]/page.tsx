import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { SEMANAS_PLAN } from "@/lib/quiz/puertas/plan-semanas";
import {
  formatearFechaDesbloqueo,
  obtenerContextoMiPlan,
  semanaDesbloqueada,
} from "@/lib/mi-plan";
import { CheckInSemana } from "../../_components/CheckInSemana";
import { IconoCandado } from "../../_components/icons";

export const metadata: Metadata = {
  title: "Tu semana - Milito Life Shop",
};

export default async function SemanaPage({
  params,
}: {
  // Next 16: params siempre es una Promise, hay que await-earla.
  params: Promise<{ n: string }>;
}) {
  const { n } = await params;
  const numero = Number(n);

  if (!Number.isInteger(numero) || numero < 1 || numero > 8) {
    notFound();
  }

  const etapa = SEMANAS_PLAN.find((s) => s.numero === numero);
  if (!etapa) notFound();

  const contexto = await obtenerContextoMiPlan();
  if (!contexto) redirect("/acceso");

  const fila = contexto.progreso.find((p) => p.semana === numero);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-5 pb-16 pt-4">
      <Link href="/mi-plan" className="text-sm text-carbon-suave hover:text-carbon">
        ← Volver a tu panel
      </Link>

      <section className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-dorado-oscuro">
          Semana {etapa.numero} de 8
        </span>
        <h1 className="font-display text-2xl text-carbon">{etapa.titulo}</h1>
      </section>

      {fila && semanaDesbloqueada(fila) ? (
        <>
          <p className="text-sm leading-relaxed text-carbon-suave">{etapa.resumen}</p>
          <CheckInSemana semana={etapa.numero} completadaInicial={fila.completada} />
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-arena bg-crema p-6 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blanco text-ceniza shadow-sm">
            <IconoCandado className="h-5 w-5" />
          </span>
          <p className="text-sm text-carbon">Esta semana todavia no se desbloquea.</p>
          {fila?.desbloqueada_en && (
            <p className="text-xs text-ceniza">
              Se abre el {formatearFechaDesbloqueo(fila.desbloqueada_en)}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

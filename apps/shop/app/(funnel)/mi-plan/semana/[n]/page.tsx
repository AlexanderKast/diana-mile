import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { esPuertaReto } from "@/lib/quiz/puertas/reto-contenido";
import { obtenerSemanaPlan, SEMANA_GRATIS_HASTA } from "@/lib/quiz/puertas/plan-contenido";
import {
  formatearFechaDesbloqueo,
  obtenerContextoMiPlan,
  semanaDesbloqueada,
  usuarioTieneCompra,
} from "@/lib/mi-plan";
import { CheckInSemana } from "../../_components/CheckInSemana";
import { NotasSemana } from "../../_components/NotasSemana";
import { RutinaSemana } from "../../_components/RutinaSemana";
import { VideoSegmento } from "../../_components/VideoSegmento";
import { IconoCandado } from "../../_components/icons";

export const metadata: Metadata = {
  title: "Tu semana - Milito Life Shop",
};

/**
 * Semana N del plan de 8 semanas — contenido REAL por puerta (leccion en
 * voz de Milito + rutina marcable + video + notas persistidas), ver
 * lib/quiz/puertas/plan-contenido.ts. Dos gates:
 *   1. FECHA (todas): la semana abre segun `desbloqueada_en`.
 *   2. COMPRA (semanas 3-8): se abren con un pedido en la tienda o la
 *      suscripcion al coaching — decision de Alexander 2026-08-03. La
 *      pantalla bloqueada muestra el resumen y que la desbloquea, sin
 *      urgencia inventada.
 */
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

  const contexto = await obtenerContextoMiPlan();
  if (!contexto) redirect("/acceso");

  const { usuario, progreso, diagnostico } = contexto;
  const puerta = esPuertaReto(diagnostico?.puerta) ? diagnostico.puerta : "piel";
  const semana = obtenerSemanaPlan(puerta, numero);
  if (!semana) notFound();

  const fila = progreso.find((p) => p.semana === numero);
  const abiertaPorFecha = Boolean(fila && semanaDesbloqueada(fila));

  const requiereCompra = numero > SEMANA_GRATIS_HASTA;
  const tieneCompra = requiereCompra ? await usuarioTieneCompra(usuario) : true;

  const desbloqueada = abiertaPorFecha && tieneCompra;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-5 pb-16 pt-4">
      <Link href="/mi-plan" className="text-sm text-carbon-suave hover:text-carbon">
        ← Volver a tu panel
      </Link>

      <section className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-dorado-oscuro">
          Semana {semana.numero} de 8
        </span>
        <h1 className="font-display text-2xl text-carbon">{semana.titulo}</h1>
        <p className="text-sm text-carbon-suave">{semana.resumen}</p>
      </section>

      {desbloqueada && fila ? (
        <>
          <VideoSegmento videoId={semana.videoId} />

          <section className="flex flex-col gap-3">
            {semana.leccion.map((parrafo) => (
              <p key={parrafo} className="text-sm leading-relaxed text-carbon">
                {parrafo}
              </p>
            ))}
          </section>

          <RutinaSemana semana={semana.numero} acciones={semana.acciones} />

          <NotasSemana
            semana={semana.numero}
            completadaInicial={fila.completada}
            notasIniciales={fila.notas}
          />

          <CheckInSemana semana={semana.numero} completadaInicial={fila.completada} />
        </>
      ) : !tieneCompra ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dorado bg-crema p-6 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blanco text-dorado-oscuro shadow-sm">
              <IconoCandado className="h-5 w-5" />
            </span>
            <p className="text-sm text-carbon">
              Las semanas 3 a 8 se abren con tu ritual de la tienda o con el
              coaching grupal — las dos primeras son un regalo, el resto del
              programa acompaña lo que ya estas trabajando con Milito.
            </p>
          </div>

          <Link
            href="/mi-plan"
            className="btn-shine flex min-h-[44px] w-full items-center justify-center rounded-lg bg-dorado-oscuro px-6 py-3 text-sm font-semibold text-blanco shadow-[0_4px_14px_rgba(168,136,94,0.35)] transition-all hover:bg-dorado active:scale-[0.97]"
          >
            Ver mi ritual y el coaching
          </Link>
        </div>
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

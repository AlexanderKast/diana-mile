import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CONTRATOS_RESULTADO } from "@/lib/quiz/puertas/contratos";
import { obtenerContextoMiPlan, usuarioTieneCompra } from "@/lib/mi-plan";
import { obtenerProgresoReto } from "@/lib/reto";
import { getComunidadWhatsappLink } from "@/lib/community";
import { TOTAL_DIAS_RETO } from "@/lib/quiz/puertas/reto-contenido";
import { BarraProgreso } from "../_components/quiz/BarraProgreso";
import { EscaleraOferta } from "../_components/EscaleraOferta";
import { ListaSemanas } from "./_components/ListaSemanas";
import { VideoSegmento } from "./_components/VideoSegmento";

/**
 * Nivel de avance global — texto descriptivo por fraccion, sin promesas de
 * resultado (es una lectura del progreso, no una prediccion).
 */
function nivelDeAvance(fraccion: number): string {
  if (fraccion < 0.25) return "Vas empezando";
  if (fraccion < 0.65) return "En ritmo";
  return "Constante";
}

/**
 * Panel principal de /mi-plan. proxy.ts ya garantiza sesion valida antes de
 * llegar aca; lo que puede faltar es la FILA de usuarios_plan (sesion
 * huerfana, no deberia pasar en el flujo normal — ver obtenerContextoMiPlan)
 * y el diagnostico (quiz_respuesta_id nulo, o una fila de quiz invalida).
 * Cada bloque decide su propio fallback en vez de tumbar toda la pagina.
 */
export default async function MiPlanPage() {
  const contexto = await obtenerContextoMiPlan();

  if (!contexto) {
    // Sesion valida pero sin cuenta en usuarios_plan: no deberia ocurrir,
    // pero mandarla a rehacer el acceso es mejor que una pantalla rota.
    redirect("/acceso");
  }

  const { usuario, progreso, diagnostico } = contexto;
  const primerNombre = usuario.nombre?.trim().split(/\s+/)[0] ?? null;
  // La ficha puede ser de tipo "calificacion" (sin ritual/hrefCatalogo) para
  // puertas que todavia no existen en la practica — esta pantalla solo sabe
  // mostrar el ritual de una ficha de tipo "producto" (hoy: "piel"), asi que
  // se descarta cualquier otra sin romper el fallback ya existente.
  const fichaDiagnostico = diagnostico
    ? CONTRATOS_RESULTADO[diagnostico.puerta].segmentos[diagnostico.segmento]
    : null;
  const ficha = fichaDiagnostico?.tipo === "producto" ? fichaDiagnostico : null;
  const totalCompletadas = progreso.filter((p) => p.completada).length;
  const comunidadHref = await getComunidadWhatsappLink();

  // Avance global: quiz hecho (1 parte) + dias de reto (7) + semanas (8).
  // Ponderado por unidades reales de trabajo, no por secciones — asi cada
  // check-in mueve la barra lo mismo.
  const [progresoReto, tieneCompra] = await Promise.all([
    obtenerProgresoReto(usuario.id),
    usuarioTieneCompra(usuario),
  ]);
  const diasRetoCompletados = progresoReto.filter((f) => f.completado_en !== null).length;
  const partesTotales = 1 + TOTAL_DIAS_RETO + 8;
  const partesHechas = (diagnostico ? 1 : 0) + diasRetoCompletados + totalCompletadas;
  const fraccionAvance = partesHechas / partesTotales;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-5 pb-16 pt-4">
      <section className="flex flex-col gap-1">
        <h1 className="font-display text-2xl text-carbon">
          {primerNombre ? `Hola, ${primerNombre}` : "Tu panel"}
        </h1>
        <p className="text-sm text-carbon-suave">
          Todo tu plan con Milito, en un solo lugar.
        </p>
      </section>

      {/* Tu avance — nivel global de la persona en el programa (quiz +
          reto de 7 dias + 8 semanas), la vista "de juego" del panel. */}
      <section className="flex flex-col gap-2 rounded-2xl border border-arena bg-crema p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-display text-lg text-carbon">Tu avance</h2>
          <span className="text-xs font-semibold uppercase tracking-wide text-dorado-oscuro">
            {nivelDeAvance(fraccionAvance)}
          </span>
        </div>
        <BarraProgreso progreso={fraccionAvance} />
        <p className="text-xs text-ceniza">
          {partesHechas} de {partesTotales} pasos del programa completados —
          diagnostico, reto de 7 dias y plan de 8 semanas.
        </p>
      </section>

      {/* 1. Tu diagnostico */}
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg text-carbon">Tu diagnostico</h2>
        {ficha ? (
          <div className="rounded-2xl border border-arena bg-crema p-4">
            <Image
              src={ficha.iconoUrl}
              alt=""
              width={56}
              height={56}
              sizes="56px"
              className="h-14 w-14"
            />
            <span className="mt-2 block text-xs font-semibold uppercase tracking-wide text-dorado-oscuro">
              {ficha.tituloDiagnostico}
            </span>
            <p className="mt-1.5 text-sm text-carbon">{ficha.descripcionDiagnostico}</p>
            <p className="mt-2 text-xs text-ceniza">* {ficha.notaEstimacion}</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-arena p-4 text-center">
            <p className="text-sm text-carbon-suave">
              Todavia no tenemos tu diagnostico completo.
            </p>
            <Link
              href="/test/piel"
              className="mt-2 inline-block text-sm font-semibold text-dorado-oscuro underline decoration-dorado underline-offset-4"
            >
              Hacer el test →
            </Link>
          </div>
        )}
      </section>

      {/* 2. Tu video */}
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg text-carbon">Tu video</h2>
        <VideoSegmento videoId={ficha?.videoId ?? null} />
      </section>

      {/* 3. Tu reto de 7 dias */}
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg text-carbon">Tu reto de 7 dias</h2>
        <Link
          href="/mi-plan/reto"
          className="flex min-h-[44px] items-center justify-between gap-3 rounded-xl border border-arena px-4 py-3 transition-colors hover:bg-crema active:scale-[0.99]"
        >
          <span className="text-sm text-carbon">Un mensaje corto de Milito cada dia</span>
          <span className="text-sm text-dorado-oscuro">→</span>
        </Link>
      </section>

      {/* 4. Tu plan de 8 semanas */}
      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-display text-lg text-carbon">Tu plan de 8 semanas</h2>
          <span className="text-xs text-ceniza">{totalCompletadas}/8 completadas</span>
        </div>
        <ListaSemanas progreso={progreso} tieneCompra={tieneCompra} />
      </section>

      {/* 5. Tu progreso */}
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg text-carbon">Tu progreso</h2>
        <Link
          href="/mi-plan/progreso"
          className="flex min-h-[44px] items-center justify-between gap-3 rounded-xl border border-arena px-4 py-3 transition-colors hover:bg-crema active:scale-[0.99]"
        >
          <span className="text-sm text-carbon">Ver y marcar tus check-ins</span>
          <span className="text-sm text-dorado-oscuro">→</span>
        </Link>
      </section>

      {/* 6-7. Escalera de 3 niveles: ritual (si aplica) / sesion grupal / comunidad.
          `ficha` es null cuando el diagnostico todavia no existe (seccion 1
          ya cubre ese fallback) — la escalera igual tiene sentido sin
          ritual: la sesion grupal y la comunidad no dependen de tener un
          diagnostico de tipo "producto". */}
      <EscaleraOferta
        ficha={ficha}
        puerta={diagnostico?.puerta}
        comunidadHref={comunidadHref}
      />
    </div>
  );
}

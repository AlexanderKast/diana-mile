import { cx } from "@diana-mile/shared/utils";

/**
 * Barra de progreso, siempre visible mientras dura el test. `progreso` es
 * 0..1. Con `secciones` + `seccionActual` (puertas con etapas nombradas) la
 * barra se pinta segmentada: un tramo por seccion, los tramos anteriores a
 * la actual llenos, el actual parcial segun `progreso` global, y el nombre
 * de la etapa actual visible bajo la barra — la version "juego" de la
 * linea continua original. Sin secciones se comporta igual que siempre.
 */
export function BarraProgreso({
  progreso,
  secciones,
  seccionActual,
}: {
  progreso: number;
  secciones?: string[];
  seccionActual?: string | null;
}) {
  const fraccion = Math.min(1, Math.max(0, progreso));
  const porcentaje = Math.round(fraccion * 100);

  if (!secciones || secciones.length === 0) {
    return (
      <div
        className="h-1.5 flex-1 overflow-visible rounded-full bg-arena"
        role="progressbar"
        aria-valuenow={porcentaje}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progreso del test"
      >
        <div
          className="relative h-full rounded-full bg-gradient-to-r from-dorado-oscuro to-morado transition-[width] duration-300 ease-out"
          style={{ width: `${porcentaje}%` }}
        >
          {/* key=porcentaje: remonta el punto en cada avance para retriggerar
              la animacion de pulso (patron estandar de React sin libreria). */}
          <span key={porcentaje} className="barra-pulso-punto" aria-hidden="true" />
        </div>
      </div>
    );
  }

  // Cada tramo cubre una fraccion igual de la barra; el progreso global
  // 0..1 se traduce a "cuanto de cada tramo esta lleno". No es exacto por
  // numero de pasos por seccion, pero para la percepcion de avance la
  // division pareja lee mejor (cada etapa "pesa" lo mismo visualmente).
  const indiceActual = seccionActual ? secciones.indexOf(seccionActual) : -1;
  const tramo = 1 / secciones.length;

  return (
    <div className="flex flex-1 flex-col gap-1">
      <div
        className="flex gap-1"
        role="progressbar"
        aria-valuenow={porcentaje}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={
          seccionActual
            ? `Progreso del test — etapa: ${seccionActual}`
            : "Progreso del test"
        }
      >
        {secciones.map((seccion, i) => {
          const inicioTramo = i * tramo;
          const llenadoTramo = Math.min(
            1,
            Math.max(0, (fraccion - inicioTramo) / tramo),
          );
          const completo = llenadoTramo >= 1;
          const esActual = i === indiceActual;

          return (
            <div
              key={seccion}
              className="relative h-1.5 flex-1 overflow-visible rounded-full bg-arena"
            >
              <div
                className={cx(
                  "relative h-full rounded-full transition-[width] duration-300 ease-out",
                  completo
                    ? "bg-gradient-to-r from-dorado-oscuro to-morado"
                    : "bg-dorado-oscuro",
                )}
                style={{ width: `${Math.round(llenadoTramo * 100)}%` }}
              >
                {esActual && (
                  <span
                    key={porcentaje}
                    className="barra-pulso-punto"
                    aria-hidden="true"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
      {seccionActual && (
        <span className="text-[11px] font-semibold uppercase tracking-wide text-dorado-oscuro">
          {seccionActual}
        </span>
      )}
    </div>
  );
}

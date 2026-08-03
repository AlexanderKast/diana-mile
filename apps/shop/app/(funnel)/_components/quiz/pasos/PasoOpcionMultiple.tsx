import { cx } from "@diana-mile/shared/utils";
import type { PasoOpcionMultiple as TipoPaso } from "@/lib/quiz/tipos";
import { IconoOpcion } from "./IconoOpcion";

/** Requiere boton de continuar aparte (lo pinta QuizRunner) — aca solo se maneja la seleccion. */
export function PasoOpcionMultiple({
  paso,
  valor,
  onCambiar,
}: {
  paso: TipoPaso;
  valor: unknown;
  onCambiar: (valor: string[]) => void;
}) {
  const seleccion = Array.isArray(valor) ? (valor as string[]) : [];

  function alternar(opcionValor: string) {
    const yaElegida = seleccion.includes(opcionValor);
    if (yaElegida) {
      onCambiar(seleccion.filter((v) => v !== opcionValor));
      return;
    }
    if (paso.maximo !== undefined && seleccion.length >= paso.maximo) return;
    onCambiar([...seleccion, opcionValor]);
  }

  return (
    <div className="flex flex-col gap-3">
      {paso.opciones.map((opcion) => {
        const elegida = seleccion.includes(opcion.valor);
        return (
          <button
            key={opcion.valor}
            type="button"
            onClick={() => alternar(opcion.valor)}
            aria-pressed={elegida}
            className={cx(
              "flex min-h-14 w-full items-center gap-3 rounded-2xl border-2 px-5 py-3 text-left text-base font-medium transition-colors active:scale-[0.98]",
              elegida
                ? "border-dorado-oscuro bg-dorado/10 text-carbon"
                : "border-arena bg-blanco text-carbon-suave hover:border-dorado",
            )}
          >
            <span
              className={cx(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2",
                elegida
                  ? "border-dorado-oscuro bg-dorado-oscuro text-blanco"
                  : "border-arena",
              )}
              aria-hidden="true"
            >
              {elegida && (
                // Se monta de nuevo cada vez que "elegida" pasa a true (el
                // span solo existe cuando esta marcada), asi que el mount
                // por si solo retriggerea la animacion — sin estado extra.
                <svg
                  className="animate-check-pop"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path
                    d="M2 6l2.5 2.5L10 3"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            <span className="flex-1">{opcion.etiqueta}</span>
            {opcion.icono && (
              <IconoOpcion
                clave={opcion.icono}
                className={cx("shrink-0", elegida ? "text-dorado-oscuro" : "text-carbon-suave")}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "@diana-mile/shared/utils";

/**
 * Encabezado de seccion unico para toda la tienda.
 *
 * Antes cada seccion repetia a mano el mismo trio —eyebrow de 11px, h2 de
 * display, linea dorada— con tamaños que arrancaban en su valor de
 * escritorio (`text-[32px] md:text-[44px]`). En movil eso son seis titulos
 * casi identicos de 32px seguidos: ninguno pesa mas que el otro y la pagina
 * se lee plana.
 *
 * Aqui la escala arranca en movil y crece (`28 → 34 → 44`), y el `jerarquia`
 * permite bajarle el tono a las secciones de apoyo para que el hero y los
 * productos sigan siendo lo mas grande de la pagina.
 *
 * El eyebrow va en `carbon-suave` a proposito: en `ceniza` (#9a928a sobre
 * crema) el contraste es 2.6:1 y a 11px no lo lee nadie — falla WCAG AA.
 */
export function SectionHeading({
  eyebrow,
  titulo,
  descripcion,
  accion,
  jerarquia = "principal",
  alineado = "izquierda",
  className,
}: {
  eyebrow?: string;
  titulo: ReactNode;
  descripcion?: ReactNode;
  accion?: { href: string; label: string };
  jerarquia?: "principal" | "apoyo";
  alineado?: "izquierda" | "centro";
  className?: string;
}) {
  const centrado = alineado === "centro";

  return (
    <div
      className={cx(
        "flex flex-wrap items-end gap-x-6 gap-y-3",
        centrado ? "flex-col items-center text-center" : "justify-between",
        className,
      )}
    >
      <div className={cx(centrado && "flex flex-col items-center")}>
        {eyebrow ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-carbon-suave sm:text-[11px]">
            {eyebrow}
          </p>
        ) : null}

        <h2
          className={cx(
            "mt-2.5 font-display leading-[1.08] tracking-tight text-carbon text-balance",
            jerarquia === "principal"
              ? "text-[28px] sm:text-[34px] lg:text-[44px]"
              : "text-[24px] sm:text-[30px] lg:text-[38px]",
          )}
        >
          {titulo}
        </h2>

        <div className={cx("linea-dorada mt-4 w-14 sm:mt-5 sm:w-16")} />

        {descripcion ? (
          <p
            className={cx(
              "mt-4 max-w-md text-[14px] leading-relaxed text-carbon-suave sm:text-[15px]",
              centrado && "mx-auto",
            )}
          >
            {descripcion}
          </p>
        ) : null}
      </div>

      {accion ? (
        <Link
          href={accion.href}
          className="text-[13px] text-carbon underline decoration-dorado decoration-1 underline-offset-4 transition-colors hover:text-dorado-oscuro sm:text-[14px]"
        >
          {accion.label}
        </Link>
      ) : null}
    </div>
  );
}

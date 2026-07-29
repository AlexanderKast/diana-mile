/**
 * Primitivos del constructor visual (estilo Elementor): piezas libres que se
 * renderizan IGUAL en el editor del admin y en la tienda. Los bloques con
 * slot reciben la zona como componente (asi los tipa Puck), sin que este
 * archivo dependa de @measured/puck.
 *
 * Regla de estilos: props de estilo = enums de tokens de marca traducidos a
 * clases ESTATICAS aqui; nada de interpolar clases desde el JSON (el scanner
 * de Tailwind v4 no lo ve). Valores libres van a `style` inline.
 */

import Image from "next/image";
import { SectionDivider } from "./SectionDivider";
import type { FondoBloque } from "../puck-contract";

type ZonaProps = { style?: React.CSSProperties; className?: string };
type Zona = React.ComponentType<ZonaProps>;

export function EncabezadoBloque({
  texto,
  nivel,
  alineacion,
}: {
  texto: string;
  nivel: "grande" | "mediano";
  alineacion: "izquierda" | "centro";
}) {
  const clase = [
    "font-display text-carbon px-6",
    nivel === "grande" ? "text-[28px] md:text-[32px]" : "text-2xl",
    alineacion === "centro" ? "text-center" : "text-left",
  ].join(" ");
  return nivel === "grande" ? (
    <h2 className={clase}>{texto}</h2>
  ) : (
    <h3 className={clase}>{texto}</h3>
  );
}

export function TextoBloque({
  texto,
  alineacion,
}: {
  texto: string;
  alineacion: "izquierda" | "centro";
}) {
  return (
    <p
      className={[
        "text-sm text-carbon-suave leading-relaxed max-w-md mx-auto px-6 whitespace-pre-line",
        alineacion === "centro" ? "text-center" : "text-left",
      ].join(" ")}
    >
      {texto}
    </p>
  );
}

export function ImagenBloque({
  url,
  alt,
  ancho,
}: {
  url: string;
  alt: string;
  ancho: "completo" | "medio";
}) {
  if (!url) {
    return (
      <div className="mx-auto max-w-md px-6 py-4 text-center text-xs text-ceniza border border-dashed border-arena rounded-2xl">
        Imagen sin URL — pega el enlace de la foto en el panel derecho.
      </div>
    );
  }
  return (
    <div
      className={[
        "relative mx-auto w-full overflow-hidden rounded-2xl aspect-[4/3]",
        ancho === "medio" ? "max-w-md" : "max-w-3xl",
      ].join(" ")}
    >
      <Image
        src={url}
        alt={alt || ""}
        fill
        className="object-cover"
        sizes="(min-width: 768px) 768px, 100vw"
      />
    </div>
  );
}

/** Grid responsive: 1 columna en movil, N en escritorio. */
export function ColumnasBloque({
  contenido: Contenido,
  porFila,
}: {
  contenido: Zona;
  porFila: 2 | 3 | 4;
}) {
  const grid =
    porFila === 4
      ? "grid grid-cols-1 md:grid-cols-4 gap-4 px-6"
      : porFila === 3
        ? "grid grid-cols-1 md:grid-cols-3 gap-4 px-6"
        : "grid grid-cols-1 md:grid-cols-2 gap-4 px-6";
  return <Contenido className={grid} />;
}

const FONDO_CLASES: Record<FondoBloque, string> = {
  blanco: "bg-blanco",
  crema: "bg-crema",
  "lila-suave": "bg-lila-suave",
  joya: "seccion-joya",
};

export function BandaBloque({
  fondo,
  contenido: Contenido,
}: {
  fondo: FondoBloque;
  contenido: Zona;
}) {
  return (
    <section className={`${FONDO_CLASES[fondo] ?? "bg-crema"} py-10`}>
      <Contenido className="flex flex-col gap-4" />
    </section>
  );
}

const ALTOS = { pequeno: 12, mediano: 28, grande: 56 } as const;

export function EspaciadorBloque({
  alto,
}: {
  alto: "pequeno" | "mediano" | "grande";
}) {
  return <div style={{ height: ALTOS[alto] ?? ALTOS.mediano }} aria-hidden />;
}

export function DivisorBloque() {
  return <SectionDivider />;
}

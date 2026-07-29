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
import type { ColorTexto, EstiloBotonCta, FondoBloque } from "../puck-contract";

/** Paleta de texto → clases estaticas (el scanner de Tailwind las ve aqui). */
const COLOR_TEXTO_CLASES: Record<ColorTexto, string> = {
  carbon: "text-carbon",
  "carbon-suave": "text-carbon-suave",
  ceniza: "text-ceniza",
  "dorado-oscuro": "text-dorado-oscuro",
  morado: "text-morado",
  blanco: "text-blanco",
};

const FUENTE_CLASES = {
  display: "font-display",
  sans: "font-sans",
} as const;

const colorTexto = (color?: string) =>
  COLOR_TEXTO_CLASES[(color as ColorTexto) ?? "carbon"] ?? "text-carbon";

const fuenteTexto = (fuente?: string) =>
  FUENTE_CLASES[(fuente as "display" | "sans") ?? "display"] ?? "font-display";

/**
 * Clases del BotonCTA segun su personalizacion. TODO estatico: cada
 * combinacion esta escrita literal para que el scanner de Tailwind la vea.
 * La usan el bloque real (shop) y el preview del editor (admin).
 */
export function clasesBotonCta({
  color,
  estilo,
  efecto,
  tamano,
  anchoBoton,
  fuente,
}: EstiloBotonCta): string {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-semibold tracking-wide transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]";

  const tipografia = fuente === "display" ? "font-display" : "font-sans";

  const dimension =
    tamano === "grande"
      ? "min-h-[52px] px-10 text-lg"
      : "min-h-[44px] px-8 text-base";

  const anchura = anchoBoton === "completo" ? "w-full" : "";

  const colores =
    estilo === "borde"
      ? color === "morado"
        ? "border-2 border-morado text-morado bg-transparent hover:bg-lila-suave"
        : color === "carbon"
          ? "border-2 border-carbon text-carbon bg-transparent hover:bg-crema"
          : "border-2 border-dorado-oscuro text-dorado-oscuro bg-transparent hover:bg-crema"
      : color === "morado"
        ? "bg-morado text-blanco shadow-[0_4px_14px_rgba(107,78,140,0.35)] hover:bg-morado-oscuro"
        : color === "carbon"
          ? "bg-carbon text-blanco shadow-[0_4px_14px_rgba(26,23,20,0.3)] hover:bg-carbon-suave"
          : "bg-dorado-oscuro text-blanco shadow-[0_4px_14px_rgba(168,136,94,0.35)] hover:bg-dorado";

  const brillo =
    efecto === "brillo" || efecto === "brillo-pulso" ? "btn-shine" : "";
  const pulso =
    efecto === "pulso" || efecto === "brillo-pulso"
      ? color === "morado"
        ? "cta-pulse-morado"
        : "cta-pulse"
      : "";

  return [base, tipografia, dimension, anchura, colores, brillo, pulso]
    .filter(Boolean)
    .join(" ");
}

type ZonaProps = { style?: React.CSSProperties; className?: string };
type Zona = React.ComponentType<ZonaProps>;

const TAMANO_ENCABEZADO = {
  gigante: "text-[36px] md:text-[46px] leading-tight",
  grande: "text-[28px] md:text-[32px]",
  mediano: "text-2xl",
  pequeno: "text-xl",
} as const;

export function EncabezadoBloque({
  texto,
  tamano,
  fuente,
  color,
  alineacion,
  nivel,
}: {
  texto: string;
  tamano?: "gigante" | "grande" | "mediano" | "pequeno";
  fuente?: "display" | "sans";
  color?: ColorTexto;
  alineacion: "izquierda" | "centro";
  /** Prop vieja (disenos guardados antes de `tamano`); se respeta como fallback. */
  nivel?: "grande" | "mediano";
}) {
  const tamanoFinal = tamano ?? nivel ?? "grande";
  const clase = [
    "px-6",
    fuenteTexto(fuente),
    colorTexto(color),
    TAMANO_ENCABEZADO[tamanoFinal] ?? TAMANO_ENCABEZADO.grande,
    alineacion === "centro" ? "text-center" : "text-left",
  ].join(" ");
  return tamanoFinal === "pequeno" || tamanoFinal === "mediano" ? (
    <h3 className={clase}>{texto}</h3>
  ) : (
    <h2 className={clase}>{texto}</h2>
  );
}

const TAMANO_TEXTO = {
  grande: "text-lg",
  normal: "text-sm md:text-base",
  pequeno: "text-xs",
} as const;

export function TextoBloque({
  texto,
  tamano,
  fuente,
  color,
  alineacion,
}: {
  texto: string;
  tamano?: "grande" | "normal" | "pequeno";
  fuente?: "display" | "sans";
  color?: ColorTexto;
  alineacion: "izquierda" | "centro";
}) {
  return (
    <p
      className={[
        "leading-relaxed max-w-md mx-auto px-6 whitespace-pre-line",
        TAMANO_TEXTO[tamano ?? "normal"] ?? TAMANO_TEXTO.normal,
        fuente === "display" ? "font-display" : "font-sans",
        colorTexto(color ?? "carbon-suave"),
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
  proporcion,
}: {
  url: string;
  alt: string;
  ancho: "completo" | "medio";
  /** ancho/alto de la imagen original (la calcula el editor). 0 = desconocida. */
  proporcion?: number;
}) {
  if (!url) {
    return (
      <div className="mx-auto max-w-md px-6 py-4 text-center text-xs text-ceniza border border-dashed border-arena rounded-2xl">
        Imagen sin URL — sube una desde el panel derecho.
      </div>
    );
  }
  return (
    <div
      className={[
        "relative mx-auto w-full overflow-hidden rounded-2xl",
        ancho === "medio" ? "max-w-md" : "max-w-3xl",
      ].join(" ")}
      // La imagen conserva SU formato (1:1, 4:5, 9:16...): el contenedor
      // reserva la proporcion exacta y no se recorta nada. Sin proporcion
      // conocida (URL pegada a mano sin pasar por el editor) cae a 4:3.
      style={{ aspectRatio: proporcion && proporcion > 0 ? String(proporcion) : "4 / 3" }}
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

/**
 * Video con controles, carga perezosa (solo metadata) y portada opcional.
 * El archivo vive en el CDN de Shopify; se sube desde el editor.
 */
export function VideoBloque({
  url,
  poster,
  ancho,
}: {
  url: string;
  poster: string;
  ancho: "completo" | "medio";
}) {
  if (!url) {
    return (
      <div className="mx-auto max-w-md px-6 py-4 text-center text-xs text-ceniza border border-dashed border-arena rounded-2xl">
        Video sin archivo — sube uno desde el panel derecho.
      </div>
    );
  }
  return (
    <div
      className={[
        "mx-auto w-full px-6",
        ancho === "medio" ? "max-w-md" : "max-w-3xl",
      ].join(" ")}
    >
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        src={url}
        poster={poster || undefined}
        controls
        playsInline
        preload="metadata"
        className="w-full rounded-2xl bg-carbon"
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

/**
 * Isotipo de Milito: gota partida al medio — mitad izquierda solo contorno,
 * mitad derecha solida, con un circulo de espacio negativo descentrado —
 * tal cual el brand board original de Alexander. Vectorizada por Magnific
 * (images_to_svg) a partir de ESA imagen exacta, no de una regeneracion:
 * el trazo se recorto del board y se vectorizo tal cual, sin reinterpretar
 * la forma.
 *
 * Un solo componente, reusado tal cual en icon.tsx, apple-icon.tsx,
 * app/loading.tsx, el header y el pie: si el trazo cambia, cambia en un
 * solo lugar. `MarcaGota` es SVG plano (funciona igual en el DOM real que
 * dentro de ImageResponse — satori renderiza <svg> nativo).
 */

/** El cuerpo dorado: la mitad solida + el contorno completo de la gota. */
const PATH_CUERPO =
  "M 528.086 184.681 C 529.617 185.189 535.12 190.583 536.554 191.987 C 673.747 326.353 817.328 494.778 878.315 679.476 C 888.606 710.642 897.308 751.297 898.093 783.143 C 900.786 883.128 863.097 979.983 793.533 1051.85 C 723.653 1125.22 629.595 1163.09 529.091 1165.66 C 521.044 1165.66 512.999 1165.43 504.965 1164.99 C 407.48 1157.9 316.681 1112.8 252.119 1039.41 C 28.8177 785.353 254.545 481.266 433.587 280.494 C 461.411 249.293 496.697 212.178 528.086 184.681 z";

/** Los recortes en crema: el interior hueco de la mitad izquierda + el punto. */
const PATHS_HUECOS = [
  "M 528.487 236.596 C 539.489 246.583 551.585 260.186 562.2 271.079 C 600.755 310.643 636.255 353.309 671.25 396.036 C 651.776 410.975 628.146 432.098 610.054 448.817 C 511.076 540.283 419.344 649.354 369.593 775.761 C 364.189 789.676 359.602 803.895 355.856 818.345 C 305.623 745.678 273.06 656.49 269.948 567.903 C 318.634 469.37 446.327 312.421 528.487 236.596 z",
  "M 237.53 629.566 C 240.419 632.921 246.734 666.647 248.953 674.772 C 267.57 742.943 298.354 809.492 343.432 864.509 C 333.679 939.224 332.306 998.29 348.92 1073.1 C 341.705 1068.27 334.553 1062.94 327.515 1057.82 C 229.286 981.043 176.499 855.41 203.468 731.07 C 210.756 697.468 224.858 661.533 237.53 629.566 z",
  "M 375.285 903.495 C 379.542 905.97 399.214 926.621 404.148 931.38 C 415.196 941.874 426.532 952.059 438.144 961.924 C 507.348 1019.72 599.563 1065.16 686.893 1087.32 C 676.376 1092.5 667.091 1097 656.246 1101.54 C 564.296 1137.36 485.419 1135.96 394.57 1098.02 C 376.47 1029.6 369.186 974.706 375.285 903.495 z",
  "M 677.296 634.93 C 721.399 630.873 760.411 663.405 764.345 707.519 C 768.278 751.633 735.636 790.554 691.511 794.364 C 647.561 798.158 608.828 765.674 604.91 721.735 C 600.992 677.795 633.368 638.971 677.296 634.93 z",
];

// Contenido nativo 0..1080 (ancho) x 0..1280 (alto): se agrega margen
// horizontal para volverlo CUADRADO. Sin esto satori (ImageResponse)
// estira el SVG sin respetar preserveAspectRatio cuando el viewBox no es
// cuadrado y el <svg> si lo es — ya paso una vez y ovalo el punto.
const VIEWBOX = "-100 0 1280 1280";

export type MarcaGotaColores = {
  /** Color del cuerpo de la gota (contorno + mitad solida). */
  dorado?: string;
  /** Recortes en crema — debe coincidir con el fondo detras de la marca. */
  fondo?: string;
};

const COLORES_DEFECTO: Required<MarcaGotaColores> = {
  dorado: "#C4A882",
  fondo: "#F2EDE6",
};

export function MarcaGota({
  size = 40,
  colores,
  className,
}: {
  size?: number;
  colores?: MarcaGotaColores;
  className?: string;
}) {
  const c = { ...COLORES_DEFECTO, ...colores };
  return (
    <svg
      width={size}
      height={size}
      viewBox={VIEWBOX}
      className={className}
      aria-hidden="true"
    >
      <path d={PATH_CUERPO} fill={c.dorado} />
      {PATHS_HUECOS.map((d) => (
        <path key={d.slice(0, 12)} d={d} fill={c.fondo} />
      ))}
    </svg>
  );
}

/** Fondo crema + marca centrada — lo que usan icon.tsx y apple-icon.tsx. */
export function iconoMilito(size: number) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F2EDE6",
      }}
    >
      <MarcaGota size={size * 0.74} />
    </div>
  );
}

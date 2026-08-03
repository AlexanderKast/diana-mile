import type { ReactNode } from "react";

/**
 * Registro de iconos de linea (carbón, mismo stroke que el check de
 * PasoOpcionUnica: 1.75, round cap/join) para las opciones del quiz — cada
 * puerta le asigna a cada opcion una `ClaveIcono` de este set, reusando
 * icono cuando el concepto se repite (ej. "reloj" en cualquier pregunta de
 * tiempo). Dibujados a mano en vez de generados con IA: 100+ opciones entre
 * las 5 puertas hacen que un set de trazo consistente sea mas confiable
 * (y mas barato) que generar cada uno por separado.
 */
export type ClaveIcono =
  | "reloj"
  | "relojArena"
  | "calendario"
  | "luna"
  | "sol"
  | "gota"
  | "vaso"
  | "corazon"
  | "rayo"
  | "musculo"
  | "pesas"
  | "correr"
  | "caminar"
  | "sofa"
  | "balanza"
  | "manzana"
  | "plato"
  | "cara"
  | "brillo"
  | "mancha"
  | "arruga"
  | "frasco"
  | "cerebro"
  | "interrogacion"
  | "burbuja"
  | "maletin"
  | "billete"
  | "diana"
  | "bombilla"
  | "gente"
  | "check"
  | "cuerpo";

const PROPS_SVG = {
  width: 20,
  height: 20,
  viewBox: "0 0 20 20",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const TRAZOS: Record<ClaveIcono, ReactNode> = {
  reloj: (
    <>
      <circle cx="10" cy="10" r="7.25" />
      <path d="M10 6v4l2.75 2" />
    </>
  ),
  relojArena: (
    <path d="M5.5 3h9M5.5 17h9M6 3c0 3 2 4.5 4 5.5C8 9.5 6 11 6 14v3M14 3c0 3-2 4.5-4 5.5 2 1 4 2.5 4 5.5v3" />
  ),
  calendario: (
    <>
      <rect x="3.25" y="4" width="13.5" height="12.5" rx="1.75" />
      <path d="M3.25 8h13.5M7 2.5v3M13 2.5v3" />
    </>
  ),
  luna: <path d="M13.5 3.2A7 7 0 1 0 16.8 13a5.6 5.6 0 0 1-3.3-9.8Z" />,
  sol: (
    <>
      <circle cx="10" cy="10" r="3.5" />
      <path d="M10 2.5v2M10 15.5v2M17.5 10h-2M4.5 10h-2M15.3 4.7l-1.4 1.4M6.1 13.9l-1.4 1.4M15.3 15.3l-1.4-1.4M6.1 6.1 4.7 4.7" />
    </>
  ),
  gota: <path d="M10 2.5s5.5 6.4 5.5 10a5.5 5.5 0 1 1-11 0c0-3.6 5.5-10 5.5-10Z" />,
  vaso: (
    <>
      <path d="M6 3h8l-1 14H7L6 3Z" />
      <path d="M6.6 8h6.8" />
    </>
  ),
  corazon: (
    <path d="M10 17s-6.5-4.1-6.5-8.7A3.8 3.8 0 0 1 10 5.9a3.8 3.8 0 0 1 6.5 2.4C16.5 12.9 10 17 10 17Z" />
  ),
  rayo: <path d="M11 2.5 4.5 11h4l-1 6.5L15.5 9h-4l0.5-6.5Z" strokeLinejoin="round" />,
  musculo: (
    <path d="M4 12.5 4 9a2 2 0 0 1 2-2c0-1.4 1.1-2.5 2.5-2.5S11 5.6 11 7v.5h1a3 3 0 0 1 3 3V13a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4Z" />
  ),
  pesas: (
    <>
      <path d="M2.5 9v2M4 7.5v5M16 7.5v5M17.5 9v2M4 10h12" />
      <rect x="6.5" y="6" width="2.2" height="8" rx="0.6" />
      <rect x="11.3" y="6" width="2.2" height="8" rx="0.6" />
    </>
  ),
  correr: (
    <path d="M12.5 3.3a1.3 1.3 0 1 1-1.9 1.8M7 6l3 2 1.5 3.5-1 5M10 8l3 1 1.5 3M7 6 4 8m3 3-2.5 1.5M7 9l-1.5 4" />
  ),
  caminar: (
    <path d="M12.3 3.5a1.2 1.2 0 1 1-1.6 1.7M9.5 6 8 9l1 2-1 6M9 9l3 1 2 2.5M8 9 5.5 7M8 15l-2.5 2" />
  ),
  sofa: (
    <path d="M4 11V8a1.5 1.5 0 0 1 3 0v1h6V8a1.5 1.5 0 0 1 3 0v3M3.5 11h13v3.5a1 1 0 0 1-1 1H4.5a1 1 0 0 1-1-1V11ZM4.5 14.5V17M15.5 14.5V17" />
  ),
  balanza: (
    <>
      <path d="M10 3v13.5M6 16.5h8" />
      <path d="M4 6h5M11 6h5" />
      <path d="M4 6 2 10.2a2.2 2.2 0 0 0 4 0L4 6ZM16 6l-2 4.2a2.2 2.2 0 0 0 4 0L16 6Z" />
    </>
  ),
  manzana: (
    <path d="M10 6.3c-2.6-2-6.2-.2-6.2 3.4 0 3.4 2.7 7 5 7 .5 0 .8-.2 1.2-.2s.7.2 1.2.2c2.3 0 5-3.6 5-7 0-3.6-3.6-5.4-6.2-3.4ZM10 6.3c0-1.6.8-2.8 2-3.5" />
  ),
  plato: (
    <>
      <circle cx="10" cy="10.5" r="7" />
      <circle cx="10" cy="10.5" r="3.2" />
    </>
  ),
  cara: (
    <>
      <circle cx="10" cy="10" r="7" />
      <path d="M7.5 9v.01M12.5 9v.01M7.3 13c.8.7 1.7 1 2.7 1s1.9-.3 2.7-1" />
    </>
  ),
  brillo: (
    <path d="M10 2.5c.4 2.4 1.5 3.5 3.9 3.9-2.4.4-3.5 1.5-3.9 3.9-.4-2.4-1.5-3.5-3.9-3.9 2.4-.4 3.5-1.5 3.9-3.9ZM15.5 12c.25 1.4.85 2 2.25 2.25-1.4.25-2 .85-2.25 2.25-.25-1.4-.85-2-2.25-2.25 1.4-.25 2-.85 2.25-2.25Z" />
  ),
  mancha: (
    <>
      <circle cx="10" cy="10" r="7" />
      <circle cx="8" cy="8.5" r="1.4" />
      <circle cx="12.2" cy="11" r="1" />
      <circle cx="9.5" cy="12.8" r="0.7" />
    </>
  ),
  arruga: <path d="M3 7c1.6 1.6 3.2-1.6 4.8 0s3.2-1.6 4.8 0 3.2-1.6 4.4 0M3 12.5c1.6 1.6 3.2-1.6 4.8 0s3.2-1.6 4.8 0 3.2-1.6 4.4 0" />,
  frasco: (
    <>
      <rect x="6" y="7" width="8" height="10" rx="1.5" />
      <path d="M8 7V4.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V7" />
      <path d="M6 11h8" />
    </>
  ),
  cerebro: (
    <path d="M7.8 3.5c-2 0-3.3 1.6-3.1 3.3C3.5 7.3 3 8.4 3 9.5c0 1.2.7 2.2 1.7 2.7-.1.3-.1.6-.1.9 0 1.8 1.5 3.2 3.3 3.2.5 0 1-.1 1.4-.3M12.2 3.5c2 0 3.3 1.6 3.1 3.3 1.2.5 1.7 1.6 1.7 2.7 0 1.2-.7 2.2-1.7 2.7.1.3.1.6.1.9 0 1.8-1.5 3.2-3.3 3.2-.5 0-1-.1-1.4-.3M10 4v12" />
  ),
  interrogacion: (
    <>
      <circle cx="10" cy="10" r="7" />
      <path d="M8 8.3a2 2 0 1 1 3.2 1.6c-.7.5-1.2.9-1.2 1.9" />
      <path d="M10 14v.01" />
    </>
  ),
  burbuja: (
    <path d="M3 4.5h14v9H8.5L5 16.5V13.5H3v-9Z" />
  ),
  maletin: (
    <>
      <rect x="2.5" y="6.5" width="15" height="9.5" rx="1.5" />
      <path d="M7 6.5V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 13 5v1.5M2.5 10.5h15" />
    </>
  ),
  billete: (
    <>
      <rect x="2.5" y="5.5" width="15" height="9" rx="1.5" />
      <circle cx="10" cy="10" r="2.25" />
      <path d="M5 8v.01M15 12v.01" />
    </>
  ),
  diana: (
    <>
      <circle cx="10" cy="10" r="7" />
      <circle cx="10" cy="10" r="4" />
      <circle cx="10" cy="10" r="1" />
    </>
  ),
  bombilla: (
    <path d="M6.3 8.3a3.7 3.7 0 1 1 6.4 2.5c-.7.7-1.2 1.3-1.2 2.2H8.5c0-.9-.5-1.5-1.2-2.2a3.7 3.7 0 0 1-1-2.5ZM8.3 16h3.4" />
  ),
  gente: (
    <path d="M7 9.5a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5ZM3 16v-1.2c0-1.8 1.8-3.3 4-3.3s4 1.5 4 3.3V16M13 9.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM11.5 11.5c.5-.2 1-.3 1.5-.3 2.2 0 4 1.5 4 3.3V16" />
  ),
  check: <path d="M4 10.5 8 14.5 16 5.5" />,
  cuerpo: (
    <>
      <circle cx="10" cy="3.8" r="1.8" />
      <path d="M10 6.2v6M6.5 9h7M6.5 17l2.2-6.5M13.5 17l-2.2-6.5" />
    </>
  ),
};

export function IconoOpcion({ clave, className }: { clave?: string; className?: string }) {
  const trazo = clave ? TRAZOS[clave as ClaveIcono] : undefined;
  if (!trazo) return null;

  return (
    <svg {...PROPS_SVG} className={className} aria-hidden="true">
      {trazo}
    </svg>
  );
}

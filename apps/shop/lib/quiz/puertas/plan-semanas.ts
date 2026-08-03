/**
 * Titulos y resumenes de las 8 semanas del plan — SOLO texto, sin contenido
 * real todavia (eso vive semana a semana dentro del panel `/mi-plan`, fase
 * futura). Uniformes para cualquier segmento a proposito: esta lista no
 * promete un temario especifico por tipo de piel, solo la forma de la ruta
 * completa.
 *
 * Unico lugar de verdad: tanto /resultado/[id] (preview antes de crear
 * cuenta) como /mi-plan (panel real, post-cuenta) importan de aca para que
 * los titulos nunca se desincronicen entre las dos pantallas.
 */
export type EtapaPlan = {
  numero: number;
  titulo: string;
  resumen: string;
};

export const SEMANAS_PLAN: EtapaPlan[] = [
  {
    numero: 1,
    titulo: "Fundamentos",
    resumen: "Arrancas tu ritual y aprendes el orden correcto de cada paso.",
  },
  {
    numero: 2,
    titulo: "Constancia",
    resumen: "La semana en la que el habito se empieza a sostener solo.",
  },
  {
    numero: 3,
    titulo: "Ajuste fino",
    resumen: "Afinamos cantidades y frecuencia segun como va respondiendo tu rutina.",
  },
  {
    numero: 4,
    titulo: "Primer chequeo",
    resumen: "Revisamos juntas que tanto avanzaste desde el diagnostico.",
  },
  {
    numero: 5,
    titulo: "Profundizacion",
    resumen: "Sumamos el paso que faltaba para tu segmento especifico.",
  },
  {
    numero: 6,
    titulo: "Sostenimiento",
    resumen: "Mantener lo logrado, sin retroceder por descuido.",
  },
  {
    numero: 7,
    titulo: "Afinacion",
    resumen: "Ultimos ajustes antes del cierre del programa.",
  },
  {
    numero: 8,
    titulo: "Nuevo habito",
    resumen: "Tu ritual queda instalado como parte de tu rutina diaria.",
  },
];

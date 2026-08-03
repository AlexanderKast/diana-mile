import type { Puerta, QuizPuerta } from "../tipos";
import { crearPuertaPiel } from "./piel";
import { crearPuertaEnergia } from "./energia";
import { crearPuertaPeso } from "./peso";
import { crearPuertaSesion } from "./sesion";
import { crearPuertaNegocio } from "./negocio";

/** Union de puertas validas — la misma lista que la ruta dinamica usa para devolver 404. */
export const PUERTAS_VALIDAS: QuizPuerta[] = [
  "piel",
  "energia",
  "peso",
  "sesion",
  "negocio",
];

export function esPuertaValida(valor: string): valor is QuizPuerta {
  return (PUERTAS_VALIDAS as string[]).includes(valor);
}

/** Registro central: una entrada por puerta, las 5 con contenido real. */
const FABRICAS_PUERTA: Record<QuizPuerta, () => Puerta> = {
  piel: () => crearPuertaPiel(),
  energia: () => crearPuertaEnergia(),
  peso: () => crearPuertaPeso(),
  sesion: () => crearPuertaSesion(),
  negocio: () => crearPuertaNegocio(),
};

export function obtenerPuerta(id: QuizPuerta): Puerta {
  return FABRICAS_PUERTA[id]();
}

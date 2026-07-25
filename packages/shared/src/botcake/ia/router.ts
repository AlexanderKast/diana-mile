import {
  EXPERTOS,
  EXPERTO_POR_DEFECTO,
  listaParaRouter,
  type ExpertoId,
} from "./expertos";
import { chat, MODELO_ROUTER } from "./mistral";

/**
 * Decide que experto atiende el mensaje. Hibrido a proposito:
 * 1) pistas por palabra clave — instantaneo y gratis, resuelve la mayoria;
 * 2) clasificador con un modelo chico solo cuando hay duda real.
 */

const ROUTER_SYSTEM = `Clasificas mensajes que llegan al WhatsApp de una marca colombiana de skincare, bienestar y creacion de contenido (Milito Life).

Categorias disponibles:
{{CATEGORIAS}}

Responde UNICAMENTE con el id de la categoria, en minusculas, sin comillas, sin explicacion. Si dudas entre dos, elige la que resuelva la necesidad mas inmediata de la persona. Si el mensaje no encaja en ninguna o es solo un saludo, responde: general`;

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** Coincidencia por pistas. Devuelve null si no hay una ganadora clara. */
export function clasificarPorPistas(mensaje: string): ExpertoId | null {
  const texto = normalizar(mensaje);
  const puntajes = new Map<ExpertoId, number>();

  for (const experto of Object.values(EXPERTOS)) {
    if (experto.id === "general") continue;
    let puntaje = 0;
    for (const pista of experto.pistas) {
      if (texto.includes(normalizar(pista))) {
        // Las pistas largas son mas especificas: pesan mas.
        puntaje += pista.includes(" ") ? 3 : 2;
      }
    }
    if (puntaje > 0) puntajes.set(experto.id, puntaje);
  }

  if (puntajes.size === 0) return null;

  const ordenados = [...puntajes.entries()].sort((a, b) => b[1] - a[1]);
  const [mejorId, mejorPuntaje] = ordenados[0];
  const segundoPuntaje = ordenados[1]?.[1] ?? 0;

  // Solo confiamos en las pistas si hay un ganador destacado; si dos areas
  // empatan, el mensaje es ambiguo y decide el modelo.
  return mejorPuntaje > segundoPuntaje ? mejorId : null;
}

export type ContextoRuteo = {
  /** Experto que venia atendiendo, para dar continuidad al hilo. */
  expertoPrevio?: ExpertoId | null;
  /** Si la persona tiene un pedido reciente, "mi pedido" es literal. */
  tienePedidoActivo?: boolean;
};

export async function elegirExperto(
  mensaje: string,
  contexto: ContextoRuteo = {},
): Promise<ExpertoId> {
  const porPistas = clasificarPorPistas(mensaje);
  if (porPistas) return porPistas;

  // Mensajes muy cortos ("ok", "si", "y eso?") continuan el hilo anterior:
  // clasificarlos de cero rompe la conversacion.
  const palabras = mensaje.trim().split(/\s+/).length;
  if (palabras <= 3 && contexto.expertoPrevio) return contexto.expertoPrevio;

  try {
    const { texto } = await chat(
      [
        {
          role: "system",
          content: ROUTER_SYSTEM.replace("{{CATEGORIAS}}", listaParaRouter()),
        },
        { role: "user", content: mensaje },
      ],
      { modelo: MODELO_ROUTER, maxTokens: 12, temperatura: 0 },
    );

    const id = normalizar(texto).replace(/[^a-z_]/g, "") as ExpertoId;
    if (id in EXPERTOS) return id;
  } catch (err) {
    console.warn("[wa-router] fallo la clasificacion:", err);
  }

  return contexto.expertoPrevio ?? EXPERTO_POR_DEFECTO;
}

import { ENTRENAMIENTO_PERSONAL } from "./conocimiento/entrenamiento";
import { NUSKIN_NEGOCIO } from "./conocimiento/nuskin-negocio";
import { NUSKIN_PRODUCTOS } from "./conocimiento/nuskin-productos";
import { CONTENIDO_MARCAS } from "./conocimiento/contenido";
import { AGENCIA_CREADORES } from "./conocimiento/agencia";
import { COMUNIDAD, TIENDA_MILITO } from "./conocimiento/tienda";

export type ExpertoId =
  | "general"
  | "tienda"
  | "pedido"
  | "entrenamiento"
  | "nuskin_negocio"
  | "nuskin_productos"
  | "contenido"
  | "agencia";

export type Experto = {
  id: ExpertoId;
  /** Se le muestra al router para que elija. Debe ser discriminante. */
  cuando: string;
  /** Base de conocimiento que se inyecta en el system prompt. */
  conocimiento: string;
  /** Si necesita el catalogo real de la tienda en el contexto. */
  necesitaCatalogo?: boolean;
  /** Si debe escalar a un humano en vez de conversar. */
  escalaAHumano?: boolean;
  /** Palabras que disparan este experto sin gastar una llamada al router. */
  pistas: string[];
};

export const EXPERTOS: Record<ExpertoId, Experto> = {
  general: {
    id: "general",
    cuando:
      "Saludos, mensajes sueltos o ambiguos, preguntas sobre quien es Milito, o interes en la comunidad.",
    conocimiento: COMUNIDAD,
    pistas: ["hola", "buenas", "buenos dias", "buenas tardes", "info", "comunidad"],
  },
  tienda: {
    id: "tienda",
    cuando:
      "Pregunta por productos de la tienda, precios, disponibilidad, como comprar, envios o pago contra entrega. Tambien cuando quiere una recomendacion de producto para su piel o su caso.",
    conocimiento: `${TIENDA_MILITO}\n\n${COMUNIDAD}`,
    necesitaCatalogo: true,
    pistas: [
      "precio",
      "cuanto vale",
      "cuanto cuesta",
      "comprar",
      "pedido nuevo",
      "envio",
      "contra entrega",
      "contraentrega",
      "disponible",
      "tienen",
      "catalogo",
    ],
  },
  pedido: {
    id: "pedido",
    cuando:
      "Pregunta por un pedido YA hecho: donde va, cuando llega, la guia, quiere cambiarlo o cancelarlo, o tiene un problema o reclamo con su compra.",
    conocimiento: TIENDA_MILITO,
    escalaAHumano: true,
    pistas: [
      "mi pedido",
      "mi orden",
      "guia",
      "no me ha llegado",
      "cuando llega",
      "rastrear",
      "cancelar",
      "devolver",
      "reclamo",
      "llego mal",
      "equivocado",
    ],
  },
  entrenamiento: {
    id: "entrenamiento",
    cuando:
      "Pregunta sobre ejercicio, rutinas, gimnasio, bajar de peso, tonificar, habitos, alimentacion general o energia.",
    conocimiento: `${ENTRENAMIENTO_PERSONAL}\n\n${COMUNIDAD}`,
    pistas: [
      "entrenar",
      "entreno",
      "rutina",
      "gym",
      "gimnasio",
      "ejercicio",
      "bajar de peso",
      "adelgazar",
      "tonificar",
      "musculo",
      "dieta",
      "abdomen",
    ],
  },
  nuskin_negocio: {
    id: "nuskin_negocio",
    cuando:
      "Pregunta por la oportunidad de negocio, ser distribuidora o afiliada, ganar dinero, trabajar con Milito, emprender o el plan de compensacion.",
    conocimiento: NUSKIN_NEGOCIO,
    pistas: [
      "negocio",
      "oportunidad",
      "distribuidora",
      "afiliada",
      "afiliarme",
      "ganar dinero",
      "emprender",
      "trabajar contigo",
      "socio",
      "piramide",
      "multinivel",
      "ingresos",
    ],
  },
  nuskin_productos: {
    id: "nuskin_productos",
    cuando:
      "Pregunta por productos Nu Skin en concreto (Epoch, ageLOC, Pharmanex, dispositivos), rutinas de piel, o que producto le sirve para un problema de piel o bienestar.",
    conocimiento: `${NUSKIN_PRODUCTOS}\n\n${TIENDA_MILITO}`,
    necesitaCatalogo: true,
    pistas: [
      "nuskin",
      "nu skin",
      "epoch",
      "ageloc",
      "pharmanex",
      "piel",
      "arrugas",
      "manchas",
      "acne",
      "serum",
      "crema",
      "rutina de piel",
      "limpiador",
    ],
  },
  contenido: {
    id: "contenido",
    cuando:
      "Pregunta como crear contenido, empezar en redes, UGC, ganchos, camara, o como conseguir marcas siendo creadora.",
    conocimiento: `${CONTENIDO_MARCAS}\n\n${COMUNIDAD}`,
    // "creadora"/"creador" a secas son ambiguas: las usa tanto quien quiere
    // serlo como la marca que busca una. Se dejan solo en frases largas.
    pistas: [
      "contenido",
      "ugc",
      "ser creadora",
      "tiktok",
      "reels",
      "instagram",
      "grabar",
      "video",
      "seguidores",
      "marca personal",
      "algoritmo",
    ],
  },
  agencia: {
    id: "agencia",
    cuando:
      "Es una MARCA que busca contenido o creadores, o una creadora que quiere postularse a la agencia para que le consigan trabajo con marcas.",
    conocimiento: `${AGENCIA_CREADORES}\n\n${CONTENIDO_MARCAS}`,
    pistas: [
      "agencia",
      "campana",
      "colaboracion",
      "colab",
      "cotizacion",
      "propuesta",
      "necesito creadores",
      "necesito creadoras",
      "busco creadoras",
      "busco creadores",
      "buscamos creadoras",
      "buscamos creadores",
      "somos una marca",
      "para mi marca",
      "postularme",
      "portafolio",
      "tarifas",
    ],
  },
};

export const EXPERTO_POR_DEFECTO: ExpertoId = "general";

/** Catalogo de opciones que se le pasa al router para clasificar. */
export function listaParaRouter(): string {
  return Object.values(EXPERTOS)
    .map((e) => `- ${e.id}: ${e.cuando}`)
    .join("\n");
}

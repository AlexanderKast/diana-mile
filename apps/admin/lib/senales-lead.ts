import type { SenalesLead } from "@diana-mile/shared/crm/scoring";

/**
 * Traduce lo que ya sabemos de un lead a las senales que entiende el scoring.
 *
 * El scoring vive en `shared` y no sabe nada de Supabase a proposito. Este
 * archivo es el puente: mira las columnas y tablas que SI existen hoy y decide
 * que senal esta encendida. Lo que no se puede saber se deja sin definir — no
 * se inventa un `false`, porque "no lo se" y "no pasó" no son lo mismo y
 * castigar la ignorancia hunde a todos los leads nuevos.
 */

export type FilaPipeline = {
  id: string;
  telefono: string;
  ciudad: string | null;
  fuente: string | null;
  convertido: boolean;
  created_at: string;
  ultima_interaccion_at: string | null;
  conversacion_id: string | null;
  escalado_at: string | null;
  pedido_estado: string | null;
  n_actividades: number | null;
};

export function diasDesde(iso: string | null): number | undefined {
  if (!iso) return undefined;
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms)) return undefined;
  return Math.max(0, Math.floor(ms / 86_400_000));
}

export function senalesDeLead(
  fila: FilaPipeline,
  ciudadesConRecaudo: Set<string>,
): SenalesLead {
  const clave = (fila.ciudad ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return {
    // Un lead con fuente "checkout_abandonado" llego hasta el formulario: dio
    // nombre, telefono y producto y se freno. Es la senal mas fuerte que hay.
    llegoAlCheckout: fila.fuente === "checkout_abandonado" || undefined,

    // Tener conversacion abierta en WhatsApp implica que escribio.
    mensajesEnviados: fila.conversacion_id ? 4 : undefined,

    // Solo se afirma si la ciudad esta en la matriz. Si no la conocemos, se
    // deja sin definir en vez de asumir que no hay cobertura.
    ciudadConRecaudo: clave
      ? ciudadesConRecaudo.has(clave) || undefined
      : undefined,

    diasDesdeUltimaInteraccion: diasDesde(
      fila.ultima_interaccion_at ?? fila.created_at,
    ),

    // Una conversacion escalada es una duda que quedo sin resolver.
    objecionSinResolver: fila.escalado_at ? true : undefined,

    pidioCancelar: fila.pedido_estado === "cancelado" || undefined,
  };
}

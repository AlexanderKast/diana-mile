import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Registro y emparejamiento de los clics al boton de WhatsApp de la web.
 *
 * La logica vive aqui y no en cada app porque shop y linktree necesitan lo
 * mismo, y una regla de atribucion duplicada en dos sitios termina
 * divergiendo justo cuando se cambia una sola de las dos.
 */

/** Cuanto vale un clic antes de considerarlo abandonado. */
const VENTANA_MINUTOS = 30;

export type DatosClic = {
  mensaje: string;
  ruta?: string | null;
  titulo?: string | null;
  origen?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  referrer?: string | null;
  /** Slug de la variante del rotador de landings que origino el clic. */
  landingVariante?: string | null;
};

/**
 * Deja los textos comparables sin volverlos iguales entre paginas.
 *
 * Solo se normaliza lo que cambia sin querer —mayusculas, tildes, espacios
 * de mas, el punto final que a veces se borra al editar—. Las palabras se
 * respetan, que son las que distinguen una pagina de otra.
 */
export function normalizarMensaje(texto: string): string {
  return (texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[.,!¡?¿]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Recorta para no guardar campos gigantes que solo estorban en la tabla. */
function corto(valor: string | null | undefined, tope = 500): string | null {
  const limpio = (valor ?? "").toString().trim();
  return limpio ? limpio.slice(0, tope) : null;
}

export async function registrarClic(
  supabase: SupabaseClient,
  datos: DatosClic,
): Promise<{ ok: boolean; motivo?: string }> {
  const mensaje = corto(datos.mensaje, 1000);
  if (!mensaje) return { ok: false, motivo: "sin_mensaje" };

  const { error } = await supabase.from("whatsapp_clics").insert({
    mensaje,
    ruta: corto(datos.ruta, 300),
    titulo: corto(datos.titulo, 300),
    origen: corto(datos.origen, 20),
    fbp: corto(datos.fbp, 200),
    fbc: corto(datos.fbc, 300),
    utm_source: corto(datos.utmSource, 200),
    utm_medium: corto(datos.utmMedium, 200),
    utm_campaign: corto(datos.utmCampaign, 200),
    utm_content: corto(datos.utmContent, 200),
    utm_term: corto(datos.utmTerm, 200),
    referrer: corto(datos.referrer, 500),
    landing_variante: corto(datos.landingVariante, 100),
  });

  if (error) {
    console.warn("[wa-clic] no se pudo registrar:", error.message);
    return { ok: false, motivo: error.message };
  }
  return { ok: true };
}

/**
 * Traduce lo que manda el boton a una fila. Los utm llegan como la query
 * entera y se desarman aqui: asi el navegador no tiene que saber cuales
 * parametros nos importan, y anadir uno nuevo no obliga a tocar el front.
 */
export function clicDesdeCuerpo(cuerpo: unknown): DatosClic | null {
  if (!cuerpo || typeof cuerpo !== "object") return null;
  const c = cuerpo as Record<string, unknown>;
  const mensaje = typeof c.mensaje === "string" ? c.mensaje : "";
  if (!mensaje.trim()) return null;

  const query = new URLSearchParams(
    typeof c.busqueda === "string" ? c.busqueda : "",
  );
  const texto = (v: unknown) => (typeof v === "string" ? v : null);

  return {
    mensaje,
    ruta: texto(c.ruta),
    titulo: texto(c.titulo),
    origen: texto(c.origen),
    fbp: texto(c.fbp),
    fbc: texto(c.fbc),
    utmSource: query.get("utm_source"),
    utmMedium: query.get("utm_medium"),
    utmCampaign: query.get("utm_campaign"),
    utmContent: query.get("utm_content"),
    utmTerm: query.get("utm_term"),
    referrer: texto(c.referrer),
  };
}

export type Atribucion = {
  clicId: string;
  ruta: string | null;
  titulo: string | null;
  origen: string | null;
  fbp: string | null;
  fbc: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
};

/** Lo que hace que dos clics sean "el mismo origen" para desempatar. */
function huella(c: Record<string, unknown>): string {
  return [c.fbc, c.utm_source, c.utm_medium, c.utm_campaign, c.utm_content]
    .map((v) => v ?? "")
    .join("|");
}

/**
 * Busca de que clic viene el mensaje que acaba de entrar y lo reclama.
 *
 * Si hay varios candidatos se mira si coinciden en origen: dos personas
 * mirando el mismo producto en la misma media hora es normal, y mientras
 * vengan de la misma campana da igual cual sea. Si vienen de campanas
 * distintas se descarta y no se atribuye nada — inventar de cual de las
 * dos salio es peor que no saberlo, porque sobre ese dato se decide donde
 * poner la plata.
 */
export async function emparejarClic(
  supabase: SupabaseClient,
  entrada: { mensaje: string; conversacionId: string },
): Promise<Atribucion | null> {
  const clave = normalizarMensaje(entrada.mensaje);
  if (!clave) return null;

  const desde = new Date(
    Date.now() - VENTANA_MINUTOS * 60 * 1000,
  ).toISOString();

  const { data } = await supabase
    .from("whatsapp_clics")
    .select("*")
    .is("conversacion_id", null)
    .gte("created_at", desde)
    .order("created_at", { ascending: false })
    .limit(25);

  const candidatos = (data ?? []).filter(
    (c) => normalizarMensaje(String(c.mensaje ?? "")) === clave,
  );
  if (!candidatos.length) return null;

  const huellas = new Set(candidatos.map(huella));
  if (huellas.size > 1) {
    console.warn(
      `[wa-clic] ${candidatos.length} clics del mismo texto con origenes distintos: no se atribuye`,
    );
    return null;
  }

  const elegido = candidatos[0];

  // Se reclama con la condicion puesta en el UPDATE: si dos webhooks
  // entran a la vez, solo uno se lo lleva y el otro se queda sin fila.
  const { data: reclamado } = await supabase
    .from("whatsapp_clics")
    .update({
      conversacion_id: entrada.conversacionId,
      emparejado_at: new Date().toISOString(),
    })
    .eq("id", elegido.id)
    .is("conversacion_id", null)
    .select("id")
    .maybeSingle();

  if (!reclamado) return null;

  return {
    clicId: elegido.id,
    ruta: elegido.ruta ?? null,
    titulo: elegido.titulo ?? null,
    origen: elegido.origen ?? null,
    fbp: elegido.fbp ?? null,
    fbc: elegido.fbc ?? null,
    utmSource: elegido.utm_source ?? null,
    utmMedium: elegido.utm_medium ?? null,
    utmCampaign: elegido.utm_campaign ?? null,
    utmContent: elegido.utm_content ?? null,
    utmTerm: elegido.utm_term ?? null,
  };
}

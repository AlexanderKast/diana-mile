import type { SupabaseClient } from "@supabase/supabase-js";
import {
  calcularScore,
  faseDelAgente,
  probabilidadDeCierre,
  type EtapaLead,
  type FaseAgente,
  type SenalesLead,
} from "./scoring";

/**
 * El puente entre la conversacion de WhatsApp y el pipeline.
 *
 * POR QUE ESTO EXISTE
 * El tablero no sirve de nada si alguien tiene que llenarlo a mano: para
 * cuando lo haga, la conversacion ya termino. La calificacion tiene que pasar
 * mientras la persona escribe — cada mensaje mueve el score, el score decide
 * la fase, y la fase decide como le habla el agente.
 *
 * Antes de esto, `leads` solo se creaba desde el checkout web. Quien escribia
 * por WhatsApp existia en `whatsapp_conversaciones` y en ningun embudo: no
 * habia forma de saber a quien perseguir ni por que se perdio.
 *
 * NUNCA LANZA
 * Si el CRM falla, la clienta igual recibe su respuesta. Un error de scoring
 * no puede dejar a alguien esperando en WhatsApp.
 */

export type EstadoLeadChat = {
  leadId: string | null;
  score: number;
  fase: FaseAgente;
  etapa: EtapaLead;
};

/** Lo que el agente puede observar de un mensaje, sin adivinar. */
export type ObservacionChat = {
  texto: string;
  /** Cuantos mensajes lleva escritos la persona en esta conversacion. */
  mensajesDeLaPersona?: number;
  /** Ciudad detectada, para cruzarla con la matriz de cobertura. */
  ciudad?: string | null;
  /** Si la ciudad admite recaudo contraentrega (ya resuelto por el llamador). */
  ciudadConRecaudo?: boolean;
  /** Si el producto del que se habla es contraentrega. */
  productoContraentrega?: boolean;
  /** La conversacion esta escalada a un humano. */
  escalada?: boolean;
  /** Pidio cancelar en este mensaje o en los anteriores. */
  pidioCancelar?: boolean;
  /** Ya tiene un pedido creado. */
  cerroPedido?: boolean;
};

// Se detecta por lo que la persona escribe, no por lo que el modelo deduce:
// una regex es auditable y no cambia de opinion entre llamadas.
const RE_PIDE_PRECIO = /\b(precio|cuanto (vale|cuesta|sale)|valor|cu[aá]nto)\b/i;
const RE_PIDE_INFO = /\b(foto|imagen|info|informaci[oó]n|c[oó]mo (es|funciona)|para qu[eé] sirve)\b/i;
const RE_ENVIO_CIUDAD = /\b(env[ií]|llega|mandan|hacen entrega|domicilio|contraentrega|contra entrega)\b/i;
const RE_LO_QUIERE = /\b(lo quiero|la quiero|me lo llevo|me la llevo|d[aá]melo|mandamelo|m[aá]ndamelo|lo compro|hagale|h[aá]gale|de una|lo pido)\b/i;

/**
 * Calcula las senales observables de este mensaje.
 *
 * Se acumulan con las que ya tenia el lead: preguntar el precio una vez basta
 * para que cuente siempre, aunque despues hable de otra cosa.
 */
export function senalesDelMensaje(obs: ObservacionChat): SenalesLead {
  const t = obs.texto ?? "";
  return {
    pidioPrecio: RE_PIDE_PRECIO.test(t) || undefined,
    pidioFotoOInfo: RE_PIDE_INFO.test(t) || undefined,
    preguntoEnvioASuCiudad: RE_ENVIO_CIUDAD.test(t) || undefined,
    dijoQueLoQuiere: RE_LO_QUIERE.test(t) || undefined,
    mensajesEnviados: obs.mensajesDeLaPersona,
    ciudadConRecaudo: obs.ciudadConRecaudo,
    productoContraentrega: obs.productoContraentrega,
    diasDesdeUltimaInteraccion: 0, // esta escribiendo ahora mismo
    objecionSinResolver: obs.escalada || undefined,
    pidioCancelar: obs.pidioCancelar || undefined,
  };
}

/** Las senales viejas mandan cuando eran positivas: una vez visto, ya cuenta. */
function fundirSenales(previas: SenalesLead, nuevas: SenalesLead): SenalesLead {
  const salida: SenalesLead = { ...previas };
  for (const [k, v] of Object.entries(nuevas)) {
    if (v === undefined) continue;
    const clave = k as keyof SenalesLead;
    if (typeof v === "boolean") {
      // Un true nunca se revierte a false: que ahora no pregunte el precio no
      // borra que lo pregunto hace dos mensajes.
      if (v) (salida as Record<string, unknown>)[clave] = true;
    } else {
      (salida as Record<string, unknown>)[clave] = v;
    }
  }
  return salida;
}

/**
 * La etapa se deriva del score y de los hechos duros, no al reves.
 *
 * `cerrado` y `perdido` los manda el hecho (hay pedido / cancelo), porque son
 * los dos unicos estados que no son una opinion.
 */
function etapaDesde(
  score: number,
  obs: ObservacionChat,
  etapaActual: EtapaLead,
): EtapaLead {
  if (obs.cerroPedido) return "cerrado";
  // Una vez cerrado o perdido no se vuelve atras por un mensaje suelto.
  if (etapaActual === "cerrado" || etapaActual === "perdido") return etapaActual;
  if (score >= 70) return "negociacion";
  if (score >= 40) return "calificado";
  return "nuevo";
}

type FilaLead = {
  id: string;
  etapa: EtapaLead;
  senales: SenalesLead;
};

async function buscarOCrearLead(
  supabase: SupabaseClient,
  telefonoE164: string,
  nombre: string | null,
  ciudad: string | null,
): Promise<FilaLead | null> {
  const { data: existente } = await supabase
    .from("leads")
    .select("id, etapa, payload_senales:producto_interes")
    .eq("telefono", telefonoE164)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existente) {
    return {
      id: existente.id as string,
      etapa: (existente.etapa as EtapaLead) ?? "nuevo",
      senales: {},
    };
  }

  const { data: creado, error } = await supabase
    .from("leads")
    .insert({
      nombre: nombre || "Contacto de WhatsApp",
      telefono: telefonoE164,
      ciudad,
      fuente: "whatsapp",
      etapa: "nuevo",
    })
    .select("id, etapa")
    .single();

  if (error || !creado) return null;
  return { id: creado.id as string, etapa: "nuevo", senales: {} };
}

/**
 * Sincroniza el lead con lo que acaba de pasar en el chat y devuelve la fase
 * con la que el agente debe hablarle.
 *
 * Se llama en CADA mensaje entrante, antes de construir el prompt.
 */
export async function sincronizarLeadDesdeChat(
  supabase: SupabaseClient,
  telefonoE164: string,
  nombre: string | null,
  obs: ObservacionChat,
): Promise<EstadoLeadChat> {
  const senalesNuevas = senalesDelMensaje(obs);
  // Si el CRM no responde, el agente sigue: cae a la fase de descubrimiento,
  // que es la mas conservadora (califica en vez de cerrar a ciegas).
  const porDefecto: EstadoLeadChat = {
    leadId: null,
    score: calcularScore(senalesNuevas).score,
    fase: faseDelAgente(calcularScore(senalesNuevas).score),
    etapa: "nuevo",
  };

  try {
    const lead = await buscarOCrearLead(
      supabase,
      telefonoE164,
      nombre,
      obs.ciudad ?? null,
    );
    if (!lead) return porDefecto;

    // Las senales acumuladas viven en el propio lead: se releen del historial
    // de actividades para no depender de una columna JSON mas.
    const { data: previas } = await supabase
      .from("lead_actividades")
      .select("payload")
      .eq("lead_id", lead.id)
      .eq("tipo", "mensaje_entrante")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const senalesPrevias = (previas?.payload as SenalesLead | undefined) ?? {};
    const senales = fundirSenales(senalesPrevias, senalesNuevas);

    const { score, temperatura } = calcularScore(senales);
    const etapa = etapaDesde(score, obs, lead.etapa);
    const fase = faseDelAgente(score);

    await supabase
      .from("leads")
      .update({
        score,
        temperatura,
        etapa,
        probabilidad_cierre: probabilidadDeCierre(etapa, temperatura),
        ultima_interaccion_at: new Date().toISOString(),
        ...(obs.ciudad ? { ciudad: obs.ciudad } : {}),
      })
      .eq("id", lead.id);

    await supabase.from("lead_actividades").insert({
      lead_id: lead.id,
      tipo: "mensaje_entrante",
      detalle: obs.texto.slice(0, 500),
      payload: senales,
      creado_por: "agente",
    });

    if (etapa !== lead.etapa) {
      await supabase.from("lead_actividades").insert({
        lead_id: lead.id,
        tipo: "cambio_etapa",
        detalle: `${lead.etapa} → ${etapa} (score ${score})`,
        creado_por: "agente",
      });
    }

    return { leadId: lead.id, score, fase, etapa };
  } catch {
    return porDefecto;
  }
}

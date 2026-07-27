import type { SupabaseClient } from "@supabase/supabase-js";
import { encolarMensaje } from "./outbox";
import { PLANTILLAS } from "./plantillas";

/**
 * Acompanamiento del cliente despues de la compra.
 *
 * La idea: quien ya compro no se abandona hasta el mes siguiente. Recibe
 * consejos utiles sobre lo que se llevo, la invitacion a la comunidad
 * cuando el pedido ya le llego, y recien despues la recompra. Cada toque
 * tiene que aportar algo — si solo son recordatorios de venta, la gente
 * bloquea el numero y se pierde el canal entero.
 *
 * Los tiempos se cuentan desde la ENTREGA, no desde el pedido: mandar
 * consejos de uso a alguien que todavia no tiene el producto en la mano
 * no sirve de nada.
 */

export type EtapaSeguimiento =
  | "cuidado"
  | "valor"
  | "resultados"
  | "comunidad"
  | "recompra";

type DefinicionEtapa = {
  etapa: EtapaSeguimiento;
  /** Dias despues de la entrega. */
  dias: number;
  descripcion: string;
};

/**
 * El calendario. El orden importa: primero se gana el derecho a pedir
 * (consejos, resultados), y solo al final se vende.
 */
export const CALENDARIO: DefinicionEtapa[] = [
  { etapa: "cuidado", dias: 1, descripcion: "como sacarle el mayor provecho" },
  { etapa: "comunidad", dias: 3, descripcion: "invitacion a la comunidad" },
  { etapa: "valor", dias: 10, descripcion: "consejo util relacionado" },
  { etapa: "resultados", dias: 21, descripcion: "que deberia estar notando" },
  { etapa: "recompra", dias: 30, descripcion: "se le esta acabando" },
];

/**
 * Consejos por tipo de producto. Se elige por palabras del titulo, que es
 * lo unico que se sabe con certeza del catalogo.
 *
 * Nada de promesas medicas ni de resultados garantizados: son consejos de
 * uso, que es lo que de verdad ayuda y lo que Meta permite.
 */
const CONSEJOS: { patron: RegExp; consejos: Record<string, string> }[] = [
  {
    patron: /exfolia|polishing|scrub|mud|lodo/i,
    consejos: {
      cuidado:
        "usalo con la piel humeda y con movimientos suaves en circulos, sin frotar duro. Dos o tres veces por semana es suficiente: mas no exfolia mejor, solo irrita.",
      valor:
        "despues de exfoliar es cuando la piel mejor absorbe lo que le pongas, asi que ese es el momento de la crema hidratante.",
      resultados:
        "a estas alturas deberias sentir la piel mas suave al tacto y verla mas pareja. Lo de la textura es lo primero que cambia.",
    },
  },
  {
    patron: /base|maquillaje|ocheal|coreana/i,
    consejos: {
      cuidado:
        "aplicala sobre la piel hidratada y en poca cantidad, difuminando desde el centro de la cara hacia afuera. Es mas facil agregar que quitar.",
      valor:
        "si te dura poco, el truco esta en la piel de abajo: hidratacion antes y un toque de polvo solo donde brillas.",
      resultados:
        "¿como te ha ido con el tono? Si quedo muy claro u oscuro me dices y miramos cual te sirve mejor.",
    },
  },
  {
    patron: /afeitar|maquina|rasuradora/i,
    consejos: {
      cuidado:
        "cargala completa la primera vez y limpia el cabezal despues de cada uso: es lo que hace que dure anos en vez de meses.",
      valor:
        "para que no irrite, pasala siempre a favor del vello la primera pasada. En contra solo si necesitas apurar mas.",
      resultados: "¿como te ha ido con ella? ¿La bateria te esta rindiendo?",
    },
  },
];

const CONSEJOS_GENERICOS: Record<string, string> = {
  cuidado:
    "si te queda alguna duda de como usarlo, escribeme y te cuento. Prefiero eso a que no le saques todo el provecho.",
  valor:
    "la constancia es lo que hace la diferencia con cualquier producto: usarlo poquito pero seguido rinde mas que mucho de vez en cuando.",
  resultados:
    "¿como te ha ido? Me cuentas y si algo no te esta funcionando lo miramos.",
};

/** Consejo concreto para ese producto y esa etapa. */
export function consejoPara(producto: string, etapa: string): string {
  const entrada = CONSEJOS.find((c) => c.patron.test(producto));
  return (
    entrada?.consejos[etapa] ?? CONSEJOS_GENERICOS[etapa] ?? CONSEJOS_GENERICOS.valor
  );
}

/**
 * Programa todo el acompanamiento de un pedido entregado. Idempotente: el
 * indice unico por (pedido, etapa) impide duplicar si se llama dos veces.
 */
export async function programarSeguimiento(
  supabase: SupabaseClient,
  datos: {
    pedidoId: string;
    telefonoE164: string;
    producto: string;
    entregadoAt?: Date;
  },
): Promise<{ programadas: number }> {
  const base = datos.entregadoAt ?? new Date();

  const filas = CALENDARIO.map((def) => ({
    pedido_id: datos.pedidoId,
    telefono: datos.telefonoE164,
    etapa: def.etapa,
    programado_para: new Date(
      base.getTime() + def.dias * 86_400_000,
    ).toISOString(),
    contexto: { producto: datos.producto },
  }));

  const { data, error } = await supabase
    .from("whatsapp_seguimientos")
    .upsert(filas, { onConflict: "pedido_id,etapa", ignoreDuplicates: true })
    .select("id");

  if (error) {
    console.error("[seguimiento] no se pudo programar:", error.message);
    return { programadas: 0 };
  }
  return { programadas: data?.length ?? 0 };
}

/** Cancela lo pendiente: el pedido se anulo o pidieron parar promociones. */
export async function cancelarSeguimiento(
  supabase: SupabaseClient,
  filtro: { pedidoId?: string; telefonoE164?: string },
): Promise<void> {
  let query = supabase
    .from("whatsapp_seguimientos")
    .update({ estado: "cancelado" })
    .eq("estado", "pendiente");

  if (filtro.pedidoId) query = query.eq("pedido_id", filtro.pedidoId);
  if (filtro.telefonoE164) query = query.eq("telefono", filtro.telefonoE164);

  await query;
}

type FilaSeguimiento = {
  id: string;
  pedido_id: string | null;
  telefono: string;
  etapa: EtapaSeguimiento;
  contexto: { producto?: string };
};

/**
 * Envia los seguimientos que ya tocan. Pensado para el cron.
 *
 * Respeta dos cosas: quien pidio parar promociones no recibe nada de
 * MARKETING, y un pedido cancelado no sigue recibiendo consejos de uso.
 */
export async function enviarSeguimientosPendientes(
  supabase: SupabaseClient,
  limite = 30,
): Promise<{ evaluados: number; enviados: number }> {
  const { data: filas } = await supabase
    .from("whatsapp_seguimientos")
    .select("id, pedido_id, telefono, etapa, contexto")
    .eq("estado", "pendiente")
    .lte("programado_para", new Date().toISOString())
    .order("programado_para", { ascending: true })
    .limit(limite);

  if (!filas?.length) return { evaluados: 0, enviados: 0 };

  let enviados = 0;

  for (const fila of filas as FilaSeguimiento[]) {
    // ¿Sigue queriendo saber de nosotros?
    const { data: conversacion } = await supabase
      .from("whatsapp_conversaciones")
      .select("promociones_activas, nombre")
      .eq("telefono", fila.telefono)
      .maybeSingle();

    if (conversacion?.promociones_activas === false) {
      await supabase
        .from("whatsapp_seguimientos")
        .update({ estado: "cancelado" })
        .eq("id", fila.id);
      continue;
    }

    // ¿El pedido sigue vivo?
    let nombre = conversacion?.nombre ?? null;
    if (fila.pedido_id) {
      const { data: pedido } = await supabase
        .from("pedidos")
        .select("estado, nombre")
        .eq("id", fila.pedido_id)
        .maybeSingle();

      if (!pedido || pedido.estado === "cancelado") {
        await supabase
          .from("whatsapp_seguimientos")
          .update({ estado: "cancelado" })
          .eq("id", fila.id);
        continue;
      }
      nombre = nombre ?? pedido.nombre;
    }

    const primerNombre = (nombre ?? "Hola").split(/\s+/)[0];
    const producto = fila.contexto?.producto ?? "tu pedido";

    if (fila.etapa === "comunidad") {
      const { data: cfg } = await supabase
        .from("config")
        .select("valor")
        .eq("clave", "comunidad_whatsapp_link")
        .maybeSingle();

      // Sin link no hay invitacion que mandar.
      if (!cfg?.valor) {
        await supabase
          .from("whatsapp_seguimientos")
          .update({ estado: "cancelado" })
          .eq("id", fila.id);
        continue;
      }

      await encolarMensaje(supabase, {
        telefonoE164: fila.telefono,
        tipo: "remarketing",
        plantilla: PLANTILLAS.comunidad,
        pedidoId: fila.pedido_id,
        variables: { "1": primerNombre, "2": String(cfg.valor) },
      });
    } else if (fila.etapa === "recompra") {
      await encolarMensaje(supabase, {
        telefonoE164: fila.telefono,
        tipo: "remarketing",
        plantilla: PLANTILLAS.recompra,
        pedidoId: fila.pedido_id,
        variables: { "1": primerNombre, "2": producto },
      });
    } else {
      await encolarMensaje(supabase, {
        telefonoE164: fila.telefono,
        tipo: "remarketing",
        plantilla: PLANTILLAS.seguimientoValor,
        pedidoId: fila.pedido_id,
        variables: {
          "1": primerNombre,
          "2": producto,
          "3": consejoPara(producto, fila.etapa),
        },
      });
    }

    await supabase
      .from("whatsapp_seguimientos")
      .update({ estado: "enviado", enviado_at: new Date().toISOString() })
      .eq("id", fila.id);
    enviados++;
  }

  return { evaluados: filas.length, enviados };
}

/** Carritos abandonados: leads con telefono que no compraron. */
export async function recuperarCarritosAbandonados(
  supabase: SupabaseClient,
  limite = 20,
): Promise<{ evaluados: number; encolados: number }> {
  const ahora = Date.now();
  // Se espera 3h para no perseguir a quien todavia esta comprando, y no se
  // insiste con carritos de mas de 3 dias: ahi ya perdio el interes.
  const desde = new Date(ahora - 3 * 3600_000).toISOString();
  const hasta = new Date(ahora - 3 * 86_400_000).toISOString();

  const { data: leads } = await supabase
    .from("leads")
    .select("id, nombre, telefono, producto_interes")
    .eq("fuente", "checkout_abandonado")
    .eq("convertido", false)
    .lt("created_at", desde)
    .gt("created_at", hasta)
    .limit(limite);

  if (!leads?.length) return { evaluados: 0, encolados: 0 };

  let encolados = 0;

  for (const lead of leads) {
    if (!lead.telefono) continue;

    // Uno solo por persona: si ya se le escribio, no se insiste.
    const { count } = await supabase
      .from("whatsapp_mensajes")
      .select("id", { count: "exact", head: true })
      .eq("lead_id", lead.id)
      .eq("tipo", "remarketing");

    if ((count ?? 0) > 0) continue;

    const { data: conversacion } = await supabase
      .from("whatsapp_conversaciones")
      .select("promociones_activas")
      .eq("telefono", lead.telefono)
      .maybeSingle();

    if (conversacion?.promociones_activas === false) continue;

    await encolarMensaje(supabase, {
      telefonoE164: lead.telefono,
      tipo: "remarketing",
      plantilla: PLANTILLAS.carritoAbandonado,
      leadId: lead.id,
      variables: {
        "1": (lead.nombre ?? "Hola").split(/\s+/)[0],
        "2": lead.producto_interes ?? "lo que estabas mirando",
      },
    });
    encolados++;
  }

  return { evaluados: leads.length, encolados };
}

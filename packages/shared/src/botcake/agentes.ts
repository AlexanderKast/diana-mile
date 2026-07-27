import type { SupabaseClient } from "@supabase/supabase-js";
import { encolarMensaje } from "./outbox";
import { MARCA_WHATSAPP, PLANTILLAS } from "./plantillas";

function formatoPesos(valor: number): string {
  return Math.round(valor).toLocaleString("es-CO");
}

/**
 * Agente Confirmacion: al completarse un pedido en el checkout se envia la
 * plantilla de confirmacion con los datos para que el cliente confirme con
 * un boton (reemplaza la llamada del call center).
 */
export async function encolarConfirmacionPedido(
  supabase: SupabaseClient,
  datos: {
    pedidoId?: string | null;
    nombre: string;
    telefonoE164: string;
    telefonoDisplay: string;
    direccion: string;
    producto: string;
    precioTotal: number;
  },
): Promise<void> {
  await encolarMensaje(supabase, {
    telefonoE164: datos.telefonoE164,
    tipo: "confirmacion",
    plantilla: PLANTILLAS.confirmacionPedido,
    pedidoId: datos.pedidoId,
    variables: {
      "1": datos.nombre,
      "2": MARCA_WHATSAPP,
      "3": datos.telefonoDisplay,
      "4": datos.direccion,
      "5": datos.producto,
      "6": formatoPesos(datos.precioTotal),
    },
  });
}

/** Agente Recordatorio: pedido sin confirmar despues de 24h. */
export async function encolarRecordatorioConfirmacion(
  supabase: SupabaseClient,
  datos: {
    pedidoId: string;
    nombre: string;
    telefonoE164: string;
    producto: string;
  },
): Promise<void> {
  await encolarMensaje(supabase, {
    telefonoE164: datos.telefonoE164,
    tipo: "recordatorio",
    plantilla: PLANTILLAS.recordatorioConfirmacion,
    pedidoId: datos.pedidoId,
    variables: {
      "1": datos.nombre,
      "2": datos.producto,
    },
  });
}

/**
 * Agente Cancelacion: el pedido se cancelo, venga de donde venga (Shopify,
 * el panel, o el boton del cliente en WhatsApp). Va por plantilla porque
 * una cancelacion suele pasar dias despues, con la ventana de 24h cerrada.
 */
export async function encolarPedidoCancelado(
  supabase: SupabaseClient,
  datos: {
    pedidoId: string;
    nombre: string;
    telefonoE164: string;
    numeroPedido: string;
    producto: string;
  },
): Promise<void> {
  await encolarMensaje(supabase, {
    telefonoE164: datos.telefonoE164,
    tipo: "cancelacion",
    plantilla: PLANTILLAS.pedidoCancelado,
    pedidoId: datos.pedidoId,
    variables: {
      "1": datos.nombre,
      "2": datos.numeroPedido,
      "3": datos.producto,
    },
  });
}

/** Como se llaman las transportadoras de cara a la clienta. */
const NOMBRE_TRANSPORTADORA: Record<string, string> = {
  interrapidisimo: "Interrapidísimo",
  servientrega: "Servientrega",
  tcc: "TCC",
  coordinadora: "Coordinadora",
  deprisa: "Deprisa",
  envia: "Envía",
};

function transportadoraLegible(valor: string | null | undefined): string {
  const clave = (valor ?? "").trim().toLowerCase();
  if (!clave || clave === "otro") return "la transportadora";
  return NOMBRE_TRANSPORTADORA[clave] ?? valor!.trim();
}

/**
 * Cual de las dos plantillas de despacho se usa.
 *
 * La v2 lleva transportadora y tiempo de entrega, pero mientras Meta no la
 * apruebe mandarla falla y la clienta se queda sin aviso. Por eso la
 * version vive en `config` y se cambia sin desplegar: se pone en "v2" el
 * dia que quede aprobada, y si algo sale mal se vuelve atras igual de
 * rapido.
 */
async function versionPlantillaEnvio(
  supabase: SupabaseClient,
): Promise<"v1" | "v2"> {
  const { data } = await supabase
    .from("config")
    .select("valor")
    .eq("clave", "plantilla_envio_version")
    .maybeSingle();
  return data?.valor === "v2" ? "v2" : "v1";
}

/** Agente Envio: pedido despachado con numero de guia. */
export async function encolarPedidoEnviado(
  supabase: SupabaseClient,
  datos: {
    pedidoId: string;
    nombre: string;
    telefonoE164: string;
    producto: string;
    numeroGuia: string;
    precioTotal: number;
    transportadora?: string | null;
    /** Ej: "1 a 2 dias habiles". Ya calculado con la matriz de cobertura. */
    tiempoEntrega?: string | null;
  },
): Promise<void> {
  const version = await versionPlantillaEnvio(supabase);

  if (version === "v2") {
    await encolarMensaje(supabase, {
      telefonoE164: datos.telefonoE164,
      tipo: "envio",
      plantilla: PLANTILLAS.pedidoEnviadoV2,
      pedidoId: datos.pedidoId,
      variables: {
        "1": datos.nombre,
        "2": datos.producto,
        "3": transportadoraLegible(datos.transportadora),
        "4": datos.numeroGuia,
        "5": datos.tiempoEntrega?.trim() || "3 a 5 dias habiles",
        "6": formatoPesos(datos.precioTotal),
      },
    });
    return;
  }

  await encolarMensaje(supabase, {
    telefonoE164: datos.telefonoE164,
    tipo: "envio",
    plantilla: PLANTILLAS.pedidoEnviado,
    pedidoId: datos.pedidoId,
    variables: {
      "1": datos.nombre,
      "2": datos.producto,
      "3": datos.numeroGuia,
      "4": formatoPesos(datos.precioTotal),
    },
  });
}

/**
 * Le avisa a Diana que entro un pedido.
 *
 * En contraentrega los primeros minutos deciden la venta: cuanto antes se
 * llame a confirmar, menos se cae. El panel ya avisa a quien lo tiene
 * abierto, pero nadie lo tiene abierto todo el dia — el WhatsApp si lo
 * lleva encima.
 *
 * Va por plantilla y no por texto libre porque ella no le escribe al WABA
 * de la tienda, asi que su ventana de 24h esta cerrada casi siempre.
 */
export async function encolarAvisoPedidoNuevo(
  supabase: SupabaseClient,
  datos: {
    pedidoId?: string;
    numeroOrden: string;
    cliente: string;
    telefonoCliente: string;
    ciudad: string;
    producto: string;
    precioTotal: number;
  },
): Promise<void> {
  const numeroAdmin = process.env.WHATSAPP_ADMIN_NUMERO;
  const plantilla = PLANTILLAS.pedidoNuevo;

  // Sin numero configurado o sin plantilla aprobada todavia, el aviso del
  // panel queda como unico canal. No es motivo para romper la venta.
  if (!numeroAdmin || !plantilla.id) return;

  await encolarMensaje(supabase, {
    telefonoE164: numeroAdmin,
    tipo: "escalamiento",
    plantilla,
    pedidoId: datos.pedidoId,
    variables: {
      "1": datos.numeroOrden,
      "2": datos.cliente.slice(0, 60),
      "3": datos.telefonoCliente,
      "4": datos.ciudad.slice(0, 40),
      "5": datos.producto.replace(/\s+/g, " ").slice(0, 90),
      "6": formatoPesos(datos.precioTotal),
    },
  });
}

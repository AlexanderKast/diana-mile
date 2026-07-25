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
  },
): Promise<void> {
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

import type { PlantillaCategoria } from "./client";

/**
 * Plantillas de WhatsApp del WABA de Milito Life (page waba_168254866381327).
 * Los ids son los template_id de Meta; si una plantilla se recrea en
 * Botcake/WhatsApp Manager hay que actualizar el id aqui.
 */
export type PlantillaDef = {
  nombre: string;
  id: string;
  categoria: PlantillaCategoria;
};

export const PLANTILLAS = {
  /**
   * APPROVED. Confirmacion al recibir un pedido. La marca es variable ({{2}}).
   * Botones: CONFIRMAR PEDIDO / MODIFICAR DATOS / HABLAR CON UN ASESOR.
   * Vars: 1 nombre, 2 marca, 3 telefono, 4 direccion, 5 pedido, 6 valor.
   */
  confirmacionPedido: {
    nombre: "confirmacion_de_pedido_nuevo",
    id: "1699728170823031",
    categoria: "UTILITY",
  },
  /**
   * Recordatorio si el cliente no confirma. Botones: CONFIRMAR PEDIDO /
   * MODIFICAR DATOS / ANULAR PEDIDO. Vars: 1 nombre, 2 pedido.
   */
  recordatorioConfirmacion: {
    nombre: "recordatorio_confirmacion_milito",
    id: "1893260548299523",
    categoria: "UTILITY",
  },
  /**
   * Aviso de despacho con numero de guia. Vars: 1 nombre, 2 pedido,
   * 3 guia, 4 valor.
   */
  pedidoEnviado: {
    nombre: "pedido_enviado_milito",
    id: "1594063132343063",
    categoria: "UTILITY",
  },
  /**
   * Aviso interno a Diana cuando el agente no puede resolver algo. Va por
   * plantilla y no por texto libre porque ella no le escribe al WABA de la
   * tienda: su ventana de 24h esta cerrada casi siempre.
   * Vars: 1 nombre de la clienta, 2 telefono, 3 lo que pregunto.
   * PENDIENTE: crear en Botcake y pegar aqui el id que devuelva Meta.
   */
  avisoAsesor: {
    nombre: "aviso_asesor_requerido",
    id: process.env.BOTCAKE_TEMPLATE_AVISO_ASESOR ?? "",
    categoria: "UTILITY",
  },
} satisfies Record<string, PlantillaDef>;

export const MARCA_WHATSAPP = "Milito Life";

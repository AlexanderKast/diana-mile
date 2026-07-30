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
   * Aviso de despacho. Vars: 1 nombre, 2 producto, 3 guia, 4 valor,
   * 5 transportadora, 6 tiempo de entrega.
   *
   * El orden no es el logico: transportadora y tiempo se anadieron al
   * final para no mover las cuatro que ya tenia y tener que pasar otra vez
   * por revision de Meta.
   */
  pedidoEnviado: {
    nombre: "pedido_enviado_milito",
    id: "1594063132343063",
    categoria: "UTILITY",
  },
  /**
   * Codigo de acceso a la cuenta de la tienda. Categoria AUTHENTICATION:
   * Meta le pone caducidad y boton de copiar, y no deja usarla para otra
   * cosa. La manda Supabase Auth a traves de /api/auth/otp-whatsapp.
   * Vars: 1 el codigo.
   */
  codigoAcceso: {
    nombre: "codigo_acceso_milito",
    id: "1360310535446398",
    categoria: "AUTHENTICATION",
  },
  /**
   * Aviso interno a Diana cuando entra un pedido, venga de donde venga.
   * Va por plantilla porque su ventana de 24h con el WABA de la tienda
   * esta cerrada casi siempre.
   * Vars: 1 numero de orden, 2 cliente, 3 telefono, 4 ciudad, 5 producto,
   * 6 valor.
   * Boton URL: abre el panel.
   */
  pedidoNuevo: {
    nombre: "pedido_nuevo_milito",
    id: "1374842761277813",
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
  /**
   * Aviso de cancelacion. Va por plantilla porque una cancelacion suele
   * ocurrir dias despues del pedido, cuando la ventana de 24h ya cerro y
   * un texto libre no llegaria.
   * Vars: 1 nombre, 2 numero de pedido, 3 producto.
   * PENDIENTE: crear en Botcake y pegar aqui el id que devuelva Meta.
   */
  pedidoCancelado: {
    nombre: "pedido_cancelado_milito",
    id: process.env.BOTCAKE_TEMPLATE_CANCELADO ?? "",
    categoria: "UTILITY",
  },
  /**
   * Recuperacion de carrito abandonado. Vars: 1 nombre, 2 producto.
   * MARKETING: solo a quien no pidio parar promociones.
   */
  carritoAbandonado: {
    nombre: "carrito_abandonado_milito",
    id: process.env.BOTCAKE_TEMPLATE_CARRITO ?? "",
    categoria: "MARKETING",
  },
  /** Recompra al mes de la entrega. Vars: 1 nombre, 2 producto. */
  recompra: {
    nombre: "recompra_milito",
    id: process.env.BOTCAKE_TEMPLATE_RECOMPRA ?? "",
    categoria: "MARKETING",
  },
  /**
   * Invitacion a la comunidad, despues de que el pedido llego.
   * Vars: 1 nombre, 2 link de la comunidad.
   */
  comunidad: {
    nombre: "invitacion_comunidad_milito",
    id: process.env.BOTCAKE_TEMPLATE_COMUNIDAD ?? "",
    categoria: "MARKETING",
  },
  /**
   * Contenido de valor segun lo que compro (uso, cuidados, resultados).
   * Vars: 1 nombre, 2 producto, 3 el consejo.
   */
  seguimientoValor: {
    nombre: "seguimiento_valor_milito",
    id: process.env.BOTCAKE_TEMPLATE_SEGUIMIENTO ?? "",
    categoria: "MARKETING",
  },
  /**
   * Le pregunta a la clienta como le fue y le pide permiso para publicar
   * su opinion. Vars: 1 nombre, 2 producto.
   *
   * El permiso tiene que estar en el CUERPO de la plantilla, no en una
   * variable: es lo unico que convierte la respuesta en algo publicable.
   * El texto aprobado dice, en resumen: "¿como te fue con {{2}}? Si nos
   * das permiso, nos encantaria publicar tu comentario en nuestra pagina."
   *
   * MARKETING y no UTILITY: se le esta pidiendo un favor a la clienta,
   * no informandole de su pedido. Quien pidio parar promociones no la
   * recibe.
   *
   * PENDIENTE: crear en Botcake y pegar aqui el id que devuelva Meta.
   */
  solicitudTestimonio: {
    nombre: "solicitud_testimonio_milito",
    id: process.env.BOTCAKE_TEMPLATE_TESTIMONIO ?? "",
    categoria: "MARKETING",
  },
  /**
   * Mensaje diario de la comunidad. Vars: 1 el mensaje, 2 nombre.
   * El texto va como variable para no tener que aprobar una plantilla
   * nueva cada dia.
   */
  mensajeDiario: {
    nombre: "mensaje_diario_milito",
    id: process.env.BOTCAKE_TEMPLATE_DIARIO ?? "",
    categoria: "MARKETING",
  },
} satisfies Record<string, PlantillaDef>;

export const MARCA_WHATSAPP = "Milito Life";

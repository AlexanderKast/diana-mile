/**
 * Costeo por producto — "Laboratorio de productos".
 *
 * Traduce a codigo el modelo de la hoja de BUHA. Las formulas se
 * verificaron contra las 24 filas de esa hoja: utilidad bruta, margen,
 * publicidad, admin, utilidad neta y precio sugerido cuadran al peso en
 * las 7 filas que traian todas las columnas llenas.
 *
 * Todo aqui es aritmetica pura, sin base de datos ni red, para que el
 * panel, los scripts y el agente calculen exactamente lo mismo.
 *
 * UNIDADES: todo en pesos colombianos. Los porcentajes van como fraccion
 * (0.20, no 20). La hoja original mezclaba dolares y pesos en cuatro de
 * sus diez pestañas y por eso mostraba metas de "3.264.892 ventas al
 * mes"; aqui hay una sola moneda para que eso no pueda repetirse.
 */

export type ParametrosCosteo = {
  /** Margen bruto que se busca. Fija el precio sugerido. */
  margenObjetivo: number;
  /** Publicidad como fraccion del precio de venta. */
  pctPublicidad: number;
  /** Carga administrativa como fraccion del precio de venta. */
  pctAdmin: number;
};

export type EntradaCosteo = {
  precioVenta: number;
  /** Lo que cuesta la mercancia. `null` = todavia sin costear. */
  costoUnitario: number | null;
  costoPlataforma: number;
  costoLogistico: number;
  /** Margen objetivo propio de este producto, si tiene uno distinto. */
  margenObjetivo?: number | null;
};

export type Costeo = {
  precioVenta: number;
  costoUnitario: number;
  costoPlataforma: number;
  costoLogistico: number;
  costoTotal: number;
  utilidadBruta: number;
  margenBruto: number;
  publicidad: number;
  admin: number;
  utilidadNeta: number;
  margenNeto: number;
  /** Precio al que habria que vender para alcanzar el margen objetivo. */
  precioSugerido: number;
  /**
   * Cuanto hay que subir el precio actual para llegar al objetivo.
   * Negativo = ya esta por encima y hay espacio para bajar o promocionar.
   */
  brechaPrecio: number;
  margenObjetivo: number;
};

/**
 * Un margen objetivo de 1 (o mas) haria dividir por cero en el precio
 * sugerido y devolveria Infinity, que en pantalla se veria como un precio
 * astronomico presentado con la misma confianza que el resto. Se topa.
 */
const MARGEN_MAXIMO = 0.95;

function fraccionValida(valor: number | null | undefined, porDefecto: number): number {
  if (typeof valor !== "number" || !Number.isFinite(valor)) return porDefecto;
  if (valor < 0) return porDefecto;
  return Math.min(valor, MARGEN_MAXIMO);
}

function montoValido(valor: number | null | undefined): number {
  return typeof valor === "number" && Number.isFinite(valor) && valor >= 0 ? valor : 0;
}

/**
 * Calcula la economia de un producto.
 *
 * `costoUnitario` en null se trata como 0 para no romper la aritmetica,
 * pero eso NO significa que el resultado sea utilizable: un producto sin
 * costo sale con margen inflado. Quien lo llame debe mirar
 * `tieneCosto()` antes de presentar el margen como cierto — es
 * exactamente el error que tenia el panel antes de esto.
 */
export function costear(entrada: EntradaCosteo, parametros: ParametrosCosteo): Costeo {
  const precioVenta = montoValido(entrada.precioVenta);
  const costoUnitario = montoValido(entrada.costoUnitario);
  const costoPlataforma = montoValido(entrada.costoPlataforma);
  const costoLogistico = montoValido(entrada.costoLogistico);

  const margenObjetivo = fraccionValida(
    entrada.margenObjetivo ?? parametros.margenObjetivo,
    0.5,
  );
  const pctPublicidad = fraccionValida(parametros.pctPublicidad, 0.2);
  const pctAdmin = fraccionValida(parametros.pctAdmin, 0.1);

  const costoTotal = costoUnitario + costoPlataforma + costoLogistico;
  const utilidadBruta = precioVenta - costoTotal;
  const margenBruto = precioVenta > 0 ? utilidadBruta / precioVenta : 0;

  // Publicidad y admin se calculan sobre el PRECIO DE VENTA, no sobre la
  // utilidad. Asi lo hace la hoja y asi tiene que ser: lo que se paga por
  // traer la venta no baja porque el producto deje poco margen.
  const publicidad = precioVenta * pctPublicidad;
  const admin = precioVenta * pctAdmin;

  const utilidadNeta = utilidadBruta - publicidad - admin;
  const margenNeto = precioVenta > 0 ? utilidadNeta / precioVenta : 0;

  const precioSugerido = costoTotal / (1 - margenObjetivo);

  return {
    precioVenta,
    costoUnitario,
    costoPlataforma,
    costoLogistico,
    costoTotal,
    utilidadBruta,
    margenBruto,
    publicidad,
    admin,
    utilidadNeta,
    margenNeto,
    precioSugerido,
    brechaPrecio: precioSugerido - precioVenta,
    margenObjetivo,
  };
}

/** Si el producto tiene un costo cargado de verdad. 0 cuenta; null no. */
export function tieneCosto(entrada: Pick<EntradaCosteo, "costoUnitario">): boolean {
  return typeof entrada.costoUnitario === "number" && Number.isFinite(entrada.costoUnitario);
}

export type SaludCosteo = "sin_costo" | "perdida" | "bajo_objetivo" | "sano";

/**
 * Semaforo de un producto, para ordenar la tabla por lo que urge.
 *
 * `sin_costo` va primero a proposito: no es un producto malo, es un
 * producto del que no se sabe nada, y mientras siga asi todo lo que se
 * calcule encima es humo.
 */
export function saludCosteo(
  entrada: EntradaCosteo,
  costeo: Costeo,
): SaludCosteo {
  if (!tieneCosto(entrada)) return "sin_costo";
  if (costeo.utilidadNeta < 0) return "perdida";
  if (costeo.margenBruto < costeo.margenObjetivo) return "bajo_objetivo";
  return "sano";
}

export const ORDEN_SALUD: Record<SaludCosteo, number> = {
  sin_costo: 0,
  perdida: 1,
  bajo_objetivo: 2,
  sano: 3,
};

export const ETIQUETA_SALUD: Record<SaludCosteo, string> = {
  sin_costo: "Sin costo",
  perdida: "Pierde plata",
  bajo_objetivo: "Bajo el objetivo",
  sano: "Sano",
};

/**
 * Costo administrativo que le toca a cada venta.
 *
 * Es la tabla de la derecha en la hoja de costos: los fijos del mes
 * repartidos entre las ventas ENTREGADAS, no entre las facturadas. En
 * contraentrega esa distincion es la mitad del negocio — un pedido que
 * se devuelve consumio operacion igual y no dejo un peso.
 */
export function costoAdminPorVenta(
  costosFijosMes: number,
  ventasEntregadasMes: number,
): number {
  if (ventasEntregadasMes <= 0) return 0;
  return montoValido(costosFijosMes) / ventasEntregadasMes;
}

/** Los fijos del mes prorrateados por dia, sobre un mes de 30. */
export function costoPorDia(costosFijosMes: number): number {
  return montoValido(costosFijosMes) / 30;
}

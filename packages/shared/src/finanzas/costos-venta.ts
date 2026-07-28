/**
 * Qué cuesta una venta.
 *
 * Este archivo es la ÚNICA definición de los costos variables de un
 * pedido. Lo usan por igual el cálculo de lo real (lib/financiero.ts) y
 * el de la proyección, para que no puedan discrepar: si se sumaran por
 * separado en cada sitio, tarde o temprano el panel y la proyección
 * dirían cosas distintas del mismo mes y no habría forma de saber cuál
 * está mal.
 *
 * Los costos FIJOS (nómina, plataformas, arriendo) no van aquí: no
 * escalan con la venta y se reparten aparte, en `costeo.ts`.
 */

export type ParametrosCostosVenta = {
  /** Comisión de pasarela/plataforma por pedido, en COP. */
  costoPlataforma: number;
  /** Empaque, picking y alistamiento por pedido, en COP. */
  costoFulfillment: number;
  /** Flete estimado por pedido, en COP. Solo para proyectar. */
  costoLogistico: number;
  /**
   * Comisión de la transportadora por recaudar el efectivo, como
   * fracción de lo cobrado. Es propia de contraentrega y crece con el
   * ticket: sobre un pedido grande no es un detalle.
   */
  pctRecaudo: number;
  /** Comisión porcentual de la pasarela sobre lo cobrado (anticipado). */
  pasarelaPct: number;
  /** Cargo fijo de la pasarela por transacción, en COP. */
  pasarelaFijo: number;
  /** IVA que la pasarela cobra sobre SU comisión — no sobre la venta. */
  ivaComision: number;
  /**
   * Flete de retorno cuando el pedido se devuelve. La transportadora
   * cobra la vuelta además de la ida: un COD devuelto paga doble flete
   * sin dejar un peso, y es la pérdida más grande de contraentrega.
   */
  fleteDevolucion: number;
};

export const COSTOS_VENTA_POR_DEFECTO: ParametrosCostosVenta = {
  costoPlataforma: 5000,
  costoFulfillment: 2000,
  costoLogistico: 16000,
  pctRecaudo: 0.03,
  pasarelaPct: 0.0299,
  pasarelaFijo: 900,
  ivaComision: 0.19,
  fleteDevolucion: 16000,
};

/**
 * Los costos variables de UN pedido, tal como quedaron registrados.
 *
 * Todo es `number | null` a propósito. `null` significa "no se sabe" y
 * se propaga: un pedido al que le falta el costo de mercancía no puede
 * presentarse con margen, porque ese margen sería mentira. `0` sí es un
 * valor legítimo — un envío regalado cuesta cero de verdad.
 */
export type CostosDePedido = {
  costoProductoUnitario: number | null;
  cantidad: number;
  costoEnvio: number | null;
  costoPlataforma: number | null;
  costoFulfillment: number | null;
  costoRecaudo: number | null;
  /** Flete de retorno. Solo existe en pedidos devueltos. */
  costoDevolucion?: number | null;
};

export type DesgloseCostos = {
  mercancia: number;
  envio: number;
  plataforma: number;
  fulfillment: number;
  recaudo: number;
  devolucion: number;
  total: number;
  /**
   * Si algún componente venía en `null`. Cuando es true, el total es un
   * piso — el costo real es ese o más — y no se puede presentar el
   * margen como cierto.
   */
  incompleto: boolean;
  /** Qué faltó, para poder decirlo en pantalla en vez de solo marcarlo. */
  faltantes: string[];
};

const ETIQUETAS: Record<keyof Omit<DesgloseCostos, "total" | "incompleto" | "faltantes">, string> = {
  mercancia: "mercancía",
  envio: "envío",
  plataforma: "plataforma",
  fulfillment: "fulfillment",
  recaudo: "recaudo",
  devolucion: "devolución",
};

function valor(n: number | null | undefined): number {
  return typeof n === "number" && Number.isFinite(n) ? n : 0;
}

function falta(n: number | null | undefined): boolean {
  return typeof n !== "number" || !Number.isFinite(n);
}

/**
 * Desglosa lo que costó un pedido.
 *
 * Los que faltan suman 0 para que la aritmética no se rompa, pero quedan
 * anotados en `faltantes` — sumar 0 en silencio es justo el error que
 * hacía que el panel mostrara margen completo sobre productos sin
 * costear.
 */
export function desglosarCostos(pedido: CostosDePedido): DesgloseCostos {
  const cantidad = Number.isFinite(pedido.cantidad) && pedido.cantidad > 0
    ? pedido.cantidad
    : 1;

  // El costo de mercancía es UNITARIO: sin multiplicar por la cantidad,
  // un pedido de 3 unidades cuenta el costo de una sola.
  const mercancia = valor(pedido.costoProductoUnitario) * cantidad;
  const envio = valor(pedido.costoEnvio);
  const plataforma = valor(pedido.costoPlataforma);
  const fulfillment = valor(pedido.costoFulfillment);
  const recaudo = valor(pedido.costoRecaudo);
  const devolucion = valor(pedido.costoDevolucion);

  const faltantes: string[] = [];
  if (falta(pedido.costoProductoUnitario)) faltantes.push(ETIQUETAS.mercancia);
  if (falta(pedido.costoEnvio)) faltantes.push(ETIQUETAS.envio);
  if (falta(pedido.costoPlataforma)) faltantes.push(ETIQUETAS.plataforma);
  if (falta(pedido.costoFulfillment)) faltantes.push(ETIQUETAS.fulfillment);

  // El recaudo y la devolución NO entran en faltantes: solo existen en
  // desenlaces concretos (entregado / devuelto). Marcarlos como faltantes
  // dejaría a todo pedido en curso pintado como incompleto sin que nadie
  // pueda hacer nada.

  return {
    mercancia,
    envio,
    plataforma,
    fulfillment,
    recaudo,
    devolucion,
    total: mercancia + envio + plataforma + fulfillment + recaudo + devolucion,
    incompleto: faltantes.length > 0,
    faltantes,
  };
}

/**
 * La comisión de la pasarela sobre un cobro anticipado.
 *
 * Porcentaje + cargo fijo, y sobre ESA comisión va el IVA — no sobre la
 * venta. Así cobran las pasarelas colombianas (Wompi, ePayco, Mercado
 * Pago, PayU); el número exacto vive en config.
 */
export function comisionPasarela(
  montoCobrado: number,
  parametros: Pick<
    ParametrosCostosVenta,
    "pasarelaPct" | "pasarelaFijo" | "ivaComision"
  >,
): number {
  const monto = valor(montoCobrado);
  if (monto <= 0) return 0;
  const base =
    monto * valor(parametros.pasarelaPct) + valor(parametros.pasarelaFijo);
  return base * (1 + valor(parametros.ivaComision));
}

export type MetodoPago = "contraentrega" | "anticipado";

/**
 * Lo que se congela al CREAR el pedido, según cómo se cobró.
 *
 * En anticipado la comisión de la pasarela SE SABE al vender — el cobro
 * ya pasó — así que se congela aquí como costo de plataforma, calculada
 * sobre el valor real del pedido y no con un default plano. En COD solo
 * va el default de plataforma; el costo de cobrar (el recaudo) se conoce
 * al entregar.
 *
 * El flete se conoce al despachar; inventarlo aquí con un estimado lo
 * volvería imposible de distinguir de un dato medido.
 */
export function costosAlVender(
  parametros: ParametrosCostosVenta,
  venta?: { metodoPago: MetodoPago; total: number },
): {
  costo_plataforma: number;
  costo_fulfillment: number;
} {
  const plataforma =
    venta?.metodoPago === "anticipado"
      ? comisionPasarela(venta.total, parametros)
      : valor(parametros.costoPlataforma);

  return {
    costo_plataforma: plataforma,
    costo_fulfillment: valor(parametros.costoFulfillment),
  };
}

/** La comisión de recaudo sobre lo que de verdad se cobró. */
export function comisionRecaudo(
  valorRecaudado: number | null | undefined,
  pctRecaudo: number,
): number {
  const cobrado = valor(valorRecaudado);
  const pct =
    Number.isFinite(pctRecaudo) && pctRecaudo >= 0 && pctRecaudo < 1
      ? pctRecaudo
      : COSTOS_VENTA_POR_DEFECTO.pctRecaudo;
  return cobrado * pct;
}

/**
 * Lo que costaría un pedido PROYECTADO, con el ticket promedio.
 *
 * Es el equivalente de `desglosarCostos` para lo que todavía no pasó:
 * mismos componentes, mismo orden, para que la proyección y lo real se
 * puedan comparar línea por línea.
 */
export function costosProyectadosPorPedido(
  ticketPromedio: number,
  costoMercancia: number,
  parametros: ParametrosCostosVenta,
): DesgloseCostos {
  const mercancia = valor(costoMercancia);
  const envio = valor(parametros.costoLogistico);
  const plataforma = valor(parametros.costoPlataforma);
  const fulfillment = valor(parametros.costoFulfillment);
  const recaudo = comisionRecaudo(ticketPromedio, parametros.pctRecaudo);

  return {
    mercancia,
    envio,
    plataforma,
    fulfillment,
    recaudo,
    // La devolución no va por pedido vendido: va por despacho fallido, y
    // eso lo proyecta el motor con las tasas. Aquí sería contarla doble.
    devolucion: 0,
    total: mercancia + envio + plataforma + fulfillment + recaudo,
    incompleto: false,
    faltantes: [],
  };
}

/**
 * Lo que cuesta COBRAR un pedido, según la mezcla de métodos de pago.
 *
 * `pctAnticipado` es la fracción de ventas que pagan por pasarela; el
 * resto es contraentrega y paga comisión de recaudo. Las dos comisiones
 * son distintas y ninguna es despreciable — promediar con la mezcla real
 * es lo que deja que la proyección siga a la operación cuando el
 * anticipado crece.
 */
export function costoDeCobro(
  ticketPromedio: number,
  parametros: ParametrosCostosVenta,
  pctAnticipado = 0,
): number {
  const mezcla = Number.isFinite(pctAnticipado)
    ? Math.min(Math.max(pctAnticipado, 0), 1)
    : 0;
  const porPasarela = comisionPasarela(ticketPromedio, parametros);
  const porRecaudo = comisionRecaudo(ticketPromedio, parametros.pctRecaudo);
  return mezcla * porPasarela + (1 - mezcla) * porRecaudo;
}

/** Suma los costos accesorios (todo menos la mercancía) de un pedido proyectado. */
export function costosAccesorios(
  ticketPromedio: number,
  parametros: ParametrosCostosVenta,
  pctAnticipado = 0,
): number {
  return (
    valor(parametros.costoLogistico) +
    valor(parametros.costoPlataforma) +
    valor(parametros.costoFulfillment) +
    costoDeCobro(ticketPromedio, parametros, pctAnticipado)
  );
}

/**
 * El margen bruto que resulta de estos costos.
 *
 * Es la pieza que conecta el costeo con la proyección. El margen no se
 * escribe a mano: se DERIVA de lo que cuesta cada línea, para que subir
 * el flete o la comisión de recaudo mueva la proyección sola. Un margen
 * tecleado se queda viejo y nadie se entera.
 */
export function margenDesdeCostos(
  ticketPromedio: number,
  costoMercancia: number,
  parametros: ParametrosCostosVenta,
  pctAnticipado = 0,
): number {
  const ticket = valor(ticketPromedio);
  if (ticket <= 0) return 0;
  const costos =
    valor(costoMercancia) + costosAccesorios(ticket, parametros, pctAnticipado);
  // Puede dar negativo, y tiene que poder: significa que cada venta deja
  // saldo en contra. Toparlo en cero escondería exactamente eso.
  return (ticket - costos) / ticket;
}

import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import {
  costear,
  saludCosteo,
  tieneCosto,
  ORDEN_SALUD,
  type Costeo,
  type ParametrosCosteo,
  type SaludCosteo,
} from "@diana-mile/shared/finanzas/costeo";
import {
  listarVariantesParaCosteo,
  isShopifyCatalogoConfigurado,
  type VarianteCosteo,
} from "@/lib/shopify-catalogo";

/**
 * Costeo del catalogo: junta lo que Shopify sabe (que variantes hay y a
 * que precio) con lo que solo esta en nuestra base (cuanto cuestan).
 *
 * El catalogo se lee SIEMPRE de Shopify y no de una copia nuestra. Asi un
 * producto nuevo aparece en la lista de "sin costo" por el solo hecho de
 * existir, sin que nadie tenga que acordarse de sincronizar nada — que es
 * justo la clase de paso manual que hace que los costos se queden sin
 * cargar.
 */

export type ParametrosFinancieros = ParametrosCosteo & {
  costoPlataformaDefault: number;
  costoLogisticoDefault: number;
};

export const PARAMETROS_POR_DEFECTO: ParametrosFinancieros = {
  margenObjetivo: 0.5,
  pctPublicidad: 0.2,
  pctAdmin: 0.1,
  costoPlataformaDefault: 5000,
  costoLogisticoDefault: 16000,
};

const CLAVES = {
  fin_margen_objetivo: "margenObjetivo",
  fin_pct_publicidad: "pctPublicidad",
  fin_pct_admin: "pctAdmin",
  fin_costo_plataforma_default: "costoPlataformaDefault",
  fin_costo_logistico_default: "costoLogisticoDefault",
} as const;

/**
 * Lee los parametros de la tabla `config`.
 *
 * Un valor corrupto (vacio, texto, negativo) cae al default en vez de
 * propagarse: un `pctPublicidad` en NaN convertiria todas las utilidades
 * del panel en NaN, y una pantalla llena de guiones es mas dificil de
 * diagnosticar que un numero conservador.
 */
export async function leerParametros(): Promise<ParametrosFinancieros> {
  const supabase = createAdminSupabaseClient();
  const { data } = await supabase
    .from("config")
    .select("clave, valor")
    .in("clave", Object.keys(CLAVES));

  const parametros = { ...PARAMETROS_POR_DEFECTO };
  for (const fila of data ?? []) {
    const campo = CLAVES[fila.clave as keyof typeof CLAVES];
    if (!campo) continue;
    const n = Number(fila.valor);
    if (Number.isFinite(n) && n >= 0) {
      parametros[campo] = n;
    }
  }
  return parametros;
}

export type FilaCosteo = {
  variantId: string;
  productoId: string;
  productoTitulo: string;
  marca: string;
  varianteTitulo: string;
  handle: string;
  estado: string;
  codDisponible: boolean;

  costoUnitario: number | null;
  costoPlataforma: number;
  costoLogistico: number;
  /** Si los costos accesorios vienen del default y no de esta variante. */
  usaDefaults: boolean;
  notas: string | null;

  costeo: Costeo;
  salud: SaludCosteo;
  /**
   * El costo guardado en Shopify no coincide con el nuestro. Solo se
   * marca cuando hay costo propio: sin costo cargado no hay nada que
   * desincronizar.
   */
  desincronizado: boolean;
};

export type ResumenCosteo = {
  filas: FilaCosteo[];
  parametros: ParametrosFinancieros;
  total: number;
  sinCosto: number;
  enPerdida: number;
  bajoObjetivo: number;
  /** Solo cuenta variantes con costo: sobre las demas no se sabe nada. */
  margenBrutoPromedio: number | null;
  /** Marcas presentes en el catalogo, para filtrar. */
  marcas: string[];
  shopifyConfigurado: boolean;
};

type FilaCostoDB = {
  shopify_variant_id: string;
  costo_unitario: string | number | null;
  costo_plataforma: string | number | null;
  costo_logistico: string | number | null;
  margen_objetivo: string | number | null;
  notas: string | null;
};

/** Postgres devuelve DECIMAL como string; Number(null) daria 0 y eso aqui miente. */
function num(valor: string | number | null | undefined): number | null {
  if (valor === null || valor === undefined) return null;
  const n = typeof valor === "number" ? valor : Number(valor);
  return Number.isFinite(n) ? n : null;
}

export async function calcularCosteoCatalogo(): Promise<ResumenCosteo> {
  const parametros = await leerParametros();

  if (!isShopifyCatalogoConfigurado) {
    return {
      filas: [],
      parametros,
      total: 0,
      sinCosto: 0,
      enPerdida: 0,
      bajoObjetivo: 0,
      margenBrutoPromedio: null,
      marcas: [],
      shopifyConfigurado: false,
    };
  }

  const supabase = createAdminSupabaseClient();
  const [variantes, costosRes] = await Promise.all([
    listarVariantesParaCosteo(),
    supabase
      .from("costos_producto")
      .select(
        "shopify_variant_id, costo_unitario, costo_plataforma, costo_logistico, margen_objetivo, notas",
      ),
  ]);

  const porVariante = new Map<string, FilaCostoDB>(
    (costosRes.data ?? []).map((f) => [f.shopify_variant_id, f as FilaCostoDB]),
  );

  const filas = variantes.map((variante) =>
    construirFila(variante, porVariante.get(variante.id), parametros),
  );

  // Lo que urge primero: sin costo, luego lo que pierde plata, y dentro de
  // cada grupo lo mas caro — donde un punto de margen pesa mas.
  filas.sort((a, b) => {
    const orden = ORDEN_SALUD[a.salud] - ORDEN_SALUD[b.salud];
    if (orden !== 0) return orden;
    return b.costeo.precioVenta - a.costeo.precioVenta;
  });

  const conCosto = filas.filter((f) => f.salud !== "sin_costo");
  const margenBrutoPromedio =
    conCosto.length > 0
      ? conCosto.reduce((acc, f) => acc + f.costeo.margenBruto, 0) / conCosto.length
      : null;

  return {
    filas,
    parametros,
    total: filas.length,
    sinCosto: filas.filter((f) => f.salud === "sin_costo").length,
    enPerdida: filas.filter((f) => f.salud === "perdida").length,
    bajoObjetivo: filas.filter((f) => f.salud === "bajo_objetivo").length,
    margenBrutoPromedio,
    marcas: Array.from(new Set(filas.map((f) => f.marca))).sort(),
    shopifyConfigurado: true,
  };
}

function construirFila(
  variante: VarianteCosteo,
  guardado: FilaCostoDB | undefined,
  parametros: ParametrosFinancieros,
): FilaCosteo {
  const costoUnitario = num(guardado?.costo_unitario);
  const plataformaPropia = num(guardado?.costo_plataforma);
  const logisticoPropio = num(guardado?.costo_logistico);

  const costoPlataforma = plataformaPropia ?? parametros.costoPlataformaDefault;
  const costoLogistico = logisticoPropio ?? parametros.costoLogisticoDefault;

  const entrada = {
    precioVenta: variante.precio,
    costoUnitario,
    costoPlataforma,
    costoLogistico,
    margenObjetivo: num(guardado?.margen_objetivo),
  };

  const costeo = costear(entrada, parametros);

  return {
    variantId: variante.id,
    productoId: variante.productoId,
    productoTitulo: variante.productoTitulo,
    marca: variante.marca,
    varianteTitulo: variante.varianteTitulo,
    handle: variante.handle,
    estado: variante.estado,
    codDisponible: variante.codDisponible,

    costoUnitario,
    costoPlataforma,
    costoLogistico,
    usaDefaults: plataformaPropia === null && logisticoPropio === null,
    notas: guardado?.notas ?? null,

    costeo,
    salud: saludCosteo(entrada, costeo),
    desincronizado:
      tieneCosto(entrada) &&
      variante.costoShopify !== null &&
      Math.abs(variante.costoShopify - (costoUnitario ?? 0)) > 1,
  };
}

// El costo de una variante para congelarlo en un pedido vive en
// `@diana-mile/shared/finanzas/costo-pedido`, no aqui: lo necesitan la
// tienda y el admin, y dos copias de la misma consulta terminan
// separandose.

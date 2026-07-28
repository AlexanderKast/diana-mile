import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";

/**
 * TRM — la tasa oficial peso/dólar.
 *
 * Varias plataformas se pagan en dólares (Shopify, Vercel, Supabase) y
 * todo el modelo financiero vive en pesos. Convertir con "el dólar de
 * hoy" haría que la utilidad de un mes ya cerrado cambiara sola cada vez
 * que se mueve la divisa, así que se convierte con la tasa del DÍA EN QUE
 * SE PAGÓ y esa tasa se guarda.
 *
 * La fuente es la Tasa Representativa del Mercado que publica la
 * Superintendencia Financiera en datos.gov.co: es la oficial, es gratis y
 * no pide llave.
 *
 * ADVERTENCIA CONTABLE: la TRM no es lo que cobra la tarjeta. El banco le
 * suma su margen (suele andar entre 3% y 5%) y, si aplica, el 4x1000. La
 * TRM es la mejor estimación automática, pero el costo real está en el
 * extracto — por eso `costos_fijos.monto_cop_real` existe y manda sobre
 * esta conversión cuando está lleno.
 */

const API_TRM = "https://www.datos.gov.co/resource/32sa-8pi3.json";

/** Si la TRM se aleja de esto, algo salió mal en el origen. */
const TRM_MINIMA = 500;
const TRM_MAXIMA = 50_000;

export type Tasa = {
  fecha: string;
  vigenteHasta: string;
  usdCop: number;
  fuente: string;
};

function esFechaValida(fecha: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(fecha);
}

function tasaRazonable(n: number): boolean {
  return Number.isFinite(n) && n >= TRM_MINIMA && n <= TRM_MAXIMA;
}

export function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Consulta la TRM vigente para una fecha en datos.gov.co.
 *
 * Se busca por RANGO y no por fecha exacta: la TRM del viernes rige
 * también sábado, domingo y festivos, así que una consulta por igualdad
 * devolvería vacío justo los días en que no se publica.
 */
async function consultarApi(fecha: string): Promise<Tasa | null> {
  const where = encodeURIComponent(
    `vigenciadesde <= '${fecha}T00:00:00.000' AND vigenciahasta >= '${fecha}T00:00:00.000'`,
  );
  const url = `${API_TRM}?$where=${where}&$limit=1`;

  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;

    const filas = (await res.json()) as {
      valor?: string;
      vigenciadesde?: string;
      vigenciahasta?: string;
    }[];

    const fila = Array.isArray(filas) ? filas[0] : null;
    if (!fila?.valor) return null;

    const usdCop = Number(fila.valor);
    if (!tasaRazonable(usdCop)) {
      console.error(`TRM fuera de rango para ${fecha}: ${fila.valor}`);
      return null;
    }

    return {
      fecha: (fila.vigenciadesde ?? fecha).slice(0, 10),
      vigenteHasta: (fila.vigenciahasta ?? fecha).slice(0, 10),
      usdCop,
      fuente: "superfinanciera",
    };
  } catch (error) {
    console.error(`No se pudo consultar la TRM de ${fecha}:`, error);
    return null;
  }
}

/**
 * La TRM de una fecha, mirando primero el cache.
 *
 * Devuelve `null` cuando no se puede saber, y quien llama tiene que
 * tratarlo como "no se sabe". Caer a la tasa de hoy sería peor que no
 * responder: convertiría un costo de marzo con el dólar de hoy sin que
 * nadie lo note.
 */
export async function obtenerTRM(fecha: string): Promise<Tasa | null> {
  if (!esFechaValida(fecha)) return null;

  const supabase = createAdminSupabaseClient();

  try {
    const { data } = await supabase
      .from("tasas_cambio")
      .select("fecha, vigente_hasta, usd_cop, fuente")
      .lte("fecha", fecha)
      .gte("vigente_hasta", fecha)
      .limit(1)
      .maybeSingle();

    if (data) {
      return {
        fecha: data.fecha,
        vigenteHasta: data.vigente_hasta,
        usdCop: Number(data.usd_cop),
        fuente: data.fuente,
      };
    }
  } catch (error) {
    console.error("No se pudo leer el cache de TRM:", error);
  }

  const tasa = await consultarApi(fecha);
  if (!tasa) return null;

  try {
    await supabase.from("tasas_cambio").upsert(
      {
        fecha: tasa.fecha,
        vigente_hasta: tasa.vigenteHasta,
        usd_cop: tasa.usdCop,
        fuente: tasa.fuente,
      },
      { onConflict: "fecha" },
    );
  } catch (error) {
    // Que no se pueda cachear no invalida la tasa que ya se obtuvo.
    console.error("No se pudo guardar la TRM en cache:", error);
  }

  return tasa;
}

/**
 * Trae y guarda la TRM de hoy. La llama el cron diario.
 *
 * Tenerla al día importa porque la API puede estar caída justo el día que
 * alguien registre un gasto, y con el cache al menos hay una tasa
 * reciente contra la cual advertir.
 */
export async function refrescarTRMHoy(): Promise<Tasa | null> {
  return obtenerTRM(hoyISO());
}

/**
 * Convierte un monto en dólares a pesos con la TRM de una fecha.
 *
 * Devuelve `null` si no hay tasa. Nunca inventa una: un costo convertido
 * con una tasa equivocada es indistinguible de uno correcto.
 */
export async function usdACop(
  montoUsd: number,
  fecha: string,
): Promise<{ cop: number; tasa: Tasa } | null> {
  if (!Number.isFinite(montoUsd) || montoUsd < 0) return null;
  const tasa = await obtenerTRM(fecha);
  if (!tasa) return null;
  return { cop: montoUsd * tasa.usdCop, tasa };
}

/**
 * El día en que se cobra un costo fijo dentro de un mes dado.
 *
 * `dia_cobro` se topa en 28 en la base justo para que esta fecha exista
 * en febrero sin tener que corregirla.
 */
export function fechaDeCobro(periodo: string, diaCobro: number | null): string {
  const dia = Number.isFinite(diaCobro) && diaCobro ? Math.min(diaCobro, 28) : 1;
  return `${periodo}-${String(dia).padStart(2, "0")}`;
}

export type CostoFijoConvertible = {
  moneda: string;
  monto_origen: number | string | null;
  monto_cop: number | string | null;
  monto_cop_real: number | string | null;
  dia_cobro: number | null;
};

export type MontoResuelto = {
  cop: number;
  /** De dónde salió el número, para poder decirlo en pantalla. */
  origen: "real" | "trm" | "pesos" | "ultimo_conocido";
  tasa: number | null;
  nota: string;
};

function num(v: number | string | null | undefined): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Cuánto costó en pesos un costo fijo en un mes concreto.
 *
 * El orden de preferencia no es casual:
 *
 *   1. lo que el banco cobró de verdad — es el dato, no una estimación
 *   2. la TRM del día de cobro de ese mes — la mejor estimación oficial
 *   3. el último valor convertido conocido — sirve para no dejar la
 *      pantalla en blanco, pero se marca como tal
 */
export async function montoEnCop(
  costo: CostoFijoConvertible,
  periodo: string,
): Promise<MontoResuelto> {
  if (costo.moneda !== "USD") {
    return {
      cop: num(costo.monto_cop),
      origen: "pesos",
      tasa: null,
      nota: "Registrado en pesos.",
    };
  }

  if (costo.monto_cop_real !== null && costo.monto_cop_real !== undefined) {
    return {
      cop: num(costo.monto_cop_real),
      origen: "real",
      tasa: null,
      nota: "Lo que cobró el banco, incluido su margen.",
    };
  }

  const fecha = fechaDeCobro(periodo, costo.dia_cobro);
  const convertido = await usdACop(num(costo.monto_origen), fecha);

  if (convertido) {
    return {
      cop: convertido.cop,
      origen: "trm",
      tasa: convertido.tasa.usdCop,
      nota:
        `TRM del ${fecha} ($${convertido.tasa.usdCop.toLocaleString("es-CO")}). ` +
        "La tarjeta suele cobrar algo más por su margen.",
    };
  }

  return {
    cop: num(costo.monto_cop),
    origen: "ultimo_conocido",
    tasa: null,
    nota: "No se pudo consultar la TRM de esa fecha. Es el último valor convertido.",
  };
}

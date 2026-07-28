import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import { calcularCosteoCatalogo } from "@/lib/costeo";

/**
 * Centro de alertas del panel.
 *
 * Las alertas se calculan EN VIVO contra los datos reales. No hay tabla
 * de alertas y es a proposito: una tabla habria que mantenerla al dia con
 * un cron, y una alerta que sigue encendida despues de que el problema se
 * arreglo entrena a la gente a ignorarlas todas.
 *
 * Lo unico que se guarda es lo que alguien decidio silenciar
 * (`alertas_descartadas`), y con fecha de vencimiento cuando aplica.
 *
 * Regla de oro: cada alerta apunta a una PAGINA donde se arregla. Una
 * alerta sin salida es ruido.
 */

export type Severidad = "critica" | "alta" | "media" | "info";

export type Alerta = {
  tipo: string;
  severidad: Severidad;
  titulo: string;
  detalle: string;
  /** Cuantos elementos afecta. 0 = es un aviso, no una lista. */
  cantidad: number;
  href: string;
  accion: string;
  /** Se puede silenciar. Las criticas no: solo se apagan arreglandolas. */
  silenciable: boolean;
};

export const ORDEN_SEVERIDAD: Record<Severidad, number> = {
  critica: 0,
  alta: 1,
  media: 2,
  info: 3,
};

export const COLOR_SEVERIDAD: Record<Severidad, string> = {
  critica: "bg-error/10 text-error border-error/30",
  alta: "bg-dorado/15 text-dorado-oscuro border-dorado/40",
  media: "bg-lila-suave text-morado border-morado/25",
  info: "bg-crema text-carbon-suave border-arena",
};

export const ETIQUETA_SEVERIDAD: Record<Severidad, string> = {
  critica: "Crítico",
  alta: "Importante",
  media: "Por revisar",
  info: "Aviso",
};

const DIAS_LEAD_CALIENTE_SIN_TOCAR = 3;
const DIAS_PEDIDO_ESTANCADO = 2;

function haceDias(dias: number): string {
  return new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString();
}

function plural(n: number, singular: string, plural_: string): string {
  return n === 1 ? singular : plural_;
}

/**
 * Calcula todas las alertas y descarta las silenciadas.
 *
 * Cada regla va en su propio try: una tabla que falle no puede dejar el
 * panel sin las demas alertas. Prefiero mostrar cinco de seis a no
 * mostrar ninguna.
 */
export async function calcularAlertas(): Promise<Alerta[]> {
  const supabase = createAdminSupabaseClient();

  const resultados = await Promise.allSettled([
    alertasDeCosteo(),
    alertasDePedidos(supabase),
    alertasDeCostosFijos(supabase),
    alertasDePipeline(supabase),
  ]);

  const alertas: Alerta[] = [];
  for (const resultado of resultados) {
    if (resultado.status === "fulfilled") {
      alertas.push(...resultado.value);
    } else {
      console.error("Una regla de alertas fallo:", resultado.reason);
    }
  }

  const silenciadas = await leerSilenciadas(supabase);
  return alertas
    .filter((a) => !silenciadas.has(a.tipo))
    .sort((a, b) => {
      const orden = ORDEN_SEVERIDAD[a.severidad] - ORDEN_SEVERIDAD[b.severidad];
      return orden !== 0 ? orden : b.cantidad - a.cantidad;
    });
}

async function leerSilenciadas(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
): Promise<Set<string>> {
  try {
    const { data } = await supabase
      .from("alertas_descartadas")
      .select("tipo, silenciada_hasta")
      .eq("referencia", "");

    const ahora = Date.now();
    return new Set(
      (data ?? [])
        .filter(
          (f) =>
            f.silenciada_hasta === null ||
            new Date(f.silenciada_hasta).getTime() > ahora,
        )
        .map((f) => f.tipo),
    );
  } catch {
    // Si no se puede leer que esta silenciado, se muestran todas. Ver de
    // mas nunca es peor que perderse una alerta critica.
    return new Set();
  }
}

// ────────────────────────────────────────────────────────────────
// Costeo del catalogo
// ────────────────────────────────────────────────────────────────

async function alertasDeCosteo(): Promise<Alerta[]> {
  const resumen = await calcularCosteoCatalogo();
  if (!resumen.shopifyConfigurado) return [];

  const alertas: Alerta[] = [];

  if (resumen.sinCosto > 0) {
    alertas.push({
      tipo: "productos_sin_costo",
      severidad: "critica",
      titulo: `${resumen.sinCosto} ${plural(resumen.sinCosto, "producto sin costo", "productos sin costo")}`,
      detalle:
        "Mientras no tengan costo, la utilidad que muestra Finanzas está inflada: " +
        "se calcula como si la mercancía fuera gratis.",
      cantidad: resumen.sinCosto,
      href: "/dashboard/financiero/costos?filtro=sin_costo",
      accion: "Cargar costos",
      silenciable: false,
    });
  }

  if (resumen.enPerdida > 0) {
    alertas.push({
      tipo: "productos_en_perdida",
      severidad: "critica",
      titulo: `${resumen.enPerdida} ${plural(resumen.enPerdida, "producto pierde plata", "productos pierden plata")}`,
      detalle:
        "El precio de venta no cubre costo, publicidad y carga administrativa. " +
        "Cada venta de estos productos deja saldo en contra.",
      cantidad: resumen.enPerdida,
      href: "/dashboard/financiero/costos?filtro=perdida",
      accion: "Revisar precios",
      silenciable: false,
    });
  }

  if (resumen.bajoObjetivo > 0) {
    alertas.push({
      tipo: "productos_bajo_objetivo",
      severidad: "media",
      titulo: `${resumen.bajoObjetivo} ${plural(resumen.bajoObjetivo, "producto bajo", "productos bajo")} el margen objetivo`,
      detalle:
        "Dejan ganancia, pero por debajo del margen que se fijó. La tabla muestra a qué precio llegarían.",
      cantidad: resumen.bajoObjetivo,
      href: "/dashboard/financiero/costos?filtro=bajo_objetivo",
      accion: "Ver precios sugeridos",
      silenciable: true,
    });
  }

  const desincronizados = resumen.filas.filter((f) => f.desincronizado).length;
  if (desincronizados > 0) {
    alertas.push({
      tipo: "costos_desincronizados",
      severidad: "info",
      titulo: `${desincronizados} ${plural(desincronizados, "costo no coincide", "costos no coinciden")} con Shopify`,
      detalle:
        "El costo guardado aquí es distinto del que tiene Shopify. Manda el de aquí; " +
        "al volver a guardarlo se corrige el de allá.",
      cantidad: desincronizados,
      href: "/dashboard/financiero/costos",
      accion: "Revisar",
      silenciable: true,
    });
  }

  return alertas;
}

// ────────────────────────────────────────────────────────────────
// Pedidos
// ────────────────────────────────────────────────────────────────

async function alertasDePedidos(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
): Promise<Alerta[]> {
  const alertas: Alerta[] = [];

  const [entregadosSinRecaudo, sinCosto, estancados] = await Promise.all([
    supabase
      .from("pedidos")
      .select("id", { count: "exact", head: true })
      .eq("estado", "entregado")
      .is("valor_recaudado", null),
    supabase
      .from("pedidos")
      .select("id", { count: "exact", head: true })
      .in("estado", ["entregado", "enviado", "confirmado"])
      .is("costo_producto", null),
    supabase
      .from("pedidos")
      .select("id", { count: "exact", head: true })
      .eq("estado", "pendiente")
      .lt("created_at", haceDias(DIAS_PEDIDO_ESTANCADO)),
  ]);

  const nSinRecaudo = entregadosSinRecaudo.count ?? 0;
  if (nSinRecaudo > 0) {
    alertas.push({
      tipo: "entregados_sin_recaudo",
      severidad: "alta",
      titulo: `${nSinRecaudo} ${plural(nSinRecaudo, "pedido entregado sin", "pedidos entregados sin")} valor recaudado`,
      detalle:
        "Están marcados como entregados pero no se registró cuánto se recaudó. " +
        "Los ingresos del mes salen incompletos por esa misma cantidad.",
      cantidad: nSinRecaudo,
      href: "/dashboard/logistica",
      accion: "Registrar recaudo",
      silenciable: false,
    });
  }

  const nSinCosto = sinCosto.count ?? 0;
  if (nSinCosto > 0) {
    alertas.push({
      tipo: "pedidos_sin_costo",
      severidad: "media",
      titulo: `${nSinCosto} ${plural(nSinCosto, "pedido quedó", "pedidos quedaron")} sin costo`,
      detalle:
        "Se cerraron antes de que el producto tuviera costo cargado. La utilidad de " +
        "esos meses queda alta hasta que se recalculen.",
      cantidad: nSinCosto,
      href: "/dashboard/financiero/costos",
      accion: "Cargar costos y recalcular",
      silenciable: true,
    });
  }

  const nEstancados = estancados.count ?? 0;
  if (nEstancados > 0) {
    alertas.push({
      tipo: "pedidos_estancados",
      severidad: "alta",
      titulo: `${nEstancados} ${plural(nEstancados, "pedido lleva", "pedidos llevan")} más de ${DIAS_PEDIDO_ESTANCADO} días sin confirmar`,
      detalle:
        "Entre más tiempo pasa desde que la clienta pidió, menos recibe el mensajero. " +
        "Confirmar rápido es lo que sostiene la tasa de entrega.",
      cantidad: nEstancados,
      href: "/dashboard/confirmacion",
      accion: "Confirmar",
      silenciable: false,
    });
  }

  return alertas;
}

// ────────────────────────────────────────────────────────────────
// Costos fijos
// ────────────────────────────────────────────────────────────────

async function alertasDeCostosFijos(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
): Promise<Alerta[]> {
  const hoy = new Date().toISOString().slice(0, 10);
  const { count } = await supabase
    .from("costos_fijos")
    .select("id", { count: "exact", head: true })
    .lte("vigente_desde", hoy)
    .or(`vigente_hasta.is.null,vigente_hasta.gte.${hoy}`);

  if ((count ?? 0) > 0) return [];

  return [
    {
      tipo: "sin_costos_fijos",
      severidad: "alta",
      titulo: "No hay costos fijos registrados",
      detalle:
        "Sin nómina, plataformas ni gastos administrativos, la proyección calcula " +
        "utilidad como si operar no costara nada, y el punto de equilibrio sale muy por debajo del real.",
      cantidad: 0,
      href: "/dashboard/financiero/costos-fijos",
      accion: "Registrar costos fijos",
      silenciable: true,
    },
  ];
}

// ────────────────────────────────────────────────────────────────
// Pipeline
// ────────────────────────────────────────────────────────────────

async function alertasDePipeline(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
): Promise<Alerta[]> {
  const { count } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .gte("score", 70)
    .not("etapa", "in", "(cerrado,perdido)")
    .lt("ultima_interaccion_at", haceDias(DIAS_LEAD_CALIENTE_SIN_TOCAR));

  const n = count ?? 0;
  if (n === 0) return [];

  return [
    {
      tipo: "leads_calientes_frios",
      severidad: "alta",
      titulo: `${n} ${plural(n, "lead caliente lleva", "leads calientes llevan")} ${DIAS_LEAD_CALIENTE_SIN_TOCAR} días sin contacto`,
      detalle:
        "Son los que más cerca están de comprar. El puntaje alto se enfría solo si nadie los vuelve a tocar.",
      cantidad: n,
      href: "/dashboard/pipeline",
      accion: "Ver pipeline",
      silenciable: false,
    },
  ];
}

/** Cuantas alertas hay ahora, para el punto rojo de la campana. */
export async function contarAlertas(): Promise<{ total: number; criticas: number }> {
  try {
    const alertas = await calcularAlertas();
    return {
      total: alertas.length,
      criticas: alertas.filter((a) => a.severidad === "critica").length,
    };
  } catch {
    return { total: 0, criticas: 0 };
  }
}

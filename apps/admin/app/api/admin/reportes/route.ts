import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient, requireAdminSession } from "@diana-mile/shared/supabase/server";
import type { Gasto, MetricasFinancieras, Pedido, RendimientoTransportadora } from "@diana-mile/shared/types";

type TipoReporte = "pedidos" | "financiero" | "leads" | "transportadoras";
type FormatoReporte = "csv" | "json";

const TIPOS_VALIDOS: TipoReporte[] = ["pedidos", "financiero", "leads", "transportadoras"];
const FORMATOS_VALIDOS: FormatoReporte[] = ["csv", "json"];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function fechaISOaYMD(iso: string): string {
  return iso.slice(0, 10);
}

/**
 * Si no vienen fecha_desde/fecha_hasta, usa el mes actual completo (dia 1 al ultimo dia del mes).
 */
function normalizarRango(fechaDesdeParam: string | null, fechaHastaParam: string | null) {
  let desdeYMD: string;
  let hastaYMD: string;

  if (fechaDesdeParam && fechaHastaParam) {
    desdeYMD = fechaDesdeParam;
    hastaYMD = fechaHastaParam;
  } else {
    const ahora = new Date();
    const anio = ahora.getUTCFullYear();
    const mes = ahora.getUTCMonth();
    const inicio = new Date(Date.UTC(anio, mes, 1));
    const fin = new Date(Date.UTC(anio, mes + 1, 0));
    desdeYMD = `${inicio.getUTCFullYear()}-${pad2(inicio.getUTCMonth() + 1)}-${pad2(inicio.getUTCDate())}`;
    hastaYMD = `${fin.getUTCFullYear()}-${pad2(fin.getUTCMonth() + 1)}-${pad2(fin.getUTCDate())}`;
  }

  return {
    desdeISO: `${desdeYMD}T00:00:00.000Z`,
    hastaISO: `${hastaYMD}T23:59:59.999Z`,
    desdeYMD,
    hastaYMD,
  };
}

/**
 * Neutraliza inyeccion de formulas (=, +, -, @) y escapa comillas/comas/saltos de linea,
 * mismo criterio que el csvEscape de LeadsTable.tsx.
 */
function csvEscape(value: unknown): string {
  let texto = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(texto)) {
    texto = `'${texto}`;
  }
  if (/[",\n\r]/.test(texto)) {
    return `"${texto.replace(/"/g, '""')}"`;
  }
  return texto;
}

function generarCSV(filas: Record<string, unknown>[]): string {
  if (filas.length === 0) return "";
  const encabezados = Object.keys(filas[0]);
  const lineas = filas.map((fila) =>
    encabezados.map((clave) => csvEscape(fila[clave])).join(",")
  );
  return [encabezados.join(","), ...lineas].join("\n");
}

function calcularMetricasBasico(pedidos: Pedido[], gastos: Gasto[], periodo: string): MetricasFinancieras {
  const totalPedidos = pedidos.length;
  const confirmados = pedidos.filter(
    (p) => p.estado !== "pendiente" && p.estado !== "cancelado" && p.estado !== "fraude"
  ).length;
  const entregados = pedidos.filter((p) => p.estado === "entregado").length;
  const devueltos = pedidos.filter((p) => p.estado === "devuelto").length;
  const cancelados = pedidos.filter((p) => p.estado === "cancelado").length;

  const ingresosBrutos = pedidos.reduce((acc, p) => acc + (p.precio_total ?? 0), 0);
  const ingresosRecaudados = pedidos.reduce((acc, p) => acc + (p.valor_recaudado ?? 0), 0);
  const costoProductos = pedidos.reduce((acc, p) => acc + (p.costo_producto ?? 0), 0);
  const costoEnvios = pedidos.reduce((acc, p) => acc + (p.costo_envio ?? 0), 0);

  const gastoPublicidad = gastos
    .filter((g) => g.tipo.startsWith("publicidad_"))
    .reduce((acc, g) => acc + (g.monto_cop ?? g.monto ?? 0), 0);
  const otrosGastos = gastos
    .filter((g) => !g.tipo.startsWith("publicidad_"))
    .reduce((acc, g) => acc + (g.monto_cop ?? g.monto ?? 0), 0);

  const utilidadBruta = ingresosRecaudados - costoProductos - costoEnvios;
  const utilidadNeta = utilidadBruta - gastoPublicidad - otrosGastos;

  // Porcentajes en escala 0-100 (mismo criterio que apps/admin/lib/financiero.ts,
  // usado por el dashboard financiero — nunca fracciones 0-1).
  return {
    periodo,
    total_pedidos: totalPedidos,
    pedidos_confirmados: confirmados,
    pedidos_entregados: entregados,
    pedidos_devueltos: devueltos,
    pedidos_cancelados: cancelados,
    tasa_confirmacion: totalPedidos > 0 ? Number(((confirmados / totalPedidos) * 100).toFixed(2)) : 0,
    tasa_entrega: confirmados > 0 ? Number(((entregados / confirmados) * 100).toFixed(2)) : 0,
    tasa_devolucion:
      entregados + devueltos > 0
        ? Number(((devueltos / (entregados + devueltos)) * 100).toFixed(2))
        : 0,
    ingresos_brutos: Math.round(ingresosBrutos),
    ingresos_recaudados: Math.round(ingresosRecaudados),
    costo_productos: Math.round(costoProductos),
    costo_envios: Math.round(costoEnvios),
    gasto_publicidad: Math.round(gastoPublicidad),
    otros_gastos: Math.round(otrosGastos),
    utilidad_bruta: Math.round(utilidadBruta),
    utilidad_neta: Math.round(utilidadNeta),
    margen_neto:
      ingresosRecaudados > 0 ? Number(((utilidadNeta / ingresosRecaudados) * 100).toFixed(2)) : 0,
    ticket_promedio: totalPedidos > 0 ? Math.round(ingresosBrutos / totalPedidos) : 0,
    costo_por_pedido: totalPedidos > 0 ? Math.round((costoProductos + costoEnvios) / totalPedidos) : 0,
    roas: gastoPublicidad > 0 ? Number((ingresosRecaudados / gastoPublicidad).toFixed(2)) : null,
  };
}

function calcularRendimientoBasico(pedidos: Pedido[]): RendimientoTransportadora[] {
  const grupos = new Map<string, Pedido[]>();
  for (const pedido of pedidos) {
    if (!pedido.transportadora) continue;
    const lista = grupos.get(pedido.transportadora) ?? [];
    lista.push(pedido);
    grupos.set(pedido.transportadora, lista);
  }

  const resultado: RendimientoTransportadora[] = [];
  for (const [transportadora, envios] of grupos.entries()) {
    const totalEnvios = envios.length;
    const entregados = envios.filter((p) => p.estado === "entregado").length;
    const devueltos = envios.filter((p) => p.estado === "devuelto").length;
    const enTransito = envios.filter((p) => p.estado === "enviado").length;

    const costos = envios.map((p) => p.costo_envio).filter((c): c is number => c !== null);
    const costoPromedio = costos.length > 0 ? costos.reduce((a, b) => a + b, 0) / costos.length : 0;

    const dias = envios
      .filter((p) => p.fecha_envio && p.fecha_entrega_real)
      .map((p) => {
        const inicio = new Date(p.fecha_envio as string).getTime();
        const fin = new Date(p.fecha_entrega_real as string).getTime();
        return (fin - inicio) / (1000 * 60 * 60 * 24);
      })
      .filter((d) => Number.isFinite(d) && d >= 0);

    resultado.push({
      transportadora,
      total_envios: totalEnvios,
      entregados,
      devueltos,
      en_transito: enTransito,
      tasa_entrega: totalEnvios > 0 ? Number(((entregados / totalEnvios) * 100).toFixed(2)) : 0,
      costo_promedio: Math.round(costoPromedio),
      dias_promedio_entrega:
        dias.length > 0 ? Number((dias.reduce((a, b) => a + b, 0) / dias.length).toFixed(1)) : null,
    });
  }

  return resultado.sort((a, b) => b.total_envios - a.total_envios);
}

export async function GET(request: NextRequest) {
  try {
    if (!(await requireAdminSession())) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tipoParam = searchParams.get("tipo") as TipoReporte | null;
    const formatoParam = (searchParams.get("formato") ?? "json") as FormatoReporte;
    const fechaDesdeParam = searchParams.get("fecha_desde");
    const fechaHastaParam = searchParams.get("fecha_hasta");

    if (!tipoParam || !TIPOS_VALIDOS.includes(tipoParam)) {
      return NextResponse.json(
        { error: `Tipo invalido. Valores permitidos: ${TIPOS_VALIDOS.join(", ")}.` },
        { status: 400 }
      );
    }

    if (!FORMATOS_VALIDOS.includes(formatoParam)) {
      return NextResponse.json(
        { error: `Formato invalido. Valores permitidos: ${FORMATOS_VALIDOS.join(", ")}.` },
        { status: 400 }
      );
    }

    const { desdeISO, hastaISO, desdeYMD, hastaYMD } = normalizarRango(fechaDesdeParam, fechaHastaParam);
    const supabase = createAdminSupabaseClient();

    let filas: Record<string, unknown>[] = [];

    if (tipoParam === "pedidos") {
      const { data, error } = await supabase
        .from("pedidos")
        .select("*")
        .gte("created_at", desdeISO)
        .lte("created_at", hastaISO)
        .order("created_at", { ascending: false });

      if (error) {
        return NextResponse.json(
          { error: "No se pudieron obtener los pedidos.", detalle: error.message },
          { status: 500 }
        );
      }
      filas = (data ?? []) as unknown as Record<string, unknown>[];
    } else if (tipoParam === "leads") {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .gte("created_at", desdeISO)
        .lte("created_at", hastaISO)
        .order("created_at", { ascending: false });

      if (error) {
        return NextResponse.json(
          { error: "No se pudieron obtener los leads.", detalle: error.message },
          { status: 500 }
        );
      }
      filas = (data ?? []) as unknown as Record<string, unknown>[];
    } else if (tipoParam === "financiero") {
      const [pedidosRes, gastosRes] = await Promise.all([
        supabase.from("pedidos").select("*").gte("created_at", desdeISO).lte("created_at", hastaISO),
        supabase.from("gastos").select("*").gte("fecha", desdeYMD).lte("fecha", hastaYMD),
      ]);

      if (pedidosRes.error) {
        return NextResponse.json(
          { error: "No se pudieron obtener los pedidos.", detalle: pedidosRes.error.message },
          { status: 500 }
        );
      }
      if (gastosRes.error) {
        return NextResponse.json(
          { error: "No se pudieron obtener los gastos.", detalle: gastosRes.error.message },
          { status: 500 }
        );
      }

      const periodo = fechaISOaYMD(desdeISO).slice(0, 7);
      const metricas = calcularMetricasBasico(
        (pedidosRes.data ?? []) as Pedido[],
        (gastosRes.data ?? []) as Gasto[],
        periodo
      );
      filas = [metricas as unknown as Record<string, unknown>];
    } else {
      const { data, error } = await supabase
        .from("pedidos")
        .select("*")
        .gte("created_at", desdeISO)
        .lte("created_at", hastaISO)
        .not("transportadora", "is", null);

      if (error) {
        return NextResponse.json(
          { error: "No se pudieron obtener los pedidos.", detalle: error.message },
          { status: 500 }
        );
      }

      const rendimiento = calcularRendimientoBasico((data ?? []) as Pedido[]);
      filas = rendimiento as unknown as Record<string, unknown>[];
    }

    if (formatoParam === "json") {
      return NextResponse.json({ datos: filas }, { status: 200 });
    }

    const csv = generarCSV(filas);
    const fechaArchivo = new Date().toISOString().slice(0, 10);

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="reporte-${tipoParam}-${fechaArchivo}.csv"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error inesperado al generar el reporte.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

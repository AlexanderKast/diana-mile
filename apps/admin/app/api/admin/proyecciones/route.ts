import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSupabaseClient,
  getAdminUser,
} from "@diana-mile/shared/supabase/server";
import { margenDesdeCostos } from "@diana-mile/shared/finanzas/costos-venta";
import { periodoActual } from "@/lib/financiero";

/**
 * Guarda un escenario de proyeccion.
 *
 * Se guardan los SUPUESTOS, nunca los resultados. Si se guardaran los
 * numeros calculados, al cambiar una formula los escenarios viejos
 * quedarian mostrando cifras que ya no salen de ningun lado. Se
 * recalculan siempre al abrirlos.
 *
 * `margen_bruto` es la excepcion, y va derivado en el servidor de los
 * mismos costos que se guardan al lado: sirve para comparar escenarios en
 * consultas sin rehacer la aritmetica, y no puede desincronizarse porque
 * no se acepta del cliente.
 */

type Cuerpo = {
  id?: string | null;
  nombre?: string;
  periodo?: string;
  inversionPublicidad?: number;
  partPublicidad?: number;
  ticketPromedio?: number;
  tasaDespacho?: number;
  tasaEntrega?: number;
  costosFijosMes?: number;
  costoMercancia?: number;
  costoLogistico?: number;
  costoPlataforma?: number;
  costoFulfillment?: number;
  pctRecaudo?: number;
};

/** Un monto en COP: finito y no negativo. */
function monto(valor: unknown): number | null {
  const n = Number(valor);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** Una fraccion entre 0 y 1, sin llegar a 1. */
function fraccion(valor: unknown): number | null {
  const n = Number(valor);
  return Number.isFinite(n) && n > 0 && n <= 1 ? n : null;
}

export async function POST(request: NextRequest) {
  try {
    const usuario = await getAdminUser();
    if (!usuario) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as Cuerpo;

    const nombre = body.nombre?.trim();
    if (!nombre) {
      return NextResponse.json(
        { error: "Ponle un nombre al escenario." },
        { status: 400 },
      );
    }

    const inversion = monto(body.inversionPublicidad);
    const part = fraccion(body.partPublicidad);
    const ticket = monto(body.ticketPromedio);
    const despacho = fraccion(body.tasaDespacho);
    const entrega = fraccion(body.tasaEntrega);
    const fijos = monto(body.costosFijosMes) ?? 0;

    const mercancia = monto(body.costoMercancia) ?? 0;
    const logistico = monto(body.costoLogistico) ?? 0;
    const plataforma = monto(body.costoPlataforma) ?? 0;
    const fulfillment = monto(body.costoFulfillment) ?? 0;
    // El % de recaudo si puede ser 0 (sin comision), a diferencia de las
    // tasas de despacho y entrega, donde un 0 no tendria sentido.
    const recaudoRaw = Number(body.pctRecaudo);
    const recaudo =
      Number.isFinite(recaudoRaw) && recaudoRaw >= 0 && recaudoRaw < 1
        ? recaudoRaw
        : null;

    const faltantes: string[] = [];
    if (inversion === null) faltantes.push("inversión en pauta");
    if (part === null) faltantes.push("participación de pauta");
    if (ticket === null || ticket <= 0) faltantes.push("ticket promedio");
    if (despacho === null) faltantes.push("tasa de despacho");
    if (entrega === null) faltantes.push("tasa de entrega");
    if (recaudo === null) faltantes.push("comisión de recaudo");

    if (faltantes.length > 0) {
      return NextResponse.json(
        { error: `Revisa estos valores: ${faltantes.join(", ")}.` },
        { status: 400 },
      );
    }

    const margen = margenDesdeCostos(ticket!, mercancia, {
      costoLogistico: logistico,
      costoPlataforma: plataforma,
      costoFulfillment: fulfillment,
      pctRecaudo: recaudo!,
    });

    const fila = {
      nombre,
      periodo: body.periodo?.trim() || periodoActual(),
      inversion_publicidad: inversion,
      part_publicidad: part,
      ticket_promedio: ticket,
      margen_bruto: margen,
      tasa_despacho: despacho,
      tasa_entrega: entrega,
      costos_fijos_mes: fijos,
      costo_mercancia: mercancia,
      costo_logistico: logistico,
      costo_plataforma: plataforma,
      costo_fulfillment: fulfillment,
      pct_recaudo: recaudo,
      creado_por: usuario.email ?? null,
    };

    const supabase = createAdminSupabaseClient();

    // Con id se edita ese escenario. Sin id se busca por nombre: si ya
    // existe se actualiza, porque dos escenarios con el mismo nombre son
    // un error de dedo, no una intencion.
    //
    // Se resuelve con una consulta explicita y NO con upsert(onConflict):
    // el indice unico es sobre `lower(nombre)` —para que "Agosto" y
    // "agosto" sean el mismo— y Postgres no empareja un ON CONFLICT por
    // columna con un indice sobre una expresion. Eso fallaba con
    // "there is no unique or exclusion constraint matching the ON CONFLICT
    // specification".
    let idDestino = body.id ?? null;

    if (!idDestino) {
      // `%` y `_` son comodines en LIKE: sin escaparlos, un escenario
      // llamado "Agosto 50%" coincidiria con cualquier otro que empiece
      // igual y terminaria sobrescribiendo el equivocado.
      const patron = nombre.replace(/[\\%_]/g, (c) => `\\${c}`);
      const { data: existente } = await supabase
        .from("proyecciones")
        .select("id")
        .ilike("nombre", patron)
        .maybeSingle();
      idDestino = existente?.id ?? null;
    }

    const { data, error } = idDestino
      ? await supabase
          .from("proyecciones")
          .update(fila)
          .eq("id", idDestino)
          .select("id")
          .single()
      : await supabase
          .from("proyecciones")
          .insert(fila)
          .select("id")
          .single();

    if (error) {
      return NextResponse.json(
        { error: "No se pudo guardar: " + error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, id: data?.id, margenBruto: margen });
  } catch (error) {
    console.error("Error al guardar la proyeccion:", error);
    return NextResponse.json({ error: "No se pudo guardar." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const usuario = await getAdminUser();
    if (!usuario) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Falta 'id'." }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();
    const { error } = await supabase.from("proyecciones").delete().eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "No se pudo borrar: " + error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al borrar la proyeccion:", error);
    return NextResponse.json({ error: "No se pudo borrar." }, { status: 500 });
  }
}

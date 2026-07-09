import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient, getAdminUser } from "@diana-mile/shared/supabase/server";
import type { Gasto } from "@diana-mile/shared/types";

const TIPOS_VALIDOS = [
  "publicidad_meta",
  "publicidad_tiktok",
  "publicidad_google",
  "publicidad_otro",
  "plataformas",
  "logistica",
  "producto",
  "nomina",
  "operativo",
  "otro",
];

const MONEDAS_VALIDAS = ["COP", "USD"];

export async function GET(request: NextRequest) {
  try {
    if (!(await getAdminUser())) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get("tipo");
    const periodo = searchParams.get("periodo");

    const supabase = createAdminSupabaseClient();

    let query = supabase.from("gastos").select("*").order("fecha", { ascending: false });

    if (tipo) {
      query = query.eq("tipo", tipo);
    }
    if (periodo) {
      query = query.eq("periodo", periodo);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: "No se pudieron obtener los gastos.", detalle: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ gastos: (data ?? []) as Gasto[] }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error inesperado al obtener los gastos.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAdminUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const {
      tipo,
      descripcion,
      monto,
      moneda,
      tasa_cambio,
      fecha,
      plataforma,
      campana,
      pedido_id,
      comprobante_url,
      notas,
    } = body as {
      tipo?: string;
      descripcion?: string;
      monto?: number;
      moneda?: "COP" | "USD";
      tasa_cambio?: number;
      fecha?: string;
      plataforma?: string;
      campana?: string;
      pedido_id?: string;
      comprobante_url?: string;
      notas?: string;
    };

    if (!tipo || !TIPOS_VALIDOS.includes(tipo)) {
      return NextResponse.json(
        { error: `Tipo invalido. Valores permitidos: ${TIPOS_VALIDOS.join(", ")}.` },
        { status: 400 }
      );
    }
    if (!descripcion || !descripcion.trim()) {
      return NextResponse.json(
        { error: "El campo 'descripcion' es obligatorio." },
        { status: 400 }
      );
    }
    if (monto === undefined || monto === null || Number.isNaN(Number(monto))) {
      return NextResponse.json(
        { error: "El campo 'monto' es obligatorio y debe ser numerico." },
        { status: 400 }
      );
    }
    if (!moneda || !MONEDAS_VALIDAS.includes(moneda)) {
      return NextResponse.json(
        { error: `Moneda invalida. Valores permitidos: ${MONEDAS_VALIDAS.join(", ")}.` },
        { status: 400 }
      );
    }
    if (!fecha) {
      return NextResponse.json({ error: "El campo 'fecha' es obligatorio." }, { status: 400 });
    }

    const tasaCambioFinal = moneda === "USD" ? tasa_cambio ?? 1 : 1;
    const montoCop = moneda === "USD" ? monto * tasaCambioFinal : monto;
    const periodo = fecha.slice(0, 7);

    const supabase = createAdminSupabaseClient();

    const { data, error } = await supabase
      .from("gastos")
      .insert({
        tipo,
        descripcion: descripcion.trim(),
        monto,
        moneda,
        tasa_cambio: tasaCambioFinal,
        monto_cop: montoCop,
        fecha,
        periodo,
        pedido_id: pedido_id ?? null,
        comprobante_url: comprobante_url ?? null,
        plataforma: plataforma ?? null,
        campana: campana ?? null,
        registrado_por: user.email ?? null,
        notas: notas ?? null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "No se pudo registrar el gasto.", detalle: error.message },
        { status: 500 }
      );
    }

    await supabase.from("actividad_log").insert({
      usuario_id: user.id,
      usuario_email: user.email,
      accion: "gasto_registrado",
      entidad: "gasto",
      entidad_id: data.id,
      datos_anteriores: null,
      datos_nuevos: data,
    });

    return NextResponse.json({ gasto: data as Gasto }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error inesperado al registrar el gasto.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSupabaseClient,
  getAdminUser,
} from "@diana-mile/shared/supabase/server";
import { ETAPAS, type EtapaLead } from "@diana-mile/shared/crm/scoring";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * Mueve un lead de etapa, lo asigna o le agrega una nota.
 *
 * Hasta ahora NO existia forma de editar un lead desde el panel: solo se podia
 * convertirlo en pedido. Sin esto, el tablero seria de solo lectura y el
 * embudo lo seguiria moviendo unicamente el agente.
 *
 * Cada cambio queda en `lead_actividades`: un pipeline sin historial no deja
 * aprender por que se pierden las ventas.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const usuario = await getAdminUser();
    if (!usuario) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { etapa, motivo_perdida, asignado_a, nota, valor_estimado } =
      body ?? {};

    const supabase = createAdminSupabaseClient();

    const { data: actual, error: errorLectura } = await supabase
      .from("leads")
      .select("id, etapa, nombre")
      .eq("id", id)
      .maybeSingle();

    if (errorLectura || !actual) {
      return NextResponse.json({ error: "Lead no encontrado." }, { status: 404 });
    }

    const cambios: Record<string, unknown> = {};

    if (etapa !== undefined) {
      if (!ETAPAS.includes(etapa as EtapaLead)) {
        return NextResponse.json(
          { error: `Etapa invalida. Validas: ${ETAPAS.join(", ")}.` },
          { status: 400 },
        );
      }
      // El motivo no es burocracia: es el unico dato que dice si se pierde por
      // precio, por cobertura o por producto. La base tambien lo exige, pero
      // aca el mensaje de error se puede leer.
      if (etapa === "perdido" && !String(motivo_perdida ?? "").trim()) {
        return NextResponse.json(
          { error: "Para marcar un lead como perdido hay que decir por que." },
          { status: 400 },
        );
      }
      cambios.etapa = etapa;
      if (etapa === "perdido") cambios.motivo_perdida = String(motivo_perdida).trim();
      // Salir de "perdido" limpia el motivo: dejarlo colgando confunde.
      if (etapa !== "perdido" && actual.etapa === "perdido") {
        cambios.motivo_perdida = null;
      }
    }

    if (asignado_a !== undefined) cambios.asignado_a = asignado_a || null;
    if (valor_estimado !== undefined) {
      const n = Number(valor_estimado);
      cambios.valor_estimado = Number.isFinite(n) && n > 0 ? n : null;
    }

    if (Object.keys(cambios).length > 0) {
      const { error } = await supabase.from("leads").update(cambios).eq("id", id);
      if (error) {
        return NextResponse.json(
          { error: "No se pudo actualizar el lead.", detalle: error.message },
          { status: 500 },
        );
      }
    }

    const actividades: Record<string, unknown>[] = [];
    if (etapa !== undefined && etapa !== actual.etapa) {
      actividades.push({
        lead_id: id,
        tipo: "cambio_etapa",
        detalle:
          `${actual.etapa} → ${etapa}` +
          (etapa === "perdido" ? ` · ${String(motivo_perdida).trim()}` : ""),
        creado_por: usuario.email ?? "admin",
      });
    }
    if (String(nota ?? "").trim()) {
      actividades.push({
        lead_id: id,
        tipo: "nota",
        detalle: String(nota).trim(),
        creado_por: usuario.email ?? "admin",
      });
    }
    if (actividades.length) {
      await supabase.from("lead_actividades").insert(actividades);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "No se pudo actualizar el lead.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

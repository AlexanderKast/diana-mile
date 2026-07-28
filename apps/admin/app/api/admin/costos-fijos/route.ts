import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSupabaseClient,
  getAdminUser,
} from "@diana-mile/shared/supabase/server";

const CATEGORIAS = ["personal", "plataformas", "administrativo"] as const;
type Categoria = (typeof CATEGORIAS)[number];

/** Alta de un costo fijo mensual. */
export async function POST(request: NextRequest) {
  try {
    const usuario = await getAdminUser();
    if (!usuario) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      concepto?: string;
      categoria?: string;
      montoCop?: number;
      notas?: string;
    };

    const concepto = body.concepto?.trim();
    if (!concepto) {
      return NextResponse.json({ error: "Falta el concepto." }, { status: 400 });
    }

    if (!CATEGORIAS.includes(body.categoria as Categoria)) {
      return NextResponse.json(
        { error: `La categoría tiene que ser una de: ${CATEGORIAS.join(", ")}.` },
        { status: 400 },
      );
    }

    const monto = Number(body.montoCop);
    if (!Number.isFinite(monto) || monto < 0) {
      return NextResponse.json(
        { error: "El monto tiene que ser un número mayor o igual a cero." },
        { status: 400 },
      );
    }

    const supabase = createAdminSupabaseClient();
    const { error } = await supabase.from("costos_fijos").insert({
      concepto,
      categoria: body.categoria as Categoria,
      monto_cop: monto,
      notas: body.notas?.trim() || null,
      registrado_por: usuario.email ?? null,
    });

    if (error) {
      return NextResponse.json(
        { error: "No se pudo guardar: " + error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al crear el costo fijo:", error);
    return NextResponse.json({ error: "No se pudo guardar." }, { status: 500 });
  }
}

/**
 * Edita un costo fijo o lo da de baja.
 *
 * Dar de baja NO borra la fila: le pone fecha de fin. Si se borrara, los
 * meses anteriores dejarian de cuadrar — la utilidad de marzo se
 * recalcularia sin el sueldo que si se pago en marzo.
 */
export async function PATCH(request: NextRequest) {
  try {
    const usuario = await getAdminUser();
    if (!usuario) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      id?: string;
      darDeBaja?: boolean;
      concepto?: string;
      montoCop?: number;
    };

    if (!body.id) {
      return NextResponse.json({ error: "Falta 'id'." }, { status: 400 });
    }

    const cambios: Record<string, unknown> = {};

    if (body.darDeBaja) {
      cambios.vigente_hasta = new Date().toISOString().slice(0, 10);
    }

    if (body.concepto !== undefined) {
      const concepto = body.concepto.trim();
      if (!concepto) {
        return NextResponse.json(
          { error: "El concepto no puede quedar vacío." },
          { status: 400 },
        );
      }
      cambios.concepto = concepto;
    }

    if (body.montoCop !== undefined) {
      const monto = Number(body.montoCop);
      if (!Number.isFinite(monto) || monto < 0) {
        return NextResponse.json(
          { error: "El monto tiene que ser un número mayor o igual a cero." },
          { status: 400 },
        );
      }
      cambios.monto_cop = monto;
    }

    if (Object.keys(cambios).length === 0) {
      return NextResponse.json({ error: "No hay nada que cambiar." }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();
    const { error } = await supabase
      .from("costos_fijos")
      .update(cambios)
      .eq("id", body.id);

    if (error) {
      return NextResponse.json(
        { error: "No se pudo guardar: " + error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al editar el costo fijo:", error);
    return NextResponse.json({ error: "No se pudo guardar." }, { status: 500 });
  }
}

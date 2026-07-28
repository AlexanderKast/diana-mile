import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSupabaseClient,
  getAdminUser,
} from "@diana-mile/shared/supabase/server";
import { usdACop, fechaDeCobro, hoyISO } from "@diana-mile/shared/finanzas/trm";
import { periodoActual } from "@/lib/financiero";

const CATEGORIAS = ["personal", "plataformas", "administrativo"] as const;
type Categoria = (typeof CATEGORIAS)[number];

/**
 * Alta de un costo fijo mensual, en pesos o en dolares.
 *
 * En dolares se guarda `monto_origen` (lo que de verdad se paga) y se
 * calcula `monto_cop` con la TRM del dia de cobro de ESTE mes, como
 * valor de arranque. El calculo de cada mes vuelve a convertir con la TRM
 * de su propio dia de cobro; guardar solo pesos dejaria el costo
 * congelado al dolar del dia que se registro.
 */
export async function POST(request: NextRequest) {
  try {
    const usuario = await getAdminUser();
    if (!usuario) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      concepto?: string;
      categoria?: string;
      moneda?: string;
      montoOrigen?: number;
      /** Compatibilidad con el formulario anterior, que solo mandaba pesos. */
      montoCop?: number;
      diaCobro?: number | null;
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

    const moneda = body.moneda === "USD" ? "USD" : "COP";
    const monto = Number(body.montoOrigen ?? body.montoCop);
    if (!Number.isFinite(monto) || monto < 0) {
      return NextResponse.json(
        { error: "El monto tiene que ser un número mayor o igual a cero." },
        { status: 400 },
      );
    }

    let diaCobro: number | null = null;
    let montoCop = monto;

    if (moneda === "USD") {
      const dia = Number(body.diaCobro);
      // Se topa en 28 para que la fecha exista en febrero.
      diaCobro = Number.isFinite(dia) && dia >= 1 && dia <= 28 ? dia : 1;

      const fecha = fechaDeCobro(periodoActual(), diaCobro);
      const convertido = await usdACop(monto, fecha);

      if (!convertido) {
        // Sin TRM no se guarda un numero inventado: un costo convertido
        // con una tasa equivocada es indistinguible de uno correcto.
        return NextResponse.json(
          {
            error:
              "No se pudo consultar la TRM para convertir el monto. Intenta de nuevo en un momento, o regístralo en pesos.",
          },
          { status: 503 },
        );
      }
      montoCop = convertido.cop;
    }

    const supabase = createAdminSupabaseClient();
    const { error } = await supabase.from("costos_fijos").insert({
      concepto,
      categoria: body.categoria as Categoria,
      moneda,
      monto_origen: monto,
      monto_cop: montoCop,
      dia_cobro: diaCobro,
      notas: body.notas?.trim() || null,
      registrado_por: usuario.email ?? null,
    });

    if (error) {
      return NextResponse.json(
        { error: "No se pudo guardar: " + error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, montoCop });
  } catch (error) {
    console.error("Error al crear el costo fijo:", error);
    return NextResponse.json({ error: "No se pudo guardar." }, { status: 500 });
  }
}

/**
 * Edita un costo fijo, registra lo que cobro el banco, o lo da de baja.
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
      montoOrigen?: number;
      montoCop?: number;
      montoCopReal?: number | null;
    };

    if (!body.id) {
      return NextResponse.json({ error: "Falta 'id'." }, { status: 400 });
    }

    const cambios: Record<string, unknown> = {};

    if (body.darDeBaja) {
      cambios.vigente_hasta = hoyISO();
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

    if (body.montoOrigen !== undefined || body.montoCop !== undefined) {
      const monto = Number(body.montoOrigen ?? body.montoCop);
      if (!Number.isFinite(monto) || monto < 0) {
        return NextResponse.json(
          { error: "El monto tiene que ser un número mayor o igual a cero." },
          { status: 400 },
        );
      }
      cambios.monto_origen = monto;
    }

    // `null` borra el valor del extracto y devuelve la fila a convertirse
    // por TRM. Es una accion legitima, no un campo faltante.
    if (body.montoCopReal !== undefined) {
      if (body.montoCopReal === null) {
        cambios.monto_cop_real = null;
      } else {
        const real = Number(body.montoCopReal);
        if (!Number.isFinite(real) || real < 0) {
          return NextResponse.json(
            { error: "El monto del extracto tiene que ser un número mayor o igual a cero." },
            { status: 400 },
          );
        }
        cambios.monto_cop_real = real;
      }
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

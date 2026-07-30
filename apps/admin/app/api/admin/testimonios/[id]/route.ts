import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSupabaseClient,
  getAdminUser,
} from "@diana-mile/shared/supabase/server";

type RouteParams = { params: Promise<{ id: string }> };

const ESTADOS = new Set(["pendiente", "aprobado", "rechazado"]);

/**
 * Modera un testimonio: corregir el texto, completar nombre y ciudad,
 * marcar el consentimiento y aprobarlo o rechazarlo.
 *
 * Aprobar exige consentimiento. Se valida aqui y no solo en la pantalla:
 * el boton deshabilitado es una comodidad, esto es la regla.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    if (!(await getAdminUser())) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const cambios: Record<string, unknown> = {};

    if (body?.texto !== undefined) {
      const texto = String(body.texto).trim();
      if (!texto) {
        return NextResponse.json(
          { error: "El texto no puede quedar vacio." },
          { status: 400 },
        );
      }
      cambios.texto = texto;
    }
    if (body?.nombre !== undefined) {
      cambios.nombre = String(body.nombre).trim().slice(0, 120) || null;
    }
    if (body?.ciudad !== undefined) {
      cambios.ciudad = String(body.ciudad).trim().slice(0, 120) || null;
    }
    if (body?.consentimiento !== undefined) {
      cambios.consentimiento = Boolean(body.consentimiento);
    }
    if (body?.estado !== undefined) {
      if (!ESTADOS.has(body.estado)) {
        return NextResponse.json({ error: "Estado invalido." }, { status: 400 });
      }
      cambios.estado = body.estado;
    }

    if (Object.keys(cambios).length === 0) {
      return NextResponse.json({ error: "Nada que cambiar." }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();

    if (cambios.estado === "aprobado") {
      // El consentimiento puede venir en este mismo PATCH o estar ya
      // guardado; vale cualquiera de los dos, pero alguno tiene que haber.
      let autorizado = cambios.consentimiento === true;
      if (!autorizado) {
        const { data: actual } = await supabase
          .from("testimonios")
          .select("consentimiento")
          .eq("id", id)
          .maybeSingle();
        autorizado = actual?.consentimiento === true;
      }
      if (!autorizado) {
        return NextResponse.json(
          {
            error:
              "No se puede aprobar un testimonio sin que la clienta haya autorizado publicarlo.",
          },
          { status: 400 },
        );
      }
    }

    const { data, error } = await supabase
      .from("testimonios")
      .update(cambios)
      .eq("id", id)
      .select(
        "id, pedido_id, telefono, producto_handle, texto, nombre, ciudad, estado, consentimiento, solicitado_at, created_at",
      )
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) {
      return NextResponse.json(
        { error: "Testimonio no encontrado." },
        { status: 404 },
      );
    }

    return NextResponse.json({ testimonio: data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "No se pudo actualizar el testimonio.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    if (!(await getAdminUser())) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase.from("testimonios").delete().eq("id", id);

    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "No se pudo borrar el testimonio.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@diana-mile/shared/supabase/server";
import type { CollectionLandingContent } from "@diana-mile/shared/types";
import {
  guardarLandingCategoria,
  obtenerCategoria,
} from "@/lib/shopify-catalogo";

type RouteParams = { params: Promise<{ handle: string }> };

function validarLandingContent(
  body: unknown,
): body is CollectionLandingContent {
  return Boolean(body) && typeof body === "object" && !Array.isArray(body);
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    if (!(await getAdminUser())) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { handle } = await params;
    const categoria = await obtenerCategoria(handle);
    if (!categoria) {
      return NextResponse.json(
        { error: "Categoria no encontrada en Shopify." },
        { status: 404 },
      );
    }

    return NextResponse.json({ categoria }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "No se pudo obtener la categoria.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    if (!(await getAdminUser())) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { handle } = await params;
    const body = await request.json();

    if (!validarLandingContent(body)) {
      return NextResponse.json(
        { error: "El contenido de la landing tiene un formato invalido." },
        { status: 400 },
      );
    }

    const categoria = await obtenerCategoria(handle);
    if (!categoria) {
      return NextResponse.json(
        { error: "Categoria no encontrada en Shopify." },
        { status: 404 },
      );
    }

    await guardarLandingCategoria(categoria.id, body);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "No se pudo guardar la landing de la categoria.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

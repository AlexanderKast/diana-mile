import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@diana-mile/shared/supabase/server";
import type {
  LandingBenefitIcon,
  ProductLandingContent,
} from "@diana-mile/shared/types";
import {
  guardarLandingProducto,
  obtenerProducto,
} from "@/lib/shopify-catalogo";

type RouteParams = { params: Promise<{ handle: string }> };

const ICONOS_VALIDOS: LandingBenefitIcon[] = [
  "gota",
  "mineral",
  "hoja",
  "sol",
  "escudo",
  "planeta",
];

function validarLandingContent(body: unknown): body is ProductLandingContent {
  if (!body || typeof body !== "object" || Array.isArray(body)) return false;
  const content = body as ProductLandingContent;
  if (content.benefits) {
    if (!Array.isArray(content.benefits)) return false;
    for (const b of content.benefits) {
      if (!ICONOS_VALIDOS.includes(b.icon)) return false;
    }
  }
  return true;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    if (!(await getAdminUser())) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { handle } = await params;
    const producto = await obtenerProducto(handle);
    if (!producto) {
      return NextResponse.json(
        { error: "Producto no encontrado en Shopify." },
        { status: 404 },
      );
    }

    return NextResponse.json({ producto }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "No se pudo obtener el producto.",
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

    const producto = await obtenerProducto(handle);
    if (!producto) {
      return NextResponse.json(
        { error: "Producto no encontrado en Shopify." },
        { status: 404 },
      );
    }

    await guardarLandingProducto(producto.id, body);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "No se pudo guardar la landing del producto.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

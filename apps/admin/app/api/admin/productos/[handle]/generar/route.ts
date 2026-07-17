import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@diana-mile/shared/supabase/server";
import { generateProductLandingContent } from "@diana-mile/shared/landing-ai";
import { obtenerProducto } from "@/lib/shopify-catalogo";

type RouteParams = { params: Promise<{ handle: string }> };

/**
 * Genera contenido de landing con IA y lo devuelve SIN escribirlo en
 * Shopify — el admin lo carga en el formulario del constructor para que se
 * revise y se guarde de forma explicita (PUT /api/admin/productos/[handle]).
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    if (!(await getAdminUser())) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Falta configurar MISTRAL_API_KEY en este entorno." },
        { status: 503 },
      );
    }

    const { handle } = await params;
    const body = await request.json().catch(() => ({}));
    const brief =
      typeof body?.brief === "string" && body.brief.trim()
        ? body.brief.trim()
        : null;

    const producto = await obtenerProducto(handle);
    if (!producto) {
      return NextResponse.json(
        { error: "Producto no encontrado en Shopify." },
        { status: 404 },
      );
    }

    const content = await generateProductLandingContent(
      {
        title: producto.title,
        description: producto.description,
        productType: producto.productType,
        tags: producto.tags,
      },
      {
        apiKey,
        model: process.env.LANDING_MODEL || undefined,
        brief,
      },
    );

    return NextResponse.json({ content }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "No se pudo generar la landing con IA.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@diana-mile/shared/supabase/server";
import { generateCollectionLandingContent } from "@diana-mile/shared/landing-ai";
import { obtenerCategoria } from "@/lib/shopify-catalogo";

type RouteParams = { params: Promise<{ handle: string }> };

/**
 * Genera contenido de landing con IA y lo devuelve SIN escribirlo en
 * Shopify — el admin lo carga en el formulario del constructor para que se
 * revise y se guarde de forma explicita (PUT /api/admin/categorias/[handle]).
 */
export async function POST(_request: NextRequest, { params }: RouteParams) {
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
    const categoria = await obtenerCategoria(handle);
    if (!categoria) {
      return NextResponse.json(
        { error: "Categoria no encontrada en Shopify." },
        { status: 404 },
      );
    }

    const content = await generateCollectionLandingContent(
      {
        title: categoria.title,
        description: categoria.description,
        productCount: categoria.productosCount,
      },
      {
        apiKey,
        model: process.env.LANDING_MODEL || undefined,
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

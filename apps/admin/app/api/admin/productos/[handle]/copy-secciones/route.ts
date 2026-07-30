import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@diana-mile/shared/supabase/server";
import {
  generateCopySecciones,
  TIPOS_SECCION_MAGICA,
} from "@diana-mile/shared/landing-ai";
import { obtenerProducto } from "@/lib/shopify-catalogo";

type RouteParams = { params: Promise<{ handle: string }> };

const TIPOS_VALIDOS = new Set(
  (TIPOS_SECCION_MAGICA as { tipo: string }[]).map((s) => s.tipo),
);

function formatearCOP(precio: string): string {
  const numero = Math.round(parseFloat(precio));
  if (!Number.isFinite(numero)) return precio;
  return `$${numero.toLocaleString("es-CO")}`;
}

/**
 * Paso "copy" de Landing magica: Mistral escribe el texto EXACTO que ira
 * dentro de cada seccion-imagen. No genera imagenes ni guarda nada — el
 * admin revisa y corrige el copy antes de gastar generaciones de imagen.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    if (!(await getAdminUser())) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Falta MISTRAL_API_KEY en el servidor." },
        { status: 503 },
      );
    }

    const { handle } = await params;
    const body = await request.json().catch(() => ({}));
    const brief = typeof body?.brief === "string" ? body.brief : null;
    const secciones: string[] = Array.isArray(body?.secciones)
      ? body.secciones.filter((s: unknown) => TIPOS_VALIDOS.has(String(s)))
      : [];

    if (secciones.length === 0) {
      return NextResponse.json(
        { error: "Selecciona al menos una seccion valida." },
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

    // Cifras REALES inyectadas al prompt: el modelo tiene prohibido inventar.
    const precios = producto.variantes
      .filter((v) => v.price)
      .map((v) => `- ${v.title}: ${formatearCOP(v.price!)}`)
      .join("\n");

    const resultado = await generateCopySecciones(
      {
        title: producto.title,
        description: producto.description,
        productType: producto.productType,
        tags: producto.tags,
      },
      { apiKey, brief, secciones, precios: precios || null },
    );

    return NextResponse.json({ secciones: resultado.secciones ?? [] }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "No se pudo generar el copy de las secciones.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

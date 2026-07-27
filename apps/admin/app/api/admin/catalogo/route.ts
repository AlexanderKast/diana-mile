import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@diana-mile/shared/supabase/server";
import {
  guardarCodDisponible,
  isShopifyCatalogoConfigurado,
  listarProductosNuskin,
} from "@/lib/shopify-catalogo";

/**
 * Estado contraentrega del catalogo Nu Skin.
 *
 * La escritura pasa siempre por aqui, nunca desde el navegador: el token de
 * la Admin API de Shopify vive solo en el servidor. El gate de sesion y rol
 * lo aplica proxy.ts sobre /api/admin/**; getAdminUser() lo vuelve a
 * comprobar dentro del handler siguiendo el patron del resto de rutas.
 */

export async function GET() {
  try {
    if (!(await getAdminUser())) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    if (!isShopifyCatalogoConfigurado) {
      return NextResponse.json(
        { configurado: false, productos: [] },
        { status: 200 },
      );
    }

    const productos = await listarProductosNuskin();
    return NextResponse.json({ configurado: true, productos }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "No se pudo obtener el catalogo Nu Skin.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!(await getAdminUser())) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const { productId, codDisponible } = body ?? {};

    if (typeof productId !== "string" || !productId.startsWith("gid://")) {
      return NextResponse.json(
        { error: "productId invalido." },
        { status: 400 },
      );
    }

    if (typeof codDisponible !== "boolean") {
      return NextResponse.json(
        { error: "codDisponible debe ser true o false." },
        { status: 400 },
      );
    }

    await guardarCodDisponible(productId, codDisponible);

    return NextResponse.json({ ok: true, codDisponible }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "No se pudo cambiar el estado de contraentrega.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

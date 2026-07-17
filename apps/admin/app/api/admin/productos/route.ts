import { NextResponse } from "next/server";
import { getAdminUser } from "@diana-mile/shared/supabase/server";
import {
  isShopifyCatalogoConfigurado,
  listarProductos,
} from "@/lib/shopify-catalogo";

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

    const productos = await listarProductos();
    return NextResponse.json({ configurado: true, productos }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "No se pudieron obtener los productos de Shopify.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

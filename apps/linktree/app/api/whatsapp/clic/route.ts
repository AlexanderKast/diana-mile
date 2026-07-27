import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import { clicDesdeCuerpo, registrarClic } from "@diana-mile/shared/whatsapp/clics";

/** Mismo registro de clic que la tienda; ver apps/shop para el porque. */
export async function POST(request: NextRequest) {
  try {
    const datos = clicDesdeCuerpo(await request.json());
    if (datos) {
      await registrarClic(createAdminSupabaseClient(), {
        ...datos,
        origen: datos.origen ?? "linktree",
      });
    }
  } catch (err) {
    console.warn("[wa-clic] cuerpo invalido:", err);
  }
  return new NextResponse(null, { status: 204 });
}

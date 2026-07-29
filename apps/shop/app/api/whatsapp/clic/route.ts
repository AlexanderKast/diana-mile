import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import { clicDesdeCuerpo, registrarClic } from "@diana-mile/shared/whatsapp/clics";
import { leerVarianteCookie } from "@/lib/atribucion";

/**
 * Recibe el clic al boton de WhatsApp justo antes de que la persona se
 * vaya del sitio.
 *
 * Siempre responde 204, incluso si algo sale mal: llega por sendBeacon
 * desde una pestana que se esta yendo, nadie va a leer la respuesta, y un
 * error aqui no puede estropearle nada a quien solo quiere escribir.
 */
export async function POST(request: NextRequest) {
  try {
    const datos = clicDesdeCuerpo(await request.json());
    if (datos) {
      await registrarClic(createAdminSupabaseClient(), {
        ...datos,
        origen: datos.origen ?? "shop",
        landingVariante: leerVarianteCookie(request),
      });
    }
  } catch (err) {
    console.warn("[wa-clic] cuerpo invalido:", err);
  }
  return new NextResponse(null, { status: 204 });
}

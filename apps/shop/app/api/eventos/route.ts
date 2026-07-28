import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";

/**
 * Registra eventos del sitio que no dejan rastro en ninguna otra tabla.
 *
 * El primero es la instalacion como app: el banner sabia si ya estaba
 * instalada, pero nadie anotaba cuando alguien la instalaba, asi que no
 * habia forma de saber si empujarla servia de algo.
 *
 * Solo se aceptan tipos conocidos: es un endpoint publico y sin lista
 * blanca cualquiera podria llenar la tabla de basura.
 */

const TIPOS = new Set([
  "instalacion",
  "notificaciones_activadas",
  "apertura_app",
]);

export async function POST(request: NextRequest) {
  try {
    const { tipo, ruta, plataforma } = (await request.json()) as {
      tipo?: string;
      ruta?: string;
      plataforma?: string;
    };

    if (!tipo || !TIPOS.has(tipo)) {
      return new NextResponse(null, { status: 204 });
    }

    await createAdminSupabaseClient()
      .from("eventos_app")
      .insert({
        tipo,
        ruta: ruta?.slice(0, 300) ?? null,
        plataforma: plataforma?.slice(0, 60) ?? null,
      });
  } catch (err) {
    console.warn("[eventos] no se pudo registrar:", err);
  }

  // Siempre 204: llega por sendBeacon desde una pestana que puede estar
  // cerrandose, y nadie lee la respuesta.
  return new NextResponse(null, { status: 204 });
}

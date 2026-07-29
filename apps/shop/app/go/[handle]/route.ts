import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import { getLandingVariante } from "@/lib/landing-variantes-server";
import { COOKIE_ATRIB, COOKIE_VARIANTE } from "@/lib/atribucion";

// La rotacion depende de cookies y de un contador en Supabase: jamas cachear.
export const dynamic = "force-dynamic";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

function corto(valor: string | null): string | undefined {
  const limpio = valor?.trim().slice(0, 200);
  return limpio || undefined;
}

/**
 * Link rotador para pauta: /go/<handle-del-producto>?utm_...&fbclid=...
 *
 * Es el UNICO link que va en los anuncios. Reparte visitantes round-robin
 * entre las variantes activas del producto (RPC rotar_landing, contador
 * atomico) y redirige 302 a /l/<slug> conservando toda la query, para que
 * pixel, CAPI y derivarFuente sigan viendo fbclid/utm intactos.
 *
 * Nunca da error hacia el anuncio: sin variantes activas o con Supabase
 * caido, cae a la PDP publica /productos/<handle>.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> },
) {
  const { handle } = await params;
  const search = request.nextUrl.search;

  let slugElegido: string | null = null;

  // Sticky primero: si ya vio una variante de ESTE producto y sigue activa,
  // repetirla. Coherencia para la visitante y medicion sin contaminar.
  const slugCookie = request.cookies.get(COOKIE_VARIANTE)?.value;
  if (slugCookie) {
    const previa = await getLandingVariante(slugCookie);
    if (
      previa &&
      previa.producto_handle === handle &&
      previa.estado === "activa"
    ) {
      slugElegido = previa.slug;
    }
  }

  if (!slugElegido) {
    try {
      const supabase = createAdminSupabaseClient();
      const { data, error } = await supabase.rpc("rotar_landing", {
        p_handle: handle,
      });
      if (!error && typeof data === "string" && data) {
        slugElegido = data;
      }
    } catch (error) {
      console.error("[go] error rotando landing:", error);
    }
  }

  const destino = new URL(
    slugElegido ? `/l/${slugElegido}${search}` : `/productos/${handle}${search}`,
    request.url,
  );

  const response = NextResponse.redirect(destino, 302);

  if (slugElegido) {
    const opciones = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    };

    response.cookies.set(COOKIE_VARIANTE, slugElegido, opciones);

    const query = request.nextUrl.searchParams;
    const atrib = {
      us: corto(query.get("utm_source")),
      um: corto(query.get("utm_medium")),
      uc: corto(query.get("utm_campaign")),
      uco: corto(query.get("utm_content")),
    };
    if (Object.values(atrib).some(Boolean)) {
      response.cookies.set(COOKIE_ATRIB, JSON.stringify(atrib), opciones);
    }
  }

  return response;
}

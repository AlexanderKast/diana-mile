import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSupabaseClient,
  createServerSupabaseClient,
} from "@diana-mile/shared/supabase/server";

/**
 * Confirmacion del link magico del panel pre-venta (/mi-plan).
 *
 * `signInWithOtp` en /api/acceso corre en flujo PKCE (mismo cliente
 * @supabase/ssr que /cuenta/login) y deja una cookie "code_verifier" en el
 * navegador. Este handler recibe el "?code=" que trae el link del correo,
 * lo canjea con `exchangeCodeForSession` usando ESE MISMO cliente
 * cookie-aware (para que encuentre el code_verifier) y asi crea la sesion
 * — esta es la sesion que apps/shop/proxy.ts exige para /mi-plan/**.
 *
 * Tambien es el unico punto donde se puede marcar `usuarios_plan.ultimo_acceso`:
 * es el momento exacto en que la persona confirma que el email es suyo.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = request.nextUrl.searchParams.get("next") || "/mi-plan";

  if (!code) {
    return NextResponse.redirect(new URL("/acceso", request.url));
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    console.error("[auth/callback] no se pudo confirmar el link magico:", error?.message);
    const url = new URL("/acceso", request.url);
    url.searchParams.set("error", "link_invalido");
    return NextResponse.redirect(url);
  }

  const email = data.session.user.email;
  if (email) {
    const admin = createAdminSupabaseClient();
    const { error: errorUpdate } = await admin
      .from("usuarios_plan")
      .update({ ultimo_acceso: new Date().toISOString() })
      .eq("email", email.toLowerCase());

    if (errorUpdate) {
      // No bloquea el acceso: la sesion ya es valida, el timestamp es
      // informativo, no una condicion de entrada.
      console.error("[auth/callback] no se pudo actualizar ultimo_acceso:", errorUpdate.message);
    }
  }

  return NextResponse.redirect(new URL(next, request.url));
}

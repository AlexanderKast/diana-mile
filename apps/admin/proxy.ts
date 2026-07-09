import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { rolesPermitidos, rolesPermitidosApi } from "@/lib/nav";
import type { RolUsuario } from "@diana-mile/shared/types";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isRoot = pathname === "/";
  const isDashboardRoute = pathname.startsWith("/dashboard");
  // Los webhooks de Shopify no traen sesion de Supabase — se autentican con
  // su propia firma HMAC dentro del route handler, no con esta cookie.
  const isAdminApiRoute = pathname.startsWith("/api/admin") && !pathname.startsWith("/api/admin/webhooks");

  if (isRoot) {
    const url = request.nextUrl.clone();
    url.pathname = user ? "/dashboard" : "/login";
    return NextResponse.redirect(url);
  }

  if (!user && isDashboardRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (!user && isAdminApiRoute) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  if (user && (isDashboardRoute || isAdminApiRoute)) {
    const admin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const { data: rolRow } = await admin
      .from("usuario_roles")
      .select("rol")
      .eq("user_id", user.id)
      .maybeSingle();
    // Sin fila en usuario_roles = sin rol asignado. Nunca se asume un rol
    // con privilegios (antes caia a "admin" por defecto) — se deniega.
    const rol = (rolRow?.rol ?? null) as RolUsuario | null;

    if (isAdminApiRoute) {
      const permitidos = rolesPermitidosApi(pathname);
      if (!rol || !permitidos.includes(rol)) {
        return NextResponse.json({ error: "No autorizado para este recurso." }, { status: 403 });
      }
    } else if (isDashboardRoute && pathname !== "/dashboard") {
      const permitidos = rolesPermitidos(pathname);
      if (permitidos && (!rol || !permitidos.includes(rol))) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/api/admin/:path*"],
};

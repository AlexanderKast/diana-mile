import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refresca la sesion de Supabase (cookies) y protege /cuenta/**. Los server
 * components no pueden escribir cookies — sin este proxy el refresh token
 * nunca se persiste y la sesion muere en ~1h (mismo motivo que
 * apps/admin/proxy.ts). Matcher acotado a /cuenta: cero impacto en
 * home/checkout, que siguen 100% anonimos.
 */
/**
 * Redirige SIN perder las cookies que Supabase acaba de rotar.
 *
 * `NextResponse.redirect()` crea una respuesta nueva y vacia: las cookies
 * que el cliente de Supabase escribio en `response` durante `getUser()` no
 * viajan con ella. Sin copiarlas, el navegador se queda con el refresh
 * token viejo —ya rotado e invalido—, la siguiente peticion no encuentra
 * sesion y rebota de vuelta al login. Ese ping-pong entre /cuenta y
 * /cuenta/login es lo que el navegador corta con ERR_TOO_MANY_REDIRECTS.
 */
function redirigirConservandoSesion(
  url: URL,
  response: NextResponse,
): NextResponse {
  const redireccion = NextResponse.redirect(url);
  for (const cookie of response.cookies.getAll()) {
    redireccion.cookies.set(cookie);
  }
  return redireccion;
}

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

  /**
   * Vale la sesion solo si trae telefono, igual que getClienteUser().
   *
   * Las paginas de /cuenta piden sesion CON telefono —es por ahi por donde
   * encuentran los pedidos— y este proxy pedia solo sesion. Con una sesion
   * sin telefono los dos se contradecian sin fin: el proxy dejaba entrar a
   * /cuenta, la pagina rebotaba al login, el proxy veia sesion y devolvia a
   * /cuenta. Eso es el ERR_TOO_MANY_REDIRECTS.
   *
   * Supabase devuelve "" y no null cuando no hay telefono, asi que no vale
   * comprobar solo si existe la propiedad.
   */
  const sesionValida = Boolean(user?.phone?.trim());

  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === "/cuenta/login";

  if (!sesionValida && !isLoginRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/cuenta/login";
    url.searchParams.set("next", pathname);
    return redirigirConservandoSesion(url, response);
  }

  if (sesionValida && isLoginRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/cuenta";
    url.search = "";
    return redirigirConservandoSesion(url, response);
  }

  return response;
}

export const config = {
  matcher: ["/cuenta/:path*"],
};

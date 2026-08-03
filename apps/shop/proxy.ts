import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { NOMBRE_COOKIE_MI_PLAN, verifyMiPlanToken } from "@/lib/mi-plan-token";

/**
 * Refresca la sesion de Supabase (cookies) y protege /cuenta/** y
 * /mi-plan/**. Los server components no pueden escribir cookies — sin
 * este proxy el refresh token nunca se persiste y la sesion muere en ~1h
 * (mismo motivo que apps/admin/proxy.ts). Matcher acotado a esas dos
 * zonas: cero impacto en home/checkout, que siguen 100% anonimos.
 *
 * Son DOS gates distintos con la MISMA sesion de Supabase Auth de base
 * (un solo proxy.ts puede existir en el proyecto):
 *
 *   - /cuenta/**: clientas que YA COMPRARON, login por OTP de WhatsApp.
 *     Una sesion solo cuenta si trae telefono (ver `sesionValida` mas
 *     abajo) — es como getClienteUser() la valida tambien.
 *   - /mi-plan/**: panel pre-venta del funnel de quiz, login por link
 *     magico de Supabase Auth (email, sin password, sin OTP). Aca CUALQUIER
 *     sesion valida basta — no tiene sentido exigir telefono en una cuenta
 *     que se creo solo con email. Sin sesion, redirige a /acceso (nunca a
 *     /cuenta/login: son gates independientes).
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

/**
 * Cookie de identidad anonima del funnel (ver migracion
 * 20260755000000_visitante_funnel.sql): un UUID por navegador, 1 año.
 * Con ella /api/quiz/** liga todas las respuestas de la misma persona
 * entre puertas — y /test/[puerta] puede saltarle preguntas ya
 * respondidas. Se emite aca porque un Server Component no puede escribir
 * cookies en Next.
 */
const COOKIE_VISITANTE = "ml_visitante";
const UN_ANO_SEGUNDOS = 60 * 60 * 24 * 365;

export async function proxy(request: NextRequest) {
  const { pathname: rutaActual } = request.nextUrl;

  // Rutas del funnel: solo emision de cookie de visitante, sin tocar la
  // sesion de Supabase (estas pantallas son anonimas por diseño y el gate
  // de /cuenta de mas abajo las redirigiria al login por error).
  if (
    rutaActual.startsWith("/test") ||
    rutaActual.startsWith("/resultado") ||
    rutaActual.startsWith("/acceso")
  ) {
    const respuestaFunnel = NextResponse.next({ request });
    if (!request.cookies.get(COOKIE_VISITANTE)) {
      respuestaFunnel.cookies.set(COOKIE_VISITANTE, crypto.randomUUID(), {
        maxAge: UN_ANO_SEGUNDOS,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
    }
    return respuestaFunnel;
  }

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

  // Gate de /mi-plan: sesion de Supabase Auth (link magico confirmado) O la
  // cookie propia que /api/acceso emite al toque, sin esperar esa
  // confirmacion — ver lib/mi-plan-token.ts para el porque. Cualquiera de
  // las dos alcanza; no se exige telefono (a diferencia de /cuenta abajo).
  if (pathname.startsWith("/mi-plan")) {
    const tieneCookiePropia = Boolean(
      verifyMiPlanToken(request.cookies.get(NOMBRE_COOKIE_MI_PLAN)?.value ?? ""),
    );

    if (!user && !tieneCookiePropia) {
      const url = request.nextUrl.clone();
      url.pathname = "/acceso";
      return redirigirConservandoSesion(url, response);
    }
    return response;
  }

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
  matcher: [
    "/cuenta/:path*",
    "/mi-plan/:path*",
    "/test/:path*",
    "/resultado/:path*",
    "/acceso/:path*",
    "/acceso",
  ],
};

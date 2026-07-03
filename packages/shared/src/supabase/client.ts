import { createBrowserClient } from "@supabase/ssr";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Cliente anon sin manejo de cookies. Usar en Server Components para leer
 * datos publicos (tabla `config`) donde no se necesita sesion de usuario.
 */
export function createPublicClient() {
  return createSupabaseJsClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

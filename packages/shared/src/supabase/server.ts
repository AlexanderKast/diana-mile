import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Se llama desde un Server Component sin permiso de escritura; el middleware refresca la sesion.
          }
        },
      },
    },
  );
}

export function createAdminSupabaseClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

/**
 * Verifica sesion admin en API routes (app/api/admin/**) y en app/(admin)/layout.tsx.
 * NEXT_PUBLIC_SUPABASE_ANON_KEY es publica: cualquiera puede auto-registrarse
 * contra Supabase Auth sin pasar por nuestra UI. Por eso no basta con "hay
 * usuario logueado" — hay que confirmar que ese user_id esta en la tabla
 * "admins" (solo legible con service_role, un usuario autenticado normal
 * nunca puede insertarse ahi mismo).
 */
export async function getAdminUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const admin = createAdminSupabaseClient();
  const { data } = await admin
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return data !== null ? user : null;
}

export async function requireAdminSession(): Promise<boolean> {
  return (await getAdminUser()) !== null;
}

/**
 * Sesion de cliente final (area /cuenta del shop, login por OTP a telefono).
 * A diferencia de getAdminUser(), cualquier sesion valida de Supabase Auth
 * ya es un "cliente" legitimo — la verificacion OTP en si misma es el
 * control de acceso, no hace falta una tabla whitelist como "admins".
 * Supabase guarda user.phone SIN "+" (ej. "573001234567"); pedidos.telefono
 * esta en E.164 CON "+" — de ahi la normalizacion aqui.
 */
export async function getClienteUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.phone) return null;

  return { user, telefono: `+${user.phone}` };
}

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
              cookieStore.set(name, value, options)
            );
          } catch {
            // Se llama desde un Server Component sin permiso de escritura; el middleware refresca la sesion.
          }
        },
      },
    }
  );
}

export function createAdminSupabaseClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
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

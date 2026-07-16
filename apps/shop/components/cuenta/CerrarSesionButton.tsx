"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@diana-mile/shared/supabase/client";

export function CerrarSesionButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/cuenta/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="text-xs text-ceniza underline"
    >
      Cerrar sesión
    </button>
  );
}

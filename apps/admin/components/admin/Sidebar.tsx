"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cx } from "@diana-mile/shared/utils";
import { createClient } from "@diana-mile/shared/supabase/client";
import type { RolUsuario } from "@diana-mile/shared/types";
import { useSession } from "@/lib/session";
import { NAV_GRUPOS } from "@/lib/nav";

const ROL_LABELS: Record<RolUsuario, string> = {
  superadmin: "Superadmin",
  admin: "Admin",
  confirmador: "Confirmador",
  logistica: "Logística",
  financiero: "Financiero",
  readonly: "Solo lectura",
};

function NavLinks({
  pathname,
  rol,
  onNavigate,
}: {
  pathname: string;
  rol: RolUsuario;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-4 overflow-y-auto">
      {NAV_GRUPOS.map((grupo) => {
        const items = grupo.items.filter((item) => item.roles.includes(rol));
        if (items.length === 0) return null;
        return (
          <div key={grupo.titulo}>
            <p className="px-4 mb-1 text-[10px] uppercase tracking-widest text-ceniza/70">{grupo.titulo}</p>
            <div className="flex flex-col gap-1">
              {items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cx(
                      "px-4 py-3 min-h-[44px] flex items-center text-sm tracking-wide border-l-2 transition-colors",
                      active
                        ? "border-dorado bg-carbon-suave text-blanco"
                        : "border-transparent text-ceniza hover:text-blanco hover:bg-carbon-suave"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const session = useSession();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error al cerrar sesion:", error.message);
    }
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
        className="fixed top-4 left-4 z-50 md:hidden flex items-center justify-center h-11 w-11 rounded-[2px] bg-carbon text-blanco"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="2" y1="5" x2="18" y2="5" strokeLinecap="round" />
          <line x1="2" y1="10" x2="18" y2="10" strokeLinecap="round" />
          <line x1="2" y1="15" x2="18" y2="15" strokeLinecap="round" />
        </svg>
      </button>

      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-56 bg-carbon text-blanco flex-col p-6">
        <span className="font-display text-2xl mb-8">Milito Life Shop</span>
        <NavLinks pathname={pathname} rol={session.rol} />
        <div className="mt-auto pt-4 border-t border-carbon-suave">
          <p className="px-4 text-sm text-blanco truncate">{session.nombre}</p>
          <p className="px-4 text-xs text-dorado mb-2">{ROL_LABELS[session.rol]}</p>
          <button
            type="button"
            onClick={handleLogout}
            className="text-left px-4 py-3 min-h-[44px] text-sm text-ceniza hover:text-blanco transition-colors"
          >
            Cerrar sesion
          </button>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-carbon/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside className="fixed left-0 top-0 h-screen w-56 bg-carbon text-blanco flex flex-col p-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-8">
              <span className="font-display text-2xl">Milito Life Shop</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar menu"
                className="flex items-center justify-center h-11 w-11 text-blanco"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="4" y1="4" x2="16" y2="16" strokeLinecap="round" />
                  <line x1="16" y1="4" x2="4" y2="16" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <NavLinks pathname={pathname} rol={session.rol} onNavigate={() => setOpen(false)} />
            <div className="mt-auto pt-4 border-t border-carbon-suave">
              <p className="px-4 text-sm text-blanco truncate">{session.nombre}</p>
              <p className="px-4 text-xs text-dorado mb-2">{ROL_LABELS[session.rol]}</p>
              <button
                type="button"
                onClick={handleLogout}
                className="text-left px-4 py-3 min-h-[44px] text-sm text-ceniza hover:text-blanco transition-colors"
              >
                Cerrar sesion
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

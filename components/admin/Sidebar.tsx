"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cx } from "@/lib/utils";
import { createClient } from "@/lib/supabase";

const LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Pedidos", href: "/dashboard/pedidos" },
  { label: "Leads", href: "/dashboard/leads" },
  { label: "Configuracion", href: "/dashboard/configuracion" },
];

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={cx(
              "px-4 py-3 min-h-[44px] flex items-center text-sm tracking-wide border-l-2 transition-colors",
              active
                ? "border-dorado bg-carbon-suave text-blanco"
                : "border-transparent text-ceniza hover:text-blanco hover:bg-carbon-suave"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
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
      {/* Boton hamburguesa movil */}
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

      {/* Sidebar desktop */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-56 bg-carbon text-blanco flex-col p-6">
        <span className="font-display text-2xl mb-10">Milito Life Shop</span>
        <NavLinks pathname={pathname} />
        <button
          type="button"
          onClick={handleLogout}
          className="mt-auto text-left px-4 py-3 min-h-[44px] text-sm text-ceniza hover:text-blanco transition-colors"
        >
          Cerrar sesion
        </button>
      </aside>

      {/* Drawer movil */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-carbon/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside className="fixed left-0 top-0 h-screen w-56 bg-carbon text-blanco flex flex-col p-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-10">
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
            <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
            <button
              type="button"
              onClick={handleLogout}
              className="mt-auto text-left px-4 py-3 min-h-[44px] text-sm text-ceniza hover:text-blanco transition-colors"
            >
              Cerrar sesion
            </button>
          </aside>
        </div>
      )}
    </>
  );
}

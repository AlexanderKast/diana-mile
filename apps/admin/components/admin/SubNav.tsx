"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@diana-mile/shared/utils";
import type { RolUsuario } from "@diana-mile/shared/types";
import { SECCIONES, seccionDe, rolesPermitidos } from "@/lib/nav";
import { useSession } from "@/lib/session";

/**
 * Las pestañas de la seccion en la que estas.
 *
 * Es lo que permite que la barra lateral baje de 18 entradas a 7 sin esconder
 * nada: lo que antes era un enlace suelto ahora es una pestaña al lado de sus
 * hermanas, que es donde de verdad se busca.
 *
 * Solo pinta las pestañas que el rol puede abrir. Un confirmador no ve
 * "Aprendizaje" aunque este en su misma seccion — mostrar una pestaña que
 * rebota al entrar es peor que no mostrarla.
 */
export function SubNav() {
  const pathname = usePathname() ?? "";
  const { rol } = useSession();
  const seccion = seccionDe(pathname);
  if (!seccion) return null;

  const tabs = (SECCIONES[seccion] ?? []).filter((t) => {
    const permitidos = rolesPermitidos(t.href);
    return !permitidos || permitidos.includes(rol as RolUsuario);
  });

  // Una sola pestaña no es una navegacion, es ruido.
  if (tabs.length < 2) return null;

  return (
    <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-arena">
      {tabs.map((t) => {
        const activa = pathname === t.href || pathname.startsWith(`${t.href}/`);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cx(
              "whitespace-nowrap border-b-2 px-3 py-2 text-sm transition-colors",
              activa
                ? "border-morado font-medium text-carbon"
                : "border-transparent text-ceniza hover:text-carbon-suave",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}

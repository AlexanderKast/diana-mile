import type { RolUsuario } from "@diana-mile/shared/types";

export type NavItem = {
  label: string;
  href: string;
  roles: RolUsuario[];
};

export type NavGroup = {
  titulo: string;
  items: NavItem[];
};

const TODOS: RolUsuario[] = [
  "superadmin",
  "admin",
  "confirmador",
  "logistica",
  "financiero",
  "readonly",
];

export const NAV_GRUPOS: NavGroup[] = [
  {
    titulo: "Operaciones",
    items: [
      { label: "Dashboard", href: "/dashboard", roles: TODOS },
      {
        label: "Pedidos",
        href: "/dashboard/pedidos",
        roles: ["superadmin", "admin"],
      },
      {
        label: "Leads",
        href: "/dashboard/leads",
        roles: ["superadmin", "admin"],
      },
      {
        label: "Confirmación",
        href: "/dashboard/confirmacion",
        roles: ["superadmin", "admin", "confirmador"],
      },
      {
        label: "Logística",
        href: "/dashboard/logistica",
        roles: ["superadmin", "admin", "logistica"],
      },
    ],
  },
  {
    titulo: "Análisis",
    items: [
      {
        label: "Financiero",
        href: "/dashboard/financiero",
        roles: ["superadmin", "admin", "financiero"],
      },
      {
        label: "Transportadoras",
        href: "/dashboard/transportadoras",
        roles: ["superadmin", "admin", "logistica", "financiero"],
      },
      {
        label: "Reportes",
        href: "/dashboard/reportes",
        roles: ["superadmin", "admin", "financiero"],
      },
    ],
  },
  {
    titulo: "Gestión",
    items: [
      { label: "Usuarios", href: "/dashboard/usuarios", roles: ["superadmin"] },
      {
        label: "Configuración",
        href: "/dashboard/configuracion",
        roles: ["superadmin", "admin"],
      },
      {
        label: "Contenido premium",
        href: "/dashboard/contenidos",
        roles: ["superadmin", "admin"],
      },
    ],
  },
];

export function rolesPermitidos(pathname: string): RolUsuario[] | null {
  for (const grupo of NAV_GRUPOS) {
    for (const item of grupo.items) {
      if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
        return item.roles;
      }
    }
  }
  return null;
}

/**
 * Gate de rol para /api/admin/**. Reglas mas especificas primero (por
 * sufijo de accion), luego por prefijo de recurso, y un default fail-closed
 * (superadmin/admin) para cualquier ruta admin no listada explicitamente —
 * nunca "sin restriccion" por defecto.
 */
const API_REGLAS: {
  test: (pathname: string) => boolean;
  roles: RolUsuario[];
}[] = [
  {
    test: (p) => p.endsWith("/confirmar"),
    roles: ["superadmin", "admin", "confirmador"],
  },
  {
    test: (p) => p.endsWith("/envio") || p.endsWith("/entrega"),
    roles: ["superadmin", "admin", "logistica"],
  },
  { test: (p) => p.startsWith("/api/admin/usuarios"), roles: ["superadmin"] },
  {
    test: (p) =>
      p.startsWith("/api/admin/gastos") ||
      p.startsWith("/api/admin/financiero"),
    roles: ["superadmin", "admin", "financiero"],
  },
  {
    test: (p) => p.startsWith("/api/admin/transportadoras"),
    roles: ["superadmin", "admin", "logistica", "financiero"],
  },
  {
    test: (p) => p.startsWith("/api/admin/reportes"),
    roles: ["superadmin", "admin", "financiero"],
  },
  {
    test: (p) => p.startsWith("/api/admin/config"),
    roles: ["superadmin", "admin"],
  },
  {
    test: (p) =>
      p.startsWith("/api/admin/orders") || p.startsWith("/api/admin/leads"),
    roles: ["superadmin", "admin"],
  },
];

const API_DEFAULT: RolUsuario[] = ["superadmin", "admin"];

export function rolesPermitidosApi(pathname: string): RolUsuario[] {
  const regla = API_REGLAS.find((r) => r.test(pathname));
  return regla ? regla.roles : API_DEFAULT;
}

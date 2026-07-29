import type { RolUsuario } from "@diana-mile/shared/types";

export type NavItem = {
  label: string;
  href: string;
  roles: RolUsuario[];
  /**
   * No sale en la barra lateral, pero SIGUE en esta lista.
   *
   * Es importante: `rolesPermitidos()` recorre estas mismas entradas y
   * devuelve `null` para lo que no encuentra — y `null` significa "sin
   * restriccion". Borrar una pagina de aqui para simplificar el menu le
   * quitaria el control de rol sin que nadie se entere. Se oculta, no se
   * quita.
   */
  oculto?: boolean;
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

const ADMIN: RolUsuario[] = ["superadmin", "admin"];
const CON_CHAT: RolUsuario[] = ["superadmin", "admin", "confirmador"];
const FINANZAS: RolUsuario[] = ["superadmin", "admin", "financiero"];

/**
 * La navegacion, agrupada por lo que se hace y no por como esta partido el
 * codigo.
 *
 * Antes eran 18 entradas planas: habia que leerlas todas para encontrar una,
 * y varias son vistas del MISMO dato — pedidos, confirmacion y logistica son
 * el mismo pedido en tres momentos. Ahora son 7 secciones visibles y el resto
 * vive como pestaña dentro de la suya.
 *
 * Ninguna URL cambio: los enlaces guardados y los que ya estaban en uso
 * siguen funcionando igual.
 */
export const NAV_GRUPOS: NavGroup[] = [
  {
    titulo: "Día a día",
    items: [
      { label: "Dashboard", href: "/dashboard", roles: TODOS },
      // Quedo fuera del menu en la consolidacion, y eso ademas la dejaba
      // SIN gate de rol: lo que no esta en esta lista resuelve a null =
      // sin restriccion.
      { label: "Métricas", href: "/dashboard/metricas", roles: FINANZAS },
      { label: "Pipeline", href: "/dashboard/pipeline", roles: ADMIN },
      { label: "Pedidos", href: "/dashboard/pedidos", roles: ADMIN },
      { label: "WhatsApp", href: "/dashboard/conversaciones", roles: CON_CHAT },

      // Dentro de Pipeline
      { label: "Leads", href: "/dashboard/leads", roles: ADMIN, oculto: true },
      // Dentro de Pedidos
      { label: "Confirmación", href: "/dashboard/confirmacion", roles: CON_CHAT, oculto: true },
      { label: "Logística", href: "/dashboard/logistica", roles: ["superadmin", "admin", "logistica"], oculto: true },
      // Dentro de WhatsApp
      { label: "Actividad", href: "/dashboard/whatsapp", roles: CON_CHAT, oculto: true },
      { label: "Aprendizaje", href: "/dashboard/whatsapp/aprendizaje", roles: ADMIN, oculto: true },
    ],
  },
  {
    titulo: "Negocio",
    items: [
      { label: "Catálogo", href: "/dashboard/catalogo", roles: ADMIN },
      { label: "Finanzas", href: "/dashboard/financiero", roles: FINANZAS },

      // Dentro de Catálogo
      { label: "Landings", href: "/dashboard/productos", roles: ADMIN, oculto: true },
      { label: "Rotador de landings", href: "/dashboard/landings", roles: ADMIN, oculto: true },
      // Dentro de Finanzas
      { label: "Costos", href: "/dashboard/financiero/costos", roles: FINANZAS, oculto: true },
      { label: "Costos fijos", href: "/dashboard/financiero/costos-fijos", roles: FINANZAS, oculto: true },
      { label: "Proyección", href: "/dashboard/financiero/proyeccion", roles: FINANZAS, oculto: true },
      { label: "Gastos", href: "/dashboard/financiero/gastos", roles: FINANZAS, oculto: true },
      { label: "Transportadoras", href: "/dashboard/transportadoras", roles: ["superadmin", "admin", "logistica", "financiero"], oculto: true },
      { label: "Reportes", href: "/dashboard/reportes", roles: FINANZAS, oculto: true },
    ],
  },
  {
    titulo: "Ajustes",
    items: [
      { label: "Configuración", href: "/dashboard/configuracion", roles: ADMIN },

      { label: "Usuarios", href: "/dashboard/usuarios", roles: ["superadmin"], oculto: true },
      { label: "Contenido premium", href: "/dashboard/contenidos", roles: ADMIN, oculto: true },
      // Las alertas se llegan por la campana de la barra, no por el menu.
      // Financiero entra porque casi todas hablan de plata.
      { label: "Alertas", href: "/dashboard/notificaciones", roles: FINANZAS, oculto: true },
      { label: "Push a clientas", href: "/dashboard/notificaciones/push", roles: ADMIN, oculto: true },
    ],
  },
];

/** Todas las entradas, visibles y ocultas. */
export const NAV_ITEMS: NavItem[] = NAV_GRUPOS.flatMap((g) => g.items);

/** Las pestañas de cada seccion. La principal va primero. */
export const SECCIONES: Record<string, { href: string; label: string }[]> = {
  pipeline: [
    { href: "/dashboard/pipeline", label: "Embudo" },
    { href: "/dashboard/leads", label: "Leads" },
  ],
  pedidos: [
    { href: "/dashboard/pedidos", label: "Todos" },
    { href: "/dashboard/confirmacion", label: "Confirmación" },
    { href: "/dashboard/logistica", label: "Logística" },
  ],
  whatsapp: [
    { href: "/dashboard/conversaciones", label: "Conversaciones" },
    { href: "/dashboard/whatsapp", label: "Actividad" },
    { href: "/dashboard/whatsapp/aprendizaje", label: "Aprendizaje" },
  ],
  catalogo: [
    { href: "/dashboard/catalogo", label: "Productos" },
    { href: "/dashboard/productos", label: "Landings" },
    { href: "/dashboard/landings", label: "Rotador" },
  ],
  finanzas: [
    { href: "/dashboard/financiero", label: "Resumen" },
    { href: "/dashboard/financiero/costos", label: "Costos" },
    { href: "/dashboard/financiero/costos-fijos", label: "Costos fijos" },
    { href: "/dashboard/financiero/proyeccion", label: "Proyección" },
    { href: "/dashboard/financiero/gastos", label: "Gastos" },
    { href: "/dashboard/transportadoras", label: "Transportadoras" },
    { href: "/dashboard/reportes", label: "Reportes" },
  ],
  ajustes: [
    { href: "/dashboard/configuracion", label: "General" },
    { href: "/dashboard/usuarios", label: "Usuarios" },
    { href: "/dashboard/contenidos", label: "Contenido premium" },
  ],
  // Notificaciones NO va tambien en `ajustes`: si una ruta cayera en dos
  // secciones, `seccionDe()` resolveria por el href mas largo y las
  // pestañas cambiarian segun cual gane. Vive en una sola.
  alertas: [
    { href: "/dashboard/notificaciones", label: "Alertas" },
    { href: "/dashboard/notificaciones/push", label: "Push a clientas" },
  ],
};

/**
 * A que seccion pertenece una ruta.
 *
 * Se compara del href mas largo al mas corto: si no,
 * /dashboard/whatsapp/aprendizaje caeria en la seccion de /dashboard/whatsapp
 * y las pestañas marcarian la equivocada.
 */
export function seccionDe(pathname: string): string | null {
  let mejor: { seccion: string; largo: number } | null = null;
  for (const [seccion, tabs] of Object.entries(SECCIONES)) {
    for (const t of tabs) {
      if (pathname === t.href || pathname.startsWith(`${t.href}/`)) {
        if (!mejor || t.href.length > mejor.largo) {
          mejor = { seccion, largo: t.href.length };
        }
      }
    }
  }
  return mejor?.seccion ?? null;
}

export function rolesPermitidos(pathname: string): RolUsuario[] | null {
  // Del mas especifico al menos: /dashboard/whatsapp/aprendizaje es solo de
  // admin, pero /dashboard/whatsapp deja entrar a confirmador. Sin ordenar,
  // ganaria la regla mas laxa.
  const ordenados = [...NAV_ITEMS].sort((a, b) => b.href.length - a.href.length);
  for (const item of ordenados) {
    if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
      return item.roles;
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
  { test: (p) => p.endsWith("/confirmar"), roles: CON_CHAT },
  {
    test: (p) =>
      p.endsWith("/envio") || p.endsWith("/entrega") || p.endsWith("/consignacion"),
    roles: ["superadmin", "admin", "logistica"],
  },
  { test: (p) => p.startsWith("/api/admin/usuarios"), roles: ["superadmin"] },
  {
    // `/api/admin/costos-fijos` cae aqui igual que `/api/admin/costos`:
    // ambos empiezan por el mismo prefijo y llevan los mismos roles, asi
    // que no hace falta separarlos.
    test: (p) =>
      p.startsWith("/api/admin/gastos") ||
      p.startsWith("/api/admin/financiero") ||
      p.startsWith("/api/admin/costos") ||
      p.startsWith("/api/admin/proyecciones") ||
      p.startsWith("/api/admin/alertas"),
    roles: FINANZAS,
  },
  {
    test: (p) => p.startsWith("/api/admin/transportadoras"),
    roles: ["superadmin", "admin", "logistica", "financiero"],
  },
  { test: (p) => p.startsWith("/api/admin/reportes"), roles: FINANZAS },
  { test: (p) => p.startsWith("/api/admin/config"), roles: ADMIN },
  {
    test: (p) =>
      p.startsWith("/api/admin/productos") ||
      p.startsWith("/api/admin/categorias") ||
      p.startsWith("/api/admin/catalogo"),
    roles: ADMIN,
  },
  {
    test: (p) =>
      p.startsWith("/api/admin/orders") || p.startsWith("/api/admin/leads"),
    roles: ADMIN,
  },
  {
    // Quien confirma pedidos tambien atiende el chat: sin esto caeria al
    // default y no podria responderle a nadie.
    test: (p) =>
      p.startsWith("/api/admin/conversaciones") ||
      p.startsWith("/api/admin/whatsapp") ||
      p.startsWith("/api/admin/etiquetas"),
    roles: CON_CHAT,
  },
];

const API_DEFAULT: RolUsuario[] = ["superadmin", "admin"];

export function rolesPermitidosApi(pathname: string): RolUsuario[] {
  const regla = API_REGLAS.find((r) => r.test(pathname));
  return regla ? regla.roles : API_DEFAULT;
}

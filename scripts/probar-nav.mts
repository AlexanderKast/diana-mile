/**
 * Verifica los gates de rol y las pestañas del panel.
 *
 * Existe por dos trampas reales de este archivo:
 *
 * 1. `rolesPermitidos()` devuelve `null` para lo que no encuentra, y null
 *    significa SIN RESTRICCION. Sacar una pagina del menu para
 *    simplificarlo le quita el control de rol en silencio.
 *
 * 2. Las rutas se resuelven por prefijo. `/dashboard/financiero/costos` y
 *    `/dashboard/financiero/costos-fijos` comparten el suyo, y si el
 *    orden falla, la mas laxa se come a la mas estricta.
 *
 *   npx tsx scripts/probar-nav.mts
 */

import {
  NAV_ITEMS,
  SECCIONES,
  seccionDe,
  rolesPermitidos,
  rolesPermitidosApi,
} from "../apps/admin/lib/nav.ts";

let fallos = 0;
let corridos = 0;

function afirmar(nombre: string, condicion: boolean, detalle?: string) {
  corridos++;
  if (!condicion) {
    fallos++;
    console.log(`  ✗ ${nombre}${detalle ? `\n      ${detalle}` : ""}`);
  } else {
    console.log(`  ✓ ${nombre}`);
  }
}

// ══════════════════════════════════════════════════════════════
console.log("\n▸ Ninguna ruta del panel queda sin gate de rol\n");

for (const item of NAV_ITEMS) {
  const roles = rolesPermitidos(item.href);
  afirmar(
    item.href,
    roles !== null && roles.length > 0,
    roles === null ? "devolvió null = SIN RESTRICCIÓN" : "lista de roles vacía",
  );
}

// ══════════════════════════════════════════════════════════════
console.log("\n▸ Cada ruta resuelve a SU propia entrada, no a un prefijo\n");

for (const item of NAV_ITEMS) {
  const roles = rolesPermitidos(item.href);
  const iguales =
    roles !== null &&
    roles.length === item.roles.length &&
    roles.every((r) => item.roles.includes(r));
  afirmar(
    `${item.href} → [${item.roles.join(", ")}]`,
    iguales,
    `resolvió a [${roles?.join(", ") ?? "null"}]`,
  );
}

// ══════════════════════════════════════════════════════════════
console.log("\n▸ Rutas que comparten prefijo no se pisan\n");

const PARES: [string, string][] = [
  ["/dashboard/financiero/costos", "/dashboard/financiero/costos-fijos"],
  ["/dashboard/notificaciones", "/dashboard/notificaciones/push"],
  ["/dashboard/whatsapp", "/dashboard/whatsapp/aprendizaje"],
  ["/dashboard/financiero", "/dashboard/financiero/proyeccion"],
];

for (const [corta, larga] of PARES) {
  const rCorta = rolesPermitidos(corta);
  const rLarga = rolesPermitidos(larga);
  const itemLargo = NAV_ITEMS.find((i) => i.href === larga);

  afirmar(
    `${larga} no hereda de ${corta}`,
    itemLargo !== undefined &&
      rLarga !== null &&
      rLarga.length === itemLargo.roles.length &&
      rLarga.every((r) => itemLargo.roles.includes(r)),
    `larga resolvió a [${rLarga?.join(", ")}], corta a [${rCorta?.join(", ")}]`,
  );
}

// ══════════════════════════════════════════════════════════════
console.log("\n▸ /dashboard no se traga todo el panel\n");

afirmar(
  "/dashboard/financiero/costos NO resuelve como /dashboard",
  JSON.stringify(rolesPermitidos("/dashboard/financiero/costos")) !==
    JSON.stringify(rolesPermitidos("/dashboard")),
);

// ══════════════════════════════════════════════════════════════
console.log("\n▸ Las pestañas apuntan a páginas que existen y con gate\n");

for (const [seccion, tabs] of Object.entries(SECCIONES)) {
  for (const tab of tabs) {
    const enNav = NAV_ITEMS.some((i) => i.href === tab.href);
    afirmar(
      `${seccion} · ${tab.label} (${tab.href})`,
      enNav,
      "la pestaña apunta a una ruta que no está en NAV_ITEMS: quedaría sin gate de rol",
    );
  }
}

// ══════════════════════════════════════════════════════════════
console.log("\n▸ Ninguna ruta cae en dos secciones\n");

const enSecciones = new Map<string, string[]>();
for (const [seccion, tabs] of Object.entries(SECCIONES)) {
  for (const tab of tabs) {
    enSecciones.set(tab.href, [...(enSecciones.get(tab.href) ?? []), seccion]);
  }
}
for (const [href, secciones] of enSecciones) {
  afirmar(
    `${href} pertenece a una sola sección`,
    secciones.length === 1,
    `está en: ${secciones.join(", ")}`,
  );
}

// ══════════════════════════════════════════════════════════════
console.log("\n▸ seccionDe() elige la sección correcta\n");

const ESPERADO: [string, string | null][] = [
  ["/dashboard/financiero", "finanzas"],
  ["/dashboard/financiero/costos", "finanzas"],
  ["/dashboard/financiero/costos-fijos", "finanzas"],
  ["/dashboard/financiero/proyeccion", "finanzas"],
  ["/dashboard/notificaciones", "alertas"],
  ["/dashboard/notificaciones/push", "alertas"],
  ["/dashboard/whatsapp/aprendizaje", "whatsapp"],
  ["/dashboard/pipeline", "pipeline"],
  ["/dashboard", null],
];

for (const [ruta, esperado] of ESPERADO) {
  const real = seccionDe(ruta);
  afirmar(`${ruta} → ${esperado ?? "sin sección"}`, real === esperado, `dio ${real}`);
}

// ══════════════════════════════════════════════════════════════
console.log("\n▸ Las APIs nuevas tienen los roles que deben\n");

const API: [string, string[]][] = [
  ["/api/admin/costos", ["superadmin", "admin", "financiero"]],
  ["/api/admin/costos-fijos", ["superadmin", "admin", "financiero"]],
  ["/api/admin/alertas", ["superadmin", "admin", "financiero"]],
  ["/api/admin/proyecciones", ["superadmin", "admin", "financiero"]],
  ["/api/admin/usuarios", ["superadmin"]],
];

for (const [ruta, esperados] of API) {
  const roles = rolesPermitidosApi(ruta);
  const iguales =
    roles.length === esperados.length && roles.every((r) => esperados.includes(r));
  afirmar(`${ruta} → [${esperados.join(", ")}]`, iguales, `dio [${roles.join(", ")}]`);
}

console.log("\n  una API no listada cae al default cerrado, nunca a 'sin restricción'");
const inventada = rolesPermitidosApi("/api/admin/algo-que-nadie-listo");
afirmar(
  "ruta desconocida → solo superadmin/admin",
  inventada.length === 2 &&
    inventada.includes("superadmin") &&
    inventada.includes("admin"),
  `dio [${inventada.join(", ")}]`,
);

// ══════════════════════════════════════════════════════════════
console.log(
  `\n${"─".repeat(60)}\n${corridos - fallos}/${corridos} comprobaciones pasaron` +
    (fallos > 0 ? `  ·  ${fallos} FALLARON\n` : "\n"),
);

process.exit(fallos > 0 ? 1 : 0);

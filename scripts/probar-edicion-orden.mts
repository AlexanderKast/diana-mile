/**
 * Verifica de punta a punta que se puede sumar un producto a una orden ya
 * creada, que es lo que hace el adicional por WhatsApp.
 *
 * Crea una orden de prueba POR EL MISMO CAMINO QUE PRODUCCION (draft order
 * y completar, igual que /api/orders/complete), le suma un segundo producto
 * con la misma funcion que usa el agente, comprueba contra Shopify que
 * quedaron dos lineas y que el total cuadra, y la cancela al terminar.
 *
 * El camino importa: crear la orden directa por REST la deja con
 * taxes_included=false y entonces Shopify le suma IVA al adicional, cosa
 * que no pasa con las ordenes de verdad.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const env = join(ROOT, "apps/admin/.env.local");
if (existsSync(env)) {
  for (const linea of readFileSync(env, "utf8").split("\n")) {
    const l = linea.trim();
    if (!l || l.startsWith("#")) continue;
    const i = l.indexOf("=");
    if (i === -1) continue;
    const k = l.slice(0, i).trim();
    if (!(k in process.env)) {
      process.env[k] = l.slice(i + 1).trim().replace(/^"|"$/g, "");
    }
  }
}

const D = process.env.SHOPIFY_STORE_DOMAIN!;
const T = process.env.SHOPIFY_ADMIN_API_TOKEN!;
const V = "2026-04";
const H = { "Content-Type": "application/json", "X-Shopify-Access-Token": T };

/** El Storefront devuelve gid://shopify/ProductVariant/123; REST quiere el 123. */
const idNumerico = (gid: string) => Number(gid.split("/").pop());

const api = (ruta: string) => `https://${D}/admin/api/${V}/${ruta}`;

const { resolverVariante } = await import(
  "../packages/shared/src/botcake/ia/pedido.js"
);
const { agregarProductoAOrden } = await import("../apps/admin/lib/shopify.js");

const base = await resolverVariante("Epoch Polishing Bar");
const extra = await resolverVariante("MAQUINA DE AFEITAR");
if (!base || !extra) {
  console.error("No se pudieron resolver las variantes de prueba.");
  process.exit(1);
}
console.log(`Producto base: ${base.productoTitulo} — ${base.varianteTitulo} $${base.precio}`);
console.log(`Adicional:     ${extra.productoTitulo} $${extra.precio}`);

// ── 1. Orden de prueba, como en produccion ───────────────────────────────
const draft = await fetch(api("draft_orders.json"), {
  method: "POST",
  headers: H,
  body: JSON.stringify({
    draft_order: {
      line_items: [{ variant_id: idNumerico(base.variantId), quantity: 1 }],
      tags: "prueba-adicional",
      note: "Orden de prueba de la edicion. Se cancela al terminar.",
    },
  }),
});
if (!draft.ok) {
  console.error("No se pudo crear el draft:", draft.status, await draft.text());
  process.exit(1);
}
const draftId = (await draft.json()).draft_order.id;

const completar = await fetch(
  api(`draft_orders/${draftId}/complete.json?payment_pending=true`),
  { method: "PUT", headers: H },
);
if (!completar.ok) {
  console.error("No se pudo completar:", completar.status, await completar.text());
  process.exit(1);
}
const ordenId = (await completar.json()).draft_order.order_id;

const leerOrden = async () =>
  (
    await (
      await fetch(
        api(`orders/${ordenId}.json?fields=name,total_price,taxes_included,line_items`),
        { headers: H },
      )
    ).json()
  ).order;

const antes = await leerOrden();
console.log(
  `\nCreada ${antes.name} (id ${ordenId}) — total $${antes.total_price}, ` +
    `${antes.line_items.length} linea(s), taxes_included=${antes.taxes_included}`,
);

// ── 2. La edicion, con la funcion real del agente ────────────────────────
console.log("\nSumando el adicional...");
const res = await agregarProductoAOrden(String(ordenId), extra.variantId, 1);
console.log("agregarProductoAOrden ->", JSON.stringify(res));

// ── 3. Comprobar contra Shopify ──────────────────────────────────────────
const despues = await leerOrden();
console.log(`\nDespues: total $${despues.total_price}, ${despues.line_items.length} linea(s)`);
for (const li of despues.line_items) {
  console.log(
    `  · ${li.title.slice(0, 45)}${li.variant_title ? ` (${li.variant_title})` : ""} x${li.quantity} $${li.price}`,
  );
}

const esperado = base.precio + extra.precio;
const real = parseFloat(despues.total_price);
const dosLineas = despues.line_items.length === 2;
const totalCuadra = Math.abs(real - esperado) < 1;
const totalReportado = res.totalNuevo !== null && Math.abs(res.totalNuevo - real) < 1;

console.log(
  `\nEsperado $${esperado.toLocaleString("es-CO")} — Shopify dice $${real.toLocaleString("es-CO")}`,
);
console.log(`  linea agregada:           ${dosLineas ? "OK" : "FALLA"}`);
console.log(`  total cuadra con la suma: ${totalCuadra ? "OK" : "FALLA"}`);
console.log(`  total leido de vuelta:    ${totalReportado ? "OK" : "FALLA"}`);
console.log(`\n${dosLineas && totalCuadra && totalReportado ? "CORRECTO" : "REVISAR"}`);

// ── 4. Limpieza ──────────────────────────────────────────────────────────
const cancelar = await fetch(api(`orders/${ordenId}/cancel.json`), {
  method: "POST",
  headers: H,
  body: JSON.stringify({ reason: "other", email: false, restock: true }),
});
console.log(
  `Orden de prueba cancelada: ${cancelar.ok ? "si" : `NO (HTTP ${cancelar.status})`}`,
);

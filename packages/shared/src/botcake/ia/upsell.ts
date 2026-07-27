import type { SupabaseClient } from "@supabase/supabase-js";
import { resolverVariante } from "./pedido";
import { catalogoDatos } from "./contexto";

/**
 * El adicional que se ofrece justo despues de cerrar el pedido.
 *
 * Es el mejor momento para subir el ticket: la persona ya decidio comprar,
 * ya dio sus datos y ya acepto pagar contraentrega. La friccion de sumar
 * una cosa mas es casi cero comparada con la de empezar de nuevo.
 *
 * Dos decisiones que valen la pena explicar:
 *
 * · El pedido se crea EN CUANTO confirma, antes de ofrecer nada. Esperar
 *   la respuesta del adicional para crearlo suena mas limpio, pero cuando
 *   la persona se queda callada —que es lo mas comun— se pierde la venta
 *   entera. Si acepta, el adicional se le suma a la orden que ya existe.
 *
 * · Se ofrece UNA vez y no se insiste. Quien acaba de comprar y recibe
 *   presion para gastar mas se arrepiente de las dos cosas.
 */

/** Pasado este rato la oferta se da por muerta y un "si" ya no la revive. */
const VIGENCIA_MINUTOS = 60;

export type OfertaUpsell = {
  pedidoId: string;
  variantId: string;
  producto: string;
  precio: number;
};

function formatoPesos(valor: number): string {
  return Math.round(valor).toLocaleString("es-CO");
}

/**
 * Que ofrecerle a quien acaba de comprar X.
 *
 * Se busca otro producto de la tienda, no otra presentacion del mismo:
 * quien acaba de elegir su presentacion ya decidio cuanto queria, y
 * ofrecerle la de al lado se siente a que no le prestaron atencion. El
 * catalogo viene ordenado por mas vendidos, asi que el primero que no sea
 * el suyo es la apuesta con mejor conversion.
 */
export async function elegirAdicional(
  supabase: SupabaseClient,
  productoComprado: string,
): Promise<OfertaUpsell | null> {
  const catalogo = catalogoDatos();
  if (!catalogo?.titulos.length) return null;

  const comprado = productoComprado.trim().toLowerCase();
  const otros = catalogo.titulos.filter(
    (t) => t.trim().toLowerCase() !== comprado,
  );
  if (!otros.length) return null;

  // Si el equipo fijo cual quiere empujar, manda eso. Ellos saben que
  // combina bien con que mucho mejor que cualquier regla automatica.
  const { data } = await supabase
    .from("config")
    .select("valor")
    .eq("clave", "upsell_producto")
    .maybeSingle();

  const fijado = (data?.valor as string | undefined)?.trim();
  const preferido =
    fijado && fijado.toLowerCase() !== comprado
      ? otros.find((t) =>
          t.toLowerCase().includes(fijado.toLowerCase()),
        ) ?? fijado
      : null;

  // Las variantes se resuelven contra Shopify en el momento y no contra el
  // catalogo cacheado: ofrecer algo agotado es peor que no ofrecer nada.
  const variantes = (
    await Promise.all(
      (preferido ? [preferido] : otros).map((c) => resolverVariante(c)),
    )
  ).filter((v) => v !== null);

  // Sin producto fijado se ofrece el mas barato: un adicional se decide por
  // impulso, y cuanto menos suba el total menos se piensa. Empujar el mas
  // caro justo despues de cerrar hace que reconsidere la compra entera.
  const elegida = variantes.sort((a, b) => a.precio - b.precio)[0];
  if (!elegida) return null;

  const conNombre =
    elegida.varianteTitulo && elegida.varianteTitulo !== "Default Title"
      ? `${elegida.productoTitulo} — ${elegida.varianteTitulo}`
      : elegida.productoTitulo;

  return {
    pedidoId: "",
    variantId: elegida.variantId,
    producto: conNombre,
    precio: elegida.precio,
  };
}

/** El texto con que se ofrece. Corto: ya cerro, no hay que volver a vender. */
export function mensajeAdicional(oferta: OfertaUpsell): string {
  return `Ah, y aprovechando que ya va tu envio: ¿le sumamos ${oferta.producto} por $${formatoPesos(oferta.precio)}? Te llega en el mismo paquete y pagas todo junto al recibir.`;
}

export async function guardarOferta(
  supabase: SupabaseClient,
  conversacionId: string,
  oferta: OfertaUpsell,
): Promise<void> {
  await supabase
    .from("whatsapp_conversaciones")
    .update({
      upsell_pedido_id: oferta.pedidoId,
      upsell_variant_id: oferta.variantId,
      upsell_producto: oferta.producto,
      upsell_precio: oferta.precio,
      upsell_ofrecido_at: new Date().toISOString(),
    })
    .eq("id", conversacionId);
}

/** La oferta viva de esta conversacion, si todavia esta a tiempo. */
export async function ofertaPendiente(
  supabase: SupabaseClient,
  conversacionId: string,
): Promise<OfertaUpsell | null> {
  const { data } = await supabase
    .from("whatsapp_conversaciones")
    .select(
      "upsell_pedido_id, upsell_variant_id, upsell_producto, upsell_precio, upsell_ofrecido_at",
    )
    .eq("id", conversacionId)
    .maybeSingle();

  if (!data?.upsell_variant_id || !data.upsell_ofrecido_at) return null;

  const minutos =
    (Date.now() - new Date(data.upsell_ofrecido_at).getTime()) / 60_000;
  if (minutos > VIGENCIA_MINUTOS) {
    await limpiarOferta(supabase, conversacionId);
    return null;
  }

  return {
    pedidoId: data.upsell_pedido_id,
    variantId: data.upsell_variant_id,
    producto: data.upsell_producto ?? "el adicional",
    precio: Number(data.upsell_precio ?? 0),
  };
}

export async function limpiarOferta(
  supabase: SupabaseClient,
  conversacionId: string,
): Promise<void> {
  await supabase
    .from("whatsapp_conversaciones")
    .update({
      upsell_pedido_id: null,
      upsell_variant_id: null,
      upsell_producto: null,
      upsell_precio: null,
      upsell_ofrecido_at: null,
    })
    .eq("id", conversacionId);
}

async function anotar(
  supabase: SupabaseClient,
  datos: {
    pedidoId: string | null;
    telefono: string;
    producto: string;
    precio: number;
    resultado: "aceptado" | "rechazado" | "vencido" | "fallo";
    detalle?: string;
  },
): Promise<void> {
  await supabase.from("whatsapp_upsell_log").insert({
    pedido_id: datos.pedidoId,
    telefono: datos.telefono,
    producto: datos.producto,
    precio: datos.precio,
    resultado: datos.resultado,
    detalle: datos.detalle ?? null,
  });
}

/**
 * Suma el adicional a la orden que ya existe.
 *
 * El orden importa: primero Shopify, que es donde puede fallar, y solo si
 * eso sale bien se toca Supabase. Al reves quedaria un pedido diciendo que
 * cobra mas de lo que la orden real tiene, y el mensajero cobraria de mas.
 */
export async function aceptarAdicional(
  supabase: SupabaseClient,
  entrada: {
    conversacionId: string;
    telefono: string;
    oferta: OfertaUpsell;
    agregarAOrden: (
      variantId: string,
    ) => Promise<{ ok: boolean; totalNuevo: number | null }>;
  },
): Promise<{ ok: boolean; mensaje: string }> {
  const { oferta } = entrada;

  const { data: pedido } = await supabase
    .from("pedidos")
    .select("id, estado, shopify_order_id, precio_total, producto_nombre")
    .eq("id", oferta.pedidoId)
    .maybeSingle();

  await limpiarOferta(supabase, entrada.conversacionId);

  // Si ya salio de bodega no se le puede meter nada mas: el paquete esta
  // armado y el mensajero cobraria un valor que no coincide.
  if (!pedido || !["pendiente", "confirmado"].includes(pedido.estado)) {
    await anotar(supabase, {
      pedidoId: pedido?.id ?? null,
      telefono: entrada.telefono,
      producto: oferta.producto,
      precio: oferta.precio,
      resultado: "fallo",
      detalle: `pedido en estado "${pedido?.estado ?? "inexistente"}"`,
    });
    return {
      ok: false,
      mensaje:
        "Tu pedido ya esta alistado y no le puedo sumar nada mas. Si quieres te lo dejo listo en un pedido aparte, ¿te sirve?",
    };
  }

  const sumado = pedido.shopify_order_id
    ? await entrada.agregarAOrden(oferta.variantId)
    : { ok: false, totalNuevo: null };

  if (!sumado.ok) {
    await anotar(supabase, {
      pedidoId: pedido.id,
      telefono: entrada.telefono,
      producto: oferta.producto,
      precio: oferta.precio,
      resultado: "fallo",
      detalle: "Shopify no acepto la edicion",
    });
    return {
      ok: false,
      mensaje:
        "Dejame confirmarte si alcanzo a sumarlo a tu pedido y te aviso en un momentico.",
    };
  }

  // Manda el total que devuelve Shopify: es el que va en la orden y el que
  // el mensajero va a cobrar. La suma nuestra queda de respaldo por si la
  // lectura falla, pero no es la fuente de verdad.
  const nuevoTotal =
    sumado.totalNuevo ?? Number(pedido.precio_total ?? 0) + oferta.precio;
  await supabase
    .from("pedidos")
    .update({
      precio_total: nuevoTotal,
      producto_nombre: `${pedido.producto_nombre} + ${oferta.producto}`,
      updated_at: new Date().toISOString(),
    })
    .eq("id", pedido.id);

  await anotar(supabase, {
    pedidoId: pedido.id,
    telefono: entrada.telefono,
    producto: oferta.producto,
    precio: oferta.precio,
    resultado: "aceptado",
  });

  return {
    ok: true,
    mensaje: `Listo, ${oferta.producto} va en el mismo paquete. Tu total queda en *$${formatoPesos(nuevoTotal)}* al recibir.`,
  };
}

export async function rechazarAdicional(
  supabase: SupabaseClient,
  entrada: { conversacionId: string; telefono: string; oferta: OfertaUpsell },
): Promise<void> {
  await limpiarOferta(supabase, entrada.conversacionId);
  await anotar(supabase, {
    pedidoId: entrada.oferta.pedidoId || null,
    telefono: entrada.telefono,
    producto: entrada.oferta.producto,
    precio: entrada.oferta.precio,
    resultado: "rechazado",
  });
}

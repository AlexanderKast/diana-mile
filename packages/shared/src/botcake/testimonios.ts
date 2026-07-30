import type { SupabaseClient } from "@supabase/supabase-js";
import { encolarMensaje } from "./outbox";
import { PLANTILLAS } from "./plantillas";

/**
 * Recoleccion de testimonios reales.
 *
 * La tienda no puede inventarse resenas, asi que las pide: unos dias
 * despues de la entrega se le escribe a la clienta, se le pregunta como le
 * fue y se le pide permiso explicito para publicar lo que responda.
 *
 * Lo que llegue entra como `pendiente` y ahi se queda hasta que una
 * persona lo lea y lo apruebe. Nada de esto es automatico: ni el
 * consentimiento se deduce del texto, ni un testimonio se publica solo.
 */

/** Dias despues de la entrega antes de preguntar. */
const DIAS_TRAS_ENTREGA = 3;

/**
 * Ventana en la que una respuesta cuenta como testimonio. Pasada esta,
 * lo que escriba la clienta es una conversacion nueva y no la respuesta a
 * lo que se le pregunto.
 */
export const DIAS_VENTANA_RESPUESTA = 7;

/**
 * Le pregunta a una clienta como le fue y le pide permiso para publicarlo.
 *
 * Va por plantilla porque a los tres dias de la entrega la ventana de 24h
 * lleva rato cerrada y un texto libre no llegaria.
 */
export async function encolarSolicitudTestimonio(
  supabase: SupabaseClient,
  datos: {
    pedidoId: string;
    nombre: string | null;
    telefonoE164: string;
    producto: string;
  },
): Promise<void> {
  const plantilla = PLANTILLAS.solicitudTestimonio;
  // Sin plantilla aprobada no hay nada que mandar, y marcar el pedido como
  // "ya solicitado" lo quemaria para siempre sin haberle escrito.
  if (!plantilla.id) return;

  await encolarMensaje(supabase, {
    telefonoE164: datos.telefonoE164,
    tipo: "testimonio",
    plantilla,
    pedidoId: datos.pedidoId,
    variables: {
      "1": (datos.nombre ?? "Hola").split(/\s+/)[0],
      "2": datos.producto,
    },
  });

  await supabase
    .from("pedidos")
    .update({ testimonio_solicitado_at: new Date().toISOString() })
    .eq("id", datos.pedidoId);
}

type PedidoEntregado = {
  id: string;
  nombre: string | null;
  telefono: string;
  producto_nombre: string | null;
  fecha_entrega_real: string | null;
  updated_at: string | null;
};

/**
 * Cuando se entrego, de verdad.
 *
 * `fecha_entrega_real` es lo correcto, pero solo la tienen los pedidos que
 * pasaron por la pantalla de logistica. Para el resto, `updated_at` es lo
 * mas cercano que hay: el ultimo cambio de un pedido entregado es, casi
 * siempre, el que lo marco entregado.
 */
function fechaEntrega(pedido: PedidoEntregado): number | null {
  const crudo = pedido.fecha_entrega_real ?? pedido.updated_at;
  if (!crudo) return null;
  const t = new Date(crudo).getTime();
  return Number.isNaN(t) ? null : t;
}

/**
 * Pide testimonio a las entregas que ya cumplieron los dias. Para el cron.
 *
 * Solo una vez por pedido: `testimonio_solicitado_at` se marca aunque la
 * clienta nunca conteste. Insistir con esto no consigue mas testimonios,
 * consigue que bloqueen el numero.
 */
export async function solicitarTestimoniosPendientes(
  supabase: SupabaseClient,
  limite = 20,
): Promise<{ evaluados: number; solicitados: number }> {
  if (!PLANTILLAS.solicitudTestimonio.id) {
    return { evaluados: 0, solicitados: 0 };
  }

  // El filtro por fecha no se puede hacer en la consulta porque el campo
  // que manda depende del pedido (ver fechaEntrega), asi que se traen mas
  // de los que se van a usar y se filtran aqui.
  const { data: pedidos } = await supabase
    .from("pedidos")
    .select("id, nombre, telefono, producto_nombre, fecha_entrega_real, updated_at")
    .eq("estado", "entregado")
    .is("testimonio_solicitado_at", null)
    .order("updated_at", { ascending: true })
    .limit(limite * 5);

  if (!pedidos?.length) return { evaluados: 0, solicitados: 0 };

  const corte = Date.now() - DIAS_TRAS_ENTREGA * 86_400_000;
  const maduros = (pedidos as PedidoEntregado[]).filter((p) => {
    const entrega = fechaEntrega(p);
    return entrega !== null && entrega <= corte;
  });

  let solicitados = 0;

  for (const pedido of maduros) {
    if (solicitados >= limite) break;
    if (!pedido.telefono) continue;

    // La plantilla es de MARKETING: quien pidio parar promociones no la
    // recibe, y Meta lo exige.
    const { data: conversacion } = await supabase
      .from("whatsapp_conversaciones")
      .select("promociones_activas")
      .eq("telefono", pedido.telefono)
      .maybeSingle();

    if (conversacion?.promociones_activas === false) continue;

    await encolarSolicitudTestimonio(supabase, {
      pedidoId: pedido.id,
      nombre: pedido.nombre,
      telefonoE164: pedido.telefono,
      producto: pedido.producto_nombre ?? "tu pedido",
    });
    solicitados++;
  }

  return { evaluados: maduros.length, solicitados };
}

/**
 * Guarda como testimonio pendiente la respuesta de una clienta a la que se
 * le pidio uno hace poco.
 *
 * Se llama desde el webhook, con el texto tal cual llego. No interpreta
 * nada: no decide si es bueno o malo, ni si dio permiso. Eso lo hace una
 * persona en /dashboard/testimonios.
 *
 * Solo captura la PRIMERA respuesta despues de la solicitud. Si no, cada
 * mensaje posterior de esa clienta —incluido "gracias"— entraria como un
 * testimonio mas a moderar.
 *
 * Devuelve true si guardo algo. Nunca lanza: esto corre en medio del
 * webhook y un fallo aqui no puede dejar a la clienta sin respuesta.
 */
export async function capturarTestimonio(
  supabase: SupabaseClient,
  datos: { telefonoE164: string; texto: string; nombre?: string | null },
): Promise<boolean> {
  try {
    const texto = datos.texto.trim();
    if (!texto) return false;

    const desde = new Date(
      Date.now() - DIAS_VENTANA_RESPUESTA * 86_400_000,
    ).toISOString();

    const { data: pedido } = await supabase
      .from("pedidos")
      .select("id, nombre, ciudad, producto_sku, testimonio_solicitado_at")
      .eq("telefono", datos.telefonoE164)
      .gte("testimonio_solicitado_at", desde)
      .order("testimonio_solicitado_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!pedido) return false;

    const { count } = await supabase
      .from("testimonios")
      .select("id", { count: "exact", head: true })
      .eq("pedido_id", pedido.id);

    if ((count ?? 0) > 0) return false;

    const { error } = await supabase.from("testimonios").insert({
      pedido_id: pedido.id,
      telefono: datos.telefonoE164,
      // En los pedidos de la web `producto_sku` guarda el slug de la
      // landing, que es el handle del producto. Los que entran por el
      // webhook de Shopify traen el SKU real, que no es un handle: esos
      // quedan sin producto y solo sirven como testimonio general.
      producto_handle: pedido.producto_sku ?? null,
      texto,
      nombre: datos.nombre ?? pedido.nombre ?? null,
      ciudad: pedido.ciudad ?? null,
      solicitado_at: pedido.testimonio_solicitado_at,
    });

    if (error) {
      console.error("[testimonios] no se pudo guardar:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[testimonios] error al capturar:", err);
    return false;
  }
}

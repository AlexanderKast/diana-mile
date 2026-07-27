import type { SupabaseClient } from "@supabase/supabase-js";
import { enviarTexto } from "./client";

/**
 * Lo que recibe la clienta cuando pulsa un boton de una plantilla.
 *
 * Antes no recibia nada: confirmaba su pedido y el chat se quedaba mudo,
 * que es justo el momento en que mas necesita saber que todo va bien.
 * Como el boton abre la ventana de 24h, aqui si se puede escribir texto
 * libre y no hace falta otra plantilla.
 */

const TIEMPO_ENTREGA_POR_DEFECTO = "de 2 a 5 dias habiles";

async function leerConfig(
  supabase: SupabaseClient,
  claves: string[],
): Promise<Map<string, string>> {
  const { data } = await supabase
    .from("config")
    .select("clave, valor")
    .in("clave", claves);
  return new Map((data ?? []).map((c) => [c.clave, c.valor as string]));
}

function formatoPesos(valor: number): string {
  return Math.round(valor).toLocaleString("es-CO");
}

export type DatosPedidoBoton = {
  pedidoId: string;
  telefonoE164: string;
  nombre: string | null;
  producto: string;
  precioTotal: number;
  /** Para decirle el tiempo real de SU ciudad, no uno generico. */
  ciudad?: string | null;
};

/**
 * Tiempo de entrega de esa ciudad. Sale de la matriz de las
 * transportadoras: no es lo mismo el Valle de Aburra, que se despacha
 * desde Medellin en un dia, que un pueblo apartado que toma una semana.
 */
async function tiempoDeEntrega(
  supabase: SupabaseClient,
  ciudad: string | null | undefined,
): Promise<string> {
  if (ciudad?.trim()) {
    const clave = ciudad
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    const { data } = await supabase
      .from("cobertura_entrega")
      .select("dias_min, dias_max")
      .eq("ciudad_clave", clave)
      .maybeSingle();

    if (data) {
      return data.dias_min === data.dias_max
        ? `en ${data.dias_max} dias habiles`
        : `en ${data.dias_min} a ${data.dias_max} dias habiles`;
    }
  }

  const config = await leerConfig(supabase, ["tiempo_entrega_texto"]);
  return config.get("tiempo_entrega_texto") ?? TIEMPO_ENTREGA_POR_DEFECTO;
}

/**
 * Confirmacion: es el momento de mas confianza de toda la venta y hay que
 * aprovecharlo. Se agradece, se recuerda lo del dinero en efectivo —que es
 * lo que mas hace fallar una entrega contraentrega—, se da el tiempo real
 * y se pide la ubicacion, que le ahorra al mensajero dar vueltas.
 */
export async function responderConfirmacion(
  supabase: SupabaseClient,
  datos: DatosPedidoBoton,
): Promise<void> {
  const tiempo = await tiempoDeEntrega(supabase, datos.ciudad);
  const primerNombre = (datos.nombre ?? "").split(/\s+/)[0];

  await enviarTexto(
    datos.telefonoE164,
    `¡Gracias por confirmar${primerNombre ? `, ${primerNombre}` : ""}! 🎉

Tu ${datos.producto} llega ${tiempo}. Ten a la mano *$${formatoPesos(datos.precioTotal)}* en efectivo para pagarle al mensajero cuando lo recibas.`,
  );

  // La ubicacion va en un segundo mensaje: pedirla junto con lo anterior
  // hace que se pierda entre el resto y nadie la manda.
  await enviarTexto(
    datos.telefonoE164,
    `Una cosita mas: ¿me compartes tu ubicacion? Asi el mensajero te encuentra facil y no te llama dando vueltas.

Tocas el clip 📎 y eliges *Ubicacion*.`,
  );
}

/**
 * Se manda despues de la entrega, no al confirmar: invitar a la comunidad
 * mientras todavia esta esperando el pedido le quita foco a lo que
 * importa, que es que le llegue bien.
 */
export async function invitarComunidadVip(
  supabase: SupabaseClient,
  datos: { telefonoE164: string; nombre: string | null },
): Promise<boolean> {
  const config = await leerConfig(supabase, ["comunidad_whatsapp_link"]);
  const link = config.get("comunidad_whatsapp_link");
  if (!link) return false;

  const primerNombre = (datos.nombre ?? "").split(/\s+/)[0];
  const resultado = await enviarTexto(
    datos.telefonoE164,
    `${primerNombre ? `${primerNombre}, y` : "Y"}a que recibiste tu pedido, te abro la puerta de la comunidad VIP de Milito Life 💚

Ahi comparto rutinas, resultados de otras clientas y resuelvo dudas. Entra aqui: ${link}`,
  );
  return resultado.success;
}

/** Quiere corregir algo antes de que salga: se le pide el dato concreto. */
export async function responderModificar(
  datos: DatosPedidoBoton,
): Promise<void> {
  const primerNombre = (datos.nombre ?? "").split(/\s+/)[0];
  await enviarTexto(
    datos.telefonoE164,
    `Claro${primerNombre ? `, ${primerNombre}` : ""}. ¿Que necesitas cambiar: la direccion, el telefono o la cantidad?

Dime como queda y lo ajusto antes de que salga.`,
  );
}

/** Pidio hablar con alguien: se le responde de inmediato, sin hacerlo esperar. */
export async function responderAsesor(datos: DatosPedidoBoton): Promise<void> {
  const primerNombre = (datos.nombre ?? "").split(/\s+/)[0];
  await enviarTexto(
    datos.telefonoE164,
    `Aqui estoy${primerNombre ? `, ${primerNombre}` : ""}. Cuentame en que te ayudo con tu pedido 💚`,
  );
}

/** Anulo: se confirma sin reproches y se deja la puerta abierta. */
export async function responderAnulado(
  datos: DatosPedidoBoton,
  seCancelo: boolean,
): Promise<void> {
  const primerNombre = (datos.nombre ?? "").split(/\s+/)[0];

  await enviarTexto(
    datos.telefonoE164,
    seCancelo
      ? `Listo${primerNombre ? `, ${primerNombre}` : ""}, tu pedido queda cancelado. No te llega nada ni tienes que pagar nada.

Si mas adelante lo quieres retomar, aqui estoy 💚`
      : `Entendido${primerNombre ? `, ${primerNombre}` : ""}. Dejame validar el estado de tu pedido y te confirmo en un momentico 💚`,
  );
}

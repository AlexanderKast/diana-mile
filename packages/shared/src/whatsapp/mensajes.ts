/**
 * El mensaje con que la persona llega a WhatsApp, segun donde estaba.
 *
 * Vale por dos razones. La primera es para ella: escribir "hola" y que le
 * pregunten "¿de que producto me hablas?" cuando lleva diez minutos
 * leyendo esa pagina se siente a no la estan atendiendo. La segunda es
 * para nosotros: como cada pagina manda un texto distinto, ese texto es
 * la huella que dice de donde salio el lead, sin pedirle nada a ella y
 * sin meterle codigos raros al mensaje.
 *
 * Por eso los textos tienen que seguir siendo DISTINTOS entre si. Si dos
 * paginas mandan lo mismo, se pierde la atribucion de las dos.
 */

export type OrigenApp = "shop" | "linktree" | "www" | "app";

export type ContextoEnlace = {
  /** Ruta actual, sin dominio ni query. Ej: "/productos/epoch-polishing-bar". */
  ruta: string;
  /**
   * Nombre real de lo que esta viendo, cuando la pagina lo conoce. El slug
   * no sirve: "epoch-polishing-bar" no es como ella lo llama.
   */
  titulo?: string | null;
  /**
   * Enfoque de venta de la landing de producto (ej. "Acné en el rostro"),
   * cuando la pagina lo conoce. Sin esto el mensaje solo dice que producto
   * vio, no para que problema es — y eso es lo que decide si quien atiende
   * responde con el contexto correcto de una.
   */
  angulo?: string | null;
  origen?: OrigenApp;
};

/** Quita la barra final para que "/productos/" y "/productos" sean lo mismo. */
function normalizar(ruta: string): string {
  const limpia = (ruta || "/").split("?")[0].split("#")[0];
  return limpia.length > 1 ? limpia.replace(/\/+$/, "") : limpia;
}

/**
 * Nombre aproximado sacado del slug: "epoch-polishing-bar" -> "Epoch
 * Polishing Bar".
 *
 * Existe porque el titulo exacto lo pone la pagina despues de hidratar, y
 * eso puede no llegar nunca: basta con una extension del navegador que
 * toque el HTML para que React descarte los efectos. Con esto el mensaje
 * ya nombra el producto desde el HTML del servidor, y si la hidratacion va
 * bien se reemplaza por el titulo de verdad.
 */
export function tituloDesdeRuta(ruta: string): string | null {
  const partes = normalizar(ruta).split("/").filter(Boolean);
  const slug = partes[1];
  if (!slug) return null;

  return slug
    .split("-")
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

export function mensajeWhatsApp(ctx: ContextoEnlace): string {
  const ruta = normalizar(ctx.ruta);
  const titulo = ctx.titulo?.trim() || tituloDesdeRuta(ruta);

  if (ctx.origen === "linktree") {
    return "Hola, llegue por el link de la bio y quiero informacion.";
  }

  // Producto puntual: es la pagina que mas vende y la que mas dudas
  // genera, asi que el mensaje nombra el producto de frente. Con angulo,
  // nombra tambien PARA QUE es (ej. "para el acne"): quien atiende contesta
  // desde el problema, no adivinando por que escribio.
  if (/^\/productos\/.+/.test(ruta)) {
    const angulo = ctx.angulo?.trim();
    if (titulo && angulo) {
      return `Hola, estaba en la tienda Milito y vi el producto para ${angulo}: el ${titulo}. Quiero más información.`;
    }
    return titulo
      ? `Hola, estoy viendo el ${titulo} y quiero saber mas antes de pedirlo.`
      : "Hola, estoy viendo un producto en la tienda y quiero saber mas.";
  }

  if (ruta === "/productos") {
    return "Hola, estoy viendo los productos de Milito Life y quiero una recomendacion.";
  }

  if (/^\/categorias\/.+/.test(ruta)) {
    return titulo
      ? `Hola, estoy viendo la categoria ${titulo} y quiero que me recomiendes.`
      : "Hola, estoy viendo una categoria de la tienda y quiero que me recomiendes.";
  }

  if (ruta === "/categorias") {
    return "Hola, estoy viendo las categorias y no se cual me sirve.";
  }

  // Checkout: aqui ya decidio comprar y algo la freno. Es el mensaje mas
  // valioso de todos, y por eso dice que esta a mitad del pedido.
  if (/^\/pedido\//.test(ruta)) {
    return titulo
      ? `Hola, estoy haciendo el pedido del ${titulo} y tengo una duda.`
      : "Hola, estoy haciendo un pedido y tengo una duda.";
  }

  if (ruta.startsWith("/cuenta")) {
    return "Hola, tengo una duda con mi cuenta de Milito Life.";
  }

  if (ruta === "/") {
    return "Hola, estoy en la tienda de Milito Life y quiero que me asesores.";
  }

  return "Hola, quiero informacion de Milito Life.";
}

/**
 * Un numero que de verdad se pueda escribir.
 *
 * No basta con que tenga digitos: el valor por defecto del proyecto es
 * "57XXXXXXXXXX", y quitarle las letras deja un "57" que arma un enlace
 * con pinta de valido y lleva a un chat que no existe. Eso estuvo en
 * produccion. Mejor no pintar el boton que mandar a la gente a la nada.
 */
function numeroUtilizable(numero: string | null | undefined): string | null {
  const crudo = (numero ?? "").trim();
  if (!crudo || /x/i.test(crudo)) return null;

  const digitos = crudo.replace(/\D/g, "");
  // Un movil colombiano con indicativo son 12 digitos; el minimo
  // internacional razonable es 10.
  return digitos.length >= 10 ? digitos : null;
}

/**
 * El enlace listo, o null si el numero no sirve. Quien lo use debe tratar
 * el null como "no hay boton", nunca como "pinta uno vacio".
 */
export function enlaceWhatsApp(
  numero: string | null | undefined,
  ctx: ContextoEnlace,
): string | null {
  return enlaceConTexto(numero, mensajeWhatsApp(ctx));
}

/**
 * Para los CTA que ya traen su propio mensaje —el de entrenamiento, el de
 * "ya hice mi pedido"— y solo necesitan la misma validacion del numero.
 */
export function enlaceConTexto(
  numero: string | null | undefined,
  texto: string,
): string | null {
  const limpio = numeroUtilizable(numero);
  if (!limpio) return null;
  return `https://wa.me/${limpio}?text=${encodeURIComponent(texto)}`;
}

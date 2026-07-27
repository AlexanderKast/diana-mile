import type { SupabaseClient } from "@supabase/supabase-js";
import { enviarTexto } from "../client";
import { EXPERTOS, type ExpertoId } from "./expertos";
import { chat, tieneApiKey } from "./mistral";
import { elegirExperto } from "./router";
import {
  catalogoDatos,
  catalogoResumen,
  coberturaDe,
  datosConocidos,
  formatearContexto,
  linkComunidad,
  pedidoReciente,
} from "./contexto";
import {
  correccionDeCatalogo,
  problemasDeCatalogo,
} from "./guardia-catalogo";
import {
  dentroDeVentana,
  guardarEntrante,
  guardarRespuesta,
  historial,
  obtenerOCrearConversacion,
} from "./conversacion";
import { FALLBACK_HUMANO, FORMATO_WHATSAPP, VOZ_MILITO } from "./voz";
import { TECNICAS_CIERRE } from "./cierre";
import {
  detectarEscalada,
  escalarAHumano,
  MARCA_ESCALAR,
  type MotivoEscalado,
} from "./escalamiento";
import {
  limpiarFormato,
  pareceDespedida,
  problemasDeFormato,
  type OpcionesFormato,
} from "./formato";
import {
  crearPedidoDesdeChat,
  presentacionesDe,
  type PedidoDesdeChat,
} from "./pedido";
import {
  aceptarAdicional,
  elegirAdicional,
  guardarOferta,
  mensajeAdicional,
  ofertaPendiente,
  rechazarAdicional,
  type OfertaUpsell,
} from "./upsell";
import {
  anotarPendiente,
  buscarAprendido,
  formatearAprendido,
  marcarUsado,
} from "./aprendizaje";

export type ResultadoAgente = {
  respondido: boolean;
  experto?: ExpertoId;
  respuesta?: string;
  /** El equipo humano debe entrar a esta conversacion. */
  escalar?: boolean;
  motivo?: string;
};

/**
 * Frases con las que la persona pide explicitamente un humano. Cuando
 * aparecen, la IA no intenta resolver: escala y se calla.
 */
const PIDE_HUMANO =
  /\b(asesor|humano|persona real|hablar con alguien|operador|agente real|reclamo|demanda|abogado|estafa|estafaron|fraude)\b/i;

/**
 * Instruccion para que el modelo prefiera callarse antes que inventar. Es
 * la regla mas importante del sistema: un dato inventado sobre un precio o
 * un pedido le cuesta la confianza a la marca.
 */
const REGLA_CATALOGO = `REGLA DE ORO — SOLO EXISTE LO QUE ESTA EN EL CATALOGO.

No ofreces, no recomiendas y no le pones precio a nada que no aparezca en el catalogo de arriba. Ni "te consigo", ni "creo que tambien manejamos", ni "eso lo puedes pedir". Da igual que exista en la marca o que sea justo lo que ella necesita: si no esta en esa lista, para esta conversacion no se vende.

Puedes explicar en general que hace una linea o un tipo de producto, eso es conocimiento y ayuda. Lo que no puedes es dar a entender que lo tenemos.

Si lo que ella busca no esta: se lo dices de frente, le ofreces lo que si hay y que mas se le parezca, y si insiste le dices que le confirmas con el equipo si se puede conseguir. Es lo unico honesto — prometerle algo que no le va a llegar te cuesta la venta, la clienta y la recompra.`;

const REGLA_NO_INVENTAR = `SI NO SABES, NO RESPONDAS.

Cuando te pregunten algo que no puedas responder con lo que tienes arriba —un precio que no esta en el catalogo, el estado de un pedido que no aparece, una fecha de entrega, una condicion medica, una promocion, una politica que no conoces, cualquier dato duro que no tengas— NO improvises, NO estimes, NO respondas "creo que" ni "normalmente".

En ese caso tu respuesta completa debe ser exactamente:
${MARCA_ESCALAR} seguido de una frase corta diciendo que te falta.

Ejemplo: ${MARCA_ESCALAR} pregunta si el producto sirve durante el embarazo

Ese texto NUNCA lo ve la clienta: el sistema lo intercepta, le avisa a Diana y le responde a ella que le confirmas en un momento. Escalar no es fallar, es lo correcto. Inventar si es fallar.`;

/** Marca con la que el modelo pide que se cree la orden. */
const MARCA_PEDIDO = "[[PEDIDO]]";

/** Marca con la que el modelo pide cancelar el pedido de esa persona. */
const MARCA_CANCELAR = "[[CANCELAR]]";

/**
 * Cancelacion pedida en la conversacion (no por el boton de la plantilla).
 *
 * El agente solo llega aqui despues de haber intentado retener: la regla
 * de retencion vive en el conocimiento de la tienda. Y solo se ejecuta si
 * el pedido no salio de bodega — eso lo decide la app, no el modelo.
 */
const REGLA_CANCELAR = `SI DESPUES DE INTENTAR RETENERLA IGUAL QUIERE CANCELAR

Cuando ya entendiste por que se quiere ir, le ofreciste la alternativa que
correspondia y aun asi insiste, no le pongas mas trabas: se cancela.

Tu respuesta completa debe ser exactamente:
${MARCA_CANCELAR} seguido del motivo corto que te dio.

Ejemplo: ${MARCA_CANCELAR} ya no lo necesita

Ese texto no lo ve la clienta: el sistema verifica si el pedido todavia se
puede cancelar y le responde. Si ya salio para su ciudad no se puede
cancelar solo, y ahi lo revisa una persona — por eso nunca le prometas tu
que quedo cancelado.

NO uses esta marca en el primer mensaje en que menciona cancelar: primero
preguntas que paso y ofreces la alternativa. Solo si insiste.`;

/**
 * Instruccion para cerrar la venta dentro del chat. El pedido se crea con
 * los mismos endpoints del formulario web, asi que entra a Shopify, a
 * Supabase y al tracking igual que cualquier otro.
 */
const REGLA_TOMAR_PEDIDO = `CUANDO YA TENGAS TODOS LOS DATOS Y ELLA CONFIRME

Tu no mandas a nadie a la pagina: el pedido lo tomas tu aqui mismo.

En cuanto tengas los seis datos (nombre y apellido, celular, departamento, ciudad, barrio, direccion) Y la persona haya confirmado que estan bien, tu respuesta completa debe ser exactamente esto, sin ningun texto adicional:

${MARCA_PEDIDO}{"nombre":"...","telefono":"...","departamento":"...","ciudad":"...","barrio":"...","direccion":"...","producto":"...","presentacion":"...","notas":"..."}

- "producto" es el nombre del producto del catalogo tal como aparece arriba.
- "presentacion" es la variante que eligio ("Pack 2 unidades", "1 unidad"). Si el producto no tiene presentaciones, dejalo vacio.
- "notas" es cualquier indicacion de entrega que te haya dado (portería, horario). Vacio si no dijo nada.
- El JSON tiene que ser valido y en una sola linea.

REGLA ABSOLUTA DE ESTOS DATOS: cada valor tiene que ser EXACTAMENTE lo que la persona escribio en ESTA conversacion. Nada de completar con lo que suene razonable, con direcciones de ejemplo que hayas visto arriba, ni con datos de pedidos anteriores de esta u otra persona. Si no te dio la direccion, NO la inventes: preguntasela. Un pedido con una direccion inventada es un envio perdido, plata perdida y una clienta furiosa.

Y NO uses la marca antes de tiempo: no la mandes si todavia falta un dato o si ella no ha confirmado el resumen. Primero recapitulas, ella dice que si, y ahi si.

Ese texto NUNCA lo ve la clienta: el sistema crea el pedido de verdad y le responde con el numero de orden. Si algo falta o esta mal, te lo devuelve para que se lo preguntes.

NO uses esta marca si todavia falta un dato o si ella no ha confirmado. Y no la mezcles con texto: o mandas la marca sola, o mandas un mensaje normal.`;

/** Marca con la que el modelo dice que acepto el adicional. */
const MARCA_AGREGAR = "[[AGREGAR]]";

/**
 * Ofrece un adicional al pedido recien creado.
 *
 * Nunca lanza ni bloquea: si algo falla, la clienta ya tiene su
 * confirmacion y eso es lo que importaba. Un adicional que no se ofrece no
 * le cuesta nada a nadie; una excepcion despues de cobrar, si.
 */
async function ofrecerAdicional(
  supabase: SupabaseClient,
  datos: { conversacionId: string; telefonoE164: string; expertoId: ExpertoId },
): Promise<void> {
  try {
    const { data: pedido } = await supabase
      .from("pedidos")
      .select("id, producto_nombre")
      .eq("telefono", datos.telefonoE164)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!pedido) return;

    const oferta = await elegirAdicional(supabase, pedido.producto_nombre ?? "");
    if (!oferta) return;

    oferta.pedidoId = pedido.id;
    const texto = mensajeAdicional(oferta);

    const envio = await enviarTexto(datos.telefonoE164, texto);
    if (!envio.success) return;

    // Solo se guarda si de verdad salio: una oferta anotada que ella nunca
    // recibio haria que un "si" a otra cosa le sumara un producto.
    await guardarOferta(supabase, datos.conversacionId, oferta);
    await guardarRespuesta(
      supabase,
      datos.conversacionId,
      texto,
      datos.expertoId,
      0,
    );
  } catch (err) {
    console.warn("[wa-agente] no se pudo ofrecer el adicional:", err);
  }
}

/**
 * Se inyecta solo mientras hay un adicional ofrecido y sin responder. Es
 * lo que permite entender un "si" suelto tres mensajes despues sin volver
 * a preguntar de que se trataba.
 */
function reglaAdicional(producto: string, precio: number): string {
  return `HAY UN ADICIONAL OFRECIDO Y PENDIENTE DE RESPUESTA

Le ofreciste sumarle ${producto} por $${Math.round(precio).toLocaleString("es-CO")} al pedido que acaba de hacer.

Si en este mensaje ella ACEPTA —"si", "dale", "hagale", "sumalo", "de una", o cualquier forma de decir que si— tu respuesta completa debe ser exactamente:
${MARCA_AGREGAR}

Ese texto no lo ve ella: el sistema le suma el producto a su orden y le responde con el total nuevo.

Si dice que no, o cambia de tema, NO insistas ni se lo vuelvas a ofrecer: le respondes normal lo que te pregunte. Presionar a quien acaba de comprar es la forma mas rapida de que se arrepienta de todo.`;
}

/** Marcador con que queda anotada una escalada en el historial. */
const MARCA_ESCALADO_HISTORIAL = "(escalado a Diana:";

/**
 * Si a esta persona ya se le contesto algo despues de que se escalara.
 *
 * El acuse de recibo se manda una sola vez: quien escribe cinco veces
 * mientras espera no necesita cinco "te leo" identicos, eso ya parece un
 * bot roto. La escalada misma queda anotada en el historial con un
 * marcador, y no cuenta como respuesta porque nunca se le envio.
 */
async function yaSeAcusoRecibo(
  supabase: SupabaseClient,
  conversacion: { id: string; escaladoAt: string | null },
): Promise<boolean> {
  if (!conversacion.escaladoAt) return true;

  const { data } = await supabase
    .from("whatsapp_conversacion_mensajes")
    .select("contenido")
    .eq("conversacion_id", conversacion.id)
    .eq("rol", "assistant")
    .gt("created_at", conversacion.escaladoAt)
    .limit(5);

  return (data ?? []).some(
    (m) => !String(m.contenido ?? "").startsWith(MARCA_ESCALADO_HISTORIAL),
  );
}

function construirSystemPrompt(
  experto: (typeof EXPERTOS)[ExpertoId],
  contexto: string,
  aprendido = "",
  adicional: OfertaUpsell | null = null,
): string {
  const instruccionesExtra = experto.escalaAHumano
    ? `\n\nATENCION — ESTA CONVERSACION ES DE SOPORTE: la persona esta preguntando por un pedido o tiene un problema.
- CERO EMOJIS. Ninguno, ni siquiera uno de empatia. A alguien preocupado por su plata o su pedido un emoji le suena a que no lo estan tomando en serio.
- NO vendes, NO recomiendas otro producto, NO invitas a la comunidad.
- Respondes solo con los datos reales del pedido que tienes arriba.
- Nunca inventes una fecha de entrega. Si no la tienes, escalas.`
    : "";

  return [
    VOZ_MILITO,
    `TU ESPECIALIDAD EN ESTE MOMENTO:\n${experto.conocimiento}`,
    experto.vende ? TECNICAS_CIERRE : "",
    contexto,
    // Va antes de la regla de no inventar: si ya sabe la respuesta, no
    // tiene por que escalar.
    aprendido,
    // Solo quien vende puede tomar pedidos: en soporte no aplica.
    experto.vende ? REGLA_TOMAR_PEDIDO : "",
    // Cancelar aplica al reves: es cosa de soporte y de la tienda.
    experto.escalaAHumano || experto.id === "tienda" ? REGLA_CANCELAR : "",
    // Va justo antes de la de no inventar porque son la misma idea: no
    // afirmar lo que no se puede sostener. Se le da a todos los expertos,
    // no solo a los que venden: el de entrenamiento o el de contenido
    // tambien terminan recomendando un producto cuando viene a cuento.
    adicional ? reglaAdicional(adicional.producto, adicional.precio) : "",
    REGLA_CATALOGO,
    REGLA_NO_INVENTAR,
    instruccionesExtra,
    FORMATO_WHATSAPP,
  ]
    .filter(Boolean)
    .join("\n\n───\n\n");
}

/**
 * Crea el pedido a partir de la marca que emitio el modelo y arma lo que
 * se le responde a la clienta. Nunca lanza: si algo falla, la persona
 * recibe un mensaje util y el caso queda para atenderlo a mano.
 */
async function tomarPedido(
  respuesta: string,
  telefonoE164: string,
  /** Lo que escribio la persona: se usa para verificar que los datos son suyos. */
  mensajesDeLaPersona: string[],
  supabase: SupabaseClient,
): Promise<{ mensaje: string; creado: boolean; detalle: string }> {
  const crudo = respuesta.slice(respuesta.indexOf(MARCA_PEDIDO) + MARCA_PEDIDO.length);
  // El modelo a veces envuelve el JSON en comillas de codigo.
  const limpio = crudo.replace(/```(?:json)?/g, "").trim();

  let datos: PedidoDesdeChat;
  try {
    const inicio = limpio.indexOf("{");
    const fin = limpio.lastIndexOf("}");
    datos = JSON.parse(limpio.slice(inicio, fin + 1)) as PedidoDesdeChat;
  } catch {
    return {
      mensaje:
        "Casi listo. Confirmame por favor tu nombre completo, celular, ciudad, barrio y direccion, y te dejo el pedido armado.",
      creado: false,
      detalle: "json invalido",
    };
  }

  // El telefono del chat manda sobre el que se haya dictado: es el numero
  // desde el que esta escribiendo y el que de verdad contesta.
  const resultado = await crearPedidoDesdeChat(
    {
      ...datos,
      telefono: datos.telefono?.trim() || telefonoE164,
    },
    mensajesDeLaPersona,
    supabase,
  );

  if (resultado.ok) {
    // Ya habia uno reciente: se le confirma ese, sin dar a entender que se
    // creo otro. Un "listo, quedo el #1019" despues del #1018 la deja
    // creyendo que tiene dos pedidos.
    if (resultado.yaExistia) {
      return {
        mensaje: `Tu pedido de ${resultado.producto} ya esta registrado, tranquilo. Pagas *$${resultado.total.toLocaleString("es-CO")}* cuando lo recibas 💚`,
        creado: true,
        detalle: `ya existia: ${resultado.orderNumber}`,
      };
    }

    return {
      mensaje: `¡Listo! 🎉 Tu pedido quedo con el numero *${resultado.orderNumber}*.\n\nTe llega a la direccion que me diste y pagas *$${resultado.total.toLocaleString("es-CO")}* cuando lo recibas.`,
      creado: true,
      detalle: resultado.orderNumber,
    };
  }

  // La presentacion que pidio no existe. No se sustituye por otra —eso es
  // mandarle lo que no pidio—, pero tampoco basta con decir "confirmame
  // cual quieres": hay que decirle cuales SI hay, o no sabe que responder
  // y la conversacion se traba.
  if (resultado.motivo === "no se pudo identificar el producto") {
    const opciones = await presentacionesDe(datos.producto ?? "");

    if (opciones?.opciones.length === 1) {
      return {
        mensaje: `Te cuento: de ${opciones.titulo} por ahora solo tengo *${opciones.opciones[0]}*. La presentacion que me pides esta agotada.\n\n¿Te sirve asi?`,
        creado: false,
        detalle: `presentacion no disponible, unica opcion: ${opciones.opciones[0]}`,
      };
    }

    if (opciones?.opciones.length) {
      return {
        mensaje: `De ${opciones.titulo} tengo estas presentaciones: ${opciones.opciones.join(" · ")}.\n\n¿Cual te mando?`,
        creado: false,
        detalle: "presentacion no disponible",
      };
    }

    return {
      mensaje:
        "Dejame confirmarte la disponibilidad de ese producto y te digo en un momentico 💚",
      creado: false,
      detalle: resultado.motivo,
    };
  }

  // Falta un dato concreto: se pregunta eso puntual, no todo de nuevo.
  const pendientes = [
    ...(resultado.faltantes ?? []),
    ...(resultado.problemas ?? []),
  ];
  if (pendientes.length) {
    return {
      mensaje: `Casi listo, me falta un detalle: ${pendientes.join(" y ")}. ¿Me lo confirmas?`,
      creado: false,
      detalle: pendientes.join(" · "),
    };
  }

  return {
    mensaje:
      "Ya tengo todos tus datos 💚 Estoy terminando de armar el pedido y te confirmo el numero en un momentico.",
    creado: false,
    detalle: resultado.motivo,
  };
}

/**
 * Procesa un mensaje entrante de WhatsApp: elige el experto, arma el
 * contexto real, responde con la voz de Milito y guarda todo.
 *
 * Nunca lanza: ante cualquier fallo devuelve escalar=true para que un
 * humano atienda. Es preferible que responda una persona a que el bot
 * invente.
 */
export async function responderMensaje(
  supabase: SupabaseClient,
  // La atribucion del anuncio la persiste el webhook antes de llamar aqui:
  // el agente no necesita conocerla para responder.
  entrada: {
    telefonoE164: string;
    texto: string;
    nombre?: string | null;
    /**
     * Cancela el pedido si todavia se puede. La inyecta quien llama porque
     * requiere Shopify, que vive en apps/admin. Sin esto el agente escala
     * la cancelacion en vez de ejecutarla.
     */
    cancelarPedido?: (
      pedidoId: string,
      motivo: string,
    ) => Promise<{ cancelado: boolean; motivo?: string }>;
    /** Suma un producto a una orden que ya existe (edicion en Shopify). */
    agregarAOrden?: (pedidoId: string, variantId: string) => Promise<boolean>;
  },
): Promise<ResultadoAgente> {
  const { telefonoE164, texto, nombre } = entrada;

  try {
    const conversacion = await obtenerOCrearConversacion(
      supabase,
      telefonoE164,
      nombre,
    );
    if (!conversacion) {
      return { respondido: false, escalar: true, motivo: "sin_conversacion" };
    }

    await guardarEntrante(supabase, conversacion.id, texto);

    // Escalada y esperando a que alguien del equipo entre. Antes esto era
    // silencio absoluto: la persona escribia "??", "que paso?", "hola" y no
    // recibia ni un acuse. Ahora se le contesta una sola vez —repetirlo en
    // cada mensaje seria peor que callarse— para que sepa que la leyeron.
    if (!conversacion.iaActiva) {
      if (!(await yaSeAcusoRecibo(supabase, conversacion))) {
        const acuse = `${conversacion.nombre?.split(/\s+/)[0] ?? "Hola"}, te leo. Estoy validando lo tuyo y te confirmo en un momentico 💚`;
        const envio = await enviarTexto(telefonoE164, acuse);
        if (envio.success) {
          await guardarRespuesta(supabase, conversacion.id, acuse, "pedido", 0);
        }
        return {
          respondido: envio.success,
          escalar: true,
          motivo: "ia_silenciada: acuse enviado",
        };
      }
      return { respondido: false, escalar: true, motivo: "ia_silenciada" };
    }

    const datosBase = {
      telefonoE164,
      nombre: conversacion.nombre ?? nombre ?? null,
      pregunta: texto,
    };

    if (PIDE_HUMANO.test(texto)) {
      const motivo: MotivoEscalado = /reclamo|estafa|fraude|demanda|abogado/i.test(
        texto,
      )
        ? "reclamo"
        : "pidio_humano";
      const res = await escalarAHumano(
        supabase,
        { ...datosBase, motivo },
        "la persona lo pidio explicitamente",
      );
      return {
        respondido: res.mensajeEnviado,
        escalar: true,
        motivo,
      };
    }

    if (!tieneApiKey()) {
      await enviarTexto(telefonoE164, FALLBACK_HUMANO);
      return { respondido: true, escalar: true, motivo: "sin_api_key" };
    }

    // Todo lo que no depende del experto elegido se pide de una: el
    // catalogo esta cacheado y el resto son consultas rapidas, asi que
    // traerlo siempre sale mas barato que esperar a saber si hace falta.
    // Cada segundo cuenta — la persona esta mirando el chat.
    const [pedido, catalogo, comunidad, previos, conocidos, aprendido, expertoId] =
      await Promise.all([
        pedidoReciente(supabase, telefonoE164),
        catalogoResumen(),
        linkComunidad(supabase),
        historial(supabase, conversacion.id),
        datosConocidos(supabase, telefonoE164),
        // Lo que ya se le enseño sobre una duda parecida a esta.
        buscarAprendido(supabase, texto),
        elegirExperto(texto, { expertoPrevio: conversacion.ultimoExperto }),
      ]);

    const experto = EXPERTOS[expertoId];

    // La ciudad sale de su ultima compra o del pedido en curso; sin eso no
    // hay a que ciudad mirarle la cobertura.
    const ciudadConocida = conocidos?.ciudad ?? null;
    const cobertura = ciudadConocida
      ? await coberturaDe(supabase, ciudadConocida)
      : null;

    const contexto = formatearContexto({
      nombre: conversacion.nombre ?? nombre ?? null,
      pedido,
      // El catalogo solo se le muestra a quien lo necesita: en soporte o
      // en entrenamiento es ruido que le quita foco al modelo.
      catalogo: experto.necesitaCatalogo ? catalogo : null,
      comunidad,
      conocidos,
      cobertura,
    });

    // El adicional ofrecido y sin responder viaja en el prompt: sin eso,
    // un "si" suelto no significa nada y habria que volver a preguntar.
    const adicional = await ofertaPendiente(supabase, conversacion.id);
    const system = construirSystemPrompt(
      experto,
      contexto,
      formatearAprendido(aprendido),
      adicional,
    );
    if (aprendido.length) {
      void marcarUsado(
        supabase,
        aprendido.map((a) => a.id),
      );
    }
    const opcionesFormato: OpcionesFormato = {
      soporte: experto.escalaAHumano,
      despedida: pareceDespedida(texto),
    };

    // El historial ya incluye el mensaje que acabamos de guardar.
    const primera = await chat([
      { role: "system", content: system },
      ...previos,
    ]);
    let respuesta = primera.texto;
    const tokens = primera.tokens;

    // Las marcas se detectan sobre el texto crudo, ANTES de limpiar el
    // formato: el limpiador esta pensado para mensajes de WhatsApp y le
    // quitaria caracteres al JSON del pedido.
    const traeMarcaPedido = respuesta.includes(MARCA_PEDIDO);
    const traeMarcaCancelar = respuesta.includes(MARCA_CANCELAR);
    const traeMarcaAgregar = respuesta.includes(MARCA_AGREGAR);
    const razonEscalada = detectarEscalada(respuesta);

    if (
      !traeMarcaPedido &&
      !traeMarcaCancelar &&
      !traeMarcaAgregar &&
      !razonEscalada
    ) {
      respuesta = limpiarFormato(respuesta, opcionesFormato);
    }

    // Acepto el adicional: se le suma a la orden que ya existe.
    if (traeMarcaAgregar && adicional) {
      const res = await aceptarAdicional(supabase, {
        conversacionId: conversacion.id,
        telefono: telefonoE164,
        oferta: adicional,
        agregarAOrden: async (variantId) =>
          entrada.agregarAOrden
            ? entrada.agregarAOrden(adicional.pedidoId, variantId)
            : false,
      });

      await enviarTexto(telefonoE164, res.mensaje);
      await guardarRespuesta(
        supabase,
        conversacion.id,
        res.mensaje,
        expertoId,
        tokens,
      );
      return {
        respondido: true,
        experto: expertoId,
        respuesta: res.mensaje,
        // Si no se pudo sumar, lo termina una persona: ya se le dijo que
        // se lo confirmamos, y esa promesa hay que cumplirla.
        escalar: !res.ok,
        motivo: res.ok ? undefined : "no se pudo sumar el adicional",
      };
    }

    // Contesto otra cosa: la oferta se cierra aqui. Se ofrece una vez y no
    // se insiste — presionar a quien acaba de comprar es la forma mas
    // rapida de que se arrepienta de todo.
    if (adicional && !traeMarcaAgregar) {
      await rechazarAdicional(supabase, {
        conversacionId: conversacion.id,
        telefono: telefonoE164,
        oferta: adicional,
      });
    }

    // Pidio cancelar y ya se intento retener: se ejecuta si el pedido
    // todavia no salio de bodega.
    if (traeMarcaCancelar) {
      const motivo =
        respuesta
          .slice(respuesta.indexOf(MARCA_CANCELAR) + MARCA_CANCELAR.length)
          .trim() || "no dio motivo";

      // El prompt pide retener antes de cancelar, pero el modelo a veces
      // se salta ese paso y cancela al primer "quiero cancelar". Se
      // verifica aqui: si es la primera vez que lo menciona, no se
      // cancela todavia — se le pregunta que paso. Una venta hecha no se
      // deja ir por una respuesta apresurada.
      const vecesQueLoPidio = [
        ...previos.filter((m) => m.role === "user").map((m) => m.content),
        texto,
      ].filter((m) => /cancel|anul|ya no (lo )?quiero|devolver/i.test(m)).length;

      if (vecesQueLoPidio < 2) {
        const pregunta = `${nombre?.split(/\s+/)[0] ?? "Hola"}, claro que si. ¿Me cuentas que paso con el pedido? Si es algo que puedo resolver, lo miramos.`;
        await enviarTexto(telefonoE164, pregunta);
        await guardarRespuesta(
          supabase,
          conversacion.id,
          pregunta,
          expertoId,
          tokens,
        );
        return { respondido: true, experto: expertoId, respuesta: pregunta };
      }

      let aviso: string;
      let resuelto = false;

      if (!pedido) {
        aviso =
          "No encuentro un pedido activo a tu nombre. ¿Me confirmas el numero de pedido o el nombre con el que lo hiciste?";
      } else if (pedido.estado === "cancelado") {
        // Ya estaba cancelado: se confirma y punto. Escalarlo aqui dejaria
        // al equipo revisando un caso que no existe, y a la persona sin
        // respuesta mientras tanto.
        aviso =
          "Ese pedido ya esta cancelado, tranquila. No te va a llegar nada ni tienes que pagar nada 💚";
        resuelto = true;
      } else if (!entrada.cancelarPedido) {
        aviso = "Dejame revisar tu pedido y te confirmo en un momentico 💚";
      } else {
        const res = await entrada.cancelarPedido(pedido.id, motivo);
        resuelto = res.cancelado;
        aviso = res.cancelado
          ? `Listo, ya cancele tu pedido de ${pedido.producto}. No te va a llegar nada ni tienes que pagar nada.\n\nSi mas adelante lo quieres retomar, aqui estoy 💚`
          : "Dejame validar el estado de tu pedido y te confirmo en un momentico 💚";
      }

      await enviarTexto(telefonoE164, aviso);
      await guardarRespuesta(supabase, conversacion.id, aviso, expertoId, tokens);

      if (!resuelto) {
        await escalarAHumano(
          supabase,
          { ...datosBase, motivo: "reclamo" },
          `pidio cancelar: ${motivo}`,
        );
      }

      return {
        respondido: true,
        experto: expertoId,
        respuesta: aviso,
        escalar: !resuelto,
        motivo: resuelto ? undefined : `cancelacion pendiente: ${motivo}`,
      };
    }

    // El modelo junto todos los datos: se crea la orden de verdad.
    if (traeMarcaPedido) {
      // Solo lo que escribio la persona, incluido el mensaje de ahora: es
      // contra esto que se verifica que la direccion no sea inventada.
      const dichoPorElla = [
        ...previos.filter((m) => m.role === "user").map((m) => m.content),
        texto,
      ];
      const resultado = await tomarPedido(
        respuesta,
        telefonoE164,
        dichoPorElla,
        supabase,
      );

      // Si el intento anterior fallo por lo mismo y se le iba a repetir el
      // mismo mensaje, la conversacion se traba: la persona no entiende
      // que le estan pidiendo y el agente insiste igual. Ahi entra una
      // persona, que es lo unico que lo desatasca.
      const ultimaRespuesta = [...previos]
        .reverse()
        .find((m) => m.role === "assistant")?.content;

      if (!resultado.creado && ultimaRespuesta === resultado.mensaje) {
        await escalarAHumano(
          supabase,
          { ...datosBase, motivo: "no_sabe" },
          `no logra cerrar el pedido: ${resultado.detalle}`,
        );
        return {
          respondido: true,
          experto: expertoId,
          escalar: true,
          motivo: `bucle al tomar el pedido: ${resultado.detalle}`,
        };
      }

      await enviarTexto(telefonoE164, resultado.mensaje);
      await guardarRespuesta(
        supabase,
        conversacion.id,
        resultado.mensaje,
        expertoId,
        tokens,
      );

      // El mejor momento para subir el ticket: ya decidio, ya dio sus
      // datos y ya acepto pagar contraentrega. Va en un segundo mensaje
      // para no enturbiar la confirmacion, que es lo que ella esta
      // esperando leer.
      if (resultado.creado) {
        await ofrecerAdicional(supabase, {
          conversacionId: conversacion.id,
          telefonoE164,
          expertoId,
        });
      }

      if (!resultado.creado) {
        // No se pudo cerrar: queda registro para poder rescatar la venta
        // a mano en vez de que se pierda en silencio.
        console.warn(`[wa-agente] pedido no creado: ${resultado.detalle}`);
      }

      return {
        respondido: true,
        experto: expertoId,
        respuesta: resultado.mensaje,
        escalar: !resultado.creado,
        motivo: resultado.creado ? undefined : `pedido: ${resultado.detalle}`,
      };
    }

    // El modelo dijo que no sabe: esa marca jamas llega a la clienta.
    if (razonEscalada) {
      const res = await escalarAHumano(
        supabase,
        { ...datosBase, motivo: "no_sabe" },
        razonEscalada,
      );

      // Queda anotada para que alguien la conteste una vez: la proxima que
      // pregunten lo mismo, el agente ya lo sabe y no vuelve a escalar.
      void anotarPendiente(supabase, {
        telefono: telefonoE164,
        pregunta: texto,
        contexto: razonEscalada,
      });
      await guardarRespuesta(
        supabase,
        conversacion.id,
        `${MARCA_ESCALADO_HISTORIAL} ${razonEscalada})`,
        expertoId,
        tokens,
      );
      return {
        respondido: res.mensajeEnviado,
        experto: expertoId,
        escalar: true,
        motivo: `no_sabe: ${razonEscalada}`,
      };
    }

    // Mensaje normal: lo que el limpiador no pudo arreglar sin cambiar el
    // sentido (muy largo, dos preguntas) se le devuelve al modelo una vez.
    // Un reintento sale mas barato que mandar un mensaje mal formado.
    let totalTokens = tokens;
    const problemas = problemasDeFormato(respuesta, opcionesFormato);
    if (problemas.length) {
      try {
        const reintento = await chat([
          { role: "system", content: system },
          ...previos,
          { role: "assistant", content: respuesta },
          {
            role: "user",
            content: `[CORRECCION DE FORMATO — no es la clienta quien escribe esto] Tu mensaje anterior ${problemas.join(" y ")}. Reescribelo respetando eso. Responde solo con el mensaje corregido.`,
          },
        ]);
        const corregido = limpiarFormato(reintento.texto, opcionesFormato);
        // Solo se acepta si de verdad quedo mejor.
        if (!problemasDeFormato(corregido, opcionesFormato).length) {
          respuesta = corregido;
        }
        totalTokens += reintento.tokens;
      } catch (err) {
        console.warn("[wa-agente] fallo el reintento de formato:", err);
      }
    }

    // Regla de oro: no se ofrece lo que la tienda no vende, ni un precio
    // que no cobra. Se comprueba contra el catalogo real y no se confia en
    // que el prompt baste, porque no basta.
    const datosCatalogo = catalogoDatos();
    let problemaCatalogo = problemasDeCatalogo(respuesta, datosCatalogo);

    if (problemaCatalogo) {
      console.warn(
        `[wa-agente] ${problemaCatalogo.tipo} fuera de catalogo: ${problemaCatalogo.detalle}`,
      );
      try {
        const reintento = await chat([
          { role: "system", content: system },
          ...previos,
          { role: "assistant", content: respuesta },
          {
            role: "user",
            content: correccionDeCatalogo(problemaCatalogo),
          },
        ]);
        totalTokens += reintento.tokens;
        const corregido = limpiarFormato(reintento.texto, opcionesFormato);
        problemaCatalogo = problemasDeCatalogo(corregido, datosCatalogo);
        if (!problemaCatalogo) respuesta = corregido;
      } catch (err) {
        console.warn("[wa-agente] fallo el reintento de catalogo:", err);
      }
    }

    // Insistio despues de que se le corrigiera: no se manda. Una promesa
    // de algo que no existe cuesta mas que un rato de espera, y esto lo
    // resuelve una persona en un minuto.
    if (problemaCatalogo) {
      const razon = `ofrece ${problemaCatalogo.tipo} fuera de catalogo: ${problemaCatalogo.detalle}`;
      const res = await escalarAHumano(
        supabase,
        { ...datosBase, motivo: "no_sabe" },
        razon,
      );
      await guardarRespuesta(
        supabase,
        conversacion.id,
        `${MARCA_ESCALADO_HISTORIAL} ${razon})`,
        expertoId,
        totalTokens,
      );
      return {
        respondido: res.mensajeEnviado,
        experto: expertoId,
        escalar: true,
        motivo: razon,
      };
    }

    const envio = await enviarTexto(telefonoE164, respuesta);
    if (!envio.success) {
      return {
        respondido: false,
        escalar: true,
        motivo: `fallo_envio: ${envio.error}`,
      };
    }

    await guardarRespuesta(
      supabase,
      conversacion.id,
      respuesta,
      expertoId,
      totalTokens,
    );

    // Se responde y la IA sigue encendida. Antes toda conversacion de
    // soporte apagaba el agente, aunque hubiera contestado bien: preguntar
    // "donde va mi pedido" dejaba el chat mudo hasta la reactivacion
    // automatica, y los mensajes siguientes se perdian. El agente solo se
    // aparta cuando de verdad no puede resolver, y eso ya lo deciden las
    // ramas de arriba (marca [[ESCALAR]], cancelacion pendiente o bucle).
    return { respondido: true, experto: expertoId, respuesta };
  } catch (err) {
    console.error("[wa-agente] fallo al responder:", err);
    try {
      await enviarTexto(telefonoE164, FALLBACK_HUMANO);
    } catch {
      // Si ni el fallback sale, el equipo lo vera en el panel.
    }
    return {
      respondido: false,
      escalar: true,
      motivo: err instanceof Error ? err.message : "error_desconocido",
    };
  }
}

export { dentroDeVentana };

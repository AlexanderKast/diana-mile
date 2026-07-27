import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import { normalizeColombianMobile } from "@/lib/phone";

/**
 * Acceso temporal a /cuenta con un codigo unico para todas las clientas.
 *
 * TEMPORAL Y A PETICION DEL EQUIPO. El login normal esta caido —el
 * proveedor de telefono de Supabase esta apagado— y la plantilla de
 * autenticacion no se puede mandar porque el API publico de Botcake no
 * reenvia parametros de boton. Esto lo tapa mientras tanto.
 *
 * LO QUE ABRE, PARA QUE NADIE LO HEREDE SIN SABERLO: con este codigo,
 * quien escriba el celular de otra persona entra a su cuenta y ve su
 * nombre, su direccion, su telefono y todo lo que ha comprado. No hay
 * segundo factor que lo impida. Se acepto a sabiendas, para poder trabajar
 * mientras se destraba el envio del codigo.
 *
 * Lo que si se puede acotar, y esta acotado:
 *  · sin CODIGO_MAESTRO_ACCESO en el entorno no existe: responde 404;
 *  · caduca solo en la fecha de abajo, para que no sobreviva al olvido;
 *  · freno de fuerza bruta en tres capas: por IP, por numero atacado y un
 *    tope global de fallos por hora — este ultimo es el que de verdad para
 *    a quien reparte los intentos entre muchas IPs;
 *  · la comparacion es en tiempo constante;
 *  · no toca la contrasena ni el correo de nadie: la sesion se abre con un
 *    enlace de un solo uso;
 *  · cada entrada queda en el registro con el numero.
 */

const CODIGO_MAESTRO = process.env.CODIGO_MAESTRO_ACCESO;

/**
 * Fecha en la que esto deja de funcionar pase lo que pase.
 *
 * Un apaño temporal sin fecha se queda para siempre: nadie recuerda
 * borrarlo, y el dia que alguien lo descubre lleva meses abierto. Si
 * llegada la fecha todavia hace falta, se mueve a mano y queda constancia
 * de que se decidio.
 */
const VENCE_EL = new Date("2026-08-31T23:59:59Z");

const MAX_INTENTOS_POR_HORA = 5;
/** Mismo tope por numero: frena a quien rota IPs contra una sola clienta. */
const MAX_INTENTOS_POR_TELEFONO = 5;
/**
 * Tope global de fallos por hora contra el codigo compartido.
 *
 * Es la unica defensa real contra fuerza bruta distribuida. El codigo es uno
 * solo para todas, asi que a un atacante con muchas IPs le basta con repartir
 * los intentos para no tocar ningun tope individual. Si en una hora fallan
 * mas de estos intentos en toda la tienda, no es una clienta despistada: es
 * alguien probando, y se cierra la puerta hasta que pase la hora.
 */
const MAX_FALLOS_GLOBALES_POR_HORA = 25;

/**
 * La IP en la que SI se puede confiar.
 *
 * `X-Forwarded-For` la escribe quien hace la peticion. Tomar su primer valor
 * —como se hacia antes— significa que el atacante elige con que IP se le
 * cuentan los intentos: manda una distinta en cada llamada y el freno de
 * fuerza bruta deja de existir. Sobre un codigo corto y compartido por todas
 * las clientas, eso es la diferencia entre "cinco intentos por hora" y
 * "todos los que quiera".
 *
 * Vercel escribe `x-vercel-forwarded-for` en su propio edge y descarta lo
 * que venga del cliente, asi que esa si es de fiar. Fuera de Vercel, el
 * ultimo salto de XFF es el que agrego el proxy de confianza; el primero es
 * el que eligio el cliente.
 */
function ipCliente(request: NextRequest): string {
  const deVercel = request.headers.get("x-vercel-forwarded-for");
  if (deVercel) return deVercel.split(",")[0].trim();

  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const saltos = xff
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (saltos.length > 0) return saltos[saltos.length - 1];
  }

  return "desconocida";
}

/** Compara sin filtrar por tiempo cuantos caracteres coinciden. */
function codigoCorrecto(recibido: string): boolean {
  if (!CODIGO_MAESTRO) return false;
  const a = Buffer.from(recibido);
  const b = Buffer.from(CODIGO_MAESTRO);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  if (!CODIGO_MAESTRO) {
    return NextResponse.json({ mensaje: "No disponible." }, { status: 404 });
  }

  if (Date.now() > VENCE_EL.getTime()) {
    console.warn("[acceso-maestro] caducado: ya no se puede usar");
    return NextResponse.json({ mensaje: "No disponible." }, { status: 404 });
  }

  const { telefono, codigo } = (await request.json().catch(() => ({}))) as {
    telefono?: string;
    codigo?: string;
  };

  const normalizado = normalizeColombianMobile(String(telefono ?? ""));
  if (!normalizado) {
    return NextResponse.json(
      { mensaje: "Ingresa un celular colombiano valido." },
      { status: 400 },
    );
  }

  const admin = createAdminSupabaseClient();

  const ip = ipCliente(request);

  // Freno de fuerza bruta en tres capas. El codigo es corto y lo comparten
  // todas las clientas: quien lo adivine entra a la cuenta de cualquiera con
  // solo saber su celular. Una sola capa por IP no basta, porque la IP la
  // propone quien llama; hace falta tambien topar por numero atacado y, sobre
  // todo, contar el total — un atacante repartido no toca ningun tope
  // individual pero si mueve el global.
  const desde = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const [porIp, porTelefono, globales] = await Promise.all([
    admin
      .from("acceso_intentos")
      .select("id", { count: "exact", head: true })
      .eq("ip", ip)
      .gte("created_at", desde),
    admin
      .from("acceso_intentos")
      .select("id", { count: "exact", head: true })
      .eq("telefono", normalizado.e164)
      .gte("created_at", desde),
    admin
      .from("acceso_intentos")
      .select("id", { count: "exact", head: true })
      .gte("created_at", desde),
  ]);

  const frenos: [string, number, number][] = [
    ["ip", porIp.count ?? 0, MAX_INTENTOS_POR_HORA],
    ["telefono", porTelefono.count ?? 0, MAX_INTENTOS_POR_TELEFONO],
    ["global", globales.count ?? 0, MAX_FALLOS_GLOBALES_POR_HORA],
  ];
  const frenado = frenos.find(([, cuenta, tope]) => cuenta >= tope);

  if (frenado) {
    console.warn(
      `[acceso-maestro] frenado por ${frenado[0]}: ${frenado[1]}/${frenado[2]} en la ultima hora (ip ${ip}, tel ${normalizado.e164})`,
    );
    return NextResponse.json(
      { mensaje: "Demasiados intentos. Espera un rato." },
      { status: 429 },
    );
  }

  if (!codigoCorrecto(String(codigo ?? "").trim())) {
    await admin
      .from("acceso_intentos")
      .insert({ ip, telefono: normalizado.e164 });
    return NextResponse.json({ mensaje: "Codigo incorrecto." }, { status: 401 });
  }

  console.warn(
    `[acceso-maestro] entrada con el codigo general: ${normalizado.e164} (ip ${ip})`,
  );

  // Supabase guarda el telefono sin "+".
  const sinMas = normalizado.e164.replace(/^\+/, "");

  const { data: lista } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  const existente = lista?.users.find((u) => u.phone === sinMas);

  /**
   * La sesion se abre con un enlace de un solo uso, no con contrasena.
   *
   * Poner una contrasena en cada entrada pisaba la que la persona pudiera
   * tener, y forzar email_confirm daba por verificado un correo que quiza
   * no lo estaba. Un enlace magico no deja rastro en las credenciales.
   *
   * Va por correo y no por telefono porque con el proveedor de telefono
   * apagado Supabase rechaza cualquier via telefonica. El correo interno
   * solo se pone si la cuenta no tiene ninguno: si ya tiene uno de verdad,
   * no se toca.
   */
  const correoInterno = `${sinMas}@wa.militolife.local`;
  // Supabase devuelve email: "" —no null— en las cuentas creadas solo con
  // telefono, y "" no dispara el ??.
  const correoExistente = existente?.email?.trim();
  const correo = correoExistente || correoInterno;

  if (!existente) {
    const { error } = await admin.auth.admin.createUser({
      phone: sinMas,
      phone_confirm: true,
      email: correoInterno,
      email_confirm: true,
    });
    if (error) {
      console.error("[acceso-maestro] no se pudo crear la cuenta:", error.message);
      return NextResponse.json({ mensaje: "No se pudo entrar." }, { status: 500 });
    }
  } else if (!correoExistente) {
    // Solo se le pone correo a quien no tiene: hace falta para el enlace.
    const { error } = await admin.auth.admin.updateUserById(existente.id, {
      email: correoInterno,
      email_confirm: true,
    });
    if (error) {
      console.error("[acceso-maestro] no se pudo preparar el acceso:", error.message);
      return NextResponse.json({ mensaje: "No se pudo entrar." }, { status: 500 });
    }
  }

  const { data: enlace, error: errorEnlace } =
    await admin.auth.admin.generateLink({ type: "magiclink", email: correo });

  const tokenHash = enlace?.properties?.hashed_token;
  if (errorEnlace || !tokenHash) {
    console.error("[acceso-maestro] no se pudo generar el enlace:", errorEnlace?.message);
    return NextResponse.json({ mensaje: "No se pudo entrar." }, { status: 500 });
  }

  const publico = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { data, error } = await publico.auth.verifyOtp({
    token_hash: tokenHash,
    type: "magiclink",
  });

  if (error || !data.session) {
    console.error("[acceso-maestro] no se pudo abrir sesion:", error?.message);
    return NextResponse.json({ mensaje: "No se pudo entrar." }, { status: 500 });
  }

  return NextResponse.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
}

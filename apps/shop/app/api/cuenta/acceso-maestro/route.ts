import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import { normalizeColombianMobile } from "@/lib/phone";

/**
 * Acceso temporal a /cuenta con un codigo unico para todas las clientas.
 *
 * TEMPORAL Y A PETICION DEL EQUIPO. El login normal esta caido —Supabase
 * responde "phone_provider_disabled"— y la plantilla de autenticacion no se
 * puede mandar porque el API publico de Botcake no reenvia parametros de
 * boton. Esto lo tapa mientras tanto.
 *
 * LO QUE ABRE, PARA QUE NADIE LO OLVIDE AQUI: con este codigo, cualquiera
 * que escriba el celular de otra persona entra a su cuenta y ve su nombre,
 * su direccion, su telefono y todo lo que ha comprado. No hay segundo
 * factor que lo impida.
 *
 * Por eso: sin CODIGO_MAESTRO_ACCESO en el entorno esto no existe —
 * responde 404 y no toca nada—, y cada uso queda en los logs con el numero.
 * Apagarlo es borrar la variable y redesplegar.
 */

const CODIGO_MAESTRO = process.env.CODIGO_MAESTRO_ACCESO;

/** Contrasena de un solo uso: nunca sale del servidor. */
function claveEfimera(): string {
  return `tmp-${crypto.randomUUID()}-${Date.now()}`;
}

export async function POST(request: NextRequest) {
  if (!CODIGO_MAESTRO) {
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

  if (String(codigo ?? "").trim() !== CODIGO_MAESTRO) {
    return NextResponse.json({ mensaje: "Codigo incorrecto." }, { status: 401 });
  }

  console.warn(
    `[acceso-maestro] entrada con el codigo general: ${normalizado.e164}`,
  );

  const admin = createAdminSupabaseClient();
  const clave = claveEfimera();

  // Supabase guarda el telefono sin "+".
  const sinMas = normalizado.e164.replace(/^\+/, "");

  // Se busca a la persona; si no existe se crea, para que una clienta que
  // nunca entro pueda ver los pedidos que ya hizo por WhatsApp.
  const { data: lista } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  const existente = lista?.users.find((u) => u.phone === sinMas);

  /**
   * La sesion se abre por correo y no por telefono.
   *
   * El proyecto tiene el proveedor de telefono apagado —de ahi que el login
   * normal este caido— y con el apagado Supabase tampoco deja entrar con
   * telefono y contrasena ("Phone logins are disabled"). El correo si esta
   * habilitado, asi que se usa uno interno derivado del numero. La cuenta
   * conserva el telefono, que es por donde el area de cuenta encuentra sus
   * pedidos.
   */
  const correoInterno = `${sinMas}@wa.militolife.local`;
  // Supabase devuelve email: "" —no null— para las cuentas creadas solo con
  // telefono, y "" no dispara el ??. Sin esto se intentaba entrar con un
  // correo vacio ("missing email or phone").
  const correo = existente?.email?.trim() || correoInterno;

  if (existente) {
    const { error } = await admin.auth.admin.updateUserById(existente.id, {
      password: clave,
      email: correo,
      email_confirm: true,
    });
    if (error) {
      console.error("[acceso-maestro] no se pudo preparar el acceso:", error.message);
      return NextResponse.json({ mensaje: "No se pudo entrar." }, { status: 500 });
    }
  } else {
    const { error } = await admin.auth.admin.createUser({
      phone: sinMas,
      phone_confirm: true,
      email: correoInterno,
      email_confirm: true,
      password: clave,
    });
    if (error) {
      console.error("[acceso-maestro] no se pudo crear la cuenta:", error.message);
      return NextResponse.json({ mensaje: "No se pudo entrar." }, { status: 500 });
    }
  }

  // La sesion se abre aqui y se le devuelve al navegador ya hecha: la clave
  // es de un solo uso y no tiene por que viajar.
  const publico = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { data, error } = await publico.auth.signInWithPassword({
    email: correo,
    password: clave,
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

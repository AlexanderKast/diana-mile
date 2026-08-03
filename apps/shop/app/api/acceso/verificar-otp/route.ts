import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient, createServerSupabaseClient } from "@diana-mile/shared/supabase/server";
import {
  NOMBRE_COOKIE_MI_PLAN,
  OPCIONES_COOKIE_MI_PLAN,
  signMiPlanToken,
} from "@/lib/mi-plan-token";

/**
 * Verifica el codigo de WhatsApp que /api/acceso mando a una cuenta
 * existente y, si es valido, emite la cookie propia de /mi-plan. El codigo
 * lo genero y lo valida Supabase Auth (`verifyOtp`) — aca no se guarda ni
 * compara ningun codigo propio, y el limite de intentos/expiracion es el
 * de Supabase.
 *
 * El telefono contra el que se verifica sale de la CUENTA (lookup por
 * email en el servidor), nunca del body: un atacante no puede pedir
 * verificar contra un numero suyo para entrar a la cuenta de otra persona.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const token = typeof body?.token === "string" ? body.token.trim() : "";

    if (!email || !/^\d{4,8}$/.test(token)) {
      return NextResponse.json({ mensaje: "Faltan datos del codigo." }, { status: 400 });
    }

    const admin = createAdminSupabaseClient();
    const { data: cuenta } = await admin
      .from("usuarios_plan")
      .select("id, telefono")
      .eq("email", email)
      .maybeSingle();

    if (!cuenta?.telefono) {
      return NextResponse.json(
        { mensaje: "Esa cuenta no tiene un celular guardado." },
        { status: 400 },
      );
    }

    const supabaseAuth = await createServerSupabaseClient();
    const { error } = await supabaseAuth.auth.verifyOtp({
      phone: cuenta.telefono,
      token,
      type: "sms",
    });

    if (error) {
      return NextResponse.json(
        { mensaje: "Codigo incorrecto o vencido. Revisa e intenta de nuevo." },
        { status: 401 },
      );
    }

    await admin
      .from("usuarios_plan")
      .update({ ultimo_acceso: new Date().toISOString() })
      .eq("id", cuenta.id);

    const respuesta = NextResponse.json({ ok: true });
    respuesta.cookies.set(
      NOMBRE_COOKIE_MI_PLAN,
      signMiPlanToken(cuenta.id),
      OPCIONES_COOKIE_MI_PLAN,
    );
    return respuesta;
  } catch (error) {
    console.error("[acceso/verificar-otp] error:", error);
    return NextResponse.json(
      { mensaje: "No pudimos verificar el codigo. Intenta de nuevo." },
      { status: 500 },
    );
  }
}

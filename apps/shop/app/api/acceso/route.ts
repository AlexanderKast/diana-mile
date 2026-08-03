import { NextRequest, NextResponse, after } from "next/server";
import {
  createAdminSupabaseClient,
  createServerSupabaseClient,
} from "@diana-mile/shared/supabase/server";
import { normalizeTelefonoInternacional } from "@/lib/phone-internacional";
import {
  signMiPlanToken,
  NOMBRE_COOKIE_MI_PLAN,
  OPCIONES_COOKIE_MI_PLAN,
} from "@/lib/mi-plan-token";

/**
 * Puerta de acceso al panel pre-venta (/mi-plan): la persona deja
 * nombre/email (+ telefono opcional) y entra por link magico de Supabase
 * Auth — SIN password, y sin el OTP de WhatsApp que usa /cuenta (esa es
 * la sesion de clientas que YA COMPRARON; esta es pre-venta).
 *
 * Trabajo de esta ruta, en orden:
 *   1. Crea o actualiza la fila en `usuarios_plan`, vinculada a
 *      `quiz_respuesta_id` si vino uno (copiando pais/zona_oferta de esa
 *      fila del quiz).
 *   2. Dispara `signInWithOtp` con email — eso es lo que genera y manda el
 *      link magico. No requiere password ni que la persona ya exista en
 *      auth.users (`shouldCreateUser: true`).
 *   3. Best-effort: webhook de bienvenida a n8n, si esta configurado.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type BodyAcceso = {
  quizRespuestaId?: string;
  nombre?: string;
  email?: string;
  telefono?: string;
};

export async function POST(request: NextRequest) {
  let body: BodyAcceso;
  try {
    body = (await request.json()) as BodyAcceso;
  } catch {
    return NextResponse.json({ mensaje: "Datos invalidos." }, { status: 400 });
  }

  const nombre = body.nombre?.trim();
  const email = body.email?.trim().toLowerCase();
  const quizRespuestaId = body.quizRespuestaId?.trim() || null;

  if (!nombre) {
    return NextResponse.json(
      { mensaje: "Contanos tu nombre." },
      { status: 400 },
    );
  }

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { mensaje: "Ingresa un email valido." },
      { status: 400 },
    );
  }

  let telefonoNormalizado: string | null = null;
  if (body.telefono?.trim()) {
    const normalizado = normalizeTelefonoInternacional(body.telefono.trim());
    if (!normalizado) {
      return NextResponse.json(
        { mensaje: "Ese telefono no parece valido." },
        { status: 400 },
      );
    }
    telefonoNormalizado = normalizado.digits;
  }

  const admin = createAdminSupabaseClient();

  // Copia pais/zona_oferta de la fila de quiz_respuestas, si vino un id.
  // No es fatal si no se encuentra: el registro sigue sin esos datos en
  // vez de bloquear a alguien que llega a /acceso sin haber hecho el quiz.
  let pais: string | null = null;
  let zonaOferta: string | null = null;

  if (quizRespuestaId) {
    const { data: filaQuiz, error: errorQuiz } = await admin
      .from("quiz_respuestas")
      .select("pais, zona_oferta")
      .eq("id", quizRespuestaId)
      .maybeSingle();

    if (errorQuiz) {
      console.error("[acceso] error leyendo quiz_respuestas:", errorQuiz.message);
    } else if (filaQuiz) {
      pais = filaQuiz.pais;
      zonaOferta = filaQuiz.zona_oferta;
    }
  }

  // Identidad anonima del funnel (cookie de proxy.ts): al registrarse, el
  // historial anonimo de quizzes queda unido a la cuenta. De la cookie del
  // request, nunca del body.
  const visitanteId = request.cookies.get("ml_visitante")?.value ?? null;

  const datosUsuario = {
    nombre,
    email,
    telefono: telefonoNormalizado,
    quiz_respuesta_id: quizRespuestaId,
    pais,
    zona_oferta: zonaOferta,
    visitante_id: visitanteId,
  };

  try {
    // Busca primero por email (identidad de la sesion que crea el link
    // magico); si no existe, por quiz_respuesta_id (la persona pudo haber
    // dejado telefono en un paso previo sin email todavia). Si ninguno
    // aparece, es una fila nueva.
    const { data: porEmail } = await admin
      .from("usuarios_plan")
      .select("id, nombre, telefono, quiz_respuesta_id, pais, zona_oferta, visitante_id")
      .eq("email", email)
      .maybeSingle();

    let usuarioId = porEmail?.id as string | undefined;
    let filaExistente = porEmail ?? null;

    if (!usuarioId && quizRespuestaId) {
      const { data: porQuiz } = await admin
        .from("usuarios_plan")
        .select("id, nombre, telefono, quiz_respuesta_id, pais, zona_oferta, visitante_id")
        .eq("quiz_respuesta_id", quizRespuestaId)
        .maybeSingle();
      usuarioId = porQuiz?.id as string | undefined;
      filaExistente = porQuiz ?? null;
    }

    // Capturado ANTES de crear/actualizar: decide si esta llamada puede
    // recibir sesion inmediata o no. Ver el porque justo abajo, donde se usa.
    const filaYaExistia = Boolean(usuarioId);

    if (usuarioId) {
      // Este endpoint es publico y no exige sesion (es justamente el punto
      // de entrada). Sin este guard, cualquiera que sepa/adivine el email
      // de otra persona podria reescribir su nombre/telefono/quiz_respuesta_id
      // con solo un POST. Por eso el update SOLO rellena campos que hoy
      // estan en null en la fila existente — nunca pisa un valor ya guardado.
      // Quien ya tiene cuenta y reenvia el formulario solo dispara un link
      // magico nuevo, no una reescritura de sus datos.
      const datosSeguros = {
        nombre: filaExistente?.nombre ?? datosUsuario.nombre,
        telefono: filaExistente?.telefono ?? datosUsuario.telefono,
        quiz_respuesta_id:
          filaExistente?.quiz_respuesta_id ?? datosUsuario.quiz_respuesta_id,
        pais: filaExistente?.pais ?? datosUsuario.pais,
        zona_oferta: filaExistente?.zona_oferta ?? datosUsuario.zona_oferta,
        // Mismo criterio fill-null que el resto: nunca pisa el visitante
        // ya vinculado (este endpoint es publico — un POST ajeno con el
        // email de otra persona no puede re-atar su cuenta a otra cookie).
        visitante_id: filaExistente?.visitante_id ?? datosUsuario.visitante_id,
      };

      const { error: errorUpdate } = await admin
        .from("usuarios_plan")
        .update(datosSeguros)
        .eq("id", usuarioId);

      if (errorUpdate) throw errorUpdate;
    } else {
      const { data: nuevo, error: errorInsert } = await admin
        .from("usuarios_plan")
        .insert(datosUsuario)
        .select("id")
        .single();

      if (errorInsert || !nuevo) {
        throw errorInsert ?? new Error("No se pudo crear la cuenta.");
      }
      usuarioId = nuevo.id;
    }

    // Sesion propia de /mi-plan: se emite YA, sin esperar a que confirme el
    // correo — pero SOLO si la cuenta es nueva en este mismo request. Este
    // endpoint es publico y sin autenticar: si `filaYaExistia` es true,
    // alguien esta usando un email que YA tiene cuenta, y no hay forma de
    // saber aca si es su dueño real o alguien que solo sabe/adivino ese
    // email. Emitir la cookie en ese caso era un account takeover de un
    // POST (hallazgo de seguridad real, arreglado el mismo dia). Para
    // cuentas existentes se vuelve a exigir el link magico normal — eso SI
    // prueba que el email es suyo, porque solo el dueño puede clickearlo.
    const esCuentaNueva = !filaYaExistia;
    const miPlanToken = esCuentaNueva ? signMiPlanToken(usuarioId!) : null;

    // El link magico: signInWithOtp con email, sin password. Se usa el
    // MISMO patron de cliente Supabase que /cuenta/login (@supabase/ssr,
    // no supabase-js "pelado") porque este proyecto corre en flujo PKCE
    // (ver createBrowserClient/createServerClient en packages/shared): el
    // cliente aca escribe la cookie "code_verifier" en la respuesta de ESTE
    // POST, el navegador la guarda, y /auth/callback la usa para canjear el
    // "?code=" del link magico por la sesion. Con un cliente supabase-js
    // sin cookies (flowType "implicit" por defecto) el link llegaria con
    // el token en el fragmento (#access_token=...) y el callback en server
    // no podria leerlo ni canjear nada — por eso NO se usa createPublicClient().
    //
    // Best-effort a proposito: si el envio de correo falla, la persona igual
    // entra a /mi-plan con la cookie de arriba. Antes esto era un 500 que
    // tumbaba el acceso entero por un problema que no era culpa suya.
    const supabaseAuth = await createServerSupabaseClient();
    const { error: otpError } = await supabaseAuth.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${request.nextUrl.origin}/auth/callback?next=/mi-plan`,
      },
    });

    if (otpError) {
      console.error(
        "[acceso] error enviando link magico (no bloquea el acceso):",
        otpError.message,
      );
    }

    // Webhook de bienvenida a n8n — opcional y best-effort. Va envuelto en
    // `after()` (la API real de esta version de Next para trabajo posterior
    // a la respuesta; el equivalente a `waitUntil` en runtimes serverless
    // como Vercel — ver node_modules/next/dist/docs/.../after.md). Una
    // promesa suelta sin esto se corta apenas el response sale: el request
    // devuelve 200 pero el webhook nunca llega.
    const webhookUrl = process.env.N8N_WEBHOOK_BIENVENIDA_URL;
    if (webhookUrl) {
      after(async () => {
        try {
          await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              usuarioId,
              nombre,
              email,
              telefono: telefonoNormalizado,
              pais,
              zonaOferta,
              quizRespuestaId,
            }),
          });
        } catch (webhookError) {
          console.error("[acceso] webhook de bienvenida fallo:", webhookError);
        }
      });
    } else {
      console.warn(
        "[acceso] N8N_WEBHOOK_BIENVENIDA_URL no esta configurada — se omite el webhook de bienvenida.",
      );
    }

    // `requiereConfirmacion: true` le dice al formulario que mande a
    // /acceso/revisa-correo en vez de entrar directo a /mi-plan — es el
    // caso "email ya tenia cuenta", donde no se emitio cookie.
    const respuesta = NextResponse.json({
      ok: true,
      requiereConfirmacion: !esCuentaNueva,
    });
    if (miPlanToken) {
      respuesta.cookies.set(NOMBRE_COOKIE_MI_PLAN, miPlanToken, OPCIONES_COOKIE_MI_PLAN);
    }
    return respuesta;
  } catch (error) {
    console.error("[acceso] error creando/actualizando usuarios_plan:", error);

    // 23505 = unique_violation en Postgres. Solo puede ser el telefono (el
    // email ya se busca antes de escribir): otra cuenta ya lo esta usando.
    const esConflictoTelefono =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "23505";

    return NextResponse.json(
      {
        mensaje: esConflictoTelefono
          ? "Ese celular ya esta registrado con otro email."
          : "No pudimos guardar tus datos. Intenta de nuevo.",
      },
      { status: esConflictoTelefono ? 409 : 500 },
    );
  }
}

import { cookies } from "next/headers";
import {
  createAdminSupabaseClient,
  createServerSupabaseClient,
} from "@diana-mile/shared/supabase/server";
import type { QuizPuerta } from "@/lib/quiz/tipos";
import { CONTRATOS_RESULTADO } from "@/lib/quiz/puertas/contratos";
import { NOMBRE_COOKIE_MI_PLAN, verifyMiPlanToken } from "@/lib/mi-plan-token";

/**
 * Capa de datos del panel pre-venta (/mi-plan). Centraliza aca lo que antes
 * era un placeholder en mi-plan/page.tsx: quien es la usuaria logueada (por
 * EMAIL, ver usuario_plan_actual() en la migracion), su diagnostico y sus 8
 * semanas de `plan_progreso` — reusado por page.tsx, semana/[n]/page.tsx y
 * progreso/page.tsx para no triplicar la misma lectura.
 *
 * Usa siempre el cliente admin (service_role) para leer/escribir, igual que
 * el resto del funnel: `plan_progreso` y `usuarios_plan` solo tienen
 * politica de LECTURA propia para `authenticated` (ver migracion
 * 20260752000000_funnel_quiz_plan.sql) — no hay politica de escritura para
 * ese rol, asi que sembrar semanas o marcar un check-in tiene que pasar por
 * el backend con service_role, nunca desde el cliente directo a Supabase.
 */

export type UsuarioPlan = {
  id: string;
  nombre: string | null;
  email: string | null;
  zona_oferta: "co_cod" | "usd_premium" | null;
  pais: string | null;
  quiz_respuesta_id: string | null;
  /** Instante del primer registro en usuarios_plan — dia 0 del reto de 7 dias, ver lib/reto.ts. */
  creado_en: string;
};

export type FilaPlanProgreso = {
  id: string;
  semana: number;
  desbloqueada_en: string | null;
  completada: boolean;
  notas: string | null;
};

export type DiagnosticoPanel = {
  puerta: QuizPuerta;
  segmento: string;
  fechaObjetivo: string | null;
  score: number | null;
};

export type ContextoMiPlan = {
  usuario: UsuarioPlan;
  progreso: FilaPlanProgreso[];
  diagnostico: DiagnosticoPanel | null;
};

/**
 * Resuelve "quien es la usuaria logueada" y devuelve su fila de
 * `usuarios_plan`, o `null` si no hay ninguna credencial valida. Dos
 * credenciales posibles, cualquiera alcanza (ver proxy.ts, que ya dejo
 * pasar si cualquiera de las dos es valida):
 *
 *   1. La cookie propia de /mi-plan (lib/mi-plan-token.ts) — se emite en
 *      /api/acceso sin esperar confirmacion de email. Se revisa PRIMERO
 *      porque no requiere ida y vuelta a Supabase Auth.
 *   2. La sesion de Supabase Auth (link magico confirmado, por email) —
 *      sigue funcionando para quien entra desde otro dispositivo o
 *      efectivamente hizo click en el correo.
 *
 * Este es el UNICO lugar donde vive ese emparejamiento credencial→fila;
 * `obtenerContextoMiPlan` (abajo) y `lib/reto.ts` lo reusan en vez de
 * repetir la misma consulta.
 */
export async function obtenerUsuarioPlanPorSesion(): Promise<UsuarioPlan | null> {
  const admin = createAdminSupabaseClient();

  const cookieStore = await cookies();
  const usuarioIdPorCookie = verifyMiPlanToken(
    cookieStore.get(NOMBRE_COOKIE_MI_PLAN)?.value ?? "",
  );

  if (usuarioIdPorCookie) {
    const { data: usuario, error } = await admin
      .from("usuarios_plan")
      .select("id, nombre, email, zona_oferta, pais, quiz_respuesta_id, creado_en")
      .eq("id", usuarioIdPorCookie)
      .maybeSingle<UsuarioPlan>();

    if (error) {
      console.error("[mi-plan] error leyendo usuarios_plan por cookie:", error.message);
    } else if (usuario) {
      return usuario;
    }
    // Cookie firmada valida pero la fila ya no existe: sigue de largo y
    // prueba con la sesion de Supabase antes de rendirse.
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  const { data: usuario, error } = await admin
    .from("usuarios_plan")
    .select("id, nombre, email, zona_oferta, pais, quiz_respuesta_id, creado_en")
    .eq("email", user.email.toLowerCase())
    .maybeSingle<UsuarioPlan>();

  if (error) {
    console.error("[mi-plan] error leyendo usuarios_plan por sesion:", error.message);
    return null;
  }

  return usuario;
}

const TOTAL_SEMANAS = 8;
const DIAS_ENTRE_SEMANAS = 7;

/** true si ya llego la fecha de desbloqueo (o nunca la tuvo bloqueada). */
export function semanaDesbloqueada(fila: FilaPlanProgreso): boolean {
  if (!fila.desbloqueada_en) return false;
  return new Date(fila.desbloqueada_en).getTime() <= Date.now();
}

/** "8 de agosto" — para la fecha de apertura de una semana todavia bloqueada. */
export function formatearFechaDesbloqueo(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
  });
}

async function obtenerFilasProgreso(
  admin: ReturnType<typeof createAdminSupabaseClient>,
  usuarioId: string,
): Promise<FilaPlanProgreso[]> {
  const { data, error } = await admin
    .from("plan_progreso")
    .select("id, semana, desbloqueada_en, completada, notas")
    .eq("usuario_id", usuarioId)
    .order("semana", { ascending: true });

  if (error) {
    console.error("[mi-plan] error leyendo plan_progreso:", error.message);
    return [];
  }

  return (data ?? []) as FilaPlanProgreso[];
}

/**
 * Siembra las 8 filas de plan_progreso la primera vez que la usuaria entra
 * al panel — semana 1 desbloqueada ya mismo, semanas 2-8 cada 7 dias desde
 * ESE mismo instante (una sola base `ahora`, no recalculada fila por fila).
 *
 * Idempotente: `upsert` con `ignoreDuplicates` sobre el UNIQUE
 * (usuario_id, semana) hace que reintentar (dos pestañas abriendo el panel
 * a la vez, o simplemente volver a visitar) nunca duplique ni pise una fila
 * que ya tiene progreso real.
 */
async function sembrarPlanProgreso(
  admin: ReturnType<typeof createAdminSupabaseClient>,
  usuarioId: string,
): Promise<void> {
  const ahora = new Date();

  const filas = Array.from({ length: TOTAL_SEMANAS }, (_, i) => {
    const numero = i + 1;
    const desbloqueadaEn = new Date(ahora);
    desbloqueadaEn.setDate(desbloqueadaEn.getDate() + DIAS_ENTRE_SEMANAS * (numero - 1));

    return {
      usuario_id: usuarioId,
      semana: numero,
      desbloqueada_en: desbloqueadaEn.toISOString(),
      completada: false,
    };
  });

  const { error } = await admin
    .from("plan_progreso")
    .upsert(filas, { onConflict: "usuario_id,semana", ignoreDuplicates: true });

  if (error) {
    console.error("[mi-plan] error sembrando plan_progreso:", error.message);
  }
}

/**
 * Punto de entrada unico para las 3 rutas de /mi-plan. Devuelve `null` si no
 * hay sesion o si la sesion no tiene fila en `usuarios_plan` todavia (no
 * deberia pasar en el flujo normal: /api/acceso crea la fila ANTES de
 * mandar el link magico — pero una sesion huerfana no puede tumbar el
 * panel, cada pagina que llama esto decide como mostrarlo).
 */
export async function obtenerContextoMiPlan(): Promise<ContextoMiPlan | null> {
  const usuario = await obtenerUsuarioPlanPorSesion();
  if (!usuario) return null;

  const admin = createAdminSupabaseClient();

  let progreso = await obtenerFilasProgreso(admin, usuario.id);
  if (progreso.length < TOTAL_SEMANAS) {
    await sembrarPlanProgreso(admin, usuario.id);
    progreso = await obtenerFilasProgreso(admin, usuario.id);
  }

  let diagnostico: DiagnosticoPanel | null = null;
  if (usuario.quiz_respuesta_id) {
    const { data: filaQuiz, error: errorQuiz } = await admin
      .from("quiz_respuestas")
      .select("puerta, segmento, fecha_objetivo, score")
      .eq("id", usuario.quiz_respuesta_id)
      .maybeSingle();

    if (errorQuiz) {
      console.error("[mi-plan] error leyendo quiz_respuestas:", errorQuiz.message);
    } else if (
      filaQuiz?.segmento &&
      CONTRATOS_RESULTADO[filaQuiz.puerta as QuizPuerta]?.segmentos[filaQuiz.segmento] !== undefined
    ) {
      diagnostico = {
        puerta: filaQuiz.puerta as QuizPuerta,
        segmento: filaQuiz.segmento,
        fechaObjetivo: filaQuiz.fecha_objetivo,
        score: filaQuiz.score,
      };
    }
  }

  return { usuario, progreso, diagnostico };
}

/**
 * Marca (o desmarca) el check-in de una semana — SOLO si le pertenece a
 * `usuarioId` y SOLO si ya esta desbloqueada. Devuelve la fila actualizada o
 * `null` si no aplico (no es duena de la fila, semana fuera de rango, o
 * todavia bloqueada).
 *
 * Vive aca (no en la ruta /api directamente) para que el mismo chequeo de
 * pertenencia/desbloqueo sirva tanto al API route como a un futuro caller
 * server-side sin duplicar la logica.
 */
export async function marcarCheckIn(
  usuarioId: string,
  semana: number,
  completada: boolean,
): Promise<FilaPlanProgreso | null> {
  const admin = createAdminSupabaseClient();

  const { data: fila, error: errorLectura } = await admin
    .from("plan_progreso")
    .select("id, semana, desbloqueada_en, completada, notas")
    .eq("usuario_id", usuarioId)
    .eq("semana", semana)
    .maybeSingle<FilaPlanProgreso>();

  if (errorLectura || !fila) {
    if (errorLectura) {
      console.error("[mi-plan] error leyendo fila para check-in:", errorLectura.message);
    }
    return null;
  }

  if (!semanaDesbloqueada(fila)) return null;

  const { data: filaActualizada, error: errorUpdate } = await admin
    .from("plan_progreso")
    .update({ completada })
    .eq("id", fila.id)
    .select("id, semana, desbloqueada_en, completada, notas")
    .single<FilaPlanProgreso>();

  if (errorUpdate || !filaActualizada) {
    console.error(
      "[mi-plan] error actualizando check-in:",
      errorUpdate?.message ?? "sin fila devuelta",
    );
    return null;
  }

  return filaActualizada;
}

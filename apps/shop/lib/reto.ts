import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import { obtenerUsuarioPlanPorSesion } from "@/lib/mi-plan";
import type { QuizPuerta } from "@/lib/quiz/tipos";
import { TOTAL_DIAS_RETO, type ZonaOferta } from "@/lib/quiz/puertas/reto-contenido";

/**
 * Capa de datos del reto de 7 dias — el periodo de venta del funnel.
 * Espejo de `lib/mi-plan.ts` pero para `reto_progreso` en vez de
 * `plan_progreso`, con dos diferencias de fondo:
 *
 *   1. `reto_progreso` NO tiene columna `desbloqueada_en` (a diferencia de
 *      `plan_progreso`): el desbloqueo del dia N se CALCULA en cada lectura
 *      a partir de una unica fecha base (`usuarios_plan.creado_en`, el
 *      instante en que la persona entro por primera vez a /api/acceso), no
 *      se siembra por adelantado. Por eso no existe un `sembrarRetoProgreso`
 *      — no hace falta escribir nada hasta que la persona completa un dia.
 *   2. Dos formas de resolver "quien es el usuario": por SESION (panel web,
 *      reusa `obtenerUsuarioPlanPorSesion` de lib/mi-plan.ts — mismo patron,
 *      cero duplicado) o por IDENTIFICADOR explicito (email o id, para los
 *      endpoints que consulta n8n, que no tiene sesion de navegador).
 */

export type UsuarioPlanReto = {
  id: string;
  email: string | null;
  zona_oferta: ZonaOferta | null;
  creado_en: string;
  /**
   * Puerta de origen del diagnostico — solo se resuelve en el camino por
   * SESION (`obtenerContextoReto`, el que usa la pantalla /mi-plan/reto para
   * elegir el link de ritual correcto). `buscarUsuarioPlanPorIdentificador`
   * (usado por los endpoints que consulta n8n, que no necesitan esto) no la
   * trae — por eso es opcional en vez de forzar esa lectura extra ahi.
   */
  puerta?: QuizPuerta;
};

const PUERTA_POR_DEFECTO: QuizPuerta = "piel";

/** `null`/vacio o fila borrada -> puerta por defecto, nunca rompe la pantalla. */
async function resolverPuertaUsuario(
  admin: ReturnType<typeof createAdminSupabaseClient>,
  quizRespuestaId: string | null,
): Promise<QuizPuerta> {
  if (!quizRespuestaId) return PUERTA_POR_DEFECTO;

  const { data, error } = await admin
    .from("quiz_respuestas")
    .select("puerta")
    .eq("id", quizRespuestaId)
    .maybeSingle();

  if (error || !data?.puerta) return PUERTA_POR_DEFECTO;
  return data.puerta as QuizPuerta;
}

export type FilaRetoProgreso = {
  id: string;
  dia: number;
  completado_en: string | null;
};

export type ContextoReto = {
  usuario: UsuarioPlanReto;
  progreso: FilaRetoProgreso[];
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Fecha de desbloqueo del `dia` N: la fecha base + (N-1) dias. */
export function fechaDesbloqueoDia(fechaBaseIso: string, dia: number): Date {
  const fecha = new Date(fechaBaseIso);
  fecha.setDate(fecha.getDate() + (dia - 1));
  return fecha;
}

/** true si ya llego la fecha de desbloqueo de ese dia. */
export function diaDesbloqueadoReto(fechaBaseIso: string, dia: number): boolean {
  return fechaDesbloqueoDia(fechaBaseIso, dia).getTime() <= Date.now();
}

/** El dia mas alto ya desbloqueado (1-7). Nunca baja de 1. */
export function diaActualReto(fechaBaseIso: string): number {
  for (let dia = TOTAL_DIAS_RETO; dia >= 1; dia--) {
    if (diaDesbloqueadoReto(fechaBaseIso, dia)) return dia;
  }
  return 1;
}

/** "8 de agosto" — mismo formato que `formatearFechaDesbloqueo` de mi-plan.ts. */
export function formatearFechaDesbloqueoReto(fecha: Date): string {
  return fecha.toLocaleDateString("es-CO", { day: "numeric", month: "long" });
}

/**
 * Racha actual: dias CONSECUTIVOS completados terminando en el dia
 * completado mas alto. Como los dias del reto se desbloquean uno por dia
 * calendario (ver `fechaDesbloqueoDia`), dias consecutivos del reto son
 * dias calendario consecutivos — no hace falta mirar el timestamp, solo la
 * continuidad de los numeros de dia. Ej: completo 1,2,3 y 5 -> racha 1
 * (solo el 5); completo 1,2,3 -> racha 3.
 */
export function calcularRachaReto(filas: FilaRetoProgreso[]): number {
  const completados = new Set(
    filas.filter((f) => f.completado_en !== null).map((f) => f.dia),
  );
  if (completados.size === 0) return 0;

  const diaMasAlto = Math.max(...completados);
  let racha = 0;
  for (let dia = diaMasAlto; dia >= 1 && completados.has(dia); dia--) {
    racha++;
  }
  return racha;
}

async function obtenerFilasRetoProgreso(
  admin: ReturnType<typeof createAdminSupabaseClient>,
  usuarioId: string,
): Promise<FilaRetoProgreso[]> {
  const { data, error } = await admin
    .from("reto_progreso")
    .select("id, dia, completado_en")
    .eq("usuario_id", usuarioId)
    .order("dia", { ascending: true });

  if (error) {
    console.error("[reto] error leyendo reto_progreso:", error.message);
    return [];
  }

  return (data ?? []) as FilaRetoProgreso[];
}

/**
 * Punto de entrada para la ruta web `/mi-plan/reto`: resuelve el usuario por
 * SESION (igual que `obtenerContextoMiPlan`) y trae su progreso. `null` si
 * no hay sesion o la sesion es huerfana.
 */
export async function obtenerContextoReto(): Promise<ContextoReto | null> {
  const usuario = await obtenerUsuarioPlanPorSesion();
  if (!usuario) return null;

  const admin = createAdminSupabaseClient();
  const [progreso, puerta] = await Promise.all([
    obtenerFilasRetoProgreso(admin, usuario.id),
    resolverPuertaUsuario(admin, usuario.quiz_respuesta_id),
  ]);

  return {
    usuario: {
      id: usuario.id,
      email: usuario.email,
      zona_oferta: usuario.zona_oferta,
      creado_en: usuario.creado_en,
      puerta,
    },
    progreso,
  };
}

/**
 * Resuelve el usuario por IDENTIFICADOR explicito (email o el UUID de
 * `usuarios_plan.id`) — lo que usan los tres endpoints de `/api/reto/**`
 * que consulta n8n, donde no hay sesion de navegador para emparejar por
 * cookie. Un UUID valido se busca por `id`; cualquier otra cosa se trata
 * como email (normalizado a minusculas).
 */
export async function buscarUsuarioPlanPorIdentificador(
  identificador: string,
): Promise<UsuarioPlanReto | null> {
  const valor = identificador.trim();
  if (!valor) return null;

  const esUUID = UUID_REGEX.test(valor);
  const admin = createAdminSupabaseClient();

  const { data, error } = await admin
    .from("usuarios_plan")
    .select("id, email, zona_oferta, creado_en")
    .eq(esUUID ? "id" : "email", esUUID ? valor : valor.toLowerCase())
    .maybeSingle<UsuarioPlanReto>();

  if (error) {
    console.error("[reto] error buscando usuario por identificador:", error.message);
    return null;
  }

  return data;
}

/** Progreso de un usuario ya resuelto (por sesion o por identificador). */
export async function obtenerProgresoReto(usuarioId: string): Promise<FilaRetoProgreso[]> {
  const admin = createAdminSupabaseClient();
  return obtenerFilasRetoProgreso(admin, usuarioId);
}

/**
 * Marca (o desmarca) el dia `dia` como completado — SOLO si ya esta
 * desbloqueado segun `usuario.creado_en`. `upsert` sobre el UNIQUE
 * (usuario_id, dia) porque, a diferencia de `plan_progreso`, no hay fila
 * sembrada de antemano: la primera vez que se completa un dia, esta
 * llamada es la que crea la fila. Devuelve `null` si no aplico (dia
 * todavia bloqueado).
 */
export async function marcarDiaReto(
  usuario: UsuarioPlanReto,
  dia: number,
  completado: boolean,
): Promise<FilaRetoProgreso | null> {
  if (!diaDesbloqueadoReto(usuario.creado_en, dia)) return null;

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from("reto_progreso")
    .upsert(
      {
        usuario_id: usuario.id,
        dia,
        completado_en: completado ? new Date().toISOString() : null,
      },
      { onConflict: "usuario_id,dia" },
    )
    .select("id, dia, completado_en")
    .single<FilaRetoProgreso>();

  if (error || !data) {
    console.error(
      "[reto] error marcando dia del reto:",
      error?.message ?? "sin fila devuelta",
    );
    return null;
  }

  return data;
}

/**
 * Compara el header `x-reto-secret` contra `RETO_API_SECRET`. Si la env var
 * no esta configurada, SIEMPRE devuelve `false` (nunca "abierto por
 * accidente" por falta de configuracion) — mismo criterio que `CRON_SECRET`
 * en los crons existentes.
 */
export function validarSecretoReto(headerValue: string | null): boolean {
  const esperado = process.env.RETO_API_SECRET;
  if (!esperado || !headerValue) return false;
  return headerValue === esperado;
}

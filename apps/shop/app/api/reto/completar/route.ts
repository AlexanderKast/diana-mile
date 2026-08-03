import { NextRequest, NextResponse } from "next/server";
import { obtenerUsuarioPlanPorSesion } from "@/lib/mi-plan";
import {
  buscarUsuarioPlanPorIdentificador,
  marcarDiaReto,
  validarSecretoReto,
  type UsuarioPlanReto,
} from "@/lib/reto";
import { TOTAL_DIAS_RETO } from "@/lib/quiz/puertas/reto-contenido";

/**
 * POST /api/reto/completar
 *
 * Marca (o desmarca) un dia del reto como completado. Tiene DOS formas de
 * autenticarse porque lo llaman dos cosas distintas (ver AGENTS de esta
 * tarea):
 *
 *   1. La UI web (`/mi-plan/reto`): sesion de Supabase por cookie, igual
 *      patron que /api/mi-plan/progreso. El usuario sale de la SESION,
 *      nunca del body — nadie puede marcar el dia de otra persona aunque
 *      mande otro id a mano. NO lleva el header `x-reto-secret` (seria
 *      exponer el secreto compartido en el navegador).
 *   2. n8n (webhook, ej. confirmacion por WhatsApp): header
 *      `x-reto-secret` == RETO_API_SECRET + `identificador` (email o
 *      usuarios_plan.id) en el body, porque ahi no hay sesion de navegador.
 *
 * Si NINGUNA de las dos aplica (sin header y sin sesion valida, o header
 * presente pero incorrecto), 401 siempre.
 *
 * Body: { dia: number, completado?: boolean, identificador?: string }
 *   `completado` por defecto true (marcar); false para desmarcar.
 *   `identificador` solo se usa (y es obligatorio) en el modo n8n.
 *
 * Respuesta 200: { fila: { id, dia, completado_en } }
 * Respuesta 409: el dia todavia no esta desbloqueado.
 */
export async function POST(request: NextRequest) {
  let body: { dia?: number; completado?: boolean; identificador?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ mensaje: "Datos invalidos." }, { status: 400 });
  }

  const dia = Number(body.dia);
  const completado = body.completado === undefined ? true : Boolean(body.completado);

  if (!Number.isInteger(dia) || dia < 1 || dia > TOTAL_DIAS_RETO) {
    return NextResponse.json(
      { mensaje: `El dia debe ser un numero entre 1 y ${TOTAL_DIAS_RETO}.` },
      { status: 400 },
    );
  }

  const secretHeader = request.headers.get("x-reto-secret");
  let usuario: UsuarioPlanReto | null;

  if (secretHeader !== null) {
    // Modo n8n: exige el secreto compartido y un identificador explicito.
    if (!validarSecretoReto(secretHeader)) {
      return NextResponse.json({ mensaje: "No autorizado." }, { status: 401 });
    }

    const identificador = body.identificador?.trim();
    if (!identificador) {
      return NextResponse.json(
        { mensaje: "Falta identificador." },
        { status: 400 },
      );
    }

    usuario = await buscarUsuarioPlanPorIdentificador(identificador);
  } else {
    // Modo UI web: sesion de Supabase, sin secreto compartido de por medio.
    const usuarioSesion = await obtenerUsuarioPlanPorSesion();
    if (!usuarioSesion) {
      return NextResponse.json({ mensaje: "Sesion invalida." }, { status: 401 });
    }
    usuario = usuarioSesion;
  }

  if (!usuario) {
    return NextResponse.json({ mensaje: "No encontramos tu cuenta." }, { status: 404 });
  }

  const filaActualizada = await marcarDiaReto(usuario, dia, completado);

  if (!filaActualizada) {
    return NextResponse.json(
      { mensaje: "Ese dia todavia no esta disponible." },
      { status: 409 },
    );
  }

  return NextResponse.json({ fila: filaActualizada });
}

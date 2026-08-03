import { NextRequest, NextResponse } from "next/server";
import {
  buscarUsuarioPlanPorIdentificador,
  diaActualReto,
  obtenerProgresoReto,
  validarSecretoReto,
} from "@/lib/reto";
import { TOTAL_DIAS_RETO } from "@/lib/quiz/puertas/reto-contenido";

/**
 * GET /api/reto/estado?identificador=<email o usuarios_plan.id>
 *
 * Consumido por n8n para saber en que dia del reto esta una persona (y su
 * zona_oferta) antes de armar el mensaje de WhatsApp del dia. NUNCA
 * publico: exige el header `x-reto-secret` igual a la env var
 * `RETO_API_SECRET` — sin eso, o con el valor equivocado, 401 SIEMPRE,
 * antes de tocar la base de datos. Sin esta capa, cualquiera podria pasar
 * el email de otra persona y leer en que dia del reto va.
 *
 * Respuesta 200:
 *   {
 *     usuarioId: string,
 *     dia: number,              // 1-7, el mas alto ya desbloqueado
 *     totalDias: 7,
 *     zonaOferta: "co_cod" | "usd_premium" | null,
 *     diasCompletados: number[] // ej. [1, 2, 3]
 *   }
 */
export async function GET(request: NextRequest) {
  if (!validarSecretoReto(request.headers.get("x-reto-secret"))) {
    return NextResponse.json({ mensaje: "No autorizado." }, { status: 401 });
  }

  const identificador = request.nextUrl.searchParams.get("identificador")?.trim();
  if (!identificador) {
    return NextResponse.json(
      { mensaje: "Falta el parametro identificador." },
      { status: 400 },
    );
  }

  const usuario = await buscarUsuarioPlanPorIdentificador(identificador);
  if (!usuario) {
    return NextResponse.json({ mensaje: "Usuario no encontrado." }, { status: 404 });
  }

  const progreso = await obtenerProgresoReto(usuario.id);

  return NextResponse.json({
    usuarioId: usuario.id,
    dia: diaActualReto(usuario.creado_en),
    totalDias: TOTAL_DIAS_RETO,
    zonaOferta: usuario.zona_oferta,
    // Puerta del diagnostico — n8n la encadena a /api/reto/contenido/[dia]
    // ?puerta= para mandar el mensaje del reto correcto por WhatsApp.
    puerta: usuario.puerta ?? "piel",
    diasCompletados: progreso
      .filter((fila) => fila.completado_en !== null)
      .map((fila) => fila.dia),
  });
}

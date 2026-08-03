import { NextRequest, NextResponse } from "next/server";
import { marcarCheckIn, marcarDiaPlan, obtenerUsuarioPlanPorSesion } from "@/lib/mi-plan";

/**
 * Check-in de una semana del panel pre-venta: marca/desmarca `completada` en
 * `plan_progreso`. No se puede hacer desde el cliente directo a Supabase
 * (esa tabla solo tiene politica de LECTURA propia para `authenticated`,
 * ver migracion 20260752000000) — por eso este endpoint, que valida sesion
 * aca y escribe con service_role dentro de `marcarCheckIn()`.
 *
 * proxy.ts ya exige credencial (cookie propia o sesion Supabase) para
 * cualquier ruta bajo /mi-plan/**, pero esa proteccion es de PAGINAS
 * (matcher "/mi-plan/:path*"), no cubre /api/mi-plan/** — se repite la
 * verificacion aca, reusando `obtenerUsuarioPlanPorSesion` (misma logica de
 * las dos credenciales que ya usan mi-plan/page.tsx y lib/reto.ts).
 */
export async function POST(request: NextRequest) {
  const usuario = await obtenerUsuarioPlanPorSesion();

  if (!usuario) {
    return NextResponse.json({ mensaje: "Sesion invalida." }, { status: 401 });
  }

  let body: { semana?: number; dia?: number; completada?: boolean; notas?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ mensaje: "Datos invalidos." }, { status: 400 });
  }

  const semana = Number(body.semana);
  const completada = Boolean(body.completada);

  if (!Number.isInteger(semana) || semana < 1 || semana > 8) {
    return NextResponse.json({ mensaje: "Semana invalida." }, { status: 400 });
  }

  // Con `dia` presente (1-7): check-in DIARIO (Fase 22), independiente del
  // check-in semanal y de las notas — no toca esos campos.
  if (body.dia !== undefined) {
    const dia = Number(body.dia);
    if (!Number.isInteger(dia) || dia < 1 || dia > 7) {
      return NextResponse.json({ mensaje: "Dia invalido." }, { status: 400 });
    }

    // El usuario_id sale de la credencial resuelta arriba, nunca del body.
    const filaActualizada = await marcarDiaPlan(usuario.id, semana, dia, completada);

    if (!filaActualizada) {
      return NextResponse.json(
        { mensaje: "Ese dia todavia no esta disponible." },
        { status: 409 },
      );
    }

    return NextResponse.json({ fila: filaActualizada });
  }

  // Notas personales de la semana — opcionales, tope 2000 caracteres.
  // `undefined` = no tocar las notas existentes (un check-in solo).
  let notas: string | undefined;
  if (typeof body.notas === "string") {
    notas = body.notas.slice(0, 2000);
  }

  // El usuario_id sale de la credencial resuelta arriba, nunca del body:
  // quien llama solo puede afectar su propia fila, jamas la de otra persona
  // aunque intente mandar otro id a mano.
  const filaActualizada = await marcarCheckIn(usuario.id, semana, completada, notas);

  if (!filaActualizada) {
    return NextResponse.json(
      { mensaje: "Esa semana todavia no esta disponible." },
      { status: 409 },
    );
  }

  return NextResponse.json({ fila: filaActualizada });
}

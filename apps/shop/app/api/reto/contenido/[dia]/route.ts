import { NextRequest, NextResponse } from "next/server";
import { validarSecretoReto } from "@/lib/reto";
import {
  esPuertaReto,
  obtenerContenidoReto,
  TOTAL_DIAS_RETO,
  type ZonaOferta,
} from "@/lib/quiz/puertas/reto-contenido";

/**
 * GET /api/reto/contenido/[dia]?zona=co_cod|usd_premium
 *
 * Consumido por n8n para traer el copy exacto del dia (mismo texto que ve
 * la persona en el panel web) y armar el mensaje de WhatsApp. NUNCA
 * publico: exige `x-reto-secret` == `RETO_API_SECRET`, igual que
 * /api/reto/estado.
 *
 * `zona` solo importa para el dia 7 (unico que se bifurca por
 * zona_oferta, ver reto-contenido.ts); si falta o viene otro valor, cae a
 * "co_cod" (la variante sin coaching — el default mas seguro, nunca se
 * ofrece coaching de mas). El flujo tipico en n8n: primero GET
 * /api/reto/estado para saber el dia y la zona, despues este endpoint con
 * esos dos valores.
 *
 * Respuesta 200: { contenido: { dia, titulo, contenido, tipoVenta } }
 * Respuesta 400: dia fuera de 1-7 o no numerico.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dia: string }> },
) {
  if (!validarSecretoReto(request.headers.get("x-reto-secret"))) {
    return NextResponse.json({ mensaje: "No autorizado." }, { status: 401 });
  }

  const { dia: diaParam } = await params;
  const dia = Number(diaParam);

  if (!Number.isInteger(dia) || dia < 1 || dia > TOTAL_DIAS_RETO) {
    return NextResponse.json(
      { mensaje: `El dia debe ser un numero entre 1 y ${TOTAL_DIAS_RETO}.` },
      { status: 400 },
    );
  }

  const zonaParam = request.nextUrl.searchParams.get("zona");
  const zonaOferta: ZonaOferta = zonaParam === "usd_premium" ? "usd_premium" : "co_cod";

  // Cada funnel tiene su propio plan de 7 dias: `?puerta=` decide el set
  // (viene de /api/reto/estado, que ya la resuelve). Sin parametro o con
  // un valor invalido cae a "piel" — compatible con llamadas anteriores.
  const puertaParam = request.nextUrl.searchParams.get("puerta");
  const puerta = esPuertaReto(puertaParam) ? puertaParam : "piel";

  const contenido = obtenerContenidoReto(dia, zonaOferta, puerta);

  return NextResponse.json({ contenido });
}

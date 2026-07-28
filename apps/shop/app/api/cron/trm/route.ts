import { NextRequest, NextResponse } from "next/server";
import { refrescarTRMHoy } from "@diana-mile/shared/finanzas/trm";

/**
 * Guarda la TRM del dia.
 *
 * Corre a las 12:00 UTC (7:00 en Colombia): la Superintendencia publica
 * la tasa del dia temprano en la manana, asi que a esa hora ya esta.
 *
 * Tenerla cacheada importa porque la API de datos.gov.co se cae a ratos
 * —se comprobo en vivo— y sin cache un costo en dolares no se podria
 * registrar justo ese dia. Con el historico ya guardado, ningun mes
 * anterior depende de que el servicio este arriba.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ mensaje: "No autorizado" }, { status: 401 });
  }

  const tasa = await refrescarTRMHoy();

  if (!tasa) {
    // 200 y no 500: que la fuente externa este caida no es un fallo
    // nuestro, y un 500 haria que Vercel marcara el cron como roto todos
    // los dias que datos.gov.co tenga problemas.
    return NextResponse.json(
      { ok: false, mensaje: "No se pudo consultar la TRM." },
      { status: 200 },
    );
  }

  return NextResponse.json({ ok: true, ...tasa });
}

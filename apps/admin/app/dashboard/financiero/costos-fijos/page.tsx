import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import { montoEnCop, obtenerTRM, hoyISO } from "@diana-mile/shared/finanzas/trm";
import { periodoActual } from "@/lib/financiero";
import { CostosFijos } from "@/components/admin/CostosFijos";

export const metadata = {
  title: "Costos fijos | Milito Life Shop Admin",
};

export const dynamic = "force-dynamic";

export type CostoFijo = {
  id: string;
  categoria: "personal" | "plataformas" | "administrativo";
  concepto: string;
  moneda: "COP" | "USD";
  monto_origen: number;
  monto_cop: number;
  monto_cop_real: number | null;
  dia_cobro: number | null;
  vigente_desde: string;
  vigente_hasta: string | null;
  /** Cuánto costó en pesos este mes, y de dónde salió ese número. */
  cop_mes: number;
  origen_cop: "real" | "trm" | "pesos" | "ultimo_conocido";
  nota_cop: string;
};

export default async function CostosFijosPage() {
  const supabase = createAdminSupabaseClient();
  const hoy = hoyISO();
  const periodo = periodoActual();

  const [filasRes, trm] = await Promise.all([
    supabase
      .from("costos_fijos")
      .select(
        "id, categoria, concepto, moneda, monto_origen, monto_cop, monto_cop_real, dia_cobro, vigente_desde, vigente_hasta",
      )
      .order("categoria")
      .order("monto_cop", { ascending: false }),
    // Se consulta aparte para poder mostrarla aunque no haya ningún costo
    // en dólares todavía: es útil saber a qué tasa se va a convertir
    // ANTES de registrar el primero.
    obtenerTRM(hoy),
  ]);

  // La conversión toca la TRM por fila. Van en paralelo porque después de
  // la primera consulta el resto sale del cache y no hay red de por medio.
  const filas: CostoFijo[] = await Promise.all(
    (filasRes.data ?? []).map(async (f) => {
      const resuelto = await montoEnCop(
        {
          moneda: f.moneda,
          monto_origen: f.monto_origen,
          monto_cop: f.monto_cop,
          monto_cop_real: f.monto_cop_real,
          dia_cobro: f.dia_cobro,
        },
        periodo,
      );

      return {
        id: f.id,
        categoria: f.categoria,
        concepto: f.concepto,
        moneda: (f.moneda ?? "COP") as "COP" | "USD",
        monto_origen: Number(f.monto_origen ?? f.monto_cop),
        monto_cop: Number(f.monto_cop),
        monto_cop_real:
          f.monto_cop_real === null ? null : Number(f.monto_cop_real),
        dia_cobro: f.dia_cobro,
        vigente_desde: f.vigente_desde,
        vigente_hasta: f.vigente_hasta,
        cop_mes: resuelto.cop,
        origen_cop: resuelto.origen,
        nota_cop: resuelto.nota,
      };
    }),
  );

  const vigentes = filas.filter(
    (f) => f.vigente_desde <= hoy && (f.vigente_hasta === null || f.vigente_hasta >= hoy),
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-carbon mb-1">Costos fijos</h1>
        <p className="text-sm text-carbon-suave max-w-2xl">
          Lo que cuesta tener la operación encendida cada mes, se venda o no se
          venda. Es lo que la proyección reparte entre las ventas{" "}
          <strong className="font-semibold">entregadas</strong> para saber cuánto
          hay que vender antes de empezar a ganar.
        </p>
      </div>

      <CostosFijos
        filasIniciales={filas}
        vigentes={vigentes}
        trmHoy={trm ? trm.usdCop : null}
        periodo={periodo}
      />
    </div>
  );
}

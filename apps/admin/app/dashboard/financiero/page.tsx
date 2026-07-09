import Link from "next/link";
import StatsCard from "@/components/admin/StatsCard";
import PeriodoSelector from "@/components/admin/PeriodoSelector";
import { Button } from "@diana-mile/shared/ui/Button";
import { formatCOP } from "@diana-mile/shared/utils";
import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import { calcularMetricas, periodoActual } from "@/lib/financiero";

export const metadata = {
  title: "Financiero | Milito Life Shop Admin",
};

const TIPO_LABELS: Record<string, string> = {
  publicidad_meta: "Publicidad Meta",
  publicidad_tiktok: "Publicidad TikTok",
  publicidad_google: "Publicidad Google",
  publicidad_otro: "Publicidad otro",
  plataformas: "Plataformas",
  logistica: "Logistica",
  producto: "Producto",
  nomina: "Nomina",
  operativo: "Operativo",
  otro: "Otro",
};

function formatPct(value: number): string {
  return `${value.toFixed(1)}%`;
}

export default async function FinancieroPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const periodoParam = typeof params.periodo === "string" ? params.periodo : undefined;
  const periodo =
    periodoParam && /^\d{4}-\d{2}$/.test(periodoParam) ? periodoParam : periodoActual();

  const metricas = await calcularMetricas(periodo);

  const supabase = createAdminSupabaseClient();
  const { data: gastosDelPeriodo } = await supabase
    .from("gastos")
    .select("tipo, monto_cop")
    .eq("periodo", periodo);

  const desglosePorTipo = new Map<string, number>();
  for (const gasto of gastosDelPeriodo ?? []) {
    const actual = desglosePorTipo.get(gasto.tipo) ?? 0;
    desglosePorTipo.set(gasto.tipo, actual + (gasto.monto_cop ?? 0));
  }
  const filasDesglose = Array.from(desglosePorTipo.entries()).sort((a, b) => b[1] - a[1]);
  const totalGastos = filasDesglose.reduce((acc, [, monto]) => acc + monto, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="font-display text-2xl text-carbon">Financiero</h1>
        <div className="flex items-center gap-3">
          <PeriodoSelector periodo={periodo} />
          <Link href="/dashboard/financiero/gastos">
            <Button variant="secondary">Ver / registrar gastos</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
        <StatsCard label="Ingresos brutos" value={formatCOP(metricas.ingresos_brutos)} />
        <StatsCard label="Ingresos recaudados" value={formatCOP(metricas.ingresos_recaudados)} />
        <StatsCard label="Costo productos" value={formatCOP(metricas.costo_productos)} />
        <StatsCard label="Costo envios" value={formatCOP(metricas.costo_envios)} />
        <StatsCard label="Gasto publicidad" value={formatCOP(metricas.gasto_publicidad)} />
        <StatsCard
          label={`Utilidad neta (${formatPct(metricas.margen_neto)})`}
          value={formatCOP(metricas.utilidad_neta)}
        />
        <StatsCard label="Tasa confirmacion" value={formatPct(metricas.tasa_confirmacion)} />
        <StatsCard label="Tasa entrega" value={formatPct(metricas.tasa_entrega)} />
        <StatsCard label="Tasa devolucion" value={formatPct(metricas.tasa_devolucion)} />
        <StatsCard label="Ticket promedio" value={formatCOP(metricas.ticket_promedio)} />
        <StatsCard label="Costo por pedido" value={formatCOP(metricas.costo_por_pedido)} />
        <StatsCard
          label="ROAS"
          value={metricas.roas !== null ? metricas.roas.toFixed(2) : "-"}
        />
      </div>

      <div className="bg-blanco border border-arena rounded-[4px] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-carbon">Gastos del periodo por tipo</h2>
          <span className="text-sm text-carbon-suave">Total: {formatCOP(totalGastos)}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-arena text-ceniza text-xs uppercase">
                <th className="text-left py-2 pr-2">Tipo</th>
                <th className="text-right py-2">Monto (COP)</th>
              </tr>
            </thead>
            <tbody>
              {filasDesglose.length === 0 ? (
                <tr>
                  <td colSpan={2} className="py-4 text-ceniza text-center">
                    Sin gastos registrados en este periodo.
                  </td>
                </tr>
              ) : (
                filasDesglose.map(([tipo, monto]) => (
                  <tr key={tipo} className="border-b border-arena/50">
                    <td className="py-2 pr-2 text-carbon">{TIPO_LABELS[tipo] ?? tipo}</td>
                    <td className="py-2 text-right text-carbon-suave">{formatCOP(monto)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

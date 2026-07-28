import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import { CostosFijos } from "@/components/admin/CostosFijos";

export const metadata = {
  title: "Costos fijos | Milito Life Shop Admin",
};

export const dynamic = "force-dynamic";

export type CostoFijo = {
  id: string;
  categoria: "personal" | "plataformas" | "administrativo";
  concepto: string;
  monto_cop: number;
  vigente_desde: string;
  vigente_hasta: string | null;
};

export default async function CostosFijosPage() {
  const supabase = createAdminSupabaseClient();
  const hoy = new Date().toISOString().slice(0, 10);

  const { data } = await supabase
    .from("costos_fijos")
    .select("id, categoria, concepto, monto_cop, vigente_desde, vigente_hasta")
    .order("categoria")
    .order("monto_cop", { ascending: false });

  const filas = (data ?? []).map((f) => ({
    ...f,
    monto_cop: Number(f.monto_cop),
  })) as CostoFijo[];

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

      <CostosFijos filasIniciales={filas} vigentes={vigentes} />
    </div>
  );
}

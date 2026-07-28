import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import { leerSupuestos } from "@/lib/proyeccion-datos";
import { SimuladorProyeccion } from "@/components/admin/SimuladorProyeccion";

export const metadata = {
  title: "Proyección | Milito Life Shop Admin",
};

export const dynamic = "force-dynamic";

export type EscenarioGuardado = {
  id: string;
  nombre: string;
  periodo: string;
  inversion_publicidad: number;
  part_publicidad: number;
  ticket_promedio: number;
  margen_bruto: number;
  tasa_despacho: number;
  tasa_entrega: number;
  costos_fijos_mes: number;
  costo_mercancia: number;
  costo_logistico: number;
  costo_plataforma: number;
  costo_fulfillment: number;
  pct_recaudo: number;
};

/** Postgres devuelve DECIMAL como string; sin esto los inputs quedarían con texto. */
function aNumero<T extends Record<string, unknown>>(fila: T, campos: string[]): T {
  const copia = { ...fila } as Record<string, unknown>;
  for (const campo of campos) {
    copia[campo] = Number(copia[campo]) || 0;
  }
  return copia as T;
}

const NUMERICOS = [
  "inversion_publicidad",
  "part_publicidad",
  "ticket_promedio",
  "margen_bruto",
  "tasa_despacho",
  "tasa_entrega",
  "costos_fijos_mes",
  "costo_mercancia",
  "costo_logistico",
  "costo_plataforma",
  "costo_fulfillment",
  "pct_recaudo",
];

export default async function ProyeccionPage() {
  const supabase = createAdminSupabaseClient();

  const [supuestos, guardadosRes] = await Promise.all([
    leerSupuestos(),
    supabase
      .from("proyecciones")
      .select(
        "id, nombre, periodo, inversion_publicidad, part_publicidad, ticket_promedio, margen_bruto, tasa_despacho, tasa_entrega, costos_fijos_mes, costo_mercancia, costo_logistico, costo_plataforma, costo_fulfillment, pct_recaudo",
      )
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const guardados = (guardadosRes.data ?? []).map((f) =>
    aNumero(f as unknown as EscenarioGuardado, NUMERICOS),
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-carbon mb-1">Proyección</h1>
        <p className="text-sm text-carbon-suave max-w-2xl">
          Cuánto hay que vender para que el mes cierre en verde. En contraentrega{" "}
          <strong className="font-semibold">facturar no es recaudar</strong>: se
          factura, se despacha una parte y de eso se entrega otra parte. Lo que
          entra a caja es el producto de las tres cosas.
        </p>
      </div>

      <SimuladorProyeccion sugeridos={supuestos} guardados={guardados} />
    </div>
  );
}

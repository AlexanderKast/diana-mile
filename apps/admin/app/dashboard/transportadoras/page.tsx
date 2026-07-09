import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import { formatCOP } from "@diana-mile/shared/utils";
import { calcularRendimiento } from "@/lib/transportadoras";

export const metadata = {
  title: "Transportadoras | Milito Life Shop Admin",
};

export default async function TransportadorasPage() {
  const supabase = createAdminSupabaseClient();

  const { data } = await supabase
    .from("pedidos")
    .select("transportadora, estado, costo_envio, fecha_envio, fecha_entrega_real")
    .not("transportadora", "is", null);

  const rendimiento = calcularRendimiento(data ?? []);
  const mejor = rendimiento.find((r) => r.total_envios > 0) ?? null;

  return (
    <div>
      <h1 className="font-display text-2xl text-carbon mb-6">Transportadoras</h1>

      {rendimiento.length === 0 ? (
        <div className="bg-blanco border border-arena rounded-[4px] p-8 text-center">
          <p className="text-carbon-suave">
            Todavia no hay envios registrados con transportadora asignada.
          </p>
        </div>
      ) : (
        <>
          {mejor && (
            <div className="bg-dorado/10 border border-dorado rounded-[4px] p-5 mb-6">
              <p className="text-sm text-carbon-suave">Mejor transportadora (historico)</p>
              <p className="font-display text-2xl text-carbon mt-1">
                {mejor.transportadora}{" "}
                <span className="text-dorado-oscuro">
                  con {mejor.tasa_entrega.toFixed(1)}% de entrega
                </span>
              </p>
            </div>
          )}

          <div className="bg-blanco border border-arena rounded-[4px] overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-arena text-left text-xs text-ceniza uppercase tracking-wide">
                  <th className="px-4 py-3">Transportadora</th>
                  <th className="px-4 py-3">Enviados</th>
                  <th className="px-4 py-3">Entregados</th>
                  <th className="px-4 py-3">Devueltos</th>
                  <th className="px-4 py-3">En transito</th>
                  <th className="px-4 py-3">% Entrega</th>
                  <th className="px-4 py-3">Costo promedio</th>
                  <th className="px-4 py-3">Dias promedio</th>
                </tr>
              </thead>
              <tbody>
                {rendimiento.map((fila) => (
                  <tr key={fila.transportadora} className="border-b border-arena last:border-b-0">
                    <td className="px-4 py-3 text-carbon font-medium">{fila.transportadora}</td>
                    <td className="px-4 py-3 text-carbon-suave">{fila.total_envios}</td>
                    <td className="px-4 py-3 text-carbon-suave">{fila.entregados}</td>
                    <td className="px-4 py-3 text-carbon-suave">{fila.devueltos}</td>
                    <td className="px-4 py-3 text-carbon-suave">{fila.en_transito}</td>
                    <td className="px-4 py-3 text-carbon-suave">{fila.tasa_entrega.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-carbon-suave">{formatCOP(fila.costo_promedio)}</td>
                    <td className="px-4 py-3 text-carbon-suave">
                      {fila.dias_promedio_entrega !== null
                        ? fila.dias_promedio_entrega.toFixed(1)
                        : "Sin datos"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

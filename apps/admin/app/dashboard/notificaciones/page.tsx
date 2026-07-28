import Link from "next/link";
import { calcularAlertas, COLOR_SEVERIDAD, ETIQUETA_SEVERIDAD } from "@/lib/alertas";
import { SilenciarAlerta } from "@/components/admin/SilenciarAlerta";

export const metadata = {
  title: "Alertas | Milito Life Shop Admin",
};

// Se calculan contra los datos de este instante. Cachearlas mostraria
// problemas ya resueltos, que es como se le enseña a la gente a ignorar
// las alertas.
export const dynamic = "force-dynamic";

export default async function AlertasPage() {
  const alertas = await calcularAlertas();
  const criticas = alertas.filter((a) => a.severidad === "critica");

  return (
    <div>
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="font-display text-2xl text-carbon mb-1">Alertas</h1>
          <p className="text-sm text-carbon-suave max-w-2xl">
            Lo que necesita atención ahora mismo, calculado contra los datos
            reales. Cada una lleva a la página donde se arregla.
          </p>
        </div>
        <Link
          href="/dashboard/notificaciones/push"
          className="text-sm text-morado hover:text-morado-oscuro transition-colors whitespace-nowrap"
        >
          Enviar push a clientas →
        </Link>
      </div>

      {alertas.length === 0 ? (
        <div className="bg-blanco border border-arena rounded-[4px] p-8 text-center">
          <p className="font-display text-xl text-carbon mb-1">Todo en orden</p>
          <p className="text-sm text-carbon-suave">
            No hay nada pendiente: los productos están costeados, los pedidos al
            día y el pipeline atendido.
          </p>
        </div>
      ) : (
        <>
          {criticas.length > 0 && (
            <p className="text-sm text-error mb-4">
              {criticas.length}{" "}
              {criticas.length === 1
                ? "alerta crítica afecta"
                : "alertas críticas afectan"}{" "}
              los números que muestra el panel.
            </p>
          )}

          <div className="flex flex-col gap-3">
            {alertas.map((alerta) => (
              <div
                key={alerta.tipo}
                className={`border rounded-[4px] p-5 ${COLOR_SEVERIDAD[alerta.severidad]}`}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] uppercase tracking-wide opacity-70">
                        {ETIQUETA_SEVERIDAD[alerta.severidad]}
                      </span>
                    </div>
                    <p className="font-display text-lg leading-snug">{alerta.titulo}</p>
                    <p className="text-sm mt-1 opacity-90">{alerta.detalle}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {alerta.silenciable && <SilenciarAlerta tipo={alerta.tipo} />}
                    <Link
                      href={alerta.href}
                      className="px-4 py-2 text-sm font-semibold bg-carbon text-blanco rounded-[4px] hover:bg-carbon/90 transition-colors whitespace-nowrap"
                    >
                      {alerta.accion}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

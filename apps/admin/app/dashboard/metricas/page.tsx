import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import { formatCOP } from "@diana-mile/shared/utils";

export const metadata = { title: "Métricas | Milito Life Shop Admin" };

/** Se recalcula en cada visita: son numeros de operacion, no un informe. */
export const dynamic = "force-dynamic";

type Fila = Record<string, string | number>;

type Metricas = {
  embudo: Record<string, number>;
  dinero: Record<string, number>;
  agente: Record<string, number>;
  atribucion: {
    por_origen: Fila[];
    por_pagina: Fila[];
    por_campana: Fila[];
    desde_anuncio: number;
    clics_emparejados: number;
  };
  logistica: {
    por_transportadora: Fila[];
    por_ciudad: Fila[];
    sin_contraentrega: number;
  };
  app: Record<string, number>;
};

const PERIODOS = [
  { dias: 7, label: "7 días" },
  { dias: 30, label: "30 días" },
  { dias: 90, label: "90 días" },
  { dias: 365, label: "1 año" },
];

function porcentaje(parte: number, total: number): string {
  if (!total) return "—";
  return `${Math.round((parte / total) * 100)}%`;
}

/** Un paso del embudo, con cuanto sobrevive del paso anterior. */
function Paso({
  label,
  valor,
  de,
  nota,
}: {
  label: string;
  valor: number;
  de?: number;
  nota?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-arena py-2.5 last:border-0">
      <span className="text-sm text-carbon-suave">{label}</span>
      <span className="flex items-baseline gap-2 whitespace-nowrap">
        <span className="font-display text-lg text-carbon">{valor}</span>
        {de !== undefined && (
          <span className="text-xs text-ceniza">{porcentaje(valor, de)}</span>
        )}
        {nota && <span className="text-xs text-ceniza">{nota}</span>}
      </span>
    </div>
  );
}

/** Una linea de plata: sin conteo ni porcentaje, solo el monto. */
function Monto({ label, valor }: { label: string; valor: number }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-arena py-2.5 last:border-0">
      <span className="text-sm text-carbon-suave">{label}</span>
      <span className="font-display text-lg text-carbon">{formatCOP(valor)}</span>
    </div>
  );
}

function Bloque({
  titulo,
  descripcion,
  children,
}: {
  titulo: string;
  descripcion?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[4px] border border-arena bg-blanco p-5">
      <h2 className="font-display text-lg text-carbon">{titulo}</h2>
      {descripcion && (
        <p className="mb-3 mt-0.5 text-xs text-ceniza">{descripcion}</p>
      )}
      <div className={descripcion ? "" : "mt-3"}>{children}</div>
    </section>
  );
}

function Tabla({
  columnas,
  filas,
  vacio,
}: {
  columnas: { clave: string; label: string }[];
  filas: Fila[];
  vacio: string;
}) {
  if (!filas.length) {
    return <p className="py-3 text-sm text-ceniza">{vacio}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-arena text-left text-xs text-ceniza">
            {columnas.map((c) => (
              <th key={c.clave} className="py-2 pr-3 font-medium">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((f, i) => (
            <tr key={i} className="border-b border-arena/60 last:border-0">
              {columnas.map((c) => (
                <td key={c.clave} className="py-2 pr-3 text-carbon">
                  {f[c.clave] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function MetricasPage({
  searchParams,
}: {
  searchParams: Promise<{ dias?: string }>;
}) {
  const { dias } = await searchParams;
  const periodo = PERIODOS.find((p) => String(p.dias) === dias) ?? PERIODOS[1];

  const hasta = new Date();
  const desde = new Date(hasta.getTime() - periodo.dias * 24 * 60 * 60 * 1000);

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase.rpc("metricas_ecosistema", {
    desde: desde.toISOString(),
    hasta: hasta.toISOString(),
  });

  if (error || !data) {
    return (
      <div>
        <h1 className="mb-6 font-display text-2xl text-carbon">Métricas</h1>
        <p className="rounded-[2px] border border-error/30 bg-error/5 p-4 text-sm text-error">
          No se pudieron cargar las métricas: {error?.message ?? "sin datos"}
        </p>
      </div>
    );
  }

  const m = data as Metricas;
  const { embudo, dinero, agente, atribucion, logistica, app } = m;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-carbon">Métricas</h1>
        <nav className="flex gap-1" aria-label="Periodo">
          {PERIODOS.map((p) => (
            <a
              key={p.dias}
              href={`/dashboard/metricas?dias=${p.dias}`}
              className={
                p.dias === periodo.dias
                  ? "rounded-[2px] border border-dorado bg-dorado/10 px-3 py-1.5 text-sm text-dorado-oscuro"
                  : "rounded-[2px] border border-arena px-3 py-1.5 text-sm text-carbon-suave transition-colors hover:bg-crema"
              }
            >
              {p.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Bloque
          titulo="Embudo"
          descripcion="Cuánta gente sobrevive a cada paso. El porcentaje es sobre el paso anterior."
        >
          <Paso label="Clics al WhatsApp" valor={embudo.clics} />
          <Paso label="Conversaciones" valor={embudo.conversaciones} de={embudo.clics} />
          <Paso label="Pedidos creados" valor={embudo.pedidos} de={embudo.conversaciones} />
          <Paso label="Confirmados" valor={embudo.confirmados} de={embudo.pedidos} />
          <Paso label="Enviados" valor={embudo.enviados} de={embudo.confirmados} />
          <Paso label="Entregados" valor={embudo.entregados} de={embudo.enviados} />
          <Paso label="Devueltos" valor={embudo.devueltos} de={embudo.enviados} />
          <Paso label="Cancelados" valor={embudo.cancelados} de={embudo.pedidos} />
        </Bloque>

        <Bloque
          titulo="Dinero"
          descripcion="El ticket promedio excluye los cancelados: esa plata nunca existió."
        >
          <Monto label="Ticket promedio" valor={dinero.ticket_promedio} />
          <Monto label="Cobrado (entregados)" valor={dinero.vendido} />
          <Monto label="En curso" valor={dinero.en_curso} />
          <Monto label="Perdido en devoluciones" valor={dinero.perdido_devoluciones} />
          <Monto label="Perdido en cancelaciones" valor={dinero.perdido_cancelaciones} />
        </Bloque>

        <Bloque
          titulo="Agente de WhatsApp"
          descripcion="Cuánto resuelve solo y cuánto te pasa a ti."
        >
          <Paso label="Conversaciones" valor={agente.conversaciones} />
          <Paso label="Mensajes" valor={agente.mensajes} />
          <Paso
            label="Escaladas a Diana"
            valor={agente.escaladas}
            de={agente.conversaciones}
          />
          <Paso label="Pedidos cerrados por el chat" valor={agente.pedidos_por_chat} />
          <Paso label="Pedidos por la web" valor={agente.pedidos_por_web} />
          <Paso
            label="Adicional aceptado"
            valor={agente.upsell_aceptados}
            de={agente.upsell_ofrecidos}
          />
          <Paso label="Respuestas aprendidas" valor={agente.aprendidas} />
          <Paso label="Preguntas sin responder" valor={agente.sin_responder} />
        </Bloque>

        <Bloque
          titulo="La app"
          descripcion="Instalar la app no da permiso de notificaciones: son dos cosas distintas."
        >
          <Paso label="Instalaciones" valor={app.instalaciones} />
          <Paso label="Suscripciones a notificaciones" valor={app.suscripciones_push} />
        </Bloque>

        <Bloque
          titulo="De dónde vienen"
          descripcion={`${atribucion.clics_emparejados} de ${embudo.clics} clics se pudieron unir a una conversación. ${atribucion.desde_anuncio} llegaron por un anuncio Click-to-WhatsApp.`}
        >
          <p className="mb-1 mt-3 text-xs uppercase tracking-wide text-ceniza">
            Por página
          </p>
          <Tabla
            columnas={[
              { clave: "ruta", label: "Página" },
              { clave: "clics", label: "Clics" },
            ]}
            filas={atribucion.por_pagina}
            vacio="Todavía nadie ha usado el botón de WhatsApp."
          />
          <p className="mb-1 mt-4 text-xs uppercase tracking-wide text-ceniza">
            Por campaña
          </p>
          <Tabla
            columnas={[
              { clave: "campana", label: "Campaña" },
              { clave: "clics", label: "Clics" },
            ]}
            filas={atribucion.por_campana}
            vacio="Sin campañas etiquetadas."
          />
        </Bloque>

        <Bloque
          titulo="Logística"
          descripcion={
            logistica.sin_contraentrega > 0
              ? `${logistica.sin_contraentrega} pedidos van a ciudades sin pago contraentrega: hay que cobrarlos por adelantado.`
              : "Ningún pedido va a una ciudad sin pago contraentrega."
          }
        >
          <p className="mb-1 mt-3 text-xs uppercase tracking-wide text-ceniza">
            Por transportadora
          </p>
          <Tabla
            columnas={[
              { clave: "transportadora", label: "Transportadora" },
              { clave: "envios", label: "Envíos" },
              { clave: "entregados", label: "Entregados" },
              { clave: "devueltos", label: "Devueltos" },
            ]}
            filas={logistica.por_transportadora}
            vacio="Todavía no hay envíos despachados."
          />
          <p className="mb-1 mt-4 text-xs uppercase tracking-wide text-ceniza">
            Por ciudad
          </p>
          <Tabla
            columnas={[
              { clave: "ciudad", label: "Ciudad" },
              { clave: "pedidos", label: "Pedidos" },
              { clave: "entregados", label: "Entregados" },
              { clave: "devueltos", label: "Devueltos" },
            ]}
            filas={logistica.por_ciudad}
            vacio="Todavía no hay pedidos."
          />
        </Bloque>
      </div>
    </div>
  );
}

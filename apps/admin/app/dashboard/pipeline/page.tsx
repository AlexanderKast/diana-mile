import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import PipelineBoard, {
  type FilaPipeline,
} from "@/components/admin/PipelineBoard";

export const metadata = { title: "Pipeline | Milito Life Shop Admin" };
export const dynamic = "force-dynamic";

/**
 * El embudo de punta a punta: del primer mensaje a la comunidad.
 *
 * Lee de `pipeline_unificado`, que junta leads sin pedido y pedidos en una
 * sola escalera sin duplicar a quien ya compro. La vista NO es fuente de
 * verdad: `leads.etapa` manda en lo comercial y `pedidos.estado` en lo
 * operativo, y cada uno se sigue cambiando donde siempre.
 */
export default async function PipelinePage() {
  const supabase = createAdminSupabaseClient();

  const { data, error } = await supabase
    .from("pipeline_unificado")
    .select("*")
    .order("ultima_interaccion_at", { ascending: false, nullsFirst: false })
    .limit(300);

  if (error) {
    return (
      <div>
        <h1 className="mb-4 font-display text-2xl text-carbon">Pipeline</h1>
        <p className="text-sm text-error">No se pudo leer el embudo: {error.message}</p>
      </div>
    );
  }

  const filas = (data ?? []) as FilaPipeline[];
  const abiertos = filas.filter(
    (f) =>
      f.estado_pedido !== "cancelado" &&
      f.estado_pedido !== "devuelto" &&
      f.etapa_cruda !== "perdido",
  );

  return (
    <div>
      <h1 className="mb-2 font-display text-2xl text-carbon">Pipeline</h1>
      <p className="mb-6 max-w-3xl text-sm text-carbon-suave">
        Todo el recorrido, venga de donde venga: WhatsApp, la web o un checkout
        a medias. La parte comercial la mueve el agente y la puedes corregir
        arrastrando. La operativa —confirmar, enviar, entregar— se gestiona en
        su pantalla, porque cada paso pide datos y dispara envíos reales.{" "}
        {abiertos.length} en curso de {filas.length}.
      </p>
      {filas.length === 0 ? (
        <p className="text-sm text-ceniza">Todavía no hay nada en el embudo.</p>
      ) : (
        <PipelineBoard filas={filas} />
      )}
    </div>
  );
}

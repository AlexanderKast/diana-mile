"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core";
import { cx, formatCOP } from "@diana-mile/shared/utils";
import type { TemperaturaLead } from "@diana-mile/shared/crm/scoring";
import {
  CLASE_ETIQUETA,
  DESTINO_OPERATIVO,
  ETIQUETA_FASE,
  FASES_ARRASTRABLES,
  etiquetasAutomaticas,
  faseDesdeEstadoPedido,
  faseDesdeEtapaLead,
  type FasePipeline,
} from "@diana-mile/shared/crm/pipeline";

/**
 * El embudo completo: desde que alguien escribe hasta que entra a la comunidad.
 *
 * DOS MITADES CON REGLAS DISTINTAS
 * La comercial (nuevo → calificado → negociación) se arrastra: cambiarla es
 * una opinion y no dispara nada.
 *
 * La operativa (nuevo pedido → confirmado → enviado → entregado) NO se
 * arrastra, y no es pereza: confirmar exige el resultado de la llamada,
 * enviar exige transportadora y guia, entregar exige el valor recaudado. Cada
 * paso ademas dispara efectos reales (fulfillment en Shopify, mensajes de
 * WhatsApp, el calendario de seguimiento). Un arrastre no puede aportar esos
 * datos, asi que esas tarjetas llevan un enlace a la pantalla que si sabe
 * pedirlos. Fingir que se pueden mover con el raton crearia pedidos a medias.
 */

export type FilaPipeline = {
  origen: "lead" | "pedido";
  id: string;
  nombre: string;
  telefono: string;
  ciudad: string | null;
  producto: string | null;
  canal: string;
  etapa_cruda: string | null;
  estado_pedido: string | null;
  score: number;
  temperatura: TemperaturaLead;
  probabilidad_cierre: number | null;
  valor: number | null;
  motivo_perdida: string | null;
  etiquetas: string[] | null;
  ultima_interaccion_at: string | null;
  created_at: string;
  escalado_at: string | null;
  numero_orden: string | null;
  fecha_entrega_real: string | null;
};

/** Las 8 del recorrido normal. Las terminales van aparte, tras un interruptor. */
const COLUMNAS_FLUJO: FasePipeline[] = [
  "nuevo",
  "calificado",
  "negociacion",
  "nuevo_pedido",
  "confirmado",
  "enviado",
  "entregado",
  "comunidad",
];

const COLUMNAS_TERMINALES: FasePipeline[] = ["perdido", "devuelto", "cancelado"];

const CLASE_TEMPERATURA: Record<TemperaturaLead, string> = {
  caliente: "bg-error/15 text-error",
  tibio: "bg-dorado/20 text-dorado-oscuro",
  frio: "bg-arena/70 text-ceniza",
};

function faseDe(fila: FilaPipeline): FasePipeline {
  if (fila.origen === "pedido") {
    return faseDesdeEstadoPedido(
      fila.estado_pedido,
      Boolean(fila.fecha_entrega_real),
    );
  }
  return faseDesdeEtapaLead(
    (fila.etapa_cruda ?? "nuevo") as Parameters<typeof faseDesdeEtapaLead>[0],
  );
}

function tiempoDesde(iso: string | null): string {
  if (!iso) return "—";
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms)) return "—";
  const min = Math.floor(ms / 60000);
  if (min < 60) return `${Math.max(1, min)}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function Tarjeta({
  fila,
  fase,
  onMover,
  ocupado,
}: {
  fila: FilaPipeline;
  fase: FasePipeline;
  onMover: (fila: FilaPipeline, fase: FasePipeline) => void;
  ocupado: boolean;
}) {
  const arrastrable = FASES_ARRASTRABLES.includes(fase);
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: fila.id, disabled: !arrastrable });

  const etiquetas = useMemo(() => {
    const autos = etiquetasAutomaticas({
      fase,
      fuente: fila.canal,
      producto: fila.producto,
      ciudad: fila.ciudad,
      escalado: Boolean(fila.escalado_at),
    });
    const manuales = (fila.etiquetas ?? []).map((v) => ({
      valor: v,
      tipo: "manual" as const,
    }));
    return [...autos, ...manuales];
  }, [fase, fila]);

  const destino = DESTINO_OPERATIVO[fase];

  return (
    <div
      ref={setNodeRef}
      style={
        transform
          ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
          : undefined
      }
      className={cx(
        "rounded-[4px] border border-arena bg-blanco p-3 text-sm",
        isDragging && "opacity-50",
        ocupado && "opacity-60",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className={cx(arrastrable && "cursor-grab active:cursor-grabbing")}
          {...(arrastrable ? listeners : {})}
          {...(arrastrable ? attributes : {})}
        >
          <p className="font-medium text-carbon">{fila.nombre}</p>
          <p className="text-xs text-ceniza">
            {fila.numero_orden ?? fila.telefono}
          </p>
        </div>
        {fila.origen === "lead" && (
          <span
            className={cx(
              "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
              CLASE_TEMPERATURA[fila.temperatura],
            )}
            title={`Puntaje ${fila.score}/100`}
          >
            {fila.score}
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        {etiquetas.slice(0, 5).map((e) => (
          <span
            key={`${e.tipo}-${e.valor}`}
            className={cx(
              "rounded-[3px] px-1.5 py-0.5 text-[10px]",
              CLASE_ETIQUETA[e.tipo],
            )}
          >
            {e.valor}
          </span>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 text-[11px] text-ceniza">
        <span>{tiempoDesde(fila.ultima_interaccion_at ?? fila.created_at)}</span>
        {fila.valor !== null && (
          <span className="font-medium text-dorado-oscuro">
            {formatCOP(fila.valor)}
          </span>
        )}
      </div>

      {fila.motivo_perdida && (
        <p className="mt-2 rounded-[3px] bg-arena/50 px-2 py-1 text-[11px] text-carbon-suave">
          {fila.motivo_perdida}
        </p>
      )}

      {arrastrable ? (
        <label className="mt-3 block">
          <span className="sr-only">Mover {fila.nombre}</span>
          <select
            value={fase}
            disabled={ocupado}
            onChange={(e) => onMover(fila, e.target.value as FasePipeline)}
            className="w-full rounded-[3px] border border-arena bg-crema px-2 py-1 text-xs text-carbon"
          >
            {[...FASES_ARRASTRABLES].map((f) => (
              <option key={f} value={f}>
                Mover a: {ETIQUETA_FASE[f]}
              </option>
            ))}
          </select>
        </label>
      ) : destino ? (
        <Link
          href={destino}
          className="mt-3 block rounded-[3px] border border-arena bg-crema px-2 py-1 text-center text-xs text-carbon-suave hover:bg-arena/40"
        >
          Gestionar →
        </Link>
      ) : null}
    </div>
  );
}

function Columna({
  fase,
  filas,
  onMover,
  ocupado,
}: {
  fase: FasePipeline;
  filas: FilaPipeline[];
  onMover: (fila: FilaPipeline, fase: FasePipeline) => void;
  ocupado: string | null;
}) {
  const soltable = FASES_ARRASTRABLES.includes(fase);
  const { setNodeRef, isOver } = useDroppable({ id: fase, disabled: !soltable });
  const valor = filas.reduce((a, f) => a + (f.valor ?? 0), 0);

  return (
    <div
      ref={setNodeRef}
      className={cx(
        "flex w-[250px] shrink-0 flex-col rounded-[4px] border p-3",
        isOver ? "border-morado bg-lila-suave/40" : "border-arena bg-crema/40",
      )}
    >
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-medium text-carbon">
          {ETIQUETA_FASE[fase]}
        </h2>
        <span className="text-xs text-ceniza">{filas.length}</span>
      </div>
      {valor > 0 && (
        <p className="mb-2 text-xs text-dorado-oscuro">{formatCOP(valor)}</p>
      )}
      {!soltable && (
        <p className="mb-2 text-[10px] text-ceniza">Se gestiona en su pantalla</p>
      )}

      <div className="flex flex-col gap-2">
        {filas.map((f) => (
          <Tarjeta
            key={`${f.origen}-${f.id}`}
            fila={f}
            fase={fase}
            onMover={onMover}
            ocupado={ocupado === f.id}
          />
        ))}
        {filas.length === 0 && (
          <p className="py-5 text-center text-xs text-ceniza">Vacío</p>
        )}
      </div>
    </div>
  );
}

export default function PipelineBoard({ filas: iniciales }: { filas: FilaPipeline[] }) {
  const [filas, setFilas] = useState(iniciales);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verTerminales, setVerTerminales] = useState(false);
  const [filtroCanal, setFiltroCanal] = useState<string>("");

  const sensors = useSensors(
    // 8px de holgura: sin esto, tocar el selector cuenta como arrastre.
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const canales = useMemo(
    () => [...new Set(filas.map((f) => f.canal))].sort(),
    [filas],
  );

  const visibles = useMemo(
    () => (filtroCanal ? filas.filter((f) => f.canal === filtroCanal) : filas),
    [filas, filtroCanal],
  );

  const porFase = useMemo(() => {
    const mapa = new Map<FasePipeline, FilaPipeline[]>();
    for (const f of [...COLUMNAS_FLUJO, ...COLUMNAS_TERMINALES]) mapa.set(f, []);
    for (const fila of visibles) mapa.get(faseDe(fila))?.push(fila);
    for (const lista of mapa.values()) {
      lista.sort(
        (a, b) =>
          b.score - a.score ||
          new Date(b.ultima_interaccion_at ?? b.created_at).getTime() -
            new Date(a.ultima_interaccion_at ?? a.created_at).getTime(),
      );
    }
    return mapa;
  }, [visibles]);

  async function mover(fila: FilaPipeline, destino: FasePipeline) {
    if (fila.origen !== "lead") return;
    if (!FASES_ARRASTRABLES.includes(destino)) return;
    const actual = faseDe(fila);
    if (actual === destino) return;

    let motivo: string | null = null;
    if (destino === "perdido") {
      motivo = window.prompt(
        `¿Por qué se perdió a ${fila.nombre}?\n\nEs lo único que dice si se pierde por precio, cobertura o producto.`,
      );
      if (!motivo?.trim()) return;
    }

    const antes = fila.etapa_cruda;
    setError(null);
    setOcupado(fila.id);
    setFilas((prev) =>
      prev.map((f) =>
        f.id === fila.id
          ? { ...f, etapa_cruda: destino, motivo_perdida: motivo ?? f.motivo_perdida }
          : f,
      ),
    );

    try {
      const res = await fetch(`/api/admin/leads/${fila.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ etapa: destino, motivo_perdida: motivo }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error ?? `Error ${res.status}`);
      }
    } catch (e) {
      setFilas((prev) =>
        prev.map((f) => (f.id === fila.id ? { ...f, etapa_cruda: antes } : f)),
      );
      setError(
        `No se pudo mover a ${fila.nombre}: ${
          e instanceof Error ? e.message : String(e)
        }. Quedó como estaba.`,
      );
    } finally {
      setOcupado(null);
    }
  }

  function alSoltar(evento: DragEndEvent) {
    const destino = evento.over?.id as FasePipeline | undefined;
    if (!destino) return;
    const fila = filas.find((f) => f.id === String(evento.active.id));
    if (fila) void mover(fila, destino);
  }

  const columnas = verTerminales
    ? [...COLUMNAS_FLUJO, ...COLUMNAS_TERMINALES]
    : COLUMNAS_FLUJO;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filtroCanal}
          onChange={(e) => setFiltroCanal(e.target.value)}
          className="rounded-[3px] border border-arena bg-blanco px-2 py-1 text-sm text-carbon"
        >
          <option value="">Todos los canales</option>
          {canales.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-carbon-suave">
          <input
            type="checkbox"
            checked={verTerminales}
            onChange={(e) => setVerTerminales(e.target.checked)}
          />
          Ver perdidos, devueltos y cancelados
        </label>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-[4px] border border-error/40 bg-error/10 px-3 py-2 text-sm text-error"
        >
          {error}
        </p>
      )}

      <DndContext sensors={sensors} onDragEnd={alSoltar}>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {columnas.map((fase) => (
            <Columna
              key={fase}
              fase={fase}
              filas={porFase.get(fase) ?? []}
              onMover={mover}
              ocupado={ocupado}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}

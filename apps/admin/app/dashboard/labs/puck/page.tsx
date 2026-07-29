"use client";

/**
 * Spike de compatibilidad de Puck (Fase 0 del constructor visual).
 * Pagina temporal: valida editor + drag + slots + viewports con React 19 /
 * Next 16 antes de construir el editor real. Se elimina en la fase final.
 */

import { useState } from "react";
import { Puck, type Config, type Data, type Slot } from "@measured/puck";
import "@measured/puck/puck.css";

type Bloques = {
  Encabezado: { texto: string; nivel: "grande" | "mediano" };
  Columnas: { columnas: Slot };
  Tarjeta: { texto: string };
};

const config: Config<{ components: Bloques }> = {
  components: {
    Encabezado: {
      fields: {
        texto: { type: "text" },
        nivel: {
          type: "radio",
          options: [
            { label: "Grande", value: "grande" },
            { label: "Mediano", value: "mediano" },
          ],
        },
      },
      defaultProps: { texto: "Encabezado de prueba", nivel: "grande" },
      render: ({ texto, nivel }) => (
        <h2
          className="font-display text-carbon"
          style={{ fontSize: nivel === "grande" ? 32 : 22, padding: 16 }}
        >
          {texto}
        </h2>
      ),
    },
    Columnas: {
      fields: {
        columnas: { type: "slot" },
      },
      defaultProps: { columnas: [] },
      render: ({ columnas: Columnas }) => (
        <Columnas
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
            padding: 16,
          }}
        />
      ),
    },
    Tarjeta: {
      fields: { texto: { type: "textarea" } },
      defaultProps: { texto: "Una tarjeta arrastrable" },
      render: ({ texto }) => (
        <div className="rounded-[4px] border border-arena bg-blanco p-4 text-sm text-carbon-suave">
          {texto}
        </div>
      ),
    },
  },
};

const dataInicial: Data = {
  root: { props: {} },
  content: [
    {
      type: "Encabezado",
      props: { id: "enc-1", texto: "Puck con tokens Milito", nivel: "grande" },
    },
    {
      type: "Columnas",
      props: {
        id: "col-1",
        columnas: [
          { type: "Tarjeta", props: { id: "tar-1", texto: "Columna A — fuente y bordes de la marca" } },
          { type: "Tarjeta", props: { id: "tar-2", texto: "Columna B — grid responsive" } },
        ],
      },
    },
  ],
};

export default function LabsPuckPage() {
  const [guardado, setGuardado] = useState<string | null>(null);

  return (
    <div style={{ height: "calc(100vh - 8rem)" }}>
      <p className="text-xs text-ceniza mb-2">
        Laboratorio Puck — spike de compatibilidad, no es el editor real.
      </p>
      <Puck
        config={config}
        data={dataInicial}
        viewports={[
          { width: 390, label: "Móvil" },
          { width: 1280, label: "Escritorio" },
        ]}
        onPublish={(data) => setGuardado(JSON.stringify(data, null, 2))}
      />
      {guardado && (
        <pre className="mt-4 text-xs bg-crema border border-arena rounded-[4px] p-3 overflow-x-auto">
          {guardado}
        </pre>
      )}
    </div>
  );
}

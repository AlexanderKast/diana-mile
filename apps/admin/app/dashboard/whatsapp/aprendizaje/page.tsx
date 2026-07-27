"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@diana-mile/shared/ui/Button";

type Pendiente = {
  id: string;
  telefono: string;
  pregunta: string;
  contexto: string | null;
  created_at: string;
};

type Aprendido = {
  id: string;
  pregunta: string;
  respuesta: string;
  veces_usada: number;
  activa: boolean;
  created_at: string;
};

export default function AprendizajePage() {
  const [pendientes, setPendientes] = useState<Pendiente[]>([]);
  const [aprendido, setAprendido] = useState<Aprendido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [guardando, setGuardando] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/whatsapp/aprendizaje");
      const json = await res.json();
      setPendientes(json.pendientes ?? []);
      setAprendido(json.aprendido ?? []);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function ensenar(p: Pendiente) {
    const respuesta = respuestas[p.id]?.trim();
    if (!respuesta) return;

    setGuardando(p.id);
    try {
      await fetch("/api/admin/whatsapp/aprendizaje", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pregunta: p.pregunta,
          respuesta,
          pendienteId: p.id,
        }),
      });
      setRespuestas((r) => ({ ...r, [p.id]: "" }));
      await cargar();
    } finally {
      setGuardando(null);
    }
  }

  async function descartar(id: string) {
    await fetch("/api/admin/whatsapp/aprendizaje", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, tipo: "pendiente" }),
    });
    cargar();
  }

  async function alternarActiva(a: Aprendido) {
    await fetch("/api/admin/whatsapp/aprendizaje", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: a.id, tipo: "aprendido", activa: !a.activa }),
    });
    cargar();
  }

  if (cargando) return <p className="text-sm text-carbon-suave">Cargando…</p>;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl text-carbon mb-2">
          Lo que el asistente aprende
        </h1>
        <p className="text-sm text-carbon-suave">
          Cuando el asistente no sabe algo, escala y la pregunta queda aquí.
          Respóndela una vez y a partir de ese momento la resuelve solo,
          incluso si la próxima persona la escribe con otras palabras.
        </p>
      </div>

      <section>
        <h2 className="font-display text-lg text-carbon mb-3">
          Preguntas sin responder ({pendientes.length})
        </h2>

        {pendientes.length === 0 ? (
          <p className="text-sm text-carbon-suave bg-blanco border border-arena rounded-[4px] p-4">
            Nada pendiente. El asistente está resolviendo todo lo que le
            preguntan.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {pendientes.map((p) => (
              <div
                key={p.id}
                className="bg-blanco border border-arena rounded-[4px] p-4"
              >
                <p className="text-sm text-carbon font-medium">{p.pregunta}</p>
                {p.contexto && (
                  <p className="text-xs text-carbon-suave mt-1">{p.contexto}</p>
                )}
                <p className="text-xs text-carbon-suave mt-1">
                  {p.telefono} ·{" "}
                  {new Date(p.created_at).toLocaleString("es-CO", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>

                <textarea
                  className="w-full mt-3 p-2 border border-arena rounded-[4px] text-sm"
                  rows={3}
                  placeholder="¿Qué debería responder el asistente la próxima vez?"
                  value={respuestas[p.id] ?? ""}
                  onChange={(e) =>
                    setRespuestas((r) => ({ ...r, [p.id]: e.target.value }))
                  }
                />

                <div className="flex gap-2 mt-2">
                  <Button
                    onClick={() => ensenar(p)}
                    disabled={
                      guardando === p.id || !respuestas[p.id]?.trim()
                    }
                  >
                    {guardando === p.id ? "Guardando…" : "Enseñar"}
                  </Button>
                  <Button variant="secondary" onClick={() => descartar(p.id)}>
                    Descartar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-lg text-carbon mb-3">
          Ya aprendido ({aprendido.length})
        </h2>
        <div className="bg-blanco border border-arena rounded-[4px] overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-carbon-suave border-b border-arena">
              <tr>
                <th className="p-3 font-normal">Pregunta</th>
                <th className="p-3 font-normal">Respuesta</th>
                <th className="p-3 font-normal">Usada</th>
                <th className="p-3 font-normal"></th>
              </tr>
            </thead>
            <tbody>
              {aprendido.map((a) => (
                <tr
                  key={a.id}
                  className={`border-b border-arena/50 ${a.activa ? "" : "opacity-50"}`}
                >
                  <td className="p-3 align-top">{a.pregunta}</td>
                  <td className="p-3 align-top text-carbon-suave">
                    {a.respuesta}
                  </td>
                  <td className="p-3 align-top">{a.veces_usada}×</td>
                  <td className="p-3 align-top">
                    <Button
                      variant="secondary"
                      onClick={() => alternarActiva(a)}
                    >
                      {a.activa ? "Desactivar" : "Activar"}
                    </Button>
                  </td>
                </tr>
              ))}
              {aprendido.length === 0 && (
                <tr>
                  <td className="p-3 text-carbon-suave" colSpan={4}>
                    Todavía no ha aprendido nada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@diana-mile/shared/ui/Button";

type Mensaje = {
  id: string;
  telefono: string;
  tipo: string;
  plantilla: string;
  estado: string;
  intentos: number;
  ultimo_error: string | null;
  enviado_at: string | null;
  created_at: string;
};

type Conversacion = {
  id: string;
  telefono: string;
  nombre: string | null;
  ultimo_experto: string | null;
  ia_activa: boolean;
  ultimo_entrante_at: string | null;
};

type Evento = {
  id: string;
  telefono: string;
  evento: string;
  created_at: string;
};

const COLOR_ESTADO: Record<string, string> = {
  enviado: "text-green-700",
  pendiente: "text-amber-700",
  fallido: "text-amber-800",
  descartado: "text-red-700",
};

function fecha(valor: string | null): string {
  if (!valor) return "—";
  return new Date(valor).toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function dentroDeVentana(ultimoEntrante: string | null): boolean {
  if (!ultimoEntrante) return false;
  return Date.now() - new Date(ultimoEntrante).getTime() < 24 * 3600_000;
}

export default function WhatsAppPage() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/whatsapp");
      const json = await res.json();
      setMensajes(json.mensajes ?? []);
      setConversaciones(json.conversaciones ?? []);
      setEventos(json.eventos ?? []);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function alternarIA(telefono: string, activa: boolean) {
    await fetch("/api/admin/whatsapp/ia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telefono, activa }),
    });
    cargar();
  }

  if (cargando) {
    return <p className="text-sm text-carbon-suave">Cargando…</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl text-carbon mb-2">WhatsApp</h1>
        <p className="text-sm text-carbon-suave">
          Mensajes que los agentes envían automáticamente y conversaciones que
          está atendiendo la IA. Si vas a responderle tú a alguien, apaga la IA
          en esa conversación para que el bot no siga escribiendo.
        </p>
      </div>

      <section>
        <h2 className="font-display text-lg text-carbon mb-3">
          Conversaciones ({conversaciones.length})
        </h2>
        <div className="bg-blanco border border-arena rounded-[4px] overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-carbon-suave border-b border-arena">
              <tr>
                <th className="p-3 font-normal">Persona</th>
                <th className="p-3 font-normal">Tema</th>
                <th className="p-3 font-normal">Último mensaje</th>
                <th className="p-3 font-normal">Ventana 24h</th>
                <th className="p-3 font-normal">IA</th>
              </tr>
            </thead>
            <tbody>
              {conversaciones.map((c) => (
                <tr key={c.id} className="border-b border-arena/50">
                  <td className="p-3">
                    {c.nombre ?? "—"}
                    <span className="block text-xs text-carbon-suave">
                      {c.telefono}
                    </span>
                  </td>
                  <td className="p-3">{c.ultimo_experto ?? "—"}</td>
                  <td className="p-3">{fecha(c.ultimo_entrante_at)}</td>
                  <td className="p-3">
                    {dentroDeVentana(c.ultimo_entrante_at) ? (
                      <span className="text-green-700">abierta</span>
                    ) : (
                      <span className="text-carbon-suave">cerrada</span>
                    )}
                  </td>
                  <td className="p-3">
                    <Button
                      variant={c.ia_activa ? "secondary" : "primary"}
                      onClick={() => alternarIA(c.telefono, !c.ia_activa)}
                    >
                      {c.ia_activa ? "Apagar IA" : "Prender IA"}
                    </Button>
                  </td>
                </tr>
              ))}
              {conversaciones.length === 0 && (
                <tr>
                  <td className="p-3 text-carbon-suave" colSpan={5}>
                    Todavía no hay conversaciones.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg text-carbon mb-3">
          Mensajes enviados
        </h2>
        <div className="bg-blanco border border-arena rounded-[4px] overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-carbon-suave border-b border-arena">
              <tr>
                <th className="p-3 font-normal">Teléfono</th>
                <th className="p-3 font-normal">Agente</th>
                <th className="p-3 font-normal">Plantilla</th>
                <th className="p-3 font-normal">Estado</th>
                <th className="p-3 font-normal">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {mensajes.map((m) => (
                <tr key={m.id} className="border-b border-arena/50">
                  <td className="p-3">{m.telefono}</td>
                  <td className="p-3">{m.tipo}</td>
                  <td className="p-3 text-xs">{m.plantilla}</td>
                  <td className="p-3">
                    <span className={COLOR_ESTADO[m.estado] ?? ""}>
                      {m.estado}
                    </span>
                    {m.intentos > 1 && (
                      <span className="text-xs text-carbon-suave">
                        {" "}
                        ({m.intentos} intentos)
                      </span>
                    )}
                    {m.ultimo_error && (
                      <span className="block text-xs text-red-700">
                        {m.ultimo_error}
                      </span>
                    )}
                  </td>
                  <td className="p-3">{fecha(m.enviado_at ?? m.created_at)}</td>
                </tr>
              ))}
              {mensajes.length === 0 && (
                <tr>
                  <td className="p-3 text-carbon-suave" colSpan={5}>
                    Todavía no se ha enviado ningún mensaje.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg text-carbon mb-3">
          Respuestas de clientes
        </h2>
        <div className="bg-blanco border border-arena rounded-[4px] overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-carbon-suave border-b border-arena">
              <tr>
                <th className="p-3 font-normal">Teléfono</th>
                <th className="p-3 font-normal">Respuesta</th>
                <th className="p-3 font-normal">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {eventos.map((e) => (
                <tr key={e.id} className="border-b border-arena/50">
                  <td className="p-3">{e.telefono}</td>
                  <td className="p-3">{e.evento}</td>
                  <td className="p-3">{fecha(e.created_at)}</td>
                </tr>
              ))}
              {eventos.length === 0 && (
                <tr>
                  <td className="p-3 text-carbon-suave" colSpan={3}>
                    Todavía no hay respuestas.
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

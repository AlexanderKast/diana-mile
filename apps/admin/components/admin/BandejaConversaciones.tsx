"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cx } from "@diana-mile/shared/utils";

/**
 * Bandeja de conversaciones de WhatsApp dentro del panel.
 *
 * POR QUE EXISTE
 * Para no tener que salir a Pancake a atender. El historial, el envio y el
 * interruptor de la IA ya vivian en el codigo: lo unico que faltaba era la
 * pantalla.
 *
 * LO QUE NO SE PUEDE RODEAR
 * Meta solo permite texto libre dentro de las 24h desde el ultimo mensaje de
 * la persona. Fuera de esa ventana hay que mandar una plantilla aprobada. Eso
 * no es una limitacion del panel y no hay forma de saltarselo: se muestra
 * apagado y explicado, en vez de dejar escribir y fallar al enviar.
 *
 * ESCRIBIR APAGA LA IA
 * Si el agente sigue activo mientras una persona escribe, los dos contestan y
 * la clienta recibe dos versiones de lo mismo. El primer mensaje a mano
 * silencia la IA de esa conversacion.
 */

type Conversacion = {
  id: string;
  telefono: string;
  nombre: string | null;
  ultimo_experto: string | null;
  ia_activa: boolean;
  ultimo_entrante_at: string | null;
  escalado_at: string | null;
  motivo_escalado: string | null;
  ventanaAbierta: boolean;
};

type Mensaje = {
  id: string;
  rol: "user" | "assistant";
  contenido: string;
  experto: string | null;
  created_at: string;
};

const REFRESCO_MS = 8000;

function tiempoDesde(iso: string | null): string {
  if (!iso) return "—";
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms)) return "—";
  const min = Math.floor(ms / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function hora(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BandejaConversaciones() {
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [activa, setActiva] = useState<string | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [detalle, setDetalle] = useState<Conversacion | null>(null);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const finRef = useRef<HTMLDivElement>(null);

  const cargarLista = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/conversaciones");
      if (!r.ok) return;
      const j = await r.json();
      setConversaciones(j.conversaciones ?? []);
    } catch {
      // Un fallo al refrescar la lista no debe romper el hilo abierto.
    }
  }, []);

  const cargarHilo = useCallback(async (id: string) => {
    try {
      const r = await fetch(`/api/admin/conversaciones/${id}`);
      if (!r.ok) return;
      const j = await r.json();
      setMensajes(j.mensajes ?? []);
      setDetalle(j.conversacion ?? null);
    } catch {
      /* idem */
    }
  }, []);

  useEffect(() => {
    void cargarLista();
    const t = setInterval(() => void cargarLista(), REFRESCO_MS);
    return () => clearInterval(t);
  }, [cargarLista]);

  useEffect(() => {
    if (!activa) return;
    void cargarHilo(activa);
    const t = setInterval(() => void cargarHilo(activa), REFRESCO_MS);
    return () => clearInterval(t);
  }, [activa, cargarHilo]);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes.length]);

  async function enviar() {
    const cuerpo = texto.trim();
    if (!cuerpo || !activa || enviando) return;

    setEnviando(true);
    setError(null);
    // Optimista: el mensaje aparece ya. Si falla se quita y se explica.
    const provisional: Mensaje = {
      id: `tmp-${Date.now()}`,
      rol: "assistant",
      contenido: cuerpo,
      experto: "humano",
      created_at: new Date().toISOString(),
    };
    setMensajes((m) => [...m, provisional]);
    setTexto("");

    try {
      const r = await fetch(`/api/admin/conversaciones/${activa}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: cuerpo }),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok) throw new Error(j?.error ?? `Error ${r.status}`);

      if (j?.iaSilenciada) {
        setDetalle((d) => (d ? { ...d, ia_activa: false } : d));
        void cargarLista();
      }
      void cargarHilo(activa);
    } catch (e) {
      setMensajes((m) => m.filter((x) => x.id !== provisional.id));
      setTexto(cuerpo);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setEnviando(false);
    }
  }

  async function alternarIA() {
    if (!detalle) return;
    const nueva = !detalle.ia_activa;
    setDetalle({ ...detalle, ia_activa: nueva });
    try {
      await fetch("/api/admin/whatsapp/ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefono: detalle.telefono, activa: nueva }),
      });
      void cargarLista();
    } catch {
      setDetalle({ ...detalle, ia_activa: !nueva });
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-[300px_1fr]">
      {/* Lista */}
      <div className="max-h-[70vh] overflow-y-auto rounded-[4px] border border-arena bg-blanco">
        {conversaciones.length === 0 && (
          <p className="p-4 text-sm text-ceniza">Sin conversaciones todavía.</p>
        )}
        {conversaciones.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActiva(c.id)}
            className={cx(
              "block w-full border-b border-arena/60 p-3 text-left last:border-0",
              activa === c.id ? "bg-lila-suave/50" : "hover:bg-crema/60",
            )}
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate text-sm font-medium text-carbon">
                {c.nombre || c.telefono}
              </span>
              <span className="shrink-0 text-[11px] text-ceniza">
                {tiempoDesde(c.ultimo_entrante_at)}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
              {c.escalado_at && <span className="text-error">🔔 esperando</span>}
              {!c.ia_activa && <span className="text-ceniza">IA apagada</span>}
              {!c.ventanaAbierta && (
                <span className="text-dorado-oscuro">ventana cerrada</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Hilo */}
      <div className="flex max-h-[70vh] flex-col rounded-[4px] border border-arena bg-blanco">
        {!detalle ? (
          <p className="p-6 text-sm text-ceniza">
            Elige una conversación de la izquierda.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-arena p-3">
              <div>
                <p className="text-sm font-medium text-carbon">
                  {detalle.nombre || detalle.telefono}
                </p>
                <p className="text-[11px] text-ceniza">
                  {detalle.telefono}
                  {detalle.ultimo_experto && ` · ${detalle.ultimo_experto}`}
                </p>
              </div>
              <button
                type="button"
                onClick={alternarIA}
                className={cx(
                  "rounded-[3px] border px-3 py-1 text-xs",
                  detalle.ia_activa
                    ? "border-morado bg-morado text-blanco"
                    : "border-arena bg-crema text-carbon-suave",
                )}
              >
                {detalle.ia_activa ? "IA activa" : "IA apagada"}
              </button>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-3">
              {mensajes.map((m) => (
                <div
                  key={m.id}
                  className={cx(
                    "max-w-[80%] rounded-[6px] px-3 py-2 text-sm",
                    m.rol === "user"
                      ? "bg-crema text-carbon"
                      : "ml-auto bg-lila-suave text-carbon",
                  )}
                >
                  <p className="whitespace-pre-wrap">{m.contenido}</p>
                  <p className="mt-1 text-[10px] text-ceniza">
                    {hora(m.created_at)}
                    {m.experto === "humano" && " · a mano"}
                  </p>
                </div>
              ))}
              <div ref={finRef} />
            </div>

            {error && (
              <p role="alert" className="border-t border-error/30 bg-error/10 px-3 py-2 text-xs text-error">
                {error}
              </p>
            )}

            <div className="border-t border-arena p-3">
              {detalle.ventanaAbierta ? (
                <div className="flex gap-2">
                  <textarea
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void enviar();
                      }
                    }}
                    rows={2}
                    placeholder="Escribe… (Enter envía, Shift+Enter salta línea)"
                    className="flex-1 resize-none rounded-[3px] border border-arena bg-crema px-3 py-2 text-sm text-carbon"
                  />
                  <button
                    type="button"
                    onClick={() => void enviar()}
                    disabled={enviando || !texto.trim()}
                    className="shrink-0 self-end rounded-[3px] bg-morado px-4 py-2 text-sm text-blanco disabled:opacity-50"
                  >
                    {enviando ? "…" : "Enviar"}
                  </button>
                </div>
              ) : (
                <p className="text-xs text-carbon-suave">
                  <strong className="text-dorado-oscuro">
                    Ventana de 24h cerrada.
                  </strong>{" "}
                  WhatsApp no deja mandar texto libre si pasaron más de 24h
                  desde su último mensaje. Para retomar hay que usar una
                  plantilla aprobada por Meta.
                </p>
              )}
              {detalle.ia_activa && detalle.ventanaAbierta && (
                <p className="mt-2 text-[11px] text-ceniza">
                  Al escribir se apaga la IA de esta conversación, para que no
                  respondan los dos.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@diana-mile/shared/ui/Button";
import { Input, Textarea } from "@diana-mile/shared/ui/Input";

export default function NotificacionesPage() {
  const [titulo, setTitulo] = useState("");
  const [cuerpo, setCuerpo] = useState("");
  const [url, setUrl] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{
    enviados: number;
    fallidos: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleEnviar() {
    setError(null);
    setResultado(null);

    if (!titulo.trim() || !cuerpo.trim()) {
      setError("El título y el mensaje son obligatorios.");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch("/api/admin/notificaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, cuerpo, url: url || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error");
      setResultado(json);
      setTitulo("");
      setCuerpo("");
      setUrl("");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudo enviar la notificación.",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-carbon mb-2">
        Notificaciones push
      </h1>
      <p className="text-sm text-carbon-suave mb-6">
        Se envía a todos los que hayan activado notificaciones en la tienda
        (recompra, contenido nuevo, promociones). Los cambios de estado de
        pedido ya notifican automáticamente al cliente correspondiente.
      </p>

      <div className="bg-blanco border border-arena rounded-[4px] p-5 max-w-lg flex flex-col gap-4">
        <Input
          label="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Nuevo contenido disponible"
        />
        <Textarea
          label="Mensaje"
          rows={4}
          value={cuerpo}
          onChange={(e) => setCuerpo(e.target.value)}
          placeholder="Ya subimos una nueva rutina a tu cuenta."
        />
        <Input
          label="Enlace al tocar (opcional)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="/cuenta/contenido"
        />

        {error && <p className="text-xs text-error">{error}</p>}
        {resultado && (
          <p className="text-xs text-dorado-oscuro">
            Enviado a {resultado.enviados} suscriptor
            {resultado.enviados === 1 ? "" : "es"}
            {resultado.fallidos > 0 ? ` (${resultado.fallidos} fallidos)` : ""}.
          </p>
        )}

        <Button disabled={enviando} onClick={handleEnviar} className="w-fit">
          {enviando ? "Enviando..." : "Enviar a todos"}
        </Button>
      </div>
    </div>
  );
}

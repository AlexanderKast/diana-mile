"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Silencia una alerta por 7 dias.
 *
 * Solo se ofrece en las alertas marcadas `silenciable`. Las criticas no
 * se pueden apagar: si "N productos sin costo" se pudiera silenciar, la
 * utilidad seguiria saliendo inflada y ya nada avisaria de por que.
 *
 * El silencio VENCE a proposito. Un descarte permanente termina
 * escondiendo un problema que volvio.
 */
const DIAS_SILENCIO = 7;

export function SilenciarAlerta({ tipo }: { tipo: string }) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);

  async function silenciar() {
    setEnviando(true);
    try {
      await fetch("/api/admin/alertas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, dias: DIAS_SILENCIO }),
      });
      router.refresh();
    } catch {
      setEnviando(false);
    }
  }

  return (
    <button
      onClick={() => void silenciar()}
      disabled={enviando}
      className="text-xs opacity-60 hover:opacity-100 transition-opacity whitespace-nowrap disabled:opacity-40"
    >
      {enviando ? "…" : `Silenciar ${DIAS_SILENCIO} días`}
    </button>
  );
}

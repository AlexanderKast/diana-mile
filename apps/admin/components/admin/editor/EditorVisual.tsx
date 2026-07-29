"use client";

import { useMemo, useRef, useState } from "react";
import { Puck, type Data } from "@measured/puck";
import "@measured/puck/puck.css";
import type {
  LandingPuckData,
  ProductLandingContent,
} from "@diana-mile/shared/types";
import { legacyAPuck } from "@diana-mile/shared/landing/legacy-a-puck";
import { Button } from "@diana-mile/shared/ui/Button";
import { configEditor, type EditorMetadata } from "@/lib/puck/config.client";

type EditorVisualProps = {
  /** Contenido completo actual (legacy + puckData si existe). */
  contenidoInicial: ProductLandingContent;
  /** PUT destino: /api/admin/productos/<handle> o /api/admin/landings/<id>. */
  saveEndpoint: string;
  /** Las variantes del rotador guardan el JSON envuelto en { contenido }. */
  envolverEnContenido?: boolean;
  productoTitulo: string;
  productoImagenUrl: string | null;
};

const MAX_KB = 60;

/**
 * Editor visual drag-and-drop de landings. El canvas arranca con el
 * `puckData` guardado, o sembrado desde el contenido clasico via
 * legacyAPuck. Guardar escribe `puckData` DENTRO del contenido existente:
 * los campos clasicos quedan como respaldo (rollback = borrar puckData).
 */
export default function EditorVisual({
  contenidoInicial,
  saveEndpoint,
  envolverEnContenido = false,
  productoTitulo,
  productoImagenUrl,
}: EditorVisualProps) {
  const dataInicial = useMemo<Data>(() => {
    const sembrado = contenidoInicial.puckData ?? legacyAPuck(contenidoInicial);
    return sembrado as Data;
  }, [contenidoInicial]);

  // El estado vivo del canvas se guarda en un ref (onChange dispara en cada
  // arrastre; un setState aqui re-renderizaria el editor entero cada vez).
  const dataActual = useRef<Data>(dataInicial);
  const [kb, setKb] = useState(() =>
    Math.round(JSON.stringify(dataInicial).length / 1024),
  );
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const metadata: EditorMetadata = {
    titulo: productoTitulo,
    imagenUrl: productoImagenUrl,
  };

  async function guardar() {
    setGuardando(true);
    setError(null);
    setMensaje(null);
    try {
      const contenido: ProductLandingContent = {
        ...contenidoInicial,
        puckData: dataActual.current as unknown as LandingPuckData,
      };
      const res = await fetch(saveEndpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(envolverEnContenido ? { contenido } : contenido),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No se pudo guardar el diseno.");
      }
      setMensaje("Diseno guardado. La landing ya lo muestra.");
      setTimeout(() => setMensaje(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <p className="text-xs text-ceniza max-w-xl">
          Arrastra bloques desde la izquierda y edita sus textos a la derecha.
          Recuerda: cero urgencia fabricada, cero testimonios inventados — el
          volumen se atribuye a Nu Skin y la marca visible es Milito.
        </p>
        <div className="flex items-center gap-3">
          <span
            className={`text-xs ${kb > MAX_KB ? "text-error" : "text-ceniza"}`}
          >
            {kb}KB / {MAX_KB}KB
          </span>
          {error && <span className="text-xs text-error">{error}</span>}
          {mensaje && <span className="text-xs text-dorado-oscuro">{mensaje}</span>}
          <Button onClick={guardar} disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar diseño"}
          </Button>
        </div>
      </div>
      <div style={{ height: "calc(100vh - 14rem)" }}>
        <Puck
          config={configEditor}
          data={dataInicial}
          metadata={metadata}
          viewports={[
            { width: 390, label: "Móvil" },
            { width: 1280, label: "Escritorio" },
          ]}
          onChange={(data) => {
            dataActual.current = data;
            setKb(Math.round(JSON.stringify(data).length / 1024));
          }}
          onPublish={guardar}
        />
      </div>
    </div>
  );
}

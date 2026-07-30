"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createUsePuck, Puck, type Data } from "@measured/puck";
import "@measured/puck/puck.css";
import type {
  LandingPuckData,
  ProductLandingContent,
} from "@diana-mile/shared/types";
import { legacyAPuck } from "@diana-mile/shared/landing/legacy-a-puck";
import { Button } from "@diana-mile/shared/ui/Button";
import { Textarea } from "@diana-mile/shared/ui/Input";
import { configEditor, type EditorMetadata } from "@/lib/puck/config.client";

const usePuck = createUsePuck();

type EditorVisualProps = {
  /** Contenido completo actual (legacy + puckData si existe). */
  contenidoInicial: ProductLandingContent;
  /** PUT destino: /api/admin/productos/<handle> o /api/admin/landings/<id>. */
  saveEndpoint: string;
  /** Las variantes del rotador guardan el JSON envuelto en { contenido }. */
  envolverEnContenido?: boolean;
  productoTitulo: string;
  productoImagenUrl: string | null;
  /** Handle del producto — lo usa el generador IA. */
  productoHandle: string;
  /** URL de la landing real en la tienda ("Ver en la tienda"). */
  urlPreview?: string;
};

const MAX_KB = 60;

type Borrador = { data: Data; ts: number };

function claveBorrador(saveEndpoint: string): string {
  return `milito_borrador_${saveEndpoint}`;
}

function leerBorrador(saveEndpoint: string): Borrador | null {
  try {
    const crudo = localStorage.getItem(claveBorrador(saveEndpoint));
    if (!crudo) return null;
    const json = JSON.parse(crudo) as Borrador;
    return json?.data?.content ? json : null;
  } catch {
    return null;
  }
}

/**
 * Editor visual drag-and-drop de landings. El canvas arranca con el
 * `puckData` guardado, o sembrado desde el contenido clasico via
 * legacyAPuck. Guardar escribe `puckData` DENTRO del contenido existente
 * (rollback = borrar la clave). Cada cambio se respalda en localStorage:
 * cerrar la pestana sin guardar no pierde el trabajo.
 */
export default function EditorVisual({
  contenidoInicial,
  saveEndpoint,
  envolverEnContenido = false,
  productoTitulo,
  productoImagenUrl,
  productoHandle,
  urlPreview,
}: EditorVisualProps) {
  const dataGuardada = useMemo<Data>(() => {
    const sembrado = contenidoInicial.puckData ?? legacyAPuck(contenidoInicial);
    return sembrado as Data;
  }, [contenidoInicial]);

  // El canvas se puede reemplazar entero (recuperar borrador, generar con
  // IA): data viva + key para remontar <Puck>.
  const [dataActiva, setDataActiva] = useState<Data>(dataGuardada);
  const [puckKey, setPuckKey] = useState(0);

  // Estado vivo del canvas en un ref (onChange dispara en cada arrastre; un
  // setState re-renderizaria el editor entero cada vez).
  const dataActual = useRef<Data>(dataGuardada);
  const [kb, setKb] = useState(() =>
    Math.round(JSON.stringify(dataGuardada).length / 1024),
  );
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [borradorPendiente, setBorradorPendiente] = useState<Borrador | null>(null);
  const [mostrarIA, setMostrarIA] = useState(false);
  const [brief, setBrief] = useState("");
  const [generando, setGenerando] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Al montar: si quedo un borrador local distinto de lo guardado, ofrecer
  // recuperarlo (se pierde trabajo solo si la usuaria lo descarta).
  useEffect(() => {
    const borrador = leerBorrador(saveEndpoint);
    if (borrador && JSON.stringify(borrador.data) !== JSON.stringify(dataGuardada)) {
      setBorradorPendiente(borrador);
    }
    // Solo al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const metadata: EditorMetadata = {
    titulo: productoTitulo,
    imagenUrl: productoImagenUrl,
  };

  function reemplazarCanvas(data: Data) {
    dataActual.current = data;
    setDataActiva(data);
    setPuckKey((k) => k + 1);
    setKb(Math.round(JSON.stringify(data).length / 1024));
  }

  /** Avisos de calidad (no bloquean): lo que un pro revisaria antes de pautar. */
  function avisosDeCalidad(data: Data): string[] {
    const avisos: string[] = [];
    const bloques = (data.content ?? []) as Array<{
      type?: string;
      props?: Record<string, unknown>;
    }>;
    const imagenesSinAlt = bloques.filter(
      (b) => b.type === "Imagen" && b.props?.url && !b.props?.alt,
    ).length;
    if (imagenesSinAlt > 0) {
      avisos.push(
        `${imagenesSinAlt} imagen(es) sin texto alternativo (accesibilidad y SEO).`,
      );
    }
    const videosSinPoster = bloques.filter(
      (b) => b.type === "Video" && b.props?.url && !b.props?.poster,
    ).length;
    if (videosSinPoster > 0) {
      avisos.push(
        `${videosSinPoster} video(s) sin imagen de portada (se ve un cuadro negro al cargar).`,
      );
    }
    const totalVideos = bloques.filter((b) => b.type === "Video").length;
    if (totalVideos > 2) {
      avisos.push(
        `${totalVideos} videos en una sola pagina: en datos moviles pesa mucho.`,
      );
    }
    const primerosTipos = bloques.slice(0, 3).map((b) => b.type);
    const hayCtaTemprano = primerosTipos.some((t) =>
      ["HeroCompra", "BotonCTA", "BandaCTA", "ResumenPedido", "BotonWhatsApp"].includes(
        t ?? "",
      ),
    );
    if (bloques.length > 0 && !hayCtaTemprano) {
      avisos.push(
        "Ningun boton de pedido en los primeros 3 bloques: en movil la primera pantalla decide.",
      );
    }
    return avisos;
  }

  async function guardar() {
    const avisos = avisosDeCalidad(dataActual.current);
    if (avisos.length > 0) {
      const seguir = window.confirm(
        `Antes de guardar, revisa:\n\n• ${avisos.join("\n• ")}\n\n¿Guardar de todas formas?`,
      );
      if (!seguir) return;
    }
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
      localStorage.removeItem(claveBorrador(saveEndpoint));
      setMensaje("Guardado ✓");
      setTimeout(() => setMensaje(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setGuardando(false);
    }
  }

  async function generarConIA() {
    setGenerando(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/productos/${productoHandle}/generar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: brief.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo generar con IA.");
      // El generador produce el JSON clasico; el conversor lo vuelve canvas.
      // Nada se guarda hasta que la usuaria guarde.
      reemplazarCanvas(legacyAPuck(data.content as ProductLandingContent) as Data);
      setMostrarIA(false);
      setMensaje("Contenido generado — revisa, ajusta y guarda.");
      setTimeout(() => setMensaje(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al generar.");
    } finally {
      setGenerando(false);
    }
  }

  /** Header propio de Puck: un solo boton Guardar (en espanol) + estado. */
  function AccionesHeader() {
    const dataHeader = usePuck((s) => s.appState.data);
    const kbHeader = Math.round(JSON.stringify(dataHeader).length / 1024);
    return (
      <>
        <span className={`text-xs mr-2 ${kbHeader > MAX_KB ? "text-error" : "text-ceniza"}`}>
          {kbHeader}KB / {MAX_KB}KB
        </span>
        {urlPreview && (
          <a
            href={urlPreview}
            target="_blank"
            rel="noreferrer"
            className="mr-2 px-3 py-2 text-sm rounded-[4px] border border-arena bg-blanco text-carbon hover:border-dorado"
          >
            Ver en la tienda ↗
          </a>
        )}
        <button
          type="button"
          onClick={() => setMostrarIA((v) => !v)}
          className="mr-2 px-3 py-2 text-sm rounded-[4px] border border-arena bg-blanco text-carbon hover:border-dorado"
        >
          ✨ IA
        </button>
        <Button onClick={guardar} disabled={guardando}>
          {guardando ? "Guardando..." : "Guardar diseño"}
        </Button>
      </>
    );
  }

  return (
    <div>
      {borradorPendiente && (
        <div className="flex flex-wrap items-center gap-3 border border-dorado bg-crema rounded-[4px] p-3 mb-3">
          <p className="text-sm text-carbon flex-1">
            Tienes cambios sin guardar de hace{" "}
            {Math.max(1, Math.round((Date.now() - borradorPendiente.ts) / 60000))}{" "}
            min. ¿Recuperarlos?
          </p>
          <Button
            onClick={() => {
              reemplazarCanvas(borradorPendiente.data);
              setBorradorPendiente(null);
            }}
          >
            Recuperar
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              localStorage.removeItem(claveBorrador(saveEndpoint));
              setBorradorPendiente(null);
            }}
          >
            Descartar
          </Button>
        </div>
      )}

      {mostrarIA && (
        <div className="border border-arena rounded-[4px] bg-crema/40 p-4 mb-3 flex flex-col gap-3">
          <p className="text-xs text-ceniza">
            Genera una landing completa al canvas con IA. REEMPLAZA lo que hay
            en el lienzo (no lo guardado). Revisa y ajusta antes de guardar —
            recuerda: cero urgencia fabricada, cero testimonios inventados.
          </p>
          <Textarea
            label="Brief (opcional)"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={3}
            placeholder="Ángulo de venta, audiencia, dolores, tono..."
          />
          <div className="flex gap-2">
            <Button type="button" onClick={generarConIA} disabled={generando}>
              {generando ? "Generando..." : "Generar al canvas"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setMostrarIA(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <p className="text-xs text-ceniza max-w-xl">
          Toca cualquier texto en el lienzo para editarlo directo, o arrastra
          bloques desde la izquierda. Marca Milito: cero urgencia fabricada,
          cero testimonios inventados.
        </p>
        <div className="flex items-center gap-3">
          {error && <span className="text-xs text-error">{error}</span>}
          {mensaje && <span className="text-xs text-dorado-oscuro">{mensaje}</span>}
        </div>
      </div>

      <div style={{ height: "calc(100vh - 13rem)" }}>
        <Puck
          key={puckKey}
          config={configEditor}
          data={dataActiva}
          metadata={metadata}
          headerTitle={productoTitulo}
          viewports={[
            { width: 390, label: "Móvil" },
            { width: 1280, label: "Escritorio" },
          ]}
          overrides={{
            // Reemplaza el "Publish" nativo (en ingles) por nuestro flujo.
            headerActions: () => <AccionesHeader />,
          }}
          onChange={(data) => {
            dataActual.current = data;
            setKb(Math.round(JSON.stringify(data).length / 1024));
            // Respaldo local con debounce: cerrar la pestana no pierde nada.
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
              try {
                localStorage.setItem(
                  claveBorrador(saveEndpoint),
                  JSON.stringify({ data, ts: Date.now() } satisfies Borrador),
                );
              } catch {
                // localStorage lleno o bloqueado: el respaldo es best-effort.
              }
            }, 1500);
          }}
          onPublish={guardar}
        />
      </div>
      <p className="mt-1 text-[11px] text-ceniza">
        Respaldo automático local activo · {kb}KB
      </p>
    </div>
  );
}

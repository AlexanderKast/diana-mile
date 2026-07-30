"use client";

import { useState } from "react";
import type { Data } from "@measured/puck";
import {
  landingMagica,
  type SeccionImagen,
} from "@diana-mile/shared/landing/plantillas";
import { Button } from "@diana-mile/shared/ui/Button";
import { Textarea } from "@diana-mile/shared/ui/Input";

const SECCIONES: { tipo: string; label: string }[] = [
  { tipo: "hero", label: "Hero / gancho" },
  { tipo: "oferta", label: "Oferta y precio real" },
  { tipo: "beneficios", label: "Beneficios" },
  { tipo: "comparativa", label: "Tabla comparativa" },
  { tipo: "autoridad", label: "Autoridad Nu Skin" },
  { tipo: "uso", label: "Cómo se usa" },
  { tipo: "sensorial", label: "Experiencia sensorial" },
  { tipo: "logistica", label: "Logística + garantía" },
  { tipo: "faq", label: "Preguntas frecuentes" },
];

type Copy = {
  tipo: string;
  titular: string;
  subtitular?: string;
  bullets?: string[];
  cta?: string;
  precio_texto?: string;
  notas_visuales?: string;
};

type EstadoSeccion =
  | { fase: "pendiente" }
  | { fase: "generando" }
  | { fase: "lista"; imagen: SeccionImagen }
  | { fase: "error"; mensaje: string };

/**
 * Wizard "Landing magica": copy exacto con Mistral (revisable ANTES de
 * gastar imagenes) → una imagen publicitaria por seccion con Nano Banana
 * Pro (concurrencia 3, reintento individual) → layout final aplicado al
 * lienzo. Guardar sigue siendo el boton explicito del editor.
 */
export default function LandingMagica({
  productoHandle,
  onAplicar,
  onCerrar,
}: {
  productoHandle: string;
  onAplicar: (data: Data) => void;
  onCerrar: () => void;
}) {
  const [paso, setPaso] = useState<"brief" | "copy" | "imagenes">("brief");
  const [brief, setBrief] = useState("");
  const [seleccion, setSeleccion] = useState<Set<string>>(
    () => new Set(SECCIONES.map((s) => s.tipo)),
  );
  const [copys, setCopys] = useState<Copy[]>([]);
  const [estados, setEstados] = useState<Record<string, EstadoSeccion>>({});
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function actualizarCopy(tipo: string, cambios: Partial<Copy>) {
    setCopys((prev) =>
      prev.map((c) => (c.tipo === tipo ? { ...c, ...cambios } : c)),
    );
  }

  async function generarCopy() {
    setOcupado(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/productos/${productoHandle}/copy-secciones`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brief: brief.trim() || undefined,
            secciones: [...seleccion],
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo generar el copy.");
      setCopys(data.secciones);
      setPaso("copy");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al generar copy.");
    } finally {
      setOcupado(false);
    }
  }

  async function generarSeccion(copy: Copy): Promise<void> {
    setEstados((e) => ({ ...e, [copy.tipo]: { fase: "generando" } }));
    try {
      const res = await fetch(
        `/api/admin/productos/${productoHandle}/generar-seccion`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tipo: copy.tipo, copy }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Fallo la generacion.");
      setEstados((e) => ({
        ...e,
        [copy.tipo]: {
          fase: "lista",
          imagen: {
            tipo: copy.tipo,
            url: data.url,
            width: data.width,
            height: data.height,
            titular: copy.titular,
          },
        },
      }));
    } catch (err) {
      setEstados((e) => ({
        ...e,
        [copy.tipo]: {
          fase: "error",
          mensaje: err instanceof Error ? err.message : "Error.",
        },
      }));
    }
  }

  /** Pool de concurrencia 3: 9 generaciones a la vez disparan rate limits. */
  async function generarImagenes() {
    setPaso("imagenes");
    setError(null);
    const cola = [...copys];
    const trabajador = async () => {
      for (;;) {
        const copy = cola.shift();
        if (!copy) return;
        await generarSeccion(copy);
      }
    };
    await Promise.all([trabajador(), trabajador(), trabajador()]);
  }

  const listas = copys
    .map((c) => estados[c.tipo])
    .filter((e): e is Extract<EstadoSeccion, { fase: "lista" }> => e?.fase === "lista");
  const todasListas = copys.length > 0 && listas.length === copys.length;

  function aplicar() {
    onAplicar(landingMagica(listas.map((e) => e.imagen)) as Data);
    onCerrar();
  }

  return (
    <div className="border border-arena rounded-[4px] bg-crema/40 p-4 mb-3 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-carbon">🪄 Landing mágica</p>
        <button type="button" onClick={onCerrar} className="text-xs text-ceniza hover:text-carbon">
          Cerrar
        </button>
      </div>
      {error && <p className="text-xs text-error">{error}</p>}

      {paso === "brief" && (
        <>
          <p className="text-xs text-ceniza">
            Genera la landing como secciones-imagen profesionales (texto dentro
            de la imagen, tu producto real como referencia). Primero revisas el
            copy; las imágenes se generan después (~$0.15 USD por sección).
          </p>
          <Textarea
            label="Brief (opcional)"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={3}
            placeholder="Ángulo de venta, audiencia, dolores, tono..."
          />
          <div className="flex flex-wrap gap-2">
            {SECCIONES.map((s) => (
              <label
                key={s.tipo}
                className={`text-xs px-3 py-1.5 rounded-full border cursor-pointer ${
                  seleccion.has(s.tipo)
                    ? "border-dorado-oscuro bg-blanco text-carbon"
                    : "border-arena text-ceniza"
                }`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={seleccion.has(s.tipo)}
                  onChange={() =>
                    setSeleccion((prev) => {
                      const siguiente = new Set(prev);
                      if (siguiente.has(s.tipo)) siguiente.delete(s.tipo);
                      else siguiente.add(s.tipo);
                      return siguiente;
                    })
                  }
                />
                {s.label}
              </label>
            ))}
          </div>
          <Button onClick={generarCopy} disabled={ocupado || seleccion.size === 0} className="self-start">
            {ocupado ? "Escribiendo copy..." : "1 · Generar copy"}
          </Button>
        </>
      )}

      {paso === "copy" && (
        <>
          <p className="text-xs text-ceniza">
            Revisa y corrige el texto — es EXACTAMENTE lo que quedará dibujado
            dentro de cada imagen (tildes incluidas). Nada se genera hasta el
            paso 2.
          </p>
          <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
            {copys.map((c) => (
              <div key={c.tipo} className="rounded-[4px] border border-arena bg-blanco p-3 flex flex-col gap-2">
                <p className="text-[10px] uppercase tracking-widest text-ceniza">
                  {SECCIONES.find((s) => s.tipo === c.tipo)?.label ?? c.tipo}
                </p>
                <input
                  value={c.titular}
                  onChange={(e) => actualizarCopy(c.tipo, { titular: e.target.value })}
                  className="w-full text-sm font-medium rounded-[4px] border border-arena px-2 py-1.5 text-carbon focus:outline-none focus:border-dorado"
                />
                {(c.bullets ?? []).map((b, i) => (
                  <input
                    key={i}
                    value={b}
                    onChange={(e) =>
                      actualizarCopy(c.tipo, {
                        bullets: (c.bullets ?? []).map((x, j) => (j === i ? e.target.value : x)),
                      })
                    }
                    className="w-full text-xs rounded-[4px] border border-arena px-2 py-1 text-carbon-suave focus:outline-none focus:border-dorado"
                  />
                ))}
                {c.precio_texto !== undefined && (
                  <input
                    value={c.precio_texto}
                    onChange={(e) => actualizarCopy(c.tipo, { precio_texto: e.target.value })}
                    className="w-full text-xs rounded-[4px] border border-dorado/50 px-2 py-1 text-dorado-oscuro focus:outline-none focus:border-dorado"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={generarImagenes} className="self-start">
              2 · Generar {copys.length} imágenes
            </Button>
            <Button variant="secondary" onClick={() => setPaso("brief")}>
              Volver
            </Button>
          </div>
        </>
      )}

      {paso === "imagenes" && (
        <>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {copys.map((c) => {
              const estado = estados[c.tipo] ?? { fase: "pendiente" };
              return (
                <div key={c.tipo} className="flex flex-col gap-1">
                  <div className="relative aspect-[3/4] rounded-md overflow-hidden border border-arena bg-blanco flex items-center justify-center">
                    {estado.fase === "lista" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={estado.imagen.url} alt={c.titular} className="absolute inset-0 h-full w-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-ceniza text-center px-1">
                        {estado.fase === "generando"
                          ? "Generando..."
                          : estado.fase === "error"
                            ? "Error"
                            : "En cola"}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-ceniza truncate">
                    {SECCIONES.find((s) => s.tipo === c.tipo)?.label}
                  </p>
                  {estado.fase === "error" && (
                    <button
                      type="button"
                      onClick={() => generarSeccion(c)}
                      className="text-[10px] text-dorado-oscuro hover:underline text-left"
                    >
                      Reintentar
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={aplicar} disabled={!todasListas}>
              3 · Aplicar al lienzo ({listas.length}/{copys.length})
            </Button>
            <span className="text-xs text-ceniza">
              Revisa ortografía y producto en cada imagen antes de aplicar.
            </span>
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import type { Data } from "@measured/puck";
import {
  landingMagica,
  type SeccionImagen,
} from "@diana-mile/shared/landing/plantillas";
import { Button } from "@diana-mile/shared/ui/Button";
import { Textarea } from "@diana-mile/shared/ui/Input";
import {
  SECCIONES_LANDING,
  TIPOS_SECCION,
  etiquetaSeccion,
} from "@/lib/secciones-landing";

type Copy = {
  tipo: string;
  titular: string;
  subtitular?: string;
  bullets?: string[];
  cta?: string;
  precio_texto?: string;
  notas_visuales?: string;
};

type AnguloResumen = {
  id: string;
  nombre: string;
  datos: {
    secciones?: string[];
    instrucciones_adicionales?: string;
  } | null;
  updated_at: string;
};

type EstadoSeccion =
  | { fase: "pendiente" }
  | { fase: "generando" }
  | { fase: "lista"; imagen: SeccionImagen }
  | { fase: "error"; mensaje: string };

function fecha(iso: string): string {
  return new Date(iso).toLocaleString("es-CO", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

/**
 * Wizard "Landing magica": se elige el angulo de venta (el brief estrategico
 * del producto) → copy exacto con Mistral, revisable ANTES de gastar imagenes
 * → una imagen publicitaria por seccion con Nano Banana Pro (concurrencia 3,
 * reintento individual) → layout final aplicado al lienzo. Guardar sigue
 * siendo el boton explicito del editor.
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
  const [paso, setPaso] = useState<"angulo" | "brief" | "copy" | "imagenes">(
    "angulo",
  );
  const [angulos, setAngulos] = useState<AnguloResumen[]>([]);
  const [anguloId, setAnguloId] = useState<string | null>(null);
  const [cargandoAngulos, setCargandoAngulos] = useState(true);
  const [brief, setBrief] = useState("");
  const [seleccion, setSeleccion] = useState<Set<string>>(
    () => new Set(TIPOS_SECCION),
  );
  const [copys, setCopys] = useState<Copy[]>([]);
  const [estados, setEstados] = useState<Record<string, EstadoSeccion>>({});
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // No enciende `cargandoAngulos` al entrar: ya arranca en true y encenderlo
  // aqui seria un setState sincrono dentro del efecto.
  const cargarAngulos = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/productos/${productoHandle}/angulos`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "No se pudieron cargar los ángulos.");
      }
      setAngulos(data.angulos ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar ángulos.");
    } finally {
      setCargandoAngulos(false);
    }
  }, [productoHandle]);

  useEffect(() => {
    cargarAngulos();
  }, [cargarAngulos]);

  /**
   * Elegir un angulo precarga su seleccion de secciones y sus instrucciones:
   * son parte del brief, y volver a teclearlas aqui seria escribir dos veces
   * lo mismo (y arriesgarse a que difieran).
   */
  function elegirAngulo(angulo: AnguloResumen) {
    setAnguloId(angulo.id);
    const secciones = (angulo.datos?.secciones ?? []).filter((s) =>
      (TIPOS_SECCION as readonly string[]).includes(s),
    );
    if (secciones.length) setSeleccion(new Set(secciones));
    setBrief(angulo.datos?.instrucciones_adicionales ?? "");
  }

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
            angulo_id: anguloId ?? undefined,
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
          body: JSON.stringify({
            tipo: copy.tipo,
            copy,
            angulo_id: anguloId ?? undefined,
          }),
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

  /** Pool de concurrencia 3: 11 generaciones a la vez disparan rate limits. */
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
    .filter(
      (e): e is Extract<EstadoSeccion, { fase: "lista" }> => e?.fase === "lista",
    );
  const todasListas = copys.length > 0 && listas.length === copys.length;

  function aplicar() {
    onAplicar(landingMagica(listas.map((e) => e.imagen)) as Data);
    onCerrar();
  }

  return (
    <div className="border border-arena rounded-[4px] bg-crema/40 p-4 mb-3 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-carbon">🪄 Landing mágica</p>
        <button
          type="button"
          onClick={onCerrar}
          className="text-xs text-ceniza hover:text-carbon"
        >
          Cerrar
        </button>
      </div>
      {error && <p className="text-xs text-error">{error}</p>}

      {paso === "angulo" && (
        <>
          <p className="text-xs text-ceniza">
            Elige el ángulo de venta con el que se va a escribir esta landing:
            mismo producto, distinto dolor y distinta clienta. Sin ángulo el
            generador trabaja solo con la ficha de Shopify y tus instrucciones.
          </p>

          {cargandoAngulos && (
            <p className="text-xs text-ceniza">Cargando ángulos...</p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setAnguloId(null)}
              className={`text-left rounded-[4px] border px-3 py-2 ${
                anguloId === null
                  ? "border-dorado-oscuro bg-blanco"
                  : "border-arena bg-blanco/60"
              }`}
            >
              <span className="block text-xs font-medium text-carbon">
                Sin ángulo (solo instrucciones)
              </span>
              <span className="block text-[10px] text-ceniza">
                Como funcionaba antes
              </span>
            </button>

            {angulos.map((angulo) => (
              <button
                key={angulo.id}
                type="button"
                onClick={() => elegirAngulo(angulo)}
                className={`text-left rounded-[4px] border px-3 py-2 ${
                  anguloId === angulo.id
                    ? "border-dorado-oscuro bg-blanco"
                    : "border-arena bg-blanco/60"
                }`}
              >
                <span className="block text-xs font-medium text-carbon">
                  {angulo.nombre}
                </span>
                <span className="block text-[10px] text-ceniza">
                  {fecha(angulo.updated_at)}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => setPaso("brief")}>Continuar</Button>
            <a
              href={`/dashboard/productos/${productoHandle}/angulos`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-dorado-oscuro hover:underline"
            >
              Crear o editar ángulos ↗
            </a>
            <button
              type="button"
              onClick={() => {
                setCargandoAngulos(true);
                cargarAngulos();
              }}
              className="text-xs text-ceniza hover:text-carbon"
            >
              Recargar lista
            </button>
          </div>
        </>
      )}

      {paso === "brief" && (
        <>
          <p className="text-xs text-ceniza">
            Genera la landing como secciones-imagen profesionales (texto dentro
            de la imagen, tu producto real como referencia). Primero revisas el
            copy; las imágenes se generan después (~$0.15 USD por sección).
          </p>
          <Textarea
            label="Instrucciones adicionales para esta landing"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={3}
            placeholder="Matices para esta landing en concreto: tono, qué recalcar, qué evitar."
          />
          <div className="flex flex-wrap gap-2">
            {SECCIONES_LANDING.map((s) => (
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
          <div className="flex gap-2">
            <Button
              onClick={generarCopy}
              disabled={ocupado || seleccion.size === 0}
            >
              {ocupado ? "Escribiendo copy..." : "1 · Generar copy"}
            </Button>
            <Button variant="secondary" onClick={() => setPaso("angulo")}>
              Volver
            </Button>
          </div>
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
              <div
                key={c.tipo}
                className="rounded-[4px] border border-arena bg-blanco p-3 flex flex-col gap-2"
              >
                <p className="text-[10px] uppercase tracking-widest text-ceniza">
                  {etiquetaSeccion(c.tipo)}
                </p>
                <input
                  value={c.titular}
                  onChange={(e) =>
                    actualizarCopy(c.tipo, { titular: e.target.value })
                  }
                  className="w-full text-sm font-medium rounded-[4px] border border-arena px-2 py-1.5 text-carbon focus:outline-none focus:border-dorado"
                />
                {(c.bullets ?? []).map((b, i) => (
                  <input
                    key={i}
                    value={b}
                    onChange={(e) =>
                      actualizarCopy(c.tipo, {
                        bullets: (c.bullets ?? []).map((x, j) =>
                          j === i ? e.target.value : x,
                        ),
                      })
                    }
                    className="w-full text-xs rounded-[4px] border border-arena px-2 py-1 text-carbon-suave focus:outline-none focus:border-dorado"
                  />
                ))}
                {c.precio_texto !== undefined && (
                  <input
                    value={c.precio_texto}
                    onChange={(e) =>
                      actualizarCopy(c.tipo, { precio_texto: e.target.value })
                    }
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
                      <img
                        src={estado.imagen.url}
                        alt={c.titular}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <span
                        className={`text-[10px] text-center px-1 ${
                          estado.fase === "error" ? "text-error" : "text-ceniza"
                        }`}
                      >
                        {estado.fase === "generando"
                          ? "Generando..."
                          : estado.fase === "error"
                            ? // El backend responde 400 con explicaciones que el
                              // admin puede resolver ("faltan fotos reales"), no
                              // con fallos tecnicos: se muestran tal cual.
                              estado.mensaje
                            : "En cola"}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-ceniza truncate">
                    {etiquetaSeccion(c.tipo)}
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

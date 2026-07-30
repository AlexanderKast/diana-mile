"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  ANGULO_VACIO,
  LIMITE_TEXTO,
  type AnguloVenta,
  type SexoPersonajes,
  type UnidadOferta,
} from "@diana-mile/shared/landing/angulo";
import { Button } from "@diana-mile/shared/ui/Button";
import { Input, Textarea } from "@diana-mile/shared/ui/Input";
import CampoArchivo from "@/components/admin/editor/CampoArchivo";
import { SECCIONES_LANDING, TIPOS_SECCION } from "@/lib/secciones-landing";

type AnguloFila = {
  id: string;
  nombre: string;
  datos: Partial<AnguloVenta> | null;
  created_at: string;
  updated_at: string;
};

/** Los seis campos de estrategia, en el orden en que se piensa un brief. */
const CAMPOS_ESTRATEGIA = [
  {
    campo: "angulo_venta",
    label: "Ángulo de venta",
    placeholder:
      'Por cuál de sus usos atacamos el producto y por qué ese y no otro. Ej. "Se vende como el gel que no reseca, para quien se lava las manos veinte veces al día".',
  },
  {
    campo: "problema",
    label: "Problema específico",
    placeholder:
      'La situación concreta que vive hoy y que la haría buscar este producto. Ej. "Se le parte la piel de los nudillos y ya probó tres cremas de droguería".',
  },
  {
    campo: "avatar",
    label: "Avatar / público objetivo",
    placeholder:
      "Mujeres de 30 a 55 años en Colombia que... (momento de vida, cómo compran, qué les genera desconfianza).",
  },
  {
    campo: "resultado_deseado",
    label: "Resultado deseado",
    placeholder:
      "Lo que ELLA quiere lograr, escrito como deseo suyo — nunca como promesa de la marca.",
  },
  {
    campo: "solucion_ideal",
    label: "Cómo el producto es la solución ideal",
    placeholder:
      "Qué tendría para ella la solución perfecta y en qué se le parece este producto.",
  },
  {
    campo: "mecanismo_unico",
    label: "Mecanismo único",
    placeholder:
      "Qué lo hace distinto según la información real: formulación, origen, respaldo de Nu Skin, compra contraentrega.",
  },
] as const satisfies readonly {
  campo: keyof AnguloVenta;
  label: string;
  placeholder: string;
}[];

type CampoLargoClave =
  | (typeof CAMPOS_ESTRATEGIA)[number]["campo"]
  | "detalles_producto"
  | "instrucciones_adicionales";

const CAMPOS_LARGOS: CampoLargoClave[] = [
  ...CAMPOS_ESTRATEGIA.map((c) => c.campo),
  "detalles_producto",
  "instrucciones_adicionales",
];

const CANTIDADES: UnidadOferta["cantidad"][] = [1, 2, 3];

function fecha(iso: string): string {
  return new Date(iso).toLocaleString("es-CO", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

/**
 * Completa una fila de la base con los defaults del contrato. Un angulo
 * guardado antes de que existiera un campo llega sin el, y un `undefined`
 * suelto en un `value` convierte el input en no controlado a mitad de vida.
 */
function conDefaults(
  datos: Partial<AnguloVenta> | null | undefined,
): AnguloVenta {
  return {
    ...ANGULO_VACIO,
    ...(datos ?? {}),
    oferta: { unidades: datos?.oferta?.unidades ?? [] },
    personajes: { ...ANGULO_VACIO.personajes, ...(datos?.personajes ?? {}) },
    fotos_producto: datos?.fotos_producto ?? [],
    fotos_antes_despues: datos?.fotos_antes_despues ?? [],
    secciones: datos?.secciones ?? [],
  };
}

function estaVacio(valor: string | string[]): boolean {
  return typeof valor === "string"
    ? valor.trim().length === 0
    : valor.length === 0;
}

function Contador({ largo }: { largo: number }) {
  return (
    <span
      className={`text-[10px] ${largo > LIMITE_TEXTO ? "text-error" : "text-ceniza"}`}
    >
      {largo}/{LIMITE_TEXTO}
    </span>
  );
}

function BadgeIA() {
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full border border-dorado/60 text-dorado-oscuro bg-crema/60">
      borrador IA — revísalo
    </span>
  );
}

function CampoLargo({
  id,
  label,
  valor,
  placeholder,
  esBorrador,
  onChange,
}: {
  id: string;
  label: string;
  valor: string;
  placeholder?: string;
  esBorrador: boolean;
  onChange: (valor: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Textarea
        id={id}
        label={label}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        placeholder={placeholder}
      />
      <div className="flex items-center justify-between gap-2">
        {esBorrador ? <BadgeIA /> : <span />}
        <Contador largo={valor.length} />
      </div>
    </div>
  );
}

function Bloque({
  titulo,
  ayuda,
  children,
}: {
  titulo: string;
  ayuda?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[4px] border border-arena bg-blanco p-4 flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-medium text-carbon">{titulo}</h2>
        {ayuda && <p className="text-xs text-ceniza mt-0.5">{ayuda}</p>}
      </div>
      {children}
    </section>
  );
}

/**
 * Editor de angulos de venta de un producto.
 *
 * Un angulo es el brief estrategico con el que se genera una landing: mismo
 * producto, distinto dolor y distinto avatar. Se guarda con boton explicito
 * (sin autosave) porque el prellenado con IA escribe encima del formulario y
 * un guardado automatico dejaria el borrador del modelo en la base antes de
 * que nadie lo haya leido.
 */
export default function AngulosVenta({
  handle,
  productoTitulo,
  fotosShopify = [],
}: {
  handle: string;
  productoTitulo: string;
  /** Primeras fotos del producto en Shopify: arrancan el ángulo nuevo. */
  fotosShopify?: string[];
}) {
  function anguloEnBlanco(): AnguloVenta {
    return {
      ...ANGULO_VACIO,
      nombre_producto: productoTitulo,
      fotos_producto: fotosShopify.slice(0, 3),
      secciones: [...TIPOS_SECCION],
    };
  }

  const [angulos, setAngulos] = useState<AnguloFila[]>([]);
  const [activoId, setActivoId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [datos, setDatos] = useState<AnguloVenta>(anguloEnBlanco);
  /** Campos que escribió el prellenado y el admin todavía no ha tocado. */
  const [borradorIA, setBorradorIA] = useState<Set<string>>(new Set());
  const [cargando, setCargando] = useState(true);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  // No enciende `cargando` al entrar: ya arranca en true y encenderlo aqui
  // seria un setState sincrono dentro del efecto (renders en cascada).
  const cargar = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/productos/${handle}/angulos`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "No se pudieron cargar los ángulos.");
      }
      setAngulos(data.angulos ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar.");
    } finally {
      setCargando(false);
    }
  }, [handle]);

  useEffect(() => {
    // El setState ocurre despues del await, no en el cuerpo del efecto, pero
    // la regla no distingue una cosa de la otra en una funcion async.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar();
  }, [cargar]);

  function limpiarMensajes() {
    setError(null);
    setAviso(null);
  }

  function abrirNuevo() {
    limpiarMensajes();
    setActivoId(null);
    setNombre("");
    setDatos(anguloEnBlanco());
    setBorradorIA(new Set());
  }

  function abrir(fila: AnguloFila) {
    limpiarMensajes();
    setActivoId(fila.id);
    setNombre(fila.nombre);
    setDatos(conDefaults(fila.datos));
    setBorradorIA(new Set());
  }

  function actualizar<K extends keyof AnguloVenta>(
    campo: K,
    valor: AnguloVenta[K],
  ) {
    setDatos((previo) => ({ ...previo, [campo]: valor }));
    setBorradorIA((previo) => {
      if (!previo.has(campo)) return previo;
      const siguiente = new Set(previo);
      siguiente.delete(campo);
      return siguiente;
    });
  }

  function actualizarFoto(
    campo: "fotos_producto" | "fotos_antes_despues",
    indice: number,
    url: string,
  ) {
    const siguiente = [...datos[campo]];
    siguiente[indice] = url;
    // Se compacta para que no queden huecos: el contrato guarda un arreglo
    // de URLs, no ranuras numeradas.
    actualizar(
      campo,
      siguiente.filter((u) => typeof u === "string" && u.trim().length > 0),
    );
  }

  function actualizarUnidad(
    cantidad: UnidadOferta["cantidad"],
    cambios: Partial<Omit<UnidadOferta, "cantidad">>,
  ) {
    const previa = datos.oferta.unidades.find((u) => u.cantidad === cantidad);
    const actualizada: UnidadOferta = {
      cantidad,
      precio: previa?.precio ?? 0,
      precio_comparacion: previa?.precio_comparacion ?? null,
      ...cambios,
    };
    actualizar("oferta", {
      unidades: [
        ...datos.oferta.unidades.filter((u) => u.cantidad !== cantidad),
        actualizada,
      ].sort((a, b) => a.cantidad - b.cantidad),
    });
  }

  function alternarSeccion(tipo: string) {
    const siguientes = datos.secciones.includes(tipo)
      ? datos.secciones.filter((s) => s !== tipo)
      : // Se rearma desde el orden canonico para que las secciones no queden
        // en el orden en que el admin fue marcando las casillas.
        TIPOS_SECCION.filter((t) => t === tipo || datos.secciones.includes(t));
    actualizar("secciones", [...siguientes]);
  }

  async function prellenar() {
    limpiarMensajes();
    setOcupado(true);
    try {
      const res = await fetch(
        `/api/admin/productos/${handle}/angulos/prellenar`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ parcial: datos }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo prellenar.");

      const recibido = conDefaults(data.datos);
      const rellenados = new Set<string>();
      setDatos((actual) => {
        const fusion: AnguloVenta = { ...actual };
        for (const campo of CAMPOS_LARGOS) {
          if (estaVacio(actual[campo]) && !estaVacio(recibido[campo])) {
            fusion[campo] = recibido[campo];
            rellenados.add(campo);
          }
        }
        if (estaVacio(actual.nombre_producto) && recibido.nombre_producto) {
          fusion.nombre_producto = recibido.nombre_producto;
          rellenados.add("nombre_producto");
        }
        if (!actual.fotos_producto.length && recibido.fotos_producto.length) {
          fusion.fotos_producto = recibido.fotos_producto;
          rellenados.add("fotos_producto");
        }
        if (!actual.oferta.unidades.length && recibido.oferta.unidades.length) {
          fusion.oferta = recibido.oferta;
          rellenados.add("oferta");
        }
        return fusion;
      });
      setBorradorIA((previo) => new Set([...previo, ...rellenados]));
      setAviso(
        rellenados.size
          ? "Borrador listo. Revisa los campos marcados antes de guardar."
          : "No había campos vacíos que rellenar.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al prellenar.");
    } finally {
      setOcupado(false);
    }
  }

  async function guardar() {
    limpiarMensajes();
    if (!nombre.trim()) {
      setError("Ponle un nombre al ángulo antes de guardar.");
      return;
    }
    const largos = CAMPOS_LARGOS.filter((c) => datos[c].length > LIMITE_TEXTO);
    if (largos.length) {
      setError(
        `Hay ${largos.length} campo(s) de más de ${LIMITE_TEXTO} caracteres. Recórtalos: si no, se guardan cortados a mitad de frase.`,
      );
      return;
    }

    setOcupado(true);
    try {
      const esNuevo = activoId === null;
      const res = await fetch(
        esNuevo
          ? `/api/admin/productos/${handle}/angulos`
          : `/api/admin/productos/${handle}/angulos/${activoId}`,
        {
          method: esNuevo ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre: nombre.trim(), datos }),
        },
      );
      const data = await res.json();
      if (res.status === 409) {
        setError(
          `Ya hay un ángulo llamado "${nombre.trim()}" en este producto. Ponle otro nombre.`,
        );
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "No se pudo guardar el ángulo.");

      setActivoId(data.angulo.id);
      setNombre(data.angulo.nombre);
      setDatos(conDefaults(data.angulo.datos));
      setBorradorIA(new Set());
      setAviso("Ángulo guardado.");
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setOcupado(false);
    }
  }

  async function eliminar(fila: AnguloFila) {
    const confirmado = window.confirm(
      `¿Borrar el ángulo "${fila.nombre}"? Las landings ya generadas con él no se tocan, pero el brief se pierde.`,
    );
    if (!confirmado) return;

    limpiarMensajes();
    setOcupado(true);
    try {
      const res = await fetch(
        `/api/admin/productos/${handle}/angulos/${fila.id}`,
        { method: "DELETE" },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo borrar el ángulo.");
      if (activoId === fila.id) abrirNuevo();
      setAviso("Ángulo borrado.");
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al borrar.");
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="grid md:grid-cols-[260px_1fr] gap-6">
      <aside className="flex flex-col gap-2">
        <button
          type="button"
          onClick={abrirNuevo}
          className="w-full text-left text-xs px-3 py-2 rounded-[4px] border border-dashed border-arena text-carbon hover:border-dorado"
        >
          + Nuevo ángulo
        </button>

        {cargando && (
          <p className="text-xs text-ceniza px-1">Cargando ángulos...</p>
        )}
        {!cargando && angulos.length === 0 && (
          <p className="text-xs text-ceniza px-1">
            Todavía no hay ángulos para este producto.
          </p>
        )}

        {angulos.map((fila) => (
          <div
            key={fila.id}
            className={`rounded-[4px] border px-3 py-2 flex items-start justify-between gap-2 ${
              fila.id === activoId
                ? "border-dorado-oscuro bg-crema/60"
                : "border-arena bg-blanco"
            }`}
          >
            <button
              type="button"
              onClick={() => abrir(fila)}
              className="flex-1 text-left"
            >
              <span className="block text-xs font-medium text-carbon">
                {fila.nombre}
              </span>
              <span className="block text-[10px] text-ceniza">
                {fecha(fila.updated_at)}
              </span>
            </button>
            <button
              type="button"
              onClick={() => eliminar(fila)}
              title="Borrar ángulo"
              className="text-[10px] text-ceniza hover:text-error"
            >
              Borrar
            </button>
          </div>
        ))}
      </aside>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={prellenar} disabled={ocupado}>
            {ocupado ? "Trabajando..." : "✨ Prellenar con IA"}
          </Button>
          <span className="text-xs text-ceniza max-w-sm">
            Solo escribe en los campos vacíos. Lo que tú escribiste no se toca.
          </span>
        </div>

        {error && <p className="text-xs text-error">{error}</p>}
        {aviso && <p className="text-xs text-dorado-oscuro">{aviso}</p>}

        <Bloque titulo="Identidad">
          <Input
            id="angulo-nombre"
            label="Nombre del ángulo (obligatorio)"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Manos partidas por lavado frecuente"
          />
          <Input
            id="angulo-nombre-producto"
            label="Nombre del producto"
            value={datos.nombre_producto}
            onChange={(e) => actualizar("nombre_producto", e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-ceniza font-medium">
              Color predominante (opcional)
            </span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                aria-label="Elegir color predominante"
                value={
                  /^#[0-9a-fA-F]{6}$/.test(datos.color_predominante ?? "")
                    ? datos.color_predominante
                    : "#a8885e"
                }
                onChange={(e) =>
                  actualizar("color_predominante", e.target.value)
                }
                className="h-11 w-14 rounded-[4px] border border-arena bg-blanco p-1"
              />
              <input
                type="text"
                aria-label="Color predominante en hexadecimal"
                value={datos.color_predominante ?? ""}
                onChange={(e) =>
                  actualizar("color_predominante", e.target.value)
                }
                placeholder="#A8885E — déjalo vacío si no aplica"
                className="flex-1 min-h-[44px] text-sm rounded-lg border border-arena bg-blanco px-3 py-2 text-carbon placeholder:text-ceniza focus:outline-none focus:border-dorado"
              />
            </div>
          </div>
          <fieldset className="flex flex-col gap-1.5">
            <legend className="text-xs text-ceniza font-medium">
              Proporción de las imágenes
            </legend>
            <div className="flex gap-4 pt-1">
              {(["3:4", "4:5"] as const).map((valor) => (
                <label
                  key={valor}
                  className="flex items-center gap-2 text-sm text-carbon"
                >
                  <input
                    type="radio"
                    name="proporcion"
                    value={valor}
                    checked={datos.proporcion === valor}
                    onChange={() => actualizar("proporcion", valor)}
                  />
                  {valor}
                </label>
              ))}
            </div>
          </fieldset>
        </Bloque>

        <Bloque
          titulo="Estrategia"
          ayuda="Esto no es copy: es la materia prima con la que después se escribe el copy de cada sección."
        >
          {CAMPOS_ESTRATEGIA.map((c) => (
            <CampoLargo
              key={c.campo}
              id={`angulo-${c.campo}`}
              label={c.label}
              valor={datos[c.campo]}
              placeholder={c.placeholder}
              esBorrador={borradorIA.has(c.campo)}
              onChange={(valor) => actualizar(c.campo, valor)}
            />
          ))}
        </Bloque>

        <Bloque titulo="Detalles del producto">
          <CampoLargo
            id="angulo-detalles"
            label="Qué es, qué trae, cómo se usa"
            valor={datos.detalles_producto}
            placeholder="Descripción factual: presentación, contenido, modo de uso. Sin promesas de resultado."
            esBorrador={borradorIA.has("detalles_producto")}
            onChange={(valor) => actualizar("detalles_producto", valor)}
          />
        </Bloque>

        <Bloque
          titulo="Oferta (COP)"
          ayuda="Pesos colombianos — la tienda maneja una sola moneda. Deja el comparativo vacío si no hay un precio anterior real."
        >
          {borradorIA.has("oferta") && <BadgeIA />}
          {CANTIDADES.map((cantidad) => {
            const unidad = datos.oferta.unidades.find(
              (u) => u.cantidad === cantidad,
            );
            return (
              <div
                key={cantidad}
                className="grid grid-cols-[80px_1fr_1fr] items-end gap-2"
              >
                <span className="text-xs text-ceniza pb-3">
                  {cantidad} {cantidad === 1 ? "unidad" : "unidades"}
                </span>
                <Input
                  id={`precio-${cantidad}`}
                  label="Precio"
                  type="number"
                  min={0}
                  step={100}
                  value={unidad?.precio ? String(unidad.precio) : ""}
                  onChange={(e) =>
                    actualizarUnidad(cantidad, {
                      precio: Number(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                />
                <Input
                  id={`precio-comparacion-${cantidad}`}
                  label="Antes (opcional)"
                  type="number"
                  min={0}
                  step={100}
                  value={
                    unidad?.precio_comparacion
                      ? String(unidad.precio_comparacion)
                      : ""
                  }
                  onChange={(e) =>
                    actualizarUnidad(cantidad, {
                      precio_comparacion: Number(e.target.value) || null,
                    })
                  }
                  placeholder="—"
                />
              </div>
            );
          })}
        </Bloque>

        <Bloque
          titulo="Personajes"
          ayuda="Quién aparece en las imágenes generadas."
        >
          <div className="grid sm:grid-cols-2 gap-3">
            <Input
              id="personajes-nacionalidad"
              label="Nacionalidad"
              value={datos.personajes.nacionalidad}
              onChange={(e) =>
                actualizar("personajes", {
                  ...datos.personajes,
                  nacionalidad: e.target.value,
                })
              }
              placeholder="Colombiana"
            />
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="personajes-sexo"
                className="text-xs text-ceniza font-medium"
              >
                Sexo
              </label>
              <select
                id="personajes-sexo"
                value={datos.personajes.sexo}
                onChange={(e) =>
                  actualizar("personajes", {
                    ...datos.personajes,
                    sexo: e.target.value as SexoPersonajes,
                  })
                }
                className="min-h-[44px] rounded-lg border border-arena bg-blanco px-4 py-2.5 text-base text-carbon focus:outline-none focus:border-dorado"
              >
                <option value="femenino">Femenino</option>
                <option value="masculino">Masculino</option>
                <option value="mixto">Mixto</option>
              </select>
            </div>
            <Input
              id="personajes-edad-min"
              label="Edad desde"
              type="number"
              min={18}
              max={90}
              value={String(datos.personajes.edad_min)}
              onChange={(e) =>
                actualizar("personajes", {
                  ...datos.personajes,
                  edad_min: Number(e.target.value) || 0,
                })
              }
            />
            <Input
              id="personajes-edad-max"
              label="Edad hasta"
              type="number"
              min={18}
              max={90}
              value={String(datos.personajes.edad_max)}
              onChange={(e) =>
                actualizar("personajes", {
                  ...datos.personajes,
                  edad_max: Number(e.target.value) || 0,
                })
              }
            />
          </div>
        </Bloque>

        <Bloque titulo="Logística">
          <div className="grid sm:grid-cols-2 gap-3">
            <Input
              id="pais-venta"
              label="País de venta"
              value={datos.pais_venta}
              onChange={(e) => actualizar("pais_venta", e.target.value)}
              placeholder="Colombia"
            />
            <Input
              id="pais-logistica"
              label="País de la logística"
              value={datos.pais_logistica}
              onChange={(e) => actualizar("pais_logistica", e.target.value)}
              placeholder="Colombia"
            />
          </div>
        </Bloque>

        <Bloque
          titulo="Fotos"
          ayuda="Solo se guardan imágenes del CDN de Shopify: súbelas aquí o elígelas de la biblioteca. Una URL de otro dominio se descarta al guardar."
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <p className="text-xs text-ceniza">Fotos del producto (hasta 3)</p>
              {borradorIA.has("fotos_producto") && <BadgeIA />}
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {[0, 1, 2].map((i) => (
                <CampoArchivo
                  key={`producto-${i}`}
                  tipo="imagen"
                  value={datos.fotos_producto[i] ?? ""}
                  onChange={(url) => actualizarFoto("fotos_producto", i, url)}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs text-ceniza">
              Fotos reales / material oficial Nu Skin (hasta 4)
            </p>
            <p className="text-xs text-ceniza">
              Fotos reales de clientas o material oficial del fabricante. Se usan
              tal cual en la sección de antes y después; si son del fabricante,
              la imagen llevará su atribución.
            </p>
            <div className="grid sm:grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <CampoArchivo
                  key={`antes-despues-${i}`}
                  tipo="imagen"
                  value={datos.fotos_antes_despues[i] ?? ""}
                  onChange={(url) =>
                    actualizarFoto("fotos_antes_despues", i, url)
                  }
                />
              ))}
            </div>
          </div>
        </Bloque>

        <Bloque
          titulo="Secciones"
          ayuda="Las que se generarán con este ángulo. Puedes cambiarlas después en el wizard."
        >
          <div className="flex flex-wrap gap-2">
            {SECCIONES_LANDING.map((s) => (
              <label
                key={s.tipo}
                className={`text-xs px-3 py-1.5 rounded-full border cursor-pointer ${
                  datos.secciones.includes(s.tipo)
                    ? "border-dorado-oscuro bg-crema/60 text-carbon"
                    : "border-arena text-ceniza"
                }`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={datos.secciones.includes(s.tipo)}
                  onChange={() => alternarSeccion(s.tipo)}
                />
                {s.label}
              </label>
            ))}
          </div>
        </Bloque>

        <Bloque titulo="Instrucciones adicionales">
          <CampoLargo
            id="angulo-instrucciones"
            label="Lo que el generador debe tener en cuenta"
            valor={datos.instrucciones_adicionales}
            placeholder='Ej. "No mostrar rostros completos", "usar el frasco dorado", "evitar fondos blancos".'
            esBorrador={borradorIA.has("instrucciones_adicionales")}
            onChange={(valor) => actualizar("instrucciones_adicionales", valor)}
          />
        </Bloque>

        <div className="flex items-center gap-3">
          <Button onClick={guardar} disabled={ocupado}>
            {ocupado
              ? "Guardando..."
              : activoId
                ? "Guardar cambios"
                : "Crear ángulo"}
          </Button>
          <span className="text-xs text-ceniza">
            Nada se guarda solo — este botón es el único que escribe.
          </span>
        </div>
      </div>
    </div>
  );
}

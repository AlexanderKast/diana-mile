"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@diana-mile/shared/ui/Button";
import type { QuizPuerta, RespuestasQuiz, Resultado } from "@/lib/quiz/tipos";
import { obtenerPuerta } from "@/lib/quiz/puertas";
import { zonaOfertaDesdePais } from "@/lib/quiz/paises";
import {
  avanzar,
  avanzarHastaPendiente,
  calcularProgreso,
  cargarEstado,
  crearEstadoInicial,
  esRespuestaValida,
  indicePaso,
  limpiarEstado,
  obtenerPaso,
  retroceder,
  seccionActual,
  seccionesDePuerta,
  type EstadoQuiz,
} from "@/lib/quiz/motor";
import { prefiereMenosMovimiento } from "@/lib/quiz/movimiento";
import { BarraProgreso } from "./BarraProgreso";
import { BotonVolver } from "./BotonVolver";
import { PasoOpcionUnica } from "./pasos/PasoOpcionUnica";
import { PasoOpcionMultiple } from "./pasos/PasoOpcionMultiple";
import { PasoEscala } from "./pasos/PasoEscala";
import { PasoNumero } from "./pasos/PasoNumero";
import { PasoPayoff } from "./pasos/PasoPayoff";
import { PasoPais } from "./pasos/PasoPais";
import { PasoCargando } from "./pasos/PasoCargando";

const DEBOUNCE_ABANDONO_MS = 1200;

/**
 * Puntos FIJOS por paso avanzado — deliberadamente NO ligados a
 * `opcion.puntaje`: si los puntos visibles dependieran de la opcion
 * elegida, la gente elegiria "lo que da mas puntos" y sesgaria el
 * diagnostico. Esto premia avanzar, no responder "bien".
 */
const PUNTOS_POR_PASO = 10;
/** La racha se muestra recien desde este numero de pasos seguidos. */
const RACHA_MINIMA_VISIBLE = 3;
/** Cuanto dura el overlay de "etapa completada" antes de esfumarse solo. */
const DURACION_HITO_MS = 1100;

function claveIdGuardado(puertaId: string): string {
  return `milito_quiz_id_${puertaId}`;
}

function leerIdGuardado(puertaId: string): string | null {
  try {
    return localStorage.getItem(claveIdGuardado(puertaId));
  } catch {
    return null;
  }
}

function guardarIdGuardado(puertaId: string, id: string): void {
  try {
    localStorage.setItem(claveIdGuardado(puertaId), id);
  } catch {
    // No-op: sin esto el proximo abandono simplemente crea otra fila.
  }
}

function limpiarIdGuardado(puertaId: string): void {
  try {
    localStorage.removeItem(claveIdGuardado(puertaId));
  } catch {
    // No-op.
  }
}

export function QuizRunner({
  puertaId,
  respuestasPrevias,
}: {
  puertaId: QuizPuerta;
  /** Respuestas reutilizables de OTROS tests del mismo visitante (lista blanca de lib/quiz/previas.ts) — se siembran y sus preguntas se saltan. */
  respuestasPrevias?: RespuestasQuiz;
}) {
  const router = useRouter();
  const puerta = useMemo(() => obtenerPuerta(puertaId), [puertaId]);

  // Estado inicial identico en servidor y cliente (las previas llegan por
  // props desde el server component, asi que participan del SSR sin
  // mismatch; localStorage se carga despues, en el useEffect de abajo).
  // `avanzarHastaPendiente` salta de una las preguntas ya respondidas en
  // otros tests — el funnel arranca directo en la primera pendiente.
  const [estado, setEstado] = useState<EstadoQuiz>(() =>
    avanzarHastaPendiente(puerta, crearEstadoInicial(puerta, respuestasPrevias)),
  );
  const [valorPendiente, setValorPendiente] = useState<unknown>(undefined);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [enviando, setEnviando] = useState(false);
  // Nombre de la etapa recien completada — dispara el overlay de hito.
  const [hitoCelebrado, setHitoCelebrado] = useState<string | null>(null);

  const quizIdRef = useRef<string | null>(null);
  const yaFinalizadoRef = useRef(false);
  const hitoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const secciones = useMemo(() => seccionesDePuerta(puerta), [puerta]);

  // Retomar un test a medias, solo en cliente.
  useEffect(() => {
    const guardado = cargarEstado(puerta);
    if (guardado) setEstado(guardado);
    quizIdRef.current = leerIdGuardado(puerta.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puerta.id]);

  const pasoActual = obtenerPaso(puerta, estado.pasoActualId);

  // El valor pendiente (lo que la persona esta editando en el paso actual,
  // antes de confirmar con "Continuar") se resetea cada vez que cambia el
  // paso, arrancando desde lo que ya habia respondido si vuelve para atras.
  useEffect(() => {
    if (!pasoActual) {
      setValorPendiente(undefined);
      return;
    }

    const existente = estado.respuestas[pasoActual.id];
    if (existente !== undefined) {
      setValorPendiente(existente);
      return;
    }

    // La escala se dibuja con un valor por defecto (el punto medio o
    // `valorInicial`) desde el primer render — si el motor no cuenta ese
    // default como respuesta, "Continuar" queda deshabilitado aunque la
    // persona nunca haya tocado nada distinto de lo que ya ve.
    setValorPendiente(
      pasoActual.tipo === "escala"
        ? (pasoActual.valorInicial ??
            Math.round((pasoActual.min + pasoActual.max) / 2))
        : undefined,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado.pasoActualId]);

  // Registro de abandono: en cada avance (cambia pasoActualId), con
  // debounce — mismo patron que el carrito abandonado del checkout
  // (apps/shop/components/form/CODForm.tsx). Nunca bloquea el flujo.
  useEffect(() => {
    if (estado.completado || estado.historial.length === 0) return;

    const pasoPaisId = puerta.pasos.find((p) => p.tipo === "pais")?.id;
    const pais = pasoPaisId
      ? (estado.respuestas[pasoPaisId] as string | undefined)
      : undefined;

    const timeout = setTimeout(() => {
      fetch("/api/quiz/abandono", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: quizIdRef.current,
          puerta: puerta.id,
          respuestas: estado.respuestas,
          pasoActual: indicePaso(puerta, estado.pasoActualId),
          pais: pais ?? null,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.id && !quizIdRef.current) {
            quizIdRef.current = data.id;
            guardarIdGuardado(puerta.id, data.id);
          }
        })
        .catch(() => {
          // Best-effort, igual que carrito abandonado.
        });
    }, DEBOUNCE_ABANDONO_MS);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado.pasoActualId, estado.completado]);

  // Cierre del quiz: cuando el motor marca completado, se calcula el
  // resultado y se manda al servidor UNA sola vez.
  useEffect(() => {
    if (!estado.completado || yaFinalizadoRef.current) return;
    yaFinalizadoRef.current = true;
    setEnviando(true);

    const pasoPaisId = puerta.pasos.find((p) => p.tipo === "pais")?.id;
    const pais = pasoPaisId
      ? (estado.respuestas[pasoPaisId] as string | undefined)
      : undefined;
    const zonaOferta = zonaOfertaDesdePais(pais);
    const resultadoFinal = puerta.calcularResultado(estado.respuestas, zonaOferta);

    fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: quizIdRef.current,
        puerta: puerta.id,
        respuestas: estado.respuestas,
        score: resultadoFinal.score,
        segmento: resultadoFinal.segmento,
        pais: pais ?? null,
        zonaOferta: resultadoFinal.zonaOferta,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        limpiarEstado(puerta.id);
        limpiarIdGuardado(puerta.id);
        if (data?.id) {
          // El diagnostico real vive en /resultado/[id] (copy completo,
          // compartible por WhatsApp) — este componente nunca debe quedarse
          // mostrando su propia pantalla de cierre cuando el guardado sale bien.
          quizIdRef.current = data.id;
          router.replace(`/resultado/${data.id}`);
        } else {
          // Sin id no hay a donde redirigir (el guardado remoto fallo pero
          // no tiro excepcion) — se muestra el resultado calculado en
          // cliente para no dejar a la persona sin nada tras responder todo.
          setResultado(resultadoFinal);
        }
      })
      .catch(() => {
        // Fallo de red: mismo fallback, la persona ya invirtio el tiempo
        // de responder, no se le puede devolver un error en la ultima pantalla.
        setResultado(resultadoFinal);
      })
      .finally(() => setEnviando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado.completado]);

  function irASiguiente(valor?: unknown) {
    const nuevoEstado = avanzar(puerta, estado, valor);

    // Celebracion de hito: si el avance cruzo a otra etapa nombrada, se
    // muestra un overlay breve con la etapa que quedo completada. Con
    // reduced-motion no hay overlay (el nombre de etapa de la barra ya
    // comunica el cambio sin animacion).
    const seccionAntes = seccionActual(puerta, estado.pasoActualId);
    const seccionDespues = seccionActual(puerta, nuevoEstado.pasoActualId);
    if (
      seccionAntes &&
      seccionDespues !== seccionAntes &&
      !nuevoEstado.completado &&
      !prefiereMenosMovimiento()
    ) {
      setHitoCelebrado(seccionAntes);
      if (hitoTimeoutRef.current) clearTimeout(hitoTimeoutRef.current);
      hitoTimeoutRef.current = setTimeout(
        () => setHitoCelebrado(null),
        DURACION_HITO_MS,
      );
    }

    setEstado(nuevoEstado);
  }

  function irAAnterior() {
    setEstado(retroceder(estado));
  }

  useEffect(() => {
    return () => {
      if (hitoTimeoutRef.current) clearTimeout(hitoTimeoutRef.current);
    };
  }, []);

  if (resultado) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-5 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-dorado text-dorado-oscuro">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </span>
        <h1 className="font-display text-2xl text-carbon">
          Ya tenemos tu diagnostico
        </h1>
        <p className="text-sm text-carbon-suave">
          No pudimos abrirlo automaticamente esta vez. Escribinos por
          WhatsApp y te lo mandamos directo.
        </p>
      </div>
    );
  }

  if (!pasoActual) return null;

  const requiereContinuar =
    pasoActual.tipo === "opcion_multiple" ||
    pasoActual.tipo === "escala" ||
    pasoActual.tipo === "numero" ||
    pasoActual.tipo === "payoff";

  const continuarHabilitado =
    pasoActual.tipo === "payoff" || esRespuestaValida(pasoActual, valorPendiente);

  // Gamificacion derivada del propio historial (nada que persistir): cada
  // paso visitado suma puntos fijos; la racha son los pasos seguidos de la
  // sesion (volver atras la reduce, porque el historial se acorta).
  const pasosAvanzados = estado.historial.length;
  const puntos = pasosAvanzados * PUNTOS_POR_PASO;
  const rachaVisible = pasosAvanzados >= RACHA_MINIMA_VISIBLE;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col overflow-y-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3">
      <div className="flex shrink-0 items-center gap-3">
        <BotonVolver
          visible={estado.historial.length > 0}
          onClick={irAAnterior}
        />
        <BarraProgreso
          progreso={calcularProgreso(puerta, estado)}
          secciones={secciones}
          seccionActual={seccionActual(puerta, estado.pasoActualId)}
        />
        {puntos > 0 && (
          <div className="flex shrink-0 items-center gap-2" aria-live="polite">
            {rachaVisible && (
              <span
                className="flex items-center gap-0.5 text-xs font-semibold text-morado"
                title={`${pasosAvanzados} pasos seguidos`}
              >
                <svg
                  width="12"
                  height="14"
                  viewBox="0 0 12 14"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M6 0C6 3 2 4.5 2 8.5a4 4 0 0 0 8 0C10 6 8.5 5 8 3.5 7 5 5.5 5.5 5.5 7.5A1.6 1.6 0 0 1 6 0Z" />
                </svg>
                x{pasosAvanzados}
              </span>
            )}
            {/* key=puntos: remonta el contador en cada avance para
                retriggerar el pop (mismo patron que el check de opciones). */}
            <span
              key={puntos}
              className="animate-puntos-pop rounded-full border border-dorado bg-crema px-2 py-0.5 text-xs font-semibold text-dorado-oscuro"
            >
              {puntos} pts
            </span>
          </div>
        )}
      </div>

      {/* Overlay de hito: la etapa recien completada, con la misma insignia
          de los payoffs. pointer-events-none: nunca bloquea el paso nuevo. */}
      {hitoCelebrado && (
        <div
          className="pointer-events-none fixed inset-x-0 top-1/4 z-30 flex justify-center"
          aria-hidden="true"
        >
          <div className="animate-payoff-badge-pop flex items-center gap-2.5 rounded-2xl border-2 border-dorado bg-blanco px-5 py-3 shadow-[0_8px_30px_rgba(168,136,94,0.3)]">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-dorado-oscuro text-blanco">
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 6l2.5 2.5L10 3"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="text-sm font-semibold text-carbon">
              {hitoCelebrado} — ¡completado!
            </span>
          </div>
        </div>
      )}

      {/* key=pasoActualId: remonta el bloque en cada cambio de paso para que
          la animacion de entrada se dispare siempre (patron estandar de
          React sin libreria). El h1 sigue siendo el primer elemento del
          bloque, asi que el orden de lectura/foco no cambia. */}
      <div
        key={estado.pasoActualId}
        className="animate-paso-entrada flex flex-1 flex-col justify-center gap-6 py-6"
      >
        <div className="flex flex-col gap-2 text-center">
          <h1 className="font-display text-2xl text-carbon">
            {pasoActual.titulo}
          </h1>
          {pasoActual.descripcion && (
            <p className="text-sm text-carbon-suave">
              {pasoActual.descripcion}
            </p>
          )}
        </div>

        {pasoActual.tipo === "opcion_unica" && (
          <PasoOpcionUnica
            paso={pasoActual}
            valor={valorPendiente}
            onElegir={(valor) => irASiguiente(valor)}
          />
        )}

        {pasoActual.tipo === "opcion_multiple" && (
          <PasoOpcionMultiple
            paso={pasoActual}
            valor={valorPendiente}
            onCambiar={setValorPendiente}
          />
        )}

        {pasoActual.tipo === "escala" && (
          <PasoEscala
            paso={pasoActual}
            valor={valorPendiente}
            onCambiar={setValorPendiente}
          />
        )}

        {pasoActual.tipo === "numero" && (
          <PasoNumero
            paso={pasoActual}
            valor={valorPendiente}
            onCambiar={setValorPendiente}
          />
        )}

        {pasoActual.tipo === "payoff" && <PasoPayoff paso={pasoActual} />}

        {pasoActual.tipo === "pais" && (
          <PasoPais
            valor={valorPendiente}
            onElegir={(valor) => irASiguiente(valor)}
          />
        )}

        {pasoActual.tipo === "cargando" && (
          <PasoCargando
            paso={{
              ...pasoActual,
              // Si hubo respuestas reutilizadas de otro test, el loader lo
              // dice — la persona entiende por que su test fue mas corto.
              mensajes:
                respuestasPrevias && Object.keys(respuestasPrevias).length > 0
                  ? [
                      ...(pasoActual.mensajes ?? []),
                      "Usamos lo que ya nos contaste en tu otro test...",
                    ]
                  : pasoActual.mensajes,
            }}
            logros={secciones.filter(
              (s) => s !== seccionActual(puerta, estado.pasoActualId),
            )}
            onCompletar={() => irASiguiente()}
          />
        )}
      </div>

      {requiereContinuar && (
        <div className="mt-auto shrink-0 pt-2">
          <Button
            type="button"
            variant="primary"
            className="w-full"
            disabled={!continuarHabilitado || enviando}
            onClick={() => irASiguiente(valorPendiente)}
          >
            {pasoActual.tipo === "payoff"
              ? (pasoActual.textoContinuar ?? "Continuar")
              : "Continuar"}
          </Button>
        </div>
      )}
    </div>
  );
}

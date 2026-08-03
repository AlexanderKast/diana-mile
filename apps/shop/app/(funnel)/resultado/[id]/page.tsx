import { cache } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import type { QuizPuerta, RespuestasQuiz } from "@/lib/quiz/tipos";
import { obtenerPuerta } from "@/lib/quiz/puertas";
import { CONTRATOS_RESULTADO } from "@/lib/quiz/puertas/contratos";
import type { DimensionHabito } from "@/lib/quiz/puertas/ficha-segmento";
// generarNotasHabitosPiel todavia no tiene equivalente en el contrato
// generico (solo "piel" arma esta nota) — import directo genuinamente
// necesario hasta que un agente futuro lo suba al contrato.
import { generarNotasHabitosPiel } from "@/lib/quiz/puertas/piel-prescripcion";
import { SEMANAS_PLAN } from "@/lib/quiz/puertas/plan-semanas";
import { reescribirConHechos } from "@/lib/ia/reescribir";
import { getComunidadWhatsappLink } from "@/lib/community";
import { EscaleraOferta } from "../../_components/EscaleraOferta";

const SITE_URL_DEFECTO = "https://militolife.com";

type FilaQuizRespuesta = {
  id: string;
  puerta: string;
  respuestas: RespuestasQuiz;
  segmento: string | null;
  fecha_objetivo: string | null;
  completado: boolean;
};

/**
 * Lectura cruda de Supabase, envuelta en `cache()` de React: generateMetadata
 * y el componente de pagina piden el mismo id en el mismo request, y sin
 * esto se duplicaria la consulta (fetch() se memoiza solo, una llamada a
 * supabase-js no). `quiz_respuestas` solo tiene politica de service_role
 * (ver migracion 20260752000000) — se responde ANTES de que exista sesion,
 * asi que no hay con que emparejar una lectura anonima.
 */
const obtenerFilaQuiz = cache(async (id: string): Promise<FilaQuizRespuesta | null> => {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("quiz_respuestas")
    .select("id, puerta, respuestas, segmento, fecha_objetivo, completado")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error cargando quiz_respuestas para /resultado:", error);
    return null;
  }

  return data as FilaQuizRespuesta | null;
});

type DiagnosticoValido = {
  id: string;
  puerta: QuizPuerta;
  respuestas: RespuestasQuiz;
  segmento: string;
  fechaObjetivo: string | null;
};

/**
 * Valida que la fila sea un diagnostico real y mostrable: tiene que existir,
 * su `puerta` tiene que tener un contrato registrado en CONTRATOS_RESULTADO,
 * estar completado (un abandono a medias no es un diagnostico) y tener un
 * segmento reconocido por ese contrato. Cualquier otro caso se trata igual
 * que "no existe" — mostrar un diagnostico a medio construir es peor que un
 * 404. Agnostico a la puerta: hoy solo "piel" tiene segmentos reales, pero
 * el chequeo ya sirve para cualquier puerta que los tenga.
 */
async function obtenerDiagnosticoValido(id: string): Promise<DiagnosticoValido | null> {
  const fila = await obtenerFilaQuiz(id);
  if (!fila) return null;
  if (!fila.completado) return null;

  const puerta = fila.puerta as QuizPuerta;
  const contrato = CONTRATOS_RESULTADO[puerta];
  if (!contrato) return null;

  const segmento = fila.segmento;
  if (!segmento || !(segmento in contrato.segmentos)) return null;

  return {
    id: fila.id,
    puerta,
    respuestas: fila.respuestas ?? {},
    segmento,
    fechaObjetivo: fila.fecha_objetivo,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const diagnostico = await obtenerDiagnosticoValido(id);

  if (!diagnostico) {
    return {
      title: "Diagnostico no encontrado - Milito Life Shop",
      description: "Este diagnostico ya no esta disponible. Podes rehacer el test.",
    };
  }

  const contrato = CONTRATOS_RESULTADO[diagnostico.puerta];
  const ficha = contrato.segmentos[diagnostico.segmento];
  const titulo = `${ficha.tituloDiagnostico} - Tu diagnostico con Milito`;
  // "producto" (piel/energia/peso) termina en ritual + plan de 8 semanas;
  // "calificacion" (sesion/negocio) termina en WhatsApp, sin ritual ni plan
  // — la descripcion no puede prometer lo que esa puerta no entrega.
  const descripcion =
    ficha.tipo === "producto"
      ? `Milito armo tu diagnostico: ${ficha.tituloDiagnostico.toLowerCase()}. Mira tu ritual recomendado y tu plan de 8 semanas.`
      : `Milito reviso tu perfil: ${ficha.tituloDiagnostico.toLowerCase()}. Mira tu resultado.`;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? SITE_URL_DEFECTO;

  return {
    metadataBase: new URL(siteUrl),
    title: titulo,
    description: descripcion,
    openGraph: {
      title: titulo,
      description: descripcion,
      // TODO: imagen OG dinamica por diagnostico (ej. con next/og ImageResponse,
      // componiendo tituloDiagnostico sobre una plantilla de marca). Por ahora
      // se usa una foto de marca existente como placeholder estatico.
      images: [
        { url: "/images/diana-og.jpg", width: 1200, height: 630, alt: "Milito Life Shop" },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: titulo,
      description: descripcion,
      images: ["/images/diana-og.jpg"],
    },
  };
}

function formatearFecha(fechaIso: string): string {
  // La columna es DATE (sin hora): se formatea en UTC a proposito, para que
  // el dia mostrado sea siempre el mismo que se guardo, sin importar en que
  // zona horaria corra el servidor que renderiza la pagina.
  return new Date(fechaIso).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

// --- Niveles de habito para las barras -------------------------------------

type Tono = DimensionHabito["tono"];

const TONO_CLASES: Record<Tono, { barra: string; texto: string }> = {
  bien: { barra: "bg-verde-ok", texto: "text-verde-ok" },
  atencion: { barra: "bg-dorado-oscuro", texto: "text-dorado-oscuro" },
  alerta: { barra: "bg-error", texto: "text-error" },
};

function FilaDimension({ etiqueta, valorMostrado, fraccion, tono }: DimensionHabito) {
  const porcentaje = Math.round(Math.min(1, Math.max(0, fraccion)) * 100);
  const clases = TONO_CLASES[tono];

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm text-carbon">{etiqueta}</span>
        <span className={`text-sm font-semibold ${clases.texto}`}>{valorMostrado}</span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-arena"
        role="progressbar"
        aria-valuenow={porcentaje}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={etiqueta}
      >
        <div className={`h-full rounded-full ${clases.barra}`} style={{ width: `${porcentaje}%` }} />
      </div>
    </div>
  );
}

function IconoCandado() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-ceniza"
      aria-hidden="true"
    >
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

export default async function ResultadoPage({
  params,
}: {
  // Next 16: params siempre es una Promise, hay que await-earla.
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const diagnostico = await obtenerDiagnosticoValido(id);

  if (!diagnostico) {
    notFound();
  }

  const { respuestas, segmento, fechaObjetivo, puerta } = diagnostico;
  const contrato = CONTRATOS_RESULTADO[puerta];
  const ficha = contrato.segmentos[segmento];

  const puertaConfig = obtenerPuerta(puerta);
  function etiquetaOpcion(pasoId: string | null, valor: unknown): string | undefined {
    if (!pasoId) return undefined;
    const paso = puertaConfig.pasos.find((p) => p.id === pasoId);
    if (!paso) return undefined;
    if (paso.tipo !== "opcion_unica" && paso.tipo !== "opcion_multiple") return undefined;
    return paso.opciones.find((o) => o.valor === valor)?.etiqueta;
  }

  // --- Variante corta: puertas de tipo "calificacion" (sesion/negocio) ---
  // Sin barras de habito, sin fecha objetivo, sin plan de 8 semanas — cierra
  // con un CTA directo a WhatsApp en vez del acceso al panel. Solo la
  // puerta "sesion" suma ademas la escalera de 3 niveles debajo (encaja
  // directo con el producto de sesion grupal); "negocio" es una
  // conversacion de oportunidad de distribuidora, tema distinto, se queda
  // como estaba.
  if (ficha.tipo === "calificacion") {
    const descripcionPersonalizada = await reescribirConHechos({
      instruccion:
        "Reescribi 'descripcionBase' en 2-3 frases cortas, voz de Milito (calida, paisa, directa), personalizando el saludo para esta persona sin inventar ningun dato nuevo.",
      hechos: {
        segmento: ficha.tituloDiagnostico,
        descripcionBase: ficha.descripcionDiagnostico,
      },
    });
    // Comunidad para las dos puertas de calificacion: en sesion como
    // tarjeta de la escalera, en negocio como mencion suave (la persona
    // que no escribe por WhatsApp necesita una salida que no sea cerrar
    // la pestaña).
    const comunidadHref = await getComunidadWhatsappLink();

    return (
      <>
        <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-5 pb-32 pt-4">
          <section className="flex flex-col items-center gap-3 text-center">
            <Image
              src={ficha.iconoUrl}
              alt=""
              width={112}
              height={112}
              sizes="112px"
              priority
              className="h-28 w-28"
            />
            <span className="text-xs font-semibold uppercase tracking-wide text-dorado-oscuro">
              Tu diagnostico, con Milito
            </span>
            <h1 className="font-display text-3xl text-carbon">{ficha.tituloDiagnostico}</h1>
            <p className="text-base text-carbon-suave">
              {descripcionPersonalizada ?? ficha.descripcionDiagnostico}
            </p>
          </section>

          {puerta === "sesion" ? (
            <EscaleraOferta comunidadHref={comunidadHref} />
          ) : (
            <p className="text-center text-xs text-ceniza">
              ¿Prefieres empezar por conocer a Milito y su comunidad? {" "}
              <a
                href={comunidadHref}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-dorado-oscuro underline decoration-dorado underline-offset-4"
              >
                Unite gratis por WhatsApp
              </a>
              .
            </p>
          )}
        </div>

        {/* CTA sticky — el mismo patron de cierre que la rama producto: el
            boton de mayor intencion siempre visible sin scroll. Si el
            numero de WhatsApp no esta configurado (mensajeWhatsapp = ""),
            cae al link de comunidad — nunca una pantalla sin salida. */}
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-arena bg-blanco/95 px-5 pt-3 pb-[max(0.875rem,env(safe-area-inset-bottom))] backdrop-blur">
          <div className="mx-auto w-full max-w-md">
            <a
              href={ficha.mensajeWhatsapp || comunidadHref}
              className="btn-shine flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-dorado-oscuro px-6 py-3.5 text-base font-semibold tracking-wide text-blanco shadow-[0_4px_14px_rgba(168,136,94,0.35)] transition-all duration-200 hover:bg-dorado active:scale-[0.97]"
            >
              {ficha.mensajeWhatsapp
                ? "Hablar con Milito por WhatsApp"
                : "Unirme a la comunidad de Milito"}
            </a>
          </div>
        </div>
      </>
    );
  }

  // --- Render de puertas de tipo "producto" (hoy: "piel") -----------------
  // Igual, campo por campo, al render que existia antes de este refactor.
  const [idChipUno = null, idChipDos = null] = contrato.idsChips;

  const tipoPielEtiqueta = etiquetaOpcion(idChipUno, idChipUno ? respuestas[idChipUno] : undefined);
  const preocupacionEtiqueta = etiquetaOpcion(idChipDos, idChipDos ? respuestas[idChipDos] : undefined);
  const rutinaEtiqueta = etiquetaOpcion(
    contrato.idPasoEstadoActual,
    contrato.idPasoEstadoActual ? respuestas[contrato.idPasoEstadoActual] : undefined,
  );
  const objetivoEtiqueta = etiquetaOpcion(
    contrato.idPasoObjetivo,
    contrato.idPasoObjetivo ? respuestas[contrato.idPasoObjetivo] : undefined,
  );

  const notasHabitos = puerta === "piel" ? generarNotasHabitosPiel(respuestas) : [];
  const datoQuePesaMas =
    notasHabitos[0] ??
    "Tus habitos declarados estan alineados con lo que tu piel necesita ahora — de aqui en adelante, lo que mas pesa es la constancia del ritual.";

  // Reescritura personalizada, opcional — ver lib/ia/reescribir.ts. El
  // parrafo escrito a mano (ficha.descripcionDiagnostico) viaja como HECHO
  // base: Mistral solo puede reordenar/retonar eso + lo que la persona
  // contesto, nunca agregar un dato nuevo. Si falla por lo que sea, se
  // muestra el parrafo estatico de siempre — nunca se bloquea la pagina.
  const descripcionPersonalizada = await reescribirConHechos({
    instruccion:
      "Reescribi 'descripcionBase' en 2-3 frases cortas, voz de Milito (calida, paisa, directa), dirigidas a ESTA persona usando tipoPiel/preocupacionPrincipal/rutinaActual/objetivoElegido para que se sienta escrito para ella. No menciones notaEstimacion, esa va aparte en la pantalla.",
    hechos: {
      segmento: ficha.tituloDiagnostico,
      descripcionBase: ficha.descripcionDiagnostico,
      tipoPiel: tipoPielEtiqueta ?? null,
      preocupacionPrincipal: preocupacionEtiqueta ?? null,
      rutinaActual: rutinaEtiqueta ?? null,
      objetivoElegido: objetivoEtiqueta ?? null,
    },
  });

  const dimensiones = contrato.dimensionesHabito(respuestas);
  const fechaFormateada = fechaObjetivo ? formatearFecha(fechaObjetivo) : null;
  const comunidadHref = await getComunidadWhatsappLink();

  return (
    <>
      <div className="mx-auto flex w-full max-w-md flex-col px-5 pb-36 pt-4">
        {/* Diagnostico principal */}
        <section className="flex flex-col items-center gap-3 text-center">
          <Image
            src={ficha.iconoUrl}
            alt=""
            width={112}
            height={112}
            sizes="112px"
            priority
            className="h-28 w-28"
          />
          {/* Esfuerzo invertido visible — dato real: cuantas respuestas dio. */}
          <span className="rounded-full border border-arena bg-crema px-3 py-1 text-xs text-carbon-suave">
            Respondiste {Object.keys(respuestas).length} preguntas — tu diagnostico esta listo
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide text-dorado-oscuro">
            Tu diagnostico, con Milito
          </span>
          <h1 className="font-display text-3xl text-carbon">{ficha.tituloDiagnostico}</h1>
          <p className="text-base text-carbon-suave">
            {descripcionPersonalizada ?? ficha.descripcionDiagnostico}
          </p>
        </section>

        {(tipoPielEtiqueta || preocupacionEtiqueta) && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {tipoPielEtiqueta && (
              <span className="rounded-full border border-arena bg-crema px-3 py-1 text-xs text-carbon-suave">
                Piel {tipoPielEtiqueta.toLowerCase()}
              </span>
            )}
            {preocupacionEtiqueta && (
              <span className="rounded-full border border-arena bg-crema px-3 py-1 text-xs text-carbon-suave">
                {preocupacionEtiqueta}
              </span>
            )}
          </div>
        )}

        <section className="mt-6 flex flex-col gap-2 rounded-2xl border border-arena bg-crema p-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-carbon-suave">
            Lo que mas pesa ahora mismo
          </span>
          <p className="text-sm text-carbon">{datoQuePesaMas}</p>
        </section>

        <p className="mt-2 px-1 text-xs text-ceniza">* {ficha.notaEstimacion}</p>

        {/* La brecha */}
        <section className="mt-8 flex flex-col gap-3">
          <h2 className="font-display text-xl text-carbon">De donde partes a donde vas</h2>
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl border border-arena p-4">
              <span className="text-xs font-semibold uppercase tracking-wide text-ceniza">
                Hoy
              </span>
              <p className="mt-1.5 text-sm text-carbon">
                {rutinaEtiqueta && <>Tu rutina: {rutinaEtiqueta}. </>}
                {preocupacionEtiqueta && <>Lo que mas te molesta: {preocupacionEtiqueta}.</>}
              </p>
            </div>
            <div className="rounded-2xl border border-dorado bg-crema p-4">
              <span className="text-xs font-semibold uppercase tracking-wide text-dorado-oscuro">
                Hacia donde apunta tu ritual
              </span>
              <p className="mt-1.5 text-sm text-carbon">
                {objetivoEtiqueta && <>Lo que buscas: {objetivoEtiqueta}. </>}
                El ritual recomendado apunta ahi, con protector solar todos los dias como base.
                No es una promesa de resultado — es hacia donde apunta el plan.
              </p>
            </div>
          </div>
        </section>

        {/* Fecha objetivo */}
        {fechaFormateada && (
          <section className="mt-8 flex flex-col gap-2 rounded-2xl border border-arena p-4 text-center">
            <span className="text-xs font-semibold uppercase tracking-wide text-carbon-suave">
              Tu fecha objetivo
            </span>
            <p className="font-display text-2xl text-carbon">{fechaFormateada}</p>
            <p className="text-xs text-ceniza">
              La calculamos sumando el tiempo real de despacho a tu ciudad mas el tiempo minimo
              razonable para el cambio que buscas — aritmetica, no una cuenta regresiva.
            </p>
          </section>
        )}

        {/* Dimensiones evaluadas */}
        <section className="mt-8 flex flex-col gap-4">
          <div>
            <h2 className="font-display text-xl text-carbon">Tus habitos, en resumen</h2>
            <p className="text-xs text-ceniza">
              Esto es lo que nos contaste — no es un examen clinico, es tu punto de partida.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {dimensiones.map((dimension) => (
              <FilaDimension key={dimension.etiqueta} {...dimension} />
            ))}
          </div>
        </section>

        {/* Plan de 8 semanas — solo titulos */}
        <section className="mt-8 flex flex-col gap-3">
          <div>
            <h2 className="font-display text-xl text-carbon">Tu plan de 8 semanas</h2>
            <p className="text-xs text-ceniza">Cada semana se desbloquea dentro de tu panel.</p>
          </div>
          <ol className="flex flex-col gap-2">
            {SEMANAS_PLAN.map((semana) => (
              <li
                key={semana.numero}
                className="flex items-center gap-3 rounded-xl border border-arena px-4 py-3"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-crema text-sm font-semibold text-carbon-suave">
                  {semana.numero}
                </span>
                <span className="flex-1 text-sm text-carbon">
                  Semana {semana.numero} — {semana.titulo}
                </span>
                <IconoCandado />
              </li>
            ))}
          </ol>
        </section>

        {/* Mencion breve de comunidad — texto+link, no tarjeta completa, a
            proposito para no competirle conversion al CTA principal de
            abajo (acceder al panel). */}
        <p className="mt-8 text-center text-xs text-ceniza">
          ¿Todavía no es momento de empezar? {" "}
          <a
            href={comunidadHref}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-dorado-oscuro underline decoration-dorado underline-offset-4"
          >
            Unite a la comunidad gratis de Milito Life
          </a>
          .
        </p>
      </div>

      {/* CTA unico, fijo al fondo — visible sin scroll aunque el navegador
          embebido de WhatsApp/Instagram le reste ~100px de alto util al
          viewport. `pb-36` en el contenido de arriba evita que la ultima
          semana quede tapada detras de esta barra. */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-arena bg-blanco/95 px-5 pt-2.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] backdrop-blur">
        <div className="mx-auto flex w-full max-w-md flex-col gap-1.5">
          {/* Refuerzo de valor REAL en el punto de cierre: es literalmente
              lo que desbloquea con el correo — cero promesa inventada. */}
          <p className="text-center text-xs text-carbon-suave">
            Plan de 8 semanas + reto de 7 dias con Milito — gratis con tu correo.
          </p>
          <Link
            href={`/acceso?id=${id}`}
            className="btn-shine flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-dorado-oscuro px-6 py-3.5 text-base font-semibold tracking-wide text-blanco shadow-[0_4px_14px_rgba(168,136,94,0.35)] transition-all duration-200 hover:bg-dorado active:scale-[0.97]"
          >
            Accede a tu plan completo
          </Link>
        </div>
      </div>
    </>
  );
}

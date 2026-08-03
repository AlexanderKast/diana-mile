import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ENTREGA_DETALLE_CORTO } from "@diana-mile/shared/logistica/despacho";
import {
  calcularRachaReto,
  diaActualReto,
  diaDesbloqueadoReto,
  fechaDesbloqueoDia,
  formatearFechaDesbloqueoReto,
  obtenerContextoReto,
} from "@/lib/reto";
import type { QuizPuerta } from "@/lib/quiz/tipos";
import { obtenerContenidoReto, TOTAL_DIAS_RETO } from "@/lib/quiz/puertas/reto-contenido";
import { getComunidadWhatsappLink } from "@/lib/community";
import { reescribirConHechos } from "@/lib/ia/reescribir";
import { BarraProgreso } from "../../_components/quiz/BarraProgreso";
import { IconoCandado } from "../_components/icons";
import { FilaDiaReto } from "./_components/FilaDiaReto";

export const metadata: Metadata = {
  title: "Tu reto de 7 dias - Milito Life Shop",
};

/**
 * Categoria de catalogo por puerta — hoy solo "piel" es real; energia/peso
 * comparten "bienestar por dentro" a falta de categoria propia todavia;
 * sesion/negocio no tienen ritual de producto (van a WhatsApp, ver
 * `resultado/[id]/page.tsx`) asi que no aplican aca. `usuario.puerta` cae a
 * "piel" por defecto (ver `resolverPuertaUsuario` en lib/reto.ts) si no se
 * pudo resolver, asi que este mapa siempre tiene una entrada valida.
 */
const HREF_RITUAL_POR_PUERTA: Partial<Record<QuizPuerta, string>> = {
  piel: "/categorias/ritual-de-rostro",
  energia: "/categorias/bienestar-por-dentro",
  peso: "/categorias/bienestar-por-dentro",
};

/**
 * Panel del reto de 7 dias — el periodo de venta del funnel. Mismo gate que
 * el resto de /mi-plan (proxy.ts ya exige sesion valida); lo que puede
 * faltar es la fila de usuarios_plan (sesion huerfana, no deberia pasar en
 * el flujo normal).
 *
 * A diferencia de las 8 semanas de plan_progreso, el dia N no tiene una fila
 * "desbloqueada_en" en la base — se calcula en cada visita a partir de
 * usuarios_plan.creado_en (ver lib/reto.ts). Por eso no hace falta sembrar
 * nada aca: los 7 dias se recorren en memoria.
 */
export default async function RetoPage() {
  const contexto = await obtenerContextoReto();
  if (!contexto) {
    redirect("/acceso");
  }

  const { usuario, progreso } = contexto;
  const fechaBase = usuario.creado_en;
  const diaActual = diaActualReto(fechaBase);
  const hrefRitual =
    HREF_RITUAL_POR_PUERTA[usuario.puerta ?? "piel"] ?? HREF_RITUAL_POR_PUERTA.piel!;
  const totalCompletados = progreso.filter((fila) => fila.completado_en !== null).length;
  const racha = calcularRachaReto(progreso);

  // El link de comunidad requiere una consulta aparte (tabla `config`) —
  // solo se pide si de verdad va a hacer falta: dia 7 ya desbloqueado y
  // zona_oferta distinta de usd_premium (esa zona cierra con coaching, no
  // con comunidad — ver reto-contenido.ts).
  const necesitaLinkComunidad =
    diaDesbloqueadoReto(fechaBase, 7) && usuario.zona_oferta !== "usd_premium";
  const linkComunidad = necesitaLinkComunidad ? await getComunidadWhatsappLink() : null;

  // Personalizacion con Mistral, SOLO para el dia de hoy (nunca los otros 6
  // en el mismo render — evitar 7 llamadas a Mistral por visita). Mismo
  // patron de lista blanca que /resultado/[id]: el "contenidoBase" escrito
  // a mano viaja como HECHO, Mistral solo reordena/retona, nunca inventa.
  // Si falla o no hay API key, se cae al texto estatico de siempre.
  let contenidoHoyPersonalizado: string | null = null;
  if (diaDesbloqueadoReto(fechaBase, diaActual)) {
    const contenidoHoyBase = obtenerContenidoReto(diaActual, usuario.zona_oferta);
    if (contenidoHoyBase) {
      contenidoHoyPersonalizado = await reescribirConHechos({
        instruccion:
          "Reescribi 'contenidoBase' del mensaje de hoy del reto, mismo largo aproximado, voz de Milito (calida, paisa, directa). 'tipoVenta' te dice si hoy toca vender suave/fuerte o solo dar valor — respeta ese tono, no lo subas de intensidad.",
        hechos: {
          dia: diaActual,
          titulo: contenidoHoyBase.titulo,
          contenidoBase: contenidoHoyBase.contenido,
          tipoVenta: contenidoHoyBase.tipoVenta,
        },
      });
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-5 pb-16 pt-4">
      <Link href="/mi-plan" className="text-sm text-carbon-suave hover:text-carbon">
        ← Volver a tu panel
      </Link>

      <section className="flex flex-col gap-2">
        <h1 className="font-display text-2xl text-carbon">Tu reto de 7 dias</h1>
        <p className="text-sm text-carbon-suave">
          Un mensaje corto por dia de Milito. {totalCompletados} de {TOTAL_DIAS_RETO} completados.
        </p>
        <BarraProgreso progreso={totalCompletados / TOTAL_DIAS_RETO} />
        {racha >= 2 && (
          <p className="flex items-center gap-1.5 text-sm font-semibold text-morado">
            <svg
              width="12"
              height="14"
              viewBox="0 0 12 14"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M6 0C6 3 2 4.5 2 8.5a4 4 0 0 0 8 0C10 6 8.5 5 8 3.5 7 5 5.5 5.5 5.5 7.5A1.6 1.6 0 0 1 6 0Z" />
            </svg>
            Racha: {racha} dias seguidos
          </p>
        )}
      </section>

      <ol className="flex flex-col gap-2">
        {Array.from({ length: TOTAL_DIAS_RETO }, (_, i) => i + 1).map((dia) => {
          const fila = progreso.find((p) => p.dia === dia);
          const completado = fila?.completado_en != null;
          const desbloqueado = diaDesbloqueadoReto(fechaBase, dia);

          if (!desbloqueado) {
            return (
              <li
                key={dia}
                className="flex min-h-[44px] items-center gap-3 rounded-xl border border-arena/70 bg-crema/40 px-4 py-3"
                aria-disabled="true"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-crema text-sm font-semibold text-carbon-suave">
                  {dia}
                </span>
                <span className="flex-1 text-sm text-carbon-suave">Dia {dia}</span>
                <span className="flex shrink-0 items-center gap-1.5 text-xs text-ceniza">
                  <IconoCandado />
                  {formatearFechaDesbloqueoReto(fechaDesbloqueoDia(fechaBase, dia))}
                </span>
              </li>
            );
          }

          const contenidoDia = obtenerContenidoReto(dia, usuario.zona_oferta);
          if (!contenidoDia) return null; // no deberia pasar: dia siempre 1-7 aca

          const esDia5Oferta = dia === 5 && contenidoDia.tipoVenta === "fuerte";
          const esDia7Coaching = dia === 7 && contenidoDia.tipoVenta === "coaching";
          const esDia7Comunidad = dia === 7 && !esDia7Coaching;

          return (
            <FilaDiaReto
              key={dia}
              dia={dia}
              titulo={contenidoDia.titulo}
              contenido={
                dia === diaActual
                  ? (contenidoHoyPersonalizado ?? contenidoDia.contenido)
                  : contenidoDia.contenido
              }
              completadoInicial={completado}
              esHoy={dia === diaActual}
              hrefRitual={
                (esDia5Oferta || esDia7Comunidad) && usuario.zona_oferta === "co_cod"
                  ? hrefRitual
                  : null
              }
              notaDespacho={esDia5Oferta && usuario.zona_oferta === "co_cod" ? ENTREGA_DETALLE_CORTO : null}
              mostrarCtaCoaching={esDia7Coaching}
              hrefComunidad={esDia7Comunidad ? linkComunidad : null}
            />
          );
        })}
      </ol>
    </div>
  );
}

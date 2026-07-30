import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createAdminSupabaseClient,
  getAdminUser,
} from "@diana-mile/shared/supabase/server";
import {
  generateCopySecciones,
  TIPOS_SECCION_MAGICA,
} from "@diana-mile/shared/landing-ai";
import {
  normalizarAngulo,
  type AnguloVenta,
} from "@diana-mile/shared/landing/angulo";
import { obtenerProducto } from "@/lib/shopify-catalogo";
import { describirReferenciaSeccion, tieneGeminiApiKey } from "@/lib/gemini-imagen";
import { elegirReferenciaSeccion } from "@/lib/referencias-secciones";

export const maxDuration = 60;

type RouteParams = { params: Promise<{ handle: string }> };

/** Mismo tope que la generacion de imagenes: mas de esto dispara 429 de Gemini. */
const CONCURRENCIA_VISION = 3;

/**
 * Lee (con Gemini) la maqueta que le va a tocar a cada seccion ANTES de
 * escribir el copy, para que el texto se escriba pensando en el espacio que
 * de verdad tiene — no al reves, como era antes (copy ciego y la maqueta
 * sorteada recien al generar la imagen, sin relacion entre las dos).
 *
 * Se hace con la misma concurrencia limitada que la generacion de imagenes
 * (nunca mas de 3 llamadas a Gemini a la vez): once secciones en paralelo
 * agotaban la cuota del minuto antes de siquiera llegar al paso de imagen.
 *
 * Sin GEMINI_API_KEY, o si una lectura puntual falla, la seccion sigue sin
 * MAQUETA (el copy cae a las reglas generales de longitud): no vale la pena
 * tumbar todo el paso de copy por una lectura de vision que fallo.
 */
async function leerMaquetasPorTipo(
  supabase: SupabaseClient,
  tipos: string[],
): Promise<{
  layoutPorTipo: Record<string, string>;
  referenciaIdPorTipo: Record<string, string | null>;
}> {
  const layoutPorTipo: Record<string, string> = {};
  const referenciaIdPorTipo: Record<string, string | null> = {};
  if (!tieneGeminiApiKey()) return { layoutPorTipo, referenciaIdPorTipo };

  const cola = [...tipos];
  const trabajador = async () => {
    for (;;) {
      const tipo = cola.shift();
      if (!tipo) return;
      try {
        const elegida = await elegirReferenciaSeccion(supabase, tipo);
        if (!elegida) continue;
        referenciaIdPorTipo[tipo] = elegida.referenciaId;
        layoutPorTipo[tipo] = await describirReferenciaSeccion({
          referencia: elegida.referencia,
          tipo,
        });
      } catch {
        // Esta seccion se queda sin MAQUETA; el resto no se ve afectado.
      }
    }
  };

  await Promise.all(
    Array.from({ length: CONCURRENCIA_VISION }, () => trabajador()),
  );

  return { layoutPorTipo, referenciaIdPorTipo };
}

const TIPOS_VALIDOS = new Set(
  (TIPOS_SECCION_MAGICA as { tipo: string }[]).map((s) => s.tipo),
);

function formatearCOP(pesos: number): string {
  return `$${pesos.toLocaleString("es-CO")}`;
}

function formatearPrecioShopify(precio: string): string {
  const numero = Math.round(parseFloat(precio));
  if (!Number.isFinite(numero)) return precio;
  return formatearCOP(numero);
}

/**
 * Los precios del angulo mandan sobre los de Shopify.
 *
 * Shopify guarda el precio unitario del catalogo; el angulo guarda la OFERTA
 * con la que se sale a pautar (packs y su precio real). Si existe la oferta,
 * es la cifra que la clienta va a ver en la landing, y el copy tiene que
 * escribirse sobre esa y no sobre la del catalogo.
 */
function preciosDelAngulo(angulo: AnguloVenta): string | null {
  const lineas = angulo.oferta.unidades
    .filter((u) => u.precio > 0)
    .sort((a, b) => a.cantidad - b.cantidad)
    .map((u) => {
      const unidades = `${u.cantidad} ${u.cantidad === 1 ? "unidad" : "unidades"}`;
      const antes = u.precio_comparacion
        ? ` (antes ${formatearCOP(u.precio_comparacion)})`
        : "";
      return `- ${unidades}: ${formatearCOP(u.precio)}${antes}`;
    });
  return lineas.length ? lineas.join("\n") : null;
}

/**
 * Paso "copy" de Landing magica: Mistral escribe el texto EXACTO que ira
 * dentro de cada seccion-imagen, a partir del angulo de venta elegido. No
 * genera imagenes ni guarda nada — el admin revisa y corrige el copy antes
 * de gastar generaciones de imagen.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    if (!(await getAdminUser())) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Falta MISTRAL_API_KEY en el servidor." },
        { status: 503 },
      );
    }

    const { handle } = await params;
    const body = await request.json().catch(() => ({}));
    const brief = typeof body?.brief === "string" ? body.brief : null;
    const anguloId =
      typeof body?.angulo_id === "string" && body.angulo_id ? body.angulo_id : null;
    const secciones: string[] = Array.isArray(body?.secciones)
      ? body.secciones.filter((s: unknown) => TIPOS_VALIDOS.has(String(s)))
      : [];

    if (secciones.length === 0) {
      return NextResponse.json(
        { error: "Selecciona al menos una seccion valida." },
        { status: 400 },
      );
    }

    const producto = await obtenerProducto(handle);
    if (!producto) {
      return NextResponse.json(
        { error: "Producto no encontrado en Shopify." },
        { status: 404 },
      );
    }

    const supabase = createAdminSupabaseClient();

    // El contenido del angulo se lee SIEMPRE de la base, nunca del body: el
    // navegador solo dice cual, y el filtro lleva el handle ademas del id
    // para que no se pueda traer el angulo de otro producto.
    let angulo: AnguloVenta | null = null;
    if (anguloId) {
      const { data, error } = await supabase
        .from("angulos_venta")
        .select("nombre, datos")
        .eq("producto_handle", handle)
        .eq("id", anguloId)
        .maybeSingle();

      if (error) throw new Error(error.message);
      if (!data) {
        return NextResponse.json(
          { error: "Angulo no encontrado para este producto." },
          { status: 404 },
        );
      }
      // El nombre viaja junto a los datos: es el enfoque que se pidio y el
      // prompt lo usa como titulo del brief, no como etiqueta.
      angulo = { ...normalizarAngulo(data.datos), nombre: data.nombre };
    }

    // Cifras REALES inyectadas al prompt: el modelo tiene prohibido inventar.
    const preciosShopify = producto.variantes
      .filter((v) => v.price)
      .map((v) => `- ${v.title}: ${formatearPrecioShopify(v.price!)}`)
      .join("\n");
    const precios =
      (angulo ? preciosDelAngulo(angulo) : null) || preciosShopify || null;

    // Se lee la maqueta de cada seccion ANTES del copy: el texto se escribe
    // para el espacio que de verdad tiene, no al reves. La referencia que se
    // sortea aqui queda fijada — `generar-seccion` la reusa por id en vez de
    // sortear otra distinta a la que este copy tuvo en cuenta.
    const { layoutPorTipo, referenciaIdPorTipo } = await leerMaquetasPorTipo(
      supabase,
      secciones,
    );

    const resultado = await generateCopySecciones(
      {
        title: producto.title,
        description: producto.description,
        productType: producto.productType,
        tags: producto.tags,
      },
      { apiKey, brief, secciones, precios, angulo, layoutPorTipo },
    );

    const seccionesConReferencia = (resultado.secciones ?? []).map(
      (seccion: Record<string, unknown>) => ({
        ...seccion,
        referencia_id: referenciaIdPorTipo[String(seccion.tipo)] ?? null,
      }),
    );

    return NextResponse.json({ secciones: seccionesConReferencia }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "No se pudo generar el copy de las secciones.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@diana-mile/shared/supabase/server";
import { generateAnguloVenta } from "@diana-mile/shared/landing-ai";
import {
  ANGULO_VACIO,
  normalizarAngulo,
  type AnguloVenta,
} from "@diana-mile/shared/landing/angulo";
import { obtenerProducto } from "@/lib/shopify-catalogo";

type RouteParams = { params: Promise<{ handle: string }> };

// Mistral tarda; el default de Vercel (10s en hobby) corta la respuesta a
// mitad de generacion y el admin ve un error que no explica nada.
export const maxDuration = 60;

/** Los unicos campos que escribe el modelo. El resto sale de Shopify. */
const CAMPOS_ESTRATEGIA = [
  "angulo_venta",
  "problema",
  "avatar",
  "resultado_deseado",
  "solucion_ideal",
  "mecanismo_unico",
  "detalles_producto",
] as const;

function formatearCOP(precio: string): string {
  const numero = Math.round(parseFloat(precio));
  if (!Number.isFinite(numero)) return precio;
  return `$${numero.toLocaleString("es-CO")}`;
}

function aPesos(precio: string | undefined): number {
  const numero = Math.round(parseFloat(precio ?? ""));
  return Number.isFinite(numero) && numero > 0 ? numero : 0;
}

/**
 * Un valor del parcial "gana" solo si trae algo. Un string vacio o un
 * arreglo sin elementos es el formulario en blanco, no una decision del
 * admin, y dejarlo ganar borraria lo que acaba de generar el modelo.
 */
function tieneContenido(valor: unknown): boolean {
  if (valor === null || valor === undefined) return false;
  if (typeof valor === "string") return valor.trim().length > 0;
  if (Array.isArray(valor)) return valor.length > 0;
  return true;
}

/**
 * Prellena un angulo: Shopify pone los datos duros (nombre, fotos,
 * precios), Mistral escribe los 7 campos de estrategia, y lo que el admin
 * ya habia escrito se respeta por encima de los dos.
 *
 * No persiste nada. El admin revisa el borrador y lo guarda desde el CRUD
 * si le sirve.
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
    // Se normaliza antes de usarlo: llega del navegador y podria traer
    // cualquier cosa, incluidas fotos de un dominio ajeno.
    const parcial = normalizarAngulo(body?.parcial);

    const producto = await obtenerProducto(handle);
    if (!producto) {
      return NextResponse.json(
        { error: "Producto no encontrado en Shopify." },
        { status: 404 },
      );
    }

    // ── Oferta: cifras reales de Shopify ─────────────────────────────
    //
    // `precio_comparacion` va SIEMPRE en null. El precio tachado es una
    // afirmacion sobre lo que costaba antes, y eso no esta en Shopify:
    // deducirlo seria inventar un descuento. Lo pone el admin o no existe.
    const variantesConPrecio = producto.variantes.filter((v) => aPesos(v.price));
    let unidades: AnguloVenta["oferta"]["unidades"];

    if (variantesConPrecio.length === 1) {
      // Producto de una sola presentacion: se proponen los tres packs
      // multiplicando el precio unitario. Es un punto de partida para que
      // el admin le ponga el descuento por volumen, no una oferta real.
      const unitario = aPesos(variantesConPrecio[0].price);
      unidades = [1, 2, 3].map((cantidad) => ({
        cantidad: cantidad as 1 | 2 | 3,
        precio: unitario * cantidad,
        precio_comparacion: null,
      }));
    } else {
      unidades = variantesConPrecio.slice(0, 3).map((variante, indice) => ({
        cantidad: (indice + 1) as 1 | 2 | 3,
        precio: aPesos(variante.price),
        precio_comparacion: null,
      }));
    }

    // ── Estrategia: Mistral, con las cifras reales inyectadas ────────
    const precios = variantesConPrecio
      .map((v) => `- ${v.title}: ${formatearCOP(v.price!)}`)
      .join("\n");

    const parcialEstrategia = Object.fromEntries(
      CAMPOS_ESTRATEGIA.filter((campo) => parcial[campo].trim()).map(
        (campo) => [campo, parcial[campo]],
      ),
    );

    const generado = (await generateAnguloVenta(
      {
        title: producto.title,
        description: producto.description,
        productType: producto.productType,
        tags: producto.tags,
      },
      { apiKey, parcial: parcialEstrategia, precios: precios || null },
    )) as Record<string, unknown>;

    const base: Record<string, unknown> = {
      ...ANGULO_VACIO,
      ...Object.fromEntries(
        CAMPOS_ESTRATEGIA.map((campo) => [campo, generado[campo]]),
      ),
      nombre_producto: producto.title,
      fotos_producto: producto.imagenes.slice(0, 3).map((i) => i.url),
      oferta: { unidades },
    };

    // Lo escrito a mano se aplica al final: gana sobre Shopify y sobre el
    // modelo.
    for (const [campo, valor] of Object.entries(parcial)) {
      if (campo === "oferta") {
        if (parcial.oferta.unidades.length) base.oferta = parcial.oferta;
        continue;
      }
      if (tieneContenido(valor)) base[campo] = valor;
    }

    return NextResponse.json({ datos: normalizarAngulo(base) }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "No se pudo prellenar el angulo.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

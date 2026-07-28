import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSupabaseClient,
  getAdminUser,
} from "@diana-mile/shared/supabase/server";
import {
  guardarCostoEnShopify,
  listarVariantesParaCosteo,
} from "@/lib/shopify-catalogo";

/**
 * Guarda el costo de una variante.
 *
 * FUENTE DE VERDAD
 * El costo vive en `costos_producto`. Shopify recibe una copia en el
 * `unitCost` del inventoryItem para que tambien se vea alli, pero es un
 * espejo: si Shopify falla, el costo YA quedo guardado y la respuesta lo
 * avisa sin dar el guardado por perdido. Al reves seria peor — que un
 * error de red en Shopify obligue a volver a teclear el costo hace que no
 * se carguen.
 */
export async function PATCH(request: NextRequest) {
  try {
    const usuario = await getAdminUser();
    if (!usuario) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      variantId?: string;
      productoId?: string;
      productoTitulo?: string;
      varianteTitulo?: string;
      costoUnitario?: number | null;
      costoPlataforma?: number | null;
      costoLogistico?: number | null;
      margenObjetivo?: number | null;
      notas?: string | null;
    };

    if (!body.variantId) {
      return NextResponse.json({ error: "Falta 'variantId'." }, { status: 400 });
    }

    // null es un valor legitimo: borra el costo y devuelve la variante al
    // estado "sin costear". Solo se rechaza lo que no es numero.
    const costo = normalizarMonto(body.costoUnitario);
    if (costo === "invalido") {
      return NextResponse.json(
        { error: "El costo tiene que ser un número mayor o igual a cero." },
        { status: 400 },
      );
    }

    const plataforma = normalizarMonto(body.costoPlataforma);
    const logistico = normalizarMonto(body.costoLogistico);
    if (plataforma === "invalido" || logistico === "invalido") {
      return NextResponse.json(
        { error: "Los costos accesorios tienen que ser números mayores o iguales a cero." },
        { status: 400 },
      );
    }

    const margen =
      body.margenObjetivo === null || body.margenObjetivo === undefined
        ? null
        : Number(body.margenObjetivo);
    if (margen !== null && (!Number.isFinite(margen) || margen < 0 || margen >= 1)) {
      return NextResponse.json(
        { error: "El margen objetivo va entre 0 y 1 (0.5 = 50%)." },
        { status: 400 },
      );
    }

    const supabase = createAdminSupabaseClient();
    const { error } = await supabase.from("costos_producto").upsert(
      {
        shopify_variant_id: body.variantId,
        shopify_product_id: body.productoId ?? null,
        producto_titulo: body.productoTitulo ?? null,
        variante_titulo: body.varianteTitulo ?? null,
        costo_unitario: costo,
        costo_plataforma: plataforma,
        costo_logistico: logistico,
        margen_objetivo: margen,
        notas: body.notas ?? null,
        actualizado_por: usuario.email ?? null,
      },
      { onConflict: "shopify_variant_id" },
    );

    if (error) {
      return NextResponse.json(
        { error: "No se pudo guardar el costo: " + error.message },
        { status: 500 },
      );
    }

    // Espejo en Shopify. Best-effort: ya esta guardado donde se usa.
    let avisoShopify: string | null = null;
    if (costo !== null) {
      try {
        const variantes = await listarVariantesParaCosteo();
        const variante = variantes.find((v) => v.id === body.variantId);
        if (variante?.inventoryItemId) {
          await guardarCostoEnShopify(variante.inventoryItemId, costo);
        } else {
          avisoShopify = "La variante no tiene inventoryItem; no se copió a Shopify.";
        }
      } catch (e) {
        avisoShopify =
          "El costo quedó guardado, pero no se pudo copiar a Shopify: " +
          (e instanceof Error ? e.message : "error desconocido");
        console.error("Espejo de costo en Shopify fallo:", e);
      }
    }

    return NextResponse.json({ ok: true, costoUnitario: costo, avisoShopify });
  } catch (error) {
    console.error("Error al guardar el costo:", error);
    return NextResponse.json(
      { error: "No se pudo guardar el costo." },
      { status: 500 },
    );
  }
}

/** `null` borra, un numero valido guarda, "invalido" se rechaza. */
function normalizarMonto(
  valor: number | null | undefined,
): number | null | "invalido" {
  if (valor === null || valor === undefined) return null;
  const n = Number(valor);
  if (!Number.isFinite(n) || n < 0) return "invalido";
  return n;
}

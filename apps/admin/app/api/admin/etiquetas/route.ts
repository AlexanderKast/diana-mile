import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSupabaseClient,
  getAdminUser,
} from "@diana-mile/shared/supabase/server";
import { agregarTagsOrden } from "@/lib/shopify";

/**
 * Guarda las etiquetas manuales de un lead o un pedido.
 *
 * SINCRONIZACION CON SHOPIFY
 * En un pedido, las etiquetas tambien se mandan a la orden de Shopify. Quien
 * empaca mira Shopify, no este panel: una etiqueta que solo vive aca no le
 * llega a quien la necesita.
 *
 * La mutacion `tagsAdd` de Shopify es ADITIVA — suma, no reemplaza. Eso
 * significa que quitar una etiqueta aca la quita del panel pero NO de la
 * orden. Es a proposito: Shopify tiene sus propias etiquetas operativas
 * ("COD", "milito-life-shop", "confirmado-admin") puestas por otros procesos,
 * y borrarlas desde aca romperia flujos que no controlamos. Si algun dia hace
 * falta quitar una en Shopify, se hace alli.
 */
export async function POST(request: NextRequest) {
  try {
    const usuario = await getAdminUser();
    if (!usuario) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { entidad, id, etiquetas } = (await request
      .json()
      .catch(() => ({}))) as {
      entidad?: "lead" | "pedido";
      id?: string;
      etiquetas?: string[];
    };

    if (!id || (entidad !== "lead" && entidad !== "pedido")) {
      return NextResponse.json(
        { error: "Faltan 'entidad' (lead|pedido) e 'id'." },
        { status: 400 },
      );
    }

    // Una coma partiria la etiqueta en dos al llegar a Shopify.
    const limpias = [
      ...new Set(
        (etiquetas ?? [])
          .map((e) => String(e).replace(/,/g, " ").trim())
          .filter(Boolean)
          .slice(0, 20),
      ),
    ];

    const supabase = createAdminSupabaseClient();

    // Los `select` se escriben literales y no armados con plantillas: el
    // cliente tipado de Supabase analiza esa cadena en tiempo de compilacion
    // y con una interpolada no puede.
    let previas: string[] = [];
    let orderId: string | null = null;

    if (entidad === "lead") {
      const { data } = await supabase
        .from("leads")
        .select("id, etiquetas")
        .eq("id", id)
        .maybeSingle();
      if (!data) {
        return NextResponse.json({ error: "No existe." }, { status: 404 });
      }
      previas = (data.etiquetas ?? []) as string[];
    } else {
      const { data } = await supabase
        .from("pedidos")
        .select("id, tags, shopify_order_id")
        .eq("id", id)
        .maybeSingle();
      if (!data) {
        return NextResponse.json({ error: "No existe." }, { status: 404 });
      }
      previas = (data.tags ?? []) as string[];
      orderId = (data.shopify_order_id as string | null) ?? null;
    }

    const { error } =
      entidad === "lead"
        ? await supabase.from("leads").update({ etiquetas: limpias }).eq("id", id)
        : await supabase.from("pedidos").update({ tags: limpias }).eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "No se pudo guardar.", detalle: error.message },
        { status: 500 },
      );
    }

    let sincronizado = false;
    if (entidad === "pedido") {
      const nuevas = limpias.filter((e) => !previas.includes(e));
      if (orderId && nuevas.length) {
        // Best effort: que Shopify falle no puede impedir guardar en el panel.
        try {
          await agregarTagsOrden(
            `gid://shopify/Order/${String(orderId).replace(/\D/g, "")}`,
            nuevas,
          );
          sincronizado = true;
        } catch (e) {
          console.error("No se pudo sincronizar etiquetas con Shopify:", e);
        }
      }
    }

    if (entidad === "lead") {
      await supabase.from("lead_actividades").insert({
        lead_id: id,
        tipo: "nota",
        detalle: `Etiquetas: ${limpias.join(", ") || "(ninguna)"}`,
        creado_por: usuario.email ?? "admin",
      });
    }

    return NextResponse.json({ ok: true, etiquetas: limpias, sincronizado });
  } catch (error) {
    return NextResponse.json(
      {
        error: "No se pudo guardar.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

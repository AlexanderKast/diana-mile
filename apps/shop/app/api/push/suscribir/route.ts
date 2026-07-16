import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSupabaseClient,
  getClienteUser,
} from "@diana-mile/shared/supabase/server";

type SubscriptionBody = {
  subscription?: {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
  };
  telefono?: string;
};

/**
 * Guarda una suscripcion de push. El telefono es opcional: si hay sesion
 * de cliente activa se usa ese; si no, se acepta el que venga del body
 * (ej. justo despues de completar un pedido, sin login todavia).
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SubscriptionBody;
    const { subscription, telefono: telefonoBody } = body;

    if (
      !subscription?.endpoint ||
      !subscription.keys?.p256dh ||
      !subscription.keys?.auth
    ) {
      return NextResponse.json(
        { error: "Suscripcion invalida." },
        { status: 400 },
      );
    }

    const cliente = await getClienteUser();
    const telefono = cliente?.telefono ?? telefonoBody ?? null;

    const admin = createAdminSupabaseClient();
    const { error } = await admin.from("push_suscripciones").upsert(
      {
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        telefono,
        user_agent: request.headers.get("user-agent"),
      },
      { onConflict: "endpoint" },
    );

    if (error) {
      return NextResponse.json(
        { error: "No se pudo guardar la suscripcion.", detalle: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error inesperado al guardar la suscripcion.",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

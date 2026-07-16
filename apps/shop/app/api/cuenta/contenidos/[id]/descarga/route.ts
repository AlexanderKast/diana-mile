import { NextRequest, NextResponse } from "next/server";
import {
  getClienteUser,
  createAdminSupabaseClient,
} from "@diana-mile/shared/supabase/server";
import { clienteHaComprado } from "@/lib/cuenta";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * Redirige a una URL firmada de Storage (60s) para el archivo del contenido.
 * Nunca se expone el bucket 'contenidos' publicamente — toda descarga pasa
 * por aqui, que revalida sesion + gating de compra en cada request.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const cliente = await getClienteUser();
  if (!cliente) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const haComprado = await clienteHaComprado(cliente.telefono);
  if (!haComprado) {
    return NextResponse.json(
      { error: "Este contenido requiere una compra." },
      { status: 403 },
    );
  }

  const admin = createAdminSupabaseClient();
  const { data: contenido } = await admin
    .from("contenidos")
    .select("archivo_path, publicado")
    .eq("id", id)
    .eq("publicado", true)
    .maybeSingle();

  if (!contenido?.archivo_path) {
    return NextResponse.json(
      { error: "Contenido no encontrado." },
      { status: 404 },
    );
  }

  const { data: signed, error } = await admin.storage
    .from("contenidos")
    .createSignedUrl(contenido.archivo_path, 60);

  if (error || !signed) {
    return NextResponse.json(
      { error: "No se pudo generar el enlace de descarga." },
      { status: 500 },
    );
  }

  return NextResponse.redirect(signed.signedUrl);
}

import Link from "next/link";
import { Button } from "@diana-mile/shared/ui/Button";
import {
  getClienteUser,
  createAdminSupabaseClient,
} from "@diana-mile/shared/supabase/server";
import type { Contenido, TipoContenido } from "@diana-mile/shared/types";
import { clienteHaComprado } from "@/lib/cuenta";

const ETIQUETAS_TIPO: Record<TipoContenido, string> = {
  rutina: "Rutina",
  guia: "Guía",
  plan_alimentacion: "Plan de alimentación",
};

export default async function ContenidoPage() {
  const cliente = await getClienteUser();
  if (!cliente) return null;

  const haComprado = await clienteHaComprado(cliente.telefono);

  if (!haComprado) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-arena bg-crema p-8 text-center">
        <p className="font-display text-xl text-carbon">Contenido premium</p>
        <p className="max-w-sm text-sm text-carbon-suave">
          Se desbloquea con tu primera compra: rutinas, guías y planes de
          alimentación de Diana.
        </p>
        <Link href="/productos">
          <Button variant="primary">Ver productos →</Button>
        </Link>
      </div>
    );
  }

  const admin = createAdminSupabaseClient();
  const { data: contenidos } = await admin
    .from("contenidos")
    .select("*")
    .eq("publicado", true)
    .order("orden", { ascending: true })
    .returns<Contenido[]>();

  return (
    <div className="flex flex-col gap-6">
      <p className="font-display text-xl text-carbon">Contenido premium</p>

      {!contenidos || contenidos.length === 0 ? (
        <p className="text-sm text-carbon-suave">
          Pronto vas a encontrar aquí rutinas, guías y planes de Diana.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {contenidos.map((item) => (
            <Link
              key={item.id}
              href={`/cuenta/contenido/${item.id}`}
              className="flex flex-col gap-1 rounded-2xl border border-arena bg-blanco p-5 transition-colors hover:bg-crema"
            >
              <span className="w-fit rounded-full bg-crema px-3 py-1 text-xs text-carbon-suave">
                {ETIQUETAS_TIPO[item.tipo]}
              </span>
              <p className="mt-1 font-display text-lg text-carbon">
                {item.titulo}
              </p>
              {item.descripcion && (
                <p className="text-sm text-carbon-suave">{item.descripcion}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

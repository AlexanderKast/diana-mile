import TestimoniosPanel from "@/components/admin/TestimoniosPanel";
import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import type { Testimonio } from "@diana-mile/shared/types";

export const metadata = {
  title: "Testimonios | Milito Life Shop Admin",
};

export default async function TestimoniosPage() {
  const supabase = createAdminSupabaseClient();

  const { data } = await supabase
    .from("testimonios")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  const testimonios = (data ?? []) as Testimonio[];

  return (
    <div>
      <h1 className="font-display text-2xl text-carbon mb-2">Testimonios</h1>
      <p className="text-sm text-carbon-suave mb-6 max-w-2xl">
        Lo que respondieron clientas reales cuando se les preguntó por
        WhatsApp después de la entrega. Para publicar uno hacen falta dos
        cosas: que ella haya autorizado y que tú lo revises. Corrige erratas
        si hace falta, pero no cambies lo que quiso decir.
      </p>
      <TestimoniosPanel testimonios={testimonios} />
    </div>
  );
}

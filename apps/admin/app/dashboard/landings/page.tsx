import Link from "next/link";
import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";
import type { LandingVariante } from "@diana-mile/shared/types";
import LandingsRotador, {
  type MetricasVariante,
} from "@/components/admin/landings/LandingsRotador";

export const metadata = { title: "Rotador de landings | Milito Life Shop Admin" };

/** Metricas de operacion: se recalculan en cada visita. */
export const dynamic = "force-dynamic";

const SHOP_URL =
  process.env.NEXT_PUBLIC_SHOP_URL ?? "https://shop.militolife.com";

const PERIODOS = [
  { dias: 7, label: "7 días" },
  { dias: 30, label: "30 días" },
  { dias: 90, label: "90 días" },
];

export default async function LandingsPage({
  searchParams,
}: {
  searchParams: Promise<{ dias?: string }>;
}) {
  const { dias } = await searchParams;
  const periodo = PERIODOS.find((p) => String(p.dias) === dias) ?? PERIODOS[1];
  const desde = new Date(
    Date.now() - periodo.dias * 24 * 60 * 60 * 1000,
  ).toISOString();

  const supabase = createAdminSupabaseClient();

  // Pocas filas cada una (solo eventos atribuidos a variantes): se agrupan
  // aqui en JS, mismo criterio que el panel de metricas.
  const [variantesRes, visitasRes, clicsRes, pedidosRes] = await Promise.all([
    supabase
      .from("landing_variantes")
      .select("*")
      .order("producto_handle")
      .order("posicion")
      .order("created_at"),
    supabase
      .from("visitas")
      .select("ruta")
      .like("ruta", "/l/%")
      .gte("created_at", desde),
    supabase
      .from("whatsapp_clics")
      .select("landing_variante")
      .not("landing_variante", "is", null)
      .gte("created_at", desde),
    supabase
      .from("pedidos")
      .select("landing_variante, precio_total, cantidad")
      .not("landing_variante", "is", null)
      .gte("created_at", desde),
  ]);

  const variantes = (variantesRes.data ?? []) as LandingVariante[];

  const metricas: Record<string, MetricasVariante> = {};
  const de = (slug: string): MetricasVariante =>
    (metricas[slug] ??= { visitas: 0, clicsWhatsapp: 0, pedidos: 0, facturado: 0 });

  for (const v of visitasRes.data ?? []) {
    const slug = String(v.ruta ?? "").replace(/^\/l\//, "").split("?")[0];
    if (slug) de(slug).visitas += 1;
  }
  for (const c of clicsRes.data ?? []) {
    if (c.landing_variante) de(String(c.landing_variante)).clicsWhatsapp += 1;
  }
  for (const p of pedidosRes.data ?? []) {
    if (!p.landing_variante) continue;
    const m = de(String(p.landing_variante));
    m.pedidos += 1;
    m.facturado += Number(p.precio_total) || 0;
  }

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-1">
        <h1 className="font-display text-2xl text-carbon">
          Rotador de landings
        </h1>
        <div className="flex gap-1">
          {PERIODOS.map((p) => (
            <Link
              key={p.dias}
              href={`/dashboard/landings?dias=${p.dias}`}
              className={`px-3 py-1.5 text-xs rounded-[4px] border ${
                p.dias === periodo.dias
                  ? "bg-carbon text-blanco border-carbon"
                  : "bg-blanco text-carbon border-arena"
              }`}
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>
      <p className="text-sm text-carbon-suave mb-6 max-w-2xl">
        Varias landings del mismo producto, ocultas del sitio y del buscador.
        En la pauta va un solo link (el rotador): reparte visitantes entre las
        variantes activas y cada pedido o clic a WhatsApp queda atribuido a la
        variante que lo produjo. Lo facturado aquí es facturación de pedidos
        creados, no recaudo.
      </p>
      <LandingsRotador
        variantes={variantes}
        metricas={metricas}
        shopUrl={SHOP_URL}
        periodoLabel={periodo.label}
      />
    </div>
  );
}

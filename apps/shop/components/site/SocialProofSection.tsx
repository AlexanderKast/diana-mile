import Link from "next/link";
import { Button } from "@diana-mile/shared/ui/Button";
import type { CoberturaResumen } from "@/lib/cobertura-server";

/**
 * Prueba social REAL.
 *
 * Antes esta seccion mostraba tres testimonios escritos a mano, con foto
 * gris de perfil y cinco estrellas. Nadie los habia dicho. Una reseña
 * inventada es la señal mas rapida de que una tienda no es seria: quien
 * compra contraentrega esta decidiendo si confia, y esa es justo la
 * pregunta que una reseña falsa contesta mal.
 *
 * Lo que la reemplaza sale de `cobertura_entrega`, la matriz real de la
 * transportadora. Son numeros verificables, se actualizan solos, y dicen
 * algo que a la clienta de verdad le importa: si llegan a su municipio y en
 * cuantos dias.
 */
export function SocialProofSection({
  cobertura,
}: {
  cobertura: CoberturaResumen | null;
}) {
  if (!cobertura) return null;

  const porcentajeRecaudo = Math.round(
    (cobertura.conRecaudo / cobertura.ciudades) * 100,
  );

  const DATOS = [
    {
      cifra: cobertura.ciudades.toLocaleString("es-CO"),
      titulo: "municipios",
      detalle: "cubiertos por la transportadora en todo el país",
    },
    {
      cifra: cobertura.conRecaudo.toLocaleString("es-CO"),
      titulo: "con contraentrega",
      detalle: `el ${porcentajeRecaudo}% de la cobertura permite pagar al recibir`,
    },
    {
      cifra: `${cobertura.diasMin}-${cobertura.diasMax}`,
      titulo: "días de entrega",
      detalle: "según tu municipio — te lo confirmamos antes de despachar",
    },
  ];

  return (
    <section className="bg-blanco px-6 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <p className="text-[11px] uppercase tracking-[0.2em] text-ceniza">
          Cobertura real
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-[32px] leading-[1.1] tracking-tight text-carbon md:text-[44px]">
          No prometemos cobertura nacional. La medimos.
        </h2>
        <div className="linea-dorada mt-6 w-16" />

        <dl className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {DATOS.map((d, i) => (
            <div
              key={d.titulo}
              className="animate-fade-in-up border-t border-arena pt-5"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <dt className="font-display text-[46px] leading-none text-carbon md:text-[56px]">
                {d.cifra}
              </dt>
              <dd className="mt-2">
                <span className="text-[13px] uppercase tracking-[0.14em] text-dorado-oscuro">
                  {d.titulo}
                </span>
                <p className="mt-3 text-[14px] leading-relaxed text-carbon-suave">
                  {d.detalle}
                </p>
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-14">
          <Link href="/productos">
            <Button variant="primary">Ver el catálogo →</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

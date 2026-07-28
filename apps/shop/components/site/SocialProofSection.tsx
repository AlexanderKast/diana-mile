import Link from "next/link";
import { Button } from "@diana-mile/shared/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
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
 *
 * La version corta de estas mismas cifras vive en `TrustStrip`, pegada al
 * hero: el dato tiene que llegar antes del primer scroll. Aqui queda el
 * detalle y el CTA.
 *
 * En movil las tres cifras van en fila (cifra a la izquierda, explicacion a
 * la derecha) en vez de apiladas con `gap-10`: mismos datos, un tercio del
 * alto.
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
      detalle: "depende de tu municipio. Te lo confirmamos antes de despachar",
    },
  ];

  return (
    <section className="seccion-aire bg-blanco px-5 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          eyebrow="Envíos"
          titulo="Hasta dónde llegamos"
          descripcion="Estos números salen de la matriz de la transportadora y se actualizan cuando ella cambia su cobertura."
        />

        <dl className="mt-9 grid gap-0 sm:mt-12 sm:grid-cols-3 sm:gap-8">
          {DATOS.map((d, i) => (
            <div
              key={d.titulo}
              className="animate-fade-in-up flex items-baseline gap-4 border-t border-arena py-4 sm:block sm:py-0 sm:pt-5"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <dt className="w-[84px] shrink-0 font-display text-[32px] leading-none text-carbon sm:w-auto sm:text-[46px] lg:text-[56px]">
                {d.cifra}
              </dt>
              <dd className="sm:mt-2">
                <span className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-dorado-oscuro sm:text-[13px]">
                  {d.titulo}
                </span>
                <p className="mt-1 text-[13px] leading-relaxed text-carbon-suave sm:mt-3 sm:text-[14px]">
                  {d.detalle}
                </p>
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-9 sm:mt-14">
          <Link href="/productos">
            <Button variant="primary" className="w-full sm:w-auto">
              Ver el catálogo →
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

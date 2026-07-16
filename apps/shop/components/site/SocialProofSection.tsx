import Link from "next/link";
import { Button } from "@diana-mile/shared/ui/Button";

function IconStar() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 20 20"
      fill="var(--dorado)"
      aria-hidden="true"
    >
      <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.9L10 1.5z" />
    </svg>
  );
}

/**
 * Testimonios placeholder — reemplazar por resenas reales antes de
 * publicar. Version desacoplada de TestimonialsSection (que depende de
 * OrderSheetContext, ligado a un producto especifico); esta es generica
 * para usarse en home u otras paginas sin flujo de compra activo.
 */
const TESTIMONIOS = [
  {
    titulo: "Se nota la diferencia",
    texto:
      "Pedí sin muchas expectativas y el ritual completo cambió mi piel en semanas.",
  },
  {
    titulo: "Llegó rápido y bien empacado",
    texto:
      "El pedido contraentrega fue sin complicaciones, y el producto es tal cual lo describen.",
  },
  {
    titulo: "Confío en las recomendaciones de Diana",
    texto:
      "Sigo su ritual desde hace tiempo y cada producto que suma a la tienda lo pruebo primero.",
  },
];

export function SocialProofSection() {
  return (
    <section className="bg-blanco py-16 px-6 md:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-8 text-center font-display text-2xl text-carbon md:text-3xl">
          Lo que dicen de su ritual
        </h2>

        <div
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto md:grid md:grid-cols-3 md:gap-6 md:overflow-visible"
          style={{ scrollbarWidth: "none" }}
        >
          {TESTIMONIOS.map((item) => (
            <div
              key={item.titulo}
              className="flex min-w-[85%] shrink-0 snap-center flex-col gap-3 rounded-2xl border border-arena bg-blanco p-5 md:min-w-0"
            >
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <IconStar key={i} />
                ))}
              </div>
              <p className="text-[14px] font-semibold text-carbon">
                {item.titulo}
              </p>
              <p className="text-[14px] leading-relaxed text-carbon-suave">
                {item.texto}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/productos">
            <Button variant="primary">Descubrir productos →</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useOrderSheet } from "@/components/product/OrderSheetContext";

type Testimonial = {
  iniciales: string;
  nombre: string;
  ciudad: string;
  hace: string;
  variante: string;
  texto: string;
};

// TODO: conectar a sistema de reseñas real
const testimonios: Testimonial[] = [
  {
    iniciales: "MC",
    nombre: "María C.",
    ciudad: "Medellín",
    hace: "hace 3 días",
    variante: "Pack 3 unidades",
    texto:
      "Pensé que era un jabón más. Después de la primera semana mi piel nunca había estado tan suave. Literalmente no puedo vivir sin él. Ya voy por mi segundo pedido del pack triple.",
  },
  {
    iniciales: "VR",
    nombre: "Valentina R.",
    ciudad: "Bogotá",
    hace: "hace 1 semana",
    variante: "Pack 2 unidades",
    texto:
      "Lo compré para el cuerpo pero también lo uso en la cara porque tengo piel grasa y propenso al acné. Redujo mis poros notablemente. No lo cambio por nada.",
  },
  {
    iniciales: "DM",
    nombre: "Daniela M.",
    ciudad: "Cali",
    hace: "hace 5 días",
    variante: "1 unidad",
    texto:
      "La primera vez que lo usé sentí mi piel diferente inmediatamente. Es un ritual, no solo un jabón. El olor es increíble, natural, sin químicos. Ya le regalé uno a mi mamá.",
  },
  {
    iniciales: "AL",
    nombre: "Andrea L.",
    ciudad: "Barranquilla",
    hace: "hace 2 semanas",
    variante: "Pack 3 unidades",
    texto:
      "Soy muy escéptica con esto de los productos milagrosos pero una amiga me recomendó y le di una oportunidad. Semana 3 y mi piel está radiante. Dicen que se me ve diferente en el trabajo.",
  },
  {
    iniciales: "CP",
    nombre: "Camila P.",
    ciudad: "Bucaramanga",
    hace: "hace 4 días",
    variante: "Pack 2 unidades",
    texto:
      "Llegó rapidísimo y el empaque es hermoso. El producto en sí hace lo que promete. Ya lo pedí para mi hermana también. El pago contraentrega me dio confianza para hacer el primer pedido.",
  },
];

function IconStar() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="var(--dorado)" aria-hidden="true">
      <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.9L10 1.5z" />
    </svg>
  );
}

// Excepcion de color: check "verificado" estilo redes sociales (#1DA1F2), fuera del design system de marca.
function IconVerifiedCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="#1DA1F2" aria-hidden="true">
      <path d="M10 1.7l1.9 1.1 2.2-.3 1 2 2 1-.3 2.2 1.1 1.9-1.1 1.9.3 2.2-2 1-1 2-2.2-.3L10 18.3l-1.9-1.1-2.2.3-1-2-2-1 .3-2.2-1.1-1.9 1.1-1.9-.3-2.2 2-1 1-2 2.2.3L10 1.7z" />
      <path
        d="M7.2 10.2l1.8 1.8 3.8-3.8"
        stroke="#fff"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function TestimonialsSection() {
  const { openOrderSheet } = useOrderSheet();

  return (
    <section id="testimonios">
      {/* CAPA A — Stats de prueba social */}
      <div className="bg-carbon text-blanco py-8 px-6 text-center">
        <p className="font-display text-2xl">+ 2.400 mujeres ya transformaron su piel</p>
        <p className="mt-1 text-[13px] text-ceniza">Colombia · Ecuador · Venezuela · Perú</p>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <div>
            <p className="font-display text-4xl text-dorado">98%</p>
            <p className="text-[11px] text-ceniza">Volvería a pedir</p>
          </div>
          <div>
            <p className="font-display text-4xl text-dorado">4.9★</p>
            <p className="text-[11px] text-ceniza">Promedio reseñas</p>
          </div>
          <div>
            <p className="font-display text-4xl text-dorado">+2.4K</p>
            <p className="text-[11px] text-ceniza">Pedidos este mes</p>
          </div>
        </div>
      </div>

      {/* CAPA B — Testimonios estilo social commerce */}
      <div className="bg-blanco py-12 px-6">
        <h2 className="font-display text-2xl text-carbon text-center mb-6">
          Lo que dice nuestra comunidad
        </h2>

        <div
          className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:grid md:grid-cols-3 md:overflow-visible md:gap-4"
          style={{ scrollbarWidth: "none" }}
        >
          {testimonios.map((t) => (
            <div
              key={t.nombre}
              className="min-w-[85%] snap-center flex flex-col gap-3 bg-blanco border border-arena rounded-[8px] p-5 md:min-w-0"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lila-suave font-medium text-morado">
                  {t.iniciales}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-[14px] font-semibold text-carbon">{t.nombre}</span>
                    <IconVerifiedCheck />
                  </div>
                  <p className="text-[12px] text-ceniza">{t.ciudad}</p>
                  <p className="text-[11px] text-ceniza">{t.hace}</p>
                </div>
              </div>

              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <IconStar key={i} />
                ))}
              </div>

              <p className="text-[14px] leading-relaxed text-carbon-suave">{t.texto}</p>

              <div>
                <span className="inline-block rounded-[2px] border border-arena bg-crema px-2 py-1 text-[11px] text-morado">
                  {t.variante} ✓ Comprado
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CAPA C — CTA final */}
      <div className="bg-blanco py-8 px-6 text-center">
        <p className="font-display text-xl text-carbon mb-4">¿Lista para unirte a ellas?</p>
        <button
          type="button"
          onClick={() => openOrderSheet()}
          className="mx-auto flex min-h-[44px] w-full max-w-sm items-center justify-center rounded-[2px] bg-morado px-6 text-blanco"
        >
          Pedir mi Epoch® Polishing Bar →
        </button>
      </div>
    </section>
  );
}

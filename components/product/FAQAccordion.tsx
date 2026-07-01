"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "¿Cómo funciona el pago contraentrega?",
    answer:
      "Recibes el producto en la puerta de tu casa y pagas en efectivo al mensajero. No necesitas tarjeta de crédito ni hacer transferencias por adelantado.",
  },
  {
    question: "¿Cuánto demora el envío?",
    answer:
      "Entre 24 y 72 horas hábiles según tu ciudad. Ciudades principales (Bogotá, Medellín, Cali, Barranquilla) generalmente en 24-48 horas.",
  },
  {
    question: "¿Para qué tipo de piel funciona?",
    answer:
      "Para todo tipo de piel. Es especialmente efectivo para piel mixta a grasa. Sin jabón, no reseca. Si tienes piel muy sensible, recomendamos usarlo 2-3 veces por semana al inicio.",
  },
  {
    question: "¿Se puede usar en el rostro?",
    answer:
      "Sí. Muchas de nuestras clientas lo usan tanto en rostro como en cuerpo. La exfoliación es suave y no irrita. Consulta con tu dermatólogo si tienes condiciones de piel activas.",
  },
  {
    question: "¿Qué pasa si no quedo satisfecha?",
    answer:
      "Escríbenos por WhatsApp. Si el producto llega en mal estado o hay algún inconveniente con tu pedido, lo solucionamos sin complicaciones.",
  },
];

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div>
      <h2 className="font-display text-2xl text-carbon text-center mb-6">
        Preguntas frecuentes
      </h2>

      <div>
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <div key={faq.question} className="border-b border-arena py-4">
              <button
                type="button"
                onClick={() => toggleItem(index)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between min-h-[44px] text-left"
              >
                <span className="text-sm font-semibold text-carbon pr-4">
                  {faq.question}
                </span>
                <span
                  className={`shrink-0 text-xl font-light text-carbon transition-transform duration-300 ${
                    isOpen ? "rotate-45" : "rotate-0"
                  }`}
                  aria-hidden="true"
                >
                  +
                </span>
              </button>

              <div
                className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
                style={{ maxHeight: isOpen ? "200px" : "0px" }}
              >
                <p className="text-sm text-carbon-suave leading-[1.7] pt-2">
                  {faq.answer}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

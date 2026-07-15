"use client";

import { useState } from "react";
import type { LandingFaq } from "@diana-mile/shared/types";

export function FAQAccordion({ faqs }: { faqs: LandingFaq[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (faqs.length === 0) return null;

  const toggleItem = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div>
      <h2 className="font-display text-2xl text-carbon text-center mb-6">
        Preguntas frecuentes
      </h2>

      <div>
        {faqs.map((faq, index) => {
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

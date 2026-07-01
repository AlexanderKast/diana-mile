"use client";

import { useState } from "react";

const INGREDIENTES =
  "Sodium Cocoyl Isethionate, Stearic Acid, Aqua, Sodium Isethionate, Parfum, Sea Clay Extract, Sodium Chloride, Titanium Dioxide, Tsuga Heterophylla Bark Powder, Iron Oxides, Ascorbyl Palmitate, Tocopherol, Allantoin.";

export function IngredientsAccordion() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3 border-t border-arena pt-6">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center min-h-[44px] text-sm font-medium text-carbon text-left"
      >
        {open ? "Ver ingredientes completos −" : "Ver ingredientes completos +"}
      </button>

      {open ? (
        <p className="text-sm text-carbon-suave leading-relaxed animate-fade-in-up">
          {INGREDIENTES}
        </p>
      ) : null}

      <p className="text-xs text-ceniza">
        Sin parabenos · Sin sulfatos · Sin jabón · Sin aceites minerales
      </p>
    </div>
  );
}

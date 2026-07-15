"use client";

import { useState } from "react";
import type { LandingIngredients } from "@diana-mile/shared/types";

export function IngredientsAccordion({
  ingredients,
}: {
  ingredients: LandingIngredients;
}) {
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
          {ingredients.inci}
        </p>
      ) : null}

      <p className="text-xs text-ceniza">{ingredients.freeFrom}</p>
    </div>
  );
}

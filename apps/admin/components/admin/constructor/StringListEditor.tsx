"use client";

import { Button } from "@diana-mile/shared/ui/Button";

type StringListEditorProps = {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  addLabel?: string;
};

/** Editor de listas simples de texto (ej. "sin"/"con", filas de comparación). */
export default function StringListEditor({
  items,
  onChange,
  placeholder,
  addLabel = "Añadir línea",
}: StringListEditorProps) {
  function update(index: number, value: string) {
    const next = items.slice();
    next[index] = value;
    onChange(next);
  }

  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            value={item}
            placeholder={placeholder}
            onChange={(e) => update(index, e.target.value)}
            className="flex-1 min-h-[40px] rounded-[4px] border border-arena bg-blanco px-3 py-2 text-sm text-carbon focus:outline-none focus:border-dorado"
          />
          <button
            type="button"
            onClick={() => remove(index)}
            className="w-7 h-7 text-error shrink-0"
            aria-label="Quitar"
          >
            ✕
          </button>
        </div>
      ))}
      <Button
        type="button"
        variant="secondary"
        onClick={() => onChange([...items, ""])}
        className="self-start !px-4 !py-2 !min-h-0 text-sm"
      >
        + {addLabel}
      </Button>
    </div>
  );
}

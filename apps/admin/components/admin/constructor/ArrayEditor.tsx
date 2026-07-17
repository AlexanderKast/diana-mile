"use client";

import type { ReactNode } from "react";
import { Button } from "@diana-mile/shared/ui/Button";

type ArrayEditorProps<T> = {
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (
    item: T,
    index: number,
    update: (patch: Partial<T>) => void,
  ) => ReactNode;
  emptyItem: () => T;
  itemLabel?: (item: T, index: number) => string;
  addLabel?: string;
};

/**
 * Editor generico de listas (beneficios, pasos, testimonios, FAQs...) con
 * añadir / quitar / reordenar. Usado por el constructor de landing para no
 * repetir el mismo patron por cada seccion de ProductLandingContent.
 */
export default function ArrayEditor<T>({
  items,
  onChange,
  renderItem,
  emptyItem,
  itemLabel,
  addLabel = "Añadir",
}: ArrayEditorProps<T>) {
  function update(index: number, patch: Partial<T>) {
    const next = items.slice();
    next[index] = { ...next[index], ...patch };
    onChange(next);
  }

  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = items.slice();
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function add() {
    onChange([...items, emptyItem()]);
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, index) => (
        <div
          key={index}
          className="border border-arena rounded-[4px] p-4 bg-crema/40"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-ceniza uppercase">
              {itemLabel ? itemLabel(item, index) : `#${index + 1}`}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                className="w-7 h-7 text-carbon disabled:opacity-30"
                aria-label="Mover arriba"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === items.length - 1}
                className="w-7 h-7 text-carbon disabled:opacity-30"
                aria-label="Mover abajo"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => remove(index)}
                className="w-7 h-7 text-error"
                aria-label="Quitar"
              >
                ✕
              </button>
            </div>
          </div>
          {renderItem(item, index, (patch) => update(index, patch))}
        </div>
      ))}
      <Button
        type="button"
        variant="secondary"
        onClick={add}
        className="self-start !px-4 !py-2 !min-h-0 text-sm"
      >
        + {addLabel}
      </Button>
    </div>
  );
}

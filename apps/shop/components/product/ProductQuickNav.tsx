"use client";

type QuickNavItem = {
  label: string;
  targetId: string;
};

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function ProductQuickNav({ showIngredientes }: { showIngredientes: boolean }) {
  const items: QuickNavItem[] = [
    { label: "Beneficios", targetId: "beneficios" },
    ...(showIngredientes ? [{ label: "Ingredientes", targetId: "ingredientes" }] : []),
    { label: "Cómo usarlo", targetId: "como-usarlo" },
    { label: "Preguntas", targetId: "preguntas" },
  ];

  return (
    <nav
      aria-label="Navegación rápida del producto"
      className="flex items-center gap-4 overflow-x-auto px-6 py-2 md:px-10"
      style={{ scrollbarWidth: "none" }}
    >
      {items.map((item, index) => (
        <span key={item.targetId} className="flex shrink-0 items-center gap-4">
          {index > 0 && <span className="text-arena">·</span>}
          <button
            type="button"
            onClick={() => scrollToSection(item.targetId)}
            className="text-[12px] font-medium text-carbon-suave underline-offset-4 transition-colors hover:text-dorado-oscuro hover:underline"
          >
            {item.label}
          </button>
        </span>
      ))}
    </nav>
  );
}

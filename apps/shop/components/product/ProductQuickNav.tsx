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
      className="flex gap-2 overflow-x-auto px-6 py-1 md:px-10"
      style={{ scrollbarWidth: "none" }}
    >
      {items.map((item) => (
        <button
          key={item.targetId}
          type="button"
          onClick={() => scrollToSection(item.targetId)}
          className="shrink-0 rounded-full border border-arena bg-blanco px-3.5 py-1.5 text-[11px] font-medium text-carbon-suave transition-colors hover:border-dorado hover:text-carbon"
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}

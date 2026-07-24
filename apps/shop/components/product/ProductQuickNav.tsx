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
    { label: "Cómo usarlo", targetId: "como-usarlo" },
    ...(showIngredientes ? [{ label: "Ingredientes", targetId: "ingredientes" }] : []),
    { label: "Preguntas", targetId: "preguntas" },
  ];

  return (
    <nav
      aria-label="Navegación rápida del producto"
      className="flex items-center justify-center gap-2 overflow-x-auto px-6 py-2 md:px-10"
      style={{ scrollbarWidth: "none" }}
    >
      {items.map((item) => (
        <button
          key={item.targetId}
          type="button"
          onClick={() => scrollToSection(item.targetId)}
          className="shrink-0 rounded-full border-[1.5px] border-arena bg-blanco px-3.5 py-1.5 text-[12px] font-medium text-carbon-suave shadow-[0_1px_3px_rgba(26,23,20,0.12)] transition-colors hover:border-morado/50 hover:text-morado-oscuro"
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}

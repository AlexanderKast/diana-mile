/**
 * Skeleton de /mi-plan mientras el Server Component pide usuarios_plan +
 * plan_progreso + quiz_respuestas. `prefers-reduced-motion` apaga el pulso
 * via la regla global agregada en globals.css (Tailwind no trae esa regla
 * por defecto para `animate-pulse`).
 */
function Bloque({ alto }: { alto: string }) {
  return <div className={`animate-pulse rounded-2xl bg-arena/60 ${alto}`} />;
}

export default function CargandoMiPlan() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-5 pb-16 pt-4">
      <div className="flex flex-col gap-2">
        <div className="h-7 w-40 animate-pulse rounded-md bg-arena/60" />
        <div className="h-4 w-56 animate-pulse rounded-md bg-arena/40" />
      </div>
      <Bloque alto="h-28" />
      <Bloque alto="aspect-video" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-arena/50" />
        ))}
      </div>
      <Bloque alto="h-14" />
      <Bloque alto="h-40" />
    </div>
  );
}

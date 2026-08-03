export default function CargandoProgreso() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-5 pb-16 pt-4">
      <div className="h-4 w-28 animate-pulse rounded-md bg-arena/40" />
      <div className="flex flex-col gap-2">
        <div className="h-7 w-32 animate-pulse rounded-md bg-arena/60" />
        <div className="h-4 w-40 animate-pulse rounded-md bg-arena/40" />
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-arena/50" />
        ))}
      </div>
    </div>
  );
}

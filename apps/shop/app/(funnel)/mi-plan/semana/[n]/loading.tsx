export default function CargandoSemana() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-5 pb-16 pt-4">
      <div className="h-4 w-28 animate-pulse rounded-md bg-arena/40" />
      <div className="flex flex-col gap-2">
        <div className="h-3 w-24 animate-pulse rounded-md bg-arena/40" />
        <div className="h-8 w-48 animate-pulse rounded-md bg-arena/60" />
      </div>
      <div className="h-16 animate-pulse rounded-2xl bg-arena/50" />
      <div className="h-12 animate-pulse rounded-lg bg-arena/60" />
    </div>
  );
}

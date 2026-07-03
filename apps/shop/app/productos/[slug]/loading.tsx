export default function ProductLoading() {
  return (
    <main className="grid grid-cols-1 gap-6 px-6 py-8 md:grid-cols-2 md:px-10">
      <div className="aspect-square rounded-2xl bg-crema md:aspect-[4/5]" />
      <div className="flex flex-col gap-4">
        <div className="h-4 w-32 rounded bg-crema" />
        <div className="h-10 w-3/4 rounded bg-crema" />
        <div className="h-4 w-full rounded bg-crema" />
        <div className="h-12 w-full rounded bg-dorado/40" />
        <div className="h-64 w-full rounded bg-crema" />
      </div>
    </main>
  );
}

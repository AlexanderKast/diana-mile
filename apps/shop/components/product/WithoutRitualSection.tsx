import type { LandingWithoutRitual } from "@diana-mile/shared/types";

export function WithoutRitualSection({ data }: { data: LandingWithoutRitual }) {
  return (
    <section className="bg-blanco px-6 py-12">
      <h2 className="font-display text-2xl text-carbon text-center max-w-lg mx-auto mb-8">
        {data.title}
      </h2>

      <div className="mx-auto grid max-w-3xl gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-2xl border border-arena bg-crema p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ceniza">
            Sin ritual profundo
          </p>
          {data.sin.map((item) => (
            <p
              key={item}
              className="flex items-start gap-2 text-sm text-carbon-suave"
            >
              <span className="mt-0.5 shrink-0 font-bold text-error">✕</span>
              {item}
            </p>
          ))}
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border-[1.5px] border-morado bg-lila-suave p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-morado-oscuro">
            {data.conLabel}
          </p>
          {data.con.map((item) => (
            <p
              key={item}
              className="flex items-start gap-2 text-sm text-carbon-suave"
            >
              <span className="mt-0.5 shrink-0 font-bold text-verde-ok">✓</span>
              {item}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

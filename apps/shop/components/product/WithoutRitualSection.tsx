const SIN_RITUAL = [
  "Los activos de tu sérum no penetran bien",
  "Las células muertas acumuladas opacan la piel",
  "Los poros se congestionan sin que lo notes",
  "Resultado: la piel parece cansada aunque uses buenos productos",
];

const CON_RITUAL = [
  "Base limpia = máxima absorción de activos",
  "Mineralización que prepara y nutre simultáneamente",
  "Exfoliación suave que renueva sin irritar",
  "Resultado: el resto de tu rutina funciona el doble",
];

export function WithoutRitualSection({ productName }: { productName: string }) {
  return (
    <section className="bg-blanco px-6 py-12">
      <h2 className="font-display text-2xl text-carbon text-center max-w-lg mx-auto mb-8">
        Por qué la limpieza profunda importa más que cualquier crema
      </h2>

      <div className="mx-auto grid max-w-3xl gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-2xl border border-arena bg-crema p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ceniza">Sin ritual profundo</p>
          {SIN_RITUAL.map((item) => (
            <p key={item} className="flex items-start gap-2 text-sm text-carbon-suave">
              <span className="mt-0.5 shrink-0 font-bold text-error">✕</span>
              {item}
            </p>
          ))}
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border-[1.5px] border-morado bg-lila-suave p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-morado-oscuro">
            Con el {productName}
          </p>
          {CON_RITUAL.map((item) => (
            <p key={item} className="flex items-start gap-2 text-sm text-carbon-suave">
              <span className="mt-0.5 shrink-0 font-bold text-verde-ok">✓</span>
              {item}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

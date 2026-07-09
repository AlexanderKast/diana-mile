const ETAPAS = [
  {
    momento: "Día 1",
    titulo: "Primera aplicación",
    descripcion: "Sientes la piel limpia diferente — sin esa sensación de tirante del jabón.",
  },
  {
    momento: "Semana 1-2",
    titulo: "Primeros cambios visibles",
    descripcion: "Poros más finos. Piel más pareja. La gente de tu entorno lo nota antes que tú.",
  },
  {
    momento: "Semana 3-4",
    titulo: "Tu nueva piel",
    descripcion:
      "Textura transformada. La firmeza que buscabas no viene de cremas — viene de la limpieza profunda diaria.",
  },
  {
    momento: "Día 90+",
    titulo: "Tu ritual, para siempre",
    descripcion: "No querrás volver a limpiar tu piel de ninguna otra manera.",
  },
];

export function ResultsTimeline() {
  return (
    <section className="bg-crema py-12 px-6">
      <h2 className="font-display text-[26px] text-carbon text-center mb-10">Qué esperar de tu ritual</h2>

      <div className="mx-auto flex max-w-4xl flex-col gap-8 md:flex-row md:gap-4">
        {ETAPAS.map((etapa, index) => (
          <div key={etapa.momento} className="relative flex gap-4 md:flex-1 md:flex-col md:gap-3">
            <div className="flex flex-col items-center">
              <span className="h-3 w-3 shrink-0 rounded-full bg-dorado-oscuro" />
              {index < ETAPAS.length - 1 && (
                <span className="mt-1 w-0.5 flex-1 bg-dorado/50 md:mt-0 md:h-0.5 md:w-full md:absolute md:top-1.5 md:left-1/2" />
              )}
            </div>
            <div className="flex flex-col gap-1 pb-6 md:pb-0 md:pt-2">
              <span className="font-display text-xl text-dorado-oscuro">{etapa.momento}</span>
              <p className="text-sm font-semibold text-carbon">{etapa.titulo}</p>
              <p className="text-sm text-carbon-suave">{etapa.descripcion}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

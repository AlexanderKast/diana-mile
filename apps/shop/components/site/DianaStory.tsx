/**
 * "Detras de Milito Life Shop".
 *
 * SIN FOTO A PROPOSITO. Antes esta seccion mostraba
 * /images/lifestyle-ritual.jpg —una foto de stock de producto— con
 * alt="Diana Mile". Es decir: le ponia cara ajena a una persona real. En una
 * tienda que se sostiene sobre "yo lo probé primero", que la cara sea falsa
 * es el peor detalle posible, y es justo el tipo de cosa que hace que una
 * pagina se sienta armada por una maquina.
 *
 * Mientras no haya una foto real de Diana, el bloque es tipografico. Un
 * retrato compuesto con letra y espacio se lee como una decision de diseño;
 * una foto de banco de imagenes se lee como un engaño.
 *
 * Los datos del texto estan confirmados con ella: 35 años, mamá de dos,
 * empresaria, entrenadora fisica y personal de salud, creadora de contenido
 * (@militolife). NO agregar especialidad ni certificaciones sin confirmar.
 */
export function DianaStory() {
  return (
    <section className="bg-crema px-6 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-ceniza">
              Detrás de Milito Life Shop
            </p>
            <h2 className="mt-4 font-display text-[40px] leading-[0.95] tracking-tight text-carbon md:text-[64px]">
              Hola,
              <br />
              soy Diana
            </h2>
            <div className="linea-dorada mt-6 w-16" />
          </div>

          <div className="flex flex-col gap-6 md:pt-6">
            <p className="font-display text-[22px] leading-snug text-carbon md:text-[26px]">
              No vendo promesas vacías — comparto lo que confío.
            </p>
            <p className="max-w-md text-[15px] leading-relaxed text-carbon-suave">
              Tengo 35 años, soy mamá de dos, empresaria y entrenadora física y
              personal de salud. Crear contenido y acompañar procesos de
              bienestar es lo que más disfruto — servir a otros es lo que me
              mueve.
            </p>
            <p className="max-w-md text-[15px] leading-relaxed text-carbon-suave">
              Esta tienda nace de lo mismo: lo que entreno, lo que uso y lo que
              recomiendo con mi nombre. Si algo no me funcionó, no llega aquí.
            </p>

            <dl className="mt-2 flex flex-wrap gap-x-10 gap-y-4 border-t border-arena pt-6">
              {[
                ["Entrenadora", "física y personal de salud"],
                ["Mamá de dos", "y empresaria"],
                ["@militolife", "creadora de contenido"],
              ].map(([titulo, detalle]) => (
                <div key={titulo}>
                  <dt className="text-[13px] uppercase tracking-[0.12em] text-dorado-oscuro">
                    {titulo}
                  </dt>
                  <dd className="mt-1 text-[13px] text-ceniza">{detalle}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

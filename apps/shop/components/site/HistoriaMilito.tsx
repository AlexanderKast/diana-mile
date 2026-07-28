import Image from "next/image";

/**
 * "Detras de Milito Life Shop".
 *
 * LA FOTO ES REAL. Durante un tiempo este bloque fue solo tipografico, porque
 * lo unico disponible era /images/lifestyle-ritual.jpg —una foto de stock de
 * producto— rotulada alt="Diana Mile": le ponia cara ajena a una persona
 * real. En una tienda que se sostiene sobre que hay una persona de verdad
 * respondiendo, que la cara sea falsa es el peor detalle posible.
 *
 * OJO CON EL COPY: no afirmar que ella usa o probo todo lo del catalogo. Hay
 * productos buenos que todavia no ha usado, asi que "si no lo uso no lo
 * vendo" es falso. La confianza se sostiene en lo que si es verificable:
 * distribuidora independiente, producto original, pago contraentrega y
 * asesoria personal antes de comprar.
 *
 * Ya no hace falta: `diana-retrato.jpg` sale del estudio del 3 de julio.
 * Cualquier reemplazo futuro tiene que ser tambien una foto suya de verdad —
 * si algun dia no la hay, se vuelve al bloque sin imagen antes que poner un
 * banco de imagenes.
 *
 * Los datos del texto estan confirmados con ella: 35 años, mamá de dos,
 * empresaria, entrenadora fisica y personal de salud, creadora de contenido
 * (@militolife). NO agregar especialidad ni certificaciones sin confirmar.
 *
 * En movil la foto ya no va a ancho completo. Con `aspect-[4/5]` a 390px
 * medía unos 490px de alto y, sumada al h2 de 40px y a los dos parrafos,
 * convertia este bloque en el mas largo del home (~1.000px). Ahora comparte
 * fila con el titulo: mismo material, la mitad del scroll.
 */
export function HistoriaMilito() {
  return (
    <section className="seccion-aire bg-crema px-5 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-8 md:grid-cols-[0.85fr_1.15fr] md:gap-14">
          <div>
            {/* Movil: foto y titulo comparten fila. Desde `md` se apilan pero
                invertidos —titulo arriba, foto debajo— con `flex-col-reverse`:
                con la foto arriba, "Hola, soy Milito" caia al fondo de la
                columna mientras el texto de la derecha arrancaba en el borde
                superior, y el titulo quedaba huerfano a media altura. */}
            <div className="flex items-end gap-5 md:flex-col-reverse md:items-stretch md:gap-0">
              <div className="relative aspect-[3/4] w-[42%] shrink-0 overflow-hidden rounded-2xl md:mt-8 md:aspect-[4/5] md:w-full">
                <Image
                  src="/images/diana-retrato.jpg"
                  alt="Milito, fundadora de Milito Life Shop"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 42vw, 40vw"
                />
              </div>

              <div className="pb-1 md:pb-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-carbon-suave sm:text-[11px]">
                  Detrás de Milito Life Shop
                </p>
                <h2 className="mt-3 font-display text-[34px] leading-[0.95] tracking-tight text-carbon sm:text-[44px] md:mt-4 md:text-[60px]">
                  Hola,
                  <br />
                  soy Milito
                </h2>
                <div className="linea-dorada mt-4 w-14 sm:w-16 md:mt-6" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5 sm:gap-6 md:pt-6">
            <p className="font-display text-[21px] leading-snug text-carbon text-balance sm:text-[24px] md:text-[28px]">
              Antes de venderte algo, te pregunto qué necesitas.
            </p>
            <p className="max-w-md text-[14.5px] leading-relaxed text-carbon-suave sm:text-[15px]">
              Tengo 35 años, soy mamá de dos, empresaria y entrenadora física y
              personal de salud. Lo que más disfruto de mi trabajo es acompañar
              a alguien mientras cambia sus hábitos.
            </p>
            <p className="max-w-md text-[14.5px] leading-relaxed text-carbon-suave sm:text-[15px]">
              Esta tienda salió de ahí: el catálogo que recomiendo, con mi
              nombre puesto y respondiendo yo los mensajes.
            </p>

            <dl className="mt-1 grid grid-cols-3 gap-3 border-t border-arena pt-5 sm:gap-6">
              {[
                ["Entrenadora", "física y de salud"],
                ["Mamá de dos", "y empresaria"],
                ["@militolife", "creadora de contenido"],
              ].map(([titulo, detalle]) => (
                <div key={titulo}>
                  <dt className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-dorado-oscuro sm:text-[13px]">
                    {titulo}
                  </dt>
                  <dd className="mt-1 text-[11.5px] leading-snug text-carbon-suave sm:text-[13px]">
                    {detalle}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

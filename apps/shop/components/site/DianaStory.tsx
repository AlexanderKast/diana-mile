import Image from "next/image";

/**
 * Copy y foto placeholder — reemplazar por la bio real y una foto de
 * Diana antes de publicar. Se dejo generico a proposito para no inventar
 * datos (anios de experiencia, credenciales, etc.) que no se han confirmado.
 */
export function DianaStory() {
  return (
    <section className="bg-crema">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-2 md:items-center md:gap-12 md:py-20">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl">
          <Image
            src="/images/lifestyle-ritual.jpg"
            alt="Diana Mile"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-[11px] uppercase tracking-wide text-ceniza">
            Detrás de Milito Life Shop
          </p>
          <h2 className="font-display text-3xl text-carbon md:text-4xl">
            Hola, soy Diana
          </h2>
          <div className="linea-dorada w-12" />
          <p className="text-sm leading-relaxed text-carbon-suave">
            Cada producto que encuentras aquí pasó primero por mi propio ritual.
            Milito Life Shop nace de esa curaduría personal: lo que uso, lo que
            le funciona a mi piel y lo que estoy dispuesta a recomendarte con mi
            nombre.
          </p>
          <p className="text-sm leading-relaxed text-carbon-suave">
            No vendo promesas vacías — comparto lo que confío.
          </p>
        </div>
      </div>
    </section>
  );
}

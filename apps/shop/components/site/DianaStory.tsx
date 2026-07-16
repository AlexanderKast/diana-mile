import Image from "next/image";

/**
 * Copy y foto placeholder — reemplazar antes de publicar. Faltan por
 * confirmar (no inventar): anios de experiencia, especialidad de
 * entrenamiento, certificacion, y una foto real de Diana entrenando (se
 * reviso apps/linktree/public/images/diana-profile.jpg: es foto de stock
 * de producto, no sirve). Mientras tanto se usa /images/lifestyle-ritual.jpg.
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
            Soy entrenadora física y personal de salud. Llevo años acompañando
            procesos de bienestar, y esta tienda nace de lo mismo: lo que
            entreno, lo que uso y lo que recomiendo con mi nombre.
          </p>
          <p className="text-sm leading-relaxed text-carbon-suave">
            No vendo promesas vacías — comparto lo que confío.
          </p>
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";

type Foto = { url: string; altText: string | null };

/**
 * Fotos reales de antes/despues de clientas, administradas 100% desde
 * Shopify (metafield `diana_mile.resultados_reales`, list.file_reference) —
 * cualquier persona con acceso a Shopify puede agregar/quitar fotos ahi sin
 * tocar codigo. Si el producto no tiene fotos cargadas, la seccion no se
 * muestra (nunca fotos inventadas ni de otro producto).
 */
export function ResultadosRealesGallery({ fotos }: { fotos: Foto[] }) {
  if (fotos.length === 0) return null;

  return (
    <section className="py-12 px-6 flex flex-col gap-6">
      <div className="text-center">
        <h2 className="font-display text-2xl text-carbon">
          Resultados reales de quienes ya lo usan
        </h2>
        <p className="mt-1 text-xs text-ceniza">
          Fotos de clientas reales, compartidas con su autorizacion — los
          resultados individuales pueden variar.
        </p>
      </div>

      <div
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-4 md:overflow-visible"
        style={{ scrollbarWidth: "none" }}
      >
        {fotos.map((foto, index) => (
          <div
            key={foto.url}
            className="relative shrink-0 w-[70%] md:w-auto snap-center aspect-[4/5] rounded-2xl overflow-hidden"
          >
            <Image
              src={foto.url}
              alt={foto.altText ?? `Resultado real de una clienta — foto ${index + 1}`}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 25vw, 70vw"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

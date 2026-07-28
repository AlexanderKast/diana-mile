import type { CoberturaResumen } from "@/lib/cobertura-server";

/**
 * Banda de confianza inmediata, pegada al hero.
 *
 * El dato que decide una compra contraentrega —¿llegan a mi municipio?, ¿en
 * cuantos dias?, ¿pago antes o despues?— vivia a 6.000px de scroll, dentro de
 * `SocialProofSection`. Quien entra por un anuncio ve el hero y se va sin
 * haberlo leido nunca.
 *
 * Esta banda lo sube al primer scroll en version corta. La seccion larga de
 * cobertura sigue existiendo mas abajo con el detalle y el CTA: aqui son tres
 * cifras, no una explicacion.
 *
 * Los numeros salen de `cobertura_entrega`, igual que la seccion larga — si la
 * transportadora cambia cobertura, esto cambia solo. Sin dato no se pinta.
 */
export function TrustStrip({
  cobertura,
}: {
  cobertura: CoberturaResumen | null;
}) {
  const items = [
    {
      cifra: cobertura ? cobertura.conRecaudo.toLocaleString("es-CO") : "Pagas",
      label: cobertura ? "municipios con pago al recibir" : "al recibir",
    },
    {
      cifra: cobertura ? `${cobertura.diasMin}-${cobertura.diasMax}` : "48h",
      label: "días de entrega",
    },
    {
      cifra: "100%",
      // Sin marca: la tienda es multimarca y esta banda aplica a todo el
      // catalogo, no solo a lo de Nu Skin.
      label: "producto original",
    },
  ];

  return (
    <section
      aria-label="Garantías de compra"
      className="border-y border-arena bg-blanco"
    >
      <ul className="mx-auto grid max-w-5xl grid-cols-3 divide-x divide-arena px-2 sm:px-6">
        {items.map((item) => (
          <li
            key={item.label}
            className="flex flex-col items-center gap-1 px-2 py-5 text-center sm:gap-1.5 sm:py-7"
          >
            <span className="font-display text-[22px] leading-none text-dorado-oscuro sm:text-[30px]">
              {item.cifra}
            </span>
            <span className="text-[10.5px] leading-tight text-carbon-suave sm:text-[12px]">
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

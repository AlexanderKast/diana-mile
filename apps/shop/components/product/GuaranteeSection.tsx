import Image from "next/image";

/**
 * Mismos sellos de Magnific que TrustBadges (reusados aqui para consistencia
 * visual entre secciones) + uno propio de soporte por WhatsApp.
 */
const ITEMS = [
  {
    src: "https://cdn.shopify.com/s/files/1/0696/3783/2747/files/F_Descargas_magnific_flat-trust-badge-for-a-pr_gJshCl2SXO.png",
    label: "Pagas al recibir",
  },
  {
    src: "https://cdn.shopify.com/s/files/1/0696/3783/2747/files/F_Descargas_magnific_flat-trust-badge-for-a-pr_J9wEq4wOq4.png",
    label: "Envío 24-72h",
  },
  {
    src: "https://cdn.shopify.com/s/files/1/0696/3783/2747/files/F_Descargas_magnific_flat-trust-badge-for-a-pr_swjmVSrl8e.png",
    label: "Soporte por WhatsApp",
  },
];

export function GuaranteeSection() {
  return (
    <section className="bg-crema py-12 px-6 text-center">
      <h2 className="font-display text-2xl text-carbon">Tu pedido está protegido</h2>

      <div className="mt-8 flex items-center -mx-6 md:mx-0 md:max-w-sm md:mx-auto">
        {ITEMS.map(({ src, label }) => (
          <div key={label} className="relative flex-1 aspect-[100/81]" title={label}>
            <Image src={src} alt={label} fill className="object-cover" sizes="33vw" />
          </div>
        ))}
      </div>

      <p className="mt-8 max-w-md mx-auto text-sm text-carbon-suave leading-relaxed">
        Si el producto llega malo o no te funciona, lo reponemos sin costo adicional. Tu
        satisfacción es nuestra garantía.
      </p>
    </section>
  );
}

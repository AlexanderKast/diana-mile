import Image from "next/image";

/**
 * Sellos generados con Magnific (gpt-2), subidos a Shopify Files — icono +
 * texto ya vienen dibujados dentro de la imagen, no son datos de un
 * producto especifico asi que se referencian fijos aqui (no en un
 * metafield). Si se necesita regenerar alguno, ver la conversacion donde se
 * crearon para los prompts exactos.
 *
 * Solo 3 aqui a proposito — "Compra segura" y "100% original" viven en
 * ProductHeroCTA (otro punto de la pagina) para no apilar 2 filas de sellos
 * juntas en el mismo lugar.
 */
export const TRUST_BADGES = [
  {
    src: "https://cdn.shopify.com/s/files/1/0696/3783/2747/files/F_Descargas_magnific_flat-trust-badge-for-a-pr_rlkBtcextc.png",
    label: "Contraentrega Colombia",
  },
  {
    src: "https://cdn.shopify.com/s/files/1/0696/3783/2747/files/F_Descargas_magnific_flat-trust-badge-for-a-pr_gJshCl2SXO.png",
    label: "Pago al recibir",
  },
  {
    src: "https://cdn.shopify.com/s/files/1/0696/3783/2747/files/F_Descargas_magnific_flat-trust-badge-for-a-pr_J9wEq4wOq4.png",
    label: "Envío en 24-72h",
  },
];

export default function TrustBadges() {
  return (
    <div className="flex items-center -mx-6 md:mx-0 md:max-w-sm">
      {TRUST_BADGES.map(({ src, label }) => (
        <div key={label} className="relative flex-1 aspect-[100/81]" title={label}>
          <Image
            src={src}
            alt={label}
            fill
            className="object-cover"
            sizes="33vw"
          />
        </div>
      ))}
    </div>
  );
}

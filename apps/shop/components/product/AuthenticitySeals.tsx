import Image from "next/image";

// Mismos sellos de Magnific que TrustBadges (texto grueso, hechos por
// Alexander) — se repite este bloque en 2 puntos de la pagina a proposito
// (debajo del CTA principal y al cierre), no hay problema con la repeticion.
const COMPRA_SEGURA_BADGE =
  "https://cdn.shopify.com/s/files/1/0696/3783/2747/files/F_Descargas_magnific_flat-trust-badge-for-a-pr_iANkfZX3uK.png";
const SOPORTE_WHATSAPP_BADGE =
  "https://cdn.shopify.com/s/files/1/0696/3783/2747/files/F_Descargas_magnific_flat-trust-badge-for-a-pr_swjmVSrl8e.png";
const ORIGINAL_100_BADGE =
  "https://cdn.shopify.com/s/files/1/0696/3783/2747/files/F_Descargas_magnific_flat-trust-badge-for-a-pr_LUxt0K5swO.png";

export function getAuthenticitySeals(showAuthenticity: boolean) {
  return [
    { src: COMPRA_SEGURA_BADGE, label: "Compra segura" },
    { src: SOPORTE_WHATSAPP_BADGE, label: "Soporte por WhatsApp" },
    ...(showAuthenticity ? [{ src: ORIGINAL_100_BADGE, label: "100% original" }] : []),
  ];
}

export function AuthenticitySeals({ showAuthenticity = false }: { showAuthenticity?: boolean }) {
  const badges = getAuthenticitySeals(showAuthenticity);

  return (
    <div className="flex items-center py-1 -mx-6 md:mx-0 md:max-w-sm">
      {badges.map(({ src, label }) => (
        <div key={label} className="relative flex-1 aspect-[100/81]" title={label}>
          <Image src={src} alt={label} fill className="object-cover" sizes="50vw" />
        </div>
      ))}
    </div>
  );
}

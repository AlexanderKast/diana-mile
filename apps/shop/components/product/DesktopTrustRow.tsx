import Image from "next/image";
import { TRUST_BADGES } from "@/components/product/TrustBadges";
import { getAuthenticitySeals } from "@/components/product/AuthenticitySeals";

// Solo desktop: junta los 6 sellos (TrustBadges + AuthenticitySeals) en una
// sola fila en vez de las 2 filas separadas que se ven en mobile.
export function DesktopTrustRow({ showAuthenticity = false }: { showAuthenticity?: boolean }) {
  const items = [...TRUST_BADGES, ...getAuthenticitySeals(showAuthenticity)];

  return (
    <div className="hidden md:flex items-center md:max-w-2xl">
      {items.map(({ src, label }) => (
        <div key={label} className="relative flex-1 aspect-[100/81]" title={label}>
          <Image src={src} alt={label} fill className="object-cover" sizes="16vw" />
        </div>
      ))}
    </div>
  );
}

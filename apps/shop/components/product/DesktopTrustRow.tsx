import Image from "next/image";
import {
  getTrustBadges,
  type ModoCompra,
} from "@/components/product/TrustBadges";
import { getAuthenticitySeals } from "@/components/product/AuthenticitySeals";

// Solo desktop: junta los sellos (TrustBadges + AuthenticitySeals) en una
// sola fila en vez de las 2 filas separadas que se ven en mobile.
//
// En vitrina los dos juegos comparten sellos (compra segura, soporte), asi
// que se deduplican por src — si no, la fila repetiria la misma imagen dos
// veces y se veria como un error de maquetacion.
export function DesktopTrustRow({
  showAuthenticity = false,
  modo = "cod",
}: {
  showAuthenticity?: boolean;
  modo?: ModoCompra;
}) {
  const vistos = new Set<string>();
  const items = [
    ...getTrustBadges(modo),
    ...getAuthenticitySeals(showAuthenticity),
  ].filter((item) => {
    if (vistos.has(item.src)) return false;
    vistos.add(item.src);
    return true;
  });

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

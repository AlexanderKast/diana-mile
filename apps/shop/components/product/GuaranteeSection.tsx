import Image from "next/image";
import { BADGE, type ModoCompra } from "@/components/product/TrustBadges";

/**
 * "Tu pedido esta protegido" — el bloque de reversion de riesgo.
 *
 * Cambia por completo segun como se compra el producto. En contraentrega el
 * riesgo se revierte solo: no pagas hasta tenerlo en la mano. En un producto
 * de vitrina, donde la persona SI adelanta plata, ese argumento no existe y
 * repetirlo seria mentir — hay que reemplazarlo por los que si son verdad:
 * producto original, una asesora con nombre al otro lado, y la misma
 * garantia de reposicion.
 */

const ITEMS_COD = [
  { src: BADGE.pagoAlRecibir, label: "Pagas al recibir" },
  { src: BADGE.envio, label: "Envío 24-72h" },
  { src: BADGE.soporteWhatsapp, label: "Soporte por WhatsApp" },
];

const ITEMS_VITRINA = [
  { src: BADGE.original, label: "100% original" },
  { src: BADGE.compraSegura, label: "Compra segura" },
  { src: BADGE.soporteWhatsapp, label: "Soporte por WhatsApp" },
];

const COPY = {
  cod: {
    titulo: "Tu pedido está protegido",
    cuerpo:
      "Si el producto llega malo o no te funciona, lo reponemos sin costo adicional. Tu satisfacción es nuestra garantía.",
  },
  vitrina: {
    titulo: "Comprar así también es seguro",
    cuerpo:
      "Milito coordina contigo cada paso antes de que pagues: qué llega, cuándo y cómo. Producto original de Nu Skin, con la misma garantía de reposición si algo llega mal.",
  },
} as const;

export function GuaranteeSection({ modo = "cod" }: { modo?: ModoCompra }) {
  const items = modo === "cod" ? ITEMS_COD : ITEMS_VITRINA;
  const copy = COPY[modo];

  return (
    <section className="bg-crema py-12 px-6 text-center">
      <h2 className="font-display text-2xl text-carbon">{copy.titulo}</h2>

      <div className="mt-8 flex items-center -mx-6 md:mx-auto md:max-w-sm">
        {items.map(({ src, label }) => (
          <div key={label} className="relative flex-1 aspect-[100/81]" title={label}>
            <Image src={src} alt={label} fill className="object-cover" sizes="33vw" />
          </div>
        ))}
      </div>

      <p className="mt-8 max-w-md mx-auto text-sm text-carbon-suave leading-relaxed">
        {copy.cuerpo}
      </p>
    </section>
  );
}

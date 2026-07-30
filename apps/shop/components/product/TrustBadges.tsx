import Image from "next/image";
import { ENTREGA_BADGE } from "@diana-mile/shared/logistica/despacho";

/**
 * Sellos generados con Magnific (gpt-2), subidos a Shopify Files — icono +
 * texto ya vienen dibujados dentro de la imagen, no son datos de un
 * producto especifico asi que se referencian fijos aqui (no en un
 * metafield). Si se necesita regenerar alguno, ver la conversacion donde se
 * crearon para los prompts exactos.
 *
 * DOS JUEGOS, NO UNO
 * El texto va quemado dentro del PNG, asi que un sello no se puede
 * reetiquetar: se elige cual se muestra. En un producto de vitrina —los que
 * se coordinan con Diana y no se pagan al recibir— mostrar "Contraentrega"
 * y "Pago al recibir" promete algo que no existe, y encima en el bloque que
 * la pagina usa justamente para dar confianza. Ahi el mismo espacio tiene
 * que trabajar en la otra direccion: originalidad, compra segura y una
 * persona real al otro lado.
 */

export const BADGE = {
  contraentrega:
    "https://cdn.shopify.com/s/files/1/0696/3783/2747/files/F_Descargas_magnific_flat-trust-badge-for-a-pr_rlkBtcextc.png",
  pagoAlRecibir:
    "https://cdn.shopify.com/s/files/1/0696/3783/2747/files/F_Descargas_magnific_flat-trust-badge-for-a-pr_gJshCl2SXO.png",
  // El sello anterior tenia "ENVÍO 24-72H · Llega rápido a tu ciudad"
  // dibujado DENTRO del PNG, y era falso fuera de Medellin (ver
  // `shared/logistica/despacho`). Cambiar el `label` no bastaba: el texto
  // viaja en la imagen. Regenerado con el mismo estilo de la familia.
  envio:
    "https://cdn.shopify.com/s/files/1/0696/3783/2747/files/sello-envio-nacional.png?v=1785397237",
  compraSegura:
    "https://cdn.shopify.com/s/files/1/0696/3783/2747/files/F_Descargas_magnific_flat-trust-badge-for-a-pr_iANkfZX3uK.png",
  soporteWhatsapp:
    "https://cdn.shopify.com/s/files/1/0696/3783/2747/files/F_Descargas_magnific_flat-trust-badge-for-a-pr_swjmVSrl8e.png",
  original:
    "https://cdn.shopify.com/s/files/1/0696/3783/2747/files/F_Descargas_magnific_flat-trust-badge-for-a-pr_LUxt0K5swO.png",
} as const;

export type ModoCompra = "cod" | "vitrina";

/** Solo 3 aqui a proposito — los otros viven mas abajo en la pagina para no
 *  apilar dos filas de sellos en el mismo punto. */
const BADGES_COD = [
  { src: BADGE.contraentrega, label: "Contraentrega Colombia" },
  { src: BADGE.pagoAlRecibir, label: "Pago al recibir" },
  { src: BADGE.envio, label: ENTREGA_BADGE },
];

/**
 * Ni contraentrega ni "envio en 24-72h": en un producto de vitrina la
 * entrega se acuerda con Diana y prometer una ventana fija seria inventar.
 */
const BADGES_VITRINA = [
  { src: BADGE.original, label: "100% original" },
  { src: BADGE.compraSegura, label: "Compra segura" },
  { src: BADGE.soporteWhatsapp, label: "Soporte por WhatsApp" },
];

export function getTrustBadges(modo: ModoCompra = "cod") {
  return modo === "cod" ? BADGES_COD : BADGES_VITRINA;
}

/** Compatibilidad con lo que ya importaba la constante directamente. */
export const TRUST_BADGES = BADGES_COD;

export default function TrustBadges({ modo = "cod" }: { modo?: ModoCompra }) {
  return (
    <div className="flex items-center -mx-6 md:mx-0 md:max-w-sm">
      {getTrustBadges(modo).map(({ src, label }) => (
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

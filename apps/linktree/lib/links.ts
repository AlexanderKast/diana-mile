import type {
  LinktreeLink,
  LinktreeLinkSection,
} from "@diana-mile/shared/types";
import { enlaceWhatsApp } from "@diana-mile/shared/whatsapp/mensajes";

export type LinkSection = LinktreeLinkSection;
export type LinkItem = LinktreeLink;

// TODO: URL real
const AGENDA_ENTRENAMIENTO_URL = "https://cal.com/dianamile/valoracion";
// TODO: URL real
const AGENDA_COLAB_DIANA_URL = "https://cal.com/dianamile/colaboracion";
// TODO: URL real
const AGENDA_AGENCIA_URL = "https://cal.com/kreoon/marcas";
// TODO: URL real
const KREOON_SIGNUP_URL = "https://kreoon.com/creadores/registro";
// TODO: URL real
const TIKTOK_URL = "https://tiktok.com/@militolife";
// El numero sale del entorno, igual que en la tienda, para no tener el
// mismo dato escrito en dos sitios. Mientras no este configurado la
// tarjeta se apaga sola: estaba apuntando a "wa.me/57XXXXXXXXXX", que
// abre WhatsApp con un contacto inexistente.
const WHATSAPP_NUMERO = enlaceWhatsApp(
  process.env.NEXT_PUBLIC_WHATSAPP_NUMERO,
  { ruta: "/", origen: "linktree" },
);

export const links: LinkItem[] = [
  {
    id: "entrenamiento",
    label: "Entrena conmigo",
    subtitle:
      "Acompañamiento deportivo personalizado — cupos limitados. Agenda tu valoración",
    badge: "Programa 1:1",
    // "icon" no se usa para render (LinkCard resuelve el icono hero por id);
    // se deja "bag" solo para satisfacer el union del tipo compartido.
    icon: "bag",
    url: AGENDA_ENTRENAMIENTO_URL,
    variant: "primary",
    section: "hero",
    active: true,
  },
  {
    id: "milito-store",
    label: "Milito Life Store",
    subtitle: "Te cuidas porque lo mereces",
    url: "https://shop.militolife.com",
    icon: "bag",
    variant: "primary",
    section: "store",
    active: true,
  },
  {
    id: "colabora-diana",
    label: "¿Quieres colaborar conmigo?",
    subtitle: "Creo contenido UGC para tu marca — agenda una llamada",
    // "icon" no se usa para render (LinkCard resuelve el icono por id);
    // se deja "bag" solo para satisfacer el union del tipo compartido.
    icon: "bag",
    url: AGENDA_COLAB_DIANA_URL,
    variant: "secondary",
    section: "collab_diana",
    active: true,
  },
  {
    id: "marcas",
    label: "¿Eres una marca?",
    subtitle: "Contenido UGC con nuestro portafolio de creadores",
    icon: "bag",
    url: AGENDA_AGENCIA_URL,
    variant: "secondary",
    section: "agency",
    active: true,
  },
  {
    id: "creadores",
    label: "¿Eres creador(a) de contenido?",
    subtitle: "Únete a nuestro portafolio de creadores",
    icon: "bag",
    url: KREOON_SIGNUP_URL,
    variant: "secondary",
    section: "agency",
    active: true,
  },
  {
    id: "instagram",
    label: "Instagram",
    url: "https://instagram.com/militolife",
    icon: "instagram",
    variant: "secondary",
    section: "social",
    active: true,
  },
  {
    id: "tiktok",
    label: "TikTok",
    url: TIKTOK_URL,
    icon: "tiktok",
    variant: "secondary",
    section: "social",
    active: true,
  },
  {
    // WhatsApp siempre debe ir de ultimo dentro de "social".
    id: "whatsapp",
    label: "Escríbenos por WhatsApp",
    url: WHATSAPP_NUMERO ?? "#",
    icon: "whatsapp",
    variant: "secondary",
    section: "social",
    active: WHATSAPP_NUMERO !== null,
  },
];

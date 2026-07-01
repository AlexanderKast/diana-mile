import Image from "next/image";
import type { Metadata } from "next";
import { createPublicClient } from "@/lib/supabase";
import { LinkCard } from "@/components/linktree/LinkCard";
import type { LinktreeLink } from "@/types";

export const metadata: Metadata = {
  title: "Diana Mile — Link in bio",
  description:
    "Todos los enlaces de Diana Mile: tienda, WhatsApp, Instagram y TikTok en un solo lugar.",
};

const DEFAULTS = {
  titulo: "Diana Mile",
  subtitulo: "Bienestar · Anti-edad · Rituales de piel",
  links: [
    { label: "Tienda", url: "/productos", icon: "bag" },
    { label: "WhatsApp", url: "https://wa.me/57XXXXXXXXXX", icon: "whatsapp" },
    { label: "Instagram", url: "https://instagram.com/dianamile", icon: "instagram" },
    { label: "TikTok", url: "https://tiktok.com/@dianamile", icon: "tiktok" },
  ] as LinktreeLink[],
};

async function getLinktreeData(): Promise<{
  titulo: string;
  subtitulo: string;
  links: LinktreeLink[];
}> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("config")
      .select("clave, valor")
      .in("clave", ["linktree_links", "linktree_titulo", "linktree_subtitulo"]);

    if (error || !data || data.length === 0) {
      return DEFAULTS;
    }

    const map = new Map(data.map((row) => [row.clave, row.valor]));

    let links = DEFAULTS.links;
    const rawLinks = map.get("linktree_links");
    if (rawLinks) {
      try {
        const parsed = JSON.parse(rawLinks) as LinktreeLink[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          links = parsed;
        }
      } catch {
        links = DEFAULTS.links;
      }
    }

    return {
      titulo: map.get("linktree_titulo") || DEFAULTS.titulo,
      subtitulo: map.get("linktree_subtitulo") || DEFAULTS.subtitulo,
      links,
    };
  } catch {
    return DEFAULTS;
  }
}

export default async function LinkPage() {
  const { titulo, subtitulo, links } = await getLinktreeData();

  return (
    <div className="min-h-screen flex flex-col bg-blanco">
      <div className="w-full max-w-[480px] mx-auto flex flex-col flex-1 px-6 pt-14 pb-6">
        <div className="flex flex-col items-center animate-fade-in-up">
          <div className="w-[88px] h-[88px] rounded-full p-[1.5px] bg-gradient-to-br from-lila to-dorado">
            <div className="relative w-full h-full rounded-full overflow-hidden bg-crema">
              <Image
                src="/images/diana-profile.jpg"
                alt={titulo}
                fill
                sizes="88px"
                className="object-cover"
              />
            </div>
          </div>
          <h1 className="mt-4 font-display text-[28px] leading-tight text-carbon text-center">
            {titulo}
          </h1>
          <div className="linea-dorada-lila w-10 mt-3" />
          <p className="mt-3 font-sans text-[13px] text-ceniza text-center">
            {subtitulo}
          </p>
        </div>

        <div className="flex flex-col gap-3 mt-8">
          {links.map((link, index) => (
            <LinkCard key={`${link.label}-${index}`} link={link} index={index} />
          ))}
        </div>

        <footer className="mt-auto pt-8 pb-6 text-center text-[11px] text-ceniza">
          © Diana Mile
        </footer>
      </div>
    </div>
  );
}

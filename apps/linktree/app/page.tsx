import Image from "next/image";
import { createPublicClient } from "@diana-mile/shared/supabase/client";
import {
  links as DEFAULT_LINKS,
  type LinkItem,
  type LinkSection,
} from "@/lib/links";
import { LinkCard } from "@/components/linktree/LinkCard";
import { SocialCircleButton } from "@/components/linktree/SocialCircleButton";
import { CheckIcon } from "@/components/linktree/SocialIcons";

const NOMBRE = "Diana Mile";
const TAGLINE_DEFAULT = "Creadora UGC · Entrenadora deportiva · Empresaria";
const FOTO_DEFAULT = "/images/diana-profile.jpg";

// Sin esto la pagina se genera estatica en build time: los cambios hechos
// desde el admin (Supabase) nunca se verian sin un redeploy.
export const revalidate = 60;

// El hero no lleva encabezado propio: la card ya se distingue por su estilo y badge.
const SECTION_TITLES: Partial<Record<LinkSection, string>> = {
  store: "Tienda",
  collab_diana: "Colabora conmigo",
  agency: "Agencia Kreoon by UGC Colombia",
  social: "Redes",
};

async function getLinktreeData(): Promise<{
  titulo: string;
  tagline: string;
  foto: string;
  links: LinkItem[];
}> {
  const defaults = {
    titulo: NOMBRE,
    tagline: TAGLINE_DEFAULT,
    foto: FOTO_DEFAULT,
    links: DEFAULT_LINKS,
  };

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("config")
      .select("clave, valor")
      .in("clave", [
        "linktree_links",
        "linktree_titulo",
        "linktree_subtitulo",
        "linktree_foto_url",
      ]);

    if (error || !data) {
      return defaults;
    }

    const map = new Map(data.map((row) => [row.clave, row.valor]));

    let links = DEFAULT_LINKS;
    const rawLinks = map.get("linktree_links");
    if (rawLinks) {
      try {
        const parsed = JSON.parse(rawLinks) as LinkItem[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          links = parsed;
        }
      } catch {
        links = DEFAULT_LINKS;
      }
    }

    return {
      titulo: map.get("linktree_titulo") || NOMBRE,
      tagline: map.get("linktree_subtitulo") || TAGLINE_DEFAULT,
      foto: map.get("linktree_foto_url") || FOTO_DEFAULT,
      links,
    };
  } catch {
    return defaults;
  }
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mt-4 flex flex-col items-center gap-2 animate-fade-in-up">
      <span className="font-display text-base font-bold text-morado">
        {title}
      </span>
      <span className="linea-dorada w-8 opacity-70" />
    </div>
  );
}

export default async function LinkPage() {
  const { titulo, tagline, foto, links } = await getLinktreeData();
  const year = new Date().getFullYear();
  const activeLinks = links.filter((link) => link.active);
  const socialLinks = activeLinks.filter((link) => link.section === "social");
  const otherLinks = activeLinks.filter((link) => link.section !== "social");

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-blanco px-6 pb-safe pt-safe">
      <section className="flex flex-col items-center animate-fade-in-up">
        <div className="relative">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-morado to-dorado p-[2px]">
            <div className="relative h-full w-full overflow-hidden rounded-full bg-crema">
              <Image
                src={foto}
                alt={titulo}
                fill
                sizes="96px"
                className="object-cover"
                unoptimized={foto.startsWith("http")}
                priority
              />
            </div>
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-dorado text-blanco ring-2 ring-blanco">
            <CheckIcon />
          </span>
        </div>

        <h1 className="mt-4 text-center font-display text-[30px] leading-tight text-morado">
          {titulo}
        </h1>
        <div className="mt-3 h-px w-10 bg-gradient-to-r from-dorado to-morado" />
        <p className="mt-3 max-w-[280px] text-center text-[13px] text-ceniza">
          {tagline}
        </p>
      </section>

      <nav className="mt-8 flex flex-col gap-3">
        {otherLinks.map((link, index) => {
          const previousSection = otherLinks[index - 1]?.section;
          const sectionTitle =
            link.section && link.section !== previousSection
              ? SECTION_TITLES[link.section]
              : undefined;
          return (
            <div key={link.id} className="contents">
              {sectionTitle && <SectionHeader title={sectionTitle} />}
              <LinkCard link={link} index={index} />
            </div>
          );
        })}

        {socialLinks.length > 0 && SECTION_TITLES.social && (
          <div className="contents">
            <SectionHeader title={SECTION_TITLES.social} />
            <div className="mt-1 flex items-center justify-center gap-4">
              {socialLinks.map((link, index) => (
                <SocialCircleButton
                  key={link.id}
                  link={link}
                  index={otherLinks.length + index}
                />
              ))}
            </div>
          </div>
        )}
      </nav>

      <footer className="mt-auto pt-8 text-center text-[11px] text-ceniza">
        © {titulo} {year}
      </footer>
    </main>
  );
}

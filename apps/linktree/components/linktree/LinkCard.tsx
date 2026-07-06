import { cx } from "@diana-mile/shared/utils";
import type { LinkItem } from "@/lib/links";
import {
  BagIcon,
  WhatsAppIcon,
  InstagramIcon,
  TikTokIcon,
  TrainingIcon,
  CreatorIcon,
  BriefcaseIcon,
  ArrowRightIcon,
} from "@/components/linktree/SocialIcons";

type LinkCardProps = {
  link: LinkItem;
  index: number;
};

const ICON_MAP = {
  bag: BagIcon,
  whatsapp: WhatsAppIcon,
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
};

const CARD_STYLES = {
  hero: {
    card: "border border-dorado bg-gradient-to-br from-morado via-morado to-morado-oscuro text-blanco shadow-[0_10px_28px_rgba(107,78,140,0.35)]",
    icon: "text-dorado",
    subtitle: "text-blanco/75",
    chevron: "text-dorado",
    badge: "bg-dorado text-morado-oscuro",
  },
  store: {
    card: "border border-dorado bg-blanco text-morado",
    icon: "text-dorado-oscuro",
    subtitle: "text-ceniza",
    chevron: "text-dorado-oscuro",
    badge: "border-dorado/50 bg-dorado/10 text-dorado-oscuro",
  },
  collabDiana: {
    card: "border border-morado/20 bg-lila-suave text-morado-oscuro",
    icon: "text-morado",
    subtitle: "text-morado-oscuro/70",
    chevron: "text-morado",
    badge: "border-morado/40 bg-morado/10 text-morado",
  },
  marcas: {
    card: "border border-dorado bg-blanco text-morado-oscuro",
    icon: "text-dorado-oscuro",
    subtitle: "text-ceniza",
    chevron: "text-dorado-oscuro",
    badge: "border-dorado/50 bg-dorado/10 text-dorado-oscuro",
  },
  creadores: {
    card: "border border-morado/25 bg-lila-suave text-morado-oscuro",
    icon: "text-morado",
    subtitle: "text-morado-oscuro/70",
    chevron: "text-morado",
    badge: "border-morado/40 bg-morado/10 text-morado",
  },
  secondary: {
    card: "border border-arena bg-blanco text-morado-oscuro shadow-[0_1px_3px_rgba(107,78,140,0.06)]",
    icon: "text-morado-oscuro",
    subtitle: "text-ceniza",
    chevron: "text-ceniza",
    badge: "border-arena bg-crema text-morado-oscuro",
  },
} as const;

function resolveStyleKey(link: LinkItem): keyof typeof CARD_STYLES {
  if (link.id === "entrenamiento") return "hero";
  if (link.id === "milito-store") return "store";
  if (link.id === "colabora-diana") return "collabDiana";
  if (link.id === "marcas") return "marcas";
  if (link.id === "creadores") return "creadores";
  return link.variant === "primary" ? "store" : "secondary";
}

export function LinkCard({ link, index }: LinkCardProps) {
  const styleKey = resolveStyleKey(link);
  const styles = CARD_STYLES[styleKey];
  const Icon =
    styleKey === "hero"
      ? TrainingIcon
      : styleKey === "collabDiana" || styleKey === "creadores"
        ? CreatorIcon
        : styleKey === "marcas"
          ? BriefcaseIcon
          : ICON_MAP[link.icon];

  const minHeightClass =
    styleKey === "hero"
      ? "min-h-[76px]"
      : link.subtitle
        ? "min-h-[64px]"
        : "min-h-[52px]";

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ animationDelay: `${index * 80}ms` }}
      className={cx(
        "group flex flex-col justify-center gap-1.5 rounded-2xl px-5 py-4",
        minHeightClass,
        "transition-transform duration-150 active:scale-[0.98] animate-fade-in-up",
        styles.card,
      )}
    >
      {link.badge && (
        <span
          className={cx(
            "w-fit rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            styles.badge,
          )}
        >
          {link.badge}
        </span>
      )}
      <span className="flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-3">
          <Icon className={cx("shrink-0", styles.icon)} />
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-[15px] font-medium">
              {link.label}
            </span>
            {link.subtitle && (
              <span className={cx("truncate text-[13px]", styles.subtitle)}>
                {link.subtitle}
              </span>
            )}
          </span>
        </span>
        <ArrowRightIcon
          className={cx(
            "shrink-0 transition-transform duration-150 group-active:translate-x-0.5",
            styles.chevron,
          )}
        />
      </span>
    </a>
  );
}

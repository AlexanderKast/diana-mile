import { cx } from "@diana-mile/shared/utils";
import type { LinkItem } from "@/lib/links";
import {
  BagIcon,
  WhatsAppIcon,
  InstagramIcon,
  TikTokIcon,
} from "@/components/linktree/SocialIcons";

const ICON_MAP = {
  bag: BagIcon,
  whatsapp: WhatsAppIcon,
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
};

type SocialCircleButtonProps = {
  link: LinkItem;
  index: number;
};

export function SocialCircleButton({ link, index }: SocialCircleButtonProps) {
  const Icon = ICON_MAP[link.icon];

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={link.label}
      title={link.label}
      style={{ animationDelay: `${index * 80}ms` }}
      className={cx(
        "flex h-14 w-14 items-center justify-center rounded-full border border-morado/20 bg-lila-suave text-morado",
        "transition-transform duration-150 active:scale-[0.98] animate-fade-in-up",
      )}
    >
      <Icon />
    </a>
  );
}

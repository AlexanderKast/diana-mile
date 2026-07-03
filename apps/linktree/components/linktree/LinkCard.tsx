"use client";

import Link from "next/link";
import { cx } from "@diana-mile/shared/utils";
import type { LinktreeLink } from "@diana-mile/shared/types";
import {
  BagIcon,
  WhatsAppIcon,
  InstagramIcon,
  TikTokIcon,
  ArrowRightIcon,
} from "@/components/linktree/SocialIcons";

type LinkCardProps = {
  link: LinktreeLink;
  index: number;
};

const ICON_MAP = {
  bag: BagIcon,
  whatsapp: WhatsAppIcon,
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
};

export function LinkCard({ link, index }: LinkCardProps) {
  const Icon = ICON_MAP[link.icon] ?? BagIcon;
  const isInternal = link.url.startsWith("/");

  const cardClassName = cx(
    "group flex items-center justify-between gap-3 min-h-[44px] rounded-[4px] border border-arena bg-blanco px-5 py-4",
    "shadow-[0_1px_3px_rgba(26,23,20,0.08)] transition-colors duration-200",
    "hover:border-morado focus:border-morado focus:outline-none animate-fade-in-up"
  );

  const style = { animationDelay: `${index * 80}ms` };

  const content = (
    <>
      <span className="flex items-center gap-3 flex-1 min-w-0">
        <Icon className="shrink-0 text-carbon" />
        <span className="truncate text-sm font-medium text-carbon">
          {link.label}
        </span>
      </span>
      <ArrowRightIcon className="shrink-0 text-ceniza transition-transform duration-200 group-hover:translate-x-0.5" />
    </>
  );

  if (isInternal) {
    return (
      <Link href={link.url} className={cardClassName} style={style}>
        {content}
      </Link>
    );
  }

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cardClassName}
      style={style}
    >
      {content}
    </a>
  );
}

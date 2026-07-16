import { cx } from "@diana-mile/shared/utils";

function ImageIcon({
  className,
  width = 28,
  height = 28,
}: {
  className?: string;
  width?: number;
  height?: number;
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.75" />
      <path d="M21 16l-5.5-5.5L3 20" />
    </svg>
  );
}

/**
 * Espacio reservado para una foto real. Se usa mientras no hay assets
 * definitivos — reemplazar cada uso por <Image> cuando la foto este
 * lista (ver el prop `label` de cada instancia para saber que foto va ahi).
 */
export function ImagePlaceholder({
  label,
  aspect = "aspect-[4/5]",
  rounded = "rounded-2xl",
  showLabel = true,
  iconSize = 28,
  className,
}: {
  label: string;
  aspect?: string;
  rounded?: string;
  showLabel?: boolean;
  iconSize?: number;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "flex w-full flex-col items-center justify-center gap-2 border border-dashed border-arena bg-crema px-4 text-center",
        aspect,
        rounded,
        className,
      )}
      title={label}
    >
      <ImageIcon width={iconSize} height={iconSize} className="text-ceniza" />
      {showLabel && <p className="text-[11px] text-ceniza">{label}</p>}
    </div>
  );
}

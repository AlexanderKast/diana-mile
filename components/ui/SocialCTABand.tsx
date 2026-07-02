"use client";

import { useOrderSheet } from "@/components/product/OrderSheetContext";
import { cx } from "@/lib/utils";

type SocialCTABandProps = {
  title?: string;
  buttonLabel: string;
  tone: "outline-morado" | "lila-band" | "morado-band" | "gold-solid";
  variantId?: string;
};

export function SocialCTABand({ title, buttonLabel, tone, variantId }: SocialCTABandProps) {
  const { openOrderSheet } = useOrderSheet();

  if (tone === "outline-morado") {
    return (
      <div className="flex flex-col items-center gap-4 py-8 px-6 text-center">
        {title && <p className="font-display text-xl text-carbon max-w-sm">{title}</p>}
        <button
          type="button"
          onClick={() => openOrderSheet(variantId)}
          className="inline-flex items-center justify-center min-h-[44px] px-8 rounded-[2px] border-2 border-morado text-morado text-base font-semibold tracking-wide transition-all duration-200 hover:bg-lila-suave hover:scale-[1.03] active:scale-[0.97]"
        >
          {buttonLabel}
        </button>
      </div>
    );
  }

  if (tone === "gold-solid") {
    return (
      <button
        type="button"
        onClick={() => openOrderSheet(variantId)}
        className="btn-shine inline-flex items-center justify-center min-h-[44px] px-8 rounded-[2px] bg-dorado-oscuro text-blanco text-base font-semibold tracking-wide shadow-[0_4px_14px_rgba(168,136,94,0.35)] transition-all duration-200 hover:bg-dorado hover:scale-[1.03] hover:shadow-[0_8px_24px_rgba(168,136,94,0.5)] active:scale-[0.97]"
      >
        {buttonLabel}
      </button>
    );
  }

  const isMorado = tone === "morado-band";

  return (
    <div
      className={cx(
        "flex flex-col items-center gap-4 py-6 px-6 text-center",
        isMorado ? "bg-morado" : "bg-lila-suave"
      )}
    >
      {title && (
        <p className={cx("font-display text-xl max-w-sm", isMorado ? "text-blanco" : "text-carbon")}>
          {title}
        </p>
      )}
      <button
        type="button"
        onClick={() => openOrderSheet(variantId)}
        className={cx(
          "btn-shine inline-flex items-center justify-center min-h-[44px] w-full max-w-sm px-6 rounded-[2px] text-base font-semibold tracking-wide transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]",
          isMorado
            ? "bg-blanco text-morado shadow-[0_4px_14px_rgba(0,0,0,0.12)] hover:bg-lila-suave"
            : "bg-dorado-oscuro text-blanco shadow-[0_4px_14px_rgba(168,136,94,0.35)] hover:bg-dorado hover:shadow-[0_8px_24px_rgba(168,136,94,0.5)]"
        )}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

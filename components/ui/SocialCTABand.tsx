"use client";

import { useOrderSheet } from "@/components/product/OrderSheetContext";
import { cx } from "@/lib/utils";

type SocialCTABandProps = {
  title?: string;
  buttonLabel: string;
  tone: "outline-morado" | "lila-band" | "morado-band" | "white-button";
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
          className="inline-flex items-center justify-center min-h-[44px] px-8 rounded-[2px] border-[1.5px] border-morado text-morado text-sm font-medium tracking-wide hover:bg-lila-suave transition-colors"
        >
          {buttonLabel}
        </button>
      </div>
    );
  }

  if (tone === "white-button") {
    return (
      <button
        type="button"
        onClick={() => openOrderSheet(variantId)}
        className="inline-flex items-center justify-center min-h-[44px] px-8 rounded-[2px] bg-blanco text-carbon text-sm font-medium tracking-wide hover:bg-crema transition-colors"
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
          "inline-flex items-center justify-center min-h-[44px] w-full max-w-sm px-6 rounded-[2px] text-sm font-medium tracking-wide transition-colors",
          isMorado ? "bg-blanco text-morado hover:bg-lila-suave" : "bg-carbon text-blanco hover:bg-carbon-suave"
        )}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

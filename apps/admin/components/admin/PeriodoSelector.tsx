"use client";

import { useRouter, usePathname } from "next/navigation";

type PeriodoSelectorProps = {
  periodo: string;
};

export default function PeriodoSelector({ periodo }: PeriodoSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="periodo" className="text-xs text-ceniza font-medium uppercase">
        Mes
      </label>
      <input
        id="periodo"
        type="month"
        value={periodo}
        onChange={(e) => {
          if (e.target.value) {
            router.push(`${pathname}?periodo=${e.target.value}`);
          }
        }}
        className="min-h-[44px] rounded-[2px] border border-arena bg-blanco px-3 py-2 text-sm text-carbon focus:outline-none focus:border-dorado"
      />
    </div>
  );
}

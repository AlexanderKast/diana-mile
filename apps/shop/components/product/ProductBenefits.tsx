import { ReactElement } from "react";

type BenefitIcon = "gota" | "mineral" | "hoja" | "sol" | "escudo" | "planeta";

export type Benefit = {
  icon: BenefitIcon;
  title: string;
  description: string;
};

function IconGota() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path
        d="M10 2.5c2.8 3.6 5 6.7 5 9.4a5 5 0 11-10 0c0-2.7 2.2-5.8 5-9.4z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMineral() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10 2l5 4-1.6 9.5H6.6L5 6l5-4z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 2v14.5M5 6h10M6.6 15.5L10 9l3.4 6.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconHoja() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path
        d="M17 3C9 3 3 9 3 17c8 0 14-6 14-14z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M17 3C11 5 6 10 4 16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconSol() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="10" cy="10" r="3.5" />
      <path
        d="M10 1.5v2M10 16.5v2M18.5 10h-2M3.5 10h-2M15.9 4.1l-1.4 1.4M5.5 14.5l-1.4 1.4M15.9 15.9l-1.4-1.4M5.5 5.5L4.1 4.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconEscudo() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path
        d="M10 2l6.5 2.5v5c0 4.5-2.9 7.4-6.5 8.5-3.6-1.1-6.5-4-6.5-8.5v-5L10 2z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M7 10l2 2 4-4.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPlaneta() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="10" cy="10" r="6" />
      <ellipse cx="10" cy="10" rx="9" ry="2.8" />
    </svg>
  );
}

const ICONS: Record<BenefitIcon, () => ReactElement> = {
  gota: IconGota,
  mineral: IconMineral,
  hoja: IconHoja,
  sol: IconSol,
  escudo: IconEscudo,
  planeta: IconPlaneta,
};

export function ProductBenefits({ benefits }: { benefits: Benefit[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
      {benefits.map((benefit, index) => {
        const Icon = ICONS[benefit.icon];
        return (
          <div key={index} className="flex flex-col gap-2">
            <span className="text-dorado">
              <Icon />
            </span>
            <p className="text-sm font-semibold text-carbon">{benefit.title}</p>
            <p className="text-sm text-carbon-suave">{benefit.description}</p>
          </div>
        );
      })}
    </div>
  );
}

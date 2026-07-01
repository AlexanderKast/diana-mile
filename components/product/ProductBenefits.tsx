export function ProductBenefits({ benefits }: { benefits: string[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {benefits.map((benefit, index) => (
        <li key={index} className="flex items-start gap-2.5 text-sm text-carbon">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            className="shrink-0 text-dorado"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="10" cy="10" r="8.5" />
            <path d="M6.5 10.2l2.4 2.4 4.6-5.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>{benefit}</span>
        </li>
      ))}
    </ul>
  );
}

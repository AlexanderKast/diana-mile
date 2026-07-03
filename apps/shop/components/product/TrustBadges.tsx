function IconEntrega() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path
        d="M2 5.5h9v8.5H2v-8.5zM11 8.5h4l3 3v2.5h-7v-5.5z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="6" cy="15.5" r="1.7" />
      <circle cx="14.5" cy="15.5" r="1.7" />
    </svg>
  );
}

function IconPago() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="5" width="16" height="10.5" rx="1.5" strokeLinejoin="round" />
      <circle cx="10" cy="10.25" r="2.5" />
      <path d="M9 10.25l0.7 0.7 1.3-1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCaja() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path
        d="M10 2.5l7.5 3.75V13.75L10 17.5l-7.5-3.75V6.25L10 2.5z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M2.5 6.25L10 10l7.5-3.75M10 10v7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCandado() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="9" width="12" height="8.5" rx="1.5" strokeLinejoin="round" />
      <path d="M6.5 9V6a3.5 3.5 0 017 0v3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="13" r="1.2" />
    </svg>
  );
}

function IconSello() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="10" cy="8.5" r="5.5" strokeLinejoin="round" />
      <path d="M7 13.5 6 17.5l4-2 4 2-1-4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 8.5 9 10l3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type TrustBadge = {
  icon: () => React.JSX.Element;
  label: string;
};

const badges: TrustBadge[] = [
  { icon: IconEntrega, label: "Contraentrega Colombia" },
  { icon: IconPago, label: "Pago al recibir" },
  { icon: IconCaja, label: "Envío en 24-72h" },
  { icon: IconCandado, label: "Compra segura" },
];

export default function TrustBadges({ showAuthenticity = false }: { showAuthenticity?: boolean }) {
  const items = showAuthenticity
    ? [...badges, { icon: IconSello, label: "100% original Nu Skin" }]
    : badges;

  return (
    <div className="grid grid-cols-2 gap-1.5 md:flex md:flex-wrap md:gap-2">
      {items.map(({ icon: Icon, label }) => (
        <div
          key={label}
          className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-arena px-2.5 py-1.5 text-[10px] font-sans text-carbon-suave md:px-3 md:text-[11px]"
        >
          <span className="shrink-0 text-ceniza">
            <Icon />
          </span>
          <span className="truncate">{label}</span>
        </div>
      ))}
    </div>
  );
}
